package com.archyoko.gymcoach;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Calendar;
import java.util.UUID;

/**
 * تجربة الربط المباشر بساعة Amazfit Pop 3R (بروتوكول Fission/LinWear).
 * الخدمة c2e6ffb0: ffb1 كتابة رأس "البيانات الكبيرة"، ffb2 إشعار البيانات الكبيرة،
 * ffb3 كتابة أوامر AT، ffb4 إشعار ردود AT. مفيش تشفير على البيانات.
 * التجربة دي بتقرا بس (بطارية، إصدار، تقرير اليوم) ومبتغيّرش أي إعداد في الساعة.
 */
@CapacitorPlugin(name = "WatchDirect", permissions = {
        @Permission(alias = "bt", strings = {Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN})
})
public class WatchDirect extends Plugin {
    static final UUID SVC = UUID.fromString("c2e6ffb0-e966-1000-8000-bef9c223df6a");
    static final UUID BIG_W = UUID.fromString("c2e6ffb1-e966-1000-8000-bef9c223df6a");
    static final UUID BIG_N = UUID.fromString("c2e6ffb2-e966-1000-8000-bef9c223df6a");
    static final UUID AT_W = UUID.fromString("c2e6ffb3-e966-1000-8000-bef9c223df6a");
    static final UUID AT_N = UUID.fromString("c2e6ffb4-e966-1000-8000-bef9c223df6a");
    static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    private final Handler h = new Handler(Looper.getMainLooper());
    private BluetoothGatt gatt;
    private PluginCall pending;
    private final ArrayDeque<Runnable> ops = new ArrayDeque<>();
    private final StringBuilder log = new StringBuilder();
    private final JSObject result = new JSObject();
    private final JSArray days = new JSArray();
    private long t0;
    // تجميع البيانات الكبيرة
    private String bigCmd = null;
    private int bigLen = 0;
    private final ByteArrayOutputStream bigBuf = new ByteArrayOutputStream();

    private void L(String s) {
        long dt = System.currentTimeMillis() - t0;
        log.append(String.format("%5.1f ", dt / 1000.0)).append(s).append('\n');
    }

    static String hex(byte[] b) {
        if (b == null) return "null";
        StringBuilder sb = new StringBuilder();
        for (byte x : b) sb.append(String.format("%02X", x));
        return sb.toString();
    }

    static byte[] at(String s) { return ("AT+" + s + "\u0000").getBytes(StandardCharsets.US_ASCII); }

    static byte[] bigHead(int a, int b, byte[] payload) {
        byte[] r = new byte[20];
        r[0] = (byte) 0xFF; r[1] = (byte) 0xFF; r[2] = 'B'; r[3] = 'G'; r[4] = 1; r[5] = 0;
        r[6] = (byte) a; r[7] = (byte) b; r[8] = 0; r[9] = 0;
        if (payload != null) System.arraycopy(payload, 0, r, 10, Math.min(8, payload.length));
        int sum = 0;
        for (byte x : r) sum += x & 0xFF;
        r[18] = (byte) ~((sum >> 8) & 0xFF);
        r[19] = (byte) ~(sum & 0xFF);
        return r;
    }

    static byte[] be4(long v) { return new byte[]{(byte) (v >> 24), (byte) (v >> 16), (byte) (v >> 8), (byte) v}; }

    static int le(byte[] b, int from, int to) {
        int v = 0, k = 0;
        for (int i = from; i < to; i++, k++) v |= (b[i] & 0xFF) << (8 * k);
        return v;
    }

