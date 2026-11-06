/* كوتش الجيم – منطق التطبيق */
'use strict';

/* ================= أدوات ================= */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const today = () => iso(new Date());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parseISO(a) - parseISO(b)) / 864e5);
const r1 = n => Math.round(n * 10) / 10;
const fmt = (n, d = 0) => (n == null || isNaN(n)) ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const clock = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? pad2(h) + ':' : '') + pad2(m) + ':' + pad2(x); };
const AR_DAYS = ['الأحد', 'الاتنين', 'التلات', 'الأربع', 'الخميس', 'الجمعة', 'السبت'];
const AR_MON = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const nice = s => { const d = parseISO(s); return `${AR_DAYS[d.getDay()]} ${d.getDate()} ${AR_MON[d.getMonth()]}`; };
const short = s => { const d = parseISO(s); return `${d.getDate()}/${d.getMonth() + 1}`; };
const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { } };

const ICON = {
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  swap: '<svg viewBox="0 0 24 24"><path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2M20 4v4h-4M4 20v-4h4"/></svg>',
  info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  kg: '<svg viewBox="0 0 24 24"><path d="M8 7a4 4 0 0 1 8 0M5 8h14l2 12H3z"/><path d="M9 17v-5l3 3 3-3v5"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>',
  left: '<svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  arrowL: '<svg viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  user: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  heart: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/><path d="M3 12h4l2-3 3 6 2-3h7"/></svg>',
  scale: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M8 9a5 5 0 0 1 8 0l-4 3z"/></svg>',
  ruler: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2"/></svg>',
  book: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-3a3 3 0 0 0-3 3"/></svg>',
  shield: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  report: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M9 13h6M9 17h6M9 9h3"/></svg>',
  save: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M4 21h16"/></svg>',
  arr: '<svg class="arr" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  bell: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/></svg>'
};

/* ================= التخزين ================= */
const KEY = 'gymcoach.v2';
let S;
function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
  if (!raw) raw = JSON.parse(JSON.stringify(SEED));
  raw.settings = Object.assign({}, SEED.settings, raw.settings || {});
  for (const k of ['days', 'health', 'logs', 'body', 'swaps', 'foodSwaps']) raw[k] = raw[k] || {};
  return raw;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('مقدرتش أحفظ – المساحة مليانة؟'); } }
S = load();
// قراءة الميزان يوم 31/10 من صور OKOK
if (!S.body['2026-10-31']) { S.body['2026-10-31'] = { weight: 88.65, bmi: 30.7, fat: 29.5, fatKg: 26.2, skm: 36.5, skmKg: 32.4, muscle: 67.6, muscleKg: 60.0, water: 51.7, waterKg: 45.8, visceral: 16.5, bone: 2.47, bmr: 1812, protein: 16.0, lean: 62.49, metaAge: 43, src: 'okok' }; }

const day = d => (S.days[d] = S.days[d] || {});

/* القيم الفعلية لليوم: اليدوي يكسب في الوزن، والساعة تكسب في الخطوات والحرق */
function latestWeight(d) { for (let i = 0; i < 30; i++) { const x = S.days[addDays(d, -i)] || {}, y = S.health[addDays(d, -i)] || {}; const w = x.w ?? y.oweight ?? y.weight; if (w) return w; } return S.settings.startWeight; }
/* حرق الراحة: من الميزان لو موجود (آخر 30 يوم)، وإلا معادلة Mifflin */
function bmr(d) {
  for (let i = 0; i < 30; i++) { const b = S.body[addDays(d, -i)]; if (b && b.bmr) return Math.round(b.bmr); }
  const s = S.settings; return Math.round(10 * latestWeight(d) + 6.25 * s.height - 5 * s.age + 5);
}
/* الأولوية: اليدوي ← ساعة Zepp Active ← Health Connect (الموبايل/Fit) */
function eff(d) {
  const m = S.days[d] || {}, h = S.health[d] || {};
  const active = m.active ?? h.zactive ?? h.active ?? null;
  return {
    w: m.w ?? h.oweight ?? h.weight ?? null,
    steps: m.steps ?? h.zsteps ?? h.steps ?? null,
    active,
    kcal: m.kcal ?? (active != null ? bmr(d) + active : h.kcal) ?? null,
    sleep: m.sleepMin ?? h.zsleep ?? h.sleepMin ?? null,
    rhr: h.rhr ?? null,
    fat: h.fat ?? null,
    creatine: !!m.creatine,
    water: m.water || 0
  };
}

/* ================= أيام خاصة والأكل الفعلي ================= */
const isMomFri = d => { const ms = S.settings.momStart; return !!ms && parseISO(d).getDay() === 5 && ((diffDays(d, ms) % 14) + 14) % 14 === 0; };
const isLecture = d => (S.settings.lectureDays || SPECIAL.lectureDays).includes(parseISO(d).getDay());
const dayType = d => isMomFri(d) ? 'mom' : isLecture(d) ? 'lecture' : 'normal';
const riceAdj = () => Math.round(S.settings.riceAdj || 0);
function mealItems(m) {
  return m.items.map(it => {
    const i = S.foodSwaps[it.id] || 0; const a = i ? it.alts[i - 1] : null;
    let x = a ? Object.assign({}, it, a, { swapped: true, base: it.name }) : Object.assign({}, it);
    if (it.id === 'rice' && !a && riceAdj()) { x.g = it.g + riceAdj(); x.kcal = Math.round(it.kcal * x.g / it.g); x.adj = riceAdj(); }
    return x;
  });
}
/* الوجبات لليوم ده: العشا بيتغيّر يوم المحاضرة وجمعة ماما */
function mealsFor(d) {
  const t = dayType(d);
  return DIET.meals.map(m => {
    const its = mealItems(m);
    const base = { id: m.id, title: m.title, time: m.time, where: m.where, note: m.note, items: its, kcal: its.reduce((a, x) => a + x.kcal, 0), p: its.reduce((a, x) => a + x.p, 0) };
    if (m.id === 'm2' && t === 'mom') { const it2 = its.filter(x => x.id !== 'choc'); return Object.assign(base, { items: it2, kcal: it2.reduce((a, x) => a + x.kcal, 0), p: it2.reduce((a, x) => a + x.p, 0), note: 'النهارده من غير شيكولاتة – سيب مكان لأكل ماما.' }); }
    if (m.id === 'm3' && t !== 'normal') {
      const sp = t === 'mom' ? SPECIAL.mom : SPECIAL.lecture;
      const pick = (S.days[d] || {}).choice;
      const opt = sp.options.find(o => o.id === pick) || (t === 'lecture' ? Object.assign({}, sp.options[0], { kcal: base.kcal, p: base.p }) : sp.options[1]);
      return { id: 'm3', special: t, title: sp.title, time: sp.time, where: sp.where, note: sp.note, options: sp.options, pick: opt.id, kcal: opt.id === 'box' ? base.kcal : opt.kcal, p: opt.id === 'box' ? base.p : opt.p, boxItems: its };
    }
    return base;
  });
}
const kcalTarget = d => mealsFor(d).reduce((a, m) => a + m.kcal, 0);
const extraOf = d => { const x = S.days[d] || {}; return (x.extraKcal || 0) + (x.extras || []).reduce((a, e) => a + e.kcal, 0); };
/* الأكل الفعلي: الوجبات اللي اتعلّم عليها. يوم من غير ولا علامة = غالباً الخطة */
function intake(d) {
  const ms = mealsFor(d), eaten = (S.days[d] || {}).meals || {};
  const any = Object.values(eaten).some(Boolean);
  if (!any) return { kcal: kcalTarget(d) + extraOf(d), logged: false };
  return { kcal: ms.reduce((a, m) => a + (eaten[m.id] ? m.kcal : 0), 0) + extraOf(d), logged: true };
}

/* ================= الكابتن: حرقك الحقيقي وتعديل السعرات ================= */
function adaptive() {
  const t = today(); const end = addDays(t, -1), N = 21;
  const pts = [];
  let inSum = 0, inN = 0, logged = 0;
  for (let i = N - 1; i >= 0; i--) {
    const d = addDays(end, -i);
    const w = eff(d).w; if (w && !isMomFri(addDays(d, -1))) pts.push({ x: N - 1 - i, w });
    const it = intake(d); inSum += it.kcal; inN++; if (it.logged) logged++;
  }
  if (pts.length < 8 || pts[pts.length - 1].x - pts[0].x < 10) return null;
  const mx = pts.reduce((a, p) => a + p.x, 0) / pts.length, my = pts.reduce((a, p) => a + p.w, 0) / pts.length;
  const slope = pts.reduce((a, p) => a + (p.x - mx) * (p.w - my), 0) / pts.reduce((a, p) => a + (p.x - mx) ** 2, 0); // كجم/يوم
  const intakeAvg = inSum / inN;
  const tdee = Math.round(intakeAvg - slope * 7700);
  const w = my; const goalDaily = 0.007 * w * 7700 / 7; // 0.7% في الأسبوع
  const ideal = Math.round(tdee - goalDaily);
  let delta = ideal - S.settings.kcal;
  delta = Math.max(-150, Math.min(150, Math.round(delta / 10) * 10));
  return { tdee, slopeWk: slope * 7, intakeAvg: Math.round(intakeAvg), logged, days: inN, ideal, delta: Math.abs(delta) < 70 ? 0 : delta, conf: logged >= 14 ? 'عالية' : logged >= 7 ? 'متوسطة' : 'ضعيفة' };
}
function applyAdaptive(delta) {
  S.settings.kcal = Math.round(S.settings.kcal + delta);
  S.settings.riceAdj = riceAdj() + Math.round(delta / 1.3);   // التعديل كله في رز العشا
  S.settings.lastAdapt = today();
  save(); render(); toast(delta > 0 ? `زوّدت ${Math.round(delta / 1.3)} جم رز في العشا ✓` : `قلّلت ${Math.round(-delta / 1.3)} جم رز من العشا ✓`);
}

/* ================= البرنامج ================= */
const DAYS = PROGRAM.days;
const dayByKey = k => DAYS.find(d => d.key === k);
function weekOf(dateStr) { return Math.floor(diffDays(dateStr, S.settings.start) / 7) + 1; }
function curWeek() { return Math.min(Math.max(weekOf(today()), 1), S.settings.weeks); }
function todaysDay() { const dow = new Date().getDay(); return DAYS.find(d => d.dow === dow) || null; }
function nextDay() {
  const dow = new Date().getDay();
  for (let i = 0; i < 7; i++) { const d = DAYS.find(x => x.dow === (dow + i) % 7); if (d) return d; }
  return DAYS[0];
}
const sessKey = (w, k) => `${w}-${k}`;
/* التمرين بعد التبديل */
function resolve(ex) {
  const i = S.swaps[ex.id] || 0;
  if (!i || !ex.alts[i - 1]) return Object.assign({}, ex, { swapIdx: 0, lk: ex.id });
  const a = ex.alts[i - 1];
  return Object.assign({}, ex, { name: a.name, en: a.en, img: a.img, swapIdx: i, lk: ex.id + '@' + i, baseName: ex.name });
}
const exList = k => PROGRAM.ex[k].map(resolve);
const unitOf = ex => ex.unit || 'reps';
const isTimed = ex => unitOf(ex) !== 'reps';
const repsTxt = ex => ex.reps[0] === ex.reps[1] ? `${ex.reps[0]}` : `${ex.reps[0]}–${ex.reps[1]}`;
const unitTxt = ex => ({ reps: 'عدات', sec: 'ثانية', min: 'دقيقة' }[unitOf(ex)]);
const restTxt = s => s >= 60 ? `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}` : `00:${pad2(s)}`;
const PAIN_IDS = new Set(['ropeHammer', 'legPress', 'legPress2', 'wallSit', 'legExt', 'legExt2', 'incDb', 'incMachine']);

/* كل مجموعات تمرين معيّن عبر كل الجلسات */
function history(lk) {
  const out = [];
  for (const [key, s] of Object.entries(S.logs)) {
    (s.ex[lk] || []).forEach((set, i) => out.push(Object.assign({ key, date: s.date, i }, set)));
  }
  return out.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.i - b.i);
}
function lastSession(lk, exceptKey) {
  const byKey = {};
  for (const [key, s] of Object.entries(S.logs)) if (key !== exceptKey && s.ex[lk] && s.ex[lk].length) byKey[key] = s;
  const keys = Object.keys(byKey).sort((a, b) => byKey[b].date.localeCompare(byKey[a].date));
  return keys.length ? { date: byKey[keys[0]].date, sets: byKey[keys[0]].ex[lk] } : null;
}
/* الكابتن: الوزن الجاي */
function suggest(ex, curKey) {
  if (isTimed(ex)) return null;
  const warmish = ex.kind === 'warm' || ex.kind === 'rehab';
  const last = lastSession(ex.lk, curKey);
  const [lo, hi] = ex.reps;
  if (!last) return { txt: `أول مرة: اختار وزن تقدر تعمل بيه ${hi} عدة وانت لسه عندك ${ex.rir} عدات احتياطي.`, w: null };
  const top = Math.max(...last.sets.map(s => +s.w || 0));
  const work = last.sets.filter(s => (+s.w || 0) === top);
  const allTop = work.length >= Math.min(ex.sets, last.sets.length) && work.every(s => +s.r >= hi);
  const anyLow = work.some(s => +s.r < lo);
  const tooHard = ex.noFail && last.sets.some(s => +s.rir === 0);
  const inc = ex.inc || 2.5;
  const lastTxt = last.sets.map(s => `${fmt(s.w, 2)}×${s.r}`).join('، ');
  if (tooHard) return { txt: `آخر مرة (${lastTxt}) وصلت للفشل في تمرين فيه إصابة. خليك على <b>${fmt(top, 2)} كجم</b> وسيب عدتين.`, w: top, warn: true };
  if (allTop && warmish) return { txt: `آخر مرة: ${lastTxt}. ده ${ex.kind === 'rehab' ? 'تأهيل' : 'إحماء'} – زوّد بس لو مفيش أي وجع، وبأصغر وزن (${fmt(top + inc, 2)} كجم).`, w: top };
  if (allTop) return { txt: `آخر مرة: ${lastTxt}. كل المجموعات وصلت ${hi} → زوّد لـ <b>${fmt(top + inc, 2)} كجم</b>.`, w: r1(top + inc), up: true };
  if (anyLow) return { txt: `آخر مرة: ${lastTxt}. فيه مجموعة تحت ${lo} عدات → خليك على <b>${fmt(top, 2)} كجم</b> أو قلّل سنة.`, w: top };
  return { txt: `آخر مرة: ${lastTxt}. نفس الوزن <b>${fmt(top, 2)} كجم</b> وحاول تزوّد عدة في كل مجموعة.`, w: top };
}

