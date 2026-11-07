package com.archyoko.gymcoach;

import android.Manifest;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Build;
import android.provider.Settings;
import android.text.TextUtils;

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

import java.util.Calendar;

/**
 * صفحة الساعة في التطبيق ← WatchLink (اتصال واحد بالساعة).
 * القراءة: بطارية، النهارده، الأيام، النوم بمراحله، النبض، التمارين.
 * الإرسال: رسالة على الساعة، دوّر على الساعة، إعدادات توصيل الإشعارات.
 */
@CapacitorPlugin(name = "WatchDirect", permissions = {
        @Permission(alias = "bt", strings = {Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_SCAN}),
        @Permission(alias = "call", strings = {Manifest.permission.READ_PHONE_STATE, Manifest.permission.READ_CALL_LOG, Manifest.permission.READ_CONTACTS, Manifest.permission.ANSWER_PHONE_CALLS})
})
public class WatchDirect extends Plugin {

    static int le(byte[] b, int from, int to) {
        if (to > b.length) return 0;
        long v = 0;
        for (int i = from, k = 0; i < to; i++, k++) v |= (long) (b[i] & 0xFF) << (8 * k);
        return (int) v;
    }
    static int u8(byte[] b, int i) { return i < b.length ? b[i] & 0xFF : 0; }
    static String hex(byte[] b) { return WatchLink.hex(b); }

    private boolean btOk(PluginCall call, String cbName) {
        if (Build.VERSION.SDK_INT >= 31 && getPermissionState("bt") != PermissionState.GRANTED) {
            requestPermissionForAlias("bt", call, cbName);
            return false;
        }
        return true;
    }

    @PluginMethod public void test(PluginCall call) { call.getData().put("_m", "test"); if (btOk(call, "btBack")) run(call); }
    @PluginMethod public void sync(PluginCall call) { call.getData().put("_m", "sync"); if (btOk(call, "btBack")) run(call); }
    @PluginMethod public void info(PluginCall call) { call.getData().put("_m", "info"); if (btOk(call, "btBack")) run(call); }
    @PluginMethod public void find(PluginCall call) { call.getData().put("_m", "find"); if (btOk(call, "btBack")) run(call); }
    @PluginMethod public void message(PluginCall call) { call.getData().put("_m", "notify"); if (btOk(call, "btBack")) run(call); }

    @PermissionCallback
    private void btBack(PluginCall call) {
        if (getPermissionState("bt") != PermissionState.GRANTED) { call.reject("محتاج إذن الأجهزة القريبة (Bluetooth)"); return; }
        run(call);
    }

