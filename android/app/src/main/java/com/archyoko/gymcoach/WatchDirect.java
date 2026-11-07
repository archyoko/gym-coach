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
import android.content.SharedPreferences;
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

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.Calendar;
import java.util.UUID;

/**
 * الربط المباشر بساعة Amazfit Pop 3R (بروتوكول Fission اللي جوّا Zepp Active / LinWear).
 * c2e6ffb0: ffb1 كتابة رأس البيانات الكبيرة، ffb2 إشعار البيانات الكبيرة، ffb3 كتابة AT، ffb4 إشعار AT.
 * البيانات مش متشفرة. كل الأوامر هنا قراءة بس، ما عدا "دوّر على الساعة".
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
    static final String KNOWN_MAC = "23:08:17:10:21:D2";

    /** أمر واحد: AT (نص) أو بيانات كبيرة (رأس 20 بايت) */
    static class Job {
        String key; boolean at; byte[] data; String atReply; String bigReply;
        Job(String key, boolean at, byte[] data, String atReply, String bigReply) {
            this.key = key; this.at = at; this.data = data; this.atReply = atReply; this.bigReply = bigReply;
        }
    }

    private final Handler h = new Handler(Looper.getMainLooper());
    private BluetoothGatt gatt;
    private PluginCall pending;
    private String mode = "";
    private final ArrayDeque<Job> jobs = new ArrayDeque<>();
    private Job cur;
    private final StringBuilder log = new StringBuilder();
    private JSObject result = new JSObject();
    private long t0;
    private int setupStep = 0;
    private String bigCmd = null;
    private int bigLen = 0;
    private final ByteArrayOutputStream bigBuf = new ByteArrayOutputStream();
    private final Runnable jobTimeout = () -> { L("timeout " + (cur == null ? "" : cur.key)); nextJob(); };
    private final Runnable overall = () -> finish("timeout");

    // ---------------- أدوات ----------------
    private void L(String s) {
        if (log.length() > 60000) return;
        log.append(String.format(java.util.Locale.US, "%5.1f ", (System.currentTimeMillis() - t0) / 1000.0)).append(s).append('\n');
    }

    static String hex(byte[] b) {
        StringBuilder sb = new StringBuilder();
        if (b != null) for (byte x : b) sb.append(String.format("%02X", x));
        return sb.toString();
    }

    static byte[] at(String s) { return ("AT+" + s + "\u0000").getBytes(StandardCharsets.US_ASCII); }

    static byte[] bigHead(int a, int b, long from, long to) {
        byte[] r = new byte[20];
        r[0] = (byte) 0xFF; r[1] = (byte) 0xFF; r[2] = 'B'; r[3] = 'G'; r[4] = 1; r[5] = 0;
        r[6] = (byte) a; r[7] = (byte) b;
        if (from > 0) {
            r[10] = (byte) (from >> 24); r[11] = (byte) (from >> 16); r[12] = (byte) (from >> 8); r[13] = (byte) from;
            r[14] = (byte) (to >> 24); r[15] = (byte) (to >> 16); r[16] = (byte) (to >> 8); r[17] = (byte) to;
        }
        int sum = 0;
        for (byte x : r) sum += x & 0xFF;
        r[18] = (byte) ~((sum >> 8) & 0xFF);
        r[19] = (byte) ~(sum & 0xFF);
        return r;
    }

    static int le(byte[] b, int from, int to) {
        if (to > b.length) return 0;
        long v = 0;
        for (int i = from, k = 0; i < to; i++, k++) v |= (long) (b[i] & 0xFF) << (8 * k);
        return (int) v;
    }

    static int u8(byte[] b, int i) { return i < b.length ? b[i] & 0xFF : 0; }

    private SharedPreferences prefs() { return getContext().getSharedPreferences("watchdirect", Context.MODE_PRIVATE); }

    // ---------------- أوامر JS ----------------
    @PluginMethod public void test(PluginCall call) { start(call, "test"); }
    @PluginMethod public void sync(PluginCall call) { start(call, "sync"); }
    @PluginMethod public void find(PluginCall call) { start(call, "find"); }
    @PluginMethod public void info(PluginCall call) { start(call, "info"); }

    private void start(PluginCall call, String m) {
        call.getData().put("_mode", m);
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
        if (pending != null) { call.reject("الساعة مشغولة بطلب تاني – جرّب بعد شوية"); return; }
        mode = call.getString("_mode", "test");
        log.setLength(0);
        result = new JSObject();
        jobs.clear();
        cur = null; bigCmd = null; setupStep = 0;
        t0 = System.currentTimeMillis();
        BluetoothManager bm = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter ad = bm == null ? null : bm.getAdapter();
        if (ad == null || !ad.isEnabled()) { call.reject("البلوتوث مقفول"); return; }
        BluetoothDevice dev = null;
        String mac = call.getString("mac", prefs().getString("mac", ""));
        try {
            for (BluetoothDevice d : bm.getConnectedDevices(BluetoothProfile.GATT)) {
                String n = d.getName();
                if ((mac != null && mac.equalsIgnoreCase(d.getAddress())) || (n != null && (n.toLowerCase().contains("pop") || n.toLowerCase().contains("amazfit")))) { dev = d; break; }
            }
        } catch (Exception ignored) { }
        if (dev == null && mac != null && !mac.isEmpty()) dev = ad.getRemoteDevice(mac);
        if (dev == null) dev = ad.getRemoteDevice(KNOWN_MAC);
        prefs().edit().putString("mac", dev.getAddress()).apply();
        pending = call;
        result.put("name", dev.getName());
        result.put("mac", dev.getAddress());
        L(mode + " → " + dev.getName() + " " + dev.getAddress());
        h.postDelayed(overall, "sync".equals(mode) ? 90000 : 40000);
        gatt = dev.connectGatt(getContext(), false, cb, BluetoothDevice.TRANSPORT_LE);
    }

    private void plan() {
        long now = System.currentTimeMillis() / 1000;
        jobs.add(new Job("GBS", true, at("GBS?"), "GBS", null));
        if ("find".equals(mode)) {
            jobs.add(new Job("TFD", true, at("TFD"), "TFD", null));
        } else if ("info".equals(mode) || "test".equals(mode)) {
            jobs.add(new Job("GSV", true, at("GSV?"), "GSV", null));
            jobs.add(new Job("GPV", true, at("GPV?"), "GPV", null));
            jobs.add(new Job("0102", false, bigHead(0x01, 0x02, 0, 0), null, "8102"));
            if ("test".equals(mode)) jobs.add(new Job("0110", false, bigHead(0x01, 0x10, dayStart(-6), now), null, "8110"));
        } else {
            int days = pending.getInt("days", 7);
            int hrDays = pending.getInt("hrDays", 2);
            jobs.add(new Job("0102", false, bigHead(0x01, 0x02, 0, 0), null, "8102"));
            jobs.add(new Job("0110", false, bigHead(0x01, 0x10, dayStart(-days), now), null, "8110"));
            jobs.add(new Job("0113", false, bigHead(0x01, 0x13, dayStart(-days), now + 1), null, "8113"));
            jobs.add(new Job("0180", false, bigHead(0x01, 0x80, dayStart(-hrDays + 1), now), null, "8180"));
            jobs.add(new Job("0115", false, bigHead(0x01, 0x15, dayStart(-days), now), null, "8115"));
        }
        nextJob();
    }

    static long dayStart(int add) {
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_MONTH, add);
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis() / 1000;
    }

    @SuppressLint("MissingPermission")
    private void nextJob() {
        h.removeCallbacks(jobTimeout);
        cur = jobs.poll();
        bigCmd = null;
        if (cur == null) { h.postDelayed(() -> finish("done"), 300); return; }
        h.postDelayed(() -> {
            if (cur == null || gatt == null) return;
            write(cur.at ? AT_W : BIG_W, cur.data);
            h.postDelayed(jobTimeout, cur.at ? 3000 : 8000);
        }, 250);
    }

    @SuppressLint("MissingPermission")
    private void write(UUID ch, byte[] data) {
        BluetoothGattService s = gatt.getService(SVC);
        BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(ch);
        if (c == null) { L("no char " + ch); return; }
        L("-> " + hex(data));
        c.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
        c.setValue(data);
        if (!gatt.writeCharacteristic(c)) L("write failed");
    }

    @SuppressLint("MissingPermission")
    private boolean notifyOn(UUID ch) {
        BluetoothGattService s = gatt.getService(SVC);
        BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(ch);
        if (c == null) return false;
        gatt.setCharacteristicNotification(c, true);
        BluetoothGattDescriptor d = c.getDescriptor(CCCD);
        if (d == null) return false;
        d.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        return gatt.writeDescriptor(d);
    }

    private void setup() {
        if (setupStep == 0) { setupStep = 1; if (!notifyOn(AT_N)) setup(); return; }
        if (setupStep == 1) { setupStep = 2; if (!notifyOn(BIG_N)) setup(); return; }
        if (setupStep == 2) { setupStep = 3; plan(); }
    }

    @SuppressLint("MissingPermission")
    private void finish(String why) {
        if (pending == null) return;
        L("finish: " + why);
        h.removeCallbacksAndMessages(null);
        try { if (gatt != null) { gatt.disconnect(); gatt.close(); } } catch (Exception ignored) { }
        gatt = null;
        jobs.clear();
        result.put("why", why);
        result.put("at", System.currentTimeMillis());
        if (pending.getBoolean("log", true)) result.put("log", log.toString());
        PluginCall c = pending;
        pending = null;
        boolean got = result.has("battery") || result.has("today") || result.has("days");
        if (got) c.resolve(result); else c.reject("الساعة مردّتش (" + why + ")", "NO_REPLY", null, result);
    }

    // ---------------- الردود ----------------
    private void onNotify(UUID ch, byte[] v) {
        if (ch.equals(AT_N)) {
            String s = new String(v, StandardCharsets.US_ASCII).replace("\u0000", "").trim();
            L("<- AT '" + s + "'");
            if (s.startsWith("AT+")) s = s.substring(3);
            try {
                if (s.startsWith("GBS:")) {
                    String[] p = s.substring(4).split(",");
                    result.put("battery", Integer.parseInt(p[0].trim()));
                    result.put("charging", p.length > 1 && "1".equals(p[1].trim()));
                } else if (s.startsWith("GSV:")) result.put("version", s.substring(4));
                else if (s.startsWith("GPV:")) result.put("protocol", s.substring(4));
                else if (s.startsWith("TFD")) result.put("found", true);
            } catch (Exception e) { L("at parse " + e); }
            if (cur != null && cur.at && cur.atReply != null && s.startsWith(cur.atReply)) nextJob();
            return;
        }
        if (!ch.equals(BIG_N) || v.length < 2) return;
        if ((v[0] & 0xFF) == 0xFF && (v[1] & 0xFF) == 0xFF && v.length >= 10 && v[2] == 'B' && v[3] == 'G') {
            bigCmd = String.format("%02X%02X", v[6], v[7]);
            bigLen = ((v[8] & 0xFF) << 8) | (v[9] & 0xFF);
            bigBuf.reset();
            L("<- BIG header " + bigCmd + " len " + bigLen);
            if (bigLen == 0) { bigCmd = null; if (cur != null && !cur.at) nextJob(); }
            return;
        }
        if (bigCmd == null) return;
        bigBuf.write(v, 2, v.length - 2);
        if (bigBuf.size() >= bigLen) {
            byte[] b = bigBuf.toByteArray();
            String cmd = bigCmd;
            bigCmd = null;
            L("   complete " + cmd + " " + b.length + "b");
            try { parseBig(cmd, b); } catch (Exception e) { L("parse " + cmd + " " + e); }
            if (cur != null && !cur.at && cmd.equalsIgnoreCase(cur.bigReply)) nextJob();
        }
    }

    private void parseBig(String cmd, byte[] b) throws Exception {
        switch (cmd) {
            case "8102": { // قياس النهارده لحظياً
                JSObject t = new JSObject();
                t.put("steps", le(b, 4, 8));
                t.put("kcal", le(b, 8, 12));
                t.put("distance", le(b, 12, 16));
                t.put("hr", u8(b, 26));
                t.put("maxHR", u8(b, 28));
                t.put("minHR", u8(b, 29));
                t.put("spo2", u8(b, 62));
                t.put("battery", u8(b, 92));
                t.put("sportMin", le(b, 128, 130));
                t.put("intenseMin", le(b, 130, 132));
                result.put("today", t);
                break;
            }
            case "8110": { // ملخص الأيام (وقت السجل = نص ليل بداية اليوم، وآخر سجل = النهارده لحظياً)
                JSArray arr = new JSArray();
                for (int o = 0; o + 38 <= b.length; o += 60) {
                    JSObject d = new JSObject();
                    d.put("time", le(b, o, o + 4));
                    d.put("steps", le(b, o + 8, o + 12));
                    d.put("kcal", le(b, o + 12, o + 16));
                    d.put("distance", le(b, o + 16, o + 20));
                    d.put("avgHR", u8(b, o + 20));
                    d.put("maxHR", u8(b, o + 21));
                    d.put("minHR", u8(b, o + 22));
                    d.put("spo2", u8(b, o + 23));
                    d.put("sportMin", le(b, o + 24, o + 26));
                    d.put("intenseMin", le(b, o + 26, o + 28));
                    d.put("deepMin", le(b, o + 28, o + 30));
                    d.put("lightMin", le(b, o + 30, o + 32));
                    d.put("remMin", le(b, o + 34, o + 36));
                    d.put("stress", u8(b, o + 36));
                    arr.put(d);
                }
                result.put("days", arr);
                break;
            }
            case "8113": { // النوم بمراحله
                JSArray arr = new JSArray();
                int ver = b.length > 4 ? u8(b, 4) : 0;
                int size = ver == 0 ? 224 : 824;
                for (int o = 0; o + 24 <= b.length; o += size) {
                    JSObject s = new JSObject();
                    s.put("time", le(b, o, o + 4));
                    s.put("nap", u8(b, o + 5) == 1);
                    s.put("start", le(b, o + 8, o + 12));
                    s.put("end", le(b, o + 12, o + 16));
                    s.put("deep", le(b, o + 16, o + 18));
                    s.put("light", le(b, o + 18, o + 20));
                    s.put("rem", le(b, o + 20, o + 22));
                    int n = u8(b, o + 23);
                    JSONArray st = new JSONArray();
                    for (int i = 0; i < n && o + 24 + i * 4 + 4 <= b.length; i++) {
                        int p = o + 24 + i * 4;
                        st.put(new JSONArray().put(u8(b, p)).put(le(b, p + 2, p + 4)));
                    }
                    s.put("stages", st); // [حالة, دقايق] – 0 عميق، 1 خفيف، 2 صاحي، 3 REM، 4 قيلولة
                    arr.put(s);
                }
                result.put("sleeps", arr);
                break;
            }
            case "8180": { // النبض: كل سجل 60 قراءة كل X دقيقة
                JSONArray samples = new JSONArray();
                for (int o = 0; o + 76 <= b.length; o += 76) {
                    long t = le(b, o, o + 4) & 0xFFFFFFFFL;
                    int step = le(b, o + 8, o + 10) * 60;
                    for (int i = 0; i < 60; i++) {
                        int bpm = u8(b, o + 16 + i);
                        if (bpm != 0 && bpm != 255) samples.put(new JSONArray().put(t + (long) i * step).put(bpm));
                    }
                }
                result.put("hr", samples);
                break;
            }
            case "8115": { // التمارين
                JSArray arr = new JSArray();
                for (int o = 0; o + 40 <= b.length; o += 256) {
                    JSObject w = new JSObject();
                    w.put("begin", le(b, o + 8, o + 12));
                    w.put("end", le(b, o + 12, o + 16));
                    w.put("sec", le(b, o + 16, o + 20));
                    w.put("steps", le(b, o + 20, o + 24));
                    w.put("kcal", le(b, o + 24, o + 28));
                    w.put("distance", le(b, o + 28, o + 32));
                    w.put("type", u8(b, o + 36));
                    w.put("maxHR", u8(b, o + 37));
                    w.put("minHR", u8(b, o + 38));
                    w.put("avgHR", u8(b, o + 39));
                    arr.put(w);
                }
                result.put("workouts", arr);
                break;
            }
            default:
                result.put("raw" + cmd, hex(b));
        }
    }

    private final BluetoothGattCallback cb = new BluetoothGattCallback() {
        @SuppressLint("MissingPermission")
        @Override
        public void onConnectionStateChange(BluetoothGatt g, int status, int state) {
            h.post(() -> {
                L("state " + state + " status " + status);
                if (state == BluetoothProfile.STATE_CONNECTED) g.requestMtu(247);
                else if (state == BluetoothProfile.STATE_DISCONNECTED) finish("disconnected " + status);
            });
        }

        @SuppressLint("MissingPermission")
        @Override
        public void onMtuChanged(BluetoothGatt g, int mtu, int status) { h.post(() -> { L("mtu " + mtu); g.discoverServices(); }); }

        @Override
        public void onServicesDiscovered(BluetoothGatt g, int status) {
            h.post(() -> {
                if (g.getService(SVC) == null) { finish("no fission service"); return; }
                setup();
            });
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor d, int status) { h.post(WatchDirect.this::setup); }

        @Override
        public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            final byte[] v = c.getValue() == null ? new byte[0] : c.getValue().clone();
            final UUID u = c.getUuid();
            h.post(() -> onNotify(u, v));
        }
    };
}