/* ================= Health Connect ================= */
const Cap = window.Capacitor;
const native = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
let Health = null;
try { if (native) Health = Cap.registerPlugin ? Cap.registerPlugin('Health') : Cap.Plugins.Health; } catch (e) { Health = null; }
const HC_READ = ['steps', 'totalCalories', 'calories', 'sleep', 'weight', 'bodyFat', 'restingHeartRate'];
let syncing = false;

async function hcConnect() {
  if (!Health) { toast('Health Connect شغال في تطبيق الأندرويد بس'); return false; }
  try {
    const a = await Health.isAvailable();
    if (!a.available) { toast('Health Connect مش متاح: ' + (a.reason || '')); return false; }
    const st = await Health.requestAuthorization({ read: HC_READ });
    S.settings.hcAsked = true; save();
    if (!st.readAuthorized || !st.readAuthorized.length) { toast('مفيش أذونات اتدّت. افتح إعدادات Health Connect وفعّلها.'); return false; }
    await hcSync(true);
    return true;
  } catch (e) { toast('حصلت مشكلة في الربط: ' + (e.message || e)); return false; }
}

const dayOfSample = s => iso(new Date(new Date(s).getTime() + 0));
async function aggByDay(type, from, to) {
  const out = {};
  try {
    const r = await Health.queryAggregated({ dataType: type, startDate: from.toISOString(), endDate: to.toISOString(), bucket: 'day', aggregation: 'sum' });
    for (const b of r.samples || []) {
      const d = iso(new Date(new Date(b.startDate).getTime() + 6 * 36e5)); // +6 ساعات عشان فرق التوقيت الصيفي
      const v = b.value ?? (b.values && b.values.sum);
      if (v != null) out[d] = v;
    }
  } catch (e) { /* النوع مش مسموح أو مفيش بيانات */ }
  return out;
}
async function samples(type, from, to) {
  try { const r = await Health.readSamples({ dataType: type, startDate: from.toISOString(), endDate: to.toISOString(), limit: 500, ascending: true }); return r.samples || []; }
  catch (e) { return []; }
}
async function hcSync(loud) {
  if (!Health || syncing) return;
  syncing = true; renderSyncLine();
  try {
    const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0);
    const [steps, total, active] = await Promise.all([aggByDay('steps', from, to), aggByDay('totalCalories', from, to), aggByDay('calories', from, to)]);
    const [ws, fats, rhrs, sleeps] = await Promise.all([samples('weight', from, to), samples('bodyFat', from, to), samples('restingHeartRate', from, to), samples('sleep', from, to)]);
    const H = S.health;
    const put = (d, k, v) => { (H[d] = H[d] || {})[k] = v; };
    for (const [d, v] of Object.entries(steps)) put(d, 'steps', Math.round(v));
    for (const [d, v] of Object.entries(total)) put(d, 'kcal', Math.round(v));
    for (const [d, v] of Object.entries(active)) put(d, 'active', Math.round(v));
    for (const s of ws) put(dayOfSample(s.startDate), 'weight', r1(s.value));
    for (const s of fats) put(dayOfSample(s.startDate), 'fat', r1(s.value));
    for (const s of rhrs) put(dayOfSample(s.startDate), 'rhr', Math.round(s.value));
    const sl = {};
    for (const s of sleeps) {
      if (s.sleepState === 'awake' || s.sleepState === 'inBed') continue;
      const d = dayOfSample(s.endDate);
      let min = 0;
      if (s.stages && s.stages.length) min = s.stages.filter(x => x.stage !== 'awake' && x.stage !== 'inBed').reduce((a, x) => a + (x.durationMinutes || 0), 0);
      if (!min) min = (new Date(s.endDate) - new Date(s.startDate)) / 6e4;
      sl[d] = (sl[d] || 0) + min;
    }
    for (const [d, v] of Object.entries(sl)) put(d, 'sleepMin', Math.round(v));
    S.settings.lastSync = new Date().toISOString(); save();
    if (loud) toast('اتحدّثت البيانات من Health Connect ✓');
  } catch (e) { if (loud) toast('المزامنة وقفت: ' + (e.message || e)); }
  syncing = false;
  if (!$('#player').hidden) return;
  render();
}

/* ================= ساعة Zepp Active (قراءة الشاشة) ================= */
let Zepp = null;
try { if (native) Zepp = Cap.registerPlugin ? Cap.registerPlugin('ZeppBridge') : Cap.Plugins.ZeppBridge; } catch (e) { Zepp = null; }
let zeppState = { enabled: false, installed: false, lastRead: 0, raw: '' };
async function zeppPull() {
  if (!Zepp) return false;
  try {
    const r = await Zepp.getData();
    zeppState = { enabled: !!r.enabled, installed: !!r.installed, lastRead: r.lastRead || 0, raw: r.raw || '', auto: r.auto !== false, okokRead: r.okokRead || 0, okokRaw: r.okokRaw || '' };
    const ok = JSON.parse(r.okok || '{}');
    for (const [d, v] of Object.entries(ok)) {
      if (v.weight) (S.health[d] = S.health[d] || {}).oweight = v.weight;
      const b = (S.body[d] = S.body[d] || {});
      for (const k of ['fat', 'fatKg', 'skm', 'skmKg', 'muscle', 'muscleKg', 'water', 'waterKg', 'visceral', 'bone', 'bmr', 'protein', 'lean', 'bmi', 'metaAge']) if (v[k] != null) b[k] = v[k];
      if (v.weight) b.weight = v.weight;
      b.src = 'okok';
    }
    const data = JSON.parse(r.data || '{}');
    for (const [d, v] of Object.entries(data)) {
      if (d === 'workouts') continue;
      const h = (S.health[d] = S.health[d] || {});
      if (v.steps != null) h.zsteps = v.steps;
      if (v.active != null) h.zactive = v.active;
      if (v.sleepMin != null) h.zsleep = v.sleepMin;
      if (v.hr != null) h.zhr = v.hr;
    }
    for (const [d, w] of Object.entries(data.workouts || {})) { const h = (S.health[d] = S.health[d] || {}); h.wkcal = w.kcal; h.wmin = w.min; }
    save(); return true;
  } catch (e) { return false; }
}
async function zeppFetch() {
  if (!Zepp) { toast('ده شغال في تطبيق الأندرويد بس'); return; }
  await zeppPull();
  if (!zeppState.installed) { toast('Zepp Active مش متسطّب على الموبايل'); return; }
  if (!zeppState.enabled) { zeppSetupSheet(); return; }
  try { await Zepp.fetchNow(); } catch (e) { toast(e.message || 'مقدرتش أفتح Zepp Active'); }
}
function zeppSetupSheet() {
  openSheet(sheetHead('قراءة الساعة أوتوماتيك', 'إعداد مرة واحدة – دقيقة') + `
    <p style="line-height:1.8">كوتش الجيم بيقرا الخطوات والسعرات والنوم من Zepp Active، والوزن وتحليل الجسم من OKOK وانت بتتوزن (افتح شاشة <b>التفاصيل</b> بعد الوزن). الخدمة مقفولة على التطبيقين دول بس.</p>
    <div class="note"><span class="i">1</span><span>اضغط الزرار ده ← هتفتح صفحة معلومات التطبيق ← اضغط <b>⋮</b> فوق ← <b>السماح بالإعدادات المقيدة</b> (Allow restricted settings). لو مش ظاهرة، كمّل للخطوة 2 الأول.</span></div>
    <button class="btn ghost block mt sm" id="z1">افتح معلومات التطبيق</button>
    <div class="note mt"><span class="i">2</span><span>اضغط الزرار ده ← <b>التطبيقات المثبتة</b> (Downloaded apps) ← <b>كوتش الجيم – قراءة الساعة</b> ← شغّلها ← وافق.</span></div>
    <button class="btn ghost block mt sm" id="z2">افتح إمكانية الوصول</button>
    <div class="note mt"><span class="i">3</span><span>ارجع هنا واضغط <b>جرّب دلوقتي</b>. هيفتح Zepp Active ويرجعك لوحده.</span></div>
    <button class="btn red block mt" id="z3">جرّب دلوقتي</button>
    <div class="section-t">أوتوماتيك كل يوم</div>
    <p style="line-height:1.8;margin:0">أول ما تفتح قفل الموبايل <b>الصبح</b> (من 5 لـ 12) بيجيب نوم الليلة، وأول ما تفتحه <b>بالليل</b> (بعد 9) بيجيب خطوات وسعرات اليوم كاملة. Zepp Active هيظهر 3–5 ثواني ويقفل لوحده ويرجعك للي كنت فيه.</p>
    <button class="btn ${zeppState.auto ? 'ghost' : 'red'} block mt sm" id="z5">${zeppState.auto ? '✓ الأوتوماتيك شغال – اضغط تقفله' : 'شغّل الأوتوماتيك'}</button>
    <p class="muted small mt">حالة الخدمة: ${zeppState.enabled ? '✓ شغالة' : '✗ مش شغالة لسه'}${zeppState.lastRead ? ` · آخر قراءة ${new Date(zeppState.lastRead).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: '2-digit' })}` : ''}</p>
    ${zeppState.okokRead ? `<p class="muted small">آخر قراءة للميزان: ${new Date(zeppState.okokRead).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</p>` : ''}
    ${zeppState.raw || zeppState.okokRaw ? '<button class="btn ghost block sm" id="z4">انسخ اللي اتقرا (لو الأرقام غلط ابعتهولي)</button>' : ''}`, p => {
    $('#z1', p).onclick = () => Zepp && Zepp.openAppInfo();
    $('#z2', p).onclick = () => Zepp && Zepp.openSettings();
    $('#z3', p).onclick = async () => { await zeppPull(); if (!zeppState.enabled) { toast('الخدمة لسه مش شغالة – اعمل خطوة 2'); return; } closeSheet(); zeppFetch(); };
    const z4 = $('#z4', p); if (z4) z4.onclick = () => copyText('ZEPP:\n' + zeppState.raw + '\n\nOKOK:\n' + zeppState.okokRaw);
    $('#z5', p).onclick = async () => { try { await Zepp.setAuto({ enabled: !zeppState.auto }); } catch (e) { } await zeppPull(); closeSheet(); zeppSetupSheet(); };
  });
}

