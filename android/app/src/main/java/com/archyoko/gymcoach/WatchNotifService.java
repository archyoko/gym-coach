package com.archyoko.gymcoach;

import android.Manifest;
import android.app.Notification;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.telecom.TelecomManager;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * بيوصّل إشعارات الموبايل والمكالمات للساعة، وبيخلّي الاتصال بالساعة شغال على طول.
 * النظام نفسه بيشغّل الخدمة دي لما محمد يدّي Lifestyle "الوصول للإشعارات".
 */
public class WatchNotifService extends NotificationListenerService {
    static volatile boolean running = false;
    private final Handler h = new Handler(Looper.getMainLooper());
    private final Map<String, String> lastText = new HashMap<>();
    private final Map<String, Long> lastTime = new HashMap<>();
    private String callKey = null;
    private Ringtone ring;

    /** باكدج ← نوع الأيقونة على الساعة */
    static final Map<String, Integer> TYPE = new HashMap<>();
    static {
        TYPE.put("com.whatsapp", 8); TYPE.put("com.whatsapp.w4b", 8);
        TYPE.put("com.facebook.katana", 5); TYPE.put("com.facebook.orca", 15);
        TYPE.put("com.instagram.android", 10); TYPE.put("com.google.android.gm", 13);
        TYPE.put("org.telegram.messenger", 45); TYPE.put("com.twitter.android", 6);
        TYPE.put("com.linkedin.android", 7); TYPE.put("com.microsoft.office.outlook", 14);
        TYPE.put("com.snapchat.android", 11); TYPE.put("com.viber.voip", 16);
        TYPE.put("com.google.android.apps.messaging", 2); TYPE.put("com.android.mms", 2);
        TYPE.put("com.oplus.mms", 2); TYPE.put("com.coloros.mms", 2); TYPE.put("com.samsung.android.messaging", 2);
    }

