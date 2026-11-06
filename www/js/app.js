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
  arr: '<svg class="arr" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
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

const day = d => (S.days[d] = S.days[d] || {});

/* القيم الفعلية لليوم: اليدوي يكسب في الوزن، والساعة تكسب في الخطوات والحرق */
function eff(d) {
  const m = S.days[d] || {}, h = S.health[d] || {};
  return {
    w: m.w ?? h.weight ?? null,
    steps: h.steps ?? m.steps ?? null,
    kcal: h.kcal ?? m.kcal ?? null,
    sleep: h.sleepMin ?? null,
    rhr: h.rhr ?? null,
    fat: h.fat ?? null,
    creatine: !!m.creatine,
    water: m.water || 0
  };
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
document.querySelectorAll('#tabbar button').forEach(b => b.onclick = () => { tab = b.dataset.tab; window.scrollTo(0, 0); render(); });

function renderSyncLine() {
  const el = $('#syncline'); if (!el) return;
  if (!native) { el.innerHTML = `<span class="dot"></span><span>Health Connect بيشتغل في تطبيق الأندرويد</span>`; return; }
  if (syncing) { el.innerHTML = `<span class="dot"></span><span>بيحدّث من Health Connect…</span>`; return; }
  const ls = S.settings.lastSync;
  if (!ls) { el.innerHTML = `<span class="dot bad"></span><span>Zepp والميزان مش مربوطين لسه</span><button id="hcGo">اربط دلوقتي</button>`; $('#hcGo').onclick = hcConnect; return; }
  const m = Math.round((Date.now() - new Date(ls)) / 6e4);
  el.innerHTML = `<span class="dot ok"></span><span>آخر تحديث ${m < 1 ? 'دلوقتي' : m < 60 ? `من ${m} دقيقة` : `من ${Math.round(m / 60)} ساعة`}</span><button id="hcGo">حدّث</button>`;
  $('#hcGo').onclick = () => hcSync(true);
}

/* ================= الكابتن: حكم الأسبوع ================= */
function avgWeight(endDate, n = 7) {
  const vals = [];
  for (let i = 0; i < n; i++) { const w = eff(addDays(endDate, -i)).w; if (w) vals.push(w); }
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
  <div class="sync" id="syncline"></div>
  <div class="tiles mt">
    <div class="tile"><small>الخطوات</small><b class="num">${fmt(e.steps)}</b><div class="sub">الهدف ${fmt(set.steps)}</div><div class="bar ${stepPct >= 100 ? 'ok' : ''}"><i style="width:${stepPct}%"></i></div></div>
    <div class="tile"><small>الحرق الكلي</small><b class="num">${fmt(e.kcal)}</b><div class="sub">${e.kcal ? `الأكل ${fmt(set.kcal)} → عجز ~${fmt(e.kcal - set.kcal)}` : 'من ساعة Zepp'}</div></div>
    <div class="tile"><small>النوم</small><b class="num">${e.sleep ? `${Math.floor(e.sleep / 60)}:${pad2(e.sleep % 60)}` : '—'}</b><div class="sub">الهدف 7–8 ساعات</div></div>
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
  <button class="btn ghost block mt" id="qLog">سجّل وزن / ملاحظة النهارده</button>`;
  renderSyncLine();
  $('#tW').onclick = $('#qLog').onclick = () => dayEntrySheet(t);
  $('#cCr').onclick = () => { day(t).creatine = !day(t).creatine; save(); render(); };
  $('#cWa').onclick = () => { const d = day(t); d.water = r1(((d.water || 0) + 0.25) > set.water + 1 ? 0 : (d.water || 0) + 0.25); save(); render(); };
  $('#cMe').onclick = () => { tab = 'food'; render(); };
  const g = $('#goW'); if (g) g.onclick = () => { view.week = w; view.day = tdDay.key; startPlayer(w, tdDay.key); };
}

function dayEntrySheet(d) {
  const m = S.days[d] || {}, h = S.health[d] || {};
  openSheet(sheetHead(nice(d), 'تسجيل اليوم') + `
    <label class="field"><span>الوزن الصبح (كجم)${h.weight ? ` – الميزان قال ${h.weight}` : ''}</span><input id="fW" class="inp num" inputmode="decimal" value="${m.w ?? ''}" placeholder="${h.weight ?? '89.6'}"></label>
    ${!native || h.steps == null ? `<label class="field"><span>الخطوات (لو الساعة مش مربوطة)</span><input id="fS" class="inp num" inputmode="numeric" value="${m.steps ?? ''}"></label>` : ''}
    <label class="field"><span>ملاحظة (وجع، نوم وحش، أكل برة…)</span><textarea id="fN" class="inp">${esc(m.note || '')}</textarea></label>
    <button class="btn red block mt" id="fSave">حفظ</button>`, p => {
    $('#fSave', p).onclick = () => {
      const x = day(d); const w = parseFloat($('#fW', p).value.replace(',', '.'));
      if (!isNaN(w) && w > 30 && w < 250) x.w = w; else delete x.w;
      const sEl = $('#fS', p); if (sEl) { const s = parseInt(sEl.value); if (!isNaN(s)) x.steps = s; else delete x.steps; }
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
function endRest() { if (!P) return; const adv = P.rest && P.rest.advance; P.rest = null; if (adv) P.idx = Math.min(P.idx + 1, exList(P.dk).length - 1); S.active = P; save(); drawPlayer(); }
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
  $('#rPlus').onclick = () => { P.rest.until += 10000; P.rest.total += 10; save(); tickPlayer(); };
  $('#rSkip').onclick = endRest;
  tickPlayer();
}
function startRest(sec, advance) { P.rest = { until: Date.now() + sec * 1000, total: sec, advance }; S.active = P; save(); drawPlayer(); }
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
  <div class="section-t">الوزن – آخر 8 أسابيع</div><div class="card pad">${weightChart()}</div>
  <div class="section-t">أسبوع بأسبوع</div>
  <div class="card pad scroll-x">${rows.length ? '' : '<p class="muted small" style="margin:0 0 8px">الجدول هيبدأ مع أول أسبوع في البرنامج.</p>'}<table class="t"><thead><tr><th>الأسبوع</th><th>متوسط الوزن</th><th>الخطوات</th><th>النوم</th><th>تمارين</th></tr></thead><tbody>
  ${rows.map((r, i) => { const prev = rows[i + 1]; const ch = prev && prev.aw && r.aw ? r.aw - prev.aw : null; return `<tr><td>${r.wk < 1 ? '—' : r.wk}</td><td>${r.aw ? fmt(r.aw, 1) : '—'} ${ch != null ? `<span class="${ch <= 0 ? 'up' : 'down'} small">${ch <= 0 ? '▼' : '▲'}${fmt(Math.abs(ch), 1)}</span>` : ''}</td><td>${r.st ? fmt(r.st) : '—'}</td><td>${r.sl ? (r.sl / 60).toFixed(1) + ' س' : '—'}</td><td>${r.sessions}/4</td></tr>`; }).join('')}
  </tbody></table></div>
  <div class="section-t">القوة (أحسن مجموعة محسوبة)</div>
  <div class="card pad scroll-x">${str.length ? `<table class="t"><thead><tr><th>التمرين</th><th>أحسن مجموعة</th><th>التغيير</th></tr></thead><tbody>${str.map(s => { const ch = s.first ? (s.last - s.first) / s.first * 100 : 0; return `<tr><td>${esc(s.name)}</td><td><span class="num">${fmt(s.best.w, 2)}×${s.best.r}</span></td><td>${s.n > 1 ? `<span class="${ch >= 0 ? 'up' : 'down'}">${ch >= 0 ? '+' : ''}${fmt(ch, 0)}%</span>` : '<span class="muted small">مرة واحدة</span>'}</td></tr>`; }).join('')}</tbody></table>` : '<div class="empty">ابدأ تمرين وسجّل المجموعات.</div>'}</div>
  <div class="section-t">تحليل الميزان والمقاسات</div>
  <div class="card pad">${bodyDates.length ? `<table class="t"><thead><tr><th>التاريخ</th><th>دهون</th><th>عضل</th><th>مية</th><th>الوسط</th></tr></thead><tbody>${bodyDates.slice(0, 8).map(d => { const b = S.body[d]; return `<tr><td>${short(d)}</td><td>${b.fat ?? '—'}%</td><td>${b.muscle ?? '—'}${b.muscle ? '%' : ''}</td><td>${b.water ?? '—'}${b.water ? '%' : ''}</td><td>${b.waist ?? '—'}${b.waist ? ' سم' : ''}</td></tr>`; }).join('')}</tbody></table>` : '<p class="muted small" style="margin:0">مرة في الأسبوع: انقل أرقام OKOK (دهون، عضل، مية) ومقاس الوسط عند السرّة.</p>'}
    <button class="btn ghost block mt sm" id="addBody">${ICON.plus.replace('<svg', '<svg style="stroke:var(--ink)"')} أضف قياس</button></div>
  <button class="btn red block mt" id="report">تقرير الأسبوع للكابتن</button>`;
  $('#addBody').onclick = bodySheet;
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
      S.body[d] = rec; save(); closeSheet(); render(); toast('اتسجّل ✓');
    };
  });
}
function weeklyReport() {
  const t = today(), wk = curWeek(), set = S.settings;
  const now = avgWeight(t), prev = avgWeight(addDays(t, -7));
  const lines = [`# تقرير الأسبوع ${wk} – كوتش الجيم`, `الفترة: ${addDays(t, -6)} → ${t}`, ''];
  lines.push('## الوزن والنشاط');
  const daily = []; for (let i = 6; i >= 0; i--) { const d = addDays(t, -i); const e = eff(d); daily.push(`${short(d)}: ${e.w ?? '—'} كجم · ${e.steps ?? '—'} خطوة · حرق ${e.kcal ?? '—'} · نوم ${e.sleep ? (e.sleep / 60).toFixed(1) + 'س' : '—'}${e.creatine ? ' · كرياتين✓' : ''}`); }
  lines.push(`- متوسط الوزن: ${now ? fmt(now.avg, 2) : '—'} (الأسبوع اللي فات ${prev ? fmt(prev.avg, 2) : '—'})`);
  lines.push(`- متوسط الخطوات: ${fmt(avgOf('steps', t))} (الهدف ${set.steps}) · متوسط الحرق: ${fmt(avgOf('kcal', t))} · متوسط النوم: ${avgOf('sleep', t) ? (avgOf('sleep', t) / 60).toFixed(1) + ' ساعة' : '—'}`);
  lines.push(...daily.map(x => '  - ' + x));
  const bd = Object.keys(S.body).sort().pop(); if (bd) { const b = S.body[bd]; lines.push(`- آخر قياس (${bd}): دهون ${b.fat ?? '—'}% · عضل ${b.muscle ?? '—'}% · مية ${b.water ?? '—'}% · وسط ${b.waist ?? '—'} سم`); }
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
  const v = verdict(); lines.push('', `## رأي التطبيق: ${v.t}`, v.d.replace(/<[^>]+>/g, ''));
  lines.push('', 'يا كابتن راجع وقولي نعدّل إيه.');
  return lines.join('\n');
}