/* ================= الإشعارات ================= */
let LN = null;
try { if (native) LN = Cap.registerPlugin ? Cap.registerPlugin('LocalNotifications') : Cap.Plugins.LocalNotifications; } catch (e) { LN = null; }
const REST_ID = 9001;
function at(d, hh, mm) { const x = parseISO(d); x.setHours(hh, mm, 0, 0); return x; }
/* بنجدول 14 يوم قدام بمواعيد حقيقية، وبنعيدها كل ما التطبيق يتفتح – عشان أيام المحاضرة وجمعة ماما */
async function scheduleReminders() {
  if (!LN) return;
  try {
    const pend = await LN.getPending();
    const old = (pend.notifications || []).filter(n => n.id >= 1000 && n.id < 9000).map(n => ({ id: n.id }));
    if (old.length) await LN.cancel({ notifications: old });
    if (!S.settings.notif) return;
    const perm = await LN.checkPermissions(); if (perm.display !== 'granted') return;
    const list = []; const now = Date.now();
    for (let i = 0; i < 14; i++) {
      const d = addDays(today(), i), dow = parseISO(d).getDay(), dt = dayType(d);
      const tr = DAYS.find(x => x.dow === dow);
      const add = (k, when, title, body) => { if (when.getTime() > now + 30000) list.push({ id: 1000 + i * 20 + k, title, body, schedule: { at: when, allowWhileIdle: true }, isExactNotification: false }); };
      const prevMom = isMomFri(addDays(d, -1));
      add(1, at(d, 6, 40), 'اتوزن ⚖️', prevMom ? 'بعد جمعة ماما الوزن هيعلى 1–2 كجم مية – عادي، اتوزن برضه.' : 'بعد الحمام وقبل الأكل، وافتح التفاصيل في OKOK.');
      add(2, at(d, 9, 10), 'كرياتين 💊', '5 جم مع الفطار.');
      if (dow !== 5) add(3, at(d, 15, 50), 'وجبة الشغل 🍠', 'البطاطا والزبادي والشيكولاتة – ده وقود التمرين.');
      if (dt === 'lecture') add(4, at(d, 16, 0), 'النهارده محاضرة 🎓', 'العشا: العلبة من البيت، أو الطبق الذكي (نص رز، من غير طرب)، أو السوري بملعقة توم واحدة.');
      if (tr) add(5, at(d, 18, 45), `تمرين النهارده: ${tr.title} 💪`, tr.sub);
      if (dt === 'mom') add(6, at(d, 12, 0), 'جمعة ماما 😄', 'البروتين الأول، طبق واحد مليان، حتة حلو واحدة. ومتصومش بكرة.');
      if (dow === 5) add(7, at(d, 20, 0), 'تقرير الأسبوع 📋', 'افتح التقدّم واضغط "تقرير الأسبوع للكابتن" وابعته.');
      const next = parseISO(addDays(d, 1)).getDay();
      if (next !== 5) add(8, at(d, 22, 0), 'جهّز علب بكرة 🍱', isLecture(addDays(d, 1)) ? 'بكرة محاضرة – جهّز علبة العشا كمان لو تقدر.' : 'الفطار + البطاطا المشوية.');
      add(9, at(d, 23, 15), 'نوم 😴', 'عشان 7–8 ساعات. وافتح Zepp Active مرة قبل ما تنام عشان خطوات النهارده تتسجل.');
    }
    if (list.length) await LN.schedule({ notifications: list });
  } catch (e) { }
}
async function restNotify(untilMs, body) {
  if (!LN || !S.settings.notif) return;
  try { await LN.cancel({ notifications: [{ id: REST_ID }] }); await LN.schedule({ notifications: [{ id: REST_ID, title: 'خلصت الراحة 💪', body, schedule: { at: new Date(untilMs), allowWhileIdle: true }, isExactNotification: true }] }); } catch (e) { }
}
async function restCancel() { if (!LN) return; try { await LN.cancel({ notifications: [{ id: REST_ID }] }); } catch (e) { } }
/* ================= استيراد The Gain Universe ================= */
const gainLk = name => GAIN_MAP[name.trim().toLowerCase().replace(/\s+/g, ' ')] || ('gain:' + name.trim());
async function gainSheet() {
  if (!Zepp) { toast('شغال في تطبيق الأندرويد بس'); return; }
  let g = {}; try { g = await Zepp.getGain(); } catch (e) { }
  await zeppPull();
  let data = {}; try { data = JSON.parse(g.data || '{}'); } catch (e) { }
  const dates = Object.keys(data).sort();
  const nSets = dates.reduce((a, d) => a + Object.values(data[d]).reduce((x, arr) => x + arr.length, 0), 0);
  const names = [...new Set(dates.flatMap(d => Object.keys(data[d])))];
  const mapped = names.filter(n => !gainLk(n).startsWith('gain:'));
  const st = { waiting: 'مستني تفتح سجل الأوزان', running: 'شغال…', done: '✓ خلص', timeout: 'وقف (الوقت خلص)', left: 'وقف (خرجت من التطبيق)', month: 'وقف عند تغيير الشهر', strip: 'وقف (مش لاقي اليوم في الشريط)' }[g.status] || '';
  openSheet(sheetHead('استيراد من The Gain Universe', 'سجل التمارين القديم') + `
    ${!zeppState.enabled ? '<div class="note warn"><span class="i">!</span><span>خدمة "كوتش الجيم – قراءة الساعة" لازم تبقى شغالة الأول.</span></div>' : ''}
    <div class="note mt"><span class="i">1</span><span>اضغط <b>ابدأ</b> ← هيفتح The Gain Universe.</span></div>
    <div class="note mt"><span class="i">2</span><span>ادخل <b>☰ ← سجل الأوزان</b> وسيب الموبايل. التطبيق هيفتح كل تمرين ويقرا، ويرجع يوم يوم لورا لوحده. ممكن ياخد كام دقيقة.</span></div>
    <div class="note mt"><span class="i">3</span><span>هيرجعك هنا لما يخلص. اضغط <b>استورد</b>.</span></div>
    <label class="field"><span>ارجع لحد تاريخ (اختياري)</span><input id="gE" class="inp num" type="date" value=""></label>
    <button class="btn red block mt" id="gGo">ابدأ</button>
    ${dates.length ? `<div class="section-t">اللي اتقرا ${st ? '· ' + st : ''}</div>
      <p style="margin:0;line-height:1.8"><b class="num">${dates.length}</b> يوم · <b class="num">${nSets}</b> مجموعة · من ${dates[0]} لـ ${dates[dates.length - 1]}<br>${mapped.length} تمرين متربط بالبرنامج · ${names.length - mapped.length} تمرين هيتحفظ في سجل لوحده</p>
      <button class="btn red block mt" id="gImp">استورد ${nSets} مجموعة</button>` : (st ? `<p class="muted small mt">الحالة: ${st}</p>` : '')}
    ${g.raw ? '<button class="btn ghost block mt sm" id="gRaw">انسخ اللي اتقرا من الشاشة (لو فيه مشكلة ابعتهولي)</button>' : ''}
    ${dates.length ? '<button class="btn ghost block mt sm" id="gReset">امسح القراية وابدأ من الأول</button>' : ''}`, p => {
    $('#gGo', p).onclick = async () => { if (!zeppState.enabled) { closeSheet(); zeppSetupSheet(); return; } try { await Zepp.startGain({ earliest: $('#gE', p).value || '' }); } catch (e) { toast(e.message || 'مقدرتش أفتحه'); } };
    const gi = $('#gImp', p); if (gi) gi.onclick = () => {
      let n = 0;
      for (const d of dates) {
        const key = 'gain-' + d; const ex = {};
        for (const [name, arr] of Object.entries(data[d])) { ex[gainLk(name)] = arr.map(([w, r]) => ({ w: +w, r: +r, rir: null, src: 'gain', name })); n += arr.length; }
        S.logs[key] = { date: d, legacy: true, src: 'gain', ex };
      }
      S.settings.gainImported = today(); save(); closeSheet(); render(); toast(`اتستورد ${n} مجموعة ✓ – الاقتراحات هتكمّل من آخر أوزانك`);
    };
    const gr = $('#gRaw', p); if (gr) gr.onclick = () => copyText(g.raw);
    const gx = $('#gReset', p); if (gx) gx.onclick = async () => { try { await Zepp.resetGain(); } catch (e) { } closeSheet(); toast('اتمسحت'); };
  });
}
function notifSheet() {
  openSheet(sheetHead('الإشعارات') + `
    <p style="line-height:1.8">الكابتن بيفكّرك: الوزن الصبح، الكرياتين، وجبة الشغل، تمرين النهارده، تجهيز العلب، يوم المحاضرة، جمعة ماما، تقرير الجمعة، والنوم. وعداد الراحة بيرن حتى لو الموبايل مقفول.</p>
    <button class="btn ${S.settings.notif ? 'ghost' : 'red'} block" id="n1">${S.settings.notif ? '✓ الإشعارات شغالة – اضغط تقفلها' : 'شغّل الإشعارات'}</button>
    <button class="btn ghost block mt sm" id="n2">اسمح بالتنبيه في الميعاد بالظبط (لعداد الراحة)</button>
    <p class="muted small mt">لو الإشعارات مش بتوصل: إعدادات الموبايل ← التطبيقات ← كوتش الجيم ← البطارية ← "بدون قيود".</p>`, p => {
    $('#n1', p).onclick = async () => {
      if (!LN) { toast('شغال في تطبيق الأندرويد بس'); return; }
      if (!S.settings.notif) { try { const r = await LN.requestPermissions(); if (r.display !== 'granted') { toast('الإذن اترفض – فعّله من إعدادات التطبيق'); return; } } catch (e) { } }
      S.settings.notif = !S.settings.notif; save(); await scheduleReminders(); closeSheet(); toast(S.settings.notif ? 'اتفعّلت ✓' : 'اتقفلت');
    };
    $('#n2', p).onclick = async () => { try { await LN.changeExactNotificationSetting(); } catch (e) { toast('مش محتاج – متفعّل'); } };
  });
}

/* ================= واجهة عامة ================= */
let tab = 'home';
const view = { week: null, day: null };
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, ms);
}
function openSheet(html, onMount) {
  const sh = $('#sheet');
  sh.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  sh.hidden = false;
  sh.onclick = e => { if (e.target === sh) closeSheet(); };
  sh.querySelectorAll('[data-close]').forEach(b => b.onclick = closeSheet);
  onMount && onMount(sh.firstElementChild);
}
function closeSheet() { const sh = $('#sheet'); sh.hidden = true; sh.innerHTML = ''; }
const sheetHead = (title, kicker) => `<div class="sheet-h"><div>${kicker ? `<small>${kicker}</small>` : ''}<h2>${title}</h2></div><button class="close" data-close aria-label="قفل">${ICON.x}</button></div>`;

async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); toast('اتنسخ ✓ – الصقه في الشات مع الكابتن'); return; } catch (e) { }
  openSheet(sheetHead('انسخ النص') + `<p class="muted small">النسخ التلقائي مش شغال – اضغط مطوّل على النص واختار "نسخ".</p><textarea class="inp" style="height:300px" readonly>${esc(txt)}</textarea>`,
    p => { const ta = $('textarea', p); ta.focus(); ta.select(); });
}

function render() {
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const el = $('#screen'); el.classList.remove('has-cta');
  ({ home: renderHome, workout: renderWorkout, progress: renderProgress, food: renderFood, menu: renderMenu })[tab](el);
}
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => { tab = b.dataset.tab; if (tab === 'food') view.food = null; window.scrollTo(0, 0); render(); });

function renderSyncLine() {
  const zl = $('#zeppline');
  if (zl && native) {
    const lr = zeppState.lastRead; const m = lr ? Math.round((Date.now() - lr) / 6e4) : null;
    zl.innerHTML = zeppState.enabled
      ? `<span class="dot ${m != null && m < 180 ? 'ok' : ''}"></span><span>الساعة: ${m == null ? 'لسه مفيش قراءة' : m < 1 ? 'اتقرت دلوقتي' : m < 60 ? `اتقرت من ${m} دقيقة` : `اتقرت من ${Math.round(m / 60)} ساعة`}</span><button id="zGo">هات أرقام الساعة</button>`
      : `<span class="dot bad"></span><span>الساعة مش مربوطة</span><button id="zGo">اربطها</button>`;
    $('#zGo').onclick = zeppFetch;
  }
  const el = $('#syncline'); if (!el) return;
  if (!native) { el.innerHTML = `<span class="dot"></span><span>Health Connect بيشتغل في تطبيق الأندرويد</span>`; return; }
  if (syncing) { el.innerHTML = `<span class="dot"></span><span>بيحدّث من Health Connect…</span>`; return; }
  const ls = S.settings.lastSync;
  if (!ls) { el.innerHTML = `<span class="dot bad"></span><span>Health Connect مش مربوط لسه</span><button id="hcGo">اربط دلوقتي</button>`; $('#hcGo').onclick = hcConnect; return; }
  const m = Math.round((Date.now() - new Date(ls)) / 6e4);
  el.innerHTML = `<span class="dot ok"></span><span>آخر تحديث ${m < 1 ? 'دلوقتي' : m < 60 ? `من ${m} دقيقة` : `من ${Math.round(m / 60)} ساعة`}</span><button id="hcGo">حدّث</button>`;
  $('#hcGo').onclick = () => hcSync(true);
}

/* ================= الكابتن: حكم الأسبوع ================= */
function avgWeight(endDate, n = 7) {
  const vals = [];
  for (let i = 0; i < n; i++) { const d = addDays(endDate, -i); const w = eff(d).w; if (w && !isMomFri(addDays(d, -1))) vals.push(w); }
  return vals.length >= 3 ? { avg: vals.reduce((a, b) => a + b) / vals.length, n: vals.length } : null;
}
function avgOf(key, endDate, n = 7) {
  const vals = [];
  for (let i = 0; i < n; i++) { const v = eff(addDays(endDate, -i))[key]; if (v != null && v > 0) vals.push(v); }
  return vals.length ? vals.reduce((a, b) => a + b) / vals.length : null;
}
function verdict() {
  const t = today();
  const now = avgWeight(t), prev = avgWeight(addDays(t, -7)), prev2 = avgWeight(addDays(t, -14));
  const st = avgOf('steps', t);
  const stepsLine = st != null && st < S.settings.steps * 0.75 ? ` متوسط خطواتك ${fmt(st)} – ارفعها لـ ${fmt(S.settings.steps)} قبل ما نقلّل أكل.` : '';
  if (!now || !prev) return { cls: 'info', t: 'الكابتن محتاج أرقام', d: `اتوزن كل يوم الصبح بعد الحمام. بعد أسبوعين وزن هقولك إنت ماشي صح ولا لأ (محتاج 3 قراءات على الأقل في كل أسبوع).${stepsLine}` };
  const rate = prev.avg - now.avg;
  const pct = rate / prev.avg * 100;
  const base = `متوسط الأسبوع ${fmt(now.avg, 1)} كجم – ${rate >= 0 ? 'نزلت' : 'زدت'} ${fmt(Math.abs(rate), 2)} كجم (${fmt(Math.abs(pct), 1)}%) عن الأسبوع اللي فات.`;
  if (rate > 0.9) return { cls: 'warn', t: 'نازل أسرع من اللازم', d: `${base} ده ممكن ياكل من العضل. زوّد 30–40 جم رز في العشا.` };
  if (rate >= 0.35) return { cls: 'ok', t: 'ماشي صح 👌', d: `${base} كمّل زي ما انت.${stepsLine}` };
  if (prev2 && prev2.avg - now.avg < 0.3) return { cls: 'warn', t: 'الوزن واقف أسبوعين', d: `${base} قلّل 150 سعر: نص زيت العشا (5 جم) و30 جم رز أقل.${stepsLine}` };
  return { cls: 'info', t: 'بطيء – استنى أسبوع كمان', d: `${base} أسبوع واحد مش كفاية نحكم. الأهم الالتزام بالأكل والخطوات.${stepsLine}` };
}

