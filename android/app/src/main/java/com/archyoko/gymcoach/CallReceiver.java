package com.archyoko.gymcoach;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.ContactsContract;
import android.telephony.TelephonyManager;

/**
 * المكالمات من حالة التليفون نفسها (أضمن من إشعار تطبيق الاتصال في ColorOS).
 * رن ← اسم المتصل من الأسماء ← الساعة. اترد أو اتقفل ← الساعة تبطّل.
 */
public class CallReceiver extends BroadcastReceiver {
    static volatile long lastRing = 0;
    static volatile String lastNumber = "";
    static volatile boolean ringing = false;

    @Override public void onReceive(Context ctx, Intent i) {
        if (!TelephonyManager.ACTION_PHONE_STATE_CHANGED.equals(i.getAction())) return;
        String st = i.getStringExtra(TelephonyManager.EXTRA_STATE);
        WatchLink w = WatchLink.get(ctx);
        try {
            if (!WatchNotifService.cfg(ctx).optBoolean("calls", true) || !WatchNotifService.cfg(ctx).optBoolean("on", true)) return;
        } catch (Exception ignored) { }
        if (TelephonyManager.EXTRA_STATE_RINGING.equals(st)) {
            // أندرويد بيبعت الحدث مرتين: مرة من غير رقم ومرة بالرقم (لو فيه إذن سجل المكالمات)
            String num = i.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
            if (num == null) num = "";
            long now = System.currentTimeMillis();
            w.L("call ringing num=" + (num.isEmpty() ? "-" : "yes"));
            if (ringing && now - lastRing < 15000 && (num.isEmpty() || num.equals(lastNumber))) return;
            if (ringing && !lastNumber.isEmpty() && num.isEmpty()) return;
            ringing = true; lastRing = now; lastNumber = num;
            final String n = num;
            final PendingResult pr = goAsync();
            // نستنى نص ثانية: لو جه الحدث التاني بالرقم يبقى أحسن
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                try {
                    if (!ringing || !n.equals(lastNumber)) return;
                    String name = lookup(ctx, n);
                    w.incomingCall(name.isEmpty() ? (n.isEmpty() ? "مكالمة" : n) : name, n, null);
                } finally { pr.finish(); }
            }, n.isEmpty() ? 700 : 50);
        } else if (TelephonyManager.EXTRA_STATE_OFFHOOK.equals(st) || TelephonyManager.EXTRA_STATE_IDLE.equals(st)) {
            if (ringing) { ringing = false; w.L("call ended " + st); w.callEnded(); }
            lastNumber = "";
        }
    }

    static String lookup(Context ctx, String num) {
        if (num == null || num.isEmpty()) return "";
        if (ctx.checkSelfPermission(Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) return "";
        Uri u = Uri.withAppendedPath(ContactsContract.PhoneLookup.CONTENT_FILTER_URI, Uri.encode(num));
        try (Cursor c = ctx.getContentResolver().query(u, new String[]{ContactsContract.PhoneLookup.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) return c.getString(0);
        } catch (Exception ignored) { }
        return "";
    }
}
