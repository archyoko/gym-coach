package com.archyoko.gymcoach;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/** التحديث من جوه التطبيق: يشوف آخر نسخة على GitHub، ينزّلها، ويفتح شاشة التسطيب. */
@CapacitorPlugin(name = "Updater")
public class Updater extends Plugin {
    static final String BASE = "https://github.com/archyoko/gym-coach/releases/download/latest/";

    private long myCode() {
        try {
            PackageInfo p = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            return Build.VERSION.SDK_INT >= 28 ? p.getLongVersionCode() : p.versionCode;
        } catch (Exception e) { return 0; }
    }

    private static HttpURLConnection open(String u) throws Exception {
        // GitHub بيحوّل لسيرفر تاني – بنمشي ورا التحويل بنفسنا
        for (int i = 0; i < 6; i++) {
            HttpURLConnection c = (HttpURLConnection) new URL(u).openConnection();
            c.setInstanceFollowRedirects(false);
            c.setConnectTimeout(15000); c.setReadTimeout(30000);
            c.setRequestProperty("User-Agent", "Lifestyle-app");
            int code = c.getResponseCode();
            if (code >= 300 && code < 400) { u = c.getHeaderField("Location"); c.disconnect(); continue; }
            if (code != 200) throw new Exception("HTTP " + code);
            return c;
        }
        throw new Exception("redirects");
    }

    @PluginMethod public void check(PluginCall call) {
        new Thread(() -> {
            try {
                HttpURLConnection c = open(BASE + "version.json?t=" + System.currentTimeMillis());
                InputStream in = c.getInputStream();
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                byte[] buf = new byte[4096]; int n;
                while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                in.close();
                JSONObject j = new JSONObject(bo.toString("UTF-8"));
                JSObject r = new JSObject();
                long latest = j.optLong("code", 0);
                r.put("current", myCode());
                r.put("latest", latest);
                r.put("notes", j.optString("notes", ""));
                r.put("available", latest > myCode());
                call.resolve(r);
            } catch (Exception e) { call.reject("مقدرتش أشوف التحديث: " + e.getMessage()); }
        }).start();
    }

    @PluginMethod public void canInstall(PluginCall call) {
        boolean ok = Build.VERSION.SDK_INT < 26 || getContext().getPackageManager().canRequestPackageInstalls();
        call.resolve(new JSObject().put("ok", ok));
    }

    @PluginMethod public void allowInstall(PluginCall call) {
        Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
        call.resolve();
    }

    @PluginMethod public void install(PluginCall call) {
        new Thread(() -> {
            try {
                File dir = new File(getContext().getCacheDir(), "update");
                dir.mkdirs();
                File f = new File(dir, "lifestyle.apk");
                HttpURLConnection c = open(BASE + "gym-coach.apk?t=" + System.currentTimeMillis());
                long total = c.getContentLengthLong(), got = 0; int lastPct = -1;
                InputStream in = c.getInputStream();
                FileOutputStream out = new FileOutputStream(f);
                byte[] buf = new byte[65536]; int n;
                while ((n = in.read(buf)) > 0) {
                    out.write(buf, 0, n); got += n;
                    int pct = total > 0 ? (int) (got * 100 / total) : -1;
                    if (pct != lastPct && pct % 5 == 0) { lastPct = pct; notifyListeners("progress", new JSObject().put("pct", pct)); }
                }
                out.close(); in.close();
                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
                Intent i = new Intent(Intent.ACTION_VIEW);
                i.setDataAndType(uri, "application/vnd.android.package-archive");
                i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(i);
                call.resolve();
            } catch (Exception e) { call.reject("التحميل وقف: " + e.getMessage()); }
        }).start();
    }

    // ---------------- فحص نظام الساعة (قراءة بس) ----------------
    static String md5(String s) throws Exception {
        java.security.MessageDigest d = java.security.MessageDigest.getInstance("MD5");
        StringBuilder sb = new StringBuilder();
        for (byte b : d.digest(s.getBytes("UTF-8"))) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /** POST لسيرفر الساعة. الثوابت (client/salt) بتيجي من المستودع الخاص مش من الكود. */
    @PluginMethod public void watchApi(PluginCall call) {
        new Thread(() -> {
            try {
                String url = call.getString("url", ""), body = call.getString("body", "{}");
                String client = call.getString("client", ""), salt = call.getString("salt", "");
                String name = call.getString("name", ""), num = call.getString("num", ""), mac = call.getString("mac", ""), ver = call.getString("ver", "");
                long ts = System.currentTimeMillis() / 1000;
                String sign = md5(mac + ":" + name + ":" + num + ":" + client + ":" + salt + ":" + ts) + ":" + ts;
                HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                c.setConnectTimeout(15000); c.setReadTimeout(30000);
                c.setRequestMethod("POST"); c.setDoOutput(true);
                c.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                c.setRequestProperty("Accept-Encoding", "identity");
                c.setRequestProperty("Phone-model", Build.MODEL + " Android" + Build.VERSION.RELEASE);
                c.setRequestProperty("App-Type", "15");
                c.setRequestProperty("Accept-Language", "en");
                c.setRequestProperty("Sdk-Type", "2");
                c.setRequestProperty("Ota-Version", ver);
                c.setRequestProperty("Bluetooth-Name", name);
                c.setRequestProperty("Bluetooth-Adapter", num);
                c.setRequestProperty("Bluetooth-Address", mac);
                c.setRequestProperty("Device-Id", mac);
                c.setRequestProperty("Device-Name", name);
                c.setRequestProperty("Device-Model", num);
                c.setRequestProperty("Client-Id", client);
                c.setRequestProperty("Sign", sign);
                c.setRequestProperty("Authorization", "Bearer ");
                String tok = call.getString("token", "");
                if (!tok.isEmpty()) c.setRequestProperty("x-token", tok);
                c.getOutputStream().write(body.getBytes("UTF-8"));
                int code = c.getResponseCode();
                InputStream in = code >= 400 ? c.getErrorStream() : c.getInputStream();
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                if (in != null) { byte[] buf = new byte[4096]; int n; while ((n = in.read(buf)) > 0) bo.write(buf, 0, n); in.close(); }
                call.resolve(new JSObject().put("code", code).put("text", bo.toString("UTF-8")));
            } catch (Exception e) { call.reject(String.valueOf(e.getMessage())); }
        }).start();
    }

    /** ينزّل ملف ويرجّعه base64 (لحد 20 ميجا) */
    @PluginMethod public void fetchFile(PluginCall call) {
        new Thread(() -> {
            try {
                HttpURLConnection c = open(call.getString("url", ""));
                InputStream in = c.getInputStream();
                ByteArrayOutputStream bo = new ByteArrayOutputStream();
                byte[] buf = new byte[65536]; int n;
                while ((n = in.read(buf)) > 0) { bo.write(buf, 0, n); if (bo.size() > 20 * 1024 * 1024) throw new Exception("الملف أكبر من 20 ميجا"); }
                in.close();
                call.resolve(new JSObject().put("size", bo.size()).put("b64", android.util.Base64.encodeToString(bo.toByteArray(), android.util.Base64.NO_WRAP)));
            } catch (Exception e) { call.reject(String.valueOf(e.getMessage())); }
        }).start();
    }
}