/* ================= الرئيسية ================= */
function renderHome(el) {
  const t = today(), e = eff(t), set = S.settings, w = curWeek();
  const yd = addDays(t, -1), ey = eff(yd), my = S.days[yd] || {};
  const needMorning = !(S.days[t] || {}).w || (!zeppState.enabled && my.active == null && my.kcal == null);
  const tdDay = todaysDay(), nd = nextDay();
  const sess = tdDay ? S.logs[sessKey(w, tdDay.key)] : null;
  const doneCount = sess ? Object.values(sess.ex).filter(x => x.length).length : 0;
  const lastW = (() => { for (let i = 0; i < 30; i++) { const x = eff(addDays(t, -i)).w; if (x) return { w: x, d: addDays(t, -i) }; } return null; })();
  const v = verdict();
  const mealsEaten = Object.values((S.days[t] || {}).meals || {}).filter(Boolean).length;
  const stepPct = e.steps ? Math.min(100, e.steps / set.steps * 100) : 0;
  const daysIn = diffDays(t, set.start);
  el.innerHTML = `
  <div class="hello"><small>${nice(t)} · ${daysIn < 0 ? `البرنامج يبدأ بعد ${-daysIn} يوم` : `الأسبوع ${w} من ${set.weeks}`}</small><h1>أهلاً ${esc(set.name)} 👋</h1></div>
  <div class="sync" id="zeppline"></div>
  <div class="sync" id="syncline"></div>
  ${needMorning ? `<button class="verdict warn" style="display:block;width:100%;text-align:start;margin-top:12px" id="morning"><h3>تسجيل الصبح ⏱ 20 ثانية</h3><p>${zeppState.enabled ? 'الوزن بس – أرقام الساعة بتتقرا لوحدها.' : 'الوزن + خطوات وسعرات ونوم امبارح من الساعة.'}</p></button>` : ''}
  <div class="tiles mt">
    <div class="tile"><small>الخطوات</small><b class="num">${fmt(e.steps)}</b><div class="sub">${ey.steps ? `امبارح ${fmt(ey.steps)}` : `الهدف ${fmt(set.steps)}`}</div><div class="bar ${stepPct >= 100 ? 'ok' : ''}"><i style="width:${stepPct}%"></i></div></div>
    <div class="tile"><small>الحرق امبارح (تقديري)</small><b class="num">${fmt(ey.kcal)}</b><div class="sub">${ey.kcal ? `نشاط ${fmt(ey.active)} + راحة ${fmt(bmr(yd))} · عجز ~${fmt(ey.kcal - set.kcal)}` : 'من ساعة Zepp Active'}</div></div>
    <div class="tile"><small>نوم امبارح بالليل</small><b class="num">${e.sleep ? `${Math.floor(e.sleep / 60)}:${pad2(e.sleep % 60)}` : '—'}</b><div class="sub">الهدف 7–8 ساعات</div></div>
    <div class="tile" role="button" id="tW"><small>الوزن</small><b class="num">${lastW ? fmt(lastW.w, 1) : '—'}</b><div class="sub">${lastW ? (lastW.d === t ? 'النهارده' : short(lastW.d)) : 'اضغط وسجّل'}</div></div>
  </div>
  <div class="section-t">تمرين النهارده</div>
  ${tdDay ? `<div class="today"><div style="flex:1"><small>${tdDay.label} · يوم ${DAYS.indexOf(tdDay) + 1}</small><h3>${tdDay.title}</h3><p>${tdDay.sub}${doneCount ? ` · خلصت ${doneCount} تمرين` : ''}</p></div><button class="btn red" id="goW">${doneCount ? 'كمّل' : 'ابدأ'} ${ICON.arrowL}</button></div>`
      : `<div class="today"><div style="flex:1"><small>يوم راحة</small><h3>REST</h3><p>الجاي: ${nd.label} – ${nd.title}. امشي ${fmt(set.steps)} خطوة.</p></div></div>`}
  <div class="section-t">النهارده</div>
  <div class="checks">
    <button class="check ${e.creatine ? 'on' : ''}" id="cCr">كرياتين<b>${e.creatine ? '✓ 5 جم' : '5 جم'}</b></button>
    <button class="check ${e.water >= set.water ? 'on' : ''}" id="cWa">مية<b class="num">${fmt(e.water, 2)} / ${set.water}</b></button>
    <button class="check ${mealsEaten === 3 ? 'on' : ''}" id="cMe">الوجبات<b class="num">${mealsEaten} / 3</b></button>
  </div>
  <div class="section-t">رأي الكابتن</div>
  <div class="verdict ${v.cls}"><h3>${v.t}</h3><p>${v.d}</p></div>
  <button class="btn ghost block mt" id="qLog">تسجيل الصبح / ملاحظة</button>`;
  renderSyncLine();
  $('#tW').onclick = $('#qLog').onclick = () => dayEntrySheet(t);
  const mo = $('#morning'); if (mo) mo.onclick = () => dayEntrySheet(t);
  $('#cCr').onclick = () => { day(t).creatine = !day(t).creatine; save(); render(); };
  $('#cWa').onclick = () => { const d = day(t); d.water = r1(((d.water || 0) + 0.25) > set.water + 1 ? 0 : (d.water || 0) + 0.25); save(); render(); };
  $('#cMe').onclick = () => { tab = 'food'; render(); };
  const g = $('#goW'); if (g) g.onclick = () => { view.week = w; view.day = tdDay.key; startPlayer(w, tdDay.key); };
}

function dayEntrySheet(d) {
  const m = S.days[d] || {}, h = S.health[d] || {};
  const y = addDays(d, -1), my = S.days[y] || {}, hy = S.health[y] || {};
  openSheet(sheetHead(nice(d), 'تسجيل الصبح – 20 ثانية') + `
    <label class="field"><span>الوزن الصبح بعد الحمام (كجم)${h.weight ? ` – الميزان قال ${h.weight}` : ''}</span><input id="fW" class="inp num" inputmode="decimal" value="${m.w ?? ''}" placeholder="${h.weight ?? ''}"></label>
    <div class="section-t" style="margin-top:18px">من ساعة Zepp Active – يوم امبارح (${short(y)})</div>
    <div class="grid3">
      <label class="field" style="margin-top:0"><span>الخطوات</span><input id="fS" class="inp num" inputmode="numeric" value="${my.steps ?? ''}" placeholder="${hy.steps ?? ''}"></label>
      <label class="field" style="margin-top:0"><span>السعرات (النشاط)</span><input id="fK" class="inp num" inputmode="numeric" value="${my.active ?? ''}" placeholder="${hy.zactive ?? ''}"></label>
      <label class="field" style="margin-top:0"><span>نوم الليلة (ساعات)</span><input id="fL" class="inp num" inputmode="decimal" value="${m.sleepMin ? r1(m.sleepMin / 60) : ''}" placeholder="${h.zsleep ? r1(h.zsleep / 60) : '7.5'}"></label>
    </div>
    <p class="muted small">${zeppState.enabled ? 'الأرقام دي بتتقرا لوحدها من الساعة – اكتب بس لو عايز تصحّح.' : 'من شاشة "صحة" في Zepp Active. السعرات هناك = النشاط بس، والتطبيق بيزوّد حرق الراحة لوحده.'}</p>
    <label class="field"><span>ملاحظة (وجع، نوم وحش، أكل برة…)</span><textarea id="fN" class="inp">${esc(m.note || '')}</textarea></label>
    <button class="btn red block mt" id="fSave">حفظ</button>`, p => {
    $('#fSave', p).onclick = () => {
      const num = id => { const v = parseFloat($(id, p).value.replace(',', '.')); return isNaN(v) ? null : v; };
      const x = day(d), xy = day(y);
      const w = num('#fW'); if (w && w > 30 && w < 250) x.w = w; else delete x.w;
      const st = num('#fS'); if (st != null && st >= 0) xy.steps = Math.round(st); else delete xy.steps;
      const k = num('#fK'); if (k != null && k >= 0) { xy.active = Math.round(k); delete xy.kcal; } else delete xy.active;
      const l = num('#fL'); if (l != null && l > 0 && l < 16) x.sleepMin = Math.round(l * 60); else delete x.sleepMin;
      x.note = $('#fN', p).value.trim() || undefined; save(); closeSheet(); render(); toast('اتسجّل ✓');
    };
  });
}

/* ================= التمرين (البرنامج) ================= */
function renderWorkout(el) {
  if (view.week == null) view.week = curWeek();
  if (!view.day) view.day = (todaysDay() || nextDay()).key;
  const w = view.week, dk = view.day, d = dayByKey(dk), list = exList(dk);
  const sess = S.logs[sessKey(w, dk)];
  const deload = false;
  // تجميع السوبر سِت
  const groups = []; list.forEach(ex => { const g = groups[groups.length - 1]; if (ex.ss && g && g[0].ss === ex.ss) g.push(ex); else groups.push([ex]); });
  const exHtml = (ex, n) => {
    const logged = sess && sess.ex[ex.lk] ? sess.ex[ex.lk].length : 0;
    return `<div class="ex">
      ${n ? `<div class="pair-n">${n}</div>` : ''}
      <button class="thumb ${n ? 'sm' : ''}" data-info="${ex.id}" aria-label="شوف الحركة">${ex.img ? `<img src="media/${ex.img}/0.jpg" alt="" loading="lazy">` : `<div class="noimg">${esc(ex.en)}</div>`}<span class="play"></span></button>
      <div class="ex-body">
        <div class="ex-head"><div class="ex-name">${esc(ex.name)}<span class="ex-en">${esc(ex.en)}</span></div>
          <button class="sq black" data-log="${ex.id}" aria-label="سجّل">${ICON.plus}</button>
          ${ex.alts.length ? `<button class="sq red" data-swap="${ex.id}" aria-label="بدّل">${ICON.swap}</button>` : ''}</div>
        <div class="chips">
          <span class="chip">مجموعة<b class="num">${ex.sets}</b></span>
          <span class="chip">${unitTxt(ex)}<b class="num">${repsTxt(ex)}</b></span>
          ${ex.rir !== '—' ? `<span class="chip ${ex.noFail || ex.pain ? 'red' : ''}">RIR<b class="num">${ex.rir}</b></span>` : ''}
          ${ex.rest ? `<span class="chip">راحة<b class="num">${restTxt(ex.rest)}</b></span>` : ''}
        </div>
        ${logged ? `<div class="logged">✓ سجّلت ${logged} من ${ex.sets}</div>` : ''}
      </div></div>`;
  };
  el.innerHTML = `
  <div class="topbar"><h1>التمارين</h1><button class="iconbtn" id="rulesBtn" aria-label="القواعد">${ICON.info.replace('<svg', '<svg')}</button></div>
  <div class="weekpick">
    <button class="round" id="wPrev" ${w <= 1 ? 'disabled' : ''} aria-label="الأسبوع اللي فات">${ICON.right}</button>
    <div class="lbl"><small>البرنامج</small><b>الأسبوع ${w}</b></div>
    <button class="round" id="wNext" ${w >= S.settings.weeks ? 'disabled' : ''} aria-label="الأسبوع الجاي">${ICON.left}</button>
  </div>
  <div class="days">${DAYS.map((x, i) => { const s = S.logs[sessKey(w, x.key)]; const has = s && Object.values(s.ex).some(a => a.length); return `<button class="day ${x.key === dk ? 'on' : ''}" data-day="${x.key}">${has ? '<span class="done"></span>' : ''}<small>${x.label}</small><b class="num">${i + 1}</b></button>`; }).join('')}</div>
  <div class="daytitle"><h2>${d.title}</h2><span>${list.length} تمارين</span></div>
  <p class="daysub">${d.sub}${d.optional ? ' · ده اليوم اللي يتشال لو الأسبوع مزنوق' : ''}</p>
  ${groups.map(g => `<div class="card">${g.length > 1 ? g.map((ex, i) => exHtml(ex, i + 1)).join('') : exHtml(g[0])}
     ${g.length > 1 ? `<div class="note"><span class="i">i</span><span class="lbl">ملاحظة</span><span>${esc(g[0].kind === 'warm' ? 'إحماء ورا بعض من غير راحة طويلة. ' : '')}${esc(g[0].note)}</span></div>` : `<div class="note"><span class="i">i</span><span class="lbl">ملاحظة</span><span>${esc(g[0].note)}</span></div>`}
   </div>`).join('')}
  <div class="cta-bar"><button class="btn red" id="startBtn">${sess && Object.keys(sess.ex).length ? 'كمّل التمرين' : 'ابدأ التمرين'} ${ICON.arrowL}</button></div>`;
  el.classList.add('has-cta');
  $('#wPrev').onclick = () => { view.week--; render(); };
  $('#wNext').onclick = () => { view.week++; render(); };
  el.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { view.day = b.dataset.day; render(); });
  el.querySelectorAll('[data-info]').forEach(b => b.onclick = () => infoSheet(findEx(dk, b.dataset.info)));
  el.querySelectorAll('[data-swap]').forEach(b => b.onclick = () => swapSheet(dk, b.dataset.swap, render));
  el.querySelectorAll('[data-log]').forEach(b => b.onclick = () => logSheet(w, dk, findEx(dk, b.dataset.log), () => render()));
  $('#startBtn').onclick = () => startPlayer(w, dk);
  $('#rulesBtn').onclick = rulesSheet;
}
const findEx = (dk, id) => exList(dk).find(e => e.id === id);

function infoSheet(ex, dark) {
  const q = encodeURIComponent(ex.en + ' exercise form');
  openSheet(sheetHead(esc(ex.name), esc(ex.en)) + `
    ${ex.img ? `<div class="media" style="border-radius:18px;margin-top:14px"><img src="media/${ex.img}/0.jpg" alt=""><img class="f1" src="media/${ex.img}/1.jpg" alt=""></div>` : ''}
    <div class="chips"><span class="chip">مجموعة<b class="num">${ex.sets}</b></span><span class="chip">${unitTxt(ex)}<b class="num">${repsTxt(ex)}</b></span>${ex.rir !== '—' ? `<span class="chip">RIR<b class="num">${ex.rir}</b></span>` : ''}${ex.rest ? `<span class="chip">راحة<b class="num">${restTxt(ex.rest)}</b></span>` : ''}${ex.fail ? '<span class="chip ok">فشل مسموح آخر مجموعة</span>' : ''}${ex.noFail ? '<span class="chip red">ممنوع الفشل</span>' : ''}</div>
    <p style="line-height:1.8;margin-top:14px">${esc(ex.note)}</p>
    ${ex.baseName ? `<p class="muted small">ده بديل لـ: ${esc(ex.baseName)}</p>` : ''}
    <b>خلّي بالك</b><ul class="cues">${ex.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    <a class="yt" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">▶ فيديو على يوتيوب</a>
    ${ex.img ? `<p class="muted small mt">الصور من free-exercise-db (ملكية عامة).</p>` : ''}`);
}

function swapSheet(dk, id, after) {
  const ex = PROGRAM.ex[dk].find(e => e.id === id); const cur = S.swaps[id] || 0;
  const opt = (name, en, img, i) => `<button class="alt ${cur === i ? 'on' : ''}" data-i="${i}"><span class="thumb sm">${img ? `<img src="media/${img}/0.jpg" alt="">` : `<span class="noimg">${esc(en)}</span>`}</span><span><b>${esc(name)}</b><small>${esc(en)}${i === 0 ? ' · الأساسي' : ''}</small></span></button>`;
  openSheet(sheetHead('تغيير التمرين', esc(ex.name)) + `<p class="muted small">اختار البديل لو الجهاز مشغول أو الحركة بتوجع. سجلّ كل بديل بيتحفظ لوحده.</p>
    ${opt(ex.name, ex.en, ex.img, 0)}${ex.alts.map((a, i) => opt(a.name, a.en, a.img, i + 1)).join('')}`, p => {
    p.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i) S.swaps[id] = i; else delete S.swaps[id]; save(); closeSheet(); after && after(); });
  });
}

