package com.archyoko.gymcoach;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import androidx.activity.result.ActivityResult;
import android.app.Activity;
import android.database.Cursor;
import android.net.Uri;
import android.provider.OpenableColumns;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "ZeppBridge")
public class ZeppBridge extends Plugin {

    private SharedPreferences prefs() { return getContext().getSharedPreferences(ZeppReaderService.PREFS, Context.MODE_PRIVATE); }

    private boolean enabled() {
        String s = Settings.Secure.getString(getContext().getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        return s != null && s.contains(getContext().getPackageName()) && s.contains("ZeppReaderService");
    }

    private boolean installed() {
        return getContext().getPackageManager().getLaunchIntentForPackage(ZeppReaderService.ZEPP) != null;
    }

    @PluginMethod
    public void getData(PluginCall call) {
        SharedPreferences p = prefs();
        JSObject r = new JSObject();
        r.put("data", p.getString("data", "{}"));
        r.put("raw", p.getString("raw", ""));
        r.put("rawSleep", p.getString("rawSleep", ""));
        r.put("lastRead", p.getLong("lastRead", 0));
        r.put("enabled", enabled());
        r.put("installed", installed());
        r.put("auto", p.getBoolean("auto", true));
        r.put("okok", p.getString("okok", "{}"));
        r.put("okokRaw", p.getString("okokRaw", ""));
        r.put("okokRead", p.getLong("okokRead", 0));
        call.resolve(r);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod
    public void openAppInfo(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, android.net.Uri.parse("package:" + getContext().getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod
    public void startGain(PluginCall call) {
        Intent i = getContext().getPackageManager().getLaunchIntentForPackage(ZeppReaderService.GAIN);
        if (i == null) { call.reject("The Gain Universe مش متسطّب"); return; }
        prefs().edit().putBoolean("gainRequested", true).putString("gainStatus", "waiting").putString("gainEarliest", call.getString("earliest", "")).apply();
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod
    public void getGain(PluginCall call) {
        SharedPreferences p = prefs();
        JSObject r = new JSObject();
        r.put("data", p.getString("gain", "{}"));
        r.put("status", p.getString("gainStatus", ""));
        r.put("days", p.getInt("gainDays", 0));
        r.put("cursor", p.getString("gainCursor", ""));
        r.put("raw", p.getString("gainWhere", "") + "\n" + p.getString("gainRaw", ""));
        r.put("installed", getContext().getPackageManager().getLaunchIntentForPackage(ZeppReaderService.GAIN) != null);
        call.resolve(r);
    }

    @PluginMethod
    public void resetGain(PluginCall call) {
        prefs().edit().remove("gain").remove("gainStatus").remove("gainDays").remove("gainCursor").putBoolean("gainRequested", false).apply();
        call.resolve();
    }

    /** يبعت نص لتطبيق Claude مباشرة، ولو مش متسطّب يفتح قايمة المشاركة */
    @PluginMethod
    public void shareText(PluginCall call) {
        String text = call.getString("text", "");
        Intent send = new Intent(Intent.ACTION_SEND);
        send.setType("text/plain");
        send.putExtra(Intent.EXTRA_TEXT, text);
        send.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        JSObject r = new JSObject();
        try {
            Intent c = new Intent(send); c.setPackage("com.anthropic.claude");
            getContext().startActivity(c);
            r.put("app", "claude");
        } catch (Exception e) {
            Intent ch = Intent.createChooser(send, "ابعت التقرير للكابتن");
            ch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(ch);
            r.put("app", "chooser");
        }
        call.resolve(r);
    }

    /* ---------- النسخة على Google Drive (ملف بيختاره المستخدم من قايمة الملفات) ---------- */
    private SharedPreferences cloud() { return getContext().getSharedPreferences("cloud", Context.MODE_PRIVATE); }

    @PluginMethod
    public void pickBackup(PluginCall call) {
        boolean create = Boolean.TRUE.equals(call.getBoolean("create", true));
        Intent i = new Intent(create ? Intent.ACTION_CREATE_DOCUMENT : Intent.ACTION_OPEN_DOCUMENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType(create ? "application/json" : "*/*");
        if (create) i.putExtra(Intent.EXTRA_TITLE, "gym-coach-backup.json");
        i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
        startActivityForResult(call, i, "pickResult");
    }

    @ActivityCallback
    private void pickResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (result.getResultCode() != Activity.RESULT_OK || result.getData() == null || result.getData().getData() == null) { call.reject("اتلغى"); return; }
        Uri uri = result.getData().getData();
        try { getContext().getContentResolver().takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION); } catch (Exception ignored) { }
        String name = displayName(uri);
        cloud().edit().putString("uri", uri.toString()).putString("name", name).apply();
        JSObject r = new JSObject(); r.put("uri", uri.toString()); r.put("name", name); r.put("authority", uri.getAuthority());
        call.resolve(r);
    }

    private String displayName(Uri uri) {
        try (Cursor c = getContext().getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst()) return c.getString(0);
        } catch (Exception ignored) { }
        return "gym-coach-backup.json";
    }

    @PluginMethod
    public void backupInfo(PluginCall call) {
        JSObject r = new JSObject();
        String u = cloud().getString("uri", "");
        r.put("linked", !u.isEmpty());
        r.put("name", cloud().getString("name", ""));
        r.put("authority", u.isEmpty() ? "" : Uri.parse(u).getAuthority());
        call.resolve(r);
    }

    @PluginMethod
    public void unlinkBackup(PluginCall call) { cloud().edit().clear().apply(); call.resolve(); }

    @PluginMethod
    public void writeBackup(PluginCall call) {
        String u = cloud().getString("uri", "");
        if (u.isEmpty()) { call.reject("مش مربوط"); return; }
        String data = call.getString("data", "");
        new Thread(() -> {
            Uri uri = Uri.parse(u);
            Exception err = null;
            for (String mode : new String[]{"wt", "w"}) {
                try (OutputStream os = getContext().getContentResolver().openOutputStream(uri, mode)) {
                    if (os == null) throw new Exception("مش قادر أفتح الملف");
                    os.write(data.getBytes(StandardCharsets.UTF_8)); os.flush(); err = null; break;
                } catch (Exception e) { err = e; }
            }
            if (err != null) call.reject("الكتابة فشلت: " + err.getMessage());
            else { JSObject r = new JSObject(); r.put("bytes", data.length()); call.resolve(r); }
        }).start();
    }

    @PluginMethod
    public void readBackup(PluginCall call) {
        String u = cloud().getString("uri", "");
        if (u.isEmpty()) { call.reject("مش مربوط"); return; }
        new Thread(() -> {
            try (InputStream is = getContext().getContentResolver().openInputStream(Uri.parse(u))) {
                if (is == null) throw new Exception("مش قادر أفتح الملف");
                BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                StringBuilder sb = new StringBuilder(); char[] buf = new char[8192]; int n;
                while ((n = br.read(buf)) > 0) sb.append(buf, 0, n);
                JSObject r = new JSObject(); r.put("data", sb.toString()); call.resolve(r);
            } catch (Exception e) { call.reject("القراية فشلت: " + e.getMessage()); }
        }).start();
    }

    @PluginMethod
    public void setAuto(PluginCall call) {
        prefs().edit().putBoolean("auto", call.getBoolean("enabled", true)).apply();
        call.resolve();
    }

    @PluginMethod
    public void fetchNow(PluginCall call) {
        Intent i = getContext().getPackageManager().getLaunchIntentForPackage(ZeppReaderService.ZEPP);
        if (i == null) { call.reject("Zepp Active مش متسطّب"); return; }
        prefs().edit().putBoolean("requested", true).putString("mode", "manual").putLong("requestedAt", System.currentTimeMillis()).apply();
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }
}
