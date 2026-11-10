// Translations for dashboard text that is built at runtime, such as
// `${count} tools`, `Connected as ${name}` or date-fns' "about 2 hours ago".
// The exact-match dictionaries can never hold these, because each one
// renders as a single text node with the value already baked in.
//
// Pattern keys use placeholders:
//   {n} a number ("12", "1,204")
//   {d} a date-fns distance ("5 minutes", "about 2 hours"), itself translated
//   {x} any text; translated through the dictionaries when it has an entry
// Translations refer to the captures in order as {0}, {1}, …  Russian can
// pick a plural form with {0:one|few|many}, keyed on capture 0's number.

type Lang = "uz" | "ru"
type LookupFn = (value: string) => string | undefined

type PatternSpec = [pattern: string, uz: string, ru: string]

const PATTERNS: PatternSpec[] = [
  // Relative time (date-fns formatDistance / formatDistanceToNow).
  ["{d} ago", "{0} oldin", "{0} назад"],
  ["in {d}", "{0}dan keyin", "через {0}"],
  ["Active {d} ago", "{0} oldin faol bo'lgan", "Был активен {0} назад"],
  [
    "Left details {d} ago",
    "Ma'lumotlarini {0} oldin qoldirgan",
    "Оставил данные {0} назад",
  ],
  ["Updated {d} ago", "{0} oldin yangilangan", "Обновлено {0} назад"],
  [
    "· Stops working in {d}",
    "· {0}dan keyin ishlamay qoladi",
    "· Перестанет работать через {0}",
  ],
  [
    "Last delivery failed {d} ago",
    "Oxirgi yetkazish {0} oldin muvaffaqiyatsiz bo'ldi",
    "Последняя доставка не удалась {0} назад",
  ],
  ["Delivered {d} ago", "{0} oldin yetkazildi", "Доставлено {0} назад"],
  ["{n} min ago", "{0} daqiqa oldin", "{0} {0:минуту|минуты|минут} назад"],
  ["{n} hr ago", "{0} soat oldin", "{0} {0:час|часа|часов} назад"],
  ["{n} days ago", "{0} kun oldin", "{0} {0:день|дня|дней} назад"],
  ["{n} min", "{0} daqiqa", "{0} мин"],
  ["Last {n} days", "So'nggi {0} kun", "Последние {0} {0:день|дня|дней}"],

  // Counts.
  ["{n} tool", "{0} ta vosita", "{0} {0:инструмент|инструмента|инструментов}"],
  ["{n} tools", "{0} ta vosita", "{0} {0:инструмент|инструмента|инструментов}"],
  ["{n} suggestion", "{0} ta taklif", "{0} {0:подсказка|подсказки|подсказок}"],
  ["{n} suggestions", "{0} ta taklif", "{0} {0:подсказка|подсказки|подсказок}"],
  ["{n} topic", "{0} ta mavzu", "{0} {0:тема|темы|тем}"],
  ["{n} topics", "{0} ta mavzu", "{0} {0:тема|темы|тем}"],
  ["{n} website", "{0} ta sayt", "{0} {0:сайт|сайта|сайтов}"],
  ["{n} websites", "{0} ta sayt", "{0} {0:сайт|сайта|сайтов}"],
  ["{n} IP rule", "{0} ta IP qoida", "{0} {0:IP-правило|IP-правила|IP-правил}"],
  [
    "{n} IP rules",
    "{0} ta IP qoida",
    "{0} {0:IP-правило|IP-правила|IP-правил}",
  ],
  [
    "· {n} calls today",
    "· bugun {0} ta chaqiruv",
    "· {0} {0:вызов|вызова|вызовов} сегодня",
  ],
  ["{n} blocks", "{0} ta blok", "{0} {0:блок|блока|блоков}"],
  ["{n} actions", "{0} ta harakat", "{0} {0:действие|действия|действий}"],
  ["{n} more", "yana {0} ta", "ещё {0}"],
  ["{n} card", "{0} ta karta", "{0} {0:карточка|карточки|карточек}"],
  ["{n} cards", "{0} ta karta", "{0} {0:карточка|карточки|карточек}"],
  ["{n} card(s)", "{0} ta karta", "{0} {0:карточка|карточки|карточек}"],
  [
    "{n} of {n} steps complete",
    "{1} qadamdan {0} tasi bajarildi",
    "Выполнено {0} из {1} шагов",
  ],
  [
    "{n} of 2 keys saved",
    "2 ta kalitdan {0} tasi saqlandi",
    "Сохранено {0} из 2 ключей",
  ],
  ["Step {n} of {n}", "{1} qadamdan {0}-qadam", "Шаг {0} из {1}"],
  [
    "From {n} apps",
    "{0} ta ilovadan",
    "Из {0} {0:приложения|приложений|приложений}",
  ],
  ["(1 of {n} variants)", "({0} variantdan 1 tasi)", "(1 из {0} вариантов)"],
  [
    "Plan limit reached ({n} agents)",
    "Tarif cheklovi tugadi ({0} ta agent)",
    "Достигнут лимит тарифа ({0} {0:агент|агента|агентов})",
  ],
  [
    "{n} of {n} steps done. A tool that isn't finished fails quietly in the middle of a conversation.",
    "{1} qadamdan {0} tasi bajarildi. Tugallanmagan vosita suhbat o'rtasida jimgina ishlamay qoladi.",
    "Выполнено {0} из {1} шагов. Незавершённый инструмент тихо ломается посреди диалога.",
  ],
  [
    "{n} topic in the library. Each topic holds one or more formatted articles.",
    "Kutubxonada {0} ta mavzu bor. Har bir mavzuda bir yoki bir nechta formatlangan maqola bor.",
    "В библиотеке {0} {0:тема|темы|тем}. В каждой теме одна или несколько оформленных статей.",
  ],
  [
    "{n} topics in the library. Each topic holds one or more formatted articles.",
    "Kutubxonada {0} ta mavzu bor. Har bir mavzuda bir yoki bir nechta formatlangan maqola bor.",
    "В библиотеке {0} {0:тема|темы|тем}. В каждой теме одна или несколько оформленных статей.",
  ],
  [
    "{n} card, shown side by side. Every button gets its own path.",
    "{0} ta karta, yonma-yon ko'rsatiladi. Har bir tugmaning o'z yo'li bor.",
    "{0} {0:карточка|карточки|карточек} рядом друг с другом. У каждой кнопки свой путь.",
  ],
  [
    "{n} cards, shown side by side. Every button gets its own path.",
    "{0} ta karta, yonma-yon ko'rsatiladi. Har bir tugmaning o'z yo'li bor.",
    "{0} {0:карточка|карточки|карточек} рядом друг с другом. У каждой кнопки свой путь.",
  ],
  [
    "{n} member can open this workflow.",
    "Bu workflowni {0} ta a'zo ocha oladi.",
    "Этот workflow могут открыть {0} {0:участник|участника|участников}.",
  ],
  [
    "{n} members can open this workflow.",
    "Bu workflowni {0} ta a'zo ocha oladi.",
    "Этот workflow могут открыть {0} {0:участник|участника|участников}.",
  ],
  [
    "{n} branches, so nothing can stack under it.",
    "{0} ta tarmoqqa bo'linadi, shuning uchun uning ostiga hech narsa qo'yib bo'lmaydi.",
    "Ветвится на {0}, поэтому под ним ничего нельзя поставить.",
  ],
  [
    "{x} branches, so nothing can stack under it.",
    "{0} tarmoqlanadi, shuning uchun uning ostiga hech narsa qo'yib bo'lmaydi.",
    "{0} ветвится, поэтому под ним ничего нельзя поставить.",
  ],

  // Knowledge base, analytics, leads, customer memory.
  [
    "Saved. {n} documents added to your knowledge base.",
    "Saqlandi. Bilim bazangizga {0} ta hujjat qo'shildi.",
    "Сохранено. В базу знаний добавлено документов: {0}.",
  ],
  [
    '"{x}" has been removed from your knowledge base.',
    '"{0}" bilim bazangizdan olib tashlandi.',
    "«{0}» удалён из базы знаний.",
  ],
  [
    "Cleared {n} cached AI answers.",
    "{0} ta saqlangan AI javobi tozalandi.",
    "Очищено сохранённых AI-ответов: {0}.",
  ],
  [
    "Exported analytics with {n} insights",
    "{0} ta tahlil bilan analitika eksport qilindi",
    "Аналитика экспортирована, записей: {0}",
  ],
  [
    "Exported {n} customer memories",
    "{0} ta mijoz xotirasi eksport qilindi",
    "Экспортировано записей памяти о клиентах: {0}",
  ],
  [
    "Exported {n} leads",
    "{0} ta lid eksport qilindi",
    "Экспортировано лидов: {0}",
  ],
  [
    "Busiest week {x} with {n}",
    "Eng band hafta — {0}, {1} ta",
    "Самая загруженная неделя — {0}, {1}",
  ],
  [
    "Conversations per day, {n} in total. Use the arrow keys to read each day.",
    "Kunlik suhbatlar, jami {0} ta. Har bir kunni o'qish uchun strelka tugmalaridan foydalaning.",
    "Диалоги по дням, всего {0}. Используйте стрелки, чтобы прочитать каждый день.",
  ],
  [
    "Conversations per week, {n} in total. Use the arrow keys to read each week.",
    "Haftalik suhbatlar, jami {0} ta. Har bir haftani o'qish uchun strelka tugmalaridan foydalaning.",
    "Диалоги по неделям, всего {0}. Используйте стрелки, чтобы прочитать каждую неделю.",
  ],
  [
    "{n} pts",
    "{0} punkt",
    "{0} п.п.",
  ],
  [
    "{x} in the {n} days before",
    "Oldingi {1} kunda: {0}",
    "За предыдущие {1} дн.: {0}",
  ],
  [
    "{n}% the week before",
    "Oldingi haftada: {0}%",
    "Неделей ранее: {0}%",
  ],
  [
    "{n} the week before",
    "Oldingi haftada: {0}",
    "Неделей ранее: {0}",
  ],
  [
    "Needs you, {n} new",
    "Sizni kutmoqda, {0} ta yangi",
    "Требует внимания, новых: {0}",
  ],
  [
    "{n} conversation has new messages",
    "{0} ta suhbatda yangi xabarlar bor",
    "Новые сообщения в {0} {0:диалоге|диалогах|диалогах}",
  ],
  [
    "{n} conversations have new messages",
    "{0} ta suhbatda yangi xabarlar bor",
    "Новые сообщения в {0} {0:диалоге|диалогах|диалогах}",
  ],
  [
    "{n} new voice call",
    "{0} ta yangi ovozli qo'ng'iroq",
    "{0} {0:новый голосовой звонок|новых голосовых звонка|новых голосовых звонков}",
  ],
  [
    "{n} new voice calls",
    "{0} ta yangi ovozli qo'ng'iroq",
    "{0} {0:новый голосовой звонок|новых голосовых звонка|новых голосовых звонков}",
  ],
  [
    "{n} question needs an answer",
    "{0} ta savolga javob kerak",
    "{0} {0:вопрос ждёт|вопроса ждут|вопросов ждут} ответа",
  ],
  [
    "{n} questions need an answer",
    "{0} ta savolga javob kerak",
    "{0} {0:вопрос ждёт|вопроса ждут|вопросов ждут} ответа",
  ],
  [
    "{n} of {n} steps done",
    "{1} qadamdan {0} tasi bajarildi",
    "Выполнено шагов: {0} из {1}",
  ],
  [
    "Busiest day {x} with {n}",
    "Eng band kun — {0}, {1} ta",
    "Самый загруженный день — {0}, {1}",
  ],
  [
    "New leads per day over the last 30 days, {n} in total. Use the arrow keys to read each day.",
    "So'nggi 30 kundagi kunlik yangi lidlar, jami {0} ta. Har bir kunni o'qish uchun strelka tugmalaridan foydalaning.",
    "Новые лиды по дням за последние 30 дней, всего {0}. Используйте стрелки, чтобы прочитать каждый день.",
  ],
  [
    "No one matches “{x}”.",
    "“{0}” bo'yicha hech kim topilmadi.",
    "По запросу «{0}» никого не найдено.",
  ],
  [
    "No tool matches “{x}”.",
    "“{0}” bo'yicha vosita topilmadi.",
    "По запросу «{0}» инструментов не найдено.",
  ],
  [
    "No workflow matches “{x}”.",
    "“{0}” bo'yicha workflow topilmadi.",
    "По запросу «{0}» workflow не найдено.",
  ],
  ["Matching “{x}”.", "“{0}” bo'yicha.", "По запросу «{0}»."],
  ["Assigned: {x}", "Tayinlangan: {0}", "Назначено: {0}"],
  ["Welcome, {x}", "Xush kelibsiz, {0}", "Добро пожаловать, {0}"],
  ["Connected as {x}", "Ulangan hisob: {0}", "Подключено как {0}"],
  ["Connected {x}", "{0} ulandi", "Подключено: {0}"],
  [
    "Connected Google Calendar ({x})",
    "Google Calendar ulandi ({0})",
    "Google Calendar подключён ({0})",
  ],
  [
    "Connected Google account ({x})",
    "Google hisobi ulandi ({0})",
    "Аккаунт Google подключён ({0})",
  ],

  // Developer API.
  ["calls on {x}", "{0} kungi chaqiruvlar", "вызовы за {0}"],
  [
    "API calls per day over the last 30 days, {n} in total. Use the arrow keys to read each day.",
    "So'nggi 30 kundagi kunlik API chaqiruvlar, jami {0} ta. Har bir kunni o'qish uchun strelka tugmalaridan foydalaning.",
    "API-вызовы по дням за последние 30 дней, всего {0}. Используйте стрелки, чтобы прочитать каждый день.",
  ],
  [
    "No calls in the last {n} days yet.",
    "So'nggi {0} kunda hali chaqiruvlar yo'q.",
    "За последние {0} {0:день|дня|дней} вызовов пока нет.",
  ],
  [
    "The latest 100 calls, newest first. Kept for {n} days. Hover a row for its request id, which matches the X-Request-Id header.",
    "So'nggi 100 ta chaqiruv, eng yangisi birinchi. {0} kun saqlanadi. So'rov ID'sini ko'rish uchun qator ustiga olib boring — u X-Request-Id sarlavhasiga mos keladi.",
    "Последние 100 вызовов, сначала новые. Хранятся {0} {0:день|дня|дней}. Наведите на строку, чтобы увидеть ID запроса — он совпадает с заголовком X-Request-Id.",
  ],
  [
    "Only show a key to the person or system that needs it. You can have up to {n} active keys.",
    "Kalitni faqat unga muhtoj odam yoki tizimga ko'rsating. {0} tagacha faol kalitingiz bo'lishi mumkin.",
    "Показывайте ключ только тому человеку или системе, которым он нужен. Можно иметь до {0} активных ключей.",
  ],
  [
    "“{x}” stops working now and a new key with the same permissions and limits replaces it. Update every system that uses it straight away.",
    "“{0}” hozir ishlamay qoladi va uning o'rniga xuddi shu ruxsat va cheklovlarga ega yangi kalit keladi. Undan foydalanadigan barcha tizimlarni darhol yangilang.",
    "«{0}» перестаёт работать сейчас, его заменит новый ключ с теми же правами и лимитами. Сразу обновите все системы, которые его используют.",
  ],
  [
    "Every call made with “{x}” will be refused from now on. This cannot be undone.",
    "Bundan buyon “{0}” bilan qilingan har bir chaqiruv rad etiladi. Buni ortga qaytarib bo'lmaydi.",
    "Все вызовы с «{0}» с этого момента будут отклоняться. Это нельзя отменить.",
  ],
  [
    "“{x}” is already revoked. Its past calls stay in the log.",
    "“{0}” allaqachon bekor qilingan. Uning oldingi chaqiruvlari jurnalda qoladi.",
    "«{0}» уже отозван. Его прошлые вызовы остаются в журнале.",
  ],
  [
    "Reset {x} to the default",
    "{0} ni standartga qaytarish",
    "Сбросить {0} к значению по умолчанию",
  ],
  [
    "{x} must be a whole number.",
    "{0} butun son bo'lishi kerak.",
    "{0} должно быть целым числом.",
  ],

  // Integrations.
  [
    "Cleared {n} delivery history",
    "{0} ta yetkazish tarixi tozalandi",
    "Очищено записей доставки: {0}",
  ],
  [
    "Cleared {n} delivery histories",
    "{0} ta yetkazish tarixi tozalandi",
    "Очищено записей доставки: {0}",
  ],
  ["{x} copied", "{0} nusxalandi", "{0}: скопировано"],
  [
    "Couldn't copy {x}",
    "{0} ni nusxalab bo'lmadi",
    "Не удалось скопировать: {0}",
  ],
  ["· attempt {n}", "· {0}-urinish", "· попытка {0}"],

  // Widget customization.
  [
    "Published version v{n}",
    "v{0} versiyasi e'lon qilindi",
    "Опубликована версия v{0}",
  ],
  ["Published v{n}", "v{0} e'lon qilindi", "Опубликована v{0}"],
  ["Rolled back to v{n}", "v{0} ga qaytarildi", "Откат к v{0}"],
  [
    "Rolled back to v{n}. New published version is v{n}",
    "v{0} ga qaytarildi. Yangi e'lon qilingan versiya — v{1}",
    "Откат к v{0}. Новая опубликованная версия — v{1}",
  ],
  [
    "Image must be {x} or smaller.",
    "Rasm {0} yoki undan kichik bo'lishi kerak.",
    "Изображение должно быть не больше {0}.",
  ],
  ["{n} below 4.5:1", "{0} tasi 4.5:1 dan past", "{0} ниже 4.5:1"],
  ["{x} uploaded", "{0} yuklandi", "{0} загружено"],

  // Workflows.
  ["{x} duplicated", "{0} nusxalandi", "{0} продублирован"],
  ["{x} deleted", "{0} o'chirildi", "{0} удалён"],
  ["{x} created", "{0} yaratildi", "{0} создан"],
  [
    "{x} is no longer answering conversations",
    "{0} endi suhbatlarga javob bermaydi",
    "{0} больше не отвечает на диалоги",
  ],
  [
    "{x} published as a component",
    "{0} komponent sifatida e'lon qilindi",
    "{0} опубликован как компонент",
  ],
  [
    "Upload failed with {x}",
    "Yuklash xatoga uchradi: {0}",
    "Загрузка не удалась: {0}",
  ],
  [
    "Step mode: {x}. Switch mode.",
    "Qadam rejimi: {0}. Rejimni almashtirish.",
    "Режим шага: {0}. Сменить режим.",
  ],
  [
    "{x} — click to add, or drag onto the canvas",
    "{0} — qo'shish uchun bosing yoki kanvasga sudrang",
    "{0} — нажмите, чтобы добавить, или перетащите на холст",
  ],
  [
    "Later steps can use it as {x}.",
    "Keyingi qadamlar undan {0} sifatida foydalana oladi.",
    "Следующие шаги могут использовать его как {0}.",
  ],
  [
    "Configure a {x} assistant tool first.",
    "Avval {0} yordamchi vositasini sozlang.",
    "Сначала настройте инструмент ассистента {0}.",
  ],
  [
    "Listen and save reply to: {x}",
    "Tinglash va javobni saqlash joyi: {0}",
    "Слушать и сохранить ответ в: {0}",
  ],
  [
    "Node {x} is not on the canvas.",
    "{0} tuguni kanvasda yo'q.",
    "Узла {0} нет на холсте.",
  ],
  [
    "Entering component {x}",
    "{0} komponentiga kirilmoqda",
    "Вход в компонент {0}",
  ],
  [
    'Unsupported step "{x}"',
    'Qo\'llab-quvvatlanmaydigan qadam: "{0}"',
    "Неподдерживаемый шаг «{0}»",
  ],
  [
    '"{x}" has never been published, so it has no runnable version.',
    "\"{0}\" hech qachon e'lon qilinmagan, shuning uchun uning ishga tushiriladigan versiyasi yo'q.",
    "«{0}» ни разу не публиковался, поэтому запускать нечего.",
  ],
  [
    '"{x}" has no Start block.',
    '"{0}" da Start bloki yo\'q.',
    "В «{0}» нет блока «Старт».",
  ],
  [
    'No path named "{x}"; took the first one.',
    "\"{0}\" nomli yo'l yo'q; birinchisi tanlandi.",
    "Пути «{0}» нет; выбран первый.",
  ],
  [
    'Got "{x}". Expected: {x}',
    'Olingan: "{0}". Kutilgan: {1}',
    "Получено «{0}». Ожидалось: {1}",
  ],
  ["Agent called {x}", "Agent {0} ni chaqirdi", "Агент вызвал {0}"],
  ["{x} replied", "{0} javob berdi", "{0} ответил"],
  ["{x} completed", "{0} yakunlandi", "{0} завершён"],

  // Shared UI.
  ["{x} and {n} more", "{0} va yana {1} ta", "{0} и ещё {1}"],
  [
    "You can attach up to {n} image per message.",
    "Bitta xabarga {0} tagacha rasm biriktirish mumkin.",
    "К одному сообщению можно прикрепить до {0} {0:изображения|изображений|изображений}.",
  ],
  [
    "You can attach up to {n} images per message.",
    "Bitta xabarga {0} tagacha rasm biriktirish mumkin.",
    "К одному сообщению можно прикрепить до {0} {0:изображения|изображений|изображений}.",
  ],
  [
    "That image is too large. The limit is {x}.",
    "Bu rasm juda katta. Cheklov — {0}.",
    "Изображение слишком большое. Лимит — {0}.",
  ],
]