function rulesSheet() {
  openSheet(sheetHead('قواعد الكابتن') + RULES.map(r => `<div class="mt"><b>${esc(r.t)}</b><p style="margin:4px 0 0;line-height:1.7" class="muted">${esc(r.d)}</p></div>`).join(''));
}

/* ---------- شيت تسجيل المجموعة ---------- */
function ensureSess(w, dk) {
  const k = sessKey(w, dk);
  if (!S.logs[k]) S.logs[k] = { date: today(), ex: {} };
  return S.logs[k];
}
function logSheet(w, dk, ex, onSaved, editRef) {
  const key = sessKey(w, dk);
  const sess = S.logs[key];
  const cur = sess && sess.ex[ex.lk] ? sess.ex[ex.lk] : [];
  const sug = suggest(ex, key);
  const lastSet = cur[cur.length - 1];
  const timed = isTimed(ex);
  let rir = editRef ? editRef.set.rir : (lastSet ? lastSet.rir : (parseInt(ex.rir) || 2));
  let pain = editRef ? (editRef.set.p ?? null) : null;
  const wv = editRef ? editRef.set.w : (lastSet ? lastSet.w : (sug && sug.w) || '');
  const rv = editRef ? editRef.set.r : '';
  const base = +wv || 10, inc = ex.inc || 2.5;
  const quick = [...new Set([base - 2 * inc, base - inc, base, base + inc, base + 2 * inc].filter(x => x > 0).map(r1))];
  const hist = history(ex.lk);
  const showPain = PAIN_IDS.has(ex.id) || ex.pain;
  openSheet(sheetHead(esc(ex.name), `تسجيل المجموعة ${editRef ? '(تعديل)' : cur.length + 1 + ' من ' + ex.sets} · ${dayByKey(dk).title}`) + `
    ${timed ? `<label class="field"><span>${unitTxt(ex)}</span><input id="lR" class="inp num" inputmode="numeric" value="${rv}" placeholder="${ex.reps[1]}"></label>`
      : `<div class="grid2"><label class="field"><span>الوزن (كجم)</span><input id="lW" class="inp num" inputmode="decimal" value="${wv}" placeholder="0"></label><label class="field"><span>العدات</span><input id="lR" class="inp num" inputmode="numeric" value="${rv}" placeholder="${repsTxt(ex)}"></label></div>
         <div class="quick">${quick.map(q => `<button data-q="${q}"><span class="num">${fmt(q, 2)}</span> كجم</button>`).join('')}</div>`}
    ${ex.rir !== '—' ? `<label class="field"><span>كام عدة كان ممكن تعمل كمان؟ (RIR) – الهدف ${ex.rir}</span></label><div class="rirs">${[0, 1, 2, 3, 4].map(n => `<button data-rir="${n}" class="${+rir === n ? 'on' : ''}">${n}${n === 4 ? '+' : ''}</button>`).join('')}</div>` : ''}
    ${showPain ? `<label class="field"><span>الوجع (0 = مفيش)</span></label><div class="pain">${[0, 1, 2, 3, 4, 6].map(n => `<button data-p="${n}" class="${pain === n ? 'on' : ''} ${n > 3 ? 'hi' : ''}">${n === 6 ? '4+' : n}</button>`).join('')}</div>` : ''}
    ${sug ? `<div class="sugg">🧢 ${sug.txt}</div>` : ''}
    <button class="btn red block mt" id="lSave">${editRef ? 'حفظ التعديل' : 'حفظ المجموعة'}</button>
    <div class="hist"><div class="hist-h"><span>السجل</span><span class="num">${hist.length} سجلات</span></div>
    ${hist.length ? hist.slice(0, 40).map((s, idx) => `<div class="hrow"><span class="d num">${s.date || ''}</span><span class="v">${timed ? `${s.r} ${unitTxt(ex)}` : `<span class="num">${fmt(s.w, 2)}</span> كجم × <span class="num">${s.r}</span>`}<small>RIR ${s.rir ?? '—'}${s.p != null ? ` · وجع ${s.p}` : ''}</small></span><button class="mini" data-ed="${idx}" aria-label="تعديل">${ICON.edit}</button><button class="mini del" data-del="${idx}" aria-label="مسح">${ICON.trash}</button></div>`).join('')
      : '<p class="muted small">لسه مفيش سجل للتمرين ده.</p>'}</div>`, p => {
    p.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { $('#lW', p).value = b.dataset.q; });
    p.querySelectorAll('[data-rir]').forEach(b => b.onclick = () => { rir = +b.dataset.rir; p.querySelectorAll('[data-rir]').forEach(x => x.classList.toggle('on', x === b)); });
    p.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { pain = +b.dataset.p; p.querySelectorAll('[data-p]').forEach(x => x.classList.toggle('on', x === b)); });
    p.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
      const s = hist[+b.dataset.del];
      if (b.dataset.sure) { S.logs[s.key].ex[ex.lk].splice(s.i, 1); save(); closeSheet(); logSheet(w, dk, ex, onSaved); onSaved && onSaved('edit'); }
      else { b.dataset.sure = 1; b.style.background = 'var(--red)'; b.querySelector('svg').style.stroke = '#fff'; toast('اضغط تاني للمسح'); }
    });
    p.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => { const s = hist[+b.dataset.ed]; closeSheet(); logSheet(w, dk, ex, onSaved, { key: s.key, i: s.i, set: S.logs[s.key].ex[ex.lk][s.i] }); });
    $('#lSave', p).onclick = () => {
      const r = parseInt($('#lR', p).value);
      const wEl = $('#lW', p); const wt = wEl ? parseFloat(wEl.value.replace(',', '.')) : 0;
      if (isNaN(r) || r <= 0) { toast(timed ? 'اكتب الوقت' : 'اكتب عدد العدات'); return; }
      if (!timed && (isNaN(wt) || wt < 0)) { toast('اكتب الوزن'); return; }
      const set = { w: timed ? 0 : wt, r, rir: ex.rir === '—' ? null : rir, t: Date.now() };
      if (pain != null) set.p = pain;
      if (editRef) { S.logs[editRef.key].ex[ex.lk][editRef.i] = Object.assign(editRef.set, set); save(); closeSheet(); onSaved && onSaved('edit'); toast('اتعدّل ✓'); return; }
      const s = ensureSess(w, dk); (s.ex[ex.lk] = s.ex[ex.lk] || []).push(set); save(); closeSheet();
      let warn = null;
      if (pain != null && pain > 3) warn = 'pain';
      else if (ex.noFail && rir === 0) warn = 'fail';
      onSaved && onSaved('new', warn);
      if (warn === 'fail') toast('⚠️ ده تمرين فيه إصابة – المرة الجاية سيب عدتين', 3600);
    };
  });
}

/* ================= مشغّل التمرين ================= */
let P = null; let pTimer = null;
function startPlayer(w, dk) {
  const list = exList(dk);
  const sess = S.logs[sessKey(w, dk)];
  let idx = list.findIndex(ex => !sess || !sess.ex[ex.lk] || sess.ex[ex.lk].length < ex.sets);
  if (idx < 0) idx = 0;
  const saved = S.active && S.active.w === w && S.active.dk === dk ? S.active : null;
  P = saved || { w, dk, idx, started: Date.now(), pausedAt: null, pausedMs: 0, rest: null };
  if (!saved) P.idx = idx;
  ensureSess(w, dk).start = ensureSess(w, dk).start || Date.now();
  S.active = P; save();
  $('#player').hidden = false; document.body.style.overflow = 'hidden';
  keepAwake(true);
  drawPlayer();
  clearInterval(pTimer); pTimer = setInterval(tickPlayer, 500);
}
let wakeLock = null;
async function keepAwake(on) {
  try { if (on && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); else if (wakeLock) { await wakeLock.release(); wakeLock = null; } } catch (e) { }
}
function closePlayer() {
  clearInterval(pTimer); P = null; S.active = null; save();
  $('#player').hidden = true; $('#player').innerHTML = ''; document.body.style.overflow = '';
  keepAwake(false); render();
}
const elapsed = () => P ? ((P.pausedAt || Date.now()) - P.started - P.pausedMs) / 1000 : 0;
function tickPlayer() {
  if (!P) return;
  const c = $('#pClock'); if (c) c.textContent = clock(elapsed());
  if (P.rest) {
    const left = (P.rest.until - Date.now()) / 1000;
    const lb = $('#rLeft'), fg = $('#rFg');
    if (lb) lb.textContent = clock(left);
    if (fg) fg.style.strokeDashoffset = String(754 * (1 - Math.max(0, left) / P.rest.total));
    if (left <= 0) { vibrate([300, 120, 300]); endRest(); }
  }
}
function endRest() { restCancel(); if (!P) return; const adv = P.rest && P.rest.advance; P.rest = null; if (adv) P.idx = Math.min(P.idx + 1, exList(P.dk).length - 1); S.active = P; save(); drawPlayer(); }
function drawPlayer() {
  const root = $('#player'); if (!P) return;
  const list = exList(P.dk), ex = list[P.idx], sess = ensureSess(P.w, P.dk);
  const doneSets = (sess.ex[ex.lk] || []).length;
  const allDone = list.every(e => (sess.ex[e.lk] || []).length >= e.sets);
  const segs = list.map((e, i) => `<i class="${i === P.idx ? 'cur' : (sess.ex[e.lk] || []).length >= e.sets ? 'done' : ''}"></i>`).join('');
  const sug = suggest(ex, sessKey(P.w, P.dk));
  if (P.finished) {
    const vol = Object.values(sess.ex).flat().reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0);
    const nSets = Object.values(sess.ex).flat().length;
    root.innerHTML = `<div class="segs">${segs}</div><div class="done-screen"><h2>عاش يا بطل 💪</h2><p>${dayByKey(P.dk).title} · الأسبوع ${P.w}</p>
      <div class="p-stats" style="justify-content:space-around"><div><b class="num">${clock(elapsed())}</b><small>الوقت</small></div><div><b class="num">${nSets}</b><small>مجموعة</small></div><div><b class="num">${fmt(vol)}</b><small>كجم حجم</small></div></div>
      <button class="btn red block mt" id="pEnd">إنهاء</button><button class="btn outline block mt" style="background:transparent;color:#fff;border-color:#fff" id="pBack">رجوع للتمارين</button></div>`;
    $('#pEnd').onclick = () => { sess.end = Date.now(); save(); closePlayer(); toast('اتسجّل التمرين ✓'); };
    $('#pBack').onclick = () => { P.finished = false; drawPlayer(); };
    return;
  }
  const paused = !!P.pausedAt;
  root.innerHTML = `
    <div class="segs">${segs}</div>
    <div class="p-top"><button class="cbtn" id="pPause" aria-label="${paused ? 'كمّل' : 'وقفة'}">${paused ? ICON.play : ICON.pause}</button><span class="clock num" id="pClock">${clock(elapsed())}</span><button class="xbtn" id="pX" aria-label="قفل">${ICON.x}</button></div>
    <div class="stage">
      <div class="media ${paused ? 'paused' : ''}">${ex.img ? `<img src="media/${ex.img}/0.jpg" alt=""><img class="f1" src="media/${ex.img}/1.jpg" alt="">` : `<div class="noimg">${esc(ex.en)}<br><small>مفيش صورة – اضغط معلومات ← يوتيوب</small></div>`}</div>
      <button class="nav-arr prev" id="pPrev" ${P.idx === 0 ? 'disabled' : ''} aria-label="اللي قبله">${ICON.right}</button>
      <button class="nav-arr next" id="pNext" ${P.idx === list.length - 1 ? 'disabled' : ''} aria-label="اللي بعده">${ICON.left}</button>
    </div>
    <div class="p-info"><h2>${esc(ex.name)}</h2><div class="en">${esc(ex.en)}</div>
      <div class="p-stats"><div><b class="num">${ex.sets}</b><small>مجموعة</small></div><div><b class="num">( ${repsTxt(ex)} )</b><small>${unitTxt(ex)}</small></div><div><b class="num">${ex.rir}</b><small>RIR</small></div></div>
      <div class="setdots">${Array.from({ length: ex.sets }, (_, i) => `<i class="${i < doneSets ? 'done' : i === doneSets ? 'cur' : ''}"></i>`).join('')}</div>
      ${sug && (sug.warn || sug.up) ? `<div class="warnline">${sug.txt}</div>` : ''}
      ${ex.pain || ex.noFail ? `<div class="warnline">${ex.pain ? 'تأهيل: الوجع لازم يفضل 3/10 أو أقل.' : 'ممنوع الفشل في التمرين ده – سيب ' + ex.rir + ' عدات.'}</div>` : ''}
    </div>
    <div class="p-actions">
      <button id="pSwap" ${ex.alts.length ? '' : 'disabled style="opacity:.3"'}>${ICON.swap}<span>تغيير</span></button>
      <button id="pLog" class="main">${ICON.kg}<span>${doneSets >= ex.sets ? 'مجموعة زيادة' : 'إضافة وزن'}</span></button>
      <button id="pInfo">${ICON.info}<span>معلومات</span></button>
    </div>
    ${allDone ? '<button class="btn red block" style="margin-top:12px" id="pFinish">خلّصت كل التمارين ✓</button>' : ''}
    ${P.rest ? restHtml(list) : ''}`;
  $('#pX').onclick = () => { if (Object.values(sess.ex).some(a => a.length)) { P.finished = true; drawPlayer(); } else closePlayer(); };
  $('#pPause').onclick = () => { if (P.pausedAt) { P.pausedMs += Date.now() - P.pausedAt; P.pausedAt = null; } else P.pausedAt = Date.now(); save(); drawPlayer(); };
  $('#pPrev').onclick = () => { P.idx--; P.rest = null; save(); drawPlayer(); };
  $('#pNext').onclick = () => { P.idx++; P.rest = null; save(); drawPlayer(); };
  $('#pInfo').onclick = () => infoSheet(ex);
  $('#pSwap').onclick = () => swapSheet(P.dk, ex.id, drawPlayer);
  $('#pLog').onclick = () => logSheet(P.w, P.dk, ex, (kind, warn) => {
    if (kind !== 'new') { drawPlayer(); return; }
    const n = (ensureSess(P.w, P.dk).ex[ex.lk] || []).length;
    if (warn === 'pain') { painStop(ex); return; }
    const lastEx = P.idx === list.length - 1;
    if (n >= ex.sets) {
      if (lastEx) { if (list.every(e => (sess.ex[e.lk] || []).length >= e.sets)) P.finished = true; drawPlayer(); return; }
      const nextEx = list[P.idx + 1];
      const sameSS = ex.ss && nextEx.ss === ex.ss;
      if (ex.rest && !sameSS) startRest(ex.rest, true); else { P.idx++; save(); drawPlayer(); }
    } else if (ex.rest) startRest(ex.rest, false);
    else drawPlayer();
  });
  const f = $('#pFinish'); if (f) f.onclick = () => { P.finished = true; drawPlayer(); };
  if (P.rest) bindRest();
}
function restHtml(list) {
  const nx = P.rest.advance ? list[Math.min(P.idx + 1, list.length - 1)] : list[P.idx];
  return `<div class="rest"><div class="ringwrap"><div class="ring"><svg viewBox="0 0 260 260"><circle class="bg" cx="130" cy="130" r="120"/><circle id="rFg" class="fg" cx="130" cy="130" r="120" stroke-dasharray="754" stroke-dashoffset="0"/></svg>
    <div class="lbl"><small>راحة</small><b class="num" id="rLeft">${clock((P.rest.until - Date.now()) / 1000)}</b><small>ثواني</small></div></div></div>
    <div class="next-up">${P.rest.advance ? 'التمرين الجاي' : 'المجموعة الجاية'}: ${esc(nx.name)}</div>
    <button class="btn red block" id="rPlus">+10 ث</button><button class="btn outline block mt" id="rSkip">تخطّى الراحة</button></div>`;
}
function bindRest() {
  $('#rPlus').onclick = () => { P.rest.until += 10000; P.rest.total += 10; save(); tickPlayer(); restNotify(P.rest.until, 'المجموعة الجاية'); };
  $('#rSkip').onclick = endRest;
  tickPlayer();
}
function startRest(sec, advance) {
  P.rest = { until: Date.now() + sec * 1000, total: sec, advance }; S.active = P; save(); drawPlayer();
  const list = exList(P.dk); const nx = advance ? list[Math.min(P.idx + 1, list.length - 1)] : list[P.idx];
  restNotify(P.rest.until, `${advance ? 'التمرين الجاي' : 'المجموعة الجاية'}: ${nx.name}`);
}
function painStop(ex) {
  openSheet(sheetHead('وقّف التمرين ده', 'الوجع عدّى 3/10') + `<p style="line-height:1.8">متكمّلش ${esc(ex.name)} النهارده. ${ex.pain ? 'اعمل بداله ثبات خفيف 30 ثانية بزاوية 90° لو مش بيوجع، أو سيبه خالص.' : ''} لو الوجع فضل لبكرة الصبح أو زاد، المرة الجاية جرّب البديل أو قلّل الوزن للنص.</p>
    <button class="btn red block mt" id="psNext">التمرين اللي بعده</button><button class="btn ghost block mt" data-close>رجوع</button>`, p => {
    $('#psNext', p).onclick = () => { closeSheet(); const list = exList(P.dk); if (P.idx < list.length - 1) P.idx++; save(); drawPlayer(); };
  });
  const s = ensureSess(P.w, P.dk); (s.flags = s.flags || []).push({ ex: ex.lk, pain: true, t: Date.now() }); save();
}

