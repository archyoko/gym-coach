/* Lifestyle – منطق التطبيق */
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
  for (const k of ['days', 'health', 'logs', 'body', 'swaps', 'foodSwaps', 'photos', 'checkins', 'repOverride', 'mealPhotos', 'coach', 'watch']) raw[k] = raw[k] || {};
  raw.inbox = raw.inbox || []; raw.shop = raw.shop || null;
  return raw;
}
function save(fromCloud) {
  if (!fromCloud) { S.meta = S.meta || {}; S.meta.updated = Date.now(); }
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('مقدرتش أحفظ – المساحة مليانة؟'); }
  if (!fromCloud && typeof cloudSoon === 'function') { cloudSoon(); ghSoon(); }
}
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
    // حرق تقديري = راحة (الميزان) + نشاط الساعة + التمرين لو الساعة مش حاسباه في الحلقة + هضم الأكل ~10%
    kcal: m.kcal ?? (active != null ? Math.round(bmr(d) + active + (h.wkcal && h.wkcal > active ? h.wkcal : 0) + 0.1 * DIET.kcal) : h.kcal) ?? null,
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
/* يوم تمرين؟ (فيه مشروب التمرين – سعراته زيادة على اليوم، محمد اختار كده) */
/* يوم تمرين؟ (حسب الخطة، أو لو اتمرّن فعلاً اليوم ده) */
function trainDayOf(d) {
  if (diffDays(d, S.settings.start) < 0) return false;
  if (weekPlan(weekOf(d)).some(x => x.date === d)) return true;
  return Object.values(S.logs).some(x => x.date === d && !x.legacy && Object.values(x.ex).some(a => a.length));
}
const DRINK_KCAL = DRINK.items.reduce((a, x) => a + x.kcal, 0);
/* الوجبات لليوم ده: العشا بيتغيّر يوم المحاضرة وجمعة ماما، ويوم التمرين فيه مشروب التمرين والبطاطا أقل */
function mealsFor(d) {
  const t = dayType(d), train = trainDayOf(d);
  const out = DIET.meals.map(m => {
    let its = mealItems(m);
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
  if (train) { const di = DRINK.items.map(x => Object.assign({}, x)); out.splice(2, 0, { id: 'drink', title: DRINK.title, time: DRINK.time, where: DRINK.where, note: DRINK.note, items: di, kcal: di.reduce((a, x) => a + x.kcal, 0), p: di.reduce((a, x) => a + x.p, 0), drink: true }); }
  return out;
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
  const sa = sleepAvg(end); const sleepHold = !!(sa && sa.n >= 4 && sa.avg < 60 && delta < 0);
  if (sleepHold) delta = 0;
  return { tdee, slopeWk: slope * 7, intakeAvg: Math.round(intakeAvg), logged, days: inN, ideal, sleepHold, sleepAvg: sa, delta: Math.abs(delta) < 70 ? 0 : delta, conf: logged >= 14 ? 'عالية' : logged >= 7 ? 'متوسطة' : 'ضعيفة' };
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
  let r;
  if (!i || !ex.alts[i - 1]) r = Object.assign({}, ex, { swapIdx: 0, lk: ex.id });
  else { const a = ex.alts[i - 1]; r = Object.assign({}, ex, { name: a.name, en: a.en, img: a.img, swapIdx: i, lk: ex.id + '@' + i, baseName: ex.name }); }
  const ov = S.repOverride && S.repOverride[r.lk];
  if (ov) r = Object.assign(r, { reps: ov, baseReps: ex.reps });
  return r;
}
/* الثبات: آخر 3 حصص من غير تقدّم في أحسن مجموعة محسوبة */
function plateau(ex) {
  if (isTimed(ex) || ex.kind === 'warm' || ex.kind === 'rehab') return null;
  const byDate = {}; for (const s of history(ex.lk)) { const e = (+s.w || 0) * (1 + (+s.r || 0) / 30); byDate[s.date] = Math.max(byDate[s.date] || 0, e); }
  const ds = Object.keys(byDate).sort(); if (ds.length < 3) return null;
  const last3 = ds.slice(-3).map(d => byDate[d]);
  if (last3[2] > last3[0] * 1.01) return null;
  const [lo, hi] = ex.reps;
  const next = hi <= 12 ? [hi, hi + 5] : [Math.max(5, lo - 4), lo];
  return { next, since: ds[ds.length - 3] };
}
/* التمارين لجلسة: أسبوع مزنوق بيضيف الكتف الجانبي والفيس بول لـ LOWER A، والجاهزية بتقلل المجموعات */
function exList(k, w, adj) {
  let list = PROGRAM.ex[k].map(resolve);
  if (w && isBusy(w) && k === 'lowerA') list = list.concat(PROGRAM.ex.lowerB.filter(e => e.id === 'cableLat2' || e.id === 'facePull').map(resolve));
  if (adj === 'yellow' || adj === 'red') list = list.map(e => e.kind === 'warm' ? e : Object.assign({}, e, adj === 'yellow' ? { sets: Math.max(1, e.sets - 1) } : { sets: Math.max(1, Math.ceil(e.sets / 2)), rir: e.rir === '—' ? e.rir : '3', fail: false }));
  return list;
}

/* ================= خطة الأسبوع: الفايت والمزنوق ================= */
const OFF = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 }; // من السبت
const plannedDate = (w, k) => addDays(S.settings.start, (w - 1) * 7 + OFF[dayByKey(k).dow]);
const sessDone = (w, k) => { const s = S.logs[sessKey(w, k)]; return !!(s && Object.values(s.ex).some(a => a.length)); };
const isBusy = w => !!(S.busy && S.busy[w]);
const weekPlan = w => DAYS.filter(d => !(isBusy(w) && d.optional)).map(d => ({ d, date: plannedDate(w, d.key), done: sessDone(w, d.key) }));
const missedOf = w => { const t = today(); return weekPlan(w).filter(x => !x.done && x.date < t); };
function autoBusy(w) {
  if (isBusy(w) || (S.busy && S.busy[w] === false)) return;
  // حصتين فاتوا في نفس الأسبوع → الباقي يتحول 3 أيام (LOWER B يتشال وأهم تمارينه تتنقل)
  if (missedOf(w).length >= 2) { S.busy = S.busy || {}; S.busy[w] = 'auto'; save(); }
}
function todayPlan() {
  const t = today(); if (diffDays(t, S.settings.start) < 0) return null;
  const w = curWeek(); autoBusy(w);
  const plan = weekPlan(w);
  return { w, today: plan.find(x => x.date === t && !x.done) || null, doneToday: plan.find(x => x.date === t && x.done) || null, miss: missedOf(w)[0] || null, plan };
}

/* ================= الجاهزية ================= */
/* ================= جودة النوم ================= */
const hm = t => { if (!t) return null; const [h, m] = String(t).split(':').map(Number); return isNaN(h) ? null : h * 60 + m; };
const bedMin = t => { const v = hm(t); return v == null ? null : (v < 12 * 60 ? v + 1440 : v); }; // بعد نص الليل = +24 ساعة
function sleepQ(d) {
  const e = eff(d), h = S.health[d] || {}, m = S.days[d] || {}, z = Object.assign({}, h.zsq || {}, m.sq || {});
  const dur = e.sleep; if (!dur && z.score == null && !m.sleepFeel) return null;
  const parts = []; let pts = 0, max = 0;
  const add = (k, label, got, of, txt) => { parts.push({ k, label, got: Math.round(got), of, txt }); pts += got; max += of; };
  if (dur) { let g = Math.min(1, Math.max(0, (dur - 270) / 180)) * 40; if (dur > 570) g -= 5; add('dur', 'المدة', g, 40, `${Math.floor(dur / 60)}:${pad2(dur % 60)} ساعة`); }
  const tot = dur || ((z.deep || 0) + (z.light || 0) + (z.rem || 0)) || null;
  if (z.deep != null && tot) { const pc = z.deep / tot; add('deep', 'نوم عميق', Math.min(1, pc / 0.18) * 20, 20, `${z.deep} دقيقة · ${Math.round(pc * 100)}% (المثالي 15–25%)`); }
  if (z.rem != null && tot) { const pc = z.rem / tot; add('rem', 'REM (الأحلام)', Math.min(1, pc / 0.2) * 20, 20, `${z.rem} دقيقة · ${Math.round(pc * 100)}% (المثالي 20–25%)`); }
  if (z.awake != null) add('awake', 'صحيان بالليل', z.awake <= 20 ? 10 : z.awake >= 60 ? 0 : (60 - z.awake) / 40 * 10, 10, `${z.awake} دقيقة صاحي`);
  const bm = bedMin(z.bed);
  if (bm != null) { const prev = []; for (let i = 1; i <= 7; i++) { const b = bedMin(((S.health[addDays(d, -i)] || {}).zsq || {}).bed); if (b != null) prev.push(b); }
    if (prev.length >= 3) { prev.sort((a, b) => a - b); const med = prev[Math.floor(prev.length / 2)], df = Math.abs(bm - med); add('reg', 'انتظام ميعاد النوم', df <= 30 ? 10 : df >= 120 ? 0 : (120 - df) / 90 * 10, 10, `نمت ${z.bed} – العادي بتاعك ${pad2(Math.floor(med / 60) % 24)}:${pad2(med % 60)}`); } }
  if (m.sleepFeel) add('feel', 'إحساسك الصبح', (m.sleepFeel - 1) / 4 * 10, 10, ['وحش جداً', 'وحش', 'عادي', 'كويس', 'ممتاز'][m.sleepFeel - 1]);
  let calc = max ? Math.round(pts / max * 100) : null;
  const score = z.score != null ? (calc != null && max >= 60 ? Math.round(z.score * 0.6 + calc * 0.4) : z.score) : calc;
  if (score == null) return null;
  return { score, zepp: z.score ?? null, calc, parts, dur, z, level: score >= 75 ? 'good' : score >= 60 ? 'ok' : 'bad', stages: z.deep != null || z.rem != null };
}
const SQ_TXT = { good: ['🟢', 'نوم كويس'], ok: ['🟡', 'نوم متوسط'], bad: ['🔴', 'نوم وحش'] };
function sleepAvg(end, n = 7) { const xs = []; for (let i = 0; i < n; i++) { const q = sleepQ(addDays(end, -i)); if (q) xs.push(q.score); } return xs.length ? { avg: Math.round(xs.reduce((a, b) => a + b) / xs.length), n: xs.length } : null; }
/* تأثير النوم عليك انت: مقارنة أيام النوم الكويس بالوحش من بياناتك */
function sleepEffects() {
  const good = { st: [], ex: [], pf: [] }, bad = { st: [], ex: [], pf: [] };
  for (let i = 1; i <= 42; i++) {
    const d = addDays(today(), -i), q = sleepQ(d); if (!q) continue;
    const g = q.score >= 70 ? good : q.score < 60 ? bad : null; if (!g) continue;
    const e = eff(d); if (e.steps != null) g.st.push(e.steps);
    g.ex.push(extraOf(d));
    const ses = Object.values(S.logs).find(s => s.date === d && !s.legacy && s.rpe); if (ses) g.pf.push(ses.rpe);
  }
  const av = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  const out = [];
  if (good.st.length >= 3 && bad.st.length >= 3) out.push(`الخطوات: <b>${fmt(av(good.st))}</b> بعد نوم كويس vs <b>${fmt(av(bad.st))}</b> بعد نوم وحش`);
  if (good.ex.length >= 3 && bad.ex.length >= 3) out.push(`أكل زيادة: <b>${fmt(av(good.ex))}</b> سعر بعد نوم كويس vs <b>${fmt(av(bad.ex))}</b> بعد نوم وحش`);
  if (good.pf.length >= 2 && bad.pf.length >= 2) out.push(`صعوبة التمرين: <b>${fmt(av(good.pf), 1)}</b>/10 بعد نوم كويس vs <b>${fmt(av(bad.pf), 1)}</b>/10 بعد نوم وحش`);
  return out;
}
function sleepTips(q) {
  const t = [];
  if (!q) return t;
  if (q.dur && q.dur < 390) t.push('المدة قليلة – نام بدري نص ساعة النهارده. أسهل حاجة: الموبايل بره السرير.');
  if (q.parts.find(p => p.k === 'deep' && p.got < 14)) t.push('النوم العميق قليل: متتمرنش تقيل قبل النوم بأقل من ساعتين، وخلي العشا قبل النوم بساعة ونص على الأقل، والأوضة ضلمة وباردة (18–20°).');
  if (q.parts.find(p => p.k === 'rem' && p.got < 14)) t.push('الـ REM قليل: ده بيجي آخر الليل – الصحيان بدري أو المنبّه بيقصّه. ثبّت ميعاد الصحيان حتى الإجازة.');
  if (q.parts.find(p => p.k === 'awake' && p.got < 6)) t.push('صحيت كتير بالليل: قلّل المية آخر ساعة قبل النوم، ومتشربش القهوة بعد 2 الضهر.');
  if (q.parts.find(p => p.k === 'reg' && p.got < 6)) t.push('ميعاد نومك متلخبط: الجسم بيرتاح أكتر لما الميعاد ثابت ± نص ساعة.');
  if (q.level === 'bad') t.push('النهارده: الجوع هيبقى أعلى من العادي – خليك على البروتين كامل، وزوّد خضار مش سعرات. والتمرين بيتظبط لوحده على جاهزيتك.');
  return t;
}
function sleepSheet(d = today()) {
  const q = sleepQ(d), m = S.days[d] || {}, av = sleepAvg(d), fx = sleepEffects();
  openSheet(sheetHead('😴 نومك', `ليلة ${nice(addDays(d, -1))}`) + `
    ${q ? `<div class="tiles mt"><div class="tile"><small>جودة النوم</small><b class="num">${q.score}<span style="font-size:15px">/100</span></b><div class="sub">${SQ_TXT[q.level].join(' ')}${q.zepp != null ? ` · Zepp ${q.zepp}` : ''}</div></div><div class="tile"><small>متوسط آخر ${av ? av.n : 0} ليالي</small><b class="num">${av ? av.avg : '—'}</b><div class="sub">الهدف 75+</div></div></div>
      ${q.parts.map(p => `<div class="hrow"><span class="v" style="font-weight:600">${p.label}<small>${esc(p.txt)}</small></span><span class="d num"><b class="${p.got / p.of >= .75 ? 'up' : p.got / p.of < .5 ? 'down' : ''}">${p.got}/${p.of}</b></span></div>`).join('')}
      ${!q.stages ? `<p class="muted small" style="line-height:1.7">مراحل النوم (عميق / REM / صحيان) لسه مش بتتقرا. التطبيق بيفتح صفحة النوم في Zepp Active لوحده الصبح – لو فضلت فاضية ابعتلي سكرين شوت من صفحة النوم.</p>` : ''}` : '<p class="muted mt">لسه مفيش بيانات نوم لليلة دي.</p>'}
    <div class="field"><span>صحيت حاسس إزاي؟</span><div class="grid3" style="grid-template-columns:repeat(5,1fr);gap:6px">${['وحش جداً', 'وحش', 'عادي', 'كويس', 'ممتاز'].map((o, i) => `<button class="chip" data-sf="${i + 1}" style="justify-content:center;white-space:normal;text-align:center;padding:8px 2px;${m.sleepFeel === i + 1 ? 'background:var(--red);color:#fff' : ''}">${o}</button>`).join('')}</div></div>
    ${sleepTips(q).length ? `<div class="section-t">أعمل إيه؟</div>${sleepTips(q).map(x => `<div class="note"><span class="i">i</span><span>${x}</span></div>`).join('')}` : ''}
    <div class="section-t">النوم بيأثر على البرنامج إزاي</div>
    <div class="card pad"><p class="small" style="line-height:1.9;margin:0">
      • <b>التمرين:</b> جودة أقل من 65 = مجموعة أقل من كل تمرين، وأقل من 50 = نص المجموعات وRIR 3.<br>
      • <b>السعرات:</b> لو متوسط الأسبوع أقل من 60، مش هنقلل سعرات حتى لو الوزن واقف – في دراسة على ناس في دايت، اللي نام 5.5 ساعة خسر دهون أقل بـ55% وعضل أكتر من اللي نام 8.5 بنفس الأكل.<br>
      • <b>الجوع:</b> ليلة وحشة بتعلّي هرمون الجوع – اليوم اللي بعدها الكابتن بيفكّرك تمسك البروتين.</p>
      ${fx.length ? `<div class="section-t" style="margin-top:14px">من بياناتك انت</div><p class="small" style="line-height:1.9;margin:0">${fx.join('<br>')}</p>` : '<p class="muted small" style="margin:10px 0 0">بعد كام أسبوع هقولك النوم بيأثر عليك انت بالأرقام (خطوات، أكل زيادة، صعوبة التمرين).</p>'}</div>
    <div class="section-t">آخر 7 ليالي</div>
    ${[...Array(7)].map((_, i) => { const dd = addDays(d, -i), qq = sleepQ(dd); return `<div class="hrow"><span class="d num">${short(dd)}</span><span class="v">${qq ? `<b>${qq.score}</b> ${SQ_TXT[qq.level][0]} · ${qq.dur ? `${Math.floor(qq.dur / 60)}:${pad2(qq.dur % 60)}` : '—'}${qq.z.deep != null ? ` · عميق ${qq.z.deep}د` : ''}${qq.z.rem != null ? ` · REM ${qq.z.rem}د` : ''}` : '—'}</span></div>`; }).join('')}
    <label class="field" style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="bedOn" ${S.settings.bedRemind ? 'checked' : ''} style="width:22px;height:22px"><span style="margin:0">فكّرني أقفل الشاشات قبل النوم بنص ساعة</span></label>
    <label class="field"><span>ميعاد النوم</span><input id="bedT" class="inp num" type="time" value="${S.settings.bedTime || '00:00'}"></label>
    <button class="btn red block mt" id="sqSave">حفظ</button>`, p => {
    let sf = m.sleepFeel || null;
    p.querySelectorAll('[data-sf]').forEach(b => b.onclick = () => { sf = +b.dataset.sf; p.querySelectorAll('[data-sf]').forEach(x => { const on = x === b; x.style.background = on ? 'var(--red)' : ''; x.style.color = on ? '#fff' : ''; }); });
    $('#sqSave', p).onclick = () => { const x = (S.days[d] = S.days[d] || {}); if (sf) x.sleepFeel = sf; S.settings.bedRemind = $('#bedOn', p).checked; S.settings.bedTime = $('#bedT', p).value || '00:00'; save(); scheduleReminders(); closeSheet(); render(); toast('اتحفظ ✓'); };
  });
}

function readiness(d = today()) {
  const e = eff(d); let score = 0; const why = [];
  const sl = e.sleep, q = sleepQ(d);
  let sp = 0;
  if (sl != null) { if (sl < 330) sp = -2; else if (sl < 390) sp = -1; }
  if (q) { const qp = q.score < 50 ? -2 : q.score < 65 ? -1 : 0; if (qp < sp) sp = qp; }
  if (sp) { score += sp; why.push(q ? `جودة النوم ${q.score}${sl ? ` (${r1(sl / 60)} ساعة)` : ''}` : `نوم ${r1(sl / 60)} ساعة`); }
  let pain = false;
  for (const s of Object.values(S.logs)) {
    if (!s.date || s.legacy) continue; const g = diffDays(d, s.date); if (g < 0 || g > 5) continue;
    if ((s.flags || []).length) pain = true;
    for (const a of Object.values(s.ex)) if (a.some(x => x.p != null && x.p > 3)) pain = true;
  }
  if (pain) { score -= 1; why.push('وجع فوق 3 في آخر 5 أيام'); }
  let run = 0; for (let i = 1; i <= 3; i++) { const dd = addDays(d, -i); if (Object.values(S.logs).some(s => s.date === dd && !s.legacy && Object.values(s.ex).some(a => a.length))) run++; else break; }
  if (run >= 2) { score -= 1; why.push(`${run} أيام تمرين ورا بعض`); }
  const feel = (S.days[d] || {}).feel;
  if (feel === 'tired') { score -= 2; why.push('حاسس بإرهاق'); } else if (feel === 'meh') { score -= 1; why.push('حاسس نص نص'); }
  return { level: score <= -2 ? 'red' : score === -1 ? 'yellow' : 'green', why, feel };
}
const READY_TXT = { green: ['🟢 جاهز', 'اتمرن عادي.'], yellow: ['🟡 نص نص', 'هشيل مجموعة من كل تمرين النهارده.'], red: ['🔴 مرهق', 'خفيف: نص المجموعات وRIR 3 – أو خليه راحة وامشي 30 دقيقة.'] };

/* ================= نسبة الالتزام ================= */
function adherence(w) {
  const t = today(), start = addDays(S.settings.start, (w - 1) * 7), end = addDays(start, 6);
  if (t < start) return null;
  const days = []; for (let d = start; d <= end && d <= t; d = addDays(d, 1)) days.push(d);
  const past = days.filter(d => d < t), isToday = days.includes(t);
  const ratio = (test, onlyPast) => { let n = 0, ok = 0; for (const d of past) { n++; if (test(d)) ok++; } if (isToday && !onlyPast && test(t)) { n++; ok++; } return n ? ok / n : null; };
  const plan = weekPlan(w).filter(x => x.date < t || (x.date === t && x.done));
  const parts = {
    wo: plan.length ? plan.filter(x => x.done).length / plan.length : null,
    meals: ratio(d => Object.values((S.days[d] || {}).meals || {}).filter(Boolean).length >= 2),
    steps: past.length ? past.reduce((a, d) => a + Math.min(1, (eff(d).steps || 0) / S.settings.steps), 0) / past.length : null,
    weight: ratio(d => !!eff(d).w),
    cr: ratio(d => !!(S.days[d] || {}).creatine)
  };
  const W = { wo: .35, meals: .2, steps: .2, weight: .15, cr: .1 };
  let sum = 0, wsum = 0; for (const [k, v] of Object.entries(parts)) if (v != null) { sum += v * W[k]; wsum += W[k]; }
  return wsum ? { score: Math.round(sum / wsum * 100), parts } : null;
}
function adherenceStreak() {
  let n = 0; for (let w = curWeek() - 1; w >= 1; w--) { const a = adherence(w); if (a && a.score >= 80) n++; else break; }
  return n;
}
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
  const pl = plateau(ex);
  if (pl) return { txt: `آخر مرة: ${lastTxt}. <b>ثابت 3 حصص</b> من ${short(pl.since)} – جرّب نطاق ${pl.next[0]}–${pl.next[1]} عدة بوزن ${pl.next[0] > hi ? 'أخف' : 'أتقل'} عشان الجسم ياخد إشارة جديدة.`, w: top, plateau: pl };
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
      if (h.wd) continue; // الساعة مباشرة أدق
      if (v.steps != null) h.zsteps = v.steps;
      if (v.active != null) h.zactive = v.active;
      if (v.sleepMin != null) h.zsleep = v.sleepMin;
      if (v.hr != null) h.zhr = v.hr;
      const sq = {}; for (const k of ['score', 'deep', 'light', 'rem', 'awake', 'bed', 'wake', 'resp', 'rhr']) if (v['s_' + k] != null) sq[k] = v['s_' + k];
      if (Object.keys(sq).length) h.zsq = sq;
    }
    if (r.rawSleep) S.settings.zRawSleep = r.rawSleep.slice(0, 1500);
    for (const [d, w] of Object.entries(data.workouts || {})) { const h = (S.health[d] = S.health[d] || {}); if (h.wd) continue; h.wkcal = w.kcal; h.wmin = w.min; }
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
    <p style="line-height:1.8">Lifestyle بيقرا الخطوات والسعرات والنوم من Zepp Active، والوزن وتحليل الجسم من OKOK وانت بتتوزن (افتح شاشة <b>التفاصيل</b> بعد الوزن). الخدمة مقفولة على التطبيقين دول بس.</p>
    <div class="note"><span class="i">1</span><span>اضغط الزرار ده ← هتفتح صفحة معلومات التطبيق ← اضغط <b>⋮</b> فوق ← <b>السماح بالإعدادات المقيدة</b> (Allow restricted settings). لو مش ظاهرة، كمّل للخطوة 2 الأول.</span></div>
    <button class="btn ghost block mt sm" id="z1">افتح معلومات التطبيق</button>
    <div class="note mt"><span class="i">2</span><span>اضغط الزرار ده ← <b>التطبيقات المثبتة</b> (Downloaded apps) ← <b>Lifestyle – قراءة الساعة</b> ← شغّلها ← وافق.</span></div>
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
let WD = null;
try { if (native) WD = Cap.registerPlugin ? Cap.registerPlugin('WatchDirect') : Cap.Plugins.WatchDirect; } catch (e) { WD = null; }
/* ================= التحديث من جوه التطبيق ================= */
let UP = null;
try { if (native) UP = Cap.registerPlugin ? Cap.registerPlugin('Updater') : Cap.Plugins.Updater; } catch (e) { UP = null; }
let upInfo = null;
async function upCheck(show) {
  if (!UP) { if (show) toast('ده شغال في تطبيق الأندرويد بس'); return; }
  try { upInfo = await UP.check(); } catch (e) { if (show) toast(String(e.message || e)); return; }
  S.settings.upChecked = Date.now(); save();
  if (show || (upInfo.available && S.settings.upSeen !== upInfo.latest && $('#sheet').hidden && $('#player').hidden)) { S.settings.upSeen = upInfo.latest; save(); updateSheet(); }
}
function updateSheet() {
  const u = upInfo || {};
  openSheet(sheetHead('تحديث التطبيق', u.current ? `نسختك رقم ${u.current}` : '') + (u.available ? `
    <div class="verdict ok"><h3>فيه نسخة جديدة 🎉</h3><p>رقم ${u.latest} – بياناتك هتفضل زي ما هي.</p></div>
    <div class="note mt"><span class="i">1</span><span>اضغط <b>حدّث دلوقتي</b> واستنى التحميل.</span></div>
    <div class="note"><span class="i">2</span><span>هتطلعلك شاشة التسطيب ← اضغط <b>تحديث</b>. (أول مرة بس هيطلب إذن "التثبيت من المصدر ده" ← وافق وارجع.)</span></div>
    <div class="note"><span class="i">3</span><span>لو Play Protect اعترض ← اضغط <b>تفاصيل أكتر</b> ← <b>ثبّت على أي حال</b>.</span></div>
    <button class="btn red block mt" id="upGo">حدّث دلوقتي</button>` : `
    <div class="verdict ok"><h3>إنت على آخر نسخة ✅</h3><p>التطبيق بيشوف لوحده كل ما تفتحه، ولو فيه جديد هيقولك.</p></div>
    <button class="btn ghost block mt" id="upAgain">شوف تاني</button>`), p => {
    const a = $('#upAgain', p); if (a) a.onclick = () => { closeSheet(); upCheck(true); };
    const g = $('#upGo', p); if (g) g.onclick = async () => {
      try { const c = await UP.canInstall(); if (!c.ok) { toast('وافق على "السماح من المصدر ده" وارجع اضغط تاني'); await UP.allowInstall(); return; } } catch (e) { }
      g.disabled = true; g.textContent = 'بينزّل…';
      let h = null; try { h = await UP.addListener('progress', e => { if (e.pct >= 0) g.textContent = `بينزّل… ${e.pct}%`; }); } catch (e) { }
      try { await UP.install(); g.textContent = 'كمّل في شاشة التسطيب'; } catch (e) { toast(String(e.message || e)); g.disabled = false; g.textContent = 'حدّث دلوقتي'; }
      try { h && h.remove(); } catch (e) { }
    };
  });
}
/* ================= الساعة مباشرة (من غير Zepp Active) ================= */
const tISO = t => iso(new Date(t * 1000));
const tHM = t => { const x = new Date(t * 1000); return `${pad2(x.getHours())}:${pad2(x.getMinutes())}`; };
/* بنحط بيانات الساعة في نفس خانات Zepp (zsteps/zactive/zsleep/zsq) وبنعلّمها wd عشان قارئ الشاشة ميكتبش فوقها */
function watchMerge(r) {
  const W = (S.watch = S.watch || {});
  W.at = Date.now(); W.name = r.name || W.name; W.mac = r.mac || W.mac;
  if (r.battery != null) { W.battery = r.battery; W.charging = !!r.charging; }
  if (r.version) W.version = r.version;
  const H = d => (S.health[d] = S.health[d] || {});
  if (r.today) {
    const h = H(today()), t = r.today;
    if (t.steps > 0 && t.steps < 1e5) h.zsteps = t.steps; // سجل الأيام تحت بيكتب فوقه لو موجود
    if (t.kcal > 0 && t.kcal < 5000) h.zactive = t.kcal;
    if (t.hr) h.zhr = t.hr;
    h.wd = 1; W.today = Object.assign({ at: Date.now() }, t);
  }
  for (const x of r.days || []) {
    if (!x.time) continue;
    const d = tISO(x.time + 120), h = H(d); // السجل بيبدأ نص ليل نفس اليوم (أحياناً ±ثانية)
    if (x.steps != null) h.zsteps = x.steps;
    if (x.kcal != null) h.zactive = x.kcal;
    if (x.avgHR) h.zhr = x.avgHR;
    if (x.minHR) h.rhr = x.minHR;
    if (x.spo2) h.spo2 = x.spo2;
    if (x.stress) h.stress = x.stress;
    h.wd = 1;
  }
  for (const sl of r.sleeps || []) {
    if (!sl.end || sl.nap) continue;
    const d = tISO(sl.end), h = H(d);
    let awake = 0, deep = 0, light = 0, rem = 0;
    for (const [k, m] of sl.stages || []) { if (k === 2) awake += m; else if (k === 0) deep += m; else if (k === 1) light += m; else if (k === 3) rem += m; }
    if (!deep && !light) { deep = sl.deep || 0; light = sl.light || 0; rem = sl.rem || 0; }
    const sq = Object.assign({}, h.zsq || {}, { deep, light, rem, awake, bed: tHM(sl.start), wake: tHM(sl.end) });
    delete sq.score; // الساعة مش بتدّي سكور – الكابتن بيحسبه
    h.zsq = sq; h.zsleep = deep + light + rem; h.wd = 1;
    (W.stages = W.stages || {})[d] = (sl.stages || []).slice(0, 200);
  }
  if (r.hr && r.hr.length) W.hr = r.hr.slice(-600);
  if (r.workouts) {
    const by = {};
    for (const w of r.workouts) { if (!w.begin) continue; const d = tISO(w.begin); (by[d] = by[d] || { kcal: 0, min: 0, list: [] }); by[d].kcal += w.kcal || 0; by[d].min += Math.round((w.sec || 0) / 60); by[d].list.push(w); }
    for (const [d, v] of Object.entries(by)) { const h = H(d); h.wkcal = v.kcal; h.wmin = v.min; }
    W.workouts = r.workouts.slice(-20);
  }
  if (W.stages) for (const d of Object.keys(W.stages)) if (d < addDays(today(), -10)) delete W.stages[d];
  save();
}
let wdBusy = false;
async function watchSync(manual) {
  if (!WD || wdBusy) return false;
  if (!manual && Date.now() - ((S.watch || {}).at || 0) < 45 * 60e3) return false;
  wdBusy = true;
  try {
    const r = await WD.sync({ days: 7, hrDays: 2, log: !!manual });
    watchMerge(r);
    if (manual && ghOn() && S.settings.wdDebug) { try { await ghPut(`debug/watch-${Date.now()}.json`, b64(JSON.stringify(r, null, 1)), 'watch sync'); } catch (e) { } }
    S.settings.wdLastLog = (r.log || '').slice(-3000); S.settings.wdFail = 0; save();
    return true;
  } catch (e) {
    S.settings.wdFail = (S.settings.wdFail || 0) + 1; S.settings.wdLastErr = String(e.message || e); save();
    if (manual) toast(String(e.message || e));
    return false;
  } finally { wdBusy = false; }
}
function hrSvg(hr) {
  if (!hr || hr.length < 3) return '';
  const now = Date.now() / 1000, from = now - 24 * 3600, pts = hr.filter(x => x[0] >= from);
  if (pts.length < 3) return '';
  const lo = Math.min(...pts.map(p => p[1])) - 5, hi = Math.max(...pts.map(p => p[1])) + 5, W = 320, Hh = 90;
  const xy = p => `${((p[0] - from) / (now - from) * W).toFixed(1)},${(Hh - (p[1] - lo) / (hi - lo) * Hh).toFixed(1)}`;
  return `<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;height:90px;display:block"><polyline fill="none" stroke="#ff6a2b" stroke-width="1.6" stroke-linejoin="round" points="${pts.map(xy).join(' ')}"/></svg>
    <div class="muted small" style="display:flex;justify-content:space-between"><span>من 24 ساعة</span><span>أقل ${Math.min(...pts.map(p => p[1]))} · أعلى ${Math.max(...pts.map(p => p[1]))}</span><span>دلوقتي</span></div>`;
}
function stagesBar(st) {
  if (!st || !st.length) return '';
  const col = { 0: '#5b2fa0', 1: '#a98be0', 2: '#ffb020', 3: '#3d9bff', 4: '#ccc' }, tot = st.reduce((a, x) => a + x[1], 0) || 1;
  return `<div style="display:flex;height:22px;border-radius:8px;overflow:hidden;margin:8px 0">${st.map(([k, m]) => `<i style="flex:${m / tot};background:${col[k] || '#ddd'}"></i>`).join('')}</div>
    <div class="muted small" style="display:flex;gap:10px;flex-wrap:wrap"><span style="color:#5b2fa0">■ عميق</span><span style="color:#a98be0">■ خفيف</span><span style="color:#3d9bff">■ أحلام</span><span style="color:#ffb020">■ صاحي</span></div>`;
}
const WD_SOON = [
  ['⌚', 'شكل الساعة', 'صورة من عندك كخلفية للساعة'],
  ['⏰', 'المنبّه', 'تظبطه من التطبيق'],
  ['⭐', 'الأرقام المفضلة', 'أسماء تتحط في الساعة'],
  ['🌤️', 'الطقس والمزيكا', '']
];
const FWD_APPS = [['com.whatsapp', 'واتساب'], ['com.facebook.orca', 'ماسنجر'], ['com.facebook.katana', 'فيسبوك'], ['com.instagram.android', 'انستجرام'], ['com.google.android.gm', 'Gmail'], ['org.telegram.messenger', 'تيليجرام'], ['com.google.android.apps.messaging', 'الرسايل (SMS)'], ['com.microsoft.office.outlook', 'Outlook'], ['com.linkedin.android', 'LinkedIn']];
const fwdDefault = () => ({ on: true, calls: true, self: true, known: true, others: false, apps: {} });
let wTab = 'data', wSt = null, wCfg = null, wCfgErr = '';
async function watchDirectSheet(tab) {
  if (tab) wTab = tab;
  wSt = null;
  if (WD) { try { wSt = await WD.status(); } catch (e) { wSt = null; } }
  watchPage();
}
/* ---------- إعدادات الساعة: قراءة/كتابة البايتات ---------- */
const hx2b = h => { const b = []; for (let i = 0; i + 1 < (h || '').length; i += 2) b.push(parseInt(h.substr(i, 2), 16)); return b; };
const b2hx = b => b.map(x => (x & 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const rd = (b, o, n) => { let v = 0; for (let i = 0; i < n; i++) v += (b[o + i] || 0) * 2 ** (8 * i); return v; };
const wr = (b, o, n, v) => { for (let i = 0; i < n; i++) b[o + i] = Math.floor(v / 2 ** (8 * i)) & 255; };
const m2t = m => `${pad2(Math.floor((m || 0) / 60) % 24)}:${pad2((m || 0) % 60)}`;
const t2m = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const WSET = {
  sed: { get: '0203', set: '0303', len: 12, name: 'تذكير الحركة', sub: 'لو قعدت كتير الساعة تهزّ وتقولك قوم',
    parse: b => ({ on: b[0] === 1, from: rd(b, 4, 2), to: rd(b, 6, 2), every: rd(b, 8, 2), steps: rd(b, 10, 2) }),
    build: (b, v) => { b[0] = v.on ? 1 : 0; wr(b, 4, 2, v.from); wr(b, 6, 2, v.to); wr(b, 8, 2, v.every); wr(b, 10, 2, v.steps); } },
  water: { get: '0205', set: '0305', len: 8, name: 'تذكير المية', sub: 'كل شوية تفكّرك تشرب',
    parse: b => ({ on: b[6] === 1, from: rd(b, 0, 2), to: rd(b, 2, 2), week: rd(b, 4, 2) }),
    build: (b, v) => { wr(b, 0, 2, v.from); wr(b, 2, 2, v.to); wr(b, 4, 2, v.week || 127); b[6] = v.on ? 1 : 0; } },
  dnd: { get: '0206', set: '0306', len: 8, name: 'عدم الإزعاج', sub: 'مفيش هزّ ولا إشعارات في الوقت ده',
    parse: b => ({ on: b[4] === 1, from: rd(b, 0, 2), to: rd(b, 2, 2) }),
    build: (b, v) => { wr(b, 0, 2, v.from); wr(b, 2, 2, v.to); b[4] = v.on ? 1 : 0; } },
  lift: { get: '0208', set: '0308', len: 8, name: 'رفع الإيد ينوّر الشاشة', sub: '',
    parse: b => ({ on: b[4] === 1, from: rd(b, 0, 2), to: rd(b, 2, 2) }),
    build: (b, v) => { wr(b, 0, 2, v.from); wr(b, 2, 2, v.to); b[4] = v.on ? 1 : 0; } },
  goal: { get: '0209', set: '0309', len: 40, name: 'هدف اليوم على الساعة', sub: '',
    parse: b => ({ steps: rd(b, 8, 4), kcal: rd(b, 12, 4), dist: rd(b, 16, 4), exMin: rd(b, 20, 4) }),
    build: (b, v) => { b[0] = 1; wr(b, 8, 4, v.steps); } }
};
async function wCfgLoad() {
  wCfgErr = '';
  try {
    const r = await WD.readRaw({ cmds: Object.values(WSET).map(x => x.get) });
    wCfg = {};
    for (const [k, d] of Object.entries(WSET)) {
      const h = r[d.get];
      if (!h || h.startsWith('ERR')) { wCfg[k] = null; continue; }
      const b = hx2b(h); wCfg[k] = { raw: b, v: d.parse(b) };
    }
  } catch (e) { wCfgErr = String(e.message || e); wCfg = null; }
}
async function wCfgSave(k, v) {
  const d = WSET[k], cur = wCfg && wCfg[k];
  const b = (cur ? cur.raw.slice() : []).concat(Array(Math.max(0, d.len - (cur ? cur.raw.length : 0))).fill(0)).slice(0, Math.max(d.len, cur ? cur.raw.length : 0));
  d.build(b, v);
  await WD.sendRaw({ cmd: d.set, hex: b2hx(b) });
  wCfg[k] = { raw: b, v: d.parse(b) };
}
/* برنامج محمد: صحيان ~6:30، شغل 8–5، نوم ~11:30 */
const MY_WATCH = {
  goal: { steps: 8000 },
  sed: { on: true, from: 9 * 60, to: 21 * 60, every: 60, steps: 0 },
  water: { on: true, from: 8 * 60, to: 21 * 60, week: 127 },
  dnd: { on: true, from: 23 * 60 + 30, to: 6 * 60 + 30 },
  lift: { on: true, from: 6 * 60, to: 23 * 60 + 30 }
};
function settingsTab() {
  if (!WD) return '<p class="muted">الإعدادات بتشتغل في تطبيق الأندرويد بس.</p>';
  if (!wCfg) return wCfgErr ? `<div class="verdict warn"><h3>مقدرتش أقرا إعدادات الساعة</h3><p>${esc(wCfgErr)}</p></div><button class="btn red block mt" id="wsLoad">جرّب تاني</button>` : '<p class="muted" style="text-align:center;padding:30px 0">بيقرا إعدادات الساعة…</p>';
  const row = (k, inner) => { const d = WSET[k], c = wCfg[k]; if (!c) return ''; return `<div class="card pad mt" data-ws="${k}"><div style="display:flex;align-items:center;gap:10px"><div style="flex:1"><b>${d.name}</b>${d.sub ? `<div class="muted small">${d.sub}</div>` : ''}</div>
      ${'on' in c.v ? `<button class="wtog ${c.v.on ? 'on' : ''}" data-on>${c.v.on ? '✓ شغال' : 'مقفول'}</button>` : ''}</div>${inner(c.v)}</div>`; };
  const range = v => `<div class="grid2 mt"><label class="small">من<input type="time" data-f="from" value="${m2t(v.from)}" class="inp"></label><label class="small">لـ<input type="time" data-f="to" value="${m2t(v.to)}" class="inp"></label></div>`;
  return `<button class="btn red block" id="wsMine">⚡ ظبّط الساعة على برنامجك</button>
    <p class="muted small" style="line-height:1.8;margin:8px 0 0">هدف 8,000 خطوة، تذكير حركة كل ساعة (9 الصبح لـ 9 بالليل)، تذكير مية، عدم إزعاج من 11:30 بالليل لـ 6:30 الصبح.</p>
    ${row('goal', v => `<div class="grid2 mt"><label class="small">خطوات<input type="number" inputmode="numeric" data-f="steps" value="${v.steps || 8000}" class="inp"></label><span></span></div>`)}
    ${row('sed', v => range(v) + `<div class="grid2 mt"><label class="small">كل (دقيقة)<input type="number" inputmode="numeric" data-f="every" value="${v.every || 60}" class="inp"></label><span></span></div>`)}
    ${row('water', range)}
    ${row('dnd', range)}
    ${row('lift', range)}
    <button class="btn ghost block mt" id="wsSave">احفظ التعديلات في الساعة</button>
    <div class="section-t">الساعة</div>
    <div class="grid2"><button class="btn ghost sm" id="wdFind">📳 دوّر على الساعة</button><button class="btn ghost sm" id="wsLoad">🔄 اقرا الإعدادات تاني</button></div>
    <div class="section-t">جاي في التحديثات الجاية</div>
    ${WD_SOON.map(x => `<div class="hrow"><span class="v">${x[0]} ${x[1]}${x[2] ? `<small>${x[2]}</small>` : ''}</span><span class="d muted small">قريب</span></div>`).join('')}
    <button class="btn ghost block sm mt" id="wdLog">انسخ السجل (لو فيه مشكلة ابعتهولي)</button>`;
}
function dataTab() {
  const W = S.watch || {}, t = W.today || {}, d0 = today(), h = S.health[d0] || {};
  const lastNight = h.zsq, stg = (W.stages || {})[d0];
  return `<div class="section-t">النهارده</div>
    <div class="hrow"><span class="v">خطوات</span><span class="d num"><b>${fmt(h.zsteps)}</b> / 8,000</span></div>
    <div class="hrow"><span class="v">سعرات الحركة</span><span class="d num">${fmt(h.zactive)}</span></div>
    ${t.hr ? `<div class="hrow"><span class="v">النبض دلوقتي</span><span class="d num">${t.hr} ❤️</span></div>` : ''}
    ${lastNight ? `<div class="section-t">نوم امبارح</div>
      <div class="hrow"><span class="v">من ${esc(lastNight.bed || '—')} لـ ${esc(lastNight.wake || '—')}</span><span class="d num">${h.zsleep ? `${Math.floor(h.zsleep / 60)}:${pad2(h.zsleep % 60)} ساعة` : ''}</span></div>
      ${stagesBar(stg)}
      <p class="small" style="margin:6px 0 0;line-height:1.9">عميق <b>${lastNight.deep ?? '—'}</b> د · خفيف <b>${lastNight.light ?? '—'}</b> د · أحلام <b>${lastNight.rem ?? '—'}</b> د · صاحي <b>${lastNight.awake ?? '—'}</b> د</p>` : ''}
    ${hrSvg(W.hr) ? `<div class="section-t">النبض آخر 24 ساعة</div><div class="card pad">${hrSvg(W.hr)}</div>` : ''}
    ${(W.workouts || []).length ? `<div class="section-t">تمارين سجّلتها الساعة</div>${W.workouts.slice(-5).reverse().map(w => `<div class="hrow"><span class="v">${new Date(w.begin * 1000).toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' })} · ${Math.round((w.sec || 0) / 60)} د</span><span class="d num">${w.kcal || 0} سعر · نبض ${w.avgHR || '—'}</span></div>`).join('')}` : ''}
    <p class="muted small mt" style="line-height:1.8">التطبيق بيقرا من الساعة لوحده كل ما تفتحه (كل 45 دقيقة بالكتير).</p>`;
}
function notifTab(st) {
  if (!st) return '<p class="muted">الإشعارات بتشتغل في تطبيق الأندرويد بس.</p>';
  let c = {}; try { c = JSON.parse(st.fwd || '{}'); } catch (e) { }
  if (c.on == null) c = fwdDefault();
  const tg = (k, label, on, sub) => `<button class="hrow" data-fw="${k}" style="width:100%;border:0;background:none;text-align:inherit"><span class="v">${label}${sub ? `<small>${sub}</small>` : ''}</span><span class="d"><b class="${on ? 'up' : 'muted'}">${on ? '✓ شغال' : 'مقفول'}</b></span></button>`;
  const appOn = pk => c.apps && pk in c.apps ? !!c.apps[pk] : c.known !== false;
  if (!st.notifAccess) return `<div class="note"><span class="i">1</span><span>اضغط الزرار ← هتفتح صفحة ← شغّل <b>Lifestyle</b> ← وافق. (لو قالك "إعدادات مقيدة": معلومات التطبيق ← ⋮ ← السماح بالإعدادات المقيدة)</span></div>
      <button class="btn red block mt sm" id="fwAcc">اسمح لـ Lifestyle يقرا الإشعارات</button>`;
  return `${tg('on', 'توصيل الإشعارات للساعة', c.on)}
    ${c.on ? `<div class="section-t">المكالمات والكابتن</div>
      ${tg('calls', '📞 المكالمات', c.calls !== false, 'اسم المتصل يظهر والساعة تهزّ')}
      ${c.calls !== false && !st.callPerm ? `<div class="note mt"><span class="i">📞</span><span>عشان المكالمات تظهر باسم المتصل: اضغط الزرار ← وافق على كل الأذونات.</span></div><button class="btn red block sm mt" id="fwCall">اسمح بالمكالمات</button>` : ''}
      ${tg('self', '💪 تذكيرات Lifestyle', c.self !== false, 'الراحة بين السِتات، الكرياتين، المية، النوم، رسالة الكابتن')}
      <div class="section-t">التطبيقات</div>
      ${FWD_APPS.map(([pk, n]) => tg('app:' + pk, n, appOn(pk))).join('')}
      ${tg('others', 'أي تطبيق تاني', !!c.others)}
      <button class="btn ghost block sm mt" id="fwTest">ابعت رسالة تجربة للساعة</button>
      <p class="muted small mt" style="line-height:1.8">⚠️ عشان الرسايل متوصلش مرتين: اقفل الإشعارات من Zepp Active.</p>` : ''}`;
}
function watchPage() {
  const W = S.watch || {}, st = wSt;
  const ago = W.at ? Math.round((Date.now() - W.at) / 6e4) : null;
  const tabs = [['data', 'البيانات'], ['notif', 'الإشعارات'], ['set', 'الإعدادات']];
  openSheet(sheetHead('الساعة', W.name ? esc(W.name) : 'Amazfit Pop 3R') + `
    <div class="card pad" style="display:flex;align-items:center;gap:12px">
      <div style="font-size:30px">⌚</div>
      <div style="flex:1"><b>${W.battery != null ? `البطارية ${W.battery}%${W.charging ? ' ⚡' : ''}` : 'لسه مقريناش الساعة'}</b>
        <div class="muted small">${ago == null ? 'اضغط مزامنة' : ago < 1 ? 'اتزامنت دلوقتي' : ago < 60 ? `آخر مزامنة من ${ago} دقيقة` : `آخر مزامنة ${new Date(W.at).toLocaleString('ar-EG', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}`}</div></div>
      <button class="btn red sm" id="wdSync" style="flex:0 0 auto;width:auto;min-width:0;padding:0 18px;height:40px">مزامنة</button>
    </div>
    <div class="seg plain mt" style="margin:12px 0 4px">${tabs.map(([k, n]) => `<button class="${wTab === k ? 'on' : ''}" data-wt="${k}">${n}</button>`).join('')}</div>
    <div id="wBody">${wTab === 'data' ? dataTab() : wTab === 'notif' ? notifTab(st) : settingsTab()}</div>`, p => {
    p.querySelectorAll('[data-wt]').forEach(b => b.onclick = () => { wTab = b.dataset.wt; closeSheet(); watchPage(); });
    $('#wdSync', p).onclick = async () => {
      if (!WD) { toast('ده شغال في تطبيق الأندرويد بس'); return; }
      const b = $('#wdSync', p); b.disabled = true; b.textContent = '…';
      const ok = await watchSync(true);
      if (ok) { toast('اتزامنت ✓'); closeSheet(); render(); watchDirectSheet(); } else { b.disabled = false; b.textContent = 'مزامنة'; }
    };
    const fd = $('#wdFind', p); if (fd) fd.onclick = async () => { try { await WD.find({ log: false }); toast('الساعة بتهزّ دلوقتي 📳'); } catch (e) { toast(String(e.message || e)); } };
    const lg = $('#wdLog', p); if (lg) lg.onclick = async () => { let l = ''; try { l = (await WD.getLog()).log; } catch (e) { } copyText(`ERR: ${S.settings.wdLastErr || ''}\nCFG: ${JSON.stringify(wCfg && Object.fromEntries(Object.entries(wCfg).map(([k, v]) => [k, v && b2hx(v.raw)])))}\n${S.settings.wdLastLog || ''}\n--- link ---\n${l}`); };
    // الإشعارات
    const acc = $('#fwAcc', p); if (acc) acc.onclick = () => WD.openNotifAccess();
    const cl = $('#fwCall', p); if (cl) cl.onclick = async () => { try { await WD.askCallPerm(); } catch (e) { } closeSheet(); watchDirectSheet(); };
    const te = $('#fwTest', p); if (te) te.onclick = async () => { te.disabled = true; te.textContent = 'بيبعت…'; try { await WD.message({ title: 'الكابتن', text: 'أهلاً يا محمد 💪 الساعة مربوطة بـ Lifestyle' }); toast('اتبعتت – بص على الساعة'); } catch (e) { toast(String(e.message || e)); } te.disabled = false; te.textContent = 'ابعت رسالة تجربة للساعة'; };
    p.querySelectorAll('[data-fw]').forEach(b => b.onclick = async () => {
      let c = {}; try { c = JSON.parse(st.fwd || '{}'); } catch (e) { }
      if (c.on == null) c = fwdDefault();
      const k = b.dataset.fw;
      if (k.startsWith('app:')) { const pk = k.slice(4); c.apps = c.apps || {}; const cur = pk in c.apps ? !!c.apps[pk] : c.known !== false; c.apps[pk] = !cur; }
      else c[k] = !(k === 'others' ? !!c[k] : c[k] !== false);
      try { await WD.setForward({ cfg: c }); } catch (e) { }
      watchDirectSheet();
    });
    // الإعدادات
    if (wTab === 'set' && WD && !wCfg && !wCfgErr) wCfgLoad().then(() => { if (wTab === 'set' && !$('#sheet').hidden) { closeSheet(); watchPage(); } });
    const ld = $('#wsLoad', p); if (ld) ld.onclick = () => { wCfg = null; wCfgErr = ''; closeSheet(); watchPage(); };
    p.querySelectorAll('[data-ws] [data-on]').forEach(b => b.onclick = () => { const on = !b.classList.contains('on'); b.classList.toggle('on', on); b.textContent = on ? '✓ شغال' : 'مقفول'; });
    const collect = () => { const out = {}; p.querySelectorAll('[data-ws]').forEach(card => { const k = card.dataset.ws, v = Object.assign({}, wCfg[k].v); const t = $('[data-on]', card); if (t) v.on = t.classList.contains('on'); card.querySelectorAll('[data-f]').forEach(i => { v[i.dataset.f] = i.type === 'time' ? t2m(i.value) : +i.value || 0; }); out[k] = v; }); return out; };
    const saveAll = async (vals, btn, label) => {
      btn.disabled = true; btn.textContent = 'بيكتب في الساعة…';
      let bad = [];
      for (const [k, v] of Object.entries(vals)) { if (!wCfg || !wCfg[k]) continue; const old = JSON.stringify(wCfg[k].v); if (JSON.stringify(Object.assign({}, wCfg[k].v, v)) === old) continue; try { await wCfgSave(k, Object.assign({}, wCfg[k].v, v)); } catch (e) { bad.push(WSET[k].name); } }
      await wCfgLoad();
      toast(bad.length ? `مقدرتش أغيّر: ${bad.join('، ')}` : 'اتحفظت في الساعة ✓');
      closeSheet(); watchPage();
    };
    const sv = $('#wsSave', p); if (sv) sv.onclick = () => saveAll(collect(), sv);
    const mn = $('#wsMine', p); if (mn) mn.onclick = () => saveAll(MY_WATCH, mn);
  });
}
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
      const add = (k, when, title, body, act) => { if (when.getTime() > now + 30000) list.push(Object.assign({ id: 1000 + i * 20 + k, title, body, schedule: { at: when, allowWhileIdle: true }, isExactNotification: false, extra: { date: d } }, act ? { actionTypeId: act } : {})); };
      const prevMom = isMomFri(addDays(d, -1));
      add(1, at(d, 6, 40), 'اتوزن ⚖️', prevMom ? 'بعد جمعة ماما الوزن هيعلى 1–2 كجم مية – عادي، اتوزن برضه.' : 'بعد الحمام وقبل الأكل، وافتح التفاصيل في OKOK.');
      add(2, at(d, 9, 10), 'الفطار + كرياتين 💊', '5 جم مع الفطار. اضغط الزرار لما تخلّص.', 'BF');
      if (dow !== 5) add(3, at(d, 15, 50), 'وجبة الشغل 🍠', 'البطاطا والزبادي والشيكولاتة – ده وقود التمرين.', 'M2');
      add(12, at(d, 13, 0), 'مية 💧', 'نص لتر دلوقتي.', 'WAT');
      add(13, at(d, 18, 0), 'مية 💧', 'نص لتر كمان.', 'WAT');
      if (dt === 'lecture') add(14, at(d, 22, 20), 'العشا النهارده كان إيه؟', 'اختار – الحسبة بتتظبط لوحدها.', 'LEC');
      else if (dt === 'mom') add(14, at(d, 20, 30), 'أكلت عند ماما قد إيه؟ 😄', 'قول الحقيقة – الكابتن مش هيزعل.', 'MOM');
      else add(14, at(d, 21, 45), 'العشا 🍗', 'فراخ ورز وسلطة – اضغط لما تخلّص.', 'M3');
      // إنقاذ: لو تمرين النهارده مخلصش، الصبح اللي بعده يفكّرك (بيتلغي أول ما تسجّل الحصة)
      if (tr && diffDays(d, S.settings.start) >= 0) {
        const ww = weekOf(d);
        if (!(isBusy(ww) && tr.optional) && !sessDone(ww, tr.key) && i < 13) {
          const nx = addDays(d, 1), nxTr = DAYS.find(x => x.dow === parseISO(nx).getDay());
          list.push({ id: 1000 + (i + 1) * 20 + 11, title: `فاتك ${tr.title} امبارح؟`, body: nxTr ? `النهارده ${nxTr.title} – لو فاتك تاني الأسبوع هيتحوّل 3 أيام لوحده.` : 'النهارده راحة – اعمله بداله بعد الشغل.', schedule: { at: at(nx, 8, 15), allowWhileIdle: true }, extra: { date: nx, go: 'home' } });
        }
      }
      if (dt === 'lecture') add(4, at(d, 16, 0), 'النهارده محاضرة 🎓', 'العشا: العلبة من البيت، أو الطبق الذكي (نص رز، من غير طرب)، أو السوري بملعقة توم واحدة.');
      if (tr) add(5, at(d, 18, 45), `تمرين النهارده: ${tr.title} 💪`, tr.sub);
      if (dt === 'mom') add(6, at(d, 12, 0), 'جمعة ماما 😄', 'البروتين الأول، طبق واحد مليان، حتة حلو واحدة. ومتصومش بكرة.');
      if (S.settings.bedRemind) { const bt = hm(S.settings.bedTime || '00:00'); const bd = bt < 12 * 60 ? addDays(d, 1) : d; const w = at(bd, Math.floor(((bt - 30 + 1440) % 1440) / 60), (bt - 30 + 1440) % 60); if (bt < 30) w.setDate(w.getDate() - 1); add(19, w, '😴 نص ساعة على النوم', 'قفّل الشاشات ونوّر خفيف – النوم الكويس = حرق دهون أحسن وجوع أقل بكرة.'); }
      if (dow === 5) add(15, at(d, 19, 30), 'تشيك إن الأسبوع ✍️', '30 ثانية: طاقة، جوع، نوم، ضغط، مزاج + الوسط.');
      if (ghOn()) add(16, at(d, 7, 50), '🧢 رسالة الكابتن', 'مراجعة امبارح جاهزة – افتح التطبيق.');
      if (tr && S.settings.gym && !sessDone(weekOf(d), tr.key) && diffDays(d, S.settings.start) >= 0) add(17, at(d, 20, 30), 'لسه موصلتش الجيم؟', '45 دقيقة من التمرين أحسن من صفر – ابدأ بالتمارين الأساسية.');
      if (S.shop && d === addDays(S.shop.start, 12)) add(18, at(d, 18, 0), '🛒 لستة السوبر ماركت', 'الأكل هيخلص بعد يومين – افتح الأكل واعمل لستة جديدة.');
      if (dow === 5) add(7, at(d, 20, 0), 'تقرير الأسبوع 📋', 'افتح التقدّم واضغط "ابعت تقرير الأسبوع للكابتن" – بيفتح Claude والتقرير جاهز.');
      { const ds = photoDates(); const due = ds.length ? addDays(ds[ds.length - 1], 28) : S.settings.start; if (d === due || (i === 0 && photoDue() && dow === 6)) add(10, at(d, 7, 0), 'صور التقدّم 📸', 'قدام، جنب، ضهر – نفس المكان والإضاءة. قبل الفطار.'); }
      const next = parseISO(addDays(d, 1)).getDay();
      if (next !== 5) add(8, at(d, 22, 0), 'جهّز علب بكرة 🍱', isLecture(addDays(d, 1)) ? 'بكرة محاضرة – جهّز علبة العشا كمان لو تقدر.' : 'الفطار + البطاطا المشوية.');
      add(9, at(d, 23, 15), 'نوم 😴', 'عشان 7–8 ساعات. وافتح Zepp Active مرة قبل ما تنام عشان خطوات النهارده تتسجل.');
    }
    if (list.length) await LN.schedule({ notifications: list });
  } catch (e) { }
}
async function setupNotifActions() {
  if (!LN) return;
  try {
    await LN.registerActionTypes({ types: [
      { id: 'BF', actions: [{ id: 'bf', title: 'فطرت وخدت الكرياتين ✓' }] },
      { id: 'M2', actions: [{ id: 'm2', title: 'أكلتها ✓' }] },
      { id: 'M3', actions: [{ id: 'm3', title: 'أكلته ✓' }] },
      { id: 'LEC', actions: [{ id: 'box', title: 'علبة البيت' }, { id: 'smart', title: 'الطبق الذكي' }, { id: 'syrian', title: 'سوري' }] },
      { id: 'MOM', actions: [{ id: 'light', title: 'معقول' }, { id: 'normal', title: 'كويس' }, { id: 'big', title: 'كتير 😅' }] },
      { id: 'WAT', actions: [{ id: 'w', title: '+½ لتر' }] }
    ] });
    LN.addListener('localNotificationActionPerformed', a => handleNotifAction(a.actionId, (a.notification && a.notification.extra) || {}));
  } catch (e) { }
}
function handleNotifAction(id, ex) {
  const d = ex.date || today(), x = day(d); x.meals = x.meals || {};
  if (id === 'tap') { if (ex.go && $('#player').hidden) { tab = ex.go; render(); } return; }
  if (id === 'bf') { x.meals.m1 = true; x.creatine = true; }
  else if (id === 'm2' || id === 'm3') x.meals[id] = true;
  else if (['box', 'smart', 'syrian', 'light', 'normal', 'big'].includes(id)) { x.choice = id; x.meals.m3 = true; }
  else if (id === 'w') x.water = r1((x.water || 0) + 0.5);
  else return;
  save(); if ($('#player').hidden) render(); toast('اتسجّل ✓');
}
async function restNotify(untilMs, body) {
  if (!LN || !S.settings.notif) return;
  try { await LN.cancel({ notifications: [{ id: REST_ID }] }); await LN.schedule({ notifications: [{ id: REST_ID, title: 'خلصت الراحة 💪', body, schedule: { at: new Date(untilMs), allowWhileIdle: true }, isExactNotification: true }] }); } catch (e) { }
}
async function restCancel() { if (!LN) return; try { await LN.cancel({ notifications: [{ id: REST_ID }] }); } catch (e) { } }
/* ================= النسخة على Google Drive ================= */
let cloudT = null, cloudBusy = false, cloudInfo = { linked: false, name: '' };
function cloudSoon(ms = 20000) { try { if (!Zepp || !cloudInfo.linked) return; clearTimeout(cloudT); cloudT = setTimeout(cloudPush, ms); } catch (e) { } }
const blobToData = b => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(b); });
async function cloudPayload() {
  const photos = {};
  for (const d of photoDates()) for (const [k] of POSES) { const b = await pGet(d + '|' + k).catch(() => null); if (b) photos[d + '|' + k] = await blobToData(b); }
  return JSON.stringify({ app: 'gym-coach', v: 2, saved: Date.now(), state: Object.assign({}, S, { active: null }), photos });
}
async function cloudPush(loud) {
  if (!Zepp || !cloudInfo.linked || cloudBusy) return false;
  cloudBusy = true;
  try { await Zepp.writeBackup({ data: await cloudPayload() }); S.meta = S.meta || {}; S.meta.pushed = Date.now(); save(true); if (loud) toast('اتحفظت على Drive ✓'); return true; }
  catch (e) { if (loud) toast(e.message || 'الحفظ على Drive فشل'); return false; }
  finally { cloudBusy = false; }
}
async function cloudRead() { const r = await Zepp.readBackup(); const j = JSON.parse(r.data || '{}'); if (j.app !== 'gym-coach' || !j.state) throw new Error('الملف ده مش نسخة من Lifestyle'); return j; }
async function cloudApply(j) {
  S = Object.assign(load(), j.state); S.meta = S.meta || {}; S.meta.updated = j.saved; S.meta.pushed = j.saved; save(true);
  for (const [k, data] of Object.entries(j.photos || {})) { try { const b = await (await fetch(data)).blob(); await pPut(k, b); delete urlCache[k]; } catch (e) { } }
}
/* لما التطبيق يتفتح: لو النسخة اللي على Drive أحدث (اتعدّلت من جهاز تاني) هاتها */
async function cloudPullIfNewer() {
  if (!Zepp) return;
  try { cloudInfo = await Zepp.backupInfo(); } catch (e) { return; }
  if (!cloudInfo.linked) return;
  try {
    const j = await cloudRead();
    const localChanged = (S.meta && S.meta.updated || 0) > (S.meta && S.meta.pushed || 0);
    if (j.saved > (S.meta && S.meta.pushed || 0) + 1000 && !localChanged) { await cloudApply(j); render(); toast('اتحدّثت البيانات من Drive ✓'); }
    else if (localChanged) cloudSoon(3000);
  } catch (e) { }
}
async function cloudSheet() {
  if (!Zepp) { toast('شغال في تطبيق الأندرويد بس'); return; }
  try { cloudInfo = await Zepp.backupInfo(); } catch (e) { }
  const onDrive = /google|drive/i.test(cloudInfo.authority || '');
  const last = S.meta && S.meta.pushed;
  openSheet(sheetHead('المزامنة مع Google Drive', 'حسابك على الجيميل') + (cloudInfo.linked ? `
    <div class="verdict ${onDrive ? 'ok' : 'warn'}"><h3>${onDrive ? '✓ مربوط بـ Google Drive' : 'مربوط بملف على الموبايل'}</h3><p>${esc(cloudInfo.name)}${last ? ` · آخر حفظ ${new Date(last).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : ''}</p></div>
    ${onDrive ? '' : '<p class="muted small">الملف ده مش على Drive، فلو الموبايل ضاع هيضيع معاه. اربط ملف جديد واختار Drive.</p>'}
    <p style="line-height:1.8">كل تعديل بيتحفظ على الملف لوحده بعد ثواني، وفيه كل حاجة: التمارين والأكل والوزن والميزان والصور.</p>
    <button class="btn red block" id="c1">احفظ دلوقتي</button>
    <button class="btn ghost block mt sm" id="c2">رجّع البيانات من الملف</button>
    <button class="btn ghost block mt sm" id="c4">غيّر الملف</button>
    <button class="btn ghost block mt sm" id="c5">فك الربط</button>` : `
    <p style="line-height:1.8">البيانات بتتحفظ في ملف على <b>Google Drive</b> بتاعك (نفس حساب الجيميل). لو غيّرت الموبايل أو مسحت التطبيق، تسطّبه وتختار الملف، وكل حاجة ترجع.</p>
    <div class="note"><span class="i">1</span><span><b>أول مرة:</b> اضغط الزرار الأحمر ← هتفتح قايمة الملفات ← اضغط <b>☰</b> واختار <b>Drive</b> (arch.mhossam@…) ← <b>حفظ</b>.</span></div>
    <button class="btn red block mt" id="c3">اعمل ملف على Drive</button>
    <div class="note mt"><span class="i">2</span><span><b>موبايل جديد:</b> اضغط ده ← اختار Drive ← افتح <b>gym-coach-backup.json</b>.</span></div>
    <button class="btn ghost block mt" id="c6">عندي ملف على Drive – رجّع بياناتي</button>`), p => {
    const pick = async create => {
      try { const r = await Zepp.pickBackup({ create }); cloudInfo = { linked: true, name: r.name, authority: r.authority }; } catch (e) { toast(e.message || 'اتلغى'); return null; }
      return true;
    };
    const b3 = $('#c3', p); if (b3) b3.onclick = async () => { if (await pick(true)) { closeSheet(); await cloudPush(true); cloudSheet(); } };
    const b6 = $('#c6', p); if (b6) b6.onclick = async () => { if (!(await pick(false))) return; try { const j = await cloudRead(); await cloudApply(j); closeSheet(); render(); toast(`رجعت البيانات ✓ (${new Date(j.saved).toLocaleDateString('ar-EG')})`); } catch (e) { toast(e.message || 'مقدرتش أقرا الملف'); } };
    const b1 = $('#c1', p); if (b1) b1.onclick = async () => { await cloudPush(true); closeSheet(); cloudSheet(); };
    const b2 = $('#c2', p); if (b2) b2.onclick = async e => { const btn = e.currentTarget; if (!btn.dataset.sure) { btn.dataset.sure = 1; btn.textContent = 'ده هيستبدل اللي على الموبايل – اضغط تاني'; return; } try { const j = await cloudRead(); await cloudApply(j); closeSheet(); render(); toast('رجعت ✓'); } catch (er) { toast(er.message || 'فشل'); } };
    const b4 = $('#c4', p); if (b4) b4.onclick = async () => { if (await pick(true)) { closeSheet(); await cloudPush(true); cloudSheet(); } };
    const b5 = $('#c5', p); if (b5) b5.onclick = async () => { await Zepp.unlinkBackup(); cloudInfo = { linked: false }; closeSheet(); render(); toast('اتفك الربط'); };
  });
}

/* ================= إرسال التقرير للكابتن ================= */
async function sendReport() {
  const txt = weeklyReport();
  if (Zepp && Zepp.shareText) {
    try { const r = await Zepp.shareText({ text: txt }); S.settings.lastReport = today(); save(); if (r.app === 'claude') toast('اتفتح Claude – اختار المحادثة وابعت'); return; } catch (e) { }
  }
  copyText(txt);
}

/* ================= صور التقدّم (على الموبايل بس – IndexedDB) ================= */
const POSES = [['front', 'قدام'], ['side', 'جنب'], ['back', 'ضهر']];
let _pdb = null;
function photoDB() {
  if (_pdb) return _pdb;
  _pdb = new Promise((res, rej) => { try { const r = indexedDB.open('gymcoach-photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('p'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); } catch (e) { rej(e); } });
  return _pdb;
}
async function pPut(key, blob) { const db = await photoDB(); return new Promise((res, rej) => { const tx = db.transaction('p', 'readwrite'); tx.objectStore('p').put(blob, key); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); }
async function pGet(key) { const db = await photoDB(); return new Promise(res => { const rq = db.transaction('p').objectStore('p').get(key); rq.onsuccess = () => res(rq.result || null); rq.onerror = () => res(null); }); }
async function pDel(key) { const db = await photoDB(); return new Promise(res => { const tx = db.transaction('p', 'readwrite'); tx.objectStore('p').delete(key); tx.oncomplete = res; }); }
const photoDates = () => Object.keys(S.photos || {}).sort();
function shrink(file) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => { const max = 1280, k = Math.min(1, max / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', 0.82); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('الصورة مش مفهومة')); };
    img.src = url;
  });
}
const urlCache = {};
async function photoURL(d, pose) { const k = d + '|' + pose; if (urlCache[k]) return urlCache[k]; const b = await pGet(k); if (!b) return null; return (urlCache[k] = URL.createObjectURL(b)); }
async function fillPhotos(root) {
  for (const el of root.querySelectorAll('[data-ph]')) { const [d, pose] = el.dataset.ph.split('|'); const u = await photoURL(d, pose); el.innerHTML = u ? `<img src="${u}" alt="${pose}" style="width:100%;height:100%;object-fit:cover">` : '<span class="muted small">—</span>'; }
}
function photoDue() {
  const ds = photoDates(); if (!ds.length) return true;
  return diffDays(today(), ds[ds.length - 1]) >= 27;
}
function photoSessionSheet(d0) {
  const d = d0 || today();
  openSheet(sheetHead('صور التقدّم', nice(d)) + `
    <p class="muted small" style="line-height:1.7;margin-top:8px">نفس المكان والإضاءة كل مرة، الصبح قبل الأكل، ونفس الشورت. الصور بتفضل على الموبايل ده بس – مش بتتبعت لأي حتة.</p>
    <label class="field"><span>تاريخ الصور</span><input id="phD" class="inp num" type="date" value="${d}"></label>
    <div class="grid3 mt">${POSES.map(([k, n]) => `<label style="display:block;text-align:center"><div data-ph="${d}|${k}" style="aspect-ratio:3/4;border-radius:16px;overflow:hidden;background:var(--chip);display:grid;place-items:center;border:1.5px dashed var(--line)"></div><b class="small" style="display:block;margin-top:6px">${n}</b><input type="file" accept="image/*" data-pick="${k}" hidden></label>`).join('')}</div>
    <p class="muted small mt">اضغط على المربع ← صوّر أو اختار من الاستوديو.</p>
    <button class="btn red block mt" data-close>تمام</button>`, p => {
    fillPhotos(p);
    $('#phD', p).onchange = e => { closeSheet(); photoSessionSheet(e.target.value || d); };
    p.querySelectorAll('[data-pick]').forEach(inp => inp.onchange = async () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      const day0 = $('#phD', p).value || d, pose = inp.dataset.pick;
      try {
        const b = await shrink(f); await pPut(day0 + '|' + pose, b);
        delete urlCache[day0 + '|' + pose];
        S.photos = S.photos || {}; (S.photos[day0] = S.photos[day0] || {})[pose] = true; save();
        fillPhotos(p); render(); toast('اتحفظت ✓');
      } catch (e) { toast('مقدرتش أحفظ الصورة: ' + (e.message || e)); }
    });
  });
}
function photoCompareSheet() {
  const ds = photoDates(); if (ds.length < 1) { photoSessionSheet(); return; }
  let a = ds[0], b = ds[ds.length - 1];
  const draw = p => {
    const body = $('#cmp', p);
    const wA = eff(a).w, wB = eff(b).w;
    body.innerHTML = `<div class="grid2 small muted" style="text-align:center;margin-bottom:6px"><span>${nice(a)}${wA ? ` · ${wA} كجم` : ''}</span><span>${nice(b)}${wB ? ` · ${wB} كجم` : ''}</span></div>` +
      POSES.map(([k, n]) => `<div class="section-t">${n}</div><div class="grid2">${[a, b].map(d => `<div data-ph="${d}|${k}" style="aspect-ratio:3/4;border-radius:14px;overflow:hidden;background:var(--chip);display:grid;place-items:center"></div>`).join('')}</div>`).join('');
    fillPhotos(body);
  };
  const opts = sel => ds.map(d => `<option value="${d}" ${d === sel ? 'selected' : ''}>${d}</option>`).join('');
  openSheet(sheetHead('قارن الصور') + `<div class="grid2"><select id="cA" class="inp" style="font-size:14px">${opts(a)}</select><select id="cB" class="inp" style="font-size:14px">${opts(b)}</select></div><div id="cmp" class="mt"></div>
    <div class="grid2 mt"><button class="btn ghost sm" id="cAdd">صور جديدة</button><button class="btn ghost sm" id="cDel">امسح صور ${b}</button></div>`, p => {
    draw(p);
    $('#cA', p).onchange = e => { a = e.target.value; draw(p); };
    $('#cB', p).onchange = e => { b = e.target.value; draw(p); };
    $('#cAdd', p).onclick = () => { closeSheet(); photoSessionSheet(); };
    $('#cDel', p).onclick = async e => {
      const btn = e.currentTarget; if (!btn.dataset.sure) { btn.dataset.sure = 1; btn.textContent = 'متأكد؟ اضغط تاني'; return; }
      for (const [k] of POSES) { await pDel(b + '|' + k); delete urlCache[b + '|' + k]; } delete S.photos[b]; save(); closeSheet(); render(); toast('اتمسحت');
    };
  });
}

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
  const st = { waiting: 'مستني تفتح سجل الأوزان', running: 'شغال…', done: '✓ خلص', timeout: 'وقف (الوقت خلص)', left: 'وقف (خرجت من التطبيق)', month: 'وقف عند تغيير الشهر', strip: 'وقف (مش لاقي اليوم في الشريط)', week: 'وقف عند سهم الأسبوع اللي فات' }[g.status] || '';
  openSheet(sheetHead('استيراد من The Gain Universe', 'سجل التمارين القديم') + `
    ${!zeppState.enabled ? '<div class="note warn"><span class="i">!</span><span>خدمة "Lifestyle – قراءة الساعة" لازم تبقى شغالة الأول.</span></div>' : ''}
    <div class="note mt"><span class="i">1</span><span>اضغط <b>ابدأ</b> ← هيفتح The Gain Universe.</span></div>
    <div class="note mt"><span class="i">2</span><span>ادخل <b>☰ ← سجل الأوزان</b> وسيب الموبايل. التطبيق هيدوس على كل يوم، يفتح كل تمرين ويقرا، ولما الأسبوع يخلص يدوس السهم اللي فوق للأسبوع اللي فات. ممكن ياخد كام دقيقة.</span></div>
    <div class="note mt"><span class="i">3</span><span>هيرجعك هنا لما يخلص. اضغط <b>استورد</b>.</span></div>
    <label class="field"><span>ارجع لحد تاريخ (اختياري)</span><input id="gE" class="inp num" type="date" value=""></label>
    <button class="btn red block mt" id="gGo">ابدأ</button>
    ${st ? `<p class="small mt" style="margin-bottom:0"><b>الحالة:</b> ${st}${g.cursor ? ` · آخر يوم: ${g.cursor}` : ''}</p>` : ''}
    ${dates.length ? `<div class="section-t">اللي اتقرا</div>
      <p style="margin:0;line-height:1.8"><b class="num">${dates.length}</b> يوم · <b class="num">${nSets}</b> مجموعة · من ${dates[0]} لـ ${dates[dates.length - 1]}<br>${mapped.length} تمرين متربط بالبرنامج · ${names.length - mapped.length} تمرين هيتحفظ في سجل لوحده</p>
      <button class="btn red block mt" id="gImp">استورد ${nSets} مجموعة</button>` : ''}
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
/* ================= تشيك إن الجمعة ================= */
const CHECK_Q = [['energy', 'الطاقة طول الأسبوع', ['😴 واقعة', 'قليلة', 'عادي', 'كويسة', '⚡ عالية']], ['hunger', 'الجوع', ['مش جعان', 'خفيف', 'عادي', 'جعان', '🔥 جعان جداً']], ['stress', 'ضغط الشغل والمذاكرة', ['هادي', 'خفيف', 'متوسط', 'عالي', '🤯 فوق طاقتي']], ['mood', 'المزاج', ['😞', '😕', '😐', '🙂', '😁']]];
const checkinThisWeek = () => { for (let i = 0; i < 7; i++) { const d = addDays(today(), -i); if (S.checkins[d]) return d; } return null; };
function checkinSheet() {
  const d = today(), c = Object.assign({}, S.checkins[d] || {});
  openSheet(sheetHead('تشيك إن الأسبوع', '30 ثانية – الكابتن بيقرا ده') + CHECK_Q.map(([k, t, opts]) => `<div class="field"><span>${t}</span><div class="grid3" style="grid-template-columns:repeat(5,1fr);gap:6px">${opts.map((o, i) => `<button class="chip" data-ck="${k}" data-v="${i + 1}" style="justify-content:center;white-space:normal;text-align:center;padding:8px 4px;${c[k] === i + 1 ? 'background:var(--red);color:#fff' : ''}">${o}</button>`).join('')}</div></div>`).join('')
    + `<label class="field"><span>مقاس الوسط عند السرّة (سم) – الصبح قبل الأكل</span><input id="ckW" class="inp num" inputmode="decimal" value="${c.waist ?? ''}"></label>
    <label class="field"><span>أي حاجة تحب تقولها للكابتن</span><textarea id="ckN" class="inp">${esc(c.note || '')}</textarea></label>
    <button class="btn red block mt" id="ckSave">حفظ</button>`, p => {
    p.querySelectorAll('[data-ck]').forEach(b => b.onclick = () => { c[b.dataset.ck] = +b.dataset.v; p.querySelectorAll(`[data-ck="${b.dataset.ck}"]`).forEach(x => { const on = x === b; x.style.background = on ? 'var(--red)' : ''; x.style.color = on ? '#fff' : ''; }); });
    $('#ckSave', p).onclick = () => {
      const w = parseFloat($('#ckW', p).value.replace(',', '.')); if (!isNaN(w) && w > 40) { c.waist = w; (S.body[d] = S.body[d] || {}).waist = w; }
      c.note = $('#ckN', p).value.trim() || undefined;
      if (CHECK_Q.some(([k]) => !c[k])) { toast('جاوب الخمس أسئلة'); return; }
      S.checkins[d] = c; if (c.note) S.inbox.push({ t: Date.now(), text: 'تشيك إن: ' + c.note });
      save(); ghSoon(3000); closeSheet(); render(); toast('اتسجّل ✓ – ابعت التقرير دلوقتي');
    };
  });
}

/* ================= قول للكابتن ================= */
function sayCoachSheet() {
  const recent = S.inbox.slice(-5).reverse();
  openSheet(sheetHead('قول للكابتن', 'بيوصلني في مراجعة الصبح') + `<textarea id="scT" class="inp mt" style="height:110px" placeholder="مثلاً: الكوع وجعني في الهامر · عندي امتحان الأسبوع ده · الجيم زحمة"></textarea>
    <button class="btn red block mt" id="scGo">ابعت</button>
    ${recent.length ? `<div class="section-t">اللي بعته</div>${recent.map(m => `<div class="hrow"><span class="d num">${new Date(m.t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span><span class="v" style="font-weight:500">${esc(m.text)}<small>${m.sent ? '✓ وصل' : 'مستني المزامنة'}</small></span></div>`).join('')}` : ''}
    ${!ghOn() ? '<p class="muted small mt">المراجعة اليومية مش متفعّلة لسه – الرسايل هتتحفظ وتوصل أول ما تفعّلها.</p>' : ''}`, p => {
    $('#scGo', p).onclick = () => { const t = $('#scT', p).value.trim(); if (!t) return; S.inbox.push({ t: Date.now(), text: t }); save(); ghSoon(2000); closeSheet(); toast('اتبعت ✓ – هرد عليك الصبح'); };
  });
}

/* ================= صور الأكل ================= */
async function addMealPhoto(d, meal, file) {
  const b = await shrink(file); const key = `meal|${d}|${meal}|${Date.now()}`;
  await pPut(key, b); (S.mealPhotos[d] = S.mealPhotos[d] || []).push({ key, meal }); save(); ghSoon(5000);
}

/* ================= المراجعة اليومية (مستودع GitHub خاص) ================= */
const GH_TOKEN_KEY = 'lifestyle.ghToken';
const ghToken = () => { try { return localStorage.getItem(GH_TOKEN_KEY) || ''; } catch (e) { return ''; } };
const ghOn = () => !!(ghToken() && S.settings.ghRepo);
const b64 = str => btoa(unescape(encodeURIComponent(str)));
const unb64 = str => decodeURIComponent(escape(atob(str.replace(/\n/g, ''))));
async function gh(method, path, body) {
  const r = await fetch(`https://api.github.com/repos/${S.settings.ghRepo}/contents/${path}`, { method, headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json' }, body: body ? JSON.stringify(body) : undefined });
  if (r.status === 404 && method === 'GET') return null;
  if (!r.ok) { const t = await r.text().catch(() => ''); throw new Error(`GitHub ${r.status}${r.status === 401 ? ' – المفتاح غلط أو خلص' : r.status === 404 ? ' – المستودع مش موجود أو المفتاح مش شايفه' : ''} ${t.slice(0, 80)}`); }
  return r.json();
}
async function ghPut(path, contentB64, msg) {
  const cur = await gh('GET', path).catch(() => null);
  return gh('PUT', path, { message: msg, content: contentB64, sha: cur && cur.sha });
}
let ghT = null, ghBusy = false;
function ghSoon(ms = 60000) { try { if (!ghOn()) return; clearTimeout(ghT); ghT = setTimeout(() => ghSync(), ms); } catch (e) { } }
function dailySummary(d) {
  const e = eff(d), x = S.days[d] || {}, b = S.body[d];
  const ses = Object.entries(S.logs).filter(([, s]) => s.date === d && Object.values(s.ex).some(a => a.length));
  return { date: d, type: dayType(d), weight: e.w, steps: e.steps, active: e.active, burnEst: e.kcal, sleepMin: e.sleep, creatine: e.creatine, water: e.water, feel: x.feel,
    meals: x.meals || {}, recipes: x.recipes || null, choice: x.choice, extras: x.extras || [], intake: intake(d), note: x.note, body: b || null,
    readiness: readiness(d).level, sleepQ: (q => q ? { score: q.score, zepp: q.zepp, level: q.level, deep: q.z.deep, rem: q.z.rem, light: q.z.light, awake: q.z.awake, bed: q.z.bed, wake: q.z.wake, feel: x.sleepFeel } : null)(sleepQ(d)), photos: (S.mealPhotos[d] || []).map(m => ({ meal: m.meal, file: `photos/meals/${m.key.replace(/\|/g, '_')}.jpg` })),
    sessions: ses.map(([k, s]) => ({ key: k, rpe: s.rpe, pain: s.painAreas, note: s.note, ex: Object.fromEntries(Object.entries(s.ex).map(([lk, a]) => [lk, a.map(z => [z.w, z.r, z.rir, z.p])])) })) };
}
async function ghSync(loud) {
  if (!ghOn() || ghBusy) return;
  ghBusy = true;
  try {
    // 1) الحالة كاملة (من غير الصور والمفتاح)
    const state = Object.assign({}, S, { active: null });
    await ghPut('data/state.json', b64(JSON.stringify(state)), 'state ' + today());
    // 2) ملخص آخر 14 يوم مقروء
    const days = []; for (let i = 13; i >= 0; i--) days.push(dailySummary(addDays(today(), -i)));
    await ghPut('data/last14.json', b64(JSON.stringify({ generated: new Date().toISOString(), settings: S.settings, program: { week: curWeek(), busy: isBusy(curWeek()), adherence: adherence(curWeek()), streak: adherenceStreak() }, checkins: S.checkins, inbox: S.inbox.filter(m => !m.sent), days }, null, 1)), 'daily ' + today());
    S.inbox.forEach(m => m.sent = true);
    // 3) صور الأكل الجديدة
    S.ghUp = S.ghUp || {};
    for (const list of Object.values(S.mealPhotos)) for (const m of list) {
      if (S.ghUp[m.key]) continue; const bl = await pGet(m.key); if (!bl) continue;
      const data = (await blobToData(bl)).split(',')[1];
      await ghPut(`photos/meals/${m.key.replace(/\|/g, '_')}.jpg`, data, 'meal photo'); S.ghUp[m.key] = 1;
    }
    // 4) وصفات زيادة من الكابتن
    const rf = await gh('GET', 'coach/recipes.json').catch(() => null);
    if (rf && rf.content) { try { const rs = JSON.parse(unb64(rf.content)); if (Array.isArray(rs)) S.coach.recipes = rs; } catch (e) { } }
    // 5) رسايل الكابتن
    const f = await gh('GET', 'coach/messages.json');
    if (f && f.content) { const msgs = JSON.parse(unb64(f.content)); if (Array.isArray(msgs)) { const old = (S.coach.msgs || []).length; S.coach.msgs = msgs.slice(-60); if (msgs.length > old && S.coach.seen !== msgs[msgs.length - 1].date) S.coach.unread = true; } }
    S.settings.ghLast = Date.now(); save(true); if (loud) toast('اتزامن ✓');
  } catch (e) { S.settings.ghErr = String(e.message || e); save(true); if (loud) toast(S.settings.ghErr); }
  finally { ghBusy = false; if ($('#player').hidden && $('#sheet').hidden) render(); }
}
function coachMsgCard() {
  const msgs = S.coach.msgs || []; if (!msgs.length) return '';
  const m = msgs[msgs.length - 1];
  return `<button class="banner ok" id="coachMsg"><b>🧢 ${esc(m.title || 'رسالة الكابتن')}</b><span>${esc((m.body || '').slice(0, 90))}${(m.body || '').length > 90 ? '…' : ''}</span></button>`;
}
function coachMsgsSheet() {
  const msgs = (S.coach.msgs || []).slice().reverse();
  S.coach.unread = false; if (msgs[0]) S.coach.seen = msgs[0].date; save();
  openSheet(sheetHead('رسايل الكابتن') + msgs.slice(0, 20).map((m, i) => `<div class="card pad mt"><small class="muted">${esc(m.date || '')}</small><h3 style="margin:4px 0 8px">${esc(m.title || '')}</h3><p style="line-height:1.8;margin:0;white-space:pre-wrap">${esc(m.body || '')}</p>
    ${m.apply && !m.applied ? `<button class="btn red block mt sm" data-apply="${msgs.length - 1 - i}">طبّق التعديل: ${esc(m.apply.label || '')}</button>` : m.applied ? '<p class="up small" style="margin:8px 0 0">✓ اتطبّق</p>' : ''}</div>`).join('')
    + `<button class="btn ghost block mt" id="cmSay">رد على الكابتن</button>`, p => {
    p.querySelectorAll('[data-apply]').forEach(b => b.onclick = () => {
      const m = S.coach.msgs[+b.dataset.apply], a = m.apply || {};
      if (a.kcalDelta) { S.settings.kcal = Math.round(S.settings.kcal + a.kcalDelta); S.settings.riceAdj = riceAdj() + Math.round(a.kcalDelta / 1.3); }
      if (a.steps) S.settings.steps = a.steps;
      if (a.repOverride) Object.assign(S.repOverride, a.repOverride);
      if (a.swaps) Object.assign(S.swaps, a.swaps);
      if (a.busyWeek) { S.busy = S.busy || {}; S.busy[curWeek()] = 'coach'; }
      m.applied = true; S.inbox.push({ t: Date.now(), text: `✓ طبّقت: ${a.label || ''}` }); save(); ghSoon(3000); closeSheet(); render(); toast('اتطبّق ✓');
    });
    $('#cmSay', p).onclick = () => { closeSheet(); sayCoachSheet(); };
  });
}
function ghSheet() {
  const on = ghOn();
  openSheet(sheetHead('المراجعة اليومية مع الكابتن', 'مستودع GitHub خاص بيك') + `
    ${on ? `<div class="verdict ${S.settings.ghErr && (!S.settings.ghLast || S.settings.ghErr) ? 'warn' : 'ok'}"><h3>${S.settings.ghLast ? '✓ شغالة' : 'مستني أول مزامنة'}</h3><p>${esc(S.settings.ghRepo)}${S.settings.ghLast ? ` · آخر مزامنة ${new Date(S.settings.ghLast).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : ''}${S.settings.ghErr ? `<br><small>${esc(S.settings.ghErr)}</small>` : ''}</p></div>` : ''}
    <p style="line-height:1.8">كل يوم التطبيق يرفع ملخص يومك على مستودع <b>خاص</b> (Private) بتاعك، والكابتن يراجعه الصبح ويبعتلك رسالة. الصور الشخصية (صور التقدّم) مش بتترفع – صور الأكل بس.</p>
    <label class="field"><span>اسم المستودع</span><input id="ghR" class="inp" style="font-size:16px;direction:ltr" value="${esc(S.settings.ghRepo || 'archyoko/lifestyle-data')}"></label>
    <label class="field"><span>المفتاح (Token)</span><input id="ghK" class="inp" style="font-size:14px;direction:ltr" type="password" placeholder="${ghToken() ? '•••••••• محفوظ' : 'github_pat_...'}"></label>
    <p class="muted small">المفتاح بيتحفظ على الموبايل ده بس، ومش بيدخل في نسخة Drive.</p>
    <button class="btn red block mt" id="ghSave">${on ? 'حفظ وزامن دلوقتي' : 'فعّل'}</button>
    ${on ? '<button class="btn ghost block mt sm" id="ghOff">وقّف المزامنة</button>' : ''}`, p => {
    $('#ghSave', p).onclick = async () => {
      const r = $('#ghR', p).value.trim().replace(/^https?:\/\/github.com\//, ''), k = $('#ghK', p).value.trim();
      if (!/^[\w.-]+\/[\w.-]+$/.test(r)) { toast('اسم المستودع لازم يبقى زي archyoko/lifestyle-data'); return; }
      S.settings.ghRepo = r; if (k) { try { localStorage.setItem(GH_TOKEN_KEY, k); } catch (e) { } }
      if (!ghToken()) { toast('حط المفتاح'); return; }
      S.settings.ghErr = ''; save(); closeSheet(); toast('بيزامن…'); await ghSync(true); scheduleReminders(); ghSheet();
    };
    const off = $('#ghOff', p); if (off) off.onclick = () => { try { localStorage.removeItem(GH_TOKEN_KEY); } catch (e) { } S.settings.ghRepo = ''; save(); closeSheet(); render(); toast('اتوقفت'); };
  });
}

/* ================= لستة السوبر ماركت (أسبوعين) ================= */
function shopCompute(start) {
  const tot = {}; // key → {name, g, f, pack, each, packEach, note, cooked}
  const addItem = (it) => {
    let def = SHOP[it.id];
    if (it.swapped) def = SHOP_ALT[it.name] || { name: it.name, f: 1 };
    if (!def) return;
    const key = def.merge || def.name;
    const o = (tot[key] = tot[key] || Object.assign({ name: def.name, g: 0, cooked: 0 }, def));
    o.g += it.g * def.f; o.cooked += it.g;
  };
  for (let i = 0; i < 14; i++) {
    const d = addDays(start, i);
    for (const m of mealsFor(d)) {
      if (m.special) { if (m.special === 'lecture' && m.pick === 'box' && S.settings.lectureBox !== false) m.boxItems.forEach(addItem); continue; }
      m.items.forEach(addItem);
    }
  }
  return Object.values(tot).filter(o => o.g > 0).map(o => {
    let qty, sub = '';
    if (o.each) { const n = Math.ceil(o.g / o.each); qty = `${n} ${o.name === 'بيض' ? 'بيضة' : 'حتة'}`; if (o.packEach && o.packEach[0] > 1) sub = `≈ ${Math.ceil(n / o.packEach[0])} ${o.packEach[1]}`; }
    else { const kg = o.g / 1000; qty = kg >= 1 ? `${fmt(Math.ceil(kg * 10) / 10, 1)} كجم` : `${Math.ceil(o.g / 50) * 50} جم`; if (o.pack) sub = `≈ ${Math.ceil(o.g / o.pack[0])} ${o.pack[1]} (${o.pack[0] >= 1000 ? o.pack[0] / 1000 + ' كجم' : o.pack[0] + ' جم'})`; }
    const cookedTxt = !o.noRaw && Math.abs(o.f - 1) > 0.05 ? `في الأكل: ${o.cooked >= 1000 ? fmt(o.cooked / 1000, 1) + ' كجم' : Math.round(o.cooked) + ' جم'} ${o.f < 1 ? 'مسلوق' : 'مطبوخ'}` : '';
    return { id: o.name, name: o.name, qty, sub, cookedTxt, note: o.note || '' };
  }).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}
function shopState() {
  if (!S.shop) S.shop = { start: today(), bought: {} };
  return S.shop;
}
function shopCard() {
  const sh = shopState(); const list = shopCompute(sh.start);
  const done = list.filter(x => sh.bought[x.id]).length, end = addDays(sh.start, 13), left = diffDays(end, today());
  return `<button class="pill-btn" id="shopOpen"><b>🛒 السوبر ماركت</b><small>${left < 0 ? '<span class="down">اعمل لستة جديدة</span>' : `اشتريت <span class="num">${done}/${list.length}</span>`}</small></button>`;
}
function shopSheet() {
  const sh = shopState(); const list = shopCompute(sh.start);
  openSheet(sheetHead('لستة السوبر ماركت', `${nice(sh.start)} → ${nice(addDays(sh.start, 13))}`) + `
    <p class="muted small" style="line-height:1.7">الكميات <b>ني وناشف</b> زي ما هتشتريها – محسوبة من خطة الأسبوعين (بالبدايل اللي مختارها، وأيام المحاضرة وجمعة ماما). اللي في الخطة مطبوخ مكتوب تحته.</p>
    ${list.map(x => `<button class="item" style="width:100%;text-align:start" data-buy="${esc(x.id)}"><span class="food-ic" style="${sh.bought[x.id] ? 'background:var(--ok);color:#fff' : ''}">${sh.bought[x.id] ? '✓' : ''}</span><div><b style="${sh.bought[x.id] ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(x.name)}: <bdi class="num">${x.qty}</bdi></b><small>${[x.sub, x.cookedTxt].filter(Boolean).join(' · ')}</small>${x.note ? `<br><small class="muted">${esc(x.note)}</small>` : ''}${sh.bought[x.id] ? `<div class="swapped" style="color:var(--ok)">اشتريته ${short(sh.bought[x.id])}</div>` : ''}</div></button>`).join('')}
    <label class="field" style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="lecBox" ${S.settings.lectureBox !== false ? 'checked' : ''} style="width:22px;height:22px"><span style="margin:0">احسب علبة العشا لأيام المحاضرة</span></label>
    <div class="grid2 mt"><button class="btn ghost sm" id="shAll">علّم الكل اتشرى النهارده</button><button class="btn ghost sm" id="shCopy">انسخ اللستة</button></div>
    <button class="btn red block mt" id="shNew">ابدأ لستة جديدة من النهارده</button>`, p => {
    p.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const id = b.dataset.buy; if (sh.bought[id]) delete sh.bought[id]; else sh.bought[id] = today(); save(); closeSheet(); shopSheet(); render(); });
    $('#lecBox', p).onchange = e => { S.settings.lectureBox = e.target.checked; save(); closeSheet(); shopSheet(); };
    $('#shAll', p).onclick = () => { list.forEach(x => { if (!sh.bought[x.id]) sh.bought[x.id] = today(); }); save(); closeSheet(); render(); toast('اتعلّم ✓'); };
    $('#shCopy', p).onclick = () => copyText(`🛒 لستة ${short(sh.start)} → ${short(addDays(sh.start, 13))}\n` + list.filter(x => !sh.bought[x.id]).map(x => `- ${x.name}: ${x.qty}${x.sub ? ' (' + x.sub + ')' : ''}`).join('\n'));
    $('#shNew', p).onclick = e => { const btn = e.currentTarget; if (!btn.dataset.sure) { btn.dataset.sure = 1; btn.textContent = 'متأكد؟ اضغط تاني'; return; } S.shop = { start: today(), bought: {} }; save(); closeSheet(); shopSheet(); render(); };
  });
}

/* ================= التسخين ================= */
const warmKind = dk => dk.startsWith('lower') ? 'lower' : 'upper';
function rampFor(w, dk) {
  const list = exList(dk, w); const ex = list.find(e => e.kind === 'main' && !isTimed(e)); if (!ex) return null;
  const h = history(ex.lk); const top = h.length ? Math.max(...h.filter(x => x.date === h[0].date).map(x => +x.w || 0)) : 0;
  const inc = ex.inc || 2.5, rnd = x => Math.max(inc, Math.round(x / inc) * inc);
  return { ex, sets: WARMUP.ramp.map(([f, r]) => ({ w: top ? rnd(top * f) : null, r, f })) };
}
function warmSheet(w, dk, onDone) {
  const wk = WARMUP[warmKind(dk)], rp = rampFor(w, dk), done = new Set();
  openSheet(sheetHead('🔥 التسخين قبل التمرين', `${dayByKey(dk).title} · ${wk.time}`) + `
    <p class="muted small" style="line-height:1.7">${esc(wk.why)}</p>
    ${wk.steps.map((st, i) => `<button class="item" style="width:100%;text-align:start" data-wu="${i}"><span class="food-ic">${i + 1}</span><div><b>${esc(st.t)} – <bdi class="num">${esc(st.d)}</bdi></b><small style="line-height:1.7">${esc(st.how)}</small></div></button>`).join('')}
    ${rp ? `<div class="card pad mt"><h3 style="margin:0 0 6px">مجموعات تسخين قبل ${esc(rp.ex.name)}</h3>
      <p class="small muted" style="margin:0 0 10px;line-height:1.7">بوزن خفيف ومتصاعد، راحة دقيقة بينهم، ومتتسجّلش. الهدف إن المفصل يحس بالحركة قبل الوزن التقيل.</p>
      ${rp.sets.map(x => `<div class="hrow"><span class="d num">${Math.round(x.f * 100)}%</span><span class="v">${x.w ? `<bdi class="num">${fmt(x.w, 2)} كجم × ${x.r}</bdi>` : `${x.f < 0.6 ? 'خفيف جداً' : x.f < 0.8 ? 'متوسط' : 'قريب من وزن الشغل'} × ${x.r}`}</span></div>`).join('')}
      <p class="small" style="margin:10px 0 0;line-height:1.7">وأول تمرين لعضلة جديدة بعد كده: مجموعة واحدة خفيفة 60% × 6 قبله.</p></div>` : ''}
    <div class="verdict warn mt"><p style="margin:0">${esc(WARMUP.rule)}</p></div>
    ${onDone ? `<button class="btn red block mt" id="wuGo">خلصت التسخين – ابدأ</button><button class="link small" id="wuSkip" style="display:block;margin:12px auto 0">سخّنت لوحدي – ابدأ على طول</button>` : '<button class="btn ghost block mt" data-close>تمام</button>'}`, p => {
    p.querySelectorAll('[data-wu]').forEach(b => b.onclick = () => { const i = b.dataset.wu; done.has(i) ? done.delete(i) : done.add(i); const ic = $('.food-ic', b); ic.textContent = done.has(i) ? '✓' : +i + 1; ic.style.background = done.has(i) ? 'var(--ok)' : ''; ic.style.color = done.has(i) ? '#fff' : ''; });
    const go = $('#wuGo', p); if (go) go.onclick = () => { ensureSess(w, dk).warm = done.size || 1; save(); closeSheet(); onDone(); };
    const sk = $('#wuSkip', p); if (sk) sk.onclick = () => { ensureSess(w, dk).warm = 'self'; save(); closeSheet(); onDone(); };
  });
}

/* ================= الوصفات على قد سعراتك ================= */
const allRecipes = () => RECIPES.concat((S.coach.recipes || []).map(r => Object.assign({ cat: 'من الكابتن' }, r)));
const ingOf = e => e.length >= 4 ? { name: e[0], k: e[1], p: e[2], g: e[3] } : (ING[e[0]] ? { key: e[0], name: ING[e[0]][0], k: ING[e[0]][1], p: ING[e[0]][2], g: e[1] } : null);
function mealTarget(mid, d) {
  const m = mealsFor(d).find(x => x.id === mid);
  if (m && !m.special) return { kcal: m.kcal, p: m.p, title: m.title };
  const base = DIET.meals.find(x => x.id === mid), its = mealItems(base);
  return { kcal: its.reduce((a, x) => a + x.kcal, 0), p: its.reduce((a, x) => a + x.p, 0), title: base.title };
}
/* بروتين أول: مصادر البروتين تتظبط على بروتين الوجبة، والباقي يكمّل السعرات */
function scaleRecipe(r, T, Pt) {
  const ings = r.ing.map(ingOf).filter(Boolean);
  const isP = x => x.k > 0 && x.p * 4 / x.k >= 0.45;
  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
  const P = ings.filter(isP), O = ings.filter(x => !isP(x));
  const kP = sum(P, x => x.k * x.g / 100), pP = sum(P, x => x.p * x.g / 100), kO = sum(O, x => x.k * x.g / 100), pO = sum(O, x => x.p * x.g / 100);
  const cl = (x, a, b) => Math.min(b, Math.max(a, x));
  let a = 1, b = 1;
  const det = kP * pO - kO * pP;
  if (P.length && O.length && Math.abs(det) > 1e-6) { a = (T * pO - kO * Pt) / det; b = (kP * Pt - T * pP) / det; }
  else { a = b = T / (kP + kO); }
  a = cl(a, 0.6, 2); if (O.length) b = cl((T - a * kP) / kO, 0.35, 2.6); else a = cl(T / kP, 0.5, 2);
  const out = ings.map(x => { const f = isP(x) ? a : b; let g = x.g * f; g = x.key === 'oil' || x.key === 'butter' || x.key === 'honey' || x.g < 20 ? Math.max(1, Math.round(g)) : Math.max(5, Math.round(g / 5) * 5); if (x.key === 'egg') g = Math.max(50, Math.round(g / 50) * 50); return Object.assign({}, x, { g }); });
  const kcal = Math.round(sum(out, x => x.k * x.g / 100)), p = Math.round(sum(out, x => x.p * x.g / 100));
  return { out, kcal, p, short: Pt - p };
}
function recipesSheet(mid) {
  const d = view.food || today(); let cat = 'الكل', q = '';
  const draw = () => {
    const rs = allRecipes().filter(r => (cat === 'الكل' || r.cat === cat) && (!q || r.name.includes(q)));
    const cats = ['الكل', ...new Set(allRecipes().map(r => r.cat))];
    openSheet(sheetHead('📖 وصفات على قد سعراتك', 'اختار أكلة والمقادير تتحسب على الوجبة اللي هتاكلها مكانها') + `
      <input id="rcQ" class="inp mt" style="font-size:16px" placeholder="دوّر… بشاميل، بيتزا، كشري" value="${esc(q)}">
      <div class="chips">${cats.map(c => `<button class="chip ${c === cat ? 'red' : ''}" data-rc="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      ${rs.map(r => { const t = mealTarget(mid || r.meal, d); return `<button class="item" style="width:100%;text-align:start" data-r="${esc(r.id)}"><span class="food-ic">${esc(r.name[0])}</span><div><b>${esc(r.name)}</b><small>${esc(r.cat)} · مكان ${esc(t.title)} · <span class="num">${t.kcal}</span> سعر</small></div></button>`; }).join('') || '<p class="muted mt">مفيش – اطلبها من الكابتن تحت.</p>'}
      <button class="btn ghost block mt" id="rcAsk">💬 عايز أكلة مش موجودة؟ اطلبها</button>`, p => {
      const qi = $('#rcQ', p); qi.oninput = () => { q = qi.value.trim(); clearTimeout(qi._t); qi._t = setTimeout(() => { draw(); const n = $('#rcQ'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 350); };
      p.querySelectorAll('[data-rc]').forEach(b => b.onclick = () => { cat = b.dataset.rc; draw(); });
      p.querySelectorAll('[data-r]').forEach(b => b.onclick = () => recipeSheet(allRecipes().find(r => r.id === b.dataset.r), mid));
      $('#rcAsk', p).onclick = () => { closeSheet(); sayCoachSheet(); setTimeout(() => { const t = $('#scT'); if (t) t.value = 'عايز وصفة دايت لـ: '; }, 50); };
    });
  };
  draw();
}
function recipeSheet(r, mid0) {
  const d = view.food || today(); let mid = mid0 || r.meal, custom = null;
  const draw = () => {
    const t = custom ? { kcal: custom, p: Math.round(custom * 0.3 / 4), title: 'وجبة مخصوصة' } : mealTarget(mid, d);
    const sc = scaleRecipe(r, t.kcal, t.p);
    openSheet(sheetHead(esc(r.name), `${esc(r.cat)} · ${t.title}`) + `
      <div class="chips">${DIET.meals.map(m => `<button class="chip ${!custom && m.id === mid ? 'red' : ''}" data-rm="${m.id}">مكان ${esc(m.title)}</button>`).join('')}<button class="chip ${custom ? 'red' : ''}" id="rmC">سعرات تانية</button></div>
      <div class="tiles mt"><div class="tile"><small>السعرات</small><b class="num">${sc.kcal}</b><span class="muted small">الهدف ${t.kcal}</span></div><div class="tile"><small>البروتين</small><b class="num">${sc.p} جم</b><span class="muted small">الهدف ${t.p}</span></div></div>
      ${sc.short > 12 ? `<div class="verdict info mt"><p style="margin:0">البروتين ناقص ~${sc.short} جم – كمّل بـ <b>${Math.round(sc.short / 10 * 100 / 5) * 5} جم زبادي يوناني</b> أو <b>${Math.round(sc.short / 12 * 100 / 10) * 10} جم قريش</b> على جنب (وشيل نفس سعراتهم من الأكلة لو عايز تكون مظبوط).</p></div>` : ''}
      <div class="section-t">المقادير (وزن ني/ناشف قبل الطبخ)</div>
      ${sc.out.map(x => `<div class="hrow"><span class="v" style="font-weight:600">${esc(x.name)}</span><span class="d num"><bdi>${x.key === 'egg' ? `${x.g / 50} بيضة` : x.g + ' جم'}</bdi></span></div>`).join('')}
      <p class="muted small">+ ملح وتوابل وخضرة براحتك (سعراتها ملهاش لازمة).</p>
      <div class="section-t">الطريقة</div>
      <ol style="line-height:1.9;padding-inline-start:20px;margin:0">${r.steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
      ${r.tip ? `<div class="note mt"><span class="i">i</span><span class="lbl">ليه كده</span><span>${esc(r.tip)}</span></div>` : ''}
      ${custom ? '' : `<button class="btn red block mt" id="rcUse">هاكلها مكان ${esc(t.title)} ${d === today() ? 'النهارده' : short(d)}</button>`}
      <button class="btn ghost block mt sm" id="rcBack">كل الوصفات</button>`, p => {
      p.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { mid = b.dataset.rm; custom = null; draw(); });
      const rmc = $('#rmC', p); rmc.onclick = () => { rmc.outerHTML = `<input id="rmCi" class="inp num" inputmode="numeric" style="width:120px;height:40px;font-size:16px" placeholder="مثلاً 600">`; const i = $('#rmCi'); i.focus(); i.onchange = () => { const v = parseInt(i.value, 10); if (v >= 150 && v <= 2500) { custom = v; draw(); } }; };
      const u = $('#rcUse', p); if (u) u.onclick = () => { const x = (S.days[d] = S.days[d] || {}); (x.recipes = x.recipes || {})[mid] = { id: r.id, name: r.name, kcal: sc.kcal, p: sc.p }; save(); closeSheet(); render(); toast('اتسجّلت ✓ – علّم على الوجبة لما تاكلها'); };
      $('#rcBack', p).onclick = () => recipesSheet(mid0);
    });
  };
  draw();
}

/* ================= مكان الجيم ================= */
function getPos() { return new Promise((res, rej) => { if (!navigator.geolocation) return rej(new Error('الموقع مش متاح')); navigator.geolocation.getCurrentPosition(p => res(p.coords), e => rej(e), { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }); }); }
function distM(a, b) { const R = 6371e3, t = x => x * Math.PI / 180; const dl = t(b.lat - a.lat), dn = t(b.lng - a.lng); const h = Math.sin(dl / 2) ** 2 + Math.cos(t(a.lat)) * Math.cos(t(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
async function gymCheck() {
  if (!S.settings.gym || !$('#player').hidden) return;
  const tp = todayPlan(); const ses = tp && (tp.today || (!tp.doneToday && tp.miss)); if (!ses) return;
  const h = new Date().getHours(); if (h < 16 || h > 23) return;
  if (S.settings.gymAsked === today()) return;
  try {
    const c = await getPos(); const dm = distM({ lat: c.latitude, lng: c.longitude }, S.settings.gym);
    if (dm < 250) {
      S.settings.gymAsked = today(); save();
      openSheet(sheetHead(`وصلت الجيم 💪`, ses.d.label) + `<p style="line-height:1.8">تمرين النهارده <b>${ses.d.title}</b> – ${ses.d.sub}.</p><button class="btn red block mt" id="gStart">ابدأ التمرين</button><button class="btn ghost block mt" data-close>بعدين</button>`, p => {
        $('#gStart', p).onclick = () => { closeSheet(); view.week = tp.w; view.day = ses.d.key; warmSheet(tp.w, ses.d.key, () => startPlayer(tp.w, ses.d.key)); };
      });
    }
  } catch (e) { }
}
function gymSheet() {
  openSheet(sheetHead('مكان الجيم') + `<p style="line-height:1.8">لما تفتح التطبيق وانت في الجيم في يوم تمرين، تمرين النهارده هيطلعلك على طول. وفي أيام التمرين الساعة 8:30 لو الحصة لسه متعملتش هيفكّرك.</p>
    ${S.settings.gym ? `<p class="up small">✓ المكان محفوظ</p>` : ''}
    <button class="btn red block mt" id="gSave">أنا في الجيم دلوقتي – احفظ المكان</button>
    ${S.settings.gym ? '<button class="btn ghost block mt sm" id="gDel">امسح المكان</button>' : ''}`, p => {
    $('#gSave', p).onclick = async () => { try { toast('بيحدد المكان…'); const c = await getPos(); S.settings.gym = { lat: c.latitude, lng: c.longitude }; save(); closeSheet(); toast('اتحفظ ✓'); } catch (e) { toast('مقدرتش أحدد المكان – فعّل الموقع واسمح للتطبيق'); } };
    const gd = $('#gDel', p); if (gd) gd.onclick = () => { delete S.settings.gym; save(); closeSheet(); toast('اتمسح'); };
  });
}

/* ================= تقرير الشهر ================= */
function monthReportSheet() {
  const t = today(), from = addDays(t, -28);
  const wA = avgWeight(addDays(from, 6)), wB = avgWeight(t);
  const bds = Object.keys(S.body).sort(), bIn = bds.filter(d => d >= from), b0 = S.body[bds.filter(d => d <= from).pop() || bIn[0]] || null, b1 = S.body[bds[bds.length - 1]] || null;
  const waist = d => { for (const x of bds.slice().reverse()) if ((d ? x <= d : true) && S.body[x].waist) return S.body[x].waist; return null; };
  const str = strengthRows().map(s => ({ name: s.name, ch: s.first ? (s.last - s.first) / s.first * 100 : 0, n: s.n })).filter(s => s.n > 1).sort((a, b) => b.ch - a.ch);
  const ads = []; for (let w = Math.max(1, curWeek() - 3); w <= curWeek(); w++) { const a = adherence(w); if (a) ads.push(a.score); }
  const ph = photoDates(); const p0 = ph.filter(d => d <= from).pop() || ph[0], p1 = ph[ph.length - 1];
  const row = (k, a, b, unit, good) => { const d = a != null && b != null ? r1(b - a) : null; return `<tr><td>${k}</td><td class="num">${a != null ? fmt(a, 1) : '—'}</td><td class="num">${b != null ? fmt(b, 1) : '—'}</td><td>${d != null ? `<b class="${(good === 'down' ? d <= 0 : d >= 0) ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}${unit}</b>` : '—'}</td></tr>`; };
  openSheet(sheetHead('تقرير الشهر', `${nice(from)} → ${nice(t)}`) + `
    <div class="card pad scroll-x mt"><table class="t"><thead><tr><th></th><th>أول الشهر</th><th>دلوقتي</th><th>الفرق</th></tr></thead><tbody>
      ${row('متوسط الوزن', wA && wA.avg, wB && wB.avg, ' كجم', 'down')}
      ${row('الوسط', waist(from), waist(), ' سم', 'down')}
      ${row('الدهون (كجم)', b0 && b0.fatKg, b1 && b1.fatKg, ' كجم', 'down')}
      ${row('العضل الهيكلي (كجم)', b0 && b0.skmKg, b1 && b1.skmKg, ' كجم', 'up')}
      ${row('الدهون الحشوية', b0 && b0.visceral, b1 && b1.visceral, '', 'down')}
    </tbody></table></div>
    <div class="section-t">الالتزام</div><p style="margin:0 4px">${ads.length ? `متوسط ${Math.round(ads.reduce((a, b) => a + b) / ads.length)}% · ${ads.map(x => x + '%').join(' ← ')}` : '—'}</p>
    <div class="section-t">القوة</div>${str.length ? `<p style="margin:0 4px;line-height:1.9">${str.slice(0, 5).map(s => `${esc(s.name)} <b class="${s.ch >= 0 ? 'up' : 'down'}">${s.ch >= 0 ? '+' : ''}${fmt(s.ch, 0)}%</b>`).join('<br>')}</p>` : '<p class="muted small">لسه مفيش كفاية حصص.</p>'}
    ${p0 && p1 && p0 !== p1 ? `<div class="section-t">الصور (${short(p0)} ← ${short(p1)})</div>${POSES.map(([k, n]) => `<div class="grid2" style="margin-bottom:8px">${[p0, p1].map(d => `<div data-ph="${d}|${k}" style="aspect-ratio:3/4;border-radius:12px;overflow:hidden;background:var(--chip);display:grid;place-items:center"></div>`).join('')}</div>`).join('')}` : ''}
    <p class="muted small mt" style="text-align:center">الكابتن بيشوف التقرير ده لوحده في مراجعة الجمعة.</p>`, p => {
    fillPhotos(p);
  });
}

function notifSheet() {
  openSheet(sheetHead('الإشعارات') + `
    <p style="line-height:1.8">الكابتن بيفكّرك: الوزن الصبح، الكرياتين، وجبة الشغل، تمرين النهارده، تجهيز العلب، يوم المحاضرة، جمعة ماما، تقرير الجمعة، والنوم. وعداد الراحة بيرن حتى لو الموبايل مقفول.</p>
    <button class="btn ${S.settings.notif ? 'ghost' : 'red'} block" id="n1">${S.settings.notif ? '✓ الإشعارات شغالة – اضغط تقفلها' : 'شغّل الإشعارات'}</button>
    <button class="btn ghost block mt sm" id="n2">اسمح بالتنبيه في الميعاد بالظبط (لعداد الراحة)</button>
    <p class="muted small mt">لو الإشعارات مش بتوصل: إعدادات الموبايل ← التطبيقات ← Lifestyle ← البطارية ← "بدون قيود".</p>`, p => {
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

const topbar = (title, right = '', left = '') => `<div class="topbar">${right || '<span class="sp"></span>'}<h1>${title}</h1>${left || '<span class="sp"></span>'}</div>`;
function render() {
  document.querySelectorAll('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  const el = $('#screen'); el.classList.remove('has-cta');
  ({ home: renderHome, workout: renderWorkout, progress: renderProgress, food: renderFood, menu: renderMenu })[tab](el);
}
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => { tab = b.dataset.tab; if (tab === 'food') view.food = null; if (tab === 'workout') { view.wOpen = false; view.week = null; } window.scrollTo(0, 0); render(); });

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
  const needMorning = !e.w || (!zeppState.enabled && my.active == null && my.kcal == null);
  const tp = todayPlan();
  const tdDay = tp ? (tp.today ? tp.today.d : tp.doneToday ? tp.doneToday.d : null) : todaysDay();
  const nd = nextDay();
  const sess = tdDay ? S.logs[sessKey(w, tdDay.key)] : null;
  const ad = tp ? adherence(w) : null, streak = tp ? adherenceStreak() : 0;
  const rd = readiness();
  const PART = { wo: 'تمرين', meals: 'أكل', steps: 'خطوات', weight: 'وزن', cr: 'كرياتين' };
  const doneCount = sess ? Object.values(sess.ex).filter(x => x.length).length : 0;
  const lastW = (() => { for (let i = 0; i < 30; i++) { const x = eff(addDays(t, -i)).w; if (x) return { w: x, d: addDays(t, -i) }; } return null; })();
  const v = verdict();
  const mealsEaten = Object.values((S.days[t] || {}).meals || {}).filter(Boolean).length;
  const stepPct = e.steps ? Math.min(100, e.steps / set.steps * 100) : 0;
  const daysIn = diffDays(t, set.start);
  const sq = sleepQ(t);
  // بانر واحد بس – الأهم
  const banner = (S.coach.unread && coachMsgCard())
    || (sq && sq.level === 'bad' ? `<button class="banner warn" id="sqBan"><b>😴 نومك امبارح ${sq.score}/100</b><span>${(sleepTips(sq).slice(-1)[0] || '')}</span></button>` : '')
    || (needMorning ? `<button class="banner" id="morning"><b>⚖️ اتوزن الصبح</b><span>${zeppState.enabled ? 'اطلع على الميزان وافتح التفاصيل في OKOK – بيتسجّل لوحده.' : 'الوزن ونوم امبارح.'}</span></button>` : '')
    || (new Date().getDay() === 5 && !checkinThisWeek() && tp ? `<button class="banner" id="ckBan"><b>✍️ تشيك إن الأسبوع</b><span>4 أسئلة + مقاس الوسط.</span></button>` : '')
    || (photoDue() && [5, 6].includes(new Date().getDay()) ? `<button class="banner" id="phBan"><b>📸 ميعاد صور التقدّم</b><span>قدام، جنب، ضهر.</span></button>` : '');
  const hero = tp && !tp.today && tp.miss
    ? `<div class="today"><small>فاتك يوم ${tp.miss.d.label}</small><h3>${tp.miss.d.title}</h3><p>${tp.doneToday ? 'اعمله بكرة لو تقدر.' : 'اعمله النهارده بدل الراحة.'}</p>${tp.doneToday ? '' : `<button class="btn hero-go" id="goMiss">ابدأ ${ICON.arrowL}</button>`}</div>`
    : tdDay ? `<div class="today"><small>تمرين النهارده · ${tdDay.label}</small><h3>${tdDay.title}</h3><p>${tdDay.sub}${doneCount ? ` · خلصت ${doneCount} تمرين` : ''}</p>
        ${tp && tp.today ? `<div class="hero-ready"><span>${READY_TXT[rd.level][0]}</span>${['good', 'meh', 'tired'].map((f, i) => `<button class="${rd.feel === f ? 'on' : ''}" data-feel="${f}">${['كويس', 'نص نص', 'مرهق'][i]}</button>`).join('')}</div>${rd.level !== 'green' ? `<p class="hero-note">${READY_TXT[rd.level][1]}</p>` : ''}` : ''}
        ${tp && tp.today && tp.miss ? `<p class="hero-note">وفاتك ${tp.miss.d.title} – ${isBusy(w) ? 'الأسبوع بقى 3 أيام.' : 'اعمله في أقرب يوم راحة.'}</p>` : ''}
        <button class="btn hero-go" id="goW">${doneCount ? 'كمّل التمرين' : 'ابدأ التمرين'} ${ICON.arrowL}</button></div>`
      : `<div class="today rest"><small>يوم راحة</small><h3>REST</h3><p>الجاي ${nd.label}: ${nd.title}. امشي ${fmt(set.steps)} خطوة النهارده.</p></div>`;
  const cell = (id, label, val, on) => `<button class="stat ${on ? 'on' : ''}" id="${id}"><small>${label}</small><b class="num">${val}</b></button>`;
  el.innerHTML = `
  <div class="hello"><div><small>${nice(t)} · ${daysIn < 0 ? `البرنامج يبدأ بعد ${-daysIn} يوم` : `الأسبوع ${w} من ${set.weeks}`}</small><h1>أهلاً ${esc(set.name)}</h1></div>
    <svg viewBox="0 0 100 100" width="38" height="38" aria-label="Lifestyle" style="flex:none"><rect width="100" height="100" rx="24" fill="var(--red)"/><polyline points="30,18 30,68 45,68 53,44 62,88 70,68 84,68" transform="translate(13 13) scale(.74)" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="sync" id="zeppline"></div>
  ${banner ? `<div class="mt">${banner}</div>` : ''}
  <div class="mt">${hero}</div>
  <div class="stats mt">
    ${cell('tSt', 'خطوات', e.steps != null ? fmt(e.steps) : '—', stepPct >= 100)}
    ${cell('tS', 'نوم', e.sleep ? `${Math.floor(e.sleep / 60)}:${pad2(e.sleep % 60)}${sq ? `<i class="q ${sq.level}">${sq.score}</i>` : ''}` : '—')}
    ${cell('tW', 'وزن', lastW ? fmt(lastW.w, 1) : '—', lastW && lastW.d === t)}
    ${cell('cMe', 'وجبات', `${mealsEaten}/${mealsFor(t).length}`, mealsEaten >= mealsFor(t).length)}
    ${cell('cWa', 'مية (لتر)', `${fmt(e.water, 2)}/${set.water}`, e.water >= set.water)}
    ${cell('cCr', 'كرياتين', e.creatine ? '✓' : '5 جم', e.creatine)}
  </div>
  ${ad ? `<div class="adh mt"><div class="ring-s sm"><svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36" stroke="${ad.score >= 80 ? 'var(--ok)' : ad.score >= 60 ? 'var(--warn)' : 'var(--red)'}" stroke-dasharray="226.2" stroke-dashoffset="${226.2 * (1 - ad.score / 100)}"/></svg><b class="num">${ad.score}</b></div>
    <div><b>التزام الأسبوع</b><small>${streak ? `🔥 ${streak} أسبوع ورا بعض فوق 80%` : 'الهدف 80%'}</small></div></div>` : ''}`;
  renderSyncLine();
  $('#tW').onclick = () => dayEntrySheet(t);
  $('#tSt').onclick = () => dayEntrySheet(t);
  const mo = $('#morning'); if (mo) mo.onclick = () => dayEntrySheet(t);
  const pb = $('#phBan'); if (pb) pb.onclick = () => photoSessionSheet();
  const cm = $('#coachMsg'); if (cm) cm.onclick = coachMsgsSheet;
  $('#tS').onclick = () => sleepSheet(t);
  const sqb = $('#sqBan'); if (sqb) sqb.onclick = () => sleepSheet(t);
  const ck = $('#ckBan'); if (ck) ck.onclick = checkinSheet;
  $('#cCr').onclick = () => { day(t).creatine = !day(t).creatine; save(); render(); };
  $('#cWa').onclick = () => { const d = day(t); d.water = r1(((d.water || 0) + 0.25) > set.water + 1 ? 0 : (d.water || 0) + 0.25); save(); render(); };
  $('#cMe').onclick = () => { tab = 'food'; render(); };
  const g = $('#goW'); if (g) g.onclick = () => { view.week = w; view.day = tdDay.key; startPlayer(w, tdDay.key); };
  const gm = $('#goMiss'); if (gm) gm.onclick = () => { view.week = w; view.day = tp.miss.d.key; startPlayer(w, tp.miss.d.key); };
  el.querySelectorAll('[data-feel]').forEach(b => b.onclick = () => { const x = day(t); x.feel = x.feel === b.dataset.feel ? undefined : b.dataset.feel; save(); render(); });
}

function dayEntrySheet(d) {
  const m = S.days[d] || {}, h = S.health[d] || {};
  const y = addDays(d, -1), my = S.days[y] || {}, hy = S.health[y] || {};
  openSheet(sheetHead(nice(d), 'تسجيل الصبح – 20 ثانية') + `
    <label class="field"><span>الوزن الصبح بعد الحمام (كجم)${h.weight ? ` – الميزان قال ${h.weight}` : ''}</span><input id="fW" class="inp num" inputmode="decimal" value="${m.w ?? ''}" placeholder="${h.weight ?? ''}"></label>
    ${zeppState.enabled ? '<details style="margin-top:14px"><summary class="muted small">أرقام الساعة بتتقرا لوحدها – صحّحها هنا لو غلط</summary>' : ''}
    <div class="section-t" style="margin-top:18px">من ساعة Zepp Active – يوم امبارح (${short(y)})</div>
    <div class="grid3">
      <label class="field" style="margin-top:0"><span>الخطوات</span><input id="fS" class="inp num" inputmode="numeric" value="${my.steps ?? ''}" placeholder="${hy.steps ?? ''}"></label>
      <label class="field" style="margin-top:0"><span>السعرات (النشاط)</span><input id="fK" class="inp num" inputmode="numeric" value="${my.active ?? ''}" placeholder="${hy.zactive ?? ''}"></label>
      <label class="field" style="margin-top:0"><span>نوم الليلة (ساعات)</span><input id="fL" class="inp num" inputmode="decimal" value="${m.sleepMin ? r1(m.sleepMin / 60) : ''}" placeholder="${h.zsleep ? r1(h.zsleep / 60) : '7.5'}"></label>
    </div>
    <p class="muted small">${zeppState.enabled ? 'الأرقام دي بتتقرا لوحدها من الساعة – اكتب بس لو عايز تصحّح.' : 'من شاشة "صحة" في Zepp Active. السعرات هناك = النشاط بس، والتطبيق بيزوّد حرق الراحة لوحده.'}</p>
    ${zeppState.enabled ? '</details>' : ''}
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
const ORD = ['الأول', 'التاني', 'التالت', 'الرابع'];
function dayMinutes(dk, w) { const l = exList(dk, w); return Math.round(l.reduce((a, e) => a + (e.sets || 1) * ((e.rest || 60) + (isTimed(e) ? 30 : 40)), 0) / 60 / 5) * 5 + 10; }
function renderWorkoutList(el) {
  const cw = curWeek(), w = view.week || cw, td = today();
  el.innerHTML = topbar('التمرين', `<button class="iconbtn" id="rulesBtn" aria-label="القواعد">${ICON.info}</button>`) + `
  <div class="prog"><div class="av"><svg viewBox="0 0 100 100" width="66" height="66"><polyline points="30,18 30,68 45,68 53,44 62,88 70,68 84,68" transform="translate(13 13) scale(.74)" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
    <div style="flex:1;min-width:0"><h2>برنامج ${S.settings.weeks} أسبوع – الأسبوع ${cw}</h2>
    <div class="meta"><div><small>الهدف</small><b>دهون أقل + عضل</b></div><div><small>المدة</small><b>60–75 دقيقة</b></div><div><small>المكان</small><b>جيم</b></div></div></div></div>
  <button class="softbtn" id="progInfo">تفاصيل البرنامج</button>
  <div class="seg plain"><button class="${w === cw ? 'on' : ''}" data-wk="${cw}">الأسبوع الحالي</button><button class="${w === cw + 1 ? 'on' : ''}" data-wk="${Math.min(cw + 1, S.settings.weeks)}">الأسبوع الجاي</button></div>
  ${DAYS.map((d, i) => {
    const date = plannedDate(w, d.key), done = sessDone(w, d.key), off = isBusy(w) && d.optional;
    const first = exList(d.key, w).find(e => e.kind !== 'warm' && e.img) || exList(d.key, w).find(e => e.img);
    const n = exList(d.key, w).length;
    return `<button class="drow ${off ? 'off' : ''}" data-open="${d.key}"><span class="ph">${first ? `<img src="media/${first.img}/0.jpg" alt="" loading="lazy">` : ''}${done ? '<span class="ok">✓</span>' : ''}</span>
      <div><span class="pill ${date === td ? 'today' : ''}">اليوم ${ORD[i]} · ${d.label} ${short(date)}</span><b>${d.title}</b><small>${off ? 'اتشال الأسبوع ده (أسبوع مزنوق)' : done ? '✓ خلصته' : `${n} تمارين · ~${dayMinutes(d.key, w)} دقيقة`}</small></div>
      <svg class="arr" viewBox="0 0 24 24"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>`; }).join('')}
  <button class="link small" id="busyBtn" style="margin:14px 2px 0">${isBusy(w) ? 'رجّع الأسبوع 4 أيام' : 'أسبوع مزنوق؟ خليه 3 أيام'}</button>
  ${w > 1 ? `<button class="link small" id="wOld" style="display:block;margin:10px 2px 0;color:var(--ink2)">الأسابيع اللي فاتت</button>` : ''}`;
  el.querySelectorAll('[data-wk]').forEach(b => b.onclick = () => { view.week = +b.dataset.wk; render(); });
  el.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { view.week = w; view.day = b.dataset.open; view.wOpen = true; window.scrollTo(0, 0); render(); });
  $('#rulesBtn').onclick = $('#progInfo').onclick = rulesSheet;
  $('#busyBtn').onclick = () => { S.busy = S.busy || {}; if (isBusy(w)) S.busy[w] = false; else S.busy[w] = 'manual'; save(); scheduleReminders(); render(); };
  const wo = $('#wOld'); if (wo) wo.onclick = () => openSheet(sheetHead('الأسابيع اللي فاتت') + Array.from({ length: cw - 1 }, (_, i) => cw - 1 - i).map(x => `<button class="row" data-ow="${x}"><span>الأسبوع ${x}</span><em>${weekPlan(x).filter(y => y.done).length}/${weekPlan(x).length} حصص</em></button>`).join(''), p => p.querySelectorAll('[data-ow]').forEach(b => b.onclick = () => { closeSheet(); view.week = +b.dataset.ow; render(); }));
}
function renderWorkout(el) {
  if (!view.wOpen) return renderWorkoutList(el);
  if (view.week == null) view.week = curWeek();
  if (!view.day) view.day = (todaysDay() || nextDay()).key;
  const w = view.week, dk = view.day, d = dayByKey(dk);
  const isNow = w === curWeek() && plannedDate(w, dk) <= today() && !sessDone(w, dk);
  const rd = isNow ? readiness() : null;
  const list = exList(dk, w, rd ? rd.level : null);
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
          <span class="chip"><b class="num" style="margin:0">${ex.sets} × ${repsTxt(ex)}</b> ${unitTxt(ex)}</span>
          ${ex.rir !== '—' ? `<span class="chip ${ex.noFail || ex.pain ? 'red' : ''}">RIR<b class="num">${ex.rir}</b></span>` : ''}
          ${ex.rest ? `<span class="chip">راحة<b class="num">${restTxt(ex.rest)}</b></span>` : ''}
        </div>
        ${logged ? `<div class="logged">✓ سجّلت ${logged} من ${ex.sets}</div>` : ''}
      </div></div>`;
  };
  el.innerHTML = `
  ${topbar('التمرين', `<button class="iconbtn" id="wBack" aria-label="رجوع">${ICON.right}</button>`, `<button class="iconbtn" id="rulesBtn" aria-label="القواعد">${ICON.info}</button>`)}
  <p class="muted small" style="margin:12px 2px 0">الأسبوع ${w} · ${d.label} ${short(plannedDate(w, dk))}</p>
  <div class="daytitle"><h2>${d.title}</h2><span>${list.length} تمارين</span></div>
  <p class="daysub">${d.sub}${d.optional ? ' · ده اليوم اللي يتشال لو الأسبوع مزنوق' : ''}</p>
  ${isBusy(w) && d.optional ? `<div class="verdict warn" style="margin-bottom:14px"><h3>الأسبوع ده 3 أيام</h3><p>اليوم ده اتشال، والكتف الجانبي والفيس بول اتنقلوا لـ LOWER A.</p></div>` : ''}
  ${isBusy(w) && dk === 'lowerA' ? `<p class="small" style="margin:0 4px 12px;color:var(--warn)">+ رفرفة جانبي وفيس بول من LOWER B (أسبوع مزنوق)</p>` : ''}
  ${rd && rd.level !== 'green' ? `<div class="verdict ${rd.level === 'red' ? 'warn' : 'info'}" style="margin-bottom:14px"><h3>${READY_TXT[rd.level][0]}</h3><p>${READY_TXT[rd.level][1]} (${rd.why.join(' · ')}) – المجموعات تحت متظبطة.</p></div>` : ''}
  <button class="banner" id="warmBtn" style="margin-bottom:14px"><b>🔥 التسخين · ${WARMUP[warmKind(dk)].time}</b><span>${sess && sess.warm ? '✓ سخّنت' : 'قبل أول تمرين – عشان متتصابش'}</span></button>
  ${groups.map(g => `<div class="card">${g.length > 1 ? g.map((ex, i) => exHtml(ex, i + 1)).join('') : exHtml(g[0])}
     ${g.length > 1 ? `<div class="note small"><span>${g[0].kind === 'warm' ? 'الاتنين ورا بعض من غير راحة' : 'سوبر سِت: الاتنين ورا بعض'}</span></div>` : ''}
   </div>`).join('')}
  <div class="cta-bar"><button class="btn red" id="startBtn">${sess && Object.keys(sess.ex).length ? 'كمّل التمرين' : 'ابدأ التمرين'} ${ICON.arrowL}</button></div>`;
  el.classList.add('has-cta');
  $('#wBack').onclick = () => { view.wOpen = false; window.scrollTo(0, 0); render(); };
  el.querySelectorAll('[data-info]').forEach(b => b.onclick = () => infoSheet(findEx(dk, b.dataset.info)));
  el.querySelectorAll('[data-swap]').forEach(b => b.onclick = () => swapSheet(dk, b.dataset.swap, render));
  el.querySelectorAll('[data-log]').forEach(b => b.onclick = () => logSheet(w, dk, findEx(dk, b.dataset.log), () => render()));
  $('#startBtn').onclick = () => { const s0 = S.logs[sessKey(w, dk)]; if (!(s0 && (s0.warm || Object.values(s0.ex).some(a => a.length)))) warmSheet(w, dk, () => startPlayer(w, dk)); else startPlayer(w, dk); };
  $('#warmBtn').onclick = () => warmSheet(w, dk);
  $('#rulesBtn').onclick = rulesSheet;
}
const findEx = (dk, id) => { const w = view.week || curWeek(); const isNow = w === curWeek() && plannedDate(w, dk) <= today() && !sessDone(w, dk); return exList(dk, w, isNow ? readiness().level : null).find(e => e.id === id) || exList(dk, w).find(e => e.id === id); };

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
  openSheet(sheetHead('قواعد الكابتن') + RULES.map(r => `<div class="mt"><b>${esc(r.t)}</b><p style="margin:4px 0 0;line-height:1.7" class="muted">${esc(r.d)}</p></div>`).join('')
    + `<div class="section-t">المصادر العلمية</div>` + SOURCES.map(x => `<a class="row" href="${x[1]}" target="_blank" rel="noopener" style="text-decoration:none"><span style="font-size:14px">${esc(x[0])}</span>${ICON.arr}</a>`).join(''));
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
    ${sug ? `<div class="sugg">🧢 ${sug.txt}${sug.plateau ? `<button class="btn ghost block mt sm" id="plGo">غيّر النطاق لـ ${sug.plateau.next[0]}–${sug.plateau.next[1]}</button>` : ''}${ex.baseReps ? `<button class="link small" id="plReset" style="display:block;margin-top:8px">رجّع النطاق الأصلي ${ex.baseReps[0]}–${ex.baseReps[1]}</button>` : ''}</div>` : ''}
    <button class="btn red block mt" id="lSave">${editRef ? 'حفظ التعديل' : 'حفظ المجموعة'}</button>
    <div class="hist"><div class="hist-h"><span>السجل</span><span class="num">${hist.length} سجلات</span></div>
    ${hist.length ? hist.slice(0, 40).map((s, idx) => `<div class="hrow"><span class="d num">${s.date || ''}</span><span class="v">${timed ? `${s.r} ${unitTxt(ex)}` : `<span class="num">${fmt(s.w, 2)}</span> كجم × <span class="num">${s.r}</span>`}<small>RIR ${s.rir ?? '—'}${s.p != null ? ` · وجع ${s.p}` : ''}</small></span><button class="mini" data-ed="${idx}" aria-label="تعديل">${ICON.edit}</button><button class="mini del" data-del="${idx}" aria-label="مسح">${ICON.trash}</button></div>`).join('')
      : '<p class="muted small">لسه مفيش سجل للتمرين ده.</p>'}</div>`, p => {
    p.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { $('#lW', p).value = b.dataset.q; });
    const plg = $('#plGo', p); if (plg) plg.onclick = () => { S.repOverride[ex.lk] = sug.plateau.next; save(); closeSheet(); toast('النطاق اتغيّر ✓'); onSaved && onSaved('edit'); };
    const plr = $('#plReset', p); if (plr) plr.onclick = () => { delete S.repOverride[ex.lk]; save(); closeSheet(); toast('رجع للأصل'); onSaved && onSaved('edit'); };
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
  const adj = (w === curWeek() && (plannedDate(w, dk) <= today())) ? readiness().level : 'green';
  const list = exList(dk, w, adj);
  const sess = S.logs[sessKey(w, dk)];
  let idx = list.findIndex(ex => !sess || !sess.ex[ex.lk] || sess.ex[ex.lk].length < ex.sets);
  if (idx < 0) idx = 0;
  const saved = S.active && S.active.w === w && S.active.dk === dk ? S.active : null;
  P = saved || { w, dk, idx, adj, started: Date.now(), pausedAt: null, pausedMs: 0, rest: null };
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
function endRest() { restCancel(); if (!P) return; const adv = P.rest && P.rest.advance; P.rest = null; if (adv) P.idx = Math.min(P.idx + 1, exList(P.dk, P.w, P.adj).length - 1); S.active = P; save(); drawPlayer(); }
function drawPlayer() {
  const root = $('#player'); if (!P) return;
  const list = exList(P.dk, P.w, P.adj), ex = list[P.idx], sess = ensureSess(P.w, P.dk);
  const doneSets = (sess.ex[ex.lk] || []).length;
  const allDone = list.every(e => (sess.ex[e.lk] || []).length >= e.sets);
  const segs = list.map((e, i) => `<i class="${i === P.idx ? 'cur' : (sess.ex[e.lk] || []).length >= e.sets ? 'done' : ''}"></i>`).join('');
  const sug = suggest(ex, sessKey(P.w, P.dk));
  if (P.finished) {
    const vol = Object.values(sess.ex).flat().reduce((a, s) => a + (s.w || 0) * (s.r || 0), 0);
    const nSets = Object.values(sess.ex).flat().length;
    root.innerHTML = `<div class="segs">${segs}</div><div class="done-screen"><h2>عاش يا بطل 💪</h2><p>${dayByKey(P.dk).title} · الأسبوع ${P.w}</p>
      <div class="p-stats" style="justify-content:space-around"><div><b class="num">${clock(elapsed())}</b><small>الوقت</small></div><div><b class="num">${nSets}</b><small>مجموعة</small></div><div><b class="num">${fmt(vol)}</b><small>كجم حجم</small></div></div>
      <div style="text-align:start;margin-top:18px"><b>الحصة كانت صعبة قد إيه؟</b> <small style="color:#9a9aa2">(1 سهلة جداً – 10 أقصى حاجة)</small>
      <div class="rirs" style="grid-template-columns:repeat(10,1fr);gap:4px;margin-top:8px">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button data-rpe="${n}" style="height:40px;background:#1b1b1f;border-color:#2a2a30;color:#fff">${n}</button>`).join('')}</div>
      <b style="display:block;margin-top:14px">فيه وجع؟</b>
      <div class="chips">${['مفيش', 'ركبة', 'كتف', 'كوع', 'ضهر', 'تاني'].map(a => `<button class="chip" data-pa="${a}" style="background:#1b1b1f;color:#fff">${a}</button>`).join('')}</div>
      <textarea id="pNote" class="inp" style="margin-top:12px;background:#1b1b1f;border-color:#2a2a30;color:#fff;font-size:15px;font-weight:500" placeholder="ملاحظة للكابتن (اختياري)"></textarea></div>
      <button class="btn red block mt" id="pEnd">إنهاء</button><button class="btn outline block mt" style="background:transparent;color:#fff;border-color:#fff" id="pBack">رجوع للتمارين</button></div>`;
    let rpe = sess.rpe || null; const pa = new Set(sess.painAreas || []);
    const paint = () => { root.querySelectorAll('[data-rpe]').forEach(b => { const on = +b.dataset.rpe === rpe; b.style.background = on ? 'var(--red)' : '#1b1b1f'; }); root.querySelectorAll('[data-pa]').forEach(b => { b.style.background = pa.has(b.dataset.pa) ? 'var(--red)' : '#1b1b1f'; }); };
    root.querySelectorAll('[data-rpe]').forEach(b => b.onclick = () => { rpe = +b.dataset.rpe; paint(); });
    root.querySelectorAll('[data-pa]').forEach(b => b.onclick = () => { const a = b.dataset.pa; if (a === 'مفيش') pa.clear(); else { pa.delete('مفيش'); } pa.has(a) ? pa.delete(a) : pa.add(a); paint(); });
    if (sess.note) $('#pNote').value = sess.note;
    paint();
    $('#pEnd').onclick = () => {
      sess.end = Date.now(); if (rpe) sess.rpe = rpe; sess.painAreas = [...pa].filter(x => x !== 'مفيش'); const n = $('#pNote').value.trim(); if (n) sess.note = n;
      if (n) S.inbox.push({ t: Date.now(), text: `بعد ${dayByKey(P.dk).title}: ${n}` });
      save(); closePlayer(); scheduleReminders(); ghSoon(5000); toast('اتسجّل التمرين ✓');
    };
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
  const list = exList(P.dk, P.w, P.adj); const nx = advance ? list[Math.min(P.idx + 1, list.length - 1)] : list[P.idx];
  restNotify(P.rest.until, `${advance ? 'التمرين الجاي' : 'المجموعة الجاية'}: ${nx.name}`);
}
function painStop(ex) {
  openSheet(sheetHead('وقّف التمرين ده', 'الوجع عدّى 3/10') + `<p style="line-height:1.8">متكمّلش ${esc(ex.name)} النهارده. ${ex.pain ? 'اعمل بداله ثبات خفيف 30 ثانية بزاوية 90° لو مش بيوجع، أو سيبه خالص.' : ''} لو الوجع فضل لبكرة الصبح أو زاد، المرة الجاية جرّب البديل أو قلّل الوزن للنص.</p>
    <button class="btn red block mt" id="psNext">التمرين اللي بعده</button><button class="btn ghost block mt" data-close>رجوع</button>`, p => {
    $('#psNext', p).onclick = () => { closeSheet(); const list = exList(P.dk, P.w, P.adj); if (P.idx < list.length - 1) P.idx++; save(); drawPlayer(); };
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
    const sqa = sleepAvg(end); rows.push({ wk, aw: aw && aw.avg, st, sl, sq: sqa && sqa.avg, sessions });
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
  el.innerHTML = `${topbar('التقدّم')}
  <div class="verdict ${v.cls}"><h3>${v.t}</h3><p>${v.d}</p></div>
  ${(() => { const a = adaptive(); if (!a) return `<div class="section-t">حرقك الحقيقي</div><div class="card pad"><p class="muted small" style="margin:0;line-height:1.7">بعد ~2 أسبوع وزن يومي وأكل متعلّم عليه، الكابتن هيحسب حرقك الحقيقي ويظبط السعرات لوحده.</p></div>`;
    return `<div class="section-t">حرقك الحقيقي (آخر 3 أسابيع)</div><div class="card pad">
    <div class="tiles"><div class="tile"><small>الحرق الحقيقي</small><b class="num">${fmt(a.tdee)}</b><div class="sub">ثقة ${a.conf} · ${a.logged}/${a.days} يوم متعلّم</div></div>
    <div class="tile"><small>اتجاه الوزن</small><b class="num">${a.slopeWk <= 0 ? '−' : '+'}${fmt(Math.abs(a.slopeWk), 2)}</b><div class="sub">كجم في الأسبوع</div></div></div>
    <p class="small" style="line-height:1.7;margin:12px 0 0">متوسط أكلك ${fmt(a.intakeAvg)} سعر. عشان تنزل 0.7% في الأسبوع المثالي ~${fmt(a.ideal)} سعر في اليوم العادي (دلوقتي ${fmt(S.settings.kcal)}).</p>
    ${a.sleepHold ? `<div class="verdict warn mt"><h3>مش هنقلل سعرات دلوقتي 😴</h3><p>متوسط جودة نومك ${a.sleepAvg.avg}/100. التقليل والنوم وحش بيكسّر عضل بدل الدهون – نصلّح النوم الأول وبعدين نقلل.</p></div>` : ''}
    ${a.delta ? `<button class="btn red block mt" id="adaptGo">${a.delta > 0 ? `زوّد ${a.delta} سعر (${Math.round(a.delta / 1.3)} جم رز)` : `قلّل ${-a.delta} سعر (${Math.round(-a.delta / 1.3)} جم رز)`}</button><p class="muted small" style="margin:6px 0 0">التعديل محدود بـ 150 سعر في المرة عشان ميبقاش مفاجئ.</p>` : '<p class="up small" style="margin:8px 0 0">السعرات مظبوطة – مفيش تعديل ✓</p>'}
    ${S.settings.riceAdj ? `<button class="btn ghost block mt sm" id="adaptReset">رجّع الرز للأصل (${riceAdj() > 0 ? '+' : ''}${riceAdj()} جم)</button>` : ''}</div>`; })()}
  <div class="section-t">الوزن – آخر 8 أسابيع</div><div class="card pad">${weightChart()}<button class="link small" id="wEdit" style="margin-top:8px">تعديل الأوزان</button></div>
  <div class="section-t">أسبوع بأسبوع</div>
  <div class="card pad scroll-x">${rows.length ? '' : '<p class="muted small" style="margin:0 0 8px">الجدول هيبدأ مع أول أسبوع في البرنامج.</p>'}<table class="t"><thead><tr><th>الأسبوع</th><th>متوسط الوزن</th><th>الخطوات</th><th>النوم</th><th>تمارين</th></tr></thead><tbody>
  ${rows.map((r, i) => { const prev = rows[i + 1]; const ch = prev && prev.aw && r.aw ? r.aw - prev.aw : null; return `<tr><td>${r.wk < 1 ? '—' : r.wk}</td><td>${r.aw ? fmt(r.aw, 1) : '—'} ${ch != null ? `<span class="${ch <= 0 ? 'up' : 'down'} small">${ch <= 0 ? '▼' : '▲'}${fmt(Math.abs(ch), 1)}</span>` : ''}</td><td>${r.st ? fmt(r.st) : '—'}</td><td>${r.sl ? (r.sl / 60).toFixed(1) + ' س' : '—'}${r.sq ? `<br><small class="muted">جودة ${r.sq}</small>` : ''}</td><td>${r.sessions}/4</td></tr>`; }).join('')}
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
  <div class="section-t">صور التقدّم</div>
  <div class="card pad">${(() => { const ds = photoDates(); if (!ds.length) return `<p style="margin:0;line-height:1.7">صوّر نقطة البداية: <b>قدام، جنب، ضهر</b>. وكل 4 أسابيع الكابتن هيفكّرك، وتقارن جنب بعض.</p>`;
    const first = ds[0], last = ds[ds.length - 1]; const next = addDays(last, 28);
    return `<div class="grid3">${POSES.map(([k]) => `<div data-ph="${last}|${k}" style="aspect-ratio:3/4;border-radius:12px;overflow:hidden;background:var(--chip);display:grid;place-items:center"></div>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 0">آخر صور ${nice(last)} · ${ds.length} مرة${ds.length > 1 ? ` من ${short(first)}` : ''} · ${photoDue() ? '<b class="down">ميعاد صور جديدة</b>' : `الجاية ${short(next)}`}</p>`; })()}
    <div class="grid2 mt"><button class="btn ${photoDue() ? 'red' : 'ghost'} sm" id="phNew">صوّر دلوقتي</button><button class="btn ghost sm" id="phCmp" ${photoDates().length < 2 ? 'disabled' : ''}>قارن</button></div></div>
  <div class="grid2 mt"><button class="btn ghost sm" id="ckOpen">✍️ تشيك إن الأسبوع</button><button class="btn ghost sm" id="mrOpen">📊 تقرير الشهر</button></div>

  <p class="muted small" style="text-align:center;margin:6px 0 0">بيفتح Claude على موبايلك والتقرير جاهز – اختار المحادثة دي وابعت.</p>`;
  $('#addBody').onclick = bodySheet;
  $('#wEdit').onclick = weightsSheet;
  const ag = $('#adaptGo'); if (ag) ag.onclick = () => applyAdaptive(adaptive().delta);
  const ar = $('#adaptReset'); if (ar) ar.onclick = () => { S.settings.kcal = Math.round(S.settings.kcal - riceAdj() * 1.3); S.settings.riceAdj = 0; save(); render(); toast('رجع للأصل ✓'); };
  $('#ckOpen').onclick = checkinSheet;
  $('#mrOpen').onclick = monthReportSheet;
  $('#phNew').onclick = () => photoSessionSheet();
  $('#phCmp').onclick = photoCompareSheet;
  fillPhotos(el);
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
  const lines = [`# تقرير ${diffDays(t, set.start) < 0 ? 'قبل بداية البرنامج' : 'الأسبوع ' + wk} – Lifestyle`, `الفترة: ${addDays(t, -6)} → ${t}`, ''];
  lines.push('## الوزن والنشاط');
  const daily = []; for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const e = eff(d); daily.push(`${short(d)}: ${e.w ?? '—'} كجم · ${e.steps ?? '—'} خطوة · نشاط ${e.active ?? '—'} · حرق تقديري ${e.kcal ?? '—'} · نوم ${e.sleep ? (e.sleep / 60).toFixed(1) + 'س' : '—'}${(q => q ? ` (جودة ${q.score}${q.z.deep != null ? `، عميق ${q.z.deep}د` : ''}${q.z.rem != null ? `، REM ${q.z.rem}د` : ''})` : '')(sleepQ(d))}${e.creatine ? ' · كرياتين✓' : ''}`); }
  lines.push(`- متوسط الوزن: ${now ? fmt(now.avg, 2) : '—'} (الأسبوع اللي فات ${prev ? fmt(prev.avg, 2) : '—'})`);
  lines.push(`- متوسط الخطوات: ${fmt(avgOf('steps', t))} (الهدف ${set.steps}) · متوسط الحرق: ${fmt(avgOf('kcal', t))} · متوسط النوم: ${avgOf('sleep', t) ? (avgOf('sleep', t) / 60).toFixed(1) + ' ساعة' : '—'}`);
  lines.push(...daily.map(x => '  - ' + x));
  const bd = Object.keys(S.body).sort().pop(); if (bd) { const b = S.body[bd]; lines.push(`- آخر قياس (${bd}): وزن ${b.weight ?? '—'} · دهون ${b.fat ?? '—'}% (${b.fatKg ?? '—'} كجم) · عضل هيكلي ${b.skmKg ?? '—'} كجم (${b.skm ?? '—'}%) · مية ${b.water ?? '—'}% · حشوية ${b.visceral ?? '—'} · BMR ${b.bmr ?? '—'} · وسط ${b.waist ?? '—'} سم`); }
  { const a = adherence(wk); if (a) lines.push('', `## الالتزام: ${a.score}% (تمرين ${a.parts.wo != null ? Math.round(a.parts.wo * 100) : '—'}% · أكل ${a.parts.meals != null ? Math.round(a.parts.meals * 100) : '—'}% · خطوات ${a.parts.steps != null ? Math.round(a.parts.steps * 100) : '—'}% · وزن ${a.parts.weight != null ? Math.round(a.parts.weight * 100) : '—'}% · كرياتين ${a.parts.cr != null ? Math.round(a.parts.cr * 100) : '—'}%)${isBusy(wk) ? ' · أسبوع مزنوق (3 أيام)' : ''} · سلسلة ${adherenceStreak()}`); }
  lines.push('', '## التمرين');
  { const old = Object.values(S.logs).filter(x => x.src === 'gain' && x.date >= addDays(t, -6) && x.date <= t).sort((a, b) => a.date.localeCompare(b.date));
    old.forEach(x => lines.push(`- ${x.date} (من The Gain): ${Object.entries(x.ex).map(([k, a]) => `${(a[0] && a[0].name) || k} ${a.map(z => z.w + '×' + z.r).join(' ')}`).join(' | ')}`)); }
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
  { const c = S.checkins[checkinThisWeek() || ''] ; if (c) lines.push('', `## تشيك إن: طاقة ${c.energy}/5 · جوع ${c.hunger}/5 ${c.sleepQ ? `· نوم ${c.sleepQ}/5 ` : ''}· ضغط ${c.stress}/5 · مزاج ${c.mood}/5${c.waist ? ` · وسط ${c.waist} سم` : ''}${c.note ? `
${c.note}` : ''}`); }
  { const ses = Object.values(S.logs).filter(x => !x.legacy && x.date >= addDays(t, -6) && (x.rpe || (x.painAreas || []).length || x.note)); if (ses.length) lines.push('', '## إحساس الحصص', ...ses.map(x => `- ${x.date}: صعوبة ${x.rpe || '—'}/10${(x.painAreas || []).length ? ' · وجع ' + x.painAreas.join('، ') : ''}${x.note ? ' · ' + x.note : ''}`)); }
  { const ins = S.inbox.filter(m => m.t > Date.now() - 7 * 864e5); if (ins.length) lines.push('', '## قلتلك', ...ins.map(m => '- ' + m.text)); }
  { const ds = photoDates(); if (ds.length) lines.push('', `## صور التقدّم: ${ds.length} مرة، آخرها ${ds[ds.length - 1]}${photoDue() ? ' (ميعاد صور جديدة)' : ''}`); }
  lines.push('', 'يا كابتن راجع وقولي نعدّل إيه.');
  return lines.join('\n');
}

/* ================= الأكل ================= */
function rawTxt(it) {
  const def = it.swapped ? SHOP_ALT[it.name] : SHOP[it.id];
  if (!def || def.noRaw || Math.abs(def.f - 1) < 0.1) return '';
  const raw = Math.round(it.g * def.f / 5) * 5;
  return `<div class="raw">${def.f < 1 ? 'قبل السلق' : 'قبل الطبخ'}: <bdi class="num">${raw}</bdi> جم ${def.f < 1 ? 'ناشف' : 'ني'}</div>`;
}
const SVG_POT = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM2 10h2M20 10h2M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2"/></svg>';
const SVG_BASKET = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18l-2 11H5zM8 9l2-5M16 9l-2-5M9 13v4M12 13v4M15 13v4"/></svg>';
const SVG_BOOK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1zM12 6v14M6 9h3M6 12h3M15 9h3"/></svg>';
const MEAL_EMOJI = { m1: '🍳', m2: '🍠', drink: '🥤', m3: '🍗' };
function renderShopTab(el, head) {
  const sh = shopState(), list = shopCompute(sh.start), end = addDays(sh.start, 13), left = diffDays(end, today());
  const done = list.filter(x => sh.bought[x.id]).length;
  el.innerHTML = head + `
  <div class="h2row"><h2>لستة الأسبوعين</h2><span class="muted small">${short(sh.start)} → ${short(end)}</span></div>
  <div class="goals card"><div class="goal"><span>اشتريت</span><div class="track"><i style="width:${list.length ? done / list.length * 100 : 0}%;background:var(--ok)"></i></div><b class="num">${done}/${list.length}</b></div></div>
  ${left < 0 ? '<div class="banner warn mt"><b>اللستة خلصت</b><span>ابدأ لستة جديدة من تحت.</span></div>' : left <= 2 ? `<div class="banner warn mt"><b>فاضل ${left + 1} يوم</b><span>جهّز اللستة الجاية.</span></div>` : ''}
  <p class="muted small" style="line-height:1.7;margin:14px 2px 4px">الكميات ني وناشف زي ما هتشتريها، محسوبة من خطة الأسبوعين.</p>
  ${list.map(x => `<button class="shop-row ${sh.bought[x.id] ? 'on' : ''}" data-buy="${esc(x.id)}"><span class="box">${sh.bought[x.id] ? '✓' : ''}</span><div><b>${esc(x.name)}</b>${[x.sub, x.cookedTxt].filter(Boolean).length ? `<small>${[x.sub, x.cookedTxt].filter(Boolean).join(' · ')}</small>` : ''}${sh.bought[x.id] ? `<span class="when">اشتريته ${short(sh.bought[x.id])}</span>` : ''}</div><span class="q"><bdi class="num">${x.qty}</bdi></span></button>`).join('')}
  <label style="display:flex;align-items:center;gap:10px;margin-top:14px"><input type="checkbox" id="lecBox" ${S.settings.lectureBox !== false ? 'checked' : ''} style="width:20px;height:20px"><span class="small">احسب علبة العشا لأيام المحاضرة</span></label>
  <div class="grid2 mt"><button class="btn ghost sm" id="shAll">علّم الكل اتشرى</button><button class="btn ghost sm" id="shCopy">انسخ اللستة</button></div>
  <button class="btn red block mt" id="shNew">ابدأ لستة جديدة من النهارده</button>`;
  el.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const id = b.dataset.buy; if (sh.bought[id]) delete sh.bought[id]; else sh.bought[id] = today(); save(); render(); });
  $('#lecBox').onchange = e => { S.settings.lectureBox = e.target.checked; save(); render(); };
  $('#shAll').onclick = () => { list.forEach(x => { if (!sh.bought[x.id]) sh.bought[x.id] = today(); }); save(); render(); toast('اتعلّم ✓'); };
  $('#shCopy').onclick = () => copyText(`🛒 لستة ${short(sh.start)} → ${short(end)}\n` + list.filter(x => !sh.bought[x.id]).map(x => `- ${x.name}: ${x.qty}${x.sub ? ' (' + x.sub + ')' : ''}`).join('\n'));
  $('#shNew').onclick = e => { const btn = e.currentTarget; if (!btn.dataset.sure) { btn.dataset.sure = 1; btn.textContent = 'متأكد؟ اضغط تاني'; return; } S.shop = { start: today(), bought: {} }; save(); render(); };
}
function renderFood(el) {
  const td = today();
  if (!view.food) view.food = td;
  view.mOpen = view.mOpen || {};
  const head = topbar('التغذية', `<button class="iconbtn" id="dInfo" aria-label="معلومات">${ICON.info}</button>`, `<button class="iconbtn" id="rcTop" aria-label="وصفات">${SVG_BOOK}</button>`)
    + `<div class="seg"><button class="${view.foodTab !== 'shop' ? 'on' : ''}" data-ft="plan">${SVG_POT}البرنامج الغذائي</button><button class="${view.foodTab === 'shop' ? 'on' : ''}" data-ft="shop">${SVG_BASKET}السوبر ماركت</button></div>`;
  const bindHead = () => {
    el.querySelectorAll('[data-ft]').forEach(b => b.onclick = () => { view.foodTab = b.dataset.ft; render(); });
    $('#rcTop').onclick = () => recipesSheet();
    $('#dInfo').onclick = () => openSheet(sheetHead('ليه الأرقام دي؟') + `<p style="line-height:1.8">الهدف ~${fmt(S.settings.kcal)} سعر و~${DIET.protein} جم بروتين في اليوم العادي. الكابتن بيحسب حرقك الحقيقي كل أسبوع من الأكل اللي بتعلّم عليه ومتوسط وزنك، ويقترح تعديل في رز العشا.</p><p style="line-height:1.8" class="muted">علّم على كل وجبة بعد ما تاكلها، وسجّل أي أكل زيادة – ده اللي بيخلي الحسبة صح.</p>`);
  };
  if (view.foodTab === 'shop') { renderShopTab(el, head); bindHead(); return; }
  const t = view.food, eaten = (S.days[t] || {}).meals || {}, ms = mealsFor(t), dt = dayType(t), future = t > td;
  const week = Array.from({ length: 8 }, (_, i) => addDays(td, i - 1));
  const allEaten = d => { const e2 = (S.days[d] || {}).meals || {}; const m2 = mealsFor(d); return m2.length && m2.every(m => e2[m.id]); };
  const kc = ms.reduce((a, m) => a + m.kcal, 0), pr = ms.reduce((a, m) => a + m.p, 0);
  const ek = ms.reduce((a, m) => a + (eaten[m.id] ? m.kcal : 0), 0) + extraOf(t), ep = ms.reduce((a, m) => a + (eaten[m.id] ? m.p : 0), 0);
  const wat = eff(t).water || 0, wt = S.settings.water;
  const banner = dt === 'mom' ? `<div class="banner ok mt"><b>جمعة ماما 😄</b><span>ميزانية النهارده ~${fmt(kc)} سعر. البروتين الأول، طبق واحد مليان، حتة حلو واحدة.</span></div>`
    : dt === 'lecture' ? `<div class="banner mt"><b>يوم محاضرة 🎓</b><span>العشا برة – اختار اللي أكلته عشان الحسبة تبقى صح.</span></div>` : '';
  const itemRow = (it, mid) => `<div class="item"><span class="food-ic">${esc(it.name.trim()[0])}</span><div><b>${esc(it.name)}</b>${it.kcal ? `<small><bdi class="num">${it.kcal}</bdi> سعر · <bdi class="num">${it.p}</bdi> بروتين</small>` : ''}${rawTxt(it)}${it.swapped ? `<div class="swapped">بدل ${esc(it.base)}</div>` : ''}${it.adj ? `<div class="swapped">${it.adj > 0 ? '+' : ''}${it.adj} جم من تعديل الكابتن</div>` : ''}</div>${it.drinkCut ? `<div class="swapped">−${it.drinkCut} جم يوم التمرين (راحت للمشروب)</div>` : ''}${((DIET.meals.find(x => x.id === mid) || { items: [] }).items.find(x => x.id === it.id) || {}).alts?.length ? `<button class="mini" data-fs="${it.id}" aria-label="بدّل">${ICON.swap}</button>` : ''}<span class="qty"><bdi class="num">${it.g}</bdi><small>${it.unit || 'جم'}</small></span></div>`;
  const bar = (lab, v, of, col, unit) => `<div class="goal"><span>${lab}</span><div class="track"><i style="width:${of ? Math.min(100, v / of * 100) : 0}%;background:${col}"></i></div><b class="num">${fmt(v, unit === 'ل' ? 2 : 0)}<small> / ${fmt(of, unit === 'ل' ? 1 : 0)} ${unit}</small></b></div>`;
  const photos = d => S.mealPhotos[d] || [];
  const mealCard = m => {
    const open = !!view.mOpen[m.id], rc = ((S.days[t] || {}).recipes || {})[m.id];
    const names = rc ? rc.name : m.special ? (m.options.find(o => o.id === m.pick) || {}).name || m.title : m.items.filter(x => x.kcal).map(x => x.name.replace(/\s*\(.*\)/, '')).slice(0, 4).join(' + ');
    const nPh = photos(t).filter(x => x.meal === m.id).length;
    return `<div class="meal">
      <div class="meal-top"><h3>${m.title}</h3><button data-mo="${m.id}">${open ? 'اقفل' : 'اعرض الوجبة'} <svg viewBox="0 0 24 24"><path d="${open ? 'M6 15l6-6 6 6' : 'M19 12H5M11 6l-6 6 6 6'}"/></svg></button></div>
      <div class="meal-body"><div class="meal-pic" data-mph="${m.id}">${MEAL_EMOJI[m.id] || '🍽️'}<span class="kc"><bdi class="num">${rc ? rc.kcal : m.kcal}</bdi> ك</span></div>
        <div class="meal-txt"><b>${esc(names)}</b><small>${m.time} · ${rc ? rc.p : m.p} جم بروتين${nPh ? ` · 📸 ${nPh}` : ''}</small></div>
        ${future ? '' : `<button class="tick ${eaten[m.id] ? 'on' : ''}" data-eat="${m.id}" aria-label="أكلتها"><svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg></button>`}</div>
      ${open ? `<div class="meal-items">
        ${rc ? `<div class="item"><span class="food-ic">📖</span><div><b>بدلها: ${esc(rc.name)}</b><small><bdi class="num">${rc.kcal}</bdi> سعر · <bdi class="num">${rc.p}</bdi> بروتين</small></div><button class="mini" data-rcm="${m.id}" aria-label="الوصفة">${ICON.arrowL}</button><button class="mini del" data-rcx="${m.id}" aria-label="شيل">${ICON.trash}</button></div>` : ''}
        ${m.special ? m.options.map(o => `<button class="item" style="width:100%;text-align:start" data-opt="${o.id}"><span class="food-ic" style="${m.pick === o.id ? 'background:var(--red);color:#fff' : ''}">${m.pick === o.id ? '✓' : ''}</span><div><b>${esc(o.name)}</b><small>${esc(o.desc)}</small><small><bdi class="num">${o.id === 'box' ? m.boxItems.reduce((a, x) => a + x.kcal, 0) : o.kcal}</bdi> سعر · <bdi class="num">${o.p}</bdi> بروتين</small></div></button>`).join('') : m.items.map(it => itemRow(it, m.id)).join('')}
        ${m.note ? `<p class="small muted" style="margin:10px 0 0;line-height:1.7">💡 ${esc(m.note)}</p>` : ''}
        ${future ? '' : `<div class="meal-acts"><label style="cursor:pointer">📸 صوّر الطبق<input type="file" accept="image/*" capture="environment" data-mp="${m.id}" hidden></label>${m.drink ? '' : `<button data-rcfor="${m.id}">📖 وصفة تانية بنفس السعرات</button>`}</div>`}
      </div>` : ''}
    </div>`;
  };
  const ex = (S.days[t] || {}).extras || [], extot = extraOf(t);
  el.innerHTML = head + `
  <div class="dstrip">${week.map(d => `<button class="dchip ${d === t ? 'on' : allEaten(d) ? 'done' : ''}" data-fd="${d}"><small>${d === td ? 'النهارده' : AR_DAYS[parseISO(d).getDay()].replace('ال', '')}</small><i>${allEaten(d) ? '✓' : ''}</i><b class="num">${parseISO(d).getDate()}</b></button>`).join('')}</div>
  ${banner}
  <div class="h2row"><h2>الهدف اليومي</h2>${future ? '<span class="muted small">يوم جاي</span>' : ''}</div>
  <div class="card goals">${bar('السعرات', ek, kc, 'var(--c-carb)', '')}${bar('البروتين', ep, pr, 'var(--c-prot)', 'جم')}${bar('المية', wat, wt, 'var(--c-water)', 'ل')}</div>
  <div class="h2row"><h2>الوجبات</h2><button class="obtn" id="rcOpen">📖 وصفات</button></div>
  ${ms.map(mealCard).join('')}
  <div class="meal"><div class="meal-top"><h3>أكل زيادة</h3><button id="exAdd">+ ضيف</button></div>
    ${ex.length ? ex.map((e, i) => `<div class="item"><div><b>${esc(e.name)}</b><small><bdi class="num">${e.kcal}</bdi> سعر</small></div><button class="mini del" data-exdel="${i}" aria-label="مسح">${ICON.trash}</button></div>`).join('') : '<p class="muted small" style="margin:12px 0 0">حلو، مشروب، عزومة؟ دوس "ضيف" واختار – السعرات محسوبة.</p>'}
    ${extot ? `<p class="small" style="margin:8px 0 0">المجموع: <b class="num">${extot}</b> سعر</p>` : ''}</div>`;
  bindHead();
  el.querySelectorAll('[data-fd]').forEach(b => b.onclick = () => { view.food = b.dataset.fd; render(); });
  el.querySelectorAll('[data-mo]').forEach(b => b.onclick = () => { view.mOpen[b.dataset.mo] = !view.mOpen[b.dataset.mo]; render(); });
  el.querySelectorAll('[data-mph]').forEach(b => b.onclick = () => { view.mOpen[b.dataset.mph] = !view.mOpen[b.dataset.mph]; render(); });
  el.querySelectorAll('[data-mp]').forEach(inp => inp.onchange = async () => { const f = inp.files && inp.files[0]; if (!f) return; try { await addMealPhoto(t, inp.dataset.mp, f); toast(ghOn() ? 'اتحفظت ✓ – الكابتن هيحسبها الصبح' : 'اتحفظت ✓'); render(); } catch (e) { toast('مقدرتش أحفظ الصورة'); } });
  $('#rcOpen').onclick = () => recipesSheet();
  el.querySelectorAll('[data-rcfor]').forEach(b => b.onclick = () => recipesSheet(b.dataset.rcfor));
  el.querySelectorAll('[data-rcm]').forEach(b => b.onclick = () => { const x = (S.days[t] || {}).recipes || {}; const rr = x[b.dataset.rcm]; const r = rr && allRecipes().find(z => z.id === rr.id); if (r) recipeSheet(r, b.dataset.rcm); });
  el.querySelectorAll('[data-rcx]').forEach(b => b.onclick = () => { delete S.days[t].recipes[b.dataset.rcx]; save(); render(); });
  el.querySelectorAll('[data-eat]').forEach(b => b.onclick = () => { const d = day(t); d.meals = d.meals || {}; d.meals[b.dataset.eat] = !d.meals[b.dataset.eat]; if (b.dataset.eat === 'drink' && d.meals.drink) d.creatine = true; save(); render(); });
  el.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => { if (future) { toast('اختار يومها بعد ما تاكل'); return; } const d = day(t); d.choice = b.dataset.opt; d.meals = d.meals || {}; d.meals.m3 = true; save(); render(); });
  el.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => foodSwapSheet(b.dataset.fs));
  $('#exAdd').onclick = () => future ? toast('سجّل الأكل الزيادة يومها') : extrasSheet(t);
  el.querySelectorAll('[data-exdel]').forEach(b => b.onclick = () => { const d = day(t); d.extras.splice(+b.dataset.exdel, 1); save(); render(); });
}
function extrasSheet(d) {
  let q = '';
  const draw = p => {
    const box = $('#exList', p);
    box.innerHTML = EXTRAS.map(c => { const its = c.items.filter(([n]) => !q || n.includes(q)); return its.length ? `<div class="section-t">${c.cat}</div>${its.map(([n, k]) => `<button class="alt" data-n="${esc(n)}" data-k="${k}"><span class="food-ic">${esc(n.trim()[0])}</span><span style="flex:1"><b>${esc(n)}</b><small><span class="num">${k}</span> سعر</small></span><span class="link">+</span></button>`).join('')}` : ''; }).join('')
      + `<div class="section-t">مش عارف السعرات؟</div><label class="btn ghost block sm" style="cursor:pointer">📸 صوّرها والكابتن يحسبها الصبح<input type="file" accept="image/*" capture="environment" id="exPh" hidden></label><div class="section-t">مش لاقيه؟</div><div class="grid2"><input id="exName" class="inp" style="font-size:15px" placeholder="اسم الأكلة"><input id="exK" class="inp num" inputmode="numeric" placeholder="سعرات"></div><button class="btn ghost block mt sm" id="exCustom">ضيف</button><p class="muted small">مش عارف السعرات؟ صوّرها وابعتهالي في الشات وأنا أقولك.</p>`;
    box.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { const x = day(d); (x.extras = x.extras || []).push({ name: b.dataset.n, kcal: +b.dataset.k }); save(); toast(`اتضاف: ${b.dataset.n} (${b.dataset.k} سعر)`); render(); });
    const xp = $('#exPh', p); if (xp) xp.onchange = async () => { const f = xp.files && xp.files[0]; if (!f) return; try { await addMealPhoto(d, 'extra', f); closeSheet(); render(); toast('اتحفظت ✓ – هقولك سعراتها الصبح'); } catch (e) { toast('مقدرتش أحفظ الصورة'); } };
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
    ['heart', 'الساعة', () => watchDirectSheet(), (S.watch || {}).battery != null ? `🔋 ${S.watch.battery}%` : ''],
    ['heart', 'الميزان وZepp Active', zeppSetupSheet, native ? (zeppState.enabled ? '✓ شغالة' : 'مش شغالة') : ''],
    ['save', 'المزامنة مع Google Drive', cloudSheet, cloudInfo.linked ? '✓ مربوط' : 'مش مربوط'],
    ['bell', 'الإشعارات', notifSheet, S.settings.notif ? 'شغالة' : 'مقفولة'],
    ['shield', 'الكابتن (المراجعة اليومية)', () => (ghOn() && (S.coach.msgs || []).length ? coachMsgsSheet() : ghSheet()), ghOn() ? (S.settings.ghLast ? '✓ شغالة' : 'مستنية') : 'مش متفعّلة'],
    ['report', 'قول للكابتن', sayCoachSheet, ''],
    
    ['heart', 'مكان الجيم', gymSheet, S.settings.gym ? '✓' : ''],
    ['shield', 'قواعد الكابتن والمصادر', rulesSheet, ''],
    ['save', 'تحديث التطبيق', () => upCheck(true), upInfo && upInfo.available ? '🔴 فيه جديد' : ''],
    ['report', 'أدوات تانية', moreSheet, '']
  ];
  el.innerHTML = `${topbar('المزيد')}
   <div class="section-t">الحساب</div><div class="rows">${rows.map((r, i) => `<button class="row" data-r="${i}">${ICON[r[0]]}<span>${r[1]}</span>${r[3] ? `<em>${r[3]}</em>` : ''}${ICON.arr}</button>`).join('')}</div>
   <p class="muted small mt" style="text-align:center">Lifestyle · ${cloudInfo.linked ? 'البيانات متزامنة مع Google Drive' : 'البيانات على الموبايل ده بس'}</p>`;
  el.querySelectorAll('[data-r]').forEach(b => b.onclick = rows[+b.dataset.r][2]);
}
function moreSheet() {
  const items = [['سجل الأوزان وتعديلها', weightsSheet], ['إعدادات المراجعة اليومية', ghSheet]];
  openSheet(sheetHead('أدوات تانية', 'حاجات مش هتحتاجها كتير') + items.map((x, i) => `<button class="row" data-m="${i}"><span>${x[0]}</span>${ICON.arr}</button>`).join(''), p => {
    p.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { closeSheet(); items[+b.dataset.m][1](); });
  });
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
    <div class="note"><span class="i">1</span><span><b>الساعة:</b> Zepp Active مبيبعتش لـ Health Connect، فLifestyle بيقرا أرقامه من الشاشة مباشرة.</span></div>
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
if (Zepp) cloudPullIfNewer().then(() => { if (!cloudInfo.linked && !S.settings.cloudAsked && Object.keys(S.logs).length > 1) { S.settings.cloudAsked = true; save(); setTimeout(() => { if ($('#sheet').hidden && $('#player').hidden) cloudSheet(); }, 1500); } });
if (LN) setupNotifActions();
if (ghOn()) setTimeout(() => ghSync(), 2500);
setTimeout(gymCheck, 3000);
if (UP) setTimeout(() => upCheck(false), 4000);
if (WD) setTimeout(() => watchSync(false).then(ok => { if (ok && $('#player').hidden && $('#sheet').hidden) render(); }), 1500);
if (LN) (async () => {
  try { if (S.settings.notif && !S.settings.notifAsked) { S.settings.notifAsked = true; save(); await LN.requestPermissions(); } } catch (e) { }
  scheduleReminders();
})();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') { if (cloudT) { clearTimeout(cloudT); cloudPush(); } if (ghT) { clearTimeout(ghT); ghSync(); } return; }
  if (!P) cloudPullIfNewer();
  if (!P && ghOn() && Date.now() - (S.settings.ghLast || 0) > 30 * 60e3) ghSync();
  if (!P) setTimeout(gymCheck, 800);
  if (UP && !P && Date.now() - (S.settings.upChecked || 0) > 3 * 3600e3) setTimeout(() => upCheck(false), 2000);
  if (WD && !P) setTimeout(() => watchSync(false).then(ok => { if (ok && $('#player').hidden && $('#sheet').hidden) render(); }), 1200);
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