// ---------------------------------------------------------------------------
// date-fns distances ("about 2 hours", "less than a minute", "over 1 year")

type Unit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year"

const UZ_UNITS: Record<Unit, string> = {
  second: "soniya",
  minute: "daqiqa",
  hour: "soat",
  day: "kun",
  week: "hafta",
  month: "oy",
  year: "yil",
}

// [one, few, many, genitive singular, accusative singular]
const RU_UNITS: Record<Unit, [string, string, string, string, string]> = {
  second: ["секунда", "секунды", "секунд", "секунды", "секунду"],
  minute: ["минута", "минуты", "минут", "минуты", "минуту"],
  hour: ["час", "часа", "часов", "часа", "час"],
  day: ["день", "дня", "дней", "дня", "день"],
  week: ["неделя", "недели", "недель", "недели", "неделю"],
  month: ["месяц", "месяца", "месяцев", "месяца", "месяц"],
  year: ["год", "года", "лет", "года", "год"],
}

function ruPluralIndex(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 0
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1
  return 2
}

function ruCount(count: number, unit: Unit, accusative: boolean) {
  const forms = RU_UNITS[unit]
  const index = ruPluralIndex(count)
  const word = index === 0 && accusative ? forms[4] : forms[index]
  return `${count} ${word}`
}