/* ================= التقدّم ================= */
function weightChart() {
  const t = today(), N = 56;
  const pts = []; for (let i = N - 1; i >= 0; i--) { const d = addDays(t, -i); const w = eff(d).w; pts.push({ d, w }); }
  const ws = pts.filter(p => p.w).map(p => p.w);
  if (ws.length < 2) return '<div class="empty">سجّل وزنك كام يوم والرسم هيظهر هنا.</div>';
  const avgs = pts.map((p, i) => { const win = pts.slice(Math.max(0, i - 6), i + 1).filter(x => x.w); return win.length >= 2 ? win.reduce((a, x) => a + x.w, 0) / win.length : null; });
  const tgt = S.settings.target;
  let lo = Math.min(...ws), hi = Math.max(...ws); lo = Math.floor(lo - 0.5); hi = Math.ceil(hi + 0.5);
  const W = 340, H = 180, L = 34, R = 8, T = 10, B = 24;
  const x = i => L + i * (W - L - R) / (N - 1), y = v => T + (hi - v) * (H - T - B) / (hi - lo);
  const ticks = []; const step = Math.max(1, Math.round((hi - lo) / 4)); for (let v = lo; v <= hi; v += step) ticks.push(v);
  const line = avgs.map((a, i) => a == null ? null : `${x(i).toFixed(1)},${y(a).toFixed(1)}`).filter(Boolean).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="رسم الوزن">
    ${ticks.map(v => `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join('')}
    ${tgt >= lo && tgt <= hi ? `<line class="tgt" x1="${L}" x2="${W - R}" y1="${y(tgt)}" y2="${y(tgt)}"/>` : ''}
    ${pts.map((p, i) => p.w ? `<circle class="raw" cx="${x(i)}" cy="${y(p.w)}" r="2.6"/>` : '').join('')}
    <polyline class="avg" points="${line}"/>
    ${[0, 27, 55].map(i => `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${short(pts[i].d)}</text>`).join('')}
  </svg><div class="small muted" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:6px"><span><b style="color:var(--red)">━</b> متوسط 7 أيام</span><span>● قراءة يومية</span>${tgt >= lo && tgt <= hi ? '<span style="color:var(--ok)">┅ الهدف</span>' : ''}</div>`;
}
function weekRows() {
  const rows = []; const start = S.settings.start;
  const wNow = weekOf(today());
  for (let wk = Math.min(wNow, S.settings.weeks); wk >= Math.max(1, wNow - 7); wk--) {
    const end = addDays(start, wk * 7 - 1);
    const aw = avgWeight(end); const st = avgOf('steps', end); const sl = avgOf('sleep', end);
    const sessions = DAYS.filter(d => { const s = S.logs[sessKey(wk, d.key)]; return s && Object.values(s.ex).some(a => a.length); }).length;
    rows.push({ wk, aw: aw && aw.avg, st, sl, sessions });
  }
  return rows;
}
function strengthRows() {
  const out = [];
  for (const d of DAYS) for (const ex of exList(d.key)) {
    if (isTimed(ex) || ex.kind === 'warm') continue;
    const h = history(ex.lk); if (!h.length) continue;
    const e1 = s => (+s.w || 0) * (1 + (+s.r || 0) / 30);
    const byDate = {}; h.forEach(s => { byDate[s.date] = Math.max(byDate[s.date] || 0, e1(s)); });
    const ds = Object.keys(byDate).sort();
    const best = h.reduce((a, s) => e1(s) > e1(a) ? s : a, h[0]);
    out.push({ name: ex.name, first: byDate[ds[0]], last: byDate[ds[ds.length - 1]], best, n: ds.length });
  }
  return out;
}
function renderProgress(el) {
  const v = verdict(); const rows = weekRows(); const str = strengthRows();
  const bodyDates = Object.keys(S.body).sort().reverse();
  el.innerHTML = `<div class="topbar"><h1>التقدّم</h1></div>
  <div class="verdict ${v.cls}"><h3>${v.t}</h3><p>${v.d}</p></div>
  ${(() => { const a = adaptive(); if (!a) return `<div class="section-t">حرقك الحقيقي</div><div class="card pad"><p class="muted small" style="margin:0;line-height:1.7">بعد ~2 أسبوع وزن يومي وأكل متعلّم عليه، الكابتن هيحسب حرقك الحقيقي ويظبط السعرات لوحده.</p></div>`;
    return `<div class="section-t">حرقك الحقيقي (آخر 3 أسابيع)</div><div class="card pad">
    <div class="tiles"><div class="tile"><small>الحرق الحقيقي</small><b class="num">${fmt(a.tdee)}</b><div class="sub">ثقة ${a.conf} · ${a.logged}/${a.days} يوم متعلّم</div></div>
    <div class="tile"><small>اتجاه الوزن</small><b class="num">${a.slopeWk <= 0 ? '−' : '+'}${fmt(Math.abs(a.slopeWk), 2)}</b><div class="sub">كجم في الأسبوع</div></div></div>
    <p class="small" style="line-height:1.7;margin:12px 0 0">متوسط أكلك ${fmt(a.intakeAvg)} سعر. عشان تنزل 0.7% في الأسبوع المثالي ~${fmt(a.ideal)} سعر في اليوم العادي (دلوقتي ${fmt(S.settings.kcal)}).</p>
    ${a.delta ? `<button class="btn red block mt" id="adaptGo">${a.delta > 0 ? `زوّد ${a.delta} سعر (${Math.round(a.delta / 1.3)} جم رز)` : `قلّل ${-a.delta} سعر (${Math.round(-a.delta / 1.3)} جم رز)`}</button><p class="muted small" style="margin:6px 0 0">التعديل محدود بـ 150 سعر في المرة عشان ميبقاش مفاجئ.</p>` : '<p class="up small" style="margin:8px 0 0">السعرات مظبوطة – مفيش تعديل ✓</p>'}
    ${S.settings.riceAdj ? `<button class="btn ghost block mt sm" id="adaptReset">رجّع الرز للأصل (${riceAdj() > 0 ? '+' : ''}${riceAdj()} جم)</button>` : ''}</div>`; })()}
  <div class="section-t">الوزن – آخر 8 أسابيع</div><div class="card pad">${weightChart()}</div>
  <div class="section-t">أسبوع بأسبوع</div>
  <div class="card pad scroll-x">${rows.length ? '' : '<p class="muted small" style="margin:0 0 8px">الجدول هيبدأ مع أول أسبوع في البرنامج.</p>'}<table class="t"><thead><tr><th>الأسبوع</th><th>متوسط الوزن</th><th>الخطوات</th><th>النوم</th><th>تمارين</th></tr></thead><tbody>
  ${rows.map((r, i) => { const prev = rows[i + 1]; const ch = prev && prev.aw && r.aw ? r.aw - prev.aw : null; return `<tr><td>${r.wk < 1 ? '—' : r.wk}</td><td>${r.aw ? fmt(r.aw, 1) : '—'} ${ch != null ? `<span class="${ch <= 0 ? 'up' : 'down'} small">${ch <= 0 ? '▼' : '▲'}${fmt(Math.abs(ch), 1)}</span>` : ''}</td><td>${r.st ? fmt(r.st) : '—'}</td><td>${r.sl ? (r.sl / 60).toFixed(1) + ' س' : '—'}</td><td>${r.sessions}/4</td></tr>`; }).join('')}
  </tbody></table></div>
  <div class="section-t">القوة (أحسن مجموعة محسوبة)</div>
  <div class="card pad scroll-x">${str.length ? `<table class="t"><thead><tr><th>التمرين</th><th>أحسن مجموعة</th><th>التغيير</th></tr></thead><tbody>${str.map(s => { const ch = s.first ? (s.last - s.first) / s.first * 100 : 0; return `<tr><td>${esc(s.name)}</td><td><span class="num">${fmt(s.best.w, 2)}×${s.best.r}</span></td><td>${s.n > 1 ? `<span class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '+' : ''}${fmt(ch, 0)}%</span>` : '<span class="muted small">مرة واحدة</span>'}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">ابدأ تمرين وسجّل المجموعات.</div>'}</div>
  ${(() => { const old = {}; for (const s of Object.values(S.logs)) for (const [lk, arr] of Object.entries(s.ex)) if (lk.startsWith('gain:') && arr.length) { const o = (old[lk] = old[lk] || { name: lk.slice(5), best: null, last: s.date, n: 0 }); o.n++; if (s.date > o.last) o.last = s.date; for (const x of arr) if (!o.best || x.w * (1 + x.r / 30) > o.best.w * (1 + o.best.r / 30)) o.best = x; }
    const list = Object.values(old); if (!list.length) return '';
    return `<div class="section-t">تمارين قديمة من The Gain (مش في البرنامج دلوقتي)</div><div class="card pad scroll-x"><table class="t"><thead><tr><th>التمرين</th><th>أحسن مجموعة</th><th>آخر مرة</th></tr></thead><tbody>${list.map(o => `<tr><td style="direction:ltr;text-align:right">${esc(o.name)}</td><td><span class="num">${fmt(o.best.w, 2)}×${o.best.r}</span></td><td>${short(o.last)}</td></tr>`).join('')}</tbody></table></div>`; })()}
  <div class="section-t">تحليل الميزان والمقاسات</div>
  <div class="card pad">${bodyDates.length ? `<table class="t"><thead><tr><th>التاريخ</th><th>الوزن</th><th>دهون %</th><th>عضل هيكلي</th><th>حشوية</th><th>الوسط</th></tr></thead><tbody>${bodyDates.slice(0, 8).map(d => { const b = S.body[d]; return `<tr><td>${short(d)}</td><td>${b.weight ?? '—'}</td><td>${b.fat ?? '—'}</td><td>${b.skmKg ? b.skmKg + ' كجم' : b.skm ? b.skm + '%' : b.muscle ?? '—'}</td><td>${b.visceral ?? '—'}</td><td>${b.waist ?? '—'}</td></tr>`; }).join('')}</tbody></table>
    ${(() => { const ds = bodyDates.filter(d => S.body[d].fatKg && S.body[d].skmKg); if (ds.length < 2) return ''; const a = S.body[ds[ds.length - 1]], b = S.body[ds[0]]; const df = r1(b.fatKg - a.fatKg), dm = r1(b.skmKg - a.skmKg); return `<p class="small" style="margin:10px 0 0;line-height:1.7">من ${short(ds[ds.length - 1])}: دهون <b class="${df <= 0 ? 'up' : 'down'}">${df > 0 ? '+' : ''}${df} كجم</b> · عضل هيكلي <b class="${dm >= 0 ? 'up' : 'down'}">${dm > 0 ? '+' : ''}${dm} كجم</b></p>`; })()}
    <p class="muted small" style="margin:8px 0 0">أرقام الميزان بتتقرا لوحدها من OKOK. الوسط اكتبه انت. ميزان البصمة بيتأثر بالمية – قارن نفس الميعاد كل أسبوع.</p>` : '<p class="muted small" style="margin:0">مرة في الأسبوع: انقل أرقام OKOK (دهون، عضل، مية) ومقاس الوسط عند السرّة.</p>'}
    <button class="btn ghost block mt sm" id="addBody">${ICON.plus.replace('<svg', '<svg style="stroke:var(--ink)"')} أضف قياس</button></div>
  <button class="btn red block mt" id="report">تقرير الأسبوع للكابتن</button>`;
  $('#addBody').onclick = bodySheet;
  const ag = $('#adaptGo'); if (ag) ag.onclick = () => applyAdaptive(adaptive().delta);
  const ar = $('#adaptReset'); if (ar) ar.onclick = () => { S.settings.kcal = Math.round(S.settings.kcal - riceAdj() * 1.3); S.settings.riceAdj = 0; save(); render(); toast('رجع للأصل ✓'); };
  $('#report').onclick = () => copyText(weeklyReport());
}
function bodySheet() {
  const d = today(), b = S.body[d] || {};
  openSheet(sheetHead('قياس جديد', 'من ميزان OKOK + شريط القياس') + `
    <div class="grid2"><label class="field"><span>دهون %</span><input id="bF" class="inp num" inputmode="decimal" value="${b.fat ?? ''}"></label><label class="field"><span>عضل %</span><input id="bM" class="inp num" inputmode="decimal" value="${b.muscle ?? ''}"></label>
    <label class="field"><span>مية %</span><input id="bW" class="inp num" inputmode="decimal" value="${b.water ?? ''}"></label><label class="field"><span>الوسط عند السرّة (سم)</span><input id="bC" class="inp num" inputmode="decimal" value="${b.waist ?? ''}"></label></div>
    <p class="muted small">قيس الوسط الصبح قبل الأكل، والشريط مفرود ومش ضاغط.</p>
    <button class="btn red block mt" id="bSave">حفظ</button>`, p => {
    $('#bSave', p).onclick = () => {
      const n = id => { const v = parseFloat($(id, p).value.replace(',', '.')); return isNaN(v) ? undefined : v; };
      const rec = { fat: n('#bF'), muscle: n('#bM'), water: n('#bW'), waist: n('#bC') };
      if (Object.values(rec).every(v => v === undefined)) { toast('اكتب رقم واحد على الأقل'); return; }
      const cur = S.body[d] || {}; for (const [k, v] of Object.entries(rec)) if (v !== undefined) cur[k] = v; S.body[d] = cur; save(); closeSheet(); render(); toast('اتسجّل ✓');
    };
  });
}
function weeklyReport() {
  const t = today(), wk = curWeek(), set = S.settings;
  const now = avgWeight(t), prev = avgWeight(addDays(t, -7));
  const lines = [`# تقرير الأسبوع ${wk} – كوتش الجيم`, `الفترة: ${addDays(t, -6)} → ${t}`, ''];
  lines.push('## الوزن والنشاط');
  const daily = []; for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const e = eff(d); daily.push(`${short(d)}: ${e.w ?? '—'} كجم · ${e.steps ?? '—'} خطوة · نشاط ${e.active ?? '—'} · حرق تقديري ${e.kcal ?? '—'} · نوم ${e.sleep ? (e.sleep / 60).toFixed(1) + 'س' : '—'}${e.creatine ? ' · كرياتين✓' : ''}`); }
  lines.push(`- متوسط الوزن: ${now ? fmt(now.avg, 2) : '—'} (الأسبوع اللي فات ${prev ? fmt(prev.avg, 2) : '—'})`);
  lines.push(`- متوسط الخطوات: ${fmt(avgOf('steps', t))} (الهدف ${set.steps}) · متوسط الحرق: ${fmt(avgOf('kcal', t))} · متوسط النوم: ${avgOf('sleep', t) ? (avgOf('sleep', t) / 60).toFixed(1) + ' ساعة' : '—'}`);
  lines.push(...daily.map(x => '  - ' + x));
  const bd = Object.keys(S.body).sort().pop(); if (bd) { const b = S.body[bd]; lines.push(`- آخر قياس (${bd}): وزن ${b.weight ?? '—'} · دهون ${b.fat ?? '—'}% (${b.fatKg ?? '—'} كجم) · عضل هيكلي ${b.skmKg ?? '—'} كجم (${b.skm ?? '—'}%) · مية ${b.water ?? '—'}% · حشوية ${b.visceral ?? '—'} · BMR ${b.bmr ?? '—'} · وسط ${b.waist ?? '—'} سم`); }
  lines.push('', '## التمرين');
  for (const d of DAYS) {
    const s = S.logs[sessKey(wk, d.key)];
    if (!s || !Object.values(s.ex).some(a => a.length)) { lines.push(`- ${d.title}: ❌ متعملش`); continue; }
    lines.push(`- ${d.title} (${s.date}${s.end && s.start ? ` · ${Math.round((s.end - s.start) / 6e4)} د` : ''}):`);
    for (const ex of exList(d.key)) { const a = s.ex[ex.lk]; if (!a || !a.length) continue; lines.push(`  - ${ex.name}: ${a.map(x => isTimed(ex) ? `${x.r}${unitOf(ex) === 'sec' ? 'ث' : 'د'}` : `${x.w}×${x.r}${x.rir != null ? ` @${x.rir}` : ''}${x.p != null ? ` وجع${x.p}` : ''}`).join(' | ')}`); }
    (s.flags || []).forEach(f => lines.push(`  - ⚠️ وقفت ${f.ex} بسبب الوجع`));
  }
  const notes = []; for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const n = (S.days[d] || {}).note; if (n) notes.push(`- ${short(d)}: ${n}`); }
  if (notes.length) lines.push('', '## ملاحظاتي', ...notes);
  const foodDays = []; for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const it = intake(d); const dd = S.days[d] || {}; foodDays.push(`${short(d)}${dayType(d) === 'mom' ? ' (جمعة ماما)' : dayType(d) === 'lecture' ? ' (محاضرة)' : ''}: ${it.logged ? it.kcal : 'مش متعلّم'}${dd.choice ? ' · ' + dd.choice : ''}${extraOf(d) ? ' · زيادة ' + extraOf(d) + ((dd.extras || []).length ? ' (' + dd.extras.map(e => e.name).join('، ') + ')' : '') : ''}`); }
  lines.push('', '## الأكل', ...foodDays.map(x => '- ' + x));
  const ad = adaptive(); if (ad) lines.push(`- حرق حقيقي محسوب: ${ad.tdee} · اتجاه ${fmt(ad.slopeWk, 2)} كجم/أسبوع · السعرات الحالية ${S.settings.kcal}${S.settings.riceAdj ? ` (رز ${riceAdj() > 0 ? '+' : ''}${riceAdj()} جم)` : ''}`);
  const v = verdict(); lines.push('', `## رأي التطبيق: ${v.t}`, v.d.replace(/<[^>]+>/g, ''));
  lines.push('', 'يا كابتن راجع وقولي نعدّل إيه.');
  return lines.join('\n');
}

/* ================= الأكل ================= */
function renderFood(el) {
  const td = today();
  if (!view.food) view.food = td;
  const t = view.food, eaten = (S.days[t] || {}).meals || {}, ms = mealsFor(t), dt = dayType(t), future = t > td;
  // امبارح + النهارده + 6 أيام جايين
  const week = Array.from({ length: 8 }, (_, i) => addDays(td, i - 1));
  const tag = d => isMomFri(d) ? 'ماما' : isLecture(d) ? 'محاضرة' : (DAYS.find(x => x.dow === parseISO(d).getDay()) ? 'تمرين' : 'راحة');
  const kc = ms.reduce((a, m) => a + m.kcal, 0), pr = ms.reduce((a, m) => a + m.p, 0);
  const ek = ms.reduce((a, m) => a + (eaten[m.id] ? m.kcal : 0), 0), ep = ms.reduce((a, m) => a + (eaten[m.id] ? m.p : 0), 0);
  const banner = dt === 'mom' ? `<div class="verdict ok"><h3>جمعة ماما 😄</h3><p>ميزانية النهارده ~${fmt(kc)} سعر. استمتع: البروتين الأول، طبق واحد مليان، حتة حلو واحدة. ومتصومش بكرة.</p></div>`
    : dt === 'lecture' ? `<div class="verdict info"><h3>يوم محاضرة 🎓</h3><p>العشا برة أو في البريك. اختار تحت اللي أكلته عشان الحسبة تبقى صح.</p></div>` : '';
  const itemRow = (it, mid) => `<div class="item"><span class="food-ic">${esc(it.name.trim()[0])}</span><div><b>${esc(it.name)}</b><small><span class="num">${it.g}</span> جم · <span class="num">${it.kcal}</span> سعر · <span class="num">${it.p}</span> جم بروتين</small>${it.swapped ? `<div class="swapped">بدل ${esc(it.base)}</div>` : ''}${it.adj ? `<div class="swapped">${it.adj > 0 ? '+' : ''}${it.adj} جم من تعديل الكابتن</div>` : ''}</div>${(DIET.meals.find(x => x.id === mid).items.find(x => x.id === it.id) || {}).alts?.length ? `<button class="sq red" data-fs="${it.id}" aria-label="بدّل">${ICON.swap}</button>` : ''}</div>`;
  el.innerHTML = `<div class="topbar"><h1>النظام الغذائي</h1><button class="iconbtn" id="dInfo" aria-label="معلومات">${ICON.info}</button></div>
  <div class="quick" style="padding:0 0 12px">${week.map(d => `<button data-fd="${d}" style="${d === t ? 'background:var(--red);color:#fff;border-color:var(--red)' : ''};height:auto;padding:8px 12px;line-height:1.3"><span style="display:block;font-size:13px">${d === td ? 'النهارده' : d === addDays(td, -1) ? 'امبارح' : AR_DAYS[parseISO(d).getDay()]}</span><small style="font-size:11px;opacity:.8">${tag(d)}</small></button>`).join('')}</div>
  ${future ? `<p class="muted small" style="margin:0 4px 10px">ده أكل ${nice(t)} – هتعلّم عليه يومها.</p>` : ''}
  ${banner ? banner + '<div class="mt"></div>' : ''}
  <div class="totals"><div class="tile"><small>السعرات</small><b class="num">${fmt(ek)} / ${fmt(kc)}</b><div class="bar ok"><i style="width:${Math.min(100, ek / kc * 100)}%"></i></div></div>
  <div class="tile"><small>البروتين (جم)</small><b class="num">${fmt(ep)} / ${fmt(pr)}</b><div class="bar ok"><i style="width:${Math.min(100, ep / pr * 100)}%"></i></div></div></div>
  ${ms.map(m => `<div class="card mt">
    <div class="meal-h"><div><h3>${m.title}</h3><small>${m.time} · ${m.where} · <span class="num">${m.kcal}</span> سعر · <span class="num">${m.p}</span> جم بروتين</small></div>${future ? '' : `<button class="eat ${eaten[m.id] ? 'on' : ''}" data-eat="${m.id}" aria-label="أكلتها">${ICON.check}</button>`}</div>
    ${m.special ? m.options.map(o => `<button class="item" style="width:100%;text-align:start" data-opt="${o.id}"><span class="food-ic" style="${m.pick === o.id ? 'background:var(--red);color:#fff' : ''}">${m.pick === o.id ? '✓' : ''}</span><div><b>${esc(o.name)}</b><small>${esc(o.desc)}</small><br><small><span class="num">${o.id === 'box' ? m.boxItems.reduce((a, x) => a + x.kcal, 0) : o.kcal}</span> سعر · <span class="num">${o.p}</span> جم بروتين</small></div></button>`).join('')
      : m.items.map(it => itemRow(it, m.id)).join('')}
    <div class="note"><span class="i">i</span><span class="lbl">ملاحظة</span><span>${esc(m.note)}</span></div></div>`).join('')}
  ${(() => { const ex = (S.days[t] || {}).extras || []; const tot = extraOf(t); return `<div class="card mt"><div class="meal-h"><div><h3>أكل زيادة</h3><small>حلو، مشروب، سناك، عزومة · ${tot ? `<span class="num">${tot}</span> سعر النهارده` : 'مفيش لسه'}</small></div><button class="sq red" id="exAdd" aria-label="ضيف">${ICON.plus}</button></div>
    ${ex.map((e, i) => `<div class="item"><span class="food-ic">${esc(e.name.trim()[0])}</span><div><b>${esc(e.name)}</b><small><span class="num">${e.kcal}</span> سعر</small></div><button class="mini del" data-exdel="${i}" aria-label="مسح">${ICON.trash}</button></div>`).join('')}
    ${!ex.length ? '<p class="muted small" style="margin:0;padding:12px 16px">اضغط + واختار اللي أكلته من القايمة – السعرات محسوبة جاهزة.</p>' : ''}</div>`; })()}`;
  el.querySelectorAll('[data-fd]').forEach(b => b.onclick = () => { view.food = b.dataset.fd; render(); });
  el.querySelectorAll('[data-eat]').forEach(b => b.onclick = () => { const d = day(t); d.meals = d.meals || {}; d.meals[b.dataset.eat] = !d.meals[b.dataset.eat]; save(); render(); });
  el.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { if (future) { toast('اختار يومها بعد ما تاكل'); return; } const d = day(t); d.choice = b.dataset.opt; d.meals = d.meals || {}; d.meals.m3 = true; save(); render(); });
  el.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => foodSwapSheet(b.dataset.fs));
  $('#exAdd').onclick = () => future ? toast('سجّل الأكل الزيادة يومها') : extrasSheet(t);
  el.querySelectorAll('[data-exdel]').forEach(b => b.onclick = () => { const d = day(t); d.extras.splice(+b.dataset.exdel, 1); save(); render(); });
  $('#dInfo').onclick = () => openSheet(sheetHead('ليه الأرقام دي؟') + `<p style="line-height:1.8">الهدف ~${fmt(S.settings.kcal)} سعر و~${DIET.protein} جم بروتين في اليوم العادي. الكابتن بيحسب حرقك الحقيقي كل أسبوع من الأكل اللي بتعلّم عليه ومتوسط وزنك، ويقترح تعديل في رز العشا.</p><p style="line-height:1.8" class="muted">علّم على كل وجبة بعد ما تاكلها، وسجّل أي أكل زيادة – ده اللي بيخلي الحسبة صح. اليوم اللي مفيهوش ولا علامة بيتحسب كأنك مشيت على الخطة.</p>`);
}
function extrasSheet(d) {
  let q = '';
  const draw = p => {
    const box = $('#exList', p);
    box.innerHTML = EXTRAS.map(c => { const its = c.items.filter(([n]) => !q || n.includes(q)); return its.length ? `<div class="section-t">${c.cat}</div>${its.map(([n, k]) => `<button class="alt" data-n="${esc(n)}" data-k="${k}"><span class="food-ic">${esc(n.trim()[0])}</span><span style="flex:1"><b>${esc(n)}</b><small><span class="num">${k}</span> سعر</small></span><span class="link">+</span></button>`).join('')}` : ''; }).join('')
      + `<div class="section-t">مش لاقيه؟</div><div class="grid2"><input id="exName" class="inp" style="font-size:15px" placeholder="اسم الأكلة"><input id="exK" class="inp num" inputmode="numeric" placeholder="سعرات"></div><button class="btn ghost block mt sm" id="exCustom">ضيف</button><p class="muted small">مش عارف السعرات؟ صوّرها وابعتهالي في الشات وأنا أقولك.</p>`;
    box.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { const x = day(d); (x.extras = x.extras || []).push({ name: b.dataset.n, kcal: +b.dataset.k }); save(); toast(`اتضاف: ${b.dataset.n} (${b.dataset.k} سعر)`); render(); });
    $('#exCustom', p).onclick = () => { const n = $('#exName', p).value.trim(), k = parseInt($('#exK', p).value); if (!n || !(k > 0)) { toast('اكتب الاسم والسعرات'); return; } const x = day(d); (x.extras = x.extras || []).push({ name: n, kcal: k }); save(); closeSheet(); render(); toast('اتضاف ✓'); };
  };
  openSheet(sheetHead('أكلت إيه زيادة؟', 'دوس على الحاجة – ممكن أكتر من مرة') + `<input id="exQ" class="inp mt" style="font-size:16px" placeholder="🔍 دوّر: كنافة، بيبسي، شاورما…"><div id="exList"></div><button class="btn red block mt" data-close>تمام</button>`, p => {
    draw(p); $('#exQ', p).oninput = e => { q = e.target.value.trim(); draw(p); };
  });
}
function foodSwapSheet(id) {
  let item, meal; DIET.meals.forEach(m => m.items.forEach(i => { if (i.id === id) { item = i; meal = m; } }));
  const cur = S.foodSwaps[id] || 0;
  const opt = (x, i) => `<button class="alt ${cur === i ? 'on' : ''}" data-i="${i}"><span class="food-ic">${esc(x.name.trim()[0])}</span><span><b>${esc(x.name)}</b><small><span class="num">${x.g}</span> جم · <span class="num">${x.kcal}</span> سعر · <span class="num">${x.p}</span> جم بروتين${i === 0 ? ' · الأساسي' : ''}</small></span></button>`;
  openSheet(sheetHead('بدّل الصنف', esc(meal.title)) + opt(item, 0) + item.alts.map((a, i) => opt(a, i + 1)).join(''), p => {
    p.querySelectorAll('[data-i]').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i) S.foodSwaps[id] = i; else delete S.foodSwaps[id]; save(); closeSheet(); render(); });
  });
}

