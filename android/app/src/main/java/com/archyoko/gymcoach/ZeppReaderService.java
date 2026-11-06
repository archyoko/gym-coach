package com.archyoko.gymcoach;

import android.accessibilityservice.AccessibilityService;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import java.util.Calendar;
import android.content.SharedPreferences;
import android.graphics.Rect;
import android.os.Handler;
import android.os.Looper;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * بيقرا الأرقام من شاشة "صحة" في Zepp Active (ساعات Amazfit Pop) لما التطبيق يتفتح.
 * مقفول على تطبيق Zepp Active بس (packageNames في zepp_reader.xml) – مبيقراش أي تطبيق تاني.
 */
public class ZeppReaderService extends AccessibilityService {
    static final String ZEPP = "com.huami.watch.pop";
    static final String PREFS = "zepp_reader";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable captureTask = this::capture;
    private int scrolls = 0;

    static class Item {
        String text; Rect r;
        Item(String t, Rect r) { this.text = t; this.r = r; }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent e) {
        if (e == null || e.getPackageName() == null || !ZEPP.contentEquals(e.getPackageName())) return;
        handler.removeCallbacks(captureTask);
        handler.postDelayed(captureTask, 800);
    }

    @Override
    public void onInterrupt() { }

    /* ---------- القراءة الأوتوماتيك: أول فتح للموبايل الصبح وبالليل ---------- */
    private final BroadcastReceiver unlock = new BroadcastReceiver() {
        @Override public void onReceive(Context c, Intent i) { handler.postDelayed(ZeppReaderService.this::maybeAuto, 1500); }
    };

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        IntentFilter f = new IntentFilter(Intent.ACTION_USER_PRESENT);
        try {
            if (Build.VERSION.SDK_INT >= 33) registerReceiver(unlock, f, Context.RECEIVER_EXPORTED);
            else registerReceiver(unlock, f);
        } catch (Exception ignored) { }
    }

    @Override
    public void onDestroy() {
        try { unregisterReceiver(unlock); } catch (Exception ignored) { }
        super.onDestroy();
    }

    /** الصبح (5–12): يجيب نوم الليلة. بالليل (9–12): يجيب خطوات وسعرات اليوم كاملة. مرة واحدة لكل فترة. */
    private void maybeAuto() {
        SharedPreferences p = prefs();
        if (!p.getBoolean("auto", true) || p.getBoolean("requested", false)) return;
        int h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        String slot = h >= 5 && h < 12 ? "am" : h >= 21 ? "pm" : null;
        if (slot == null) return;
        String key = today() + "-" + slot;
        if (key.equals(p.getString("lastAuto", ""))) return;
        Intent i = getPackageManager().getLaunchIntentForPackage(ZEPP);
        if (i == null) return;
        p.edit().putString("lastAuto", key).putBoolean("requested", true).putString("mode", "auto")
                .putLong("requestedAt", System.currentTimeMillis()).apply();
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try { startActivity(i); } catch (Exception e) { p.edit().putBoolean("requested", false).apply(); }
    }

    private SharedPreferences prefs() { return getSharedPreferences(PREFS, MODE_PRIVATE); }

    static String today() { return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date()); }

    static String normDigits(String s) {
        StringBuilder b = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c >= '٠' && c <= '٩') b.append((char) ('0' + (c - '٠')));
            else if (c >= '۰' && c <= '۹') b.append((char) ('0' + (c - '۰')));
            else if (c == '٬' || c == '،') b.append(',');
            else if (c == '٫') b.append('.');
            else b.append(c);
        }
        return b.toString();
    }

    private void collect(AccessibilityNodeInfo n, List<Item> out, int depth) {
        if (n == null || depth > 60) return;
        CharSequence t = n.getText();
        if (t == null || t.length() == 0) t = n.getContentDescription();
        if (t != null && t.length() > 0) {
            Rect r = new Rect(); n.getBoundsInScreen(r);
            out.add(new Item(normDigits(t.toString().trim()), r));
        }
        for (int i = 0; i < n.getChildCount(); i++) {
            AccessibilityNodeInfo c = n.getChild(i);
            if (c != null) collect(c, out, depth + 1);
        }
    }

    private static final Pattern NUM = Pattern.compile("^[0-9][0-9,]*(\\.[0-9]+)?$");

    /** الرقم اللي فوق الكلمة (أو قبلها في الترتيب) */
    private static Integer numberNear(List<Item> items, String[] labels) {
        for (int i = 0; i < items.size(); i++) {
            Item lab = items.get(i);
            String t = lab.text.replace("<", "").replace(">", "").trim();
            if (t.length() > 18 || t.matches(".*[0-9].*")) continue;
            boolean hit = false;
            for (String l : labels) if (t.equalsIgnoreCase(l) || t.startsWith(l)) { hit = true; break; }
            if (!hit) continue;
            Item best = null; int bestD = Integer.MAX_VALUE;
            for (Item it : items) {
                if (!NUM.matcher(it.text).matches()) continue;
                boolean overlapX = it.r.right > lab.r.left - 40 && it.r.left < lab.r.right + 40;
                int d = lab.r.top - it.r.bottom;
                if (overlapX && d >= -10 && d < 260 && d < bestD) { best = it; bestD = d; }
            }
            if (best == null && i > 0 && NUM.matcher(items.get(i - 1).text).matches()) best = items.get(i - 1);
            if (best != null) {
                try { return (int) Math.round(Double.parseDouble(best.text.replace(",", ""))); } catch (Exception ignored) { }
            }
        }
        return null;
    }

    private void capture() {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        SharedPreferences p = prefs();
        boolean requested = p.getBoolean("requested", false);
        long reqAt = p.getLong("requestedAt", 0);
        if (root == null || root.getPackageName() == null || !ZEPP.contentEquals(root.getPackageName())) return;

        List<Item> items = new ArrayList<>();
        collect(root, items, 0);
        StringBuilder joined = new StringBuilder();
        for (Item it : items) joined.append(it.text).append(' ');
        String all = joined.toString();

        Integer steps = numberNear(items, new String[]{"خطوات", "الخطوات", "Steps", "steps"});
        Integer active = numberNear(items, new String[]{"سعرات حرارية", "سعرات", "السعرات", "Calories", "calories", "kcal"});
        Integer sleepMin = null, hr = null;
        String sleepDate = null;
        Matcher m = Pattern.compile("(\\d{1,2})\\s*(hr|h|ساعة|ساعات|س)\\s*(\\d{1,2})\\s*(min|m|دقيقة|دقائق|د)(?:[^0-9]{0,20}(\\d{2})/(\\d{2}))?").matcher(all);
        if (m.find()) {
            sleepMin = Integer.parseInt(m.group(1)) * 60 + Integer.parseInt(m.group(3));
            if (m.group(5) != null) {
                int dd = Integer.parseInt(m.group(5)), mm = Integer.parseInt(m.group(6));
                Calendar c = Calendar.getInstance();
                int y = c.get(Calendar.YEAR);
                if (mm > c.get(Calendar.MONTH) + 1) y--; // نوم ديسمبر وإحنا في يناير
                sleepDate = String.format(Locale.US, "%04d-%02d-%02d", y, mm, dd);
            }
        }
        Matcher mh = Pattern.compile("(?:bpm\\s*(\\d{2,3}))|(?:(\\d{2,3})\\s*bpm)").matcher(all);
        if (mh.find()) hr = Integer.parseInt(mh.group(1) != null ? mh.group(1) : mh.group(2));

        try {
            JSONObject data = new JSONObject(p.getString("data", "{}"));
            String d = today();
            JSONObject day = data.optJSONObject(d);
            if (day == null) day = new JSONObject();
            if (steps != null && steps >= day.optInt("steps", -1)) day.put("steps", steps);
            if (active != null && active >= day.optInt("active", -1)) day.put("active", active);
            if (sleepMin != null && sleepMin > 0) {
                String sd = sleepDate != null ? sleepDate : d;   // النوم بيتسجل على يوم الصحيان
                JSONObject sday = sd.equals(d) ? day : data.optJSONObject(sd);
                if (sday == null) { sday = new JSONObject(); data.put(sd, sday); }
                sday.put("sleepMin", sleepMin);
            }
            if (hr != null) day.put("hr", hr);
            if (steps != null || active != null || sleepMin != null) day.put("ts", System.currentTimeMillis());
            data.put(d, day);
            // التمارين: 05/11/2026 01:48:44, 456kcal
            Matcher mw = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})[^0-9]{0,60}(\\d{1,2}):(\\d{2}):(\\d{2})\\s*,?\\s*(\\d+)\\s*kcal").matcher(all);
            JSONObject wo = data.optJSONObject("workouts");
            if (wo == null) wo = new JSONObject();
            while (mw.find()) {
                String wd = mw.group(3) + "-" + mw.group(2) + "-" + mw.group(1);
                int min = Integer.parseInt(mw.group(4)) * 60 + Integer.parseInt(mw.group(5));
                JSONObject w = new JSONObject();
                w.put("kcal", Integer.parseInt(mw.group(7)));
                w.put("min", min);
                wo.put(wd, w);
            }
            data.put("workouts", wo);
            StringBuilder raw = new StringBuilder();
            for (int i = 0; i < Math.min(items.size(), 150); i++) raw.append(items.get(i).text).append(" | ");
            p.edit().putString("data", data.toString()).putString("raw", raw.toString())
                    .putLong("lastRead", System.currentTimeMillis()).apply();
        } catch (Exception ignored) { }

        if (!requested) return;
        boolean auto = "auto".equals(p.getString("mode", ""));
        boolean timedOut = System.currentTimeMillis() - reqAt > 25000;
        boolean morning = Calendar.getInstance().get(Calendar.HOUR_OF_DAY) < 12;
        boolean sleepFresh = sleepMin != null && (sleepDate == null || sleepDate.equals(today()));
        if (morning && sleepMin != null && !sleepFresh && !timedOut) {
            // الساعة لسه بتعمل مزامنة – النوم القديم ظاهر. استنى شوية واقرا تاني
            handler.postDelayed(captureTask, 2500);
            return;
        }
        if (sleepMin == null && scrolls < 3 && !timedOut) {
            // النوم تحت – انزل شوية واقرا تاني
            AccessibilityNodeInfo sc = findScrollable(root);
            if (sc != null && sc.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)) {
                scrolls++;
                handler.postDelayed(captureTask, 900);
                return;
            }
        }
        for (int i = 0; i < scrolls; i++) {
            AccessibilityNodeInfo sc = findScrollable(root);
            if (sc != null) sc.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
        }
        scrolls = 0;
        p.edit().putBoolean("requested", false).putString("mode", "").apply();
        if (auto) { performGlobalAction(GLOBAL_ACTION_BACK); return; }   // يرجعك للي كنت فيه
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        try { startActivity(i); } catch (Exception ignored) { }
    }

    private AccessibilityNodeInfo findScrollable(AccessibilityNodeInfo n) {
        if (n == null) return null;
        AccessibilityNodeInfo best = null; int bestArea = 0;
        List<AccessibilityNodeInfo> stack = new ArrayList<>();
        stack.add(n);
        while (!stack.isEmpty()) {
            AccessibilityNodeInfo x = stack.remove(stack.size() - 1);
            if (x == null) continue;
            if (x.isScrollable()) {
                Rect r = new Rect(); x.getBoundsInScreen(r);
                int a = r.width() * r.height();
                if (a > bestArea) { bestArea = a; best = x; }
            }
            for (int i = 0; i < x.getChildCount(); i++) stack.add(x.getChild(i));
        }
        return best;
    }
}