/* ================= الأكل ================= */
function mealItems(m) {
  return m.items.map(it => { const i = S.foodSwaps[it.id] || 0; const a = i ? it.alts[i - 1] : null; return a ? Object.assign({}, it, a, { swapped: true, base: it.name }) : it; });
}
function renderFood(el) {
  const t = today(), meals = (S.days[t] || {}).meals || {};
  let kc = 0, pr = 0, ek = 0, ep = 0;
  DIET.meals.forEach(m => mealItems(m).forEach(it => { kc += it.kcal; pr += it.p; if (meals[m.id]) { ek += it.kcal; ep += it.p; } }));
  el.innerHTML = `<div class="topbar"><h1>النظام الغذائي</h1><button class="iconbtn" id="dInfo" aria-label="معلومات">${ICON.info}</button></div>
  <div class="totals"><div class="tile"><small>السعرات</small><b class="num">${fmt(ek)} / ${fmt(kc)}</b><div class="bar ok"><i style="width:${Math.min(100, ek / kc * 100)}%"></i></div></div>
  <div class="tile"><small>البروتين (جم)</small><b class="num">${fmt(ep)} / ${fmt(pr)}</b><div class="bar ok"><i style="width:${Math.min(100, ep / pr * 100)}%"></i></div></div></div>
  ${DIET.meals.map(m => { const its = mealItems(m); const mk = its.reduce((a, x) => a + x.kcal, 0), mp = its.reduce((a, x) => a + x.p, 0); return `<div class="card mt">
    <div class="meal-h"><div><h3>${m.title}</h3><small>${m.time} · ${m.where} · <span class="num">${mk}</span> سعر · <span class="num">${mp}</span> جم بروتين</small></div><button class="eat ${meals[m.id] ? 'on' : ''}" data-eat="${m.id}" aria-label="أكلتها">${ICON.check}</button></div>
    ${its.map(it => `<div class="item"><span class="food-ic">${esc(it.name.trim()[0])}</span><div><b>${esc(it.name)}</b><small><span class="num">${it.g}</span> جم · <span class="num">${it.kcal}</span> سعر · <span class="num">${it.p}</span> جم بروتين</small>${it.swapped ? `<div class="swapped">بدل ${esc(it.base)}</div>` : ''}</div>${it.alts && (DIET.meals.find(x => x.id === m.id).items.find(x => x.id === it.id).alts.length) ? `<button class="sq red" data-fs="${it.id}" aria-label="بدّل">${ICON.swap}</button>` : ''}</div>`).join('')}
    <div class="note"><span class="i">i</span><span class="lbl">ملاحظة</span><span>${esc(m.note)}</span></div></div>`; }).join('')}`;
  el.querySelectorAll('[data-eat]').forEach(b => b.onclick = () => { const d = day(t); d.meals = d.meals || {}; d.meals[b.dataset.eat] = !d.meals[b.dataset.eat]; save(); render(); });
  el.querySelectorAll('[data-fs]').forEach(b => b.onclick = () => foodSwapSheet(b.dataset.fs));
  $('#dInfo').onclick = () => openSheet(sheetHead('ليه الأرقام دي؟') + `<p style="line-height:1.8">الهدف ~${DIET.kcal} سعر و~${DIET.protein} جم بروتين. حرقك المتوقع 2500–2600، فده عجز ~550–650 سعر = نزول 0.5–0.7 كجم في الأسبوع، وده المعدل اللي بيحافظ على العضل.</p><p style="line-height:1.8" class="muted">البروتين: الحد الأدنى المثبت 1.6 جم/كجم، وفي العجز الأفضل أعلى. البدايل محسوبة بسعرات قريبة – لو البديل أقل بروتين، عوّض في العشا.</p>`);
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
    ['heart', 'Health Connect (Zepp + الميزان)', hcSheet, native ? (S.settings.lastSync ? 'مربوط' : 'مش مربوط') : ''],
    ['scale', 'سجل الأوزان', weightsSheet, ''],
    ['ruler', 'القياسات وتحليل الميزان', bodySheet, ''],
    ['report', 'تقرير الأسبوع للكابتن', () => copyText(weeklyReport()), ''],
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
    <div class="grid2">${f('pTarget', 'الوزن الهدف', s.target)}${f('pKcal', 'السعرات', s.kcal, 'numeric')}${f('pProt', 'البروتين (جم)', s.protein, 'numeric')}${f('pSteps', 'الخطوات', s.steps, 'numeric')}${f('pWater', 'المية (لتر)', s.water)}${f('pWeeks', 'عدد الأسابيع', s.weeks, 'numeric')}</div>
    <button class="btn red block mt" id="pSave">حفظ</button>`, p => {
    $('#pSave', p).onclick = () => {
      const num = (id, d) => { const v = parseFloat($(id, p).value.replace(',', '.')); return isNaN(v) ? d : v; };
      Object.assign(s, { name: $('#pName', p).value.trim() || s.name, start: $('#pStart', p).value || s.start, target: num('#pTarget', s.target), kcal: num('#pKcal', s.kcal), protein: num('#pProt', s.protein), steps: num('#pSteps', s.steps), water: num('#pWater', s.water), weeks: num('#pWeeks', s.weeks) });
      save(); closeSheet(); view.week = null; render(); toast('اتحفظ ✓');
    };
  });
}
function hcSheet() {
  openSheet(sheetHead('Health Connect', 'Zepp + ميزان OKOK') + (native ? `
    <p style="line-height:1.8">التطبيق بيقرا من Health Connect: الخطوات، الحرق الكلي، النوم، النبض وقت الراحة، الوزن ونسبة الدهون. مبيكتبش حاجة.</p>
    <div class="note"><span class="i">1</span><span><b>Zepp:</b> افتح Zepp ← Profile ← 3rd-party account linking ← Health Connect وفعّل كل البيانات.</span></div>
    <div class="note mt"><span class="i">2</span><span><b>OKOK:</b> لو فيه ربط بـ Google Fit فعّله، وفي Google Fit فعّل "Sync Fit with Health Connect". لو مفيش، سجّل الوزن يدوي من الرئيسية.</span></div>
    <button class="btn red block mt" id="hc1">اربط / حدّث الأذونات</button>
    <button class="btn ghost block mt" id="hc2">افتح إعدادات Health Connect</button>
    <button class="btn ghost block mt" id="hc3">حدّث البيانات دلوقتي</button>` : '<p>الجزء ده بيشتغل في تطبيق الأندرويد بس.</p>'), p => {
    if (!native) return;
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
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (P) { tickPlayer(); keepAwake(true); }
  else if (native && S.settings.lastSync) { const m = (Date.now() - new Date(S.settings.lastSync)) / 6e4; if (m > 15) hcSync(false); }
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