    private final WatchLink.AtListener atL = s -> {
        if (s.startsWith("DCC")) { endCall(); }
        else if (s.startsWith("TFP")) { findPhone(!s.contains(":0")); }
    };

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("watchdirect", Context.MODE_PRIVATE); }

    /** الإعدادات من صفحة الساعة: {on, apps:{pkg:true}, others, self, calls} */
    static JSONObject cfg(Context c) {
        try { return new JSONObject(prefs(c).getString("fwd", "{}")); } catch (Exception e) { return new JSONObject(); }
    }

    @Override public void onListenerConnected() {
        running = true;
        WatchLink w = WatchLink.get(this);
        w.addAtListener(atL);
        if (cfg(this).optBoolean("on", false)) w.setKeepAlive(true);
    }

    @Override public void onListenerDisconnected() {
        running = false;
        WatchLink w = WatchLink.get(this);
        w.removeAtListener(atL);
        w.setKeepAlive(false);
    }

    static boolean isDialer(String pkg) {
        return pkg.contains("incallui") || pkg.contains("dialer") || pkg.equals("com.android.server.telecom") || pkg.contains("telecom") || pkg.equals("com.android.phone") || pkg.contains("contacts");
    }

    static CharSequence cs(Bundle ex, String k) { CharSequence v = ex.getCharSequence(k); return v == null ? "" : v; }

    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        try {
            JSONObject c = cfg(this);
            if (!c.optBoolean("on", false)) return;
            Notification n = sbn.getNotification();
            String pkg = sbn.getPackageName();
            Bundle ex = n.extras;
            String title = cs(ex, Notification.EXTRA_TITLE).toString();
            String text = cs(ex, Notification.EXTRA_BIG_TEXT).toString();
            if (text.isEmpty()) text = cs(ex, Notification.EXTRA_TEXT).toString();
            CharSequence[] lines = ex.getCharSequenceArray(Notification.EXTRA_TEXT_LINES);
            if (lines != null && lines.length > 0 && lines[lines.length - 1] != null) text = lines[lines.length - 1].toString();

            // مكالمة داخلة من تطبيق الاتصال
            if (Notification.CATEGORY_CALL.equals(n.category) && isDialer(pkg)) {
                if (!c.optBoolean("calls", true)) return;
                if (sbn.getKey().equals(callKey)) return;
                // نتأكد إنها بترن (مش مكالمة شغالة): اللي بترن ليها fullScreenIntent أو أزرار رد/رفض
                if (n.fullScreenIntent == null && (n.actions == null || n.actions.length < 2)) return;
                callKey = sbn.getKey();
                String digits = title.replaceAll("[^0-9+]", "");
                WatchLink.get(this).incomingCall(title, digits.length() >= 5 ? digits : "", null);
                return;
            }

            if ((n.flags & Notification.FLAG_ONGOING_EVENT) != 0) return;
            if ((n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
            if (title.isEmpty() && text.isEmpty()) return;

            boolean self = pkg.equals(getPackageName());
            JSONObject apps = c.optJSONObject("apps");
            boolean allowed;
            if (self) allowed = c.optBoolean("self", true);
            else if (apps != null && apps.has(pkg)) allowed = apps.optBoolean(pkg, false);
            else if (TYPE.containsKey(pkg)) allowed = c.optBoolean("known", true);
            else allowed = c.optBoolean("others", false);
            if (!allowed) return;

            // منع التكرار: نفس التطبيق ونفس الكلام خلال 8 ثواني
            String sig = title + "|" + text;
            Long t = lastTime.get(pkg);
            if (sig.equals(lastText.get(pkg)) && t != null && System.currentTimeMillis() - t < 8000) return;
            lastText.put(pkg, sig); lastTime.put(pkg, System.currentTimeMillis());

            Integer type = TYPE.get(pkg);
            String who = title;
            if (type == null) {
                // تطبيق تاني: نكتب اسمه قبل العنوان
                String app = pkg;
                try { app = getPackageManager().getApplicationLabel(getPackageManager().getApplicationInfo(pkg, 0)).toString(); } catch (Exception ignored) { }
                who = self ? "Lifestyle" + (title.isEmpty() ? "" : " – " + title) : app + (title.isEmpty() ? "" : " – " + title);
            }
            WatchLink.get(this).pushMessage(type == null ? 0 : type, who, text, null);
        } catch (Exception e) {
            WatchLink.get(this).L("notif " + e);
        }
    }

    @Override public void onNotificationRemoved(StatusBarNotification sbn) {
        if (callKey != null && sbn.getKey().equals(callKey)) {
            callKey = null;
            WatchLink.get(this).callEnded();
        }
    }

    /** رفض المكالمة من الساعة */
    @SuppressWarnings("deprecation")
    private void endCall() {
        try {
            if (Build.VERSION.SDK_INT >= 28 && checkSelfPermission(Manifest.permission.ANSWER_PHONE_CALLS) == PackageManager.PERMISSION_GRANTED) {
                TelecomManager tm = (TelecomManager) getSystemService(Context.TELECOM_SERVICE);
                if (tm != null) tm.endCall();
            }
        } catch (Exception e) { WatchLink.get(this).L("endCall " + e); }
    }

    /** الساعة بتدوّر على الموبايل: يرنّ ويهزّ 15 ثانية */
    private void findPhone(boolean on) {
        h.removeCallbacksAndMessages(null);
        try { if (ring != null) ring.stop(); } catch (Exception ignored) { }
        ring = null;
        if (!on) return;
        try {
            ring = RingtoneManager.getRingtone(this, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE));
            if (ring != null) {
                if (Build.VERSION.SDK_INT >= 28) ring.setLooping(true);
                ring.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
                ring.play();
            }
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null) v.vibrate(VibrationEffect.createWaveform(new long[]{0, 600, 400, 600, 400, 600}, -1));
        } catch (Exception e) { WatchLink.get(this).L("findPhone " + e); }
        h.postDelayed(() -> findPhone(false), 15000);
    }
}
