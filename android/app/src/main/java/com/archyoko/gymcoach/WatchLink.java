package com.archyoko.gymcoach;

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
import android.os.Handler;
import android.os.Looper;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * اتصال واحد بالساعة (بروتوكول Fission) لكل التطبيق: الصفحة، الإشعارات، والمكالمات.
 * كل الأوامر في طابور واحد، وبنستنى رد كل أمر قبل اللي بعده.
 */
public class WatchLink {
    static final UUID SVC = UUID.fromString("c2e6ffb0-e966-1000-8000-bef9c223df6a");
    static final UUID BIG_W = UUID.fromString("c2e6ffb1-e966-1000-8000-bef9c223df6a");
    static final UUID BIG_N = UUID.fromString("c2e6ffb2-e966-1000-8000-bef9c223df6a");
    static final UUID AT_W = UUID.fromString("c2e6ffb3-e966-1000-8000-bef9c223df6a");
    static final UUID AT_N = UUID.fromString("c2e6ffb4-e966-1000-8000-bef9c223df6a");
    static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    static final String KNOWN_MAC = "23:08:17:10:21:D2";
    static final int FRAME = 20; // حجم الباكت اللي الساعة بتقبله افتراضياً

    public interface Done { void done(Op op, String err); }
    public interface AtListener { void onAt(String s); }

    /** أمر واحد */
    public static class Op {
        public final String key;
        final int kind; // 0 = AT، 1 = طلب بيانات، 2 = إرسال بيانات
        final byte[] head;
        final List<byte[]> packets;
        final String waitAt, waitBig;
        final Done cb;
        public byte[] big; public String bigCmd; public String at;
        int pi = 0; boolean sentAll = false;
        Op(String key, int kind, byte[] head, List<byte[]> packets, String waitAt, String waitBig, Done cb) {
            this.key = key; this.kind = kind; this.head = head; this.packets = packets; this.waitAt = waitAt; this.waitBig = waitBig; this.cb = cb;
        }
    }

    private static WatchLink I;
    public static synchronized WatchLink get(Context c) { if (I == null) I = new WatchLink(c.getApplicationContext()); return I; }

    private final Context ctx;
    private final Handler h = new Handler(Looper.getMainLooper());
    private BluetoothGatt gatt;
    private boolean ready = false, connecting = false;
    private int setupStep = 0;
    private boolean keepAlive = false;
    private final ArrayDeque<Op> q = new ArrayDeque<>();
    private Op cur;
    private String bigCmd; private int bigLen; private final ByteArrayOutputStream bigBuf = new ByteArrayOutputStream();
    private final List<AtListener> atListeners = new ArrayList<>();
    private final StringBuilder log = new StringBuilder();
    private long t0 = System.currentTimeMillis();
    public long lastOk = 0;
    private int retry = 0;

    private WatchLink(Context c) { ctx = c; }

    // ---------------- أدوات ----------------
    synchronized void L(String s) {
        if (log.length() > 40000) log.delete(0, 20000);
        log.append(String.format(java.util.Locale.US, "%6.1f ", (System.currentTimeMillis() - t0) / 1000.0)).append(s).append('\n');
    }
    public synchronized String takeLog() { String s = log.toString(); return s; }
    public synchronized void clearLog() { log.setLength(0); t0 = System.currentTimeMillis(); }

    static String hex(byte[] b) { StringBuilder sb = new StringBuilder(); if (b != null) for (byte x : b) sb.append(String.format("%02X", x)); return sb.toString(); }
    static byte[] atBytes(String s) { return ("AT+" + s + "\u0000").getBytes(StandardCharsets.US_ASCII); }

