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
    static final String OKOK = "com.chipsea.btcontrol.en";
    static final String GAIN = "com.thegainuniverse.codebase";
    static final String PREFS = "zepp_reader";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable captureTask = this::capture;
    private final Runnable okokTask = this::captureOkok;
    private int scrolls = 0;
    private int sleepStep = 0;          // 0 لسه، 1 فتحنا صفحة النوم
    private long sleepTapAt = 0;
    private int sleepScrolls = 0;
    private boolean swipeUpScreen() {
        if (Build.VERSION.SDK_INT < 24) return false;
        android.util.DisplayMetrics dm = getResources().getDisplayMetrics();
        android.graphics.Path path = new android.graphics.Path();
        path.moveTo(dm.widthPixels / 2f, dm.heightPixels * 0.78f); path.lineTo(dm.widthPixels / 2f, dm.heightPixels * 0.35f);
        android.accessibilityservice.GestureDescription g = new android.accessibilityservice.GestureDescription.Builder()
                .addStroke(new android.accessibilityservice.GestureDescription.StrokeDescription(path, 0, 350)).build();
        return dispatchGesture(g, null, null);
    }

    /* ---------- جودة النوم من صفحة النوم في Zepp Active ---------- */
    private static final String DUR = "(?:(\\d{1,2})\\s*(?:hr|h|ساعة|ساعات|س)\\s*)?(\\d{1,2})\\s*(?:min|m|دقيقة|دقائق|د)";
    private static Integer durAfter(String all, String labels) {
        Matcher m = Pattern.compile("(?:" + labels + ")[^0-9]{0,40}?(?:\\d{1,3}(?:\\.\\d+)?\\s*%[^0-9]{0,25}?)?" + DUR, Pattern.CASE_INSENSITIVE).matcher(all);
        if (m.find()) return (m.group(1) != null ? Integer.parseInt(m.group(1)) * 60 : 0) + Integer.parseInt(m.group(2));
        return null;
    }
    static JSONObject parseSleepDetail(String all) {
        JSONObject o = new JSONObject();
        try {
            Integer deep = durAfter(all, "Deep sleep|Deep|نوم عميق|العميق|عميق");
            Integer light = durAfter(all, "Light sleep|Light|نوم خفيف|الخفيف|خفيف");
            Integer rem = durAfter(all, "REM|حركة العين السريعة|ريم");
            Integer awake = durAfter(all, "Awake|Wake|مستيقظ|يقظة|صاحي|استيقاظ");
            if (deep != null) o.put("deep", deep);
            if (light != null) o.put("light", light);
            if (rem != null) o.put("rem", rem);
            if (awake != null) o.put("awake", awake);
            Matcher sc = Pattern.compile("(?:Sleep score|Score|نقاط النوم|درجة النوم|تقييم النوم|جودة النوم)[^0-9]{0,30}?(\\d{2,3})(?!\\s*(?:hr|h|min|m|ساعة|دقيقة|:|/\\d))", Pattern.CASE_INSENSITIVE).matcher(all);
            if (sc.find()) { int v = Integer.parseInt(sc.group(1)); if (v > 0 && v <= 100) o.put("score", v); }
            Matcher bt = Pattern.compile("(\\d{1,2}):(\\d{2})\\s*(?:ص|م|AM|PM|am|pm)?\\s*[-–~]\\s*(\\d{1,2}):(\\d{2})").matcher(all);
            if (bt.find()) { o.put("bed", bt.group(1) + ":" + bt.group(2)); o.put("wake", bt.group(3) + ":" + bt.group(4)); }
            else if (deep != null || light != null) {
                // Zepp Active: وقتين تحت الرسم (12:03 | 02:20) – نعرف مين البداية من مدة النوم
                Matcher tt = Pattern.compile("(?<![0-9/])(\\d{1,2}):(\\d{2})(?![0-9:])[^0-9]{0,12}(\\d{1,2}):(\\d{2})(?![0-9:])").matcher(all);
                Matcher tot = Pattern.compile("(\\d{1,2})\\s*(?:hr|h|ساعة|س)\\s*(\\d{1,2})\\s*(?:min|m|دقيقة|د)").matcher(all);
                if (tt.find()) {
                    int a = Integer.parseInt(tt.group(1)) * 60 + Integer.parseInt(tt.group(2)), b = Integer.parseInt(tt.group(3)) * 60 + Integer.parseInt(tt.group(4));
                    int total = tot.find() ? Integer.parseInt(tot.group(1)) * 60 + Integer.parseInt(tot.group(2)) : 450;
                    if (awake != null) total += awake;
                    int ab = ((b - a) % 1440 + 1440) % 1440, ba = ((a - b) % 1440 + 1440) % 1440;
                    boolean aFirst = Math.abs(ab - total) <= Math.abs(ba - total);
                    String ta = tt.group(1) + ":" + tt.group(2), tb = tt.group(3) + ":" + tt.group(4);
                    o.put("bed", aFirst ? ta : tb); o.put("wake", aFirst ? tb : ta);
                }
            }
            Matcher dt = Pattern.compile("(\\d{2})/(\\d{2})/(\\d{4})").matcher(all);
            if ((deep != null || light != null) && dt.find()) o.put("date", dt.group(3) + "-" + dt.group(2) + "-" + dt.group(1));
            Matcher rr = Pattern.compile("(?:Breathing|Respiratory|التنفس)[^0-9]{0,30}?(\\d{1,2}(?:\\.\\d)?)", Pattern.CASE_INSENSITIVE).matcher(all);
            if (rr.find()) o.put("resp", Double.parseDouble(rr.group(1)));
            Matcher rh = Pattern.compile("(?:Resting heart rate|Resting HR|نبض الراحة|معدل ضربات القلب أثناء الراحة|أثناء النوم)[^0-9]{0,30}?(\\d{2,3})", Pattern.CASE_INSENSITIVE).matcher(all);
            if (rh.find()) o.put("rhr", Integer.parseInt(rh.group(1)));
        } catch (Exception ignored) { }
        return o;
    }

    static class Item {
        String text; Rect r; AccessibilityNodeInfo node;
        Item(String t, Rect r) { this.text = t; this.r = r; }
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent e) {
        if (e == null || e.getPackageName() == null) return;
        if (GAIN.contentEquals(e.getPackageName())) { gainKick(); return; }
        if (OKOK.contentEquals(e.getPackageName())) { handler.removeCallbacks(okokTask); handler.postDelayed(okokTask, 900); return; }
        if (!ZEPP.contentEquals(e.getPackageName())) return;
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
            Item it = new Item(normDigits(t.toString().trim()), r); it.node = n; out.add(it);
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
            JSONObject det0 = parseSleepDetail(all);
            boolean detailPage = det0.has("deep") || det0.has("light");
            if (detailPage) { sleepMin = (det0.has("deep") && det0.has("light") && det0.has("rem")) ? det0.optInt("deep") + det0.optInt("light") + det0.optInt("rem") : null; if (det0.has("date")) sleepDate = det0.optString("date"); }
            if (sleepMin != null && sleepMin > 0) {
                String sd = sleepDate != null ? sleepDate : d;   // النوم بيتسجل على يوم الصحيان
                JSONObject sday = sd.equals(d) ? day : data.optJSONObject(sd);
                if (sday == null) { sday = new JSONObject(); data.put(sd, sday); }
                sday.put("sleepMin", sleepMin);
            }
            if (hr != null) day.put("hr", hr);
            JSONObject det = det0;
            if (det.has("deep") || det.has("score") || det.has("rem") || det.has("light") || det.has("awake")) {
                String sd = det.has("date") ? det.optString("date") : sleepDate != null ? sleepDate : d;
                JSONObject sday = sd.equals(d) ? day : data.optJSONObject(sd);
                if (sday == null) { sday = new JSONObject(); data.put(sd, sday); }
                java.util.Iterator<String> ks = det.keys();
                while (ks.hasNext()) { String k = ks.next(); sday.put("s_" + k, det.get(k)); }
                StringBuilder rs = new StringBuilder();
                for (int i = 0; i < Math.min(items.size(), 120); i++) rs.append(items.get(i).text).append(" | ");
                p.edit().putString("rawSleep", rs.toString()).apply();
            }
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

        if (!requested) { sleepStep = 0; return; }
        boolean auto = "auto".equals(p.getString("mode", ""));
        boolean timedOut = System.currentTimeMillis() - reqAt > 35000;
        if (sleepStep == 1) {
            // إحنا في صفحة النوم – استنى تحمّل، وبعدين ارجع وكمّل
            if (System.currentTimeMillis() - sleepTapAt < 2200 && !timedOut) { handler.postDelayed(captureTask, 900); return; }
            JSONObject got = null;
            try { JSONObject all2 = new JSONObject(p.getString("data", "{}")); String sd = sleepDate != null ? sleepDate : today(); got = all2.optJSONObject(sd); } catch (Exception ignored) { }
            boolean full = got != null && got.has("s_deep") && got.has("s_light") && got.has("s_rem") && got.has("s_awake");
            if (!full && sleepScrolls < 3 && !timedOut) {
                AccessibilityNodeInfo sc = findScrollable(root);
                if (sc != null && sc.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)) { sleepScrolls++; handler.postDelayed(captureTask, 1000); return; }
                if (swipeUpScreen()) { sleepScrolls++; handler.postDelayed(captureTask, 1100); return; }
            }
            sleepScrolls = 0;
            sleepStep = 2;
            performGlobalAction(GLOBAL_ACTION_BACK);
            handler.postDelayed(captureTask, 1200);
            return;
        }
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
        if (sleepStep == 0 && sleepMin != null && !timedOut && Calendar.getInstance().get(Calendar.HOUR_OF_DAY) < 14) {
            Pattern sp = Pattern.compile("(\\d{1,2})\\s*(hr|h|ساعة|ساعات|س)\\s*(\\d{1,2})\\s*(min|m|دقيقة|دقائق|د)");
            Item target = null;
            for (Item it : items) if (sp.matcher(it.text).find() && it.text.length() < 60) { target = it; break; }
            if (target == null) for (Item it : items) if (it.text.equalsIgnoreCase("hr") || it.text.equals("ساعة")) { target = it; break; }
            if (target == null) for (Item it : items) if (it.text.matches("^(ينام|النوم|نوم|Sleep)$")) { target = it; break; }
            if (target != null && tap(target)) { sleepStep = 1; sleepScrolls = 0; sleepTapAt = System.currentTimeMillis(); handler.postDelayed(captureTask, 2400); return; }
        }
        sleepStep = 0;
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

    /* ---------- ميزان OKOK: الوزن وتحليل الجسم ---------- */
    private static final String[][] OK_RULES = {
        // key, لازم يحتوي, ممنوع يحتوي
        {"weight", "سجل الوزن", "المخطط"}, {"weight", "Weight", "Fat|Muscle|Water|Bone"},
        {"bmi", "BMI", ""},
        {"fatKg", "وزن الدهون", ""}, {"visceral", "الحشوية", ""}, {"visceral", "Visceral", ""},
        {"fat", "الدهون", "وزن|الحشوية"}, {"fat", "Body Fat", "Mass|kg"},
        {"skmKg", "وزن العضلات العظمية", ""}, {"skm", "العضلات العظمية", "وزن"}, {"skm", "Skeletal", "kg|Mass"},
        {"muscleKg", "وزن العضلات", "العظمية"}, {"muscle", "نسبة العضلات", "العظمية"}, {"muscle", "Muscle Rate", ""},
        {"waterKg", "وزن الماء", ""}, {"water", "المياه", "وزن"}, {"water", "Body Water", "kg"},
        {"bone", "العظام", ""}, {"bone", "Bone", ""},
        {"bmr", "حرق السعرات", ""}, {"bmr", "BMR", ""},
        {"protein", "البروتين", ""}, {"protein", "Protein", ""},
        {"lean", "كتلة الجسم", ""}, {"lean", "Lean", ""}, {"metaAge", "العمر الايضي", ""}, {"metaAge", "العمر الأيضي", ""}
    };

    private void captureOkok() {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null || !OKOK.contentEquals(root.getPackageName())) return;
        List<Item> items = new ArrayList<>();
        collect(root, items, 0);
        StringBuilder joined = new StringBuilder();
        for (Item it : items) joined.append(it.text).append(' ');
        String all = joined.toString();
        // تاريخ القياس اللي على الشاشة – من غيره مش بنسجّل (عشان قراءة قديمة متتحسبش على النهارده)
        Matcher md = Pattern.compile("(20\\d{2})[/-](\\d{1,2})[/-](\\d{1,2})\\s+(\\d{1,2}):(\\d{2})").matcher(all);
        if (!md.find()) return;
        String date = String.format(Locale.US, "%s-%02d-%02d", md.group(1), Integer.parseInt(md.group(2)), Integer.parseInt(md.group(3)));
        String time = String.format(Locale.US, "%02d:%s", Integer.parseInt(md.group(4)), md.group(5));
        try {
            JSONObject rec = new JSONObject();
            for (Item lab : items) {
                String t = lab.text;
                if (t.length() > 40 || NUM.matcher(t).matches()) continue;
                for (String[] r : OK_RULES) {
                    if (rec.has(r[0]) || !t.contains(r[1])) continue;
                    if (!r[2].isEmpty() && Pattern.compile(r[2]).matcher(t).find()) continue;
                    Double v = rowValue(items, lab);
                    if (v != null && !(r[0].equals("weight") && (v < 30 || v > 250))) rec.put(r[0], v);
                    break;
                }
            }
            // الشاشة الرئيسية: الرقم الكبير جنب "كجم"
            if (!rec.has("weight")) {
                for (Item lab : items) {
                    if (!lab.text.equals("كجم") && !lab.text.equalsIgnoreCase("kg")) continue;
                    Double v = rowValue(items, lab);
                    if (v != null && v > 30 && v < 250) { rec.put("weight", v); break; }
                }
            }
            if (rec.length() == 0) return;
            rec.put("time", time);
            SharedPreferences p = prefs();
            JSONObject data = new JSONObject(p.getString("okok", "{}"));
            JSONObject old = data.optJSONObject(date);
            if (old != null) { java.util.Iterator<String> k = rec.keys(); while (k.hasNext()) { String key = k.next(); old.put(key, rec.get(key)); } rec = old; }
            data.put(date, rec);
            // سجل كل الوزنات بالساعة (القراءة الجديدة ما بتمسحش اللي قبلها)
            if (rec.has("weight")) {
                JSONObject log = new JSONObject(p.getString("okokLog", "{}"));
                JSONObject one = new JSONObject();
                java.util.Iterator<String> lk = rec.keys();
                while (lk.hasNext()) { String key = lk.next(); one.put(key, rec.get(key)); }
                log.put(date + " " + time, one);
                p.edit().putString("okokLog", log.toString()).apply();
            }
            StringBuilder raw = new StringBuilder();
            for (int i = 0; i < Math.min(items.size(), 150); i++) raw.append(items.get(i).text).append(" | ");
            p.edit().putString("okok", data.toString()).putString("okokRaw", raw.toString()).putLong("okokRead", System.currentTimeMillis()).apply();
        } catch (Exception ignored) { }
    }

    /** الرقم اللي في نفس السطر مع الكلمة */
    private static Double rowValue(List<Item> items, Item lab) {
        int cy = lab.r.centerY(); Item best = null; int bestD = Integer.MAX_VALUE;
        for (Item it : items) {
            if (it == lab || !NUM.matcher(it.text).matches()) continue;
            int d = Math.abs(it.r.centerY() - cy);
            int tol = Math.max(lab.r.height(), it.r.height());
            if (d <= tol && d < bestD) { best = it; bestD = d; }
        }
        if (best == null) return null;
        try { return Double.parseDouble(best.text.replace(",", "")); } catch (Exception e) { return null; }
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

    /* =====================================================================
       استيراد سجل The Gain Universe: بيلف على الأيام لورا في شاشة "سجل الأوزان"
       ويفتح كل تمرين ويقرا المجموعات (الوزن · العدات · التاريخ)
       ===================================================================== */
    private final Runnable gainStep = this::gainTick;
    private boolean gRunning = false;
    private int gPhase = 0, gScrolls = 0, gTries = 0, gEmpty = 0, gMonthTries = 0, gDays = 0;
    private String gCursor = null;
    private boolean gGotAny = false;
    private long gStarted = 0;
    private final java.util.Set<String> gExpanded = new java.util.HashSet<>();
    private final java.util.Set<String> gDaySeen = new java.util.HashSet<>();
    private JSONObject gData = null;

    private static final String[] AR_MON = {"يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"};
    private static final Pattern DATE = Pattern.compile("(20\\d{2})-(\\d{2})-(\\d{2})");
    private static final Pattern KG = Pattern.compile("(\\d+(?:\\.\\d+)?)\\s*(?:كجم|kg)");
    private static final Pattern REPS = Pattern.compile("(\\d+)\\s*(?:عدات|عدة|عده|reps)");

    private void gainKick() {
        SharedPreferences p = prefs();
        if (gRunning || !p.getBoolean("gainRequested", false)) return;
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null || !GAIN.contentEquals(root.getPackageName())) return;
        List<Item> items = new ArrayList<>(); collect(root, items, 0);
        boolean onLog = false;
        for (Item it : items) if (it.text.contains("سجل الأوزان")) { onLog = true; break; }
        if (!onLog) return;
        // ابدأ
        gRunning = true; gPhase = 0; gScrolls = 0; gTries = 0; gEmpty = 0; gDays = 0; gMonthTries = 0;
        gGotAny = false; gStarted = System.currentTimeMillis(); gCursor = shift(today(), 1); gWeekCheck = null; pressLater = false; gSig = ""; gLastYM = -1; gArrowLeft = p.getBoolean("gainArrowLeft", false);
        gExpanded.clear(); gDaySeen.clear();
        try { gData = new JSONObject(p.getString("gain", "{}")); } catch (Exception e) { gData = new JSONObject(); }
        p.edit().putBoolean("gainRequested", false).putString("gainStatus", "running").apply();
        gPhase = 1;   // أول خطوة: اضغط على النهارده
        handler.postDelayed(gainStep, 1200);
    }

    private void gainStop(String status) {
        gRunning = false;
        prefs().edit().putString("gainWhere", "phase=" + gPhase + " cursor=" + gCursor + " tries=" + gTries + " arrowLeft=" + gArrowLeft).apply();
        handler.removeCallbacks(gainStep);
        SharedPreferences.Editor ed = prefs().edit();
        if (gData != null) ed.putString("gain", gData.toString());
        ed.putString("gainStatus", status).putInt("gainDays", gDays).putLong("gainDone", System.currentTimeMillis()).apply();
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        try { startActivity(i); } catch (Exception ignored) { }
    }

    private void dump(List<Item> items) {
        StringBuilder b = new StringBuilder();
        for (Item it : items) b.append(it.text).append(" @").append(it.r.left).append(',').append(it.r.top).append(',').append(it.r.right).append(',').append(it.r.bottom)
                .append(it.node != null && it.node.isClickable() ? " C" : "").append(" | ");
        prefs().edit().putString("gainRaw", b.length() > 6000 ? b.substring(0, 6000) : b.toString()).apply();
    }

    private static boolean isHeader(String t) {
        if (t.length() < 4 || t.length() > 60 || t.matches(".*\\d.*")) return false;
        int latin = 0, letters = 0;
        for (char c : t.toCharArray()) { if (Character.isLetter(c)) { letters++; if (c < 128) latin++; } }
        return letters >= 4 && latin * 10 >= letters * 8 && !t.equalsIgnoreCase("PDF");
    }

    private boolean tap(Item it) {
        AccessibilityNodeInfo n = it.node;
        for (int k = 0; n != null && k < 6; k++) {
            if (n.isClickable() && n.performAction(AccessibilityNodeInfo.ACTION_CLICK)) return true;
            n = n.getParent();
        }
        return tapAt(it.r.centerX(), it.r.centerY());
    }

    private boolean tapAt(int x, int y) {
        if (Build.VERSION.SDK_INT < 24) return false;
        android.graphics.Path path = new android.graphics.Path(); path.moveTo(x, y);
        android.accessibilityservice.GestureDescription g = new android.accessibilityservice.GestureDescription.Builder()
                .addStroke(new android.accessibilityservice.GestureDescription.StrokeDescription(path, 0, 60)).build();
        return dispatchGesture(g, null, null);
    }

    /** القايمة: أكبر عنصر بيسكرول **رأسي** تحت شريط الأيام (مش الشريط نفسه) */
    private AccessibilityNodeInfo mainScroll(AccessibilityNodeInfo root, int belowY) {
        AccessibilityNodeInfo best = null; int bestArea = 0;
        List<AccessibilityNodeInfo> st = new ArrayList<>(); st.add(root);
        while (!st.isEmpty()) {
            AccessibilityNodeInfo x = st.remove(st.size() - 1); if (x == null) continue;
            if (x.isScrollable()) {
                Rect r = new Rect(); x.getBoundsInScreen(r);
                boolean vertical = r.height() >= r.width() * 0.8 || r.bottom > belowY + r.height() / 2;
                boolean isStrip = r.width() > r.height() * 2;
                if (vertical && !isStrip) { int a = r.width() * r.height(); if (a > bestArea) { bestArea = a; best = x; } }
            }
            for (int i = 0; i < x.getChildCount(); i++) st.add(x.getChild(i));
        }
        return best;
    }

    /** شريط الأيام: عنصر بيسكرول أعرض من ما هو طويل */
    private AccessibilityNodeInfo stripScroll(AccessibilityNodeInfo root, int yTop, int yBottom) {
        List<AccessibilityNodeInfo> st = new ArrayList<>(); st.add(root);
        while (!st.isEmpty()) {
            AccessibilityNodeInfo x = st.remove(st.size() - 1); if (x == null) continue;
            if (x.isScrollable()) { Rect r = new Rect(); x.getBoundsInScreen(r); if (r.width() > r.height() * 2 && r.centerY() > yTop && r.centerY() < yBottom) return x; }
            for (int i = 0; i < x.getChildCount(); i++) st.add(x.getChild(i));
        }
        return null;
    }

    private void gainTick() {
        if (!gRunning) return;
        if (System.currentTimeMillis() - gStarted > 20 * 60 * 1000L) { gainStop("timeout"); return; }
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || root.getPackageName() == null || !GAIN.contentEquals(root.getPackageName())) {
            if (++gTries > 15) { gainStop("left"); return; }
            handler.postDelayed(gainStep, 1000); return;
        }
        List<Item> items = new ArrayList<>(); collect(root, items, 0);
        items.sort((a, b) -> a.r.top != b.r.top ? a.r.top - b.r.top : a.r.left - b.r.left);
        dump(items);

        // حدود المناطق: الشهر فوق، وتحته شريط الأيام، وتحته القايمة
        Item monthItem = null;
        for (Item it : items) { for (String m : AR_MON) if (it.text.startsWith(m)) { monthItem = it; break; } if (monthItem != null) break; }
        int H = getResources().getDisplayMetrics().heightPixels;
        int stripBottom = monthItem != null ? monthItem.r.bottom + (int) (H * 0.18) : (int) (H * 0.4);
        int chipsBottom = 0;
        for (Item it : chips(items, monthItem, stripBottom).values()) chipsBottom = Math.max(chipsBottom, it.r.bottom);
        if (chipsBottom > 0) stripBottom = chipsBottom + 5;
        int listTop = stripBottom;

        if (gPhase == 0) {
            // 1) افتح أول تمرين مقفول
            List<Item> headers = new ArrayList<>();
            for (Item it : items) {
                if (it.r.top <= listTop) continue;
                String first = it.text.split("\n")[0].trim();     // الكارت المفتوح: الاسم + ملخصه في نفس العنصر
                if (isHeader(first)) { Item h = new Item(first, it.r); h.node = it.node; headers.add(h); }
            }
            for (int h = 0; h < headers.size(); h++) {
                Item hd = headers.get(h);
                if (gExpanded.contains(hd.text)) continue;
                int nextTop = h + 1 < headers.size() ? headers.get(h + 1).r.top : Integer.MAX_VALUE;
                boolean open = false;
                for (Item it : items) if (it.r.top > hd.r.top && it.r.top < nextTop && (it.text.contains("إضافة وزن") || DATE.matcher(it.text).find())) { open = true; break; }
                gExpanded.add(hd.text);
                if (!open) { tap(hd); handler.postDelayed(gainStep, 900); return; }
            }
            // 2) اقرا المجموعات الظاهرة
            readSets(items, headers, listTop);
            // 3) انزل لتحت
            AccessibilityNodeInfo sc = headers.isEmpty() ? null : mainScroll(root, stripBottom);
            if (gScrolls < 12 && sc != null && sc.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)) { gScrolls++; handler.postDelayed(gainStep, 900); return; }
            // اليوم خلص
            gDays++;
            boolean had = false;
            for (String k : gDaySeen) if (k.startsWith(gCursor + "|")) { had = true; break; }
            if (had) { gEmpty = 0; gGotAny = true; } else gEmpty++;
            SharedPreferences.Editor ed = prefs().edit();
            ed.putString("gain", gData.toString()).putInt("gainDays", gDays).putString("gainCursor", gCursor).apply();
            String earliest = prefs().getString("gainEarliest", "");
            if ((gGotAny && gEmpty >= 28) || (!gGotAny && gEmpty >= 45) || (!earliest.isEmpty() && gCursor.compareTo(earliest) <= 0)) { gainStop("done"); return; }
            gScrolls = 0; gUp = 0; gExpanded.clear(); gPhase = 1; gTries = 0; gMonthTries = 0;
            handler.postDelayed(gainStep, 900); return;
        }

        if (gPhase == 1) {
            // لو الصفحة نازلة لتحت (الشهر والأيام مش ظاهرين) اطلع فوق الأول
            if (monthItem == null) {
                if (++gUp > 14) { gainStop("top"); return; }
                // مرة سكرول عادي ومرة سحبة بالصباع لتحت (بعض التطبيقات مبتستجيبش للأولى)
                AccessibilityNodeInfo up = mainScroll(root, 0);
                if (up == null) up = findScrollable(root);
                if (gUp % 2 == 1 && up != null) up.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
                else swipeDown();
                handler.postDelayed(gainStep, 800); return;
            }
            gUp = 0;
            // اليوم اللي قبله
            String target = shift(gCursor, -1);
            int tDay = dayNum(target);
            int tYM = Integer.parseInt(target.substring(0, 4)) * 12 + Integer.parseInt(target.substring(5, 7)) - 1;
            // 1) الشهر: السهم اللي فوق بيغيّر الشهر
            int shownYM = -1;
            Matcher my = Pattern.compile("(\\d{4})").matcher(monthItem.text);
            for (int m = 0; m < 12; m++) if (monthItem.text.startsWith(AR_MON[m])) shownYM = (my.find() ? Integer.parseInt(my.group(1)) : Integer.parseInt(target.substring(0, 4))) * 12 + m;
            if (shownYM >= 0 && shownYM != tYM) {
                if (gLastYM >= 0) {
                    boolean moved = shownYM != gLastYM;
                    boolean wentPrev = shownYM < gLastYM;
                    if (!moved || wentPrev != gWantPrev) { gArrowLeft = !gArrowLeft; prefs().edit().putBoolean("gainArrowLeft", gArrowLeft).apply(); }
                }
                if (++gTries > 10) { gainStop("month"); return; }
                gLastYM = shownYM;
                gWantPrev = tYM < shownYM;
                pressArrow(root, monthItem, gWantPrev ? gArrowLeft : !gArrowLeft);
                handler.postDelayed(gainStep, 1500); return;
            }
            gLastYM = -1;
            // 2) اليوم في الشريط
            java.util.Map<Integer, Item> chips = chips(items, monthItem, stripBottom);
            if (chips.containsKey(tDay)) {
                tap(chips.get(tDay)); gCursor = target; gPhase = 0; gScrolls = 0; gExpanded.clear(); gTries = 0;
                handler.postDelayed(gainStep, 1500); return;
            }
            if (++gTries > 14) { gainStop("strip"); return; }
            // اسحب الشريط ناحية اليوم: الأرقام بتزيد ناحية اليمين
            int mn = 99, mx = 0, cy = (monthItem.r.bottom + stripBottom) / 2;
            for (java.util.Map.Entry<Integer, Item> e : chips.entrySet()) { mn = Math.min(mn, e.getKey()); mx = Math.max(mx, e.getKey()); cy = e.getValue().r.centerY(); }
            boolean leftToRightIncreasing = true;
            if (chips.size() >= 2) {
                Item a = chips.get(mn), b = chips.get(mx);
                leftToRightIncreasing = a.r.centerX() < b.r.centerX();
            }
            boolean needLater = chips.isEmpty() || tDay > mx;
            int w = getResources().getDisplayMetrics().widthPixels;
            // عشان نشوف أرقام أكبر والأكبر يمين: نسحب الصباع من اليمين للشمال
            boolean fingerRightToLeft = needLater == leftToRightIncreasing;
            if (Build.VERSION.SDK_INT >= 24) {
                android.graphics.Path path = new android.graphics.Path();
                if (fingerRightToLeft) { path.moveTo(w * 0.85f, cy); path.lineTo(w * 0.15f, cy); } else { path.moveTo(w * 0.15f, cy); path.lineTo(w * 0.85f, cy); }
                dispatchGesture(new android.accessibilityservice.GestureDescription.Builder()
                        .addStroke(new android.accessibilityservice.GestureDescription.StrokeDescription(path, 0, 300)).build(), null, null);
            }
            handler.postDelayed(gainStep, 1100);
        }
    }

    private int gLastYM = -1;
    private boolean gWantPrev = true;
    private int gUp = 0;
    private void swipeDown() {
        if (Build.VERSION.SDK_INT < 24) return;
        int w = getResources().getDisplayMetrics().widthPixels, h = getResources().getDisplayMetrics().heightPixels;
        android.graphics.Path path = new android.graphics.Path();
        path.moveTo(w * 0.5f, h * 0.35f); path.lineTo(w * 0.5f, h * 0.92f);
        dispatchGesture(new android.accessibilityservice.GestureDescription.Builder()
                .addStroke(new android.accessibilityservice.GestureDescription.StrokeDescription(path, 0, 250)).build(), null, null);
    }
    private String gWeekCheck = null;
    private String gSig = "";
    private boolean pressLater = false;
    private boolean gArrowLeft = false;

    private static String shift(String d, int n) {
        String[] pr = d.split("-");
        Calendar c = Calendar.getInstance();
        c.set(Integer.parseInt(pr[0]), Integer.parseInt(pr[1]) - 1, Integer.parseInt(pr[2]));
        c.add(Calendar.DAY_OF_MONTH, n);
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }
    private static int dayNum(String d) { return Integer.parseInt(d.substring(8)); }

    /** أرقام الأيام الظاهرة في الشريط (الرقم لوحده أو جنب اسم اليوم) */
    private java.util.Map<Integer, Item> chips(List<Item> items, Item monthItem, int stripBottom) {
        java.util.Map<Integer, Item> m = new java.util.HashMap<>();
        Pattern num = Pattern.compile("(?:^|\\s)(\\d{1,2})(?:\\s|$)");
        for (Item it : items) {
            if (monthItem != null && it.r.top <= monthItem.r.bottom) continue;
            if (stripBottom > 0 && it.r.top >= stripBottom) continue;
            if (it.text.length() > 20) continue;
            Matcher mm = num.matcher(it.text);
            if (mm.find()) {
                int d = Integer.parseInt(mm.group(1));
                if (d >= 1 && d <= 31 && !m.containsKey(d)) m.put(d, it);
            }
        }
        return m;
    }

    /** سهم الشهر (يمين أو شمال اسم الشهر) */
    private void pressArrow(AccessibilityNodeInfo root, Item monthItem, boolean left) {
        int w = getResources().getDisplayMetrics().widthPixels;
        int y = monthItem != null ? monthItem.r.centerY() : (int) (getResources().getDisplayMetrics().heightPixels * 0.18);
        Item best = null; int bestDx = Integer.MAX_VALUE;
        List<AccessibilityNodeInfo> st = new ArrayList<>(); st.add(root);
        while (!st.isEmpty()) {
            AccessibilityNodeInfo x = st.remove(st.size() - 1); if (x == null) continue;
            if (x.isClickable()) {
                Rect r = new Rect(); x.getBoundsInScreen(r);
                boolean sameRow = Math.abs(r.centerY() - y) < Math.max(60, monthItem != null ? monthItem.r.height() * 2 : 60);
                boolean side = left ? r.centerX() < w / 2 : r.centerX() > w / 2;
                boolean small = r.width() < w / 3;
                if (sameRow && side && small) { int dx = Math.abs(r.centerX() - w / 2); if (dx < bestDx) { bestDx = dx; best = new Item("", r); best.node = x; } }
            }
            for (int i = 0; i < x.getChildCount(); i++) st.add(x.getChild(i));
        }
        if (best != null) tap(best);
        else tapAt(left ? (int) (w * 0.19) : (int) (w * 0.79), y);
    }

    /** لكل تمرين ظاهر: السطور اللي تحته لحد التمرين اللي بعده. بنحتفظ بأطول قايمة اتشافت (عشان السكرول ميكررش) */
    private void readSets(List<Item> items, List<Item> headers, int listTop) {
        List<List<Item>> rows = new ArrayList<>();
        int H = getResources().getDisplayMetrics().heightPixels;
        for (Item it : items) {
            if (it.r.top <= listTop || it.r.height() > H / 8) continue;   // ملخص اليوم الكبير مش سطر
            boolean placed = false;
            for (List<Item> row : rows) { Item f = row.get(0); if (Math.abs(f.r.centerY() - it.r.centerY()) < Math.max(18, f.r.height() / 2)) { row.add(it); placed = true; break; } }
            if (!placed) { List<Item> nr = new ArrayList<>(); nr.add(it); rows.add(nr); }
        }
        try {
            for (int h = 0; h < headers.size(); h++) {
                Item hd = headers.get(h);
                int nextTop = h + 1 < headers.size() ? headers.get(h + 1).r.top : Integer.MAX_VALUE;
                org.json.JSONArray list = new org.json.JSONArray(); String date = null;
                for (List<Item> row : rows) {
                    int y = row.get(0).r.centerY();
                    if (y <= hd.r.top + 20 || y >= nextTop) continue;
                    StringBuilder b = new StringBuilder(); for (Item it : row) b.append(it.text).append(' ');
                    String t = b.toString();
                    Matcher md = DATE.matcher(t), mk = KG.matcher(t), mr = REPS.matcher(t);
                    if (!md.find() || !mr.find()) continue;
                    date = md.group(1) + "-" + md.group(2) + "-" + md.group(3);
                    org.json.JSONArray set = new org.json.JSONArray();
                    set.put(mk.find() ? Double.parseDouble(mk.group(1)) : 0); set.put(Integer.parseInt(mr.group(1)));
                    list.put(set);
                }
                if (date == null || list.length() == 0) continue;
                JSONObject day = gData.optJSONObject(date); if (day == null) { day = new JSONObject(); gData.put(date, day); }
                org.json.JSONArray old = day.optJSONArray(hd.text);
                if (old == null || old.length() < list.length()) day.put(hd.text, list);
                gDaySeen.add(gCursor + "|" + hd.text);
                gDaySeen.add(date + "|" + hd.text);
                if (!date.equals(gCursor)) gCursor = date;
            }
        } catch (Exception ignored) { }
    }
}