// "over 2 years" → "больше 2 лет": the noun after a comparison is genitive.
function ruGenitiveCount(count: number, unit: Unit) {
  const forms = RU_UNITS[unit]
  return `${count} ${ruPluralIndex(count) === 0 ? forms[3] : forms[2]}`
}

const DISTANCE =
  /^(less than|about|over|almost)?\s*(a|an|\d+)\s+(second|minute|hour|day|week|month|year)s?$/i

/** Translates one date-fns distance, or returns null when `value` isn't one. */
function translateDistance(
  value: string,
  language: Lang,
  withSuffix: boolean
): string | null {
  const text = value.trim()

  if (/^less than a minute$/i.test(text)) {
    return language === "uz" ? "bir daqiqadan kam" : "меньше минуты"
  }
  if (/^half a minute$/i.test(text)) {
    return language === "uz"
      ? "yarim daqiqa"
      : withSuffix
        ? "полминуты"
        : "полминуты"
  }

  const match = DISTANCE.exec(text)
  if (!match) return null

  const qualifier = match[1]?.toLowerCase()
  const count = /^an?$/i.test(match[2]!) ? 1 : Number(match[2])
  const unit = match[3]!.toLowerCase() as Unit

  if (language === "uz") {
    const base = `${count} ${UZ_UNITS[unit]}`
    if (qualifier === "less than") return `${base}dan kam`
    if (qualifier === "about") return `taxminan ${base}`
    if (qualifier === "over") return `${base}dan ortiq`
    if (qualifier === "almost") return `deyarli ${base}`
    return base
  }

  if (qualifier === "less than") return `меньше ${ruGenitiveCount(count, unit)}`
  if (qualifier === "over") return `больше ${ruGenitiveCount(count, unit)}`
  const base = ruCount(count, unit, withSuffix)
  if (qualifier === "about") return `примерно ${base}`
  if (qualifier === "almost") return `почти ${base}`
  return base
}

