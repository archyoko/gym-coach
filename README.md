# كوتش الجيم

تطبيق أندرويد شخصي لمتابعة برنامج التمرين والأكل، بيقرا الخطوات والحرق والنوم والوزن من Health Connect (Zepp + ميزان OKOK عن طريق Google Fit).

## التنزيل
آخر نسخة دايماً هنا: [gym-coach.apk](https://github.com/archyoko/gym-coach/releases/download/latest/gym-coach.apk)

كل تعديل بيتعمل push على `main` بيبني نسخة جديدة أوتوماتيك من GitHub Actions، والنسخة الجديدة بتتسطّب فوق القديمة من غير ما البيانات تضيع.

## المحتوى
- `www/` – التطبيق نفسه (HTML/CSS/JS)
- `www/js/data.js` – البرنامج التدريبي والأكل والقواعد
- `www/media/` – صور التمارين من [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (ملكية عامة)
- `android/` – مشروع Capacitor للأندرويد