    static byte[] head(int a, int b, int len, long from, long to) {
        byte[] r = new byte[20];
        r[0] = (byte) 0xFF; r[1] = (byte) 0xFF; r[2] = 'B'; r[3] = 'G'; r[4] = 1; r[5] = 0;
        r[6] = (byte) a; r[7] = (byte) b;
        r[8] = (byte) (len >> 8); r[9] = (byte) len;
        if (from > 0) {
            r[10] = (byte) (from >> 24); r[11] = (byte) (from >> 16); r[12] = (byte) (from >> 8); r[13] = (byte) from;
            r[14] = (byte) (to >> 24); r[15] = (byte) (to >> 16); r[16] = (byte) (to >> 8); r[17] = (byte) to;
        }
        int sum = 0;
        for (int i = 0; i < 18; i++) sum += r[i] & 0xFF;
        r[18] = (byte) ~((sum >> 8) & 0xFF);
        r[19] = (byte) ~(sum & 0xFF);
        return r;
    }

    /** نفس HexUtil.addLengthWithStart في SDK الساعة: كل باكت 20 بايت أوله 2 بايت طول */
    static List<byte[]> packets(byte[] data) {
        ArrayList<Byte> l = new ArrayList<>();
        int i2 = FRAME;
        for (int i3 = 0; i3 < data.length; i3++) {
            l.add(data[i3]);
            if (l.size() % i2 == i2 - 2 || i3 == data.length - 1) {
                int size = l.size() - (l.size() % i2);
                int i4 = i3 + 1;
                int v;
                if (i3 + 3 <= i2) v = (l.size() % i2) & 0xFFFF;
                else v = i4 & 0xFFFF;
                l.add(size, (byte) v);
                l.add(size, (byte) (v >> 8));
            }
        }
        byte[] all = new byte[l.size()];
        for (int i = 0; i < all.length; i++) all[i] = l.get(i);
        List<byte[]> out = new ArrayList<>();
        for (int o = 0; o < all.length; o += FRAME) {
            int n = Math.min(FRAME, all.length - o);
            byte[] p = new byte[n];
            System.arraycopy(all, o, p, 0, n);
            out.add(p);
        }
        return out;
    }

    private SharedPreferences prefs() { return ctx.getSharedPreferences("watchdirect", Context.MODE_PRIVATE); }

    // ---------------- أوامر ----------------
    public void at(String key, String cmd, String waitPrefix, Done cb) { add(new Op(key, 0, atBytes(cmd), null, waitPrefix, null, cb)); }
    public void read(String key, int a, int b, long from, long to, Done cb) {
        add(new Op(key, 1, head(a, b, 0, from, to), null, null, String.format("%02X%02X", a | 0x80, b), cb));
    }
    public void send(String key, int a, int b, byte[] payload, Done cb) {
        add(new Op(key, 2, head(a, b, payload.length, 0, 0), packets(payload), null, String.format("%02X%02X", a | 0x80, b), cb));
    }
    public void addAtListener(AtListener l) { synchronized (atListeners) { if (!atListeners.contains(l)) atListeners.add(l); } }
    public void removeAtListener(AtListener l) { synchronized (atListeners) { atListeners.remove(l); } }
    public boolean isReady() { return ready; }

    public void setKeepAlive(boolean k) {
        h.post(() -> { keepAlive = k; L("keepAlive " + k); if (k) ensure(); else idleSoon(); });
    }

    private void add(Op op) { h.post(() -> { q.add(op); ensure(); pump(); }); }

