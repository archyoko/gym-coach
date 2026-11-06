/* Lifestyle – البرنامج والأكل (مبني على مراجعة نوفمبر 2026) */
'use strict';

// unit: reps | sec | min — rir: نص الهدف — rest بالثواني — fail: الفشل مسموح في آخر مجموعة
// ss: نفس الحرف = تمرينين ورا بعض (سوبر سِت) — kind: warm | main | rehab
const PROGRAM = {
  days: [
    { key: 'upperA', dow: 6, label: 'السبت', title: 'UPPER A', sub: 'صدر علوي · لاتس · كتف جانبي' },
    { key: 'lowerA', dow: 1, label: 'الاتنين', title: 'LOWER A', sub: 'فخذ أمامي وخلفي · بدون انحناء عميق' },
    { key: 'upperB', dow: 3, label: 'الأربع', title: 'UPPER B', sub: 'عرض الضهر · صدر · تأهيل الباي' },
    { key: 'lowerB', dow: 4, label: 'الخميس', title: 'LOWER B', sub: 'رجل خفيف + كتف جانبي', optional: true }
  ],
  ex: {
    upperA: [
      { id: 'er', ss: 'w', kind: 'warm', name: 'دوران خارجي كيبل', en: 'Cable External Rotation', img: 'External_Rotation_with_Cable', sets: 2, reps: [12, 15], rir: '3', rest: 45,
        note: 'إجباري قبل أي ضغط. بيقوّي العضلات الدوارة اللي بتثبّت رأس عظمة الكتف وبيقلل الانحشار.',
        cues: ['الكوع لازق في جنبك طول الحركة', 'وزن خفيف وحركة بطيئة', 'متلفّش الجسم مع الدراع'],
        alts: [{ name: 'دوران خارجي باستك', en: 'External Rotation with Band', img: 'External_Rotation_with_Band' }] },
      { id: 'ir', ss: 'w', kind: 'warm', name: 'دوران داخلي كيبل', en: 'Cable Internal Rotation', img: 'Cable_Internal_Rotation', sets: 2, reps: [12, 15], rir: '3', rest: 45,
        note: 'تكملة الإحماء – بتوازن عضلات الكتف من قدام وورا.',
        cues: ['الكوع ثابت على 90°', 'متشدّش بالجسم'],
        alts: [{ name: 'دوران داخلي باستك', en: 'Internal Rotation with Band', img: 'Internal_Rotation_with_Band' }] },
      { id: 'incDb', kind: 'main', name: 'ضغط دمبل مائل قبضة محايدة', en: 'Neutral-Grip Incline DB Press', img: 'Hammer_Grip_Incline_DB_Bench_Press', sets: 3, reps: [8, 12], rir: '2', rest: 120, inc: 2, noFail: true,
        note: 'التمرين الأساسي للصدر العلوي. القبضة المحايدة (الكفين في وش بعض) بتقلل الضغط على الكتف المنحشر. زاوية الكرسي 30° مش أكتر.',
        cues: ['الدمبل ينزل لمستوى أعلى الصدر مش الرقبة', 'الكوع حوالي 45° من الجسم مش مفتوح على الآخر', 'لا فشل – سيب عدتين'],
        alts: [{ name: 'جهاز صدر مائل', en: 'Incline Machine Press', img: 'Leverage_Incline_Chest_Press' }, { name: 'ضغط كيبل مائل', en: 'Incline Cable Press', img: 'Incline_Cable_Chest_Press' }] },
      { id: 'lowFly', kind: 'main', name: 'فلاي كيبل من تحت لفوق', en: 'Low-to-High Cable Fly', img: 'Low_Cable_Crossover', sets: 3, reps: [12, 15], rir: '0–1', rest: 90, inc: 2.5, fail: true,
        note: 'الاتجاه من تحت لفوق بيشغّل الألياف العلوية للصدر. تمرين عزل آمن، والفشل مسموح في آخر مجموعة.',
        cues: ['الإيدين يتقابلوا عند مستوى الدقن', 'كوع شبه مثني وثابت', 'متشدّش بالكتف لقدام'],
        alts: [{ name: 'فلاي كيبل مائل', en: 'Incline Cable Fly', img: 'Incline_Cable_Flye' }, { name: 'فلاي دمبل مائل', en: 'Incline DB Fly', img: 'Incline_Dumbbell_Flyes' }] },
      { id: 'pdNeutral', kind: 'main', name: 'سحب عالي قبضة محايدة', en: 'Neutral-Grip Lat Pulldown', img: 'Close-Grip_Front_Lat_Pulldown', sets: 3, reps: [8, 12], rir: '1–2', rest: 120, inc: 2.5,
        note: 'نقطة ضعفك الأولى: عرض الضهر. القبضة المحايدة أريح لوتر الباي والكتف.',
        cues: ['الصدر مرفوع واسحب للصدر', 'فكّر إنك بتنزّل الكوع لجيبك', 'متترجعش لورا بجسمك'],
        alts: [{ name: 'سحب عالي بإيد واحدة', en: 'One-Arm Lat Pulldown', img: 'One_Arm_Lat_Pulldown' }, { name: 'سحب عالي قبضة متوسطة', en: 'Lat Pulldown', img: 'Full_Range-Of-Motion_Lat_Pulldown' }] },
      { id: 'cableLat', kind: 'main', name: 'رفرفة جانبي كيبل', en: 'Cable Lateral Raise', img: 'Cable_Seated_Lateral_Raise', sets: 4, reps: [12, 20], rir: '0–1', rest: 90, inc: 1.25, fail: true,
        note: 'ده سر عرض الكتف. ارفع في مستوى اللوح (الدراع قدام الجسم سنة بسيطة) ولحد مستوى الكتف بس – ده الأمان مع الانحشار.',
        cues: ['متطلعش أعلى من الكتف', 'من غير مرجحة', 'الكوع يقود الحركة مش الكف'],
        alts: [{ name: 'رفرفة جانبي دمبل', en: 'DB Lateral Raise', img: 'Side_Lateral_Raise' }, { name: 'رفرفة جانبي مائل', en: 'Incline Lateral Raise', img: 'One-Arm_Incline_Lateral_Raise' }] },
      { id: 'pushV', kind: 'main', name: 'تراي بوش داون V', en: 'V-Bar Triceps Pushdown', img: 'Triceps_Pushdown_-_V-Bar_Attachment', sets: 3, reps: [10, 15], rir: '1', rest: 90, inc: 2.5, fail: true,
        note: 'بديل الغطس. نفس الشغل على التراي من غير ضغط على مقدمة الكتف.',
        cues: ['الكوع ثابت جنب الجسم', 'مد كامل تحت', 'الكتف لورا ومينزلش لقدام'],
        alts: [{ name: 'بوش داون بار', en: 'Straight-Bar Pushdown', img: 'Triceps_Pushdown' }, { name: 'بوش داون قبضة معكوسة', en: 'Reverse-Grip Pushdown', img: 'Reverse_Grip_Triceps_Pushdown' }] },
      { id: 'cableCrunch', kind: 'main', name: 'كرنش كيبل', en: 'Cable Crunch', img: 'Cable_Crunch', sets: 2, reps: [10, 15], rir: '1', rest: 60, inc: 2.5,
        note: 'مجموعتين كفاية. البطن هتبان بنزول الدهون مش بكتر التمارين.',
        cues: ['لف العمود الفقري مش الوسط', 'متشدّش بالإيدين', 'اطلع النفس وانت نازل'],
        alts: [{ name: 'جهاز بطن', en: 'Ab Crunch Machine', img: 'Ab_Crunch_Machine' }, { name: 'كرنش عكسي', en: 'Reverse Crunch', img: 'Reverse_Crunch' }] }
    ],
    lowerA: [
      { id: 'bike', kind: 'warm', name: 'عجلة إحماء', en: 'Stationary Bike', img: 'Bicycling_Stationary', sets: 1, reps: [8, 10], unit: 'min', rir: '—', rest: 0,
        note: 'مقاومة خفيفة. بتسخّن الركبة وبتزوّد السائل اللي بيزيّت المفصل.',
        cues: ['مقاومة خفيفة لمتوسطة', 'الكرسي عالي كفاية إن الركبة متتنيش أوي فوق'], alts: [] },
      { id: 'abd', kind: 'warm', name: 'تبعيد الحوض جهاز', en: 'Hip Abduction Machine', img: 'Thigh_Abductor', sets: 2, reps: [15, 15], rir: '3', rest: 45, inc: 5,
        note: 'تنشيط الألوية الجانبية – بتثبّت الركبة ومتخليهاش تنهار لجوه.',
        cues: ['حركة بطيئة', 'الضهر ملزوق في الكرسي'], alts: [{ name: 'مشية الباستك', en: 'Monster Walk', img: 'Monster_Walk' }] },
      { id: 'wallSit', kind: 'main', name: 'وول سيت (ثبات)', en: 'Wall Sit', img: null, sets: 3, reps: [30, 45], unit: 'sec', rir: '2', rest: 60,
        note: 'تمرين ثابت للفخذ الأمامي، ومريح جداً للركبة بعد تهذيب الغضروف. الزاوية أقل من 90° (مش لتحت أوي).',
        cues: ['الضهر لازق في الحيطة', 'الركبة فوق مشط الرجل مش قدامه', 'وقّف لو الوجع فوق 3/10'], alts: [] },
      { id: 'legPress', kind: 'main', name: 'ليج برس لحد 90°', en: 'Leg Press (to 90°)', img: 'Leg_Press', sets: 3, reps: [10, 15], rir: '2', rest: 120, inc: 5, noFail: true,
        note: 'الرجلين عالي على اللوح بعرض الكتف. انزل لحد ما الركبة تبقى 90° بس – الضغط على الغضروف بيزيد مع النزول الأعمق.',
        cues: ['متقفلش الركبة فوق', 'الوسط ميرفعش من الكرسي', 'لا فشل أبداً'],
        alts: [{ name: 'هاك سكوات جزئي', en: 'Partial Hack Squat', img: 'Hack_Squat' }, { name: 'ليج برس سميث', en: 'Smith Leg Press', img: 'Smith_Machine_Leg_Press' }] },
      { id: 'lyingCurl', kind: 'main', name: 'ليج كيرل نايم', en: 'Lying Leg Curl', img: 'Lying_Leg_Curls', sets: 3, reps: [10, 15], rir: '1', rest: 90, inc: 2.5,
        note: 'خلفية الفخذ بتحمي الركبة من ورا. اثبت ثانية فوق وارجع ببطء.',
        cues: ['الوسط لازق في الجهاز', 'نزول بطيء 2–3 ثواني'],
        alts: [{ name: 'ليج كيرل جالس', en: 'Seated Leg Curl', img: 'Seated_Leg_Curl' }, { name: 'ليج كيرل واقف', en: 'Standing Leg Curl', img: 'Standing_Leg_Curl' }] },
      { id: 'rdl', kind: 'main', name: 'رفعة رومانية', en: 'Romanian Deadlift', img: 'Romanian_Deadlift', sets: 3, reps: [8, 12], rir: '2', rest: 120, inc: 2, noFail: true,
        note: 'الركبة شبه مفرودة فآمنة للغضروف. بتقوّي خلفية الفخذ والألوية وأسفل الضهر، وبتساعد في وقفة الحوض.',
        cues: ['الضهر مستقيم طول الحركة', 'الوزن ينزل لحد نص الساق', 'ادفع الحوض لورا مش لتحت'],
        alts: [{ name: 'رفعة دمبل رجل مفرودة', en: 'Stiff-Leg DB Deadlift', img: 'Stiff-Legged_Dumbbell_Deadlift' }, { name: 'هيب ثرست', en: 'Hip Thrust', img: 'Barbell_Hip_Thrust' }] },
      { id: 'legExt', kind: 'main', name: 'ليج اكستنشن', en: 'Leg Extension', img: 'Leg_Extensions', sets: 2, reps: [12, 15], rir: '1–2', rest: 90, inc: 2.5,
        note: 'في المدى اللي مش بيوجع بس. لو فيه وجع في أول الحركة ابدأ من نص المدى.',
        cues: ['اثبت ثانية فوق', 'نزول بطيء', 'وزن متوسط مش تقيل'],
        alts: [{ name: 'ليج اكستنشن رجل واحدة', en: 'Single-Leg Extension', img: 'Single-Leg_Leg_Extension' }] },
      { id: 'calfPress', kind: 'main', name: 'سمانة على الليج برس', en: 'Leg Press Calf Raise', img: 'Calf_Press_On_The_Leg_Press_Machine', sets: 3, reps: [10, 15], rir: '0–1', rest: 60, inc: 5, fail: true,
        note: 'فشل مسموح في آخر مجموعة. اثبت ثانية تحت في أقصى إطالة.',
        cues: ['مدى كامل', 'بدون نطّ'],
        alts: [{ name: 'سمانة جالس', en: 'Seated Calf Raise', img: 'Seated_Calf_Raise' }, { name: 'جهاز سمانة', en: 'Calf Press', img: 'Calf_Press' }] }
    ],
    upperB: [
      { id: 'catCow', ss: 'w', kind: 'warm', name: 'كات كاو', en: 'Cat-Cow', img: 'Cat_Stretch', sets: 1, reps: [10, 12], rir: '—', rest: 30,
        note: 'إحماء للعمود الفقري ولوح الكتف.', cues: ['حركة بطيئة مع النفس', 'من الضهر كله مش من الحوض بس'], alts: [] },
      { id: 'facePullW', ss: 'w', kind: 'warm', name: 'فيس بول خفيف', en: 'Face Pull (warm-up)', img: 'Face_Pull', sets: 2, reps: [15, 15], rir: '3', rest: 45, inc: 2.5,
        note: 'تأهيل مباشر للانحشار: خلفية الكتف + الدوران الخارجي.',
        cues: ['اسحب لمستوى العين', 'افتح الإيدين لبرة في الآخر', 'وزن خفيف'], alts: [{ name: 'باند بول أبارت', en: 'Band Pull Apart', img: 'Band_Pull_Apart' }] },
      { id: 'pdMed', kind: 'main', name: 'سحب عالي قبضة متوسطة', en: 'Lat Pulldown', img: 'Full_Range-Of-Motion_Lat_Pulldown', sets: 3, reps: [8, 12], rir: '1–2', rest: 120, inc: 2.5,
        note: 'بعرض الكتف زي ما بتعمل. التكرار التاني للاتس في الأسبوع.',
        cues: ['اسحب للصدر', 'لوح الكتف ينزل الأول', 'من غير مرجحة'],
        alts: [{ name: 'سحب عالي قبضة محايدة', en: 'Neutral-Grip Pulldown', img: 'Close-Grip_Front_Lat_Pulldown' }, { name: 'سحب عالي بإيد واحدة', en: 'One-Arm Pulldown', img: 'One_Arm_Lat_Pulldown' }] },
      { id: 'incMachine', kind: 'main', name: 'جهاز صدر مائل', en: 'Incline Machine Press', img: 'Leverage_Incline_Chest_Press', sets: 3, reps: [8, 12], rir: '2', rest: 120, inc: 2.5, noFail: true,
        note: 'التكرار التاني للصدر العلوي. الجهاز أثبت للكتف من الدمبل.',
        cues: ['الكرسي يخلّي المقابض عند أعلى الصدر', 'الكتف لورا ولتحت', 'لا فشل'],
        alts: [{ name: 'ضغط دمبل مائل محايد', en: 'Neutral-Grip Incline DB', img: 'Hammer_Grip_Incline_DB_Bench_Press' }, { name: 'جهاز صدر', en: 'Machine Chest Press', img: 'Machine_Bench_Press' }] },
      { id: 'pullover', kind: 'main', name: 'بول أوفر كيبل بالحبل', en: 'Cable Rope Pullover', img: 'Rope_Straight-Arm_Pulldown', sets: 3, reps: [12, 15], rir: '1', rest: 90, inc: 2.5,
        note: 'عزل للاتس من غير باي. إحساس الشد يبقى تحت الإبط.',
        cues: ['الكوع شبه مفرود وثابت', 'ميل بسيط لقدام', 'متطلعش أعلى من مستوى الراس'],
        alts: [{ name: 'سحب بدراع مفرود بار', en: 'Straight-Arm Pulldown', img: 'Straight-Arm_Pulldown' }, { name: 'بول أوفر دمبل', en: 'DB Pullover', img: 'Straight-Arm_Dumbbell_Pullover' }] },
      { id: 'row', kind: 'main', name: 'سحب أرضي قبضة محايدة', en: 'Seated Cable Row', img: 'Seated_Cable_Rows', sets: 3, reps: [10, 12], rir: '1–2', rest: 120, inc: 2.5,
        note: 'سُمك الضهر وصحة لوح الكتف. القبضة المحايدة أريح لوتر الباي.',
        cues: ['اسحب لوح الكتف قبل الدراع', 'الضهر مستقيم في الآخر', 'الكوع جنب الجسم'],
        alts: [{ name: 'جهاز سحب أفقي', en: 'Machine Row', img: 'Leverage_Iso_Row' }, { name: 'تي بار مسنود', en: 'Chest-Supported T-Bar', img: 'Lying_T-Bar_Row' }] },
      { id: 'seatLat', kind: 'main', name: 'رفرفة جانبي دمبل جالس', en: 'Seated DB Lateral Raise', img: 'Seated_Side_Lateral_Raise', sets: 4, reps: [12, 15], rir: '0–1', rest: 90, inc: 1, fail: true,
        note: 'الجلوس بيمنع المرجحة. لحد مستوى الكتف بس.',
        cues: ['متطلعش أعلى من الكتف', 'الكوع شبه مثني', 'نزول بطيء'],
        alts: [{ name: 'رفرفة جانبي كيبل', en: 'Cable Lateral Raise', img: 'Cable_Seated_Lateral_Raise' }, { name: 'رفرفة جانبي مائل', en: 'Incline Lateral Raise', img: 'One-Arm_Incline_Lateral_Raise' }] },
      { id: 'ropeHammer', kind: 'rehab', name: 'هامر كيبل بالحبل (تأهيل)', en: 'Rope Hammer Curl', img: 'Cable_Hammer_Curls_-_Rope_Attachment', sets: 2, reps: [12, 15], rir: '3', rest: 90, inc: 1.25, noFail: true, pain: true,
        note: 'علاج وتر الباي عند الكوع: حمل خفيف ومتدرّج. الوجع وقت التمرين وبعده لازم يفضل 3/10 أو أقل، ومن غير ما يزيد الصبح. البريتشر والكيرل المائل هيرجعوا لما الوجع مع الشيل يختفي 2–3 أسابيع.',
        cues: ['طلوع ثانيتين ونزول 3 ثواني', 'الكوع ثابت', 'لو الوجع فوق 3/10 وقّف واعمل ثبات 30 ث بس'],
        alts: [{ name: 'هامر دمبل', en: 'DB Hammer Curl', img: 'Hammer_Curls' }, { name: 'هامر عرضي', en: 'Cross-Body Hammer Curl', img: 'Cross_Body_Hammer_Curl' }] },
      { id: 'ropePush', kind: 'main', name: 'تراي حبل', en: 'Rope Pushdown', img: 'Triceps_Pushdown_-_Rope_Attachment', sets: 2, reps: [12, 15], rir: '0–1', rest: 90, inc: 2.5, fail: true,
        note: 'فشل مسموح في آخر مجموعة.',
        cues: ['افتح الحبل تحت', 'الكوع ثابت', 'مد كامل'],
        alts: [{ name: 'بوش داون V', en: 'V-Bar Pushdown', img: 'Triceps_Pushdown_-_V-Bar_Attachment' }, { name: 'بوش داون مائل', en: 'Incline Pushdown', img: 'Cable_Incline_Pushdown' }] }
    ],
    lowerB: [
      { id: 'bike2', kind: 'warm', name: 'عجلة إحماء', en: 'Stationary Bike', img: 'Bicycling_Stationary', sets: 1, reps: [8, 10], unit: 'min', rir: '—', rest: 0,
        note: 'مقاومة خفيفة قبل أي تمرين رجل.', cues: ['مقاومة خفيفة'], alts: [] },
      { id: 'ninety', kind: 'warm', name: 'إطالة 90/90', en: '90/90 Stretch', img: '90_90_Hamstring', sets: 2, reps: [30, 30], unit: 'sec', rir: '—', rest: 20,
        note: 'حركة لمفصل الحوض وخلفية الفخذ.', cues: ['نفس عميق', 'من غير ألم'], alts: [] },
      { id: 'legPress2', kind: 'main', name: 'ليج برس', en: 'Leg Press', img: 'Leg_Press', sets: 3, reps: [12, 15], rir: '2', rest: 120, inc: 5, noFail: true,
        note: 'عدات أعلى ووزن أخف من الاتنين. نفس حد الـ 90°.',
        cues: ['الرجلين بعرض الكتف', 'متقفلش الركبة', 'لا فشل'],
        alts: [{ name: 'هاك سكوات جزئي', en: 'Partial Hack Squat', img: 'Hack_Squat' }, { name: 'ليج برس سميث', en: 'Smith Leg Press', img: 'Smith_Machine_Leg_Press' }] },
      { id: 'seatCurl', kind: 'main', name: 'ليج كيرل جالس', en: 'Seated Leg Curl', img: 'Seated_Leg_Curl', sets: 3, reps: [10, 15], rir: '1', rest: 90, inc: 2.5,
        note: 'الجالس بيشغّل خلفية الفخذ وهي مشدودة، وده أحسن للتضخم.',
        cues: ['الفخذ مثبّت تحت الوسادة', 'نزول بطيء'],
        alts: [{ name: 'ليج كيرل نايم', en: 'Lying Leg Curl', img: 'Lying_Leg_Curls' }] },
      { id: 'abd2', kind: 'main', name: 'تبعيد الحوض جهاز', en: 'Hip Abduction', img: 'Thigh_Abductor', sets: 3, reps: [12, 20], rir: '1', rest: 60, inc: 5, fail: true,
        note: 'الألوية الجانبية بتثبّت الركبة والحوض.', cues: ['اثبت ثانية برة', 'ميل بسيط لقدام'], alts: [{ name: 'مشية الباستك', en: 'Monster Walk', img: 'Monster_Walk' }] },
      { id: 'legExt2', kind: 'main', name: 'ليج اكستنشن', en: 'Leg Extension', img: 'Leg_Extensions', sets: 2, reps: [12, 15], rir: '1–2', rest: 90, inc: 2.5,
        note: 'في المدى المريح بس.', cues: ['اثبت ثانية فوق', 'نزول بطيء'], alts: [{ name: 'رجل واحدة', en: 'Single-Leg Extension', img: 'Single-Leg_Leg_Extension' }] },
      { id: 'seatCalf', kind: 'main', name: 'سمانة جالس', en: 'Seated Calf Raise', img: 'Seated_Calf_Raise', sets: 3, reps: [12, 15], rir: '0–1', rest: 60, inc: 5, fail: true,
        note: 'فشل مسموح. اثبت تحت ثانية.', cues: ['مدى كامل', 'بدون نطّ'], alts: [{ name: 'سمانة على الليج برس', en: 'Leg Press Calf Raise', img: 'Calf_Press_On_The_Leg_Press_Machine' }] },
      { id: 'cableLat2', kind: 'main', name: 'رفرفة جانبي كيبل', en: 'Cable Lateral Raise', img: 'Cable_Seated_Lateral_Raise', sets: 3, reps: [15, 20], rir: '0–1', rest: 90, inc: 1.25, fail: true,
        note: 'التكرار التالت للكتف الجانبي في الأسبوع (11 مجموعة إجمالي).', cues: ['لحد مستوى الكتف', 'من غير مرجحة'],
        alts: [{ name: 'رفرفة جانبي دمبل', en: 'DB Lateral Raise', img: 'Side_Lateral_Raise' }] },
      { id: 'facePull', kind: 'main', name: 'فيس بول', en: 'Face Pull', img: 'Face_Pull', sets: 2, reps: [15, 20], rir: '1', rest: 60, inc: 2.5,
        note: 'بيعدّل ميلة الكتف لقدام وبيحمي من الانحشار.', cues: ['لمستوى العين', 'افتح لبرة في الآخر'],
        alts: [{ name: 'رفرفة خلفي كيبل', en: 'Cable Rear Delt Fly', img: 'Cable_Rear_Delt_Fly' }] }
    ]
  }
};