/* ================= القائمة ================= */
function renderMenu(el) {
  const rows = [
    ['user', 'ملفي وأهدافي', profileSheet, `${S.settings.kcal} سعر`],
    ['heart', 'الساعة + Health Connect', hcSheet, native ? (S.settings.lastSync ? 'مربوط' : 'مش مربوط') : ''],
    ['scale', 'سجل الأوزان', weightsSheet, ''],
    ['ruler', 'القياسات وتحليل الميزان', bodySheet, ''],
    ['report', 'تقرير الأسبوع للكابتن', () => copyText(weeklyReport()), ''],
    ['bell', 'الإشعارات', notifSheet, S.settings.notif ? 'شغالة' : 'مقفولة'],
    ['save', 'استيراد من The Gain Universe', gainSheet, S.settings.gainImported ? 'اتستورد' : ''],
    ['shield', 'قواعد الكابتن', rulesSheet, ''],
    ['book', 'المصادر العلمية', sourcesSheet, ''],
    ['save', 'نسخة احتياطية', backupSheet, '']
  ];
  el.innerHTML = `<div class="hello" style="padding-bottom:18px;border-bottom:1px solid var(--line)"><h1>أهلاً</h1><div style="font-size:22px">${esc(S.settings.name)} 👋</div></div>
   <div class="section-t">الحساب</div><div class="rows">${rows.map((r, i) => `<button class="row" data-r="${i}">${ICON[r[0]]}<span>${r[1]}</span>${r[3] ? `<em>${r[3]}</em>` : ''}${ICON.arr}</button>`).join('')}</div>
   <p class="muted small mt" style="text-align:center">كوتش الجيم · البيانات محفوظة على الموبايل ده بس</p>`;
  el.querySelectorAll('[data-r]').forEach(b => b.onclick = rows[+b.dataset.r][2]);
}
function profileSheet() {
  const s = S.settings;
  const f = (id, label, val, mode = 'decimal') => `<label class="field"><span>${label}</span><input id="${id}" class="inp num" inputmode="${mode}" value="${esc(val)}"></label>`;
  openSheet(sheetHead('ملفي وأهدافي') + `
    <label class="field"><span>الاسم</span><input id="pName" class="inp" value="${esc(s.name)}"></label>
    <label class="field"><span>بداية البرنامج (السبت)</span><input id="pStart" class="inp num" type="date" value="${s.start}"></label>
    <label class="field"><span>آخر جمعة عند ماما (كل أسبوعين)</span><input id="pMom" class="inp num" type="date" value="${s.momStart || ''}"></label>
    <div class="grid2">${f('pTarget', 'الوزن الهدف', s.target)}${f('pKcal', 'السعرات', s.kcal, 'numeric')}${f('pProt', 'البروتين (جم)', s.protein, 'numeric')}${f('pSteps', 'الخطوات', s.steps, 'numeric')}${f('pWater', 'المية (لتر)', s.water)}${f('pWeeks', 'عدد الأسابيع', s.weeks, 'numeric')}</div>
    <button class="btn red block mt" id="pSave">حفظ</button>`, p => {
    $('#pSave', p).onclick = () => {
      const num = (id, d) => { const v = parseFloat($(id, p).value.replace(',', '.')); return isNaN(v) ? d : v; };
      Object.assign(s, { name: $('#pName', p).value.trim() || s.name, start: $('#pStart', p).value || s.start, momStart: $('#pMom', p).value || s.momStart, target: num('#pTarget', s.target), kcal: num('#pKcal', s.kcal), protein: num('#pProt', s.protein), steps: num('#pSteps', s.steps), water: num('#pWater', s.water), weeks: num('#pWeeks', s.weeks) });
      save(); closeSheet(); view.week = null; render(); toast('اتحفظ ✓');
    };
  });
}
function hcSheet() {
  openSheet(sheetHead('Health Connect', 'Zepp + ميزان OKOK') + (native ? `
    <p style="line-height:1.8">التطبيق بيقرا من Health Connect: الخطوات، الحرق الكلي، النوم، النبض وقت الراحة، الوزن ونسبة الدهون. مبيكتبش حاجة.</p>
    <div class="note"><span class="i">1</span><span><b>الساعة:</b> Zepp Active مبيبعتش لـ Health Connect، فكوتش الجيم بيقرا أرقامه من الشاشة مباشرة.</span></div>
    <button class="btn red block mt sm" id="hcZ">إعداد قراءة الساعة</button>
    <div class="note mt"><span class="i">2</span><span><b>OKOK:</b> لو فيه ربط بـ Google Fit فعّله، وفي Google Fit فعّل "Sync Fit with Health Connect". لو مفيش، سجّل الوزن يدوي من الرئيسية.</span></div>
    <button class="btn red block mt" id="hc1">اربط / حدّث الأذونات</button>
    <button class="btn ghost block mt" id="hc2">افتح إعدادات Health Connect</button>
    <button class="btn ghost block mt" id="hc3">حدّث البيانات دلوقتي</button>` : '<p>الجزء ده بيشتغل في تطبيق الأندرويد بس.</p>'), p => {
    if (!native) return;
    $('#hcZ', p).onclick = () => { closeSheet(); zeppSetupSheet(); };
    $('#hc1', p).onclick = async () => { closeSheet(); await hcConnect(); };
    $('#hc2', p).onclick = () => { try { Health.openHealthConnectSettings(); } catch (e) { toast('مقدرتش أفتح الإعدادات'); } };
    $('#hc3', p).onclick = () => { closeSheet(); hcSync(true); };
  });
}
function weightsSheet() {
  const rows = []; for (let i = 0; i < 60; i++) { const d = addDays(today(), -i); const m = (S.days[d] || {}).w, h = (S.health[d] || {}).weight; if (m || h) rows.push({ d, m, h }); }
  openSheet(sheetHead('سجل الأوزان') + `<button class="btn red block" id="wAdd">سجّل وزن النهارده</button>
    <div class="hist">${rows.length ? rows.map(r => `<div class="hrow"><span class="d num">${r.d}</span><span class="v"><span class="num">${r.m ?? r.h}</span> كجم<small>${r.m ? 'يدوي' : 'من الميزان'}</small></span><button class="mini" data-d="${r.d}" aria-label="تعديل">${ICON.edit}</button></div>`).join('') : '<p class="muted">لسه مفيش أوزان.</p>'}</div>`, p => {
    $('#wAdd', p).onclick = () => { closeSheet(); dayEntrySheet(today()); };
    p.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { closeSheet(); dayEntrySheet(b.dataset.d); });
  });
}
function sourcesSheet() {
  openSheet(sheetHead('المصادر العلمية') + `<p class="muted small">البرنامج اتراجع على الأبحاث دي (نوفمبر 2026).</p>` + SOURCES.map(s => `<a class="row" href="${s[1]}" target="_blank" rel="noopener" style="text-decoration:none"><span style="font-size:14px">${esc(s[0])}</span>${ICON.arr}</a>`).join(''));
}
function backupSheet() {
  openSheet(sheetHead('نسخة احتياطية') + `<p class="muted small" style="line-height:1.7">البيانات على الموبايل ده بس. انسخ النسخة وابعتها لنفسك على واتساب أو الإيميل كل كام أسبوع. بتقدر تستورد كمان ملف التطبيق القديم (JSON).</p>
    <button class="btn red block" id="bkC">انسخ النسخة الاحتياطية</button>
    <label class="field"><span>استيراد: الصق النسخة هنا</span><textarea id="bkT" class="inp" placeholder="{ ... }"></textarea></label>
    <button class="btn ghost block mt" id="bkI">استيراد</button>`, p => {
    $('#bkC', p).onclick = () => copyText(JSON.stringify(Object.assign({}, S, { active: null })));
    $('#bkI', p).onclick = () => {
      let j; try { j = JSON.parse($('#bkT', p).value); } catch (e) { toast('النص ده مش JSON صحيح'); return; }
      if (j.settings && j.logs) { S = Object.assign(load(), j); }
      else if (j.weights || j.gymLogs) { // ملف التطبيق القديم
        for (const [d, w] of Object.entries(j.weights || {})) day(d).w = +w;
        for (const [d, s] of Object.entries(j.steps || {})) day(d).steps = +s;
        for (const [d, k] of Object.entries(j.watchKcal || {})) day(d).kcal = +k;
        for (const [d, c] of Object.entries(j.creatineLog || {})) day(d).creatine = !!c;
        for (const [d, n] of Object.entries(j.notes || {})) day(d).note = String(n);
        (j.bodyComp || []).forEach(b => { if (b.date) S.body[b.date] = { fat: b.fat, muscle: b.muscle, water: b.water }; });
      } else { toast('مش عارف الشكل ده'); return; }
      save(); closeSheet(); render(); toast('اتستوردت البيانات ✓');
    };
  });
}