// ---------------------------------------------------------------------------

type Token = "n" | "d" | "x"

type CompiledPattern = {
  regex: RegExp
  tokens: Token[]
  /** Literal text every match must contain, checked before the regex runs. */
  anchor: string
  uz: string
  ru: string
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

function compile([pattern, uz, ru]: PatternSpec): CompiledPattern {
  const tokens: Token[] = []
  const pieces = pattern.split(/(\{[ndx]\})/)
  const source = pieces
    .map((piece) => {
      const token = /^\{([ndx])\}$/.exec(piece)?.[1] as Token | undefined
      if (!token) return escapeRegex(piece)
      tokens.push(token)
      return token === "n" ? "(\\d[\\d,.\\u00a0\\u202f ]*)" : "(.+?)"
    })
    .join("")
  const literals = pieces.filter((piece) => !/^\{[ndx]\}$/.test(piece))
  const anchor = literals.reduce(
    (longest, piece) => (piece.length > longest.length ? piece : longest),
    ""
  )

  return { regex: new RegExp(`^${source}$`), tokens, anchor, uz, ru }
}

const COMPILED = PATTERNS.map(compile)

function fillTemplate(template: string, captures: string[]) {
  return template.replace(
    /\{(\d+)(?::([^}]+))?\}/g,
    (_whole, index: string, forms?: string) => {
      const value = captures[Number(index)] ?? ""
      if (!forms) return value
      const options = forms.split("|")
      const count = Number(value.replace(/[^\d]/g, ""))
      return options[ruPluralIndex(count)] ?? options[options.length - 1] ?? ""
    }
  )
}

