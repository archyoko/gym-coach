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