    @SuppressLint("MissingPermission")
    private void ensure() {
        h.removeCallbacks(idleClose);
        if (gatt != null || connecting) return;
        BluetoothManager bm = (BluetoothManager) ctx.getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter ad = bm == null ? null : bm.getAdapter();
        if (ad == null || !ad.isEnabled()) { failAll("البلوتوث مقفول"); return; }
        BluetoothDevice dev = null;
        String mac = prefs().getString("mac", KNOWN_MAC);
        try {
            for (BluetoothDevice d : bm.getConnectedDevices(BluetoothProfile.GATT)) {
                String n = d.getName();
                if (mac.equalsIgnoreCase(d.getAddress()) || (n != null && (n.toLowerCase().contains("pop") || n.toLowerCase().contains("amazfit")))) { dev = d; break; }
            }
        } catch (Exception e) { L("list " + e); failAll("محتاج إذن الأجهزة القريبة"); return; }
        if (dev == null) dev = ad.getRemoteDevice(mac);
        prefs().edit().putString("mac", dev.getAddress()).putString("name", dev.getName() == null ? "" : dev.getName()).apply();
        connecting = true; ready = false; setupStep = 0;
        L("connect " + dev.getName() + " " + dev.getAddress());
        try { gatt = dev.connectGatt(ctx, false, cb, BluetoothDevice.TRANSPORT_LE); }
        catch (Exception e) { connecting = false; gatt = null; L("connect err " + e); failAll("مقدرتش أوصل للساعة"); return; }
        h.postDelayed(connectTimeout, 20000);
    }

    private final Runnable connectTimeout = () -> { if (!ready) { L("connect timeout"); drop(); failAll("الساعة مش قريبة أو البلوتوث مشغول"); scheduleReconnect(); } };
    private final Runnable idleClose = () -> { if (!keepAlive && q.isEmpty() && cur == null) { L("idle close"); drop(); } };
    private final Runnable opTimeout = () -> { if (cur != null) { L("timeout " + cur.key); finishOp(cur.kind == 2 && cur.sentAll ? null : "timeout"); } };

    private void idleSoon() { h.removeCallbacks(idleClose); h.postDelayed(idleClose, 25000); }

    @SuppressLint("MissingPermission")
    private void drop() {
        h.removeCallbacks(connectTimeout);
        try { if (gatt != null) { gatt.disconnect(); gatt.close(); } } catch (Exception ignored) { }
        gatt = null; ready = false; connecting = false; bigCmd = null;
    }

    private void scheduleReconnect() {
        if (!keepAlive) return;
        // الساعة بتقطع الاتصال كل دقيقة تقريباً – نرجع على طول عشان المكالمات متفوتش
        long d = retry < 5 ? 1500 : Math.min(300000, 10000L * (1L << Math.min(retry - 5, 5)));
        retry++;
        L("reconnect in " + d / 1000 + "s");
        h.postDelayed(this::ensure, d);
    }

    private void failAll(String why) {
        if (cur != null) { Op c = cur; cur = null; h.removeCallbacks(opTimeout); if (c.cb != null) c.cb.done(c, why); }
        while (!q.isEmpty()) { Op o = q.poll(); if (o.cb != null) o.cb.done(o, why); }
    }

    private void pump() {
        if (!ready || cur != null) return;
        cur = q.poll();
        if (cur == null) { idleSoon(); return; }
        h.removeCallbacks(idleClose);
        bigCmd = null;
        final Op op = cur;
        h.postDelayed(() -> {
            if (cur != op || gatt == null) return;
            if (op.kind == 0) write(AT_W, op.head);
            else write(BIG_W, op.head);
            h.postDelayed(opTimeout, op.kind == 0 ? 3000 : op.kind == 1 ? 9000 : 6000);
        }, 120);
    }

    private void finishOp(String err) {
        h.removeCallbacks(opTimeout);
        Op c = cur; cur = null; bigCmd = null;
        if (c != null && c.cb != null) { try { c.cb.done(c, err); } catch (Exception e) { L("cb " + e); } }
        pump();
    }

    @SuppressLint("MissingPermission")
    private void write(UUID ch, byte[] data) {
        BluetoothGattService s = gatt == null ? null : gatt.getService(SVC);
        BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(ch);
        if (c == null) { L("no char " + ch); return; }
        L("-> " + hex(data));
        c.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
        c.setValue(data);
        if (!gatt.writeCharacteristic(c)) { L("write busy, retry"); h.postDelayed(() -> { if (gatt != null) { c.setValue(data); gatt.writeCharacteristic(c); } }, 150); }
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
        if (gatt == null) return;
        if (setupStep == 0) { setupStep = 1; if (!notifyOn(AT_N)) setup(); return; }
        if (setupStep == 1) { setupStep = 2; if (!notifyOn(BIG_N)) setup(); return; }
        if (setupStep == 2) {
            setupStep = 3; ready = true; connecting = false; retry = 0; lastOk = System.currentTimeMillis();
            h.removeCallbacks(connectTimeout);
            L("ready");
            pump();
        }
    }