/**
 * Translates runtime-built dashboard text, or returns undefined when nothing
 * matches. `lookup` is the exact-match dictionary, used for captured values
 * that are themselves English labels.
 */
export function translateDashboardPattern(
  text: string,
  language: Lang,
  lookup: LookupFn
): string | undefined {
  // A bare distance ("3 days", "about 1 hour") is rendered on its own too.
  const bare = translateDistance(text, language, false)
  if (bare) return bare

  for (const pattern of COMPILED) {
    if (pattern.anchor && !text.includes(pattern.anchor)) continue

    const match = pattern.regex.exec(text)
    if (!match) continue

    const withSuffix = / ago$|^in /.test(text) || text.includes(" in ")
    const captures: string[] = []
    let valid = true

    pattern.tokens.forEach((token, index) => {
      const raw = match[index + 1] ?? ""
      if (token === "d") {
        const distance = translateDistance(raw, language, withSuffix)
        if (distance === null) valid = false
        captures.push(distance ?? raw)
      } else if (token === "x") {
        captures.push(lookup(raw.trim()) ?? raw)
      } else {
        captures.push(raw.trim())
      }
    })

    if (!valid) continue
    const result = fillTemplate(
      language === "uz" ? pattern.uz : pattern.ru,
      captures
    )
    // "Active about 3 hours ago" → "Taxminan 3 soat…", not "taxminan".
    return /^[A-Z]/.test(text)
      ? result.charAt(0).toLocaleUpperCase(language) + result.slice(1)
      : result
  }

  return undefined
}