    @PluginMethod
    public void test(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 31 && getPermissionState("bt") != PermissionState.GRANTED) {
            requestPermissionForAlias("bt", call, "btPerm");
            return;
        }
        run(call);
    }

    @PermissionCallback
    private void btPerm(PluginCall call) {
        if (getPermissionState("bt") != PermissionState.GRANTED) { call.reject("محتاج إذن الأجهزة القريبة (Bluetooth)"); return; }
        run(call);
    }

    @SuppressLint("MissingPermission")
    private void run(PluginCall call) {
        if (pending != null) { call.reject("فيه تجربة شغالة"); return; }
        log.setLength(0);
        t0 = System.currentTimeMillis();
        BluetoothManager bm = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter ad = bm == null ? null : bm.getAdapter();
        if (ad == null || !ad.isEnabled()) { call.reject("البلوتوث مقفول"); return; }
        BluetoothDevice dev = null;
        String mac = call.getString("mac");
        if (mac != null && !mac.isEmpty()) dev = ad.getRemoteDevice(mac);
        StringBuilder seen = new StringBuilder();
        // ١) الساعة متوصلة دلوقتي بـ Zepp Active (BLE)
        if (dev == null) {
            try {
                for (BluetoothDevice d : bm.getConnectedDevices(BluetoothProfile.GATT)) {
                    String n = d.getName();
                    seen.append("gatt:").append(n).append('/').append(d.getAddress()).append(' ');
                    if (n == null || n.toLowerCase().contains("pop") || n.toLowerCase().contains("amazfit") || d.getAddress().toUpperCase().startsWith("23:08:17")) { dev = d; break; }
                }
            } catch (Exception e) { seen.append("gattErr:").append(e.getMessage()).append(' '); }
        }
        // ٢) الأجهزة المقترنة
        if (dev == null) {
            try {
                for (BluetoothDevice d : ad.getBondedDevices()) {
                    String n = d.getName();
                    seen.append("bond:").append(n).append('/').append(d.getAddress()).append(' ');
                    if ((n != null && (n.toLowerCase().contains("pop") || n.toLowerCase().contains("amazfit"))) || d.getAddress().toUpperCase().startsWith("23:08:17")) { dev = d; break; }
                }
            } catch (Exception e) { seen.append("bondErr:").append(e.getMessage()).append(' '); }
        }
        // ٣) العنوان المعروف من سجل Zepp Active
        if (dev == null) { dev = ad.getRemoteDevice("23:08:17:10:21:D2"); seen.append("fallback-mac"); }
        L("found: " + seen);
        pending = call;
        result.put("name", dev.getName());
        result.put("mac", dev.getAddress());
        L("connect " + dev.getName() + " " + dev.getAddress());
        gatt = dev.connectGatt(getContext(), false, cb, BluetoothDevice.TRANSPORT_LE);
        h.postDelayed(() -> finish("timeout"), 40000);
    }

    @SuppressLint("MissingPermission")
    private void finish(String why) {
        if (pending == null) return;
        L("finish: " + why);
        h.removeCallbacksAndMessages(null);
        try { if (gatt != null) { gatt.disconnect(); gatt.close(); } } catch (Exception ignored) { }
        gatt = null;
        ops.clear();
        result.put("why", why);
        result.put("days", days);
        result.put("log", log.toString());
        PluginCall c = pending;
        pending = null;
        c.resolve(result);
    }

    private void next() { h.postDelayed(() -> { Runnable r = ops.poll(); if (r != null) r.run(); }, 150); }

    @SuppressLint("MissingPermission")
    private void write(UUID ch, byte[] data) {
        BluetoothGattService s = gatt.getService(SVC);
        BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(ch);
        if (c == null) { L("no char " + ch); next(); return; }
        L("-> " + ch.toString().substring(4, 8) + " " + hex(data) + (ch.equals(AT_W) ? "  '" + new String(data, StandardCharsets.US_ASCII).replace("\u0000", "") + "'" : ""));
        c.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
        c.setValue(data);
        if (!gatt.writeCharacteristic(c)) { L("write failed"); next(); }
    }

    @SuppressLint("MissingPermission")
    private void notifyOn(UUID ch) {
        BluetoothGattService s = gatt.getService(SVC);
        BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(ch);
        if (c == null) { L("no char " + ch); next(); return; }
        gatt.setCharacteristicNotification(c, true);
        BluetoothGattDescriptor d = c.getDescriptor(CCCD);
        if (d == null) { next(); return; }
        d.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        if (!gatt.writeDescriptor(d)) { L("cccd failed " + ch); next(); }
    }

    private void plan() {
        Calendar c = Calendar.getInstance();
        long now = c.getTimeInMillis() / 1000;
        c.add(Calendar.DAY_OF_MONTH, -6);
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0);
        long from = c.getTimeInMillis() / 1000;
        byte[] range = new byte[8];
        System.arraycopy(be4(from), 0, range, 0, 4);
        System.arraycopy(be4(now), 0, range, 4, 4);
        ops.add(() -> notifyOn(AT_N));
        ops.add(() -> notifyOn(BIG_N));
        ops.add(() -> write(AT_W, at("GBS?")));
        ops.add(() -> h.postDelayed(this::next, 1200));
        ops.add(() -> write(AT_W, at("GSV?")));
        ops.add(() -> h.postDelayed(this::next, 1200));
        ops.add(() -> write(AT_W, at("GPV?")));
        ops.add(() -> h.postDelayed(this::next, 1200));
        ops.add(() -> write(BIG_W, bigHead(0x01, 0x10, range)));
        ops.add(() -> h.postDelayed(() -> finish("done"), 9000));
        next();
    }

    private void onNotify(UUID ch, byte[] v) {
        String tag = ch.equals(AT_N) ? "AT" : ch.equals(BIG_N) ? "BIG" : ch.toString().substring(4, 8);
        String txt = "";
        if (ch.equals(AT_N)) txt = "  '" + new String(v, StandardCharsets.US_ASCII).replaceAll("[^\\x20-\\x7e]", ".") + "'";
        L("<- " + tag + " " + hex(v) + txt);
        if (ch.equals(AT_N)) {
            String s = new String(v, StandardCharsets.US_ASCII).replace("\u0000", "").trim();
            int i = s.indexOf("GBS");
            if (i >= 0) result.put("battery", s.substring(i));
            i = s.indexOf("GSV");
            if (i >= 0) result.put("version", s.substring(i));
            i = s.indexOf("GPV");
            if (i >= 0) result.put("protocol", s.substring(i));
        }
        if (ch.equals(BIG_N) && v.length >= 2) {
            if ((v[0] & 0xFF) == 0xFF && (v[1] & 0xFF) == 0xFF && v.length >= 10) {
                bigCmd = String.format("%02X%02X", v[6], v[7]);
                bigLen = ((v[8] & 0xFF) << 8) | (v[9] & 0xFF);
                bigBuf.reset();
                L("   header cmd=" + bigCmd + " len=" + bigLen);
                result.put("bigHeader", bigCmd + "/" + bigLen);
            } else if (bigCmd != null) {
                bigBuf.write(v, 2, v.length - 2);
                if (bigBuf.size() >= bigLen) parseBig();
            }
        }
    }

    private void parseBig() {
        byte[] b = bigBuf.toByteArray();
        L("   complete " + bigCmd + " " + b.length + " bytes");
        if ("8110".equals(bigCmd)) {
            for (int o = 0; o + 38 <= b.length; o += 60) {
                JSObject d = new JSObject();
                d.put("time", le(b, o, o + 4));
                d.put("steps", le(b, o + 8, o + 12));
                d.put("kcal", le(b, o + 12, o + 16));
                d.put("distance", le(b, o + 16, o + 20));
                d.put("avgHR", b[o + 20] & 0xFF);
                d.put("maxHR", b[o + 21] & 0xFF);
                d.put("minHR", b[o + 22] & 0xFF);
                d.put("spo2", b[o + 23] & 0xFF);
                d.put("sportMin", le(b, o + 24, o + 26));
                d.put("deepMin", le(b, o + 28, o + 30));
                d.put("lightMin", le(b, o + 30, o + 32));
                days.put(d);
            }
        }
        bigCmd = null;
    }

    private final BluetoothGattCallback cb = new BluetoothGattCallback() {
        @SuppressLint("MissingPermission")
        @Override
        public void onConnectionStateChange(BluetoothGatt g, int status, int state) {
            h.post(() -> {
                L("state " + state + " status " + status);
                if (state == BluetoothProfile.STATE_CONNECTED) {
                    g.requestMtu(247);
                } else if (state == BluetoothProfile.STATE_DISCONNECTED) {
                    finish("disconnected " + status);
                }
            });
        }

        @SuppressLint("MissingPermission")
        @Override
        public void onMtuChanged(BluetoothGatt g, int mtu, int status) {
            h.post(() -> { L("mtu " + mtu); g.discoverServices(); });
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt g, int status) {
            h.post(() -> {
                BluetoothGattService s = g.getService(SVC);
                L("services " + status + " fission=" + (s != null));
                if (s == null) {
                    StringBuilder sb = new StringBuilder();
                    for (BluetoothGattService x : g.getServices()) sb.append(x.getUuid()).append(' ');
                    L("all: " + sb);
                    finish("no fission service");
                    return;
                }
                plan();
            });
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic c, int status) {
            h.post(() -> { L("   write ok " + status); next(); });
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor d, int status) {
            h.post(() -> { L("   notify on " + d.getCharacteristic().getUuid().toString().substring(4, 8) + " " + status); next(); });
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            final byte[] v = c.getValue() == null ? new byte[0] : c.getValue().clone();
            final UUID u = c.getUuid();
            h.post(() -> onNotify(u, v));
        }
    };
}