const DIET = {
  kcal: 1910, protein: 168,
  meals: [
    { id: 'm1', time: '9:00 ص', title: 'الفطار', where: 'في الشغل', note: 'جهّزها في علبة من الليل – صفر طبخ.',
      items: [
        { id: 'toast', name: 'توست بني', g: 60, kcal: 160, p: 7, alts: [{ name: 'رقاق 3 قطع', g: 45, kcal: 150, p: 4 }, { name: 'توست شوفان', g: 60, kcal: 150, p: 7 }, { name: 'شوفان باللبن', g: 40, kcal: 150, p: 6 }] },
        { id: 'egg', name: 'أومليت (بيضتين)', g: 100, kcal: 148, p: 13, alts: [{ name: 'تونة مصفاة + بيضة مسلوقة', g: 150, kcal: 188, p: 30 }, { name: '3 بياض + قريش لايت 100', g: 200, kcal: 150, p: 22 }, { name: 'فول بالزيت', g: 150, kcal: 160, p: 9 }] },
        { id: 'turkey', name: 'تركي مدخن', g: 50, kcal: 53, p: 9, alts: [{ name: 'لانشون فراخ لايت', g: 50, kcal: 60, p: 8 }] },
        { id: 'cottage', name: 'جبنة قريش لايت', g: 150, kcal: 130, p: 18, alts: [{ name: 'جبنة كريمي لايت', g: 60, kcal: 126, p: 5 }, { name: 'جبنة شيدر لايت', g: 40, kcal: 130, p: 10 }, { name: 'بيضتين مسلوقتين', g: 100, kcal: 143, p: 12 }] },
        { id: 'oil1', name: 'زيت زيتون', g: 5, kcal: 44, p: 0, alts: [] },
        { id: 'veg', name: 'خيار + خس', g: 150, kcal: 23, p: 1, alts: [{ name: 'طماطم + فلفل', g: 150, kcal: 30, p: 1 }] }
      ] },
    { id: 'm2', time: '4:00 م', title: 'وجبة الشغل', where: 'في الشغل', note: 'البطاطا متشوية من الليل. اعجن الكل في العلبة. ده وقود التمرين.',
      items: [
        { id: 'sweet', name: 'بطاطا حلوة مشوية', g: 200, kcal: 180, p: 4, alts: [{ name: 'موز', g: 200, kcal: 178, p: 2 }, { name: 'توست بني', g: 70, kcal: 186, p: 8 }, { name: 'شوفان', g: 50, kcal: 190, p: 7 }] },
        { id: 'greek', name: 'زبادي يوناني لايت', g: 150, kcal: 90, p: 15, alts: [{ name: 'لبن كامل الدسم', g: 150, kcal: 92, p: 5 }, { name: 'لبن خالي الدسم', g: 250, kcal: 88, p: 9 }] },
        { id: 'choc', name: 'شيكولاتة دارك 70%', g: 20, kcal: 118, p: 2, alts: [{ name: 'عين جمل', g: 18, kcal: 118, p: 3 }, { name: 'لوز', g: 20, kcal: 116, p: 4 }, { name: 'تمر', g: 40, kcal: 112, p: 1 }] },
        { id: 'coffee', name: 'قهوة سادة', g: 0, kcal: 0, p: 0, alts: [] }
      ] },
    { id: 'm3', time: '9:30 م', title: 'العشا', where: 'في البيت', note: 'أكبر وجبة. الـ 100 جم بروتين في وجبة واحدة الجسم بيستفيد بيهم عادي.',
      items: [
        { id: 'rice', name: 'رز أبيض مسلوق', g: 200, kcal: 260, p: 5, alts: [{ name: 'مكرونة (وزن ناشف)', g: 72, kcal: 256, p: 9 }, { name: 'بطاطس مسلوقة', g: 300, kcal: 231, p: 6 }, { name: 'عيش بلدي', g: 100, kcal: 250, p: 9 }] },
        { id: 'chicken', name: 'صدر فراخ مطبوخ', g: 280, kcal: 485, p: 86, alts: [{ name: 'بلطي/قاروص مشوي + 30 جم رز زيادة', g: 400, kcal: 480, p: 84 }, { name: 'لحمة مفرومة قليلة الدهن', g: 220, kcal: 473, p: 60 }, { name: '3 علب تونة مصفاة + بيضتين', g: 450, kcal: 500, p: 90 }] },
        { id: 'oil3', name: 'زيت زيتون', g: 10, kcal: 88, p: 0, alts: [] },
        { id: 'salad', name: 'سلطة خضرا', g: 200, kcal: 50, p: 2, alts: [] },
        { id: 'soup', name: 'شوربة', g: 200, kcal: 20, p: 1, alts: [] },
        { id: 'greek2', name: 'زبادي يوناني لايت', g: 100, kcal: 60, p: 10, alts: [{ name: 'جبنة قريش لايت', g: 100, kcal: 85, p: 12 }] }
      ] }
  ]
};