    // كتابة اتأكدت → الباكت اللي بعدها
    private void onWrote(UUID ch) {
        Op op = cur;
        if (op == null || op.kind != 2 || !ch.equals(BIG_W)) return;
        if (op.pi < op.packets.size()) {
            final byte[] p = op.packets.get(op.pi++);
            h.postDelayed(() -> { if (cur == op) write(BIG_W, p); }, op.pi == 1 ? 25 : 8);
        } else if (!op.sentAll) {
            op.sentAll = true;
            // الساعة غالباً بترد بتأكيد – لو مردتش خلال ثانية نعتبره وصل
            h.removeCallbacks(opTimeout);
            h.postDelayed(opTimeout, 1200);
        }
    }

    private void onNotify(UUID ch, byte[] v) {
        lastOk = System.currentTimeMillis();
        if (ch.equals(AT_N)) {
            String s = new String(v, StandardCharsets.US_ASCII).replace("\u0000", "").trim();
            L("<- AT " + s);
            if (s.startsWith("AT+")) s = s.substring(3);
            if (cur != null && cur.kind == 0 && cur.waitAt != null && s.startsWith(cur.waitAt)) { cur.at = s; finishOp(null); return; }
            List<AtListener> ls; synchronized (atListeners) { ls = new ArrayList<>(atListeners); }
            for (AtListener l : ls) { try { l.onAt(s); } catch (Exception e) { L("atl " + e); } }
            return;
        }
        if (!ch.equals(BIG_N) || v.length < 2) return;
        if ((v[0] & 0xFF) == 0xFF && (v[1] & 0xFF) == 0xFF && v.length >= 10 && v[2] == 'B' && v[3] == 'G') {
            bigCmd = String.format("%02X%02X", v[6], v[7]);
            bigLen = ((v[8] & 0xFF) << 8) | (v[9] & 0xFF);
            bigBuf.reset();
            L("<- BIG " + bigCmd + " len " + bigLen);
            if (bigLen == 0) {
                String c = bigCmd; bigCmd = null;
                if (cur != null && cur.kind != 0 && c.equalsIgnoreCase(cur.waitBig)) { cur.bigCmd = c; cur.big = new byte[0]; finishOp(null); }
            }
            return;
        }
        if (bigCmd == null) return;
        bigBuf.write(v, 2, v.length - 2);
        if (bigBuf.size() >= bigLen) {
            byte[] b = bigBuf.toByteArray();
            String c = bigCmd; bigCmd = null;
            L("   got " + c + " " + b.length + "b");
            if (cur != null && cur.kind != 0 && c.equalsIgnoreCase(cur.waitBig)) { cur.bigCmd = c; cur.big = b; finishOp(null); }
        }
    }