/* ================= تشغيل ================= */
if (S.active && S.active.w) { tab = 'workout'; render(); startPlayer(S.active.w, S.active.dk); }
else render();
if (native && S.settings.lastSync) hcSync(false);
if (Zepp) zeppPull().then(() => { if ($('#player').hidden) render(); });
if (LN) (async () => {
  try { if (S.settings.notif && !S.settings.notifAsked) { S.settings.notifAsked = true; save(); await LN.requestPermissions(); } } catch (e) { }
  scheduleReminders();
})();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (P) { tickPlayer(); keepAwake(true); }
  if (Zepp && !P) zeppPull().then(async () => {
    if ($('#player').hidden) render();
    try { const g = await Zepp.getGain(); if (g.status && g.status !== 'waiting' && g.status !== 'running' && S.settings.gainSeen !== g.status + g.days) { S.settings.gainSeen = g.status + g.days; save(); if ($('#sheet').hidden) gainSheet(); } } catch (e) { }
  });
  if (LN && !P) scheduleReminders();
  if (!P && native && S.settings.lastSync) { const m = (Date.now() - new Date(S.settings.lastSync)) / 6e4; if (m > 15) hcSync(false); }
});
// زرار الرجوع في أندرويد
try {
  const App = native && (Cap.registerPlugin ? Cap.registerPlugin('App') : Cap.Plugins.App);
  App && App.addListener('backButton', () => {
    if (!$('#sheet').hidden) closeSheet();
    else if (P) { P.finished = true; drawPlayer(); }
    else if (tab !== 'home') { tab = 'home'; render(); }
    else App.minimizeApp ? App.minimizeApp() : App.exitApp();
  });
} catch (e) { }