const RULES = [
  { t: 'الـ RIR', d: 'عزل وأجهزة: 0–1. تمارين فيها خطر على المفصل (ضغط، ليج برس، رومانية): 2. الباي وهو ملتهب: 3.' },
  { t: 'الوجع', d: 'أي وجع فوق 3/10 = وقّف التمرين وبدّله. لو الوجع اتأخر للصبح وزاد، خفّف المرة الجاية.' },
  { t: 'التقدّم', d: 'لما كل المجموعات توصل لأعلى العدات بالـ RIR المكتوب → زوّد أصغر وزن متاح.' },
  { t: 'التخفيف', d: 'مش أسبوع ثابت. خفّف (نص المجموعات، RIR 3) لو الأداء نزل حصتين ورا بعض، أو المفاصل اتهيّجت، أو أسبوع امتحانات.' },
  { t: 'أسبوع مزنوق', d: 'شيل يوم الخميس (Lower B) وكمّل بـ 3 أيام.' },
  { t: 'الوزن', d: 'اتوزن كل يوم الصبح بعد الحمام. القرار على متوسط 7 أيام: 0.4–0.7 كجم/أسبوع تمام – وقف أسبوعين قلّل 150 سعر – أسرع من 0.9 زوّد رز.' },
  { t: 'الخطوات', d: '8000 خطوة كل يوم، حتى في أيام المكتب.' },
  { t: 'ثوابت', d: 'كرياتين 5 جم يومياً – مية 3–3.5 لتر – نوم 7–8 ساعات.' }
];