    private final BluetoothGattCallback cb = new BluetoothGattCallback() {
        @SuppressLint("MissingPermission")
        @Override public void onConnectionStateChange(BluetoothGatt g, int status, int state) {
            h.post(() -> {
                L("state " + state + " status " + status);
                if (g != gatt) { try { g.close(); } catch (Exception ignored) { } return; }
                if (state == BluetoothProfile.STATE_CONNECTED) g.requestMtu(247);
                else if (state == BluetoothProfile.STATE_DISCONNECTED) { drop(); if (cur == null && q.isEmpty()) { scheduleReconnect(); } else { failAll("الساعة فصلت"); scheduleReconnect(); } }
            });
        }
        @SuppressLint("MissingPermission")
        @Override public void onMtuChanged(BluetoothGatt g, int mtu, int status) { h.post(() -> { L("mtu " + mtu); g.discoverServices(); }); }
        @Override public void onServicesDiscovered(BluetoothGatt g, int status) {
            h.post(() -> { if (g.getService(SVC) == null) { L("no service"); drop(); failAll("دي مش الساعة"); return; } setup(); });
        }
        @Override public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor d, int status) { h.post(WatchLink.this::setup); }
        @Override public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic c, int status) {
            final UUID u = c.getUuid(); h.post(() -> onWrote(u));
        }
        @Override public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            final byte[] v = c.getValue() == null ? new byte[0] : c.getValue().clone();
            final UUID u = c.getUuid();
            h.post(() -> onNotify(u, v));
        }
    };

    // ---------------- رسايل جاهزة ----------------
    static void le(byte[] b, int off, int len, long v) { for (int i = 0; i < len; i++) b[off + i] = (byte) (v >> (8 * i)); }

    static byte[] cut(String s, int maxBytes) {
        byte[] b = s.getBytes(StandardCharsets.UTF_8);
        if (b.length <= maxBytes) return b;
        int n = s.length();
        while (n > 0 && (s.substring(0, n) + "...").getBytes(StandardCharsets.UTF_8).length > maxBytes) n--;
        return (s.substring(0, n) + "...").getBytes(StandardCharsets.UTF_8);
    }

    /** إشعار تطبيق (0401). النوع: 0 أي تطبيق، 2 رسايل، 8 واتساب... */
    public void pushMessage(int type, String who, String text, Done cb) {
        byte[] p = new byte[240];
        le(p, 0, 4, System.currentTimeMillis() / 1000);
        p[8] = (byte) type;
        String s = (who == null || who.isEmpty() ? "" : who + ":") + (text == null ? "" : text);
        byte[] c = cut(s, 196);
        byte[] withNul = new byte[c.length + 1];
        System.arraycopy(c, 0, withNul, 0, c.length);
        le(p, 18, 2, withNul.length);
        System.arraycopy(withNul, 0, p, 40, Math.min(withNul.length, 200));
        send("msg", 0x04, 0x01, p, cb);
    }

    /** مكالمة داخلة (0403) */
    public void incomingCall(String name, String number, Done cb) {
        byte[] p = new byte[76];
        le(p, 0, 4, System.currentTimeMillis() / 1000);
        byte[] num = cut(number == null ? "" : number, 19);
        byte[] nm = cut(name == null || name.isEmpty() ? (number == null ? "" : number) : name, 47);
        le(p, 4, 2, num.length);
        p[6] = (byte) nm.length;
        System.arraycopy(num, 0, p, 8, num.length);
        System.arraycopy(nm, 0, p, 28, nm.length);
        send("call", 0x04, 0x03, p, cb);
    }

    /** المكالمة خلصت أو اترد عليها من الموبايل */
    public void callEnded() { at("PCC", "PCC:102", "PCC", null); }

    /** شاشة المزيكا على الساعة = ريموت التمرين (0404). title ≈ 13 حرف عربي */
    public void musicInfo(String title, String sub, String album, boolean playing, int progress, int total, Done cb) {
        byte[] p = new byte[162];
        byte[] t = cut(title == null ? "" : title, 28), s = cut(sub == null ? "" : sub, 28), a = cut(album == null ? "" : album, 28);
        System.arraycopy(t, 0, p, 0, t.length);
        System.arraycopy(s, 0, p, 32, s.length);
        le(p, 64, 2, Math.max(0, total));
        System.arraycopy(a, 0, p, 66, a.length);
        p[130] = (byte) (playing ? 1 : 0);
        le(p, 132, 2, Math.max(0, progress));
        p[134] = 16; p[135] = 8;
        send("music", 0x04, 0x04, p, cb);
    }
}