    static long dayStart(int add) {
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_MONTH, add);
        c.set(Calendar.HOUR_OF_DAY, 0); c.set(Calendar.MINUTE, 0); c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis() / 1000;
    }

    private void run(PluginCall call) {
        final String m = call.getString("_m", "test");
        final WatchLink w = WatchLink.get(getContext());
        final JSObject res = new JSObject();
        final boolean wantLog = call.getBoolean("log", true);
        if (wantLog) w.clearLog();
        res.put("name", getContext().getSharedPreferences("watchdirect", 0).getString("name", "Amazfit Pop 3R"));
        final int[] pending = {0};
        final String[] err = {null};
        final Runnable[] finish = new Runnable[1];
        finish[0] = () -> {
            res.put("at", System.currentTimeMillis());
            if (wantLog) res.put("log", w.takeLog());
            boolean got = res.has("battery") || res.has("today") || res.has("days") || res.has("sent");
            if (got) call.resolve(res); else call.reject("الساعة مردّتش" + (err[0] == null ? "" : " (" + err[0] + ")"), "NO_REPLY", null, res);
        };
        WatchLink.Done d = (op, e) -> {
            if (e != null) { if (err[0] == null) err[0] = e; }
            else if (op.kind == 0 && op.at != null) {
                String s = op.at;
                try {
                    if (s.startsWith("GBS:")) { String[] p = s.substring(4).split(","); res.put("battery", Integer.parseInt(p[0].trim())); res.put("charging", p.length > 1 && "1".equals(p[1].trim())); }
                    else if (s.startsWith("GSV:")) res.put("version", s.substring(4));
                    else if (s.startsWith("GPV:")) res.put("protocol", s.substring(4));
                    else if (s.startsWith("TFD")) res.put("found", true);
                } catch (Exception x) { w.L("at parse " + x); }
            } else if (op.kind == 1 && op.big != null) {
                try { parseBig(op.bigCmd, op.big, res); } catch (Exception x) { w.L("parse " + op.bigCmd + " " + x); }
            } else if (op.kind == 2) res.put("sent", true);
            if (--pending[0] == 0) finish[0].run();
        };
        long now = System.currentTimeMillis() / 1000;
        int n = 0;
        if ("notify".equals(m)) {
            w.pushMessage(call.getInt("type", 0), call.getString("title", "Lifestyle"), call.getString("text", ""), d); n++;
        } else {
            w.at("GBS", "GBS?", "GBS", d); n++;
            if ("find".equals(m)) { w.at("TFD", "TFD", "TFD", d); n++; }
            else if ("info".equals(m) || "test".equals(m)) {
                w.at("GSV", "GSV?", "GSV", d); n++;
                w.at("GPV", "GPV?", "GPV", d); n++;
                w.read("0102", 0x01, 0x02, 0, 0, d); n++;
                if ("test".equals(m)) { w.read("0110", 0x01, 0x10, dayStart(-6), now, d); n++; }
            } else {
                int days = call.getInt("days", 7), hrDays = call.getInt("hrDays", 2);
                w.read("0102", 0x01, 0x02, 0, 0, d); n++;
                w.read("0110", 0x01, 0x10, dayStart(-days), now, d); n++;
                w.read("0113", 0x01, 0x13, dayStart(-days), now + 1, d); n++;
                w.read("0180", 0x01, 0x80, dayStart(-hrDays + 1), now, d); n++;
                w.read("0115", 0x01, 0x15, dayStart(-days), now, d); n++;
            }
        }
        pending[0] = n;
    }

    // ---------------- الإشعارات ----------------
    private boolean notifAccess() {
        String flat = Settings.Secure.getString(getContext().getContentResolver(), "enabled_notification_listeners");
        if (TextUtils.isEmpty(flat)) return false;
        ComponentName me = new ComponentName(getContext(), WatchNotifService.class);
        for (String s : flat.split(":")) { ComponentName c = ComponentName.unflattenFromString(s); if (me.equals(c)) return true; }
        return false;
    }

    @PluginMethod public void status(PluginCall call) {
        JSObject r = new JSObject();
        r.put("notifAccess", notifAccess());
        r.put("listening", WatchNotifService.running);
        r.put("linked", WatchLink.get(getContext()).isReady());
        r.put("lastOk", WatchLink.get(getContext()).lastOk);
        r.put("callPerm", Build.VERSION.SDK_INT < 28 || getPermissionState("call") == PermissionState.GRANTED);
        r.put("fwd", getContext().getSharedPreferences("watchdirect", 0).getString("fwd", "{}"));
        call.resolve(r);
    }

    @PluginMethod public void setForward(PluginCall call) {
        JSObject c = call.getObject("cfg", new JSObject());
        getContext().getSharedPreferences("watchdirect", 0).edit().putString("fwd", c.toString()).apply();
        WatchLink.get(getContext()).setKeepAlive(c.optBoolean("on", false) && WatchNotifService.running);
        call.resolve();
    }

    @PluginMethod public void openNotifAccess(PluginCall call) {
        try {
            Intent i;
            if (Build.VERSION.SDK_INT >= 30) {
                i = new Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS);
                i.putExtra(Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME, new ComponentName(getContext(), WatchNotifService.class).flattenToString());
            } else i = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        } catch (Exception e) {
            Intent i = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
        }
        call.resolve();
    }

    @PluginMethod public void askCallPerm(PluginCall call) {
        if (Build.VERSION.SDK_INT < 28 || getPermissionState("call") == PermissionState.GRANTED) { call.resolve(new JSObject().put("ok", true)); return; }
        requestPermissionForAlias("call", call, "callBack");
    }

    @PermissionCallback
    private void callBack(PluginCall call) { call.resolve(new JSObject().put("ok", getPermissionState("call") == PermissionState.GRANTED)); }

    @PluginMethod public void getLog(PluginCall call) { call.resolve(new JSObject().put("log", WatchLink.get(getContext()).takeLog())); }


    // ---------------- أوامر خام (الإعدادات بتتحسب في JS) ----------------
    static byte[] unhex(String h) { byte[] b = new byte[h.length() / 2]; for (int i = 0; i < b.length; i++) b[i] = (byte) Integer.parseInt(h.substring(i * 2, i * 2 + 2), 16); return b; }

    /** يقرا أكتر من أمر 02xx مرة واحدة: {cmds:["0203","0205"]} → {"8203":"hex",...} */
    @PluginMethod public void readRaw(PluginCall call) {
        if (!btOk(call, "btRaw")) return;
        doReadRaw(call);
    }
    @PermissionCallback private void btRaw(PluginCall call) { if (getPermissionState("bt") != PermissionState.GRANTED) { call.reject("محتاج إذن الأجهزة القريبة"); return; } doReadRaw(call); }
    private void doReadRaw(PluginCall call) {
        WatchLink w = WatchLink.get(getContext());
        JSArray cmds = call.getArray("cmds", new JSArray());
        JSObject res = new JSObject();
        int n = cmds.length();
        if (n == 0) { call.resolve(res); return; }
        final int[] left = {n};
        for (int i = 0; i < n; i++) {
            String c = cmds.optString(i);
            if (c.startsWith("AT:")) {
                String cmd = c.substring(3); String wait = cmd.replaceAll("[?:].*", "");
                w.at(cmd, cmd, wait, (op, e) -> { res.put(c, e != null ? "ERR " + e : op.at); if (--left[0] == 0) call.resolve(res); });
            } else {
                int a = Integer.parseInt(c.substring(0, 2), 16), b = Integer.parseInt(c.substring(2, 4), 16);
                w.read(c, a, b, 0, 0, (op, e) -> { res.put(c, e != null ? "ERR " + e : hex(op.big)); if (--left[0] == 0) call.resolve(res); });
            }
        }
    }

    /** يبعت بيانات لأمر 03xx: {cmd:"0303", hex:"..."} */
    @PluginMethod public void sendRaw(PluginCall call) {
        String c = call.getString("cmd", ""), hx = call.getString("hex", "");
        if (c.length() != 4 || hx.isEmpty() || hx.length() % 2 != 0) { call.reject("bad"); return; }
        if (!c.startsWith("03") && !c.startsWith("04")) { call.reject("مسموح بس بالإعدادات"); return; }
        int a = Integer.parseInt(c.substring(0, 2), 16), b = Integer.parseInt(c.substring(2, 4), 16);
        WatchLink.get(getContext()).send(c, a, b, unhex(hx), (op, e) -> { if (e != null) call.reject(e); else call.resolve(new JSObject().put("ok", true).put("reply", op.big == null ? "" : hex(op.big))); });
    }

    /** أمر AT للإعدادات: {cmd:"SUT:123"} */
    @PluginMethod public void atRaw(PluginCall call) {
        String cmd = call.getString("cmd", "");
        // ممنوع أوامر الربط والتحديث وإعادة الضبط
        String k = cmd.length() >= 3 ? cmd.substring(0, 3) : cmd;
        if (k.equals("BDC") || k.equals("BDQ") || k.equals("SUM") || k.equals("RST") || k.equals("RES") || k.equals("OFF") || k.equals("NRS")) { call.reject("ممنوع"); return; }
        WatchLink.get(getContext()).at(k, cmd, k, (op, e) -> { if (e != null) call.reject(e); else call.resolve(new JSObject().put("reply", op.at)); });
    }

    // ---------------- قراءة البيانات ----------------
    static void parseBig(String cmd, byte[] b, JSObject result) throws Exception {
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

}