const SOURCES = [
  ['Robinson 2024 – القرب من الفشل', 'https://sciencedaily.com/releases/2024/07/240731140409.htm'],
  ['Pelland 2024 – الحجم والتكرار', 'https://sportrxiv.org/index.php/server/preprint/view/460'],
  ['Singer 2024 – الراحة بين المجموعات', 'https://doaj.org/article/18363f4031e0487793db2084bee23f38'],
  ['Coleman 2024 – أسبوع الراحة', 'https://peerj.com/articles/16777/'],
  ['Clifford 2020 – التمارين الثابتة للأوتار', 'https://eprints.gla.ac.uk/219726'],
  ['دلفي – وتر البايسبس', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9159730/'],
  ['Morton 2018 – البروتين', 'https://nutrition-evidence.com/article/280995/a-systematic-review-meta-analysis-and-meta-regression-of-the-effect-of-protein-supplementation-on-resistance-training-induced-gains-in-muscle-mass-and-strength-in-healthy-adults'],
  ['Helms 2014 – البروتين في العجز', 'https://lida.sport-iat.de/ta/Record/4031779?lng=en'],
  ['Garthe – سرعة النزول', 'https://lida.sport-iat.de/ta/Record/4017680']
];

// بيانات قديمة من التطبيق الأول (أسبوع 1 من البرنامج القديم)
const SEED = {
  settings: { name: 'محمد', start: '2026-11-07', startWeight: 89.6, target: 80, kcal: 1910, protein: 168, steps: 8000, water: 3.5, weeks: 12, height: 170, age: 34, momStart: '2026-11-06', lectureDays: [0, 2], riceAdj: 0, notif: true },
  days: {
    '2026-10-23': { w: 89, steps: 1500 },
    '2026-10-31': { w: 88.65 },
    '2026-11-06': { w: 89.6 }
  },
  logs: {
    'old-upper': { date: '2026-10-29', legacy: true, ex: {
      er: [{ w: 5, r: 20, rir: 3 }, { w: 5, r: 20, rir: 2 }],
      incDb: [{ w: 30, r: 10, rir: 1 }, { w: 30, r: 8, rir: 1 }, { w: 30, r: 7, rir: 0 }],
      pdNeutral: [{ w: 65, r: 8, rir: 1 }, { w: 65, r: 8, rir: 1 }, { w: 65, r: 7, rir: 1 }],
      seatLat: [{ w: 10, r: 15, rir: 1 }, { w: 10, r: 15, rir: 2 }, { w: 5, r: 15, rir: 2 }],
      ropePush: [{ w: 65, r: 15, rir: 2 }, { w: 65, r: 11, rir: 2 }, { w: 65, r: 11, rir: 2 }]
    } }
  }
};

/* أيام خاصة */
const SPECIAL = {
  lectureDays: [0, 2], // الأحد والتلات – محاضرات MBA من 6 لـ 10
  lecture: {
    title: 'العشا – يوم المحاضرة', time: 'بعد 10 م أو في البريك', where: 'برة',
    note: 'المحاضرة من 6 لـ 10. لو جبت العلبة من البيت يبقى أحسن حاجة. لو هتاكل برة اختار الطبق الذكي.',
    options: [
      { id: 'box', name: 'علبة العشا من البيت', desc: 'فراخ 280 + رز 200 + سلطة – نفس عشا كل يوم', kcal: 963, p: 104 },
      { id: 'smart', name: 'الطبق الذكي برة', desc: 'نص فرخة (من غير جلد) · نص طبق رز · 2 كباب · سلطة وبنجر · ملعقة طحينة · من غير طرب', kcal: 1150, p: 95 },
      { id: 'full', name: 'الطبق الكامل', desc: 'نص فرخة من غير جلد · رز ربع كيلو · طرب · 2 كباب · طحينة وحمص', kcal: 1850, p: 120 },
      { id: 'syrian', name: 'نص فرخة سوري + رز أصفر', desc: 'نص فرخة مشوية من غير جلد · طبق رز أصفر · ملعقة توم واحدة', kcal: 900, p: 70 },
      { id: 'syrianFull', name: 'سوري + توم براحتي', desc: 'نفس الطبق بس التوم 3 معالق أو أكتر + عيش', kcal: 1250, p: 72 }
    ]
  },
  mom: {
    title: 'عند ماما', time: 'الغدا', where: 'جمعة ماما', extra: 700,
    note: 'ابدأ بالبروتين وبعده السلطة · طبق واحد مليان من غير طبق تاني · حتة حلو واحدة · متصومش بكرة عشان تعوّض.',
    options: [
      { id: 'light', name: 'أكلت معقول', desc: 'طبق واحد والبروتين الأول', kcal: 1400, p: 75 },
      { id: 'normal', name: 'أكلت كويس', desc: 'طبق مليان + حلو', kcal: 1800, p: 80 },
      { id: 'big', name: 'أكلت كتير 😅', desc: 'طبقين + حلو', kcal: 2500, p: 90 }
    ]
  }
};

/* أكل زيادة – بالتقريب لحصة مصرية عادية */
const EXTRAS = [
  { cat: 'حلويات', items: [['حتة كنافة', 350], ['حتة بسبوسة', 300], ['حتة جاتوه / تورتة', 350], ['حتة كيكة', 200], ['بولة آيس كريم', 140], ['شيكولاتة صغيرة (كيت كات/مارس)', 230], ['كوباية رز بلبن', 250], ['طبق أم علي صغير', 450], ['2 قطايف', 300], ['كحكة / بسكويتة', 120]] },
  { cat: 'مشروبات', items: [['شاي أو قهوة بمعلقتين سكر', 40], ['كانز بيبسي / كولا', 140], ['كوباية عصير فريش', 150], ['كوباية قصب', 180], ['نسكافيه 3 في 1', 70], ['كوباية سحلب', 250], ['لبن بالشوكولاتة', 200]] },
  { cat: 'سناكس وفاكهة', items: [['كيس شيبسي صغير', 150], ['كيس شيبسي كبير', 300], ['حفنة مكسرات', 180], ['كيس فشار', 150], ['باكو بسكويت / ويفر', 120], ['موزة', 100], ['تفاحة', 80], ['برتقالة', 60], ['3 تمرات', 70]] },
  { cat: 'أكل برة', items: [['ساندوتش فول', 300], ['ساندوتش طعمية', 300], ['ساندوتش شاورما فراخ', 450], ['ساندوتش كبدة', 400], ['برجر', 550], ['حتة بيتزا', 250], ['طبق كشري صغير', 700], ['طبق بطاطس محمرة', 350], ['ربع فطيرة مشلتت', 450], ['رغيف عيش بلدي', 250], ['طبق رز زيادة', 260], ['حتة مكرونة بشاميل', 450], ['5 صوابع محشي', 250]] }
];

/* أسماء تمارين The Gain Universe → تمارين البرنامج (lk). اللي مش موجود بيتحفظ في سجل لوحده */
const GAIN_MAP = {
  'cable shoulder external rotation': 'er', 'internal rotation': 'ir',
  'incline dumbbell press': 'incDb',
  'cable lateral raise': 'cableLat', 'seated db lateral raises': 'seatLat',
  'triceps push down v.grip': 'pushV', 'cable rope tricep push down': 'ropePush',
  'cable crunch': 'cableCrunch',
  'cat cow': 'catCow', 'cable face pull': 'facePull',
  'single arm lat pulldown chest-supported': 'pdNeutral@1', 'sa cable iliac pulldown': 'pdNeutral@1',
  't-bar row machine': 'row@2', 'cable pullover benched': 'pullover',
  'leg press': 'legPress', 'leg extension': 'legExt', 'leg curl': 'lyingCurl',
  'calf press machine': 'calfPress', 'standing hip abduction': 'abd'
};
