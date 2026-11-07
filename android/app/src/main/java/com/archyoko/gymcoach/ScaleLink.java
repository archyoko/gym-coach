package com.archyoko.gymcoach;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.SparseArray;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

/**
 * قراءة ميزان OKOK (Chipsea) مباشرة من إشارة البلوتوث — من غير تطبيق OKOK ومن غير اتصال.
 * الميزان بيذيع الوزن والمقاومة (impedance) في manufacturer data. تحليل الجسم بيتحسب في JS.
 * البروتوكول مبني على فهم مشروع openScale المفتوح لنفس الميزان (OkOkHandler).
 */
@CapacitorPlugin(name = "ScaleDirect", permissions = {
        @Permission(alias = "bt", strings = {Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT})
})
public class ScaleLink extends Plugin {
    private final Handler h = new Handler(Looper.getMainLooper());
    private BluetoothLeScanner scanner;
    private ScanCallback cb;
    private PluginCall pending;
    private boolean done;
    private float bestWeight = 0, bestImp = 0;
    private String bestVariant = null, bestName = null;
    private Runnable timeoutR;

    @PluginMethod
    public void weigh(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 31 && getPermissionState("bt") != PermissionState.GRANTED) {
            requestPermissionForAlias("bt", call, "btBack");
            return;
        }
        run(call);
    }

    @PermissionCallback
    private void btBack(PluginCall call) {
        if (getPermissionState("bt") != PermissionState.GRANTED) { call.reject("محتاج إذن الأجهزة القريبة (Bluetooth)"); return; }
        run(call);
    }

    @PluginMethod
    public void stop(PluginCall call) { finish(false, "اتلغى"); call.resolve(); }

    @SuppressLint("MissingPermission")
    private void run(PluginCall call) {
        if (pending != null) { call.reject("بيقرا الميزان بالفعل"); return; }
        BluetoothManager bm = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        BluetoothAdapter ad = bm == null ? null : bm.getAdapter();
        if (ad == null || !ad.isEnabled()) { call.reject("البلوتوث مقفول"); return; }
        scanner = ad.getBluetoothLeScanner();
        if (scanner == null) { call.reject("مش قادر أفتح البحث عن البلوتوث"); return; }
        pending = call; done = false; bestWeight = 0; bestImp = 0; bestVariant = null; bestName = null;
        int ms = call.getInt("timeout", 60000);
        cb = new ScanCallback() {
            @Override public void onScanResult(int type, ScanResult result) { handle(result); }
            @Override public void onScanFailed(int errorCode) { finish(false, "البحث فشل (" + errorCode + ") — فعّل الموقع والبلوتوث"); }
        };
        ScanSettings st = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
        try { scanner.startScan(null, st, cb); }
        catch (Exception e) { pending = null; call.reject("مش قادر أبدأ البحث: " + e.getMessage()); return; }
        timeoutR = () -> {
            if (bestWeight > 0) finish(true, null); // وزن من غير مقاومة أحسن من لا حاجة
            else finish(false, "ملقتش الميزان — اتأكد إنك واقف عليه والبلوتوث مفتوح");
        };
        h.postDelayed(timeoutR, ms);
    }

    private void handle(ScanResult result) {
        if (pending == null || done || result.getScanRecord() == null) return;
        SparseArray<byte[]> m = result.getScanRecord().getManufacturerSpecificData();
        if (m == null || m.size() == 0) return;
        float[] wi = parse(m); // {weight, impedance, stable(1/0), variantCode}
        if (wi == null) return;
        String name = result.getScanRecord().getDeviceName();
        if (name == null) name = result.getDevice() != null ? "OKOK" : "OKOK";
        bestName = name;
        if (wi[0] > 0) { bestWeight = wi[0]; if (wi[1] > 0) bestImp = wi[1]; bestVariant = variantName((int) wi[3]); }
        // لما يثبت الوزن (stable) ومعاه مقاومة، نخلّص فوراً
        if (wi[2] == 1f && wi[0] > 0 && (wi[1] > 0 || bestImp > 0)) finish(true, null);
    }

    private String variantName(int c) { return c == 20 ? "V20" : c == 11 ? "V11" : c == 0xF0 ? "VF0" : c == 0xC0 ? "C0" : "?"; }

    @SuppressLint("MissingPermission")
    private void finish(boolean ok, String err) {
        if (pending == null) return;
        h.removeCallbacks(timeoutR);
        done = true;
        try { if (scanner != null && cb != null) scanner.stopScan(cb); } catch (Exception ignored) { }
        PluginCall c = pending; pending = null; cb = null;
        if (ok && bestWeight > 0) {
            JSObject r = new JSObject();
            r.put("weight", round1(bestWeight));
            r.put("impedance", round1(bestImp));
            r.put("variant", bestVariant);
            r.put("name", bestName);
            c.resolve(r);
        } else c.reject(err == null ? "مفيش قراية" : err);
    }

    static float round1(float v) { return Math.round(v * 10) / 10f; }
    static int u16be(byte[] d, int hi, int lo) { return ((d[hi] & 0xFF) << 8) | (d[lo] & 0xFF); }

    /** @return {weightKg, impedanceOhm, stable, variantCode} or null */
    private float[] parse(SparseArray<byte[]> m) {
        // V20: manuf 0x20CA, 19 bytes
        byte[] d = get(m, 0x20ca);
        if (d != null && d.length == 19) {
            boolean fin = (d[6] & 0x01) != 0;
            int ck = 0x20; for (int i = 0; i < 12; i++) ck ^= (d[i] & 0xFF);
            if (fin && (ck & 0xFF) == (d[12] & 0xFF)) {
                float div = (d[6] & 0x04) != 0 ? 100f : 10f;
                return new float[]{ u16be(d, 8, 9) / div, u16be(d, 10, 11) / 10f, 1f, 20 };
            }
        }
        // V11: manuf 0x11CA, 23 bytes, weight only
        d = get(m, 0x11ca);
        if (d != null && d.length == 23) {
            int ck = 0xCA ^ 0x11; for (int i = 0; i < 16; i++) ck ^= (d[i] & 0xFF);
            if ((ck & 0xFF) == (d[16] & 0xFF)) {
                int props = d[9] & 0xFF;
                float div = ((props >> 1) & 3) == 1 ? 1f : ((props >> 1) & 3) == 2 ? 100f : 10f;
                int w = u16be(d, 3, 4);
                float kg = unit((props >> 3) & 3, w, div);
                if (kg > 0) return new float[]{ kg, 0f, 1f, 11 };
            }
        }
        // VF0: manuf 0xF0FF, weight only
        d = get(m, 0xf0ff);
        if (d != null && d.length >= 4) return new float[]{ u16be(d, 3, 2) / 10f, 0f, 1f, 0xF0 };
        // C0: any key whose low byte == 0xC0
        for (int i = 0; i < m.size(); i++) {
            int k = m.keyAt(i);
            if ((k & 0xFF) != 0xC0) continue;
            byte[] c = m.valueAt(i);
            if (c == null || c.length < 13) continue;
            int attrib = c[6] & 0xFF;
            boolean stable = (attrib & 0x01) != 0;
            float div = ((attrib >> 1) & 3) == 1 ? 1f : ((attrib >> 1) & 3) == 2 ? 100f : 10f;
            float kg = unit((attrib >> 3) & 3, u16be(c, 0, 1), div);
            if ((attrib >> 3 & 3) == 3) { int st = c[0] & 0xFF; float lb = (c[1] & 0xFF) / div; kg = st * 6.350293f + lb * 0.453592f; }
            float imp = u16be(c, 2, 3) / 10f;
            if (kg > 0) return new float[]{ kg, imp, stable ? 1f : 0f, 0xC0 };
        }
        return null;
    }

    private static float unit(int u, int w, float div) {
        switch (u) {
            case 0: return w / div;              // kg
            case 1: return w / div / 2f;          // jin
            case 2: return (w / div) / 2.204623f; // lb
            case 3: return (w >> 8) * 6.350293f + ((w & 0xFF) / div) * 0.453592f; // st:lb
            default: return 0;
        }
    }

    private static byte[] get(SparseArray<byte[]> m, int key) { int i = m.indexOfKey(key); return i >= 0 ? m.valueAt(i) : null; }
}
