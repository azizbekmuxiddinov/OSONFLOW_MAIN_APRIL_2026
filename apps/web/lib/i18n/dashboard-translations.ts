// Uzbek and Russian for the dashboard (workflow builder, assistant tools,
// widget customization, integrations, onboarding and the rest of the signed-in
// app). Keys are the exact English text React renders; the DOM translator in
// language-provider.tsx looks each text node and attribute up here.

type TranslationValue = {
  uz: string
  ru: string
}

export const dashboardTranslations: Record<string, TranslationValue> = {
  Seek: {
    uz: "O'tkazish",
    ru: "Перемотать",
  },
  "Close image": {
    uz: "Rasmni yopish",
    ru: "Закрыть изображение",
  },
  "What would you like to know?": {
    uz: "Nimani bilmoqchisiz?",
    ru: "Что вы хотите узнать?",
  },
  "Drag and drop or click to replace": {
    uz: "Almashtirish uchun sudrab tashlang yoki bosing",
    ru: "Перетащите или нажмите, чтобы заменить",
  },
  Accepts: {
    uz: "Qabul qilinadi",
    ru: "Принимаются",
  },
  "a file": {
    uz: "fayl",
    ru: "файл",
  },
  "Drag and drop or click to upload": {
    uz: "Yuklash uchun sudrab tashlang yoki bosing",
    ru: "Перетащите или нажмите, чтобы загрузить",
  },
  "Displays the mobile sidebar.": {
    uz: "Mobil yon panelni ko'rsatadi.",
    ru: "Показывает мобильную боковую панель.",
  },
  "Toggle Sidebar": {
    uz: "Yon panelni ochish/yopish",
    ru: "Показать/скрыть боковую панель",
  },
  "That image could not be uploaded.": {
    uz: "Bu rasmni yuklab bo'lmadi.",
    ru: "Не удалось загрузить это изображение.",
  },
  "That image could not be prepared.": {
    uz: "Bu rasmni tayyorlab bo'lmadi.",
    ru: "Не удалось подготовить это изображение.",
  },
  "Only images can be attached.": {
    uz: "Faqat rasmlarni biriktirish mumkin.",
    ru: "Можно прикреплять только изображения.",
  },
  "SVG files cannot be attached.": {
    uz: "SVG fayllarni biriktirib bo'lmaydi.",
    ru: "SVG-файлы прикреплять нельзя.",
  },
  "That image could not be read.": {
    uz: "Bu rasmni o'qib bo'lmadi.",
    ru: "Не удалось прочитать это изображение.",
  },
  "The upload did not complete. Try again.": {
    uz: "Yuklash tugallanmadi. Qayta urinib ko'ring.",
    ru: "Загрузка не завершилась. Попробуйте ещё раз.",
  },
  "This voicechat couldn’t load": {
    uz: "Bu ovozli suhbat yuklanmadi",
    ru: "Не удалось загрузить этот голосовой чат",
  },
  "Try again, or go back to the AI voicechats list.": {
    uz: "Qayta urinib ko'ring yoki AI ovozli suhbatlar ro'yxatiga qayting.",
    ru: "Попробуйте ещё раз или вернитесь к списку голосовых чатов AI.",
  },
  "Try again": {
    uz: "Qayta urinish",
    ru: "Попробовать ещё раз",
  },
  "This page couldn’t load": {
    uz: "Bu sahifa yuklanmadi",
    ru: "Не удалось загрузить страницу",
  },
  "Reload to try again, or go back.": {
    uz: "Qayta urinish uchun sahifani yangilang yoki orqaga qayting.",
    ru: "Обновите страницу, чтобы попробовать снова, или вернитесь назад.",
  },
  Reload: {
    uz: "Yangilash",
    ru: "Обновить",
  },
  "Could not generate instructions.": {
    uz: "Ko'rsatmalarni yaratib bo'lmadi.",
    ru: "Не удалось создать инструкции.",
  },
  "Agent name": {
    uz: "Agent nomi",
    ru: "Имя агента",
  },
  Model: {
    uz: "Model",
    ru: "Модель",
  },
  "Close agent editor": {
    uz: "Agent muharririni yopish",
    ru: "Закрыть редактор агента",
  },
  "Enter agent instructions…": {
    uz: "Agent ko'rsatmalarini kiriting…",
    ru: "Введите инструкции для агента…",
  },
  "Agent instructions": {
    uz: "Agent ko'rsatmalari",
    ru: "Инструкции агента",
  },
  "Enter agent instructions, or": {
    uz: "Agent ko'rsatmalarini kiriting yoki",
    ru: "Введите инструкции для агента или",
  },
  "Generate instructions": {
    uz: "Ko'rsatmalarni yaratish",
    ru: "Сгенерировать инструкции",
  },
  "Enter exit condition name": {
    uz: "Chiqish sharti nomini kiriting",
    ru: "Введите название условия выхода",
  },
  "Exit when": {
    uz: "Qachon chiqish",
    ru: "Выйти, когда",
  },
  "Describe the conditions under which to take this exit…": {
    uz: "Bu chiqishga qaysi holatlarda o'tishni tasvirlang…",
    ru: "Опишите, при каких условиях выбирать этот выход…",
  },
  "Required variables": {
    uz: "Majburiy o'zgaruvchilar",
    ru: "Обязательные переменные",
  },
  "Add required variable": {
    uz: "Majburiy o'zgaruvchi qo'shish",
    ru: "Добавить обязательную переменную",
  },
  "What the agent should collect": {
    uz: "Agent nimani to'plashi kerak",
    ru: "Что должен собрать агент",
  },
  "Remove variable": {
    uz: "O'zgaruvchini olib tashlash",
    ru: "Удалить переменную",
  },
  "Remove required variable": {
    uz: "Majburiy o'zgaruvchini olib tashlash",
    ru: "Удалить обязательную переменную",
  },
  Messages: {
    uz: "Xabarlar",
    ru: "Сообщения",
  },
  "Add message": {
    uz: "Xabar qo'shish",
    ru: "Добавить сообщение",
  },
  "Sent before this exit is taken": {
    uz: "Bu chiqishdan oldin yuboriladi",
    ru: "Отправляется перед этим выходом",
  },
  "Remove message": {
    uz: "Xabarni olib tashlash",
    ru: "Удалить сообщение",
  },
  "No exit conditions": {
    uz: "Chiqish shartlari yo'q",
    ru: "Нет условий выхода",
  },
  "Add one on the right and it becomes an outgoing path on the canvas, so the agent can hand control to a different branch.":
    {
      uz: "O'ng tomonda shart qo'shing — u kanvasda chiquvchi yo'lga aylanadi va agent boshqaruvni boshqa tarmoqqa topshira oladi.",
      ru: "Добавьте условие справа — оно станет исходящим путём на холсте, и агент сможет передать управление другой ветке.",
    },
  "Which configured tool should the agent call?": {
    uz: "Agent qaysi sozlangan vositani chaqirishi kerak?",
    ru: "Какой настроенный инструмент должен вызвать агент?",
  },
  "Add exit condition": {
    uz: "Chiqish sharti qo'shish",
    ru: "Добавить условие выхода",
  },
  "None yet — the agent falls through its single default path.": {
    uz: "Hali yo'q — agent yagona standart yo'l bo'yicha davom etadi.",
    ru: "Пока нет — агент идёт по единственному пути по умолчанию.",
  },
  "New exit condition": {
    uz: "Yangi chiqish sharti",
    ru: "Новое условие выхода",
  },
  "Remove exit condition": {
    uz: "Chiqish shartini olib tashlash",
    ru: "Удалить условие выхода",
  },
  "exit condition": {
    uz: "chiqish sharti",
    ru: "условие выхода",
  },
  Node: {
    uz: "Tugun",
    ru: "Узел",
  },
  "Enter JavaScript": {
    uz: "JavaScript kiriting",
    ru: "Введите JavaScript",
  },
  "Runs server-side with a 2s limit. Read and write workflow state through": {
    uz: "Serverda 2 soniya cheklov bilan ishlaydi. Workflow holatini quyidagi orqali o'qing va yozing:",
    ru: "Выполняется на сервере с лимитом 2 с. Читайте и записывайте состояние workflow через",
  },
  ", or return an object of values to set. Throwing takes the error branch.": {
    uz: ", yoki o'rnatiladigan qiymatlar obyektini qaytaring. Xato yuz bersa, xato tarmog'iga o'tiladi.",
    ru: "или верните объект со значениями для записи. При ошибке выполняется ветка ошибки.",
  },
  "Close (Esc)": {
    uz: "Yopish (Esc)",
    ru: "Закрыть (Esc)",
  },
  "Close editor": {
    uz: "Muharrirni yopish",
    ru: "Закрыть редактор",
  },
  "Describe what should happen, in your own words. It draws the steps and opens them on the canvas for you to check.":
    {
      uz: "Nima bo'lishi kerakligini o'z so'zlaringiz bilan tasvirlang. AI qadamlarni chizib, tekshirishingiz uchun kanvasda ochadi.",
      ru: "Опишите своими словами, что должно происходить. AI нарисует шаги и откроет их на холсте для проверки.",
    },
  "Book an appointment: ask what they need, take their name and phone, then confirm someone will call back.":
    {
      uz: "Uchrashuvga yozish: nima kerakligini so'rang, ism va telefonini oling, so'ng kimdir qayta qo'ng'iroq qilishini tasdiqlang.",
      ru: "Запись на приём: спросите, что нужно, возьмите имя и телефон, затем подтвердите, что вам перезвонят.",
    },
  "Or start from one of these": {
    uz: "Yoki shulardan biridan boshlang",
    ru: "Или начните с одного из этих вариантов",
  },
  "Drawing the steps": {
    uz: "Qadamlar chizilmoqda",
    ru: "Рисуем шаги",
  },
  "Draft it": {
    uz: "Qoralama yaratish",
    ru: "Создать черновик",
  },
  "Book an appointment: ask what they need, take their name and phone, check it is within opening hours, then confirm someone will call back.":
    {
      uz: "Uchrashuvga yozish: nima kerakligini so'rang, ism va telefonini oling, ish vaqtiga to'g'ri kelishini tekshiring, so'ng kimdir qayta qo'ng'iroq qilishini tasdiqlang.",
      ru: "Запись на приём: спросите, что нужно, возьмите имя и телефон, проверьте, что это в рабочее время, затем подтвердите, что вам перезвонят.",
    },
  "Handle a refund request: find the order number, ask why, and hand anything over 30 days old to a human.":
    {
      uz: "Pulni qaytarish so'rovi: buyurtma raqamini toping, sababini so'rang va 30 kundan eski har qanday so'rovni xodimga topshiring.",
      ru: "Запрос на возврат: найдите номер заказа, спросите причину и передайте человеку всё, что старше 30 дней.",
    },
  "Qualify a new lead: find out what they are looking for and their budget, then route them to the right team.":
    {
      uz: "Yangi lidni baholash: nima izlayotgani va byudjetini bilib oling, so'ng to'g'ri jamoaga yo'naltiring.",
      ru: "Квалификация нового лида: узнайте, что ищет клиент и его бюджет, затем направьте в нужную команду.",
    },
  "Workflow drafted. Check the steps before you publish it.": {
    uz: "Workflow qoralamasi tayyor. E'lon qilishdan oldin qadamlarni tekshiring.",
    ru: "Черновик workflow готов. Проверьте шаги перед публикацией.",
  },
  "Could not draft that workflow.": {
    uz: "Bu workflow qoralamasini yaratib bo'lmadi.",
    ru: "Не удалось создать черновик этого workflow.",
  },
  "Draft a workflow with AI": {
    uz: "AI yordamida workflow qoralamasini yaratish",
    ru: "Создать черновик workflow с помощью AI",
  },
  "Loading conversations…": {
    uz: "Suhbatlar yuklanmoqda…",
    ru: "Загрузка диалогов…",
  },
  "Once people talk to your published flow, every conversation shows up here and you can watch it step by step.":
    {
      uz: "Odamlar e'lon qilingan workflow bilan gaplasha boshlagach, har bir suhbat shu yerda paydo bo'ladi va uni qadamma-qadam ko'rishingiz mumkin.",
      ru: "Когда люди начнут общаться с опубликованным workflow, каждый диалог появится здесь, и его можно будет просмотреть шаг за шагом.",
    },
  "Stopped at": {
    uz: "To'xtagan joyi",
    ru: "Остановился на",
  },
  "a removed step": {
    uz: "o'chirilgan qadam",
    ru: "удалённом шаге",
  },
  "Loading conversation…": {
    uz: "Suhbat yuklanmoqda…",
    ru: "Загрузка диалога…",
  },
  Outcome: {
    uz: "Natija",
    ru: "Результат",
  },
  "Steps taken": {
    uz: "Bajarilgan qadamlar",
    ru: "Пройденные шаги",
  },
  "A step that no longer exists": {
    uz: "Endi mavjud bo'lmagan qadam",
    ru: "Шаг, которого больше нет",
  },
  "Read the full conversation": {
    uz: "To'liq suhbatni o'qish",
    ru: "Читать весь диалог",
  },
  "What the flow collected": {
    uz: "Workflow nimalarni to'pladi",
    ru: "Что собрал workflow",
  },
  "Nothing was saved during this conversation.": {
    uz: "Bu suhbat davomida hech narsa saqlanmadi.",
    ru: "За этот диалог ничего не было сохранено.",
  },
  "Back to all conversations": {
    uz: "Barcha suhbatlarga qaytish",
    ru: "Назад ко всем диалогам",
  },
  Finished: {
    uz: "Yakunlangan",
    ru: "Завершён",
  },
  "Real conversations": {
    uz: "Haqiqiy suhbatlar",
    ru: "Реальные диалоги",
  },
  "Dropped off": {
    uz: "Tark etgan",
    ru: "Ушёл",
  },
  "Close replay": {
    uz: "Qayta ko'rishni yopish",
    ru: "Закрыть повтор",
  },
  "In progress": {
    uz: "Jarayonda",
    ru: "В процессе",
  },
  "Watch how real people moved through this flow, step by step.": {
    uz: "Haqiqiy odamlar bu workflow bo'ylab qanday o'tganini qadamma-qadam ko'ring.",
    ru: "Смотрите, как реальные люди проходили этот workflow, шаг за шагом.",
  },
  "Filter conversations": {
    uz: "Suhbatlarni filtrlash",
    ru: "Фильтр диалогов",
  },
  "Showing the most recent conversations only.": {
    uz: "Faqat eng so'nggi suhbatlar ko'rsatilmoqda.",
    ru: "Показаны только последние диалоги.",
  },
  "Replay timeline": {
    uz: "Qayta ko'rish vaqt chizig'i",
    ru: "Шкала повтора",
  },
  "Drag to resize": {
    uz: "O'lchamini o'zgartirish uchun sudrang",
    ru: "Перетащите, чтобы изменить размер",
  },
  "Previous step": {
    uz: "Oldingi qadam",
    ru: "Предыдущий шаг",
  },
  Pause: {
    uz: "Pauza",
    ru: "Пауза",
  },
  Play: {
    uz: "Ijro etish",
    ru: "Воспроизвести",
  },
  "Pause replay": {
    uz: "Qayta ko'rishni to'xtatish",
    ru: "Приостановить повтор",
  },
  "Play replay": {
    uz: "Qayta ko'rishni boshlash",
    ru: "Воспроизвести повтор",
  },
  "Replay position": {
    uz: "Qayta ko'rish holati",
    ru: "Позиция повтора",
  },
  "No steps": {
    uz: "Qadamlar yo'q",
    ru: "Нет шагов",
  },
  "Pick a conversation": {
    uz: "Suhbatni tanlang",
    ru: "Выберите диалог",
  },
  "Choose one on the right to replay it on the canvas.": {
    uz: "Kanvasda qayta ko'rish uchun o'ngdagilardan birini tanlang.",
    ru: "Выберите диалог справа, чтобы воспроизвести его на холсте.",
  },
  "Nothing recorded": {
    uz: "Hech narsa yozilmagan",
    ru: "Ничего не записано",
  },
  "This conversation ended before any step ran.": {
    uz: "Bu suhbat birorta qadam ishlamasdan tugagan.",
    ru: "Этот диалог завершился до выполнения первого шага.",
  },
  "The first": {
    uz: "Birinchi",
    ru: "Первые",
  },
  "step is": {
    uz: "qadam",
    ru: "шаг",
  },
  "steps are": {
    uz: "qadam",
    ru: "шагов",
  },
  "no longer stored for this conversation.": {
    uz: "bu suhbat uchun endi saqlanmaydi.",
    ru: "больше не хранятся для этого диалога.",
  },
  "just now": {
    uz: "hozirgina",
    ru: "только что",
  },
  "under a second": {
    uz: "bir soniyadan kam",
    ru: "меньше секунды",
  },
  "Waiting for card button": {
    uz: "Karta tugmasi kutilmoqda",
    ru: "Ожидание кнопки карточки",
  },
  "Buttons step has no buttons": {
    uz: "Tugmalar qadamida tugma yo'q",
    ru: "В шаге «Кнопки» нет кнопок",
  },
  "Passing through to the next step.": {
    uz: "Keyingi qadamga o'tilmoqda.",
    ru: "Переход к следующему шагу.",
  },
  Output: {
    uz: "Chiqish",
    ru: "Вывод",
  },
  Input: {
    uz: "Kiritish",
    ru: "Ввод",
  },
  "Waiting for button": {
    uz: "Tugma kutilmoqda",
    ru: "Ожидание кнопки",
  },
  Info: {
    uz: "Ma'lumot",
    ru: "Инфо",
  },
  "Choice step has no choices": {
    uz: "Tanlov qadamida variantlar yo'q",
    ru: "В шаге выбора нет вариантов",
  },
  "Waiting for choice": {
    uz: "Tanlov kutilmoqda",
    ru: "Ожидание выбора",
  },
  "Waiting for text capture": {
    uz: "Matn kiritilishi kutilmoqda",
    ru: "Ожидание ввода текста",
  },
  Error: {
    uz: "Xato",
    ru: "Ошибка",
  },
  "Waiting for user before AI turn": {
    uz: "AI navbatidan oldin foydalanuvchi kutilmoqda",
    ru: "Ожидание пользователя перед ходом AI",
  },
  "Searching knowledge base": {
    uz: "Bilim bazasidan qidirilmoqda",
    ru: "Поиск в базе знаний",
  },
  "Handoff to human": {
    uz: "Mutaxassisga uzatish",
    ru: "Передача оператору",
  },
  "Calling API": {
    uz: "API chaqirilmoqda",
    ru: "Вызов API",
  },
  "(no URL)": {
    uz: "(URL yo'q)",
    ru: "(нет URL)",
  },
  "Showed carousel": {
    uz: "Karusel ko'rsatildi",
    ru: "Показана карусель",
  },
  "Waiting for carousel button": {
    uz: "Karusel tugmasi kutilmoqda",
    ru: "Ожидание кнопки карусели",
  },
  "Published runs send a workflow.action webhook; test runs do not fire integrations.":
    {
      uz: "E'lon qilingan ishga tushirishlar workflow.action webhookini yuboradi; test ishga tushirishlar integratsiyalarni ishga tushirmaydi.",
      ru: "Опубликованные запуски отправляют вебхук workflow.action; тестовые запуски не вызывают интеграции.",
    },
  "Running JavaScript": {
    uz: "JavaScript ishlamoqda",
    ru: "Выполняется JavaScript",
  },
  "Running tool": {
    uz: "Vosita ishlamoqda",
    ru: "Выполняется инструмент",
  },
  "(none selected)": {
    uz: "(hech biri tanlanmagan)",
    ru: "(ничего не выбрано)",
  },
  "Component skipped": {
    uz: "Komponent o'tkazib yuborildi",
    ru: "Компонент пропущен",
  },
  "No workflow is selected for this component.": {
    uz: "Bu komponent uchun workflow tanlanmagan.",
    ru: "Для этого компонента не выбран workflow.",
  },
  "That component is already running (recursion).": {
    uz: "Bu komponent allaqachon ishlamoqda (rekursiya).",
    ru: "Этот компонент уже выполняется (рекурсия).",
  },
  "Component nesting is capped at 5 levels.": {
    uz: "Komponentlar ichma-ichligi 5 darajagacha cheklangan.",
    ru: "Вложенность компонентов ограничена 5 уровнями.",
  },
  "Running function": {
    uz: "Funksiya ishlamoqda",
    ru: "Выполняется функция",
  },
  "Conversation ended": {
    uz: "Suhbat tugadi",
    ru: "Диалог завершён",
  },
  "Published runs escalate to a human operator here.": {
    uz: "E'lon qilingan ishga tushirishlarda shu yerda inson operatorga uzatiladi.",
    ru: "В опубликованных запусках здесь происходит передача оператору.",
  },
  "Run finished": {
    uz: "Ishga tushirish tugadi",
    ru: "Запуск завершён",
  },
  "No more connected steps.": {
    uz: "Boshqa ulangan qadamlar yo'q.",
    ru: "Больше нет подключённых шагов.",
  },
  "That workflow": {
    uz: "O'sha workflow",
    ru: "Этот workflow",
  },
  "Component failed": {
    uz: "Komponent xatoga uchradi",
    ru: "Ошибка компонента",
  },
  "Could not load component": {
    uz: "Komponentni yuklab bo'lmadi",
    ru: "Не удалось загрузить компонент",
  },
  "I had trouble running a step. A human operator will continue from here.": {
    uz: "Qadamni bajarishda muammo yuz berdi. Bundan keyin inson operator davom ettiradi.",
    ru: "Не удалось выполнить шаг. Дальше продолжит оператор.",
  },
  "Tool step failed": {
    uz: "Vosita qadami xatoga uchradi",
    ru: "Ошибка шага инструмента",
  },
  "Tool failed": {
    uz: "Vosita xatoga uchradi",
    ru: "Ошибка инструмента",
  },
  "no path": {
    uz: "yo'l yo'q",
    ru: "нет пути",
  },
  "Function error": {
    uz: "Funksiya xatosi",
    ru: "Ошибка функции",
  },
  "Function failed": {
    uz: "Funksiya xatoga uchradi",
    ru: "Ошибка функции",
  },
  "Snippet failed": {
    uz: "Kod parchasi xatoga uchradi",
    ru: "Ошибка фрагмента кода",
  },
  "JavaScript step failed": {
    uz: "JavaScript qadami xatoga uchradi",
    ru: "Ошибка шага JavaScript",
  },
  "API step failed": {
    uz: "API qadami xatoga uchradi",
    ru: "Ошибка шага API",
  },
  "Request failed": {
    uz: "So'rov bajarilmadi",
    ru: "Запрос не выполнен",
  },
  "I had trouble reaching that service. A human operator will continue from here.":
    {
      uz: "Bu xizmatga ulanishda muammo yuz berdi. Bundan keyin inson operator davom ettiradi.",
      ru: "Не удалось связаться с сервисом. Дальше продолжит оператор.",
    },
  "(no text)": {
    uz: "(matn yo'q)",
    ru: "(нет текста)",
  },
  "Exit held back": {
    uz: "Chiqish to'xtatildi",
    ru: "Выход задержан",
  },
  "The agent matched an exit but is still missing a value it requires.": {
    uz: "Agent chiqish shartiga mos keldi, lekin unga kerakli qiymat hali yetishmaydi.",
    ru: "Агент выбрал выход, но ему всё ещё не хватает обязательного значения.",
  },
  "Agent ended the conversation": {
    uz: "Agent suhbatni tugatdi",
    ru: "Агент завершил диалог",
  },
  "Agent handed off to a human": {
    uz: "Agent suhbatni xodimga uzatdi",
    ru: "Агент передал диалог человеку",
  },
  "Waiting for the user": {
    uz: "Foydalanuvchi kutilmoqda",
    ru: "Ожидание пользователя",
  },
  "Agent turn failed": {
    uz: "Agent navbati xatoga uchradi",
    ru: "Ошибка хода агента",
  },
  "Agent step failed": {
    uz: "Agent qadami xatoga uchradi",
    ru: "Ошибка шага агента",
  },
  "I had trouble completing this agent step. A human operator will continue from here.":
    {
      uz: "Bu agent qadamini bajarishda muammo yuz berdi. Bundan keyin inson operator davom ettiradi.",
      ru: "Не удалось выполнить шаг агента. Дальше продолжит оператор.",
    },
  "AI step failed": {
    uz: "AI qadami xatoga uchradi",
    ru: "Ошибка шага AI",
  },
  "Workflow AI step failed": {
    uz: "Workflow AI qadami xatoga uchradi",
    ru: "Ошибка AI-шага workflow",
  },
  "I had trouble completing this AI step. A human operator will continue from here.":
    {
      uz: "Bu AI qadamini bajarishda muammo yuz berdi. Bundan keyin inson operator davom ettiradi.",
      ru: "Не удалось выполнить AI-шаг. Дальше продолжит оператор.",
    },
  "Nothing to run": {
    uz: "Ishga tushiradigan narsa yo'q",
    ru: "Нечего запускать",
  },
  "Add a Start node and connect steps.": {
    uz: "Start tugunini qo'shing va qadamlarni ulang.",
    ru: "Добавьте узел «Старт» и соедините шаги.",
  },
  "User replied to the agent": {
    uz: "Foydalanuvchi agentga javob berdi",
    ru: "Пользователь ответил агенту",
  },
  "User selected": {
    uz: "Foydalanuvchi tanladi",
    ru: "Пользователь выбрал",
  },
  "Choice not matched": {
    uz: "Tanlov mos kelmadi",
    ru: "Выбор не распознан",
  },
  "User spoke first": {
    uz: "Foydalanuvchi birinchi gapirdi",
    ru: "Пользователь заговорил первым",
  },
  "Captured user text": {
    uz: "Foydalanuvchi matni olindi",
    ru: "Текст пользователя сохранён",
  },
  "No next step after Capture": {
    uz: "Capture'dan keyin keyingi qadam yo'q",
    ru: "Нет следующего шага после «Ввода»",
  },
  "Connect the Capture node’s right handle to the next Message (or other step), then start a new chat.":
    {
      uz: "Capture tugunining o'ng ulagichini keyingi Xabar (yoki boshqa qadam)ga ulang, so'ng yangi chat boshlang.",
      ru: "Соедините правый выход узла «Ввод» со следующим сообщением (или другим шагом) и начните новый чат.",
    },
  "Waiting for reply": {
    uz: "Javob kutilmoqda",
    ru: "Ожидание ответа",
  },
  "Waiting for you to speak first": {
    uz: "Birinchi bo'lib gapirishingiz kutilmoqda",
    ru: "Ожидаем, что вы заговорите первым",
  },
  "Running code": {
    uz: "Kod ishlamoqda",
    ru: "Выполняется код",
  },
  "Entering component": {
    uz: "Komponentga kirilmoqda",
    ru: "Вход в компонент",
  },
  Generating: {
    uz: "Yaratilmoqda",
    ru: "Генерация",
  },
  Running: {
    uz: "Ishlamoqda",
    ru: "Выполняется",
  },
  "Workflow card": {
    uz: "Workflow kartasi",
    ru: "Карточка workflow",
  },
  "Workflow image": {
    uz: "Workflow rasmi",
    ru: "Изображение workflow",
  },
  "Test run": {
    uz: "Test ishga tushirish",
    ru: "Тестовый запуск",
  },
  Reset: {
    uz: "Qayta boshlash",
    ru: "Сбросить",
  },
  "Preview the conversation": {
    uz: "Suhbatni oldindan ko'rish",
    ru: "Предпросмотр диалога",
  },
  "Run the published path locally. The log and variables below update as each step executes.":
    {
      uz: "E'lon qilingan yo'lni mahalliy ishga tushiring. Quyidagi jurnal va o'zgaruvchilar har bir qadam bajarilganda yangilanadi.",
      ru: "Запустите опубликованный путь локально. Журнал и переменные ниже обновляются по мере выполнения шагов.",
    },
  "This workflow": {
    uz: "Bu workflow",
    ru: "Этот workflow",
  },
  "Assistant is typing": {
    uz: "Yordamchi yozmoqda",
    ru: "Ассистент печатает",
  },
  "Type a reply…": {
    uz: "Javob yozing…",
    ru: "Напишите ответ…",
  },
  "Type a choice or tap a button…": {
    uz: "Variantni yozing yoki tugmani bosing…",
    ru: "Введите вариант или нажмите кнопку…",
  },
  "Start new chat": {
    uz: "Yangi chat boshlash",
    ru: "Начать новый чат",
  },
  "Run inspector": {
    uz: "Ishga tushirish inspektori",
    ru: "Инспектор запуска",
  },
  "Run views": {
    uz: "Ishga tushirish ko'rinishlari",
    ru: "Представления запуска",
  },
  Issues: {
    uz: "Muammolar",
    ru: "Проблемы",
  },
  "Variable view": {
    uz: "O'zgaruvchilar ko'rinishi",
    ru: "Переменные",
  },
  Table: {
    uz: "Jadval",
    ru: "Таблица",
  },
  "Search the run log": {
    uz: "Ishga tushirish jurnalidan qidirish",
    ru: "Поиск по журналу запуска",
  },
  "Copy log": {
    uz: "Jurnalni nusxalash",
    ru: "Копировать журнал",
  },
  "Expand panel": {
    uz: "Panelni kengaytirish",
    ru: "Развернуть панель",
  },
  "Collapse panel": {
    uz: "Panelni yig'ish",
    ru: "Свернуть панель",
  },
  "No log yet": {
    uz: "Hali jurnal yo'q",
    ru: "Журнал пока пуст",
  },
  "Start a run to see every step, branch, wait, and variable write in order.": {
    uz: "Har bir qadam, tarmoq, kutish va o'zgaruvchi yozuvini tartib bilan ko'rish uchun ishga tushiring.",
    ru: "Запустите, чтобы увидеть по порядку каждый шаг, ветку, ожидание и запись переменных.",
  },
  "entry is": {
    uz: "yozuv",
    ru: "запись",
  },
  "entries are": {
    uz: "yozuv",
    ru: "записей",
  },
  "hidden by the current search and severity filter.": {
    uz: "joriy qidiruv va jiddiylik filtri tufayli yashirilgan.",
    ru: "скрыто текущим поиском и фильтром важности.",
  },
  "No variables yet": {
    uz: "Hali o'zgaruvchilar yo'q",
    ru: "Переменных пока нет",
  },
  "Capture, Choice, Set variable, API and AI steps populate this table during a run.":
    {
      uz: "Capture, Tanlov, O'zgaruvchi o'rnatish, API va AI qadamlari ishga tushirish vaqtida bu jadvalni to'ldiradi.",
      ru: "Шаги «Ввод», «Выбор», «Задать переменную», API и AI заполняют эту таблицу во время запуска.",
    },
  Variable: {
    uz: "O'zgaruvchi",
    ru: "Переменная",
  },
  "Written by": {
    uz: "Kim yozgan",
    ru: "Кем записано",
  },
  Updated: {
    uz: "Yangilangan",
    ru: "Обновлено",
  },
  "No issues": {
    uz: "Muammolar yo'q",
    ru: "Проблем нет",
  },
  "Warnings and errors raised while running — unmatched choices, dead ends, failed API and AI steps — collect here.":
    {
      uz: "Ishga tushirish paytidagi ogohlantirish va xatolar — mos kelmagan tanlovlar, boshi berk yo'llar, xatoga uchragan API va AI qadamlari — shu yerda to'planadi.",
      ru: "Здесь собираются предупреждения и ошибки во время запуска — нераспознанные выборы, тупики, неудачные шаги API и AI.",
    },
  "Returned from component": {
    uz: "Komponentdan qaytildi",
    ru: "Возврат из компонента",
  },
  "Loop guard tripped": {
    uz: "Sikl himoyasi ishladi",
    ru: "Сработала защита от зацикливания",
  },
  "Stopped after 50 steps to prevent an infinite loop.": {
    uz: "Cheksiz siklning oldini olish uchun 50 qadamdan keyin to'xtatildi.",
    ru: "Остановлено после 50 шагов, чтобы избежать бесконечного цикла.",
  },
  "Missing node": {
    uz: "Tugun topilmadi",
    ru: "Узел не найден",
  },
  "Workflow started": {
    uz: "Workflow boshlandi",
    ru: "Workflow запущен",
  },
  "Sent message": {
    uz: "Xabar yuborildi",
    ru: "Сообщение отправлено",
  },
  "Message is empty": {
    uz: "Xabar bo'sh",
    ru: "Сообщение пустое",
  },
  "Nothing was sent. Write something in this step.": {
    uz: "Hech narsa yuborilmadi. Bu qadamga biror narsa yozing.",
    ru: "Ничего не отправлено. Напишите что-нибудь в этом шаге.",
  },
  "Sent image": {
    uz: "Rasm yuborildi",
    ru: "Изображение отправлено",
  },
  "Image missing URL": {
    uz: "Rasm URL manzili yo'q",
    ru: "У изображения нет URL",
  },
  "Showed card": {
    uz: "Karta ko'rsatildi",
    ru: "Показана карточка",
  },
  "Insert variable": {
    uz: "O'zgaruvchi qo'shish",
    ru: "Вставить переменную",
  },
  Agentic: {
    uz: "Agentli",
    ru: "Агентный",
  },
  "Write one reply with AI.": {
    uz: "AI bilan bitta javob yozish.",
    ru: "Написать один ответ с помощью AI.",
  },
  "Run another workflow and come back.": {
    uz: "Boshqa workflowni ishga tushirib, qaytib kelish.",
    ru: "Запустить другой workflow и вернуться.",
  },
  "Option 1": {
    uz: "1-variant",
    ru: "Вариант 1",
  },
  "Option 2": {
    uz: "2-variant",
    ru: "Вариант 2",
  },
  "Option A": {
    uz: "A variant",
    ru: "Вариант A",
  },
  "Option B": {
    uz: "B variant",
    ru: "Вариант B",
  },
  "Please reply with your answer.": {
    uz: "Iltimos, javobingizni yozing.",
    ru: "Пожалуйста, напишите ваш ответ.",
  },
  "First option": {
    uz: "Birinchi variant",
    ru: "Первый вариант",
  },
  "Choose this": {
    uz: "Buni tanlash",
    ru: "Выбрать это",
  },
  "Connecting you with a human operator now.": {
    uz: "Sizni hozir inson operatorga ulayapmiz.",
    ru: "Соединяем вас с оператором.",
  },
  "Untitled workflow": {
    uz: "Nomsiz workflow",
    ru: "Workflow без названия",
  },
  "Organization member": {
    uz: "Tashkilot a'zosi",
    ru: "Участник организации",
  },
  Block: {
    uz: "Blok",
    ru: "Блок",
  },
  "A branching step has to stay last in its block.": {
    uz: "Tarmoqlanuvchi qadam o'z blokida oxirgi bo'lishi kerak.",
    ru: "Ветвящийся шаг должен оставаться последним в блоке.",
  },
  "Choose a PNG, JPG or GIF image.": {
    uz: "PNG, JPG yoki GIF rasmini tanlang.",
    ru: "Выберите изображение PNG, JPG или GIF.",
  },
  "That image is over 5 MB. Choose a smaller one.": {
    uz: "Bu rasm 5 MB dan katta. Kichikroq rasm tanlang.",
    ru: "Изображение больше 5 МБ. Выберите поменьше.",
  },
  "The image could not be uploaded.": {
    uz: "Rasmni yuklab bo'lmadi.",
    ru: "Не удалось загрузить изображение.",
  },
  "Only one Start node is allowed.": {
    uz: "Faqat bitta Start tuguni bo'lishi mumkin.",
    ru: "Допускается только один узел «Старт».",
  },
  "Start cannot be pasted because one already exists.": {
    uz: "Start allaqachon mavjud, shuning uchun uni joylashtirib bo'lmaydi.",
    ru: "Нельзя вставить «Старт», потому что он уже есть.",
  },
  "Start cannot be converted into a component.": {
    uz: "Startni komponentga aylantirib bo'lmaydi.",
    ru: "«Старт» нельзя превратить в компонент.",
  },
  "That block has multiple exits": {
    uz: "Bu blokda bir nechta chiqish bor",
    ru: "У этого блока несколько выходов",
  },
  "a workflow": {
    uz: "workflow",
    ru: "workflow",
  },
  "Could not create component": {
    uz: "Komponent yaratib bo'lmadi",
    ru: "Не удалось создать компонент",
  },
  "Start cannot be duplicated.": {
    uz: "Startni nusxalab bo'lmaydi.",
    ru: "«Старт» нельзя дублировать.",
  },
  "Start cannot be deleted.": {
    uz: "Startni o'chirib bo'lmaydi.",
    ru: "«Старт» нельзя удалить.",
  },
  "Workflow saved": {
    uz: "Workflow saqlandi",
    ru: "Workflow сохранён",
  },
  "Save failed": {
    uz: "Saqlab bo'lmadi",
    ru: "Не удалось сохранить",
  },
  "This workflow isn't saved yet. Check your connection.": {
    uz: "Bu workflow hali saqlanmagan. Internet aloqangizni tekshiring.",
    ru: "Этот workflow ещё не сохранён. Проверьте подключение.",
  },
  "Workflow published": {
    uz: "Workflow e'lon qilindi",
    ru: "Workflow опубликован",
  },
  "Publish failed": {
    uz: "E'lon qilib bo'lmadi",
    ru: "Не удалось опубликовать",
  },
  "Workflow taken offline": {
    uz: "Workflow faolsizlantirildi",
    ru: "Workflow отключён",
  },
  "Deactivate failed": {
    uz: "Faolsizlantirib bo'lmadi",
    ru: "Не удалось отключить",
  },
  "Could not publish that component": {
    uz: "Bu komponentni e'lon qilib bo'lmadi",
    ru: "Не удалось опубликовать этот компонент",
  },
  "Resize panel": {
    uz: "Panel o'lchamini o'zgartirish",
    ru: "Изменить размер панели",
  },
  "Drag to resize · double-click to reset": {
    uz: "O'lchamini o'zgartirish uchun sudrang · asliga qaytarish uchun ikki marta bosing",
    ru: "Перетащите, чтобы изменить размер · двойной клик — сброс",
  },
  "No match": {
    uz: "Mos kelmadi",
    ru: "Нет совпадения",
  },
  "No reply": {
    uz: "Javob yo'q",
    ru: "Нет ответа",
  },
  "Listen for other triggers": {
    uz: "Boshqa triggerlarni tinglash",
    ru: "Слушать другие триггеры",
  },
  "Step library": {
    uz: "Qadamlar kutubxonasi",
    ru: "Библиотека шагов",
  },
  "Save this workflow to enable collaboration.": {
    uz: "Birgalikda ishlash uchun bu workflowni saqlang.",
    ru: "Сохраните этот workflow, чтобы включить совместную работу.",
  },
  "Save this workflow so the organization can join it.": {
    uz: "Tashkilot qo'shila olishi uchun bu workflowni saqlang.",
    ru: "Сохраните этот workflow, чтобы организация могла присоединиться.",
  },
  "Can join": {
    uz: "Qo'shila oladi",
    ru: "Могут присоединиться",
  },
  "More publish options": {
    uz: "Boshqa e'lon qilish sozlamalari",
    ru: "Другие варианты публикации",
  },
  "This workflow has changes that are not live yet": {
    uz: "Bu workflowda hali jonli bo'lmagan o'zgarishlar bor",
    ru: "В этом workflow есть изменения, которые ещё не опубликованы",
  },
  "Take offline": {
    uz: "Faolsizlantirish",
    ru: "Отключить",
  },
  "Close and go back to your workflows": {
    uz: "Yopish va workflowlaringizga qaytish",
    ru: "Закрыть и вернуться к workflow",
  },
  "Close workflow": {
    uz: "Workflowni yopish",
    ru: "Закрыть workflow",
  },
  "Publish checks": {
    uz: "E'lon qilish tekshiruvlari",
    ru: "Проверки перед публикацией",
  },
  "This workflow can't be published yet": {
    uz: "Bu workflowni hali e'lon qilib bo'lmaydi",
    ru: "Этот workflow пока нельзя опубликовать",
  },
  "blocking ·": {
    uz: "to'sqinlik qilmoqda ·",
    ru: "блокирует ·",
  },
  "Close publish checks": {
    uz: "E'lon qilish tekshiruvlarini yopish",
    ru: "Закрыть проверки публикации",
  },
  "blocks selected": {
    uz: "ta blok tanlandi",
    ru: "блоков выбрано",
  },
  "Undo (⌘Z)": {
    uz: "Bekor qilish (⌘Z)",
    ru: "Отменить (⌘Z)",
  },
  "Redo (⇧⌘Z)": {
    uz: "Qaytarish (⇧⌘Z)",
    ru: "Повторить (⇧⌘Z)",
  },
  Redo: {
    uz: "Qaytarish",
    ru: "Повторить",
  },
  "Zoom out": {
    uz: "Kichiklashtirish",
    ru: "Уменьшить",
  },
  "Reset zoom to 100%": {
    uz: "Masshtabni 100% ga qaytarish",
    ru: "Сбросить масштаб до 100%",
  },
  "Reset zoom": {
    uz: "Masshtabni tiklash",
    ru: "Сбросить масштаб",
  },
  "Zoom in": {
    uz: "Kattalashtirish",
    ru: "Увеличить",
  },
  "Show how many conversations reached each step": {
    uz: "Har bir qadamga nechta suhbat yetib kelganini ko'rsatish",
    ru: "Показать, сколько диалогов дошло до каждого шага",
  },
  "Save this workflow to see its traffic.": {
    uz: "Trafikni ko'rish uchun bu workflowni saqlang.",
    ru: "Сохраните этот workflow, чтобы увидеть трафик.",
  },
  "Show traffic": {
    uz: "Trafikni ko'rsatish",
    ru: "Показать трафик",
  },
  "Replay real conversations on this canvas": {
    uz: "Haqiqiy suhbatlarni shu kanvasda qayta ko'rish",
    ru: "Воспроизвести реальные диалоги на этом холсте",
  },
  "Save this workflow to replay conversations.": {
    uz: "Suhbatlarni qayta ko'rish uchun bu workflowni saqlang.",
    ru: "Сохраните этот workflow, чтобы воспроизводить диалоги.",
  },
  "Name and description": {
    uz: "Nomi va tavsifi",
    ru: "Название и описание",
  },
  "Switch workflow": {
    uz: "Workflowni almashtirish",
    ru: "Сменить workflow",
  },
  "Paste copied block": {
    uz: "Nusxalangan blokni joylashtirish",
    ru: "Вставить скопированный блок",
  },
  "Copy a block first": {
    uz: "Avval blokni nusxalang",
    ru: "Сначала скопируйте блок",
  },
  "Split block": {
    uz: "Blokni ajratish",
    ru: "Разделить блок",
  },
  "Block steps": {
    uz: "Blok qadamlari",
    ru: "Шаги блока",
  },
  "in this block": {
    uz: "bu blokda",
    ru: "в этом блоке",
  },
  "Move up": {
    uz: "Yuqoriga",
    ru: "Вверх",
  },
  "Move step up": {
    uz: "Qadamni yuqoriga surish",
    ru: "Переместить шаг вверх",
  },
  "Move down": {
    uz: "Pastga",
    ru: "Вниз",
  },
  "Move step down": {
    uz: "Qadamni pastga surish",
    ru: "Переместить шаг вниз",
  },
  "Move out of block": {
    uz: "Blokdan chiqarish",
    ru: "Вынести из блока",
  },
  "Move step out of block": {
    uz: "Qadamni blokdan chiqarish",
    ru: "Вынести шаг из блока",
  },
  "This message was set to be written by AI. Message steps only send the words you write, so right now it sends nothing. A Prompt step writes the reply with AI from your instructions.":
    {
      uz: "Bu xabar AI tomonidan yozilishi belgilangan. Xabar qadamlari faqat siz yozgan so'zlarni yuboradi, shuning uchun hozir u hech narsa yubormaydi. Prompt qadami esa ko'rsatmalaringiz asosida javobni AI bilan yozadi.",
      ru: "Это сообщение настроено на написание AI. Шаги «Сообщение» отправляют только написанный вами текст, поэтому сейчас ничего не отправляется. Шаг «Промпт» пишет ответ с помощью AI по вашим инструкциям.",
    },
  "Turn into a Prompt step": {
    uz: "Prompt qadamiga aylantirish",
    ru: "Превратить в шаг «Промпт»",
  },
  "Test this flow": {
    uz: "Bu oqimni sinash",
    ru: "Протестировать этот сценарий",
  },
  Variants: {
    uz: "Variantlar",
    ru: "Варианты",
  },
  "Add a variant": {
    uz: "Variant qo'shish",
    ru: "Добавить вариант",
  },
  "One alternate is picked at random each time this step runs.": {
    uz: "Bu qadam har safar ishlaganda variantlardan biri tasodifiy tanlanadi.",
    ru: "При каждом выполнении шага случайно выбирается один из вариантов.",
  },
  "Remove variant": {
    uz: "Variantni olib tashlash",
    ru: "Удалить вариант",
  },
  "Wait for user input": {
    uz: "Foydalanuvchi javobini kutish",
    ru: "Ждать ввода пользователя",
  },
  "Drop a PNG, JPG or GIF here": {
    uz: "PNG, JPG yoki GIF faylni shu yerga tashlang",
    ru: "Перетащите сюда PNG, JPG или GIF",
  },
  Browse: {
    uz: "Tanlash",
    ru: "Выбрать",
  },
  "Sent in the chat as a picture. Upload a PNG, JPG or GIF up to 5 MB, or link to one that is already online.":
    {
      uz: "Chatda rasm sifatida yuboriladi. 5 MB gacha PNG, JPG yoki GIF yuklang yoki internetdagi rasm havolasini qo'ying.",
      ru: "Отправляется в чат как картинка. Загрузите PNG, JPG или GIF до 5 МБ или дайте ссылку на изображение в интернете.",
    },
  "Uploaded card image": {
    uz: "Yuklangan karta rasmi",
    ru: "Загруженное изображение карточки",
  },
  "Untitled card": {
    uz: "Nomsiz karta",
    ru: "Карточка без названия",
  },
  "Enter description": {
    uz: "Tavsif kiriting",
    ru: "Введите описание",
  },
  "Card description": {
    uz: "Karta tavsifi",
    ru: "Описание карточки",
  },
  "Add a button": {
    uz: "Tugma qo'shish",
    ru: "Добавить кнопку",
  },
  "Optional. Each button gets its own path — drag from its port on the canvas to where it leads.":
    {
      uz: "Ixtiyoriy. Har bir tugmaning o'z yo'li bor — kanvasdagi ulagichidan u olib boradigan joyga sudrang.",
      ru: "Необязательно. У каждой кнопки свой путь — протяните от её порта на холсте туда, куда она ведёт.",
    },
  "Add one button for each answer a visitor can tap. Each gets its own path.": {
    uz: "Tashrif buyuruvchi bosishi mumkin bo'lgan har bir javob uchun bitta tugma qo'shing. Har birining o'z yo'li bor.",
    ru: "Добавьте по кнопке на каждый ответ, который может выбрать посетитель. У каждой — свой путь.",
  },
  "Question (optional)": {
    uz: "Savol (ixtiyoriy)",
    ru: "Вопрос (необязательно)",
  },
  "Ask the visitor to choose": {
    uz: "Tashrif buyuruvchidan tanlashni so'rang",
    ru: "Попросите посетителя выбрать",
  },
  "Choice question": {
    uz: "Tanlov savoli",
    ru: "Вопрос с выбором",
  },
  Choices: {
    uz: "Variantlar",
    ru: "Варианты",
  },
  "Add a choice": {
    uz: "Variant qo'shish",
    ru: "Добавить вариант",
  },
  "The visitor's reply is matched against these. Each gets its own path.": {
    uz: "Tashrif buyuruvchining javobi shular bilan solishtiriladi. Har birining o'z yo'li bor.",
    ru: "Ответ посетителя сравнивается с этими вариантами. У каждого — свой путь.",
  },
  "Save the answer to": {
    uz: "Javobni saqlash joyi",
    ru: "Сохранить ответ в",
  },
  "Ask the visitor for something": {
    uz: "Tashrif buyuruvchidan biror narsani so'rang",
    ru: "Спросите что-нибудь у посетителя",
  },
  "Capture question": {
    uz: "Savol matni",
    ru: "Вопрос для ввода",
  },
  "Save the reply to": {
    uz: "Javobni saqlash joyi",
    ru: "Сохранить ответ в",
  },
  "The AI sees the visitor's latest message and this flow's variables.": {
    uz: "AI tashrif buyuruvchining oxirgi xabarini va bu oqimdagi o'zgaruvchilarni ko'radi.",
    ru: "AI видит последнее сообщение посетителя и переменные этого сценария.",
  },
  "Write a short, friendly reply that…": {
    uz: "Qisqa va samimiy javob yozing…",
    ru: "Напиши короткий дружелюбный ответ, который…",
  },
  "Use knowledge base": {
    uz: "Bilim bazasidan foydalanish",
    ru: "Использовать базу знаний",
  },
  "Answer from the sources you added.": {
    uz: "Siz qo'shgan manbalar asosida javob berish.",
    ru: "Отвечать по добавленным вами источникам.",
  },
  "Search for": {
    uz: "Qidirish",
    ru: "Искать",
  },
  "Send the answer in the chat": {
    uz: "Javobni chatda yuborish",
    ru: "Отправить ответ в чат",
  },
  "Remove assignment": {
    uz: "Belgilashni olib tashlash",
    ru: "Удалить присваивание",
  },
  "e.g. orderNumber": {
    uz: "masalan, orderNumber",
    ru: "например, orderNumber",
  },
  "value or {{other}}": {
    uz: "qiymat yoki {{other}}",
    ru: "значение или {{other}}",
  },
  "Variables to set": {
    uz: "O'rnatiladigan o'zgaruvchilar",
    ru: "Переменные для записи",
  },
  "Add a variable": {
    uz: "O'zgaruvchi qo'shish",
    ru: "Добавить переменную",
  },
  "Nothing is written when this step runs.": {
    uz: "Bu qadam ishlaganda hech narsa yozilmaydi.",
    ru: "При выполнении этого шага ничего не записывается.",
  },
  "Properties to set": {
    uz: "O'rnatiladigan xususiyatlar",
    ru: "Свойства для записи",
  },
  "Add a property": {
    uz: "Xususiyat qo'shish",
    ru: "Добавить свойство",
  },
  "Properties persist on the contact, not just this run.": {
    uz: "Xususiyatlar faqat shu ishga tushirishda emas, kontaktda saqlanib qoladi.",
    ru: "Свойства сохраняются в контакте, а не только в этом запуске.",
  },
  "Add a path": {
    uz: "Yo'l qo'shish",
    ru: "Добавить путь",
  },
  "Without a path this step has no way out.": {
    uz: "Yo'lsiz bu qadamdan chiqish imkoni yo'q.",
    ru: "Без пути у этого шага нет выхода.",
  },
  "Remove path": {
    uz: "Yo'lni olib tashlash",
    ru: "Удалить путь",
  },
  "Remove condition": {
    uz: "Shartni olib tashlash",
    ru: "Удалить условие",
  },
  "is not": {
    uz: "teng emas",
    ru: "не равно",
  },
  "does not contain": {
    uz: "o'z ichiga olmaydi",
    ru: "не содержит",
  },
  "greater than": {
    uz: "katta",
    ru: "больше",
  },
  "less than": {
    uz: "kichik",
    ru: "меньше",
  },
  "does not exist": {
    uz: "mavjud emas",
    ru: "не существует",
  },
  "Add a condition": {
    uz: "Shart qo'shish",
    ru: "Добавить условие",
  },
  "Else path": {
    uz: "Aks holda yo'li",
    ru: "Путь «Иначе»",
  },
  "Taken when no path above matched.": {
    uz: "Yuqoridagi hech bir yo'l mos kelmaganda tanlanadi.",
    ru: "Выбирается, если ни один путь выше не подошёл.",
  },
  "Save the whole reply to": {
    uz: "To'liq javobni saqlash joyi",
    ru: "Сохранить весь ответ в",
  },
  Provider: {
    uz: "Provayder",
    ru: "Провайдер",
  },
  "Select a provider": {
    uz: "Provayderni tanlang",
    ru: "Выберите провайдера",
  },
  "Tool to run": {
    uz: "Ishga tushiriladigan vosita",
    ru: "Инструмент для запуска",
  },
  "Select a tool": {
    uz: "Vositani tanlang",
    ru: "Выберите инструмент",
  },
  "No tools yet. Set one up once in Assistant tools and every workflow can run it.":
    {
      uz: "Hali vositalar yo'q. Yordamchi vositalari bo'limida bir marta sozlang — keyin har bir workflow undan foydalana oladi.",
      ru: "Инструментов пока нет. Настройте один раз в «Инструментах ассистента», и любой workflow сможет его запускать.",
    },
  "Save the result to": {
    uz: "Natijani saqlash joyi",
    ru: "Сохранить результат в",
  },
  "No MCP tools yet. Connect an MCP server in Assistant tools to run its tools from here.":
    {
      uz: "Hali MCP vositalari yo'q. Bu yerdan vositalarini ishga tushirish uchun Yordamchi vositalari bo'limida MCP serverni ulang.",
      ru: "MCP-инструментов пока нет. Подключите MCP-сервер в «Инструментах ассистента», чтобы запускать его инструменты отсюда.",
    },
  "Goodbye message (optional)": {
    uz: "Xayrlashuv xabari (ixtiyoriy)",
    ru: "Прощальное сообщение (необязательно)",
  },
  "Sent just before the conversation closes.": {
    uz: "Suhbat yopilishidan oldin yuboriladi.",
    ru: "Отправляется перед закрытием диалога.",
  },
  "Goodbye message": {
    uz: "Xayrlashuv xabari",
    ru: "Прощальное сообщение",
  },
  "Thanks for chatting with us!": {
    uz: "Biz bilan suhbatlashganingiz uchun rahmat!",
    ru: "Спасибо, что пообщались с нами!",
  },
  "Workflow to run": {
    uz: "Ishga tushiriladigan workflow",
    ru: "Workflow для запуска",
  },
  "Select a workflow…": {
    uz: "Workflowni tanlang…",
    ru: "Выберите workflow…",
  },
  "(not published)": {
    uz: "(e'lon qilinmagan)",
    ru: "(не опубликован)",
  },
  "Loading workflows…": {
    uz: "Workflowlar yuklanmoqda…",
    ru: "Загрузка workflow…",
  },
  "Save another workflow first, then run it from here.": {
    uz: "Avval boshqa workflowni saqlang, so'ng uni shu yerdan ishga tushiring.",
    ru: "Сначала сохраните другой workflow, затем запускайте его отсюда.",
  },
  "has never been published, so there is no version of it to run yet. Publishing it here keeps your live workflow as it is.":
    {
      uz: "hali hech qachon e'lon qilinmagan, shuning uchun uning ishga tushiriladigan versiyasi yo'q. Uni shu yerdan e'lon qilsangiz, jonli workflowingiz o'zgarmaydi.",
      ru: "ещё ни разу не публиковался, поэтому запускать пока нечего. Публикация отсюда не изменит ваш активный workflow.",
    },
  "Publish it for reuse": {
    uz: "Qayta foydalanish uchun e'lon qilish",
    ru: "Опубликовать для повторного использования",
  },
  Inputs: {
    uz: "Kiruvchi qiymatlar",
    ru: "Входные данные",
  },
  "Add an input": {
    uz: "Kiruvchi qiymat qo'shish",
    ru: "Добавить входное значение",
  },
  "Set variables before it runs, e.g. hand over an order number.": {
    uz: "Ishga tushishdan oldin o'zgaruvchilarni o'rnating, masalan, buyurtma raqamini uzating.",
    ru: "Задайте переменные перед запуском, например передайте номер заказа.",
  },
  "Remove input": {
    uz: "Kiruvchi qiymatni olib tashlash",
    ru: "Удалить входное значение",
  },
  "value or {{variable}}": {
    uz: "qiymat yoki {{variable}}",
    ru: "значение или {{variable}}",
  },
  "It shares this conversation's variables, so anything it sets can be used after it returns. Workflows nest up to 5 deep and can't run themselves.":
    {
      uz: "U shu suhbatning o'zgaruvchilaridan foydalanadi, shuning uchun u o'rnatgan qiymatlarni qaytgandan keyin ham ishlatish mumkin. Workflowlar 5 darajagacha ichma-ich bo'lishi mumkin va o'zini o'zi ishga tushira olmaydi.",
      ru: "Он использует переменные этого диалога, поэтому всё, что он запишет, доступно после возврата. Workflow вкладываются до 5 уровней и не могут запускать сами себя.",
    },
  "Select a tool…": {
    uz: "Vositani tanlang…",
    ru: "Выберите инструмент…",
  },
  "(turned off)": {
    uz: "(o'chirilgan)",
    ru: "(выключен)",
  },
  "Loading tools…": {
    uz: "Vositalar yuklanmoqda…",
    ru: "Загрузка инструментов…",
  },
  "No tools yet. Create one under Assistant tools, then pick it here.": {
    uz: "Hali vositalar yo'q. Yordamchi vositalari bo'limida yarating, so'ng shu yerda tanlang.",
    ru: "Инструментов пока нет. Создайте его в «Инструментах ассистента», затем выберите здесь.",
  },
  "What to send it": {
    uz: "Unga nima yuborish kerak",
    ru: "Что ему отправить",
  },
  "Function code": {
    uz: "Funksiya kodi",
    ru: "Код функции",
  },
  "Runs on our servers with a 2-second limit. Return": {
    uz: "Serverlarimizda 2 soniya cheklov bilan ishlaydi. Yo'lni tanlash va o'zgaruvchilarni o'rnatish uchun qaytaring:",
    ru: "Выполняется на наших серверах с лимитом 2 секунды. Верните",
  },
  'to pick a path and set variables. An unknown path falls back to the first one; an error takes a path named "error" if there is one.':
    {
      uz: ". Noma'lum yo'l birinchisiga qaytadi; xato bo'lsa, \"error\" nomli yo'l mavjud bo'lsa, o'shanga o'tiladi.",
      ru: "чтобы выбрать путь и задать переменные. Неизвестный путь заменяется первым; при ошибке выбирается путь «error», если он есть.",
    },
  "Name a path for each result the code can return.": {
    uz: "Kod qaytarishi mumkin bo'lgan har bir natija uchun yo'lni nomlang.",
    ru: "Назовите путь для каждого результата, который может вернуть код.",
  },
  "Wait for a reply and save all of it.": {
    uz: "Javobni kutib, uni to'liq saqlash.",
    ru: "Дождаться ответа и сохранить его целиком.",
  },
  "Add a card": {
    uz: "Karta qo'shish",
    ru: "Добавить карточку",
  },
  "Add the cards a visitor can swipe through.": {
    uz: "Tashrif buyuruvchi varaqlay oladigan kartalarni qo'shing.",
    ru: "Добавьте карточки, которые посетитель сможет пролистывать.",
  },
  "Action name": {
    uz: "Harakat nomi",
    ru: "Название действия",
  },
  "Details sent with it (JSON)": {
    uz: "U bilan yuboriladigan ma'lumotlar (JSON)",
    ru: "Данные, отправляемые с ним (JSON)",
  },
  "Details sent with the action": {
    uz: "Harakat bilan yuboriladigan ma'lumotlar",
    ru: "Данные, отправляемые с действием",
  },
  'Live conversations send this to your webhook as a "workflow.action" event. Test runs only record it, so nothing fires from the builder.':
    {
      uz: 'Jonli suhbatlar buni webhookingizga "workflow.action" hodisasi sifatida yuboradi. Test ishga tushirishlar faqat qayd etadi, shuning uchun konstruktordan hech narsa yuborilmaydi.',
      ru: "Реальные диалоги отправляют это на ваш вебхук как событие «workflow.action». Тестовые запуски только записывают его, поэтому из конструктора ничего не отправляется.",
    },
  "Runs on our servers with a 2-second limit and no network or file access. Read and change this flow's variables through":
    {
      uz: "Serverlarimizda 2 soniya cheklov bilan, tarmoq va fayllarga kirishsiz ishlaydi. Bu oqimning o'zgaruvchilarini quyidagi orqali o'qing va o'zgartiring:",
      ru: "Выполняется на наших серверах с лимитом 2 секунды, без доступа к сети и файлам. Читайте и меняйте переменные сценария через",
    },
  ", or return an object of values to set.": {
    uz: ", yoki o'rnatiladigan qiymatlar obyektini qaytaring.",
    ru: "или верните объект со значениями для записи.",
  },
  "Variables it sets": {
    uz: "U o'rnatadigan o'zgaruvchilar",
    ru: "Переменные, которые он задаёт",
  },
  "Naming them lets later steps pick them from the variable list.": {
    uz: "Ularni nomlasangiz, keyingi qadamlar ularni o'zgaruvchilar ro'yxatidan tanlay oladi.",
    ru: "Если назвать их, следующие шаги смогут выбрать их из списка переменных.",
  },
  "e.g. parcelState, parcelTitle": {
    uz: "masalan, parcelState, parcelTitle",
    ru: "например, parcelState, parcelTitle",
  },
  "With no named paths the code leaves through ok or error.": {
    uz: "Nomlangan yo'llar bo'lmasa, kod ok yoki error orqali chiqadi.",
    ru: "Без именованных путей код выходит через ok или error.",
  },
  "Error path": {
    uz: "Xato yo'li",
    ru: "Путь ошибки",
  },
  "Taken when the code throws.": {
    uz: "Kod xato chiqarganda tanlanadi.",
    ru: "Выбирается, если код выбросил ошибку.",
  },
  Request: {
    uz: "So'rov",
    ru: "Запрос",
  },
  Method: {
    uz: "Usul",
    ru: "Метод",
  },
  "Request URL": {
    uz: "So'rov URL manzili",
    ru: "URL запроса",
  },
  Headers: {
    uz: "Sarlavhalar",
    ru: "Заголовки",
  },
  "Add a header": {
    uz: "Sarlavha qo'shish",
    ru: "Добавить заголовок",
  },
  "Sent with the request, e.g. Authorization.": {
    uz: "So'rov bilan yuboriladi, masalan, Authorization.",
    ru: "Отправляется с запросом, например Authorization.",
  },
  "Remove header": {
    uz: "Sarlavhani olib tashlash",
    ru: "Удалить заголовок",
  },
  Body: {
    uz: "Tana",
    ru: "Тело",
  },
  "Request body": {
    uz: "So'rov tanasi",
    ru: "Тело запроса",
  },
  "Save the response to": {
    uz: "Javobni saqlash joyi",
    ru: "Сохранить ответ в",
  },
  "Save the status code to": {
    uz: "Holat kodini saqlash joyi",
    ru: "Сохранить код статуса в",
  },
  "JSON responses are flattened, so a later step can read": {
    uz: "JSON javoblar tekislanadi, shuning uchun keyingi qadam quyidagini o'qiy oladi:",
    ru: "JSON-ответы разворачиваются, поэтому следующий шаг может прочитать",
  },
  "Message before handing over": {
    uz: "Uzatishdan oldingi xabar",
    ru: "Сообщение перед передачей",
  },
  "The conversation then moves to your team's inbox, where someone can reply.":
    {
      uz: "Shundan so'ng suhbat jamoangizning Inbox bo'limiga o'tadi va kimdir javob bera oladi.",
      ru: "После этого диалог попадёт во входящие вашей команды, где кто-нибудь сможет ответить.",
    },
  "One moment, a teammate will reply here.": {
    uz: "Bir daqiqa, jamoamiz a'zosi shu yerda javob beradi.",
    ru: "Минутку, сотрудник ответит здесь.",
  },
  Label: {
    uz: "Yorliq",
    ru: "Метка",
  },
  "Copy this step's reference — support can use it to find the step": {
    uz: "Bu qadam havolasini nusxalang — qo'llab-quvvatlash xizmati u orqali qadamni topa oladi",
    ru: "Скопируйте ссылку на шаг — по ней поддержка сможет найти этот шаг",
  },
  "Copy step reference": {
    uz: "Qadam havolasini nusxalash",
    ru: "Копировать ссылку на шаг",
  },
  "Your workflows": {
    uz: "Workflowlaringiz",
    ru: "Ваши workflow",
  },
  "About this workflow": {
    uz: "Bu workflow haqida",
    ru: "Об этом workflow",
  },
  "Open another workflow without leaving the builder.": {
    uz: "Konstruktordan chiqmasdan boshqa workflowni oching.",
    ru: "Откройте другой workflow, не выходя из конструктора.",
  },
  "Only your team sees this. Visitors never do.": {
    uz: "Buni faqat jamoangiz ko'radi. Tashrif buyuruvchilar ko'rmaydi.",
    ru: "Это видит только ваша команда. Посетители — никогда.",
  },
  "Nothing saved yet. This workflow is saved as soon as you add its first step.":
    {
      uz: "Hali hech narsa saqlanmagan. Birinchi qadamni qo'shishingiz bilan bu workflow saqlanadi.",
      ru: "Пока ничего не сохранено. Workflow сохранится, как только вы добавите первый шаг.",
    },
  "No description": {
    uz: "Tavsif yo'q",
    ru: "Нет описания",
  },
  "Run a connected provider tool.": {
    uz: "Ulangan provayder vositasini ishga tushirish.",
    ru: "Запустить инструмент подключённого провайдера.",
  },
  "A note for your team about what this workflow handles.": {
    uz: "Bu workflow nimalar bilan shug'ullanishi haqida jamoangiz uchun eslatma.",
    ru: "Заметка для команды о том, что делает этот workflow.",
  },
  "e.g. Answers delivery questions and takes returns.": {
    uz: "masalan, Yetkazib berish savollariga javob beradi va qaytarishlarni qabul qiladi.",
    ru: "например, Отвечает на вопросы о доставке и принимает возвраты.",
  },
  "Call a tool on an MCP server.": {
    uz: "MCP serverdagi vositani chaqirish.",
    ru: "Вызвать инструмент на MCP-сервере.",
  },
  "Workflow renamed": {
    uz: "Workflow nomi o'zgartirildi",
    ru: "Workflow переименован",
  },
  "Could not rename that workflow.": {
    uz: "Bu workflow nomini o'zgartirib bo'lmadi.",
    ru: "Не удалось переименовать этот workflow.",
  },
  "Could not duplicate that workflow.": {
    uz: "Bu workflowni nusxalab bo'lmadi.",
    ru: "Не удалось дублировать этот workflow.",
  },
  "Could not take that workflow offline.": {
    uz: "Bu workflowni faolsizlantirib bo'lmadi.",
    ru: "Не удалось отключить этот workflow.",
  },
  "Could not delete that workflow.": {
    uz: "Bu workflowni o'chirib bo'lmadi.",
    ru: "Не удалось удалить этот workflow.",
  },
  "Filter workflows": {
    uz: "Workflowlarni filtrlash",
    ru: "Фильтр workflow",
  },
  "Take offline to delete": {
    uz: "O'chirish uchun avval faolsizlantiring",
    ru: "Отключите, чтобы удалить",
  },
  "No workflow is live right now.": {
    uz: "Hozir hech bir workflow jonli emas.",
    ru: "Сейчас нет активных workflow.",
  },
  "No published workflow is waiting on the side.": {
    uz: "Kutib turgan e'lon qilingan workflow yo'q.",
    ru: "Нет опубликованных workflow в резерве.",
  },
  "No drafts — everything here has been published.": {
    uz: "Qoralamalar yo'q — bu yerdagi hammasi e'lon qilingan.",
    ru: "Черновиков нет — всё опубликовано.",
  },
  "Show all": {
    uz: "Hammasini ko'rsatish",
    ru: "Показать все",
  },
  "Rename workflow": {
    uz: "Workflow nomini o'zgartirish",
    ru: "Переименовать workflow",
  },
  "Only your team sees this name. Visitors never do.": {
    uz: "Bu nomni faqat jamoangiz ko'radi. Tashrif buyuruvchilar ko'rmaydi.",
    ru: "Это название видит только ваша команда. Посетители — никогда.",
  },
  "Workflow name": {
    uz: "Workflow nomi",
    ru: "Название workflow",
  },
  "This removes the workflow with its replays and traffic numbers. Conversations it already had stay in your inbox. It cannot be undone.":
    {
      uz: "Bu workflow qayta ko'rishlari va trafik raqamlari bilan birga o'chiriladi. U olib borgan suhbatlar Inbox'da qoladi. Buni ortga qaytarib bo'lmaydi.",
      ru: "Workflow будет удалён вместе с повторами и статистикой трафика. Его прошлые диалоги останутся во входящих. Это действие нельзя отменить.",
    },
  "Answering new conversations": {
    uz: "Yangi suhbatlarga javob bermoqda",
    ru: "Отвечает на новые диалоги",
  },
  "Ready, not answering": {
    uz: "Tayyor, javob bermayapti",
    ru: "Готов, не отвечает",
  },
  "Not published yet": {
    uz: "Hali e'lon qilinmagan",
    ru: "Ещё не опубликован",
  },
  Drafts: {
    uz: "Qoralamalar",
    ru: "Черновики",
  },
  "Look up orders, customers and products.": {
    uz: "Buyurtmalar, mijozlar va mahsulotlarni topish.",
    ru: "Поиск заказов, клиентов и товаров.",
  },
  "No Shopify integration yet.": {
    uz: "Hali Shopify integratsiyasi yo'q.",
    ru: "Интеграции с Shopify пока нет.",
  },
  "Send mail from a connected mailbox.": {
    uz: "Ulangan pochta qutisidan xat yuborish.",
    ru: "Отправлять письма из подключённого ящика.",
  },
  "No Gmail integration yet.": {
    uz: "Hali Gmail integratsiyasi yo'q.",
    ru: "Интеграции с Gmail пока нет.",
  },
  "Read and write Airtable bases.": {
    uz: "Airtable bazalarini o'qish va yozish.",
    ru: "Чтение и запись баз Airtable.",
  },
  "No Airtable integration yet.": {
    uz: "Hali Airtable integratsiyasi yo'q.",
    ru: "Интеграции с Airtable пока нет.",
  },
  "Trigger a Make scenario.": {
    uz: "Make ssenariysini ishga tushirish.",
    ru: "Запустить сценарий Make.",
  },
  "No Make integration yet.": {
    uz: "Hali Make integratsiyasi yo'q.",
    ru: "Интеграции с Make пока нет.",
  },
  "Send SMS or place a call.": {
    uz: "SMS yuborish yoki qo'ng'iroq qilish.",
    ru: "Отправить SMS или позвонить.",
  },
  "No Twilio integration yet.": {
    uz: "Hali Twilio integratsiyasi yo'q.",
    ru: "Интеграции с Twilio пока нет.",
  },
  "Read and write Hubspot contacts and deals.": {
    uz: "HubSpot kontaktlari va bitimlarini o'qish va yozish.",
    ru: "Чтение и запись контактов и сделок HubSpot.",
  },
  "No Hubspot integration yet.": {
    uz: "Hali HubSpot integratsiyasi yo'q.",
    ru: "Интеграции с HubSpot пока нет.",
  },
  "Ground each reply in the organization’s indexed documents.": {
    uz: "Har bir javobni tashkilotning indekslangan hujjatlariga asoslash.",
    ru: "Опирать каждый ответ на проиндексированные документы организации.",
  },
  "Let the agent offer quick replies instead of free text.": {
    uz: "Agentga erkin matn o'rniga tezkor javoblarni taklif qilishga ruxsat berish.",
    ru: "Разрешить агенту предлагать быстрые ответы вместо свободного текста.",
  },
  "Let the agent answer with a titled card.": {
    uz: "Agentga sarlavhali karta bilan javob berishga ruxsat berish.",
    ru: "Разрешить агенту отвечать карточкой с заголовком.",
  },
  Carousels: {
    uz: "Karusellar",
    ru: "Карусели",
  },
  "Let the agent answer with a row of cards.": {
    uz: "Agentga kartalar qatori bilan javob berishga ruxsat berish.",
    ru: "Разрешить агенту отвечать рядом карточек.",
  },
  "Let the agent hand the conversation to a human.": {
    uz: "Agentga suhbatni xodimga uzatishga ruxsat berish.",
    ru: "Разрешить агенту передавать диалог человеку.",
  },
  "Web search": {
    uz: "Internetdan qidirish",
    ru: "Веб-поиск",
  },
  "Let the agent search the public web mid-turn.": {
    uz: "Agentga javob davomida ochiq internetdan qidirishga ruxsat berish.",
    ru: "Разрешить агенту искать в интернете во время ответа.",
  },
  "No web search provider is configured for this project.": {
    uz: "Bu loyiha uchun internet qidiruv provayderi sozlanmagan.",
    ru: "Для этого проекта не настроен провайдер веб-поиска.",
  },
  "Let the agent close the conversation when it is finished.": {
    uz: "Agentga ish tugagach suhbatni yopishga ruxsat berish.",
    ru: "Разрешить агенту закрыть диалог, когда работа завершена.",
  },
  "Appointment specialist": {
    uz: "Uchrashuvlar bo'yicha mutaxassis",
    ru: "Специалист по записи на приём",
  },
  "Information collector specialist": {
    uz: "Ma'lumot to'plovchi mutaxassis",
    ru: "Специалист по сбору данных",
  },
  "Lead qualification specialist": {
    uz: "Lidlarni baholash bo'yicha mutaxassis",
    ru: "Специалист по квалификации лидов",
  },
  "Call an HTTP endpoint and read the response back.": {
    uz: "HTTP endpointni chaqirib, javobni o'qish.",
    ru: "Вызвать HTTP-эндпоинт и прочитать ответ.",
  },
  "Look rows up, append them, or update a spreadsheet.": {
    uz: "Jadvaldan qatorlarni topish, qo'shish yoki yangilash.",
    ru: "Найти, добавить или обновить строки таблицы.",
  },
  "Create, look up, update, or cancel calendar events.": {
    uz: "Kalendar tadbirlarini yaratish, topish, yangilash yoki bekor qilish.",
    ru: "Создать, найти, изменить или отменить события календаря.",
  },
  "Run a sandboxed snippet the agent can call mid-turn.": {
    uz: "Agent javob davomida chaqira oladigan izolyatsiyalangan kod parchasini ishga tushirish.",
    ru: "Запустить изолированный фрагмент кода, который агент может вызвать во время ответа.",
  },
  "The JavaScript sandbox runs as its own step today, not as a tool the agent can call.":
    {
      uz: "JavaScript sandbox hozircha agent chaqiradigan vosita emas, alohida qadam sifatida ishlaydi.",
      ru: "Песочница JavaScript пока работает как отдельный шаг, а не как инструмент агента.",
    },
  "Connect an MCP server and expose its tools.": {
    uz: "MCP serverni ulash va uning vositalarini taqdim etish.",
    ru: "Подключить MCP-сервер и открыть его инструменты.",
  },
  "No MCP client yet.": {
    uz: "Hali MCP mijozi yo'q.",
    ru: "MCP-клиента пока нет.",
  },
  "Read and raise Zendesk tickets.": {
    uz: "Zendesk tiketlarini o'qish va yaratish.",
    ru: "Чтение и создание тикетов Zendesk.",
  },
  "No Zendesk integration yet.": {
    uz: "Hali Zendesk integratsiyasi yo'q.",
    ru: "Интеграции с Zendesk пока нет.",
  },
  "Read and write Salesforce records.": {
    uz: "Salesforce yozuvlarini o'qish va yozish.",
    ru: "Чтение и запись записей Salesforce.",
  },
  "No Salesforce integration yet.": {
    uz: "Hali Salesforce integratsiyasi yo'q.",
    ru: "Интеграции с Salesforce пока нет.",
  },
  Exit: {
    uz: "Chiqish",
    ru: "Выход",
  },
  "Empty block": {
    uz: "Bo'sh blok",
    ru: "Пустой блок",
  },
  "Untitled exit": {
    uz: "Nomsiz chiqish",
    ru: "Выход без названия",
  },
  "Built-in · the user’s most recent reply": {
    uz: "Ichki · foydalanuvchining oxirgi javobi",
    ru: "Встроенная · последний ответ пользователя",
  },
  "Built-in · the user’s most recent message": {
    uz: "Ichki · foydalanuvchining oxirgi xabari",
    ru: "Встроенная · последнее сообщение пользователя",
  },
  "Built-in · the last AI reply": {
    uz: "Ichki · oxirgi AI javobi",
    ru: "Встроенная · последний ответ AI",
  },
  "Built-in · id of the button just chosen": {
    uz: "Ichki · hozirgina tanlangan tugma ID'si",
    ru: "Встроенная · ID только что нажатой кнопки",
  },
  "Built-in · label of the button just chosen": {
    uz: "Ichki · hozirgina tanlangan tugma yorlig'i",
    ru: "Встроенная · текст только что нажатой кнопки",
  },
  "Open the agent editor to write its instructions.": {
    uz: "Ko'rsatmalarini yozish uchun agent muharririni oching.",
    ru: "Откройте редактор агента, чтобы написать инструкции.",
  },
  "Add a request URL.": {
    uz: "So'rov URL manzilini qo'shing.",
    ru: "Добавьте URL запроса.",
  },
  "Drop a step onto this block.": {
    uz: "Qadamni shu blokka tashlang.",
    ru: "Перетащите шаг в этот блок.",
  },
  "Waits for the user reply, then stores it.": {
    uz: "Foydalanuvchi javobini kutadi, so'ng uni saqlaydi.",
    ru: "Ждёт ответа пользователя и сохраняет его.",
  },
  Button: {
    uz: "Tugma",
    ru: "Кнопка",
  },
  "Add cards in the inspector.": {
    uz: "Kartalarni inspektorda qo'shing.",
    ru: "Добавьте карточки в инспекторе.",
  },
  "Add choices in the inspector.": {
    uz: "Variantlarni inspektorda qo'shing.",
    ru: "Добавьте варианты в инспекторе.",
  },
  "Saved workflow": {
    uz: "Saqlangan workflow",
    ru: "Сохранённый workflow",
  },
  "Pick a workflow in the inspector.": {
    uz: "Inspektorda workflowni tanlang.",
    ru: "Выберите workflow в инспекторе.",
  },
  "Add a conditional path.": {
    uz: "Shartli yo'l qo'shing.",
    ru: "Добавьте условный путь.",
  },
  "Sends a workflow.action webhook event.": {
    uz: "workflow.action webhook hodisasini yuboradi.",
    ru: "Отправляет вебхук-событие workflow.action.",
  },
  "Name this step": {
    uz: "Bu qadamni nomlang",
    ru: "Назовите этот шаг",
  },
  "Rename this step": {
    uz: "Qadam nomini o'zgartirish",
    ru: "Переименовать шаг",
  },
  "Step options": {
    uz: "Qadam sozlamalari",
    ru: "Параметры шага",
  },
  "Open step options": {
    uz: "Qadam sozlamalarini ochish",
    ru: "Открыть параметры шага",
  },
  "Click to name this step": {
    uz: "Bu qadamni nomlash uchun bosing",
    ru: "Нажмите, чтобы назвать шаг",
  },
  "Write a snippet in the inspector.": {
    uz: "Inspektorda kod parchasini yozing.",
    ru: "Напишите фрагмент кода в инспекторе.",
  },
  "Add at least one path.": {
    uz: "Kamida bitta yo'l qo'shing.",
    ru: "Добавьте хотя бы один путь.",
  },
  "Configure this step in the inspector.": {
    uz: "Bu qadamni inspektorda sozlang.",
    ru: "Настройте этот шаг в инспекторе.",
  },
  "Linked image or GIF": {
    uz: "Havola orqali rasm yoki GIF",
    ru: "Изображение или GIF по ссылке",
  },
  "Upload an image or GIF": {
    uz: "Rasm yoki GIF yuklash",
    ru: "Загрузить изображение или GIF",
  },
  "No integration tool selected": {
    uz: "Integratsiya vositasi tanlanmagan",
    ru: "Инструмент интеграции не выбран",
  },
  "Custom code": {
    uz: "Maxsus kod",
    ru: "Свой код",
  },
  "Add JavaScript": {
    uz: "JavaScript qo'shish",
    ru: "Добавить JavaScript",
  },
  "Open the editor full window": {
    uz: "Muharrirni to'liq oynada ochish",
    ru: "Открыть редактор на весь экран",
  },
  "Listen and save reply to:": {
    uz: "Tinglash va javobni saqlash joyi:",
    ru: "Слушать и сохранить ответ в:",
  },
  "No MCP tool selected": {
    uz: "MCP vositasi tanlanmagan",
    ru: "MCP-инструмент не выбран",
  },
  "Set variable": {
    uz: "O'zgaruvchi o'rnatish",
    ru: "Задать переменную",
  },
  "Empty snippet": {
    uz: "Bo'sh kod parchasi",
    ru: "Пустой фрагмент кода",
  },
  "No tool selected": {
    uz: "Vosita tanlanmagan",
    ru: "Инструмент не выбран",
  },
  "No workflow selected": {
    uz: "Workflow tanlanmagan",
    ru: "Workflow не выбран",
  },
  "Ends the conversation": {
    uz: "Suhbatni tugatadi",
    ru: "Завершает диалог",
  },
  "Hands over to your team": {
    uz: "Jamoangizga uzatadi",
    ru: "Передаёт вашей команде",
  },
  "Empty message": {
    uz: "Bo'sh xabar",
    ru: "Пустое сообщение",
  },
  "No instructions": {
    uz: "Ko'rsatmalar yo'q",
    ru: "Нет инструкций",
  },
  "No image": {
    uz: "Rasm yo'q",
    ru: "Нет изображения",
  },
  "No buttons": {
    uz: "Tugmalar yo'q",
    ru: "Нет кнопок",
  },
  "No choices": {
    uz: "Variantlar yo'q",
    ru: "Нет вариантов",
  },
  "No paths": {
    uz: "Yo'llar yo'q",
    ru: "Нет путей",
  },
  "Nothing set": {
    uz: "Hech narsa o'rnatilmagan",
    ru: "Ничего не задано",
  },
  "no URL": {
    uz: "URL yo'q",
    ru: "нет URL",
  },
  "Pick a tool in the inspector.": {
    uz: "Inspektorda vositani tanlang.",
    ru: "Выберите инструмент в инспекторе.",
  },
  "Could not read that website.": {
    uz: "Bu saytni o'qib bo'lmadi.",
    ru: "Не удалось прочитать этот сайт.",
  },
  "Could not write the setup.": {
    uz: "Sozlamalarni yozib bo'lmadi.",
    ru: "Не удалось подготовить настройки.",
  },
  "Could not save the setup.": {
    uz: "Sozlamalarni saqlab bo'lmadi.",
    ru: "Не удалось сохранить настройки.",
  },
  "Your website address": {
    uz: "Saytingiz manzili",
    ru: "Адрес вашего сайта",
  },
  "Reading your site": {
    uz: "Saytingiz o'qilmoqda",
    ru: "Читаем ваш сайт",
  },
  "Read my website": {
    uz: "Saytimni o'qish",
    ru: "Прочитать мой сайт",
  },
  "It reads up to 12 pages, following your sitemap where you have one. Nothing is changed on your site.":
    {
      uz: "U 12 tagacha sahifani o'qiydi, sayt xaritangiz bo'lsa, unga amal qiladi. Saytingizda hech narsa o'zgartirilmaydi.",
      ru: "Читает до 12 страниц, следуя карте сайта, если она есть. На вашем сайте ничего не меняется.",
    },
  "What it found": {
    uz: "Nimalar topildi",
    ru: "Что удалось найти",
  },
  Business: {
    uz: "Biznes",
    ru: "Бизнес",
  },
  Industry: {
    uz: "Soha",
    ru: "Отрасль",
  },
  Languages: {
    uz: "Tillar",
    ru: "Языки",
  },
  "Skip and write it anyway": {
    uz: "O'tkazib yuborib, baribir yozish",
    ru: "Пропустить и всё равно написать",
  },
  "Writing your setup": {
    uz: "Sozlamalaringiz yozilmoqda",
    ru: "Готовим ваши настройки",
  },
  "Write my setup": {
    uz: "Sozlamalarimni yozish",
    ru: "Подготовить мои настройки",
  },
  "Knowledge base —": {
    uz: "Bilim bazasi —",
    ru: "База знаний —",
  },
  "Nothing to add": {
    uz: "Qo'shadigan narsa yo'q",
    ru: "Нечего добавить",
  },
  "Chat window — name, greeting, colour and help articles": {
    uz: "Chat oynasi — nom, salomlashuv, rang va yordam maqolalari",
    ru: "Окно чата — имя, приветствие, цвет и справочные статьи",
  },
  "Assistant name “": {
    uz: "Yordamchi nomi “",
    ru: "Имя ассистента «",
  },
  "help topics. Saved as a draft.": {
    uz: "yordam mavzulari. Qoralama sifatida saqlandi.",
    ru: "справочных тем. Сохранено как черновик.",
  },
  "Turn on the built-in tools": {
    uz: "Ichki vositalarni yoqish",
    ru: "Включить встроенные инструменты",
  },
  "Knowledge base search, hand over to a human, and mark resolved.": {
    uz: "Bilim bazasidan qidirish, xodimga uzatish va hal qilingan deb belgilash.",
    ru: "Поиск по базе знаний, передача человеку и отметка «решено».",
  },
  "The greeting it wrote": {
    uz: "U yozgan salomlashuv",
    ru: "Приветствие, которое он написал",
  },
  "Its instructions": {
    uz: "Uning ko'rsatmalari",
    ru: "Его инструкции",
  },
  "Worth setting up next": {
    uz: "Keyingi sozlashga arziydi",
    ru: "Стоит настроить дальше",
  },
  "These need a spreadsheet or a web address only you have, so they are suggestions rather than something it can switch on for you.":
    {
      uz: "Bular uchun faqat sizda bor jadval yoki veb-manzil kerak, shuning uchun ular siz uchun yoqib qo'yiladigan narsa emas, balki takliflardir.",
      ru: "Для них нужна таблица или веб-адрес, которые есть только у вас, поэтому это предложения, а не то, что можно включить за вас.",
    },
  "Open Assistant tools": {
    uz: "Yordamchi vositalarini ochish",
    ru: "Открыть «Инструменты ассистента»",
  },
  Saving: {
    uz: "Saqlanmoqda",
    ru: "Сохранение",
  },
  "Save to my draft": {
    uz: "Qoralamamga saqlash",
    ru: "Сохранить в черновик",
  },
  "Your knowledge base and chat window draft are ready. Publishing is still yours to do — open the designer, look it over, and publish when it reads the way you want.":
    {
      uz: "Bilim bazangiz va chat oynasi qoralamasi tayyor. E'lon qilish sizning qo'lingizda — dizaynerni oching, ko'zdan kechiring va o'zingiz xohlagandek bo'lganda e'lon qiling.",
      ru: "База знаний и черновик окна чата готовы. Публикация остаётся за вами — откройте дизайнер, проверьте и опубликуйте, когда всё будет как нужно.",
    },
  "Open the designer": {
    uz: "Dizaynerni ochish",
    ru: "Открыть дизайнер",
  },
  "See the knowledge base": {
    uz: "Bilim bazasini ko'rish",
    ru: "Посмотреть базу знаний",
  },
  "Point it at your website": {
    uz: "Uni saytingizga yo'naltiring",
    ru: "Укажите ваш сайт",
  },
  "It reads your pages the way a customer would, and works out what your business does.":
    {
      uz: "U sahifalaringizni mijoz kabi o'qiydi va biznesingiz nima bilan shug'ullanishini tushunib oladi.",
      ru: "Он читает ваши страницы глазами клиента и понимает, чем занимается ваш бизнес.",
    },
  "A few questions": {
    uz: "Bir nechta savol",
    ru: "Несколько вопросов",
  },
  "Fill in what your website doesn't say": {
    uz: "Saytingizda yozilmagan narsalarni to'ldiring",
    ru: "Заполните то, чего нет на сайте",
  },
  "These are the things it could not find but customers ask about constantly. Skip any you would rather answer later.":
    {
      uz: "Bular u topa olmagan, lekin mijozlar doim so'raydigan narsalar. Keyinroq javob bermoqchi bo'lganlarini o'tkazib yuboring.",
      ru: "Это то, что не удалось найти, но о чём клиенты постоянно спрашивают. Пропустите то, на что хотите ответить позже.",
    },
  "Check it over": {
    uz: "Tekshirib chiqing",
    ru: "Проверьте",
  },
  "Here is what it wrote": {
    uz: "Mana u nima yozdi",
    ru: "Вот что получилось",
  },
  "Nothing is live yet. Choose what to keep, and it goes into your draft for you to publish when you are happy.":
    {
      uz: "Hali hech narsa jonli emas. Nimani saqlashni tanlang — u qoralamangizga tushadi va tayyor bo'lganingizda e'lon qilasiz.",
      ru: "Пока ничего не опубликовано. Выберите, что оставить, — это попадёт в черновик, и вы опубликуете, когда будете довольны.",
    },
  "Saved to your draft": {
    uz: "Qoralamangizga saqlandi",
    ru: "Сохранено в черновик",
  },
  "Review it in the designer, then publish when it looks right.": {
    uz: "Dizaynerda ko'rib chiqing, so'ng to'g'ri ko'rinsa, e'lon qiling.",
    ru: "Проверьте в дизайнере и опубликуйте, когда всё будет в порядке.",
  },
  "n8n workflow": {
    uz: "n8n workflow",
    ru: "n8n workflow",
  },
  "Call a workflow on your own n8n instance — self-hosted automation, no third party in the path.":
    {
      uz: "O'zingizning n8n serveringizdagi workflowni chaqirish — o'z serveringizdagi avtomatlashtirish, orada uchinchi tomon yo'q.",
      ru: "Вызвать workflow на вашем n8n — автоматизация на своём сервере, без посредников.",
    },
  "Self-hosted": {
    uz: "O'z serveringizda",
    ru: "На своём сервере",
  },
  "Works against self-hosted n8n as long as the endpoint is reachable over https.":
    {
      uz: "Endpoint https orqali ochiq bo'lsa, o'z serveringizdagi n8n bilan ishlaydi.",
      ru: "Работает с n8n на своём сервере, если эндпоинт доступен по https.",
    },
  "Add a header credential in n8n and the same header here to authenticate the call.":
    {
      uz: "Chaqiruvni tasdiqlash uchun n8n'da sarlavha ma'lumotini qo'shing va shu yerga ham xuddi shu sarlavhani kiriting.",
      ru: "Добавьте в n8n учётные данные заголовка и тот же заголовок здесь, чтобы авторизовать вызов.",
    },
  "Workflow header credential": {
    uz: "Workflow sarlavha ma'lumoti",
    ru: "Учётные данные заголовка workflow",
  },
  "Optional — set a header auth credential on the n8n webhook node.": {
    uz: "Ixtiyoriy — n8n webhook tugunida sarlavha orqali tasdiqlashni o'rnating.",
    ru: "Необязательно — задайте авторизацию по заголовку на узле вебхука n8n.",
  },
  "Use the production webhook URL, not the test one — test URLs stop listening.":
    {
      uz: "Test URL emas, production webhook URL manzilidan foydalaning — test URL'lar tinglashni to'xtatadi.",
      ru: "Используйте рабочий URL вебхука, а не тестовый — тестовые URL перестают слушать.",
    },
  "Run the n8n workflow that handles this request.": {
    uz: "Bu so'rovni bajaradigan n8n workflowni ishga tushirish.",
    ru: "Запустить workflow n8n, который обрабатывает этот запрос.",
  },
  "Any id the workflow needs to act on.": {
    uz: "Workflow ishlashi uchun kerak bo'lgan har qanday ID.",
    ru: "Любой ID, нужный workflow.",
  },
  "Pipedream workflow": {
    uz: "Pipedream workflow",
    ru: "Workflow Pipedream",
  },
  "Trigger a code-first workflow when the logic is more than a no-code branch can hold.":
    {
      uz: "Mantiq kodsiz tarmoqqa sig'maydigan darajada murakkab bo'lsa, kodga asoslangan workflowni ishga tushirish.",
      ru: "Запустить workflow на коде, когда логика сложнее, чем умещается в no-code ветку.",
    },
  "HTTP trigger": {
    uz: "HTTP trigger",
    ru: "HTTP-триггер",
  },
  "Full Node.js or Python in the workflow, so the transformation happens outside the prompt.":
    {
      uz: "Workflow ichida to'liq Node.js yoki Python, shuning uchun ma'lumotlarni qayta ishlash promptdan tashqarida bo'ladi.",
      ru: "Полноценный Node.js или Python внутри workflow, поэтому преобразования происходят вне промпта.",
    },
  "Per-workflow URLs make it easy to retire one integration without touching the others.":
    {
      uz: "Har bir workflow uchun alohida URL bitta integratsiyani boshqalariga tegmasdan o'chirishni osonlashtiradi.",
      ru: "Отдельные URL для каждого workflow позволяют отключить одну интеграцию, не трогая остальные.",
    },
  "Workflow trigger URL": {
    uz: "Workflow trigger URL manzili",
    ru: "URL триггера workflow",
  },
  "Each workflow gets its own endpoint.": {
    uz: "Har bir workflow o'z endpointiga ega.",
    ru: "У каждого workflow свой эндпоинт.",
  },
  "Use the workflow's HTTP trigger URL from the Pipedream editor.": {
    uz: "Pipedream muharriridagi workflowning HTTP trigger URL manzilidan foydalaning.",
    ru: "Используйте URL HTTP-триггера workflow из редактора Pipedream.",
  },
  "Trigger the Pipedream workflow for this request.": {
    uz: "Bu so'rov uchun Pipedream workflowni ishga tushirish.",
    ru: "Запустить workflow Pipedream для этого запроса.",
  },
  "Any extra JSON-encoded context the workflow expects.": {
    uz: "Workflow kutadigan qo'shimcha JSON ko'rinishidagi kontekst.",
    ru: "Дополнительный контекст в JSON, который ожидает workflow.",
  },
  "Retool workflow": {
    uz: "Retool workflow",
    ru: "Workflow Retool",
  },
  "Run an internal workflow that already has database and API access your team trusts.":
    {
      uz: "Jamoangiz ishonadigan ma'lumotlar bazasi va API ruxsatlari bor ichki workflowni ishga tushirish.",
      ru: "Запустить внутренний workflow, у которого уже есть доверенный доступ к базе данных и API.",
    },
  "Internal tools": {
    uz: "Ichki vositalar",
    ru: "Внутренние инструменты",
  },
  "API key": {
    uz: "API kalit",
    ru: "API-ключ",
  },
  "Reuses the resource connections Retool already holds, so no new credentials are copied here.":
    {
      uz: "Retool'dagi mavjud ulanishlardan foydalanadi, shuning uchun bu yerga yangi ma'lumotlar nusxalanmaydi.",
      ru: "Использует подключения, которые уже есть в Retool, поэтому новые учётные данные сюда не копируются.",
    },
  "Workflow runs are audited in Retool, which is usually what compliance asks for.":
    {
      uz: "Workflow ishga tushirishlari Retool'da audit qilinadi — odatda muvofiqlik talablari aynan shuni so'raydi.",
      ru: "Запуски workflow проходят аудит в Retool — обычно именно это требуют проверки соответствия.",
    },
  "Workflow API key": {
    uz: "Workflow API kaliti",
    ru: "API-ключ workflow",
  },
  "Generated on the workflow's Trigger panel.": {
    uz: "Workflowning Trigger panelida yaratiladi.",
    ru: "Создаётся на панели Trigger в workflow.",
  },
  "Copy the workflow id into the endpoint and its API key into the credential field.":
    {
      uz: "Workflow ID'sini endpointga, API kalitini esa ma'lumotlar maydoniga nusxalang.",
      ru: "Скопируйте ID workflow в эндпоинт, а его API-ключ — в поле учётных данных.",
    },
  "Start the internal Retool workflow for this request.": {
    uz: "Bu so'rov uchun ichki Retool workflowni ishga tushirish.",
    ru: "Запустить внутренний workflow Retool для этого запроса.",
  },
  "What the workflow should act on.": {
    uz: "Workflow nima ustida ishlashi kerak.",
    ru: "С чем должен работать workflow.",
  },
  "Record id the workflow needs.": {
    uz: "Workflowga kerakli yozuv ID'si.",
    ru: "ID записи, нужный workflow.",
  },
  "Power Automate flow": {
    uz: "Power Automate oqimi",
    ru: "Поток Power Automate",
  },
  "Start a flow inside your Microsoft tenant — SharePoint, Dataverse, Outlook and the rest.":
    {
      uz: "Microsoft muhitingizda oqimni ishga tushirish — SharePoint, Dataverse, Outlook va boshqalar.",
      ru: "Запустить поток в вашем Microsoft-тенанте — SharePoint, Dataverse, Outlook и другие.",
    },
  "The flow runs as its owner, so tenant policies and DLP rules still apply.": {
    uz: "Oqim egasi nomidan ishlaydi, shuning uchun tashkilot siyosatlari va DLP qoidalari amalda qoladi.",
    ru: "Поток выполняется от имени владельца, поэтому политики тенанта и правила DLP продолжают действовать.",
  },
  "The signature in the trigger URL is the credential — rotate by regenerating the trigger.":
    {
      uz: "Trigger URL'dagi imzo — bu kirish ma'lumoti; yangilash uchun triggerni qayta yarating.",
      ru: "Подпись в URL триггера — это учётные данные; чтобы сменить её, пересоздайте триггер.",
    },
  "HTTP trigger URL": {
    uz: "HTTP trigger URL manzili",
    ru: "URL HTTP-триггера",
  },
  "Contains a shared access signature — keep it secret.": {
    uz: "Umumiy kirish imzosini o'z ichiga oladi — uni sir tuting.",
    ru: "Содержит подпись общего доступа — держите её в секрете.",
  },
  'Build the flow with a "When an HTTP request is received" trigger and paste its URL.':
    {
      uz: 'Oqimni "When an HTTP request is received" triggeri bilan yarating va uning URL manzilini qo\'ying.',
      ru: "Создайте поток с триггером «When an HTTP request is received» и вставьте его URL.",
    },
  "Start the Power Automate flow that handles this request.": {
    uz: "Bu so'rovni bajaradigan Power Automate oqimini ishga tushirish.",
    ru: "Запустить поток Power Automate, который обрабатывает этот запрос.",
  },
  "What the flow should act on.": {
    uz: "Oqim nima ustida ishlashi kerak.",
    ru: "С чем должен работать поток.",
  },
  "GitHub workflow dispatch": {
    uz: "GitHub workflow ishga tushirish",
    ru: "Запуск GitHub workflow",
  },
  "Zapier trigger": {
    uz: "Zapier trigger",
    ru: "Триггер Zapier",
  },
  "Fire a repository dispatch so an engineering workflow picks the request up in CI.":
    {
      uz: "Muhandislik workflow so'rovni CI'da qabul qilishi uchun repository dispatch yuborish.",
      ru: "Отправить repository dispatch, чтобы инженерный workflow подхватил запрос в CI.",
    },
  "Fine-grained token": {
    uz: "Aniq ruxsatli token",
    ru: "Токен с точными правами",
  },
  "A fine-grained token can be scoped to one repository and the contents permission alone.":
    {
      uz: "Aniq ruxsatli tokenni bitta repozitoriy va faqat contents ruxsati bilan cheklash mumkin.",
      ru: "Токен с точными правами можно ограничить одним репозиторием и только правом contents.",
    },
  "The event type routes to a specific workflow, so one token cannot start everything.":
    {
      uz: "Hodisa turi aniq bir workflowga yo'naltiradi, shuning uchun bitta token hamma narsani ishga tushira olmaydi.",
      ru: "Тип события направляет в конкретный workflow, поэтому один токен не может запустить всё.",
    },
  "Fine-grained access token": {
    uz: "Aniq ruxsatli kirish tokeni",
    ru: "Токен доступа с точными правами",
  },
  "Scope it to the single repository with contents: write.": {
    uz: "Uni contents: write bilan bitta repozitoriyga cheklang.",
    ru: "Ограничьте его одним репозиторием с contents: write.",
  },
  "Put your org and repo in the endpoint, and handle the event type in a workflow file.":
    {
      uz: "Endpointga tashkilot va repozitoriy nomini yozing, hodisa turini esa workflow faylida qayta ishlang.",
      ru: "Укажите организацию и репозиторий в эндпоинте, а тип события обработайте в файле workflow.",
    },
  "Trigger the engineering workflow that handles this kind of customer report.":
    {
      uz: "Bunday mijoz murojaatini qayta ishlaydigan muhandislik workflowni ishga tushirish.",
      ru: "Запустить инженерный workflow, который обрабатывает такие обращения клиентов.",
    },
  "Ticket, order or issue reference.": {
    uz: "Tiket, buyurtma yoki muammo raqami.",
    ru: "Номер тикета, заказа или проблемы.",
  },
  "Invoke a function directly with SigV4 signing instead of fronting it with an API gateway.":
    {
      uz: "Funksiyani API gateway orqali emas, to'g'ridan-to'g'ri SigV4 imzosi bilan chaqirish.",
      ru: "Вызывать функцию напрямую с подписью SigV4, без API Gateway.",
    },
  Serverless: {
    uz: "Serversiz",
    ru: "Serverless",
  },
  "Request signing has to happen server-side, which needs the credential vault.":
    {
      uz: "So'rovni imzolash server tomonida bo'lishi kerak, buning uchun ma'lumotlar xazinasi kerak.",
      ru: "Подпись запроса должна выполняться на сервере, а для этого нужно хранилище учётных данных.",
    },
  "Until then, front the function with a Function URL and use the REST action blueprint.":
    {
      uz: "Ungacha funksiyani Function URL orqali oching va REST harakat shablonidan foydalaning.",
      ru: "А пока откройте функцию через Function URL и используйте шаблон REST-действия.",
    },
  "Start a Zap with the fields the assistant collected and let Zapier fan out to the rest.":
    {
      uz: "Yordamchi to'plagan ma'lumotlar bilan Zap'ni ishga tushiring, qolganini Zapier tarqatadi.",
      ru: "Запустите Zap с собранными ассистентом полями, а Zapier разошлёт их дальше.",
    },
  "Catch hook": {
    uz: "Catch hook",
    ru: "Catch hook",
  },
  "No-code": {
    uz: "Kodsiz",
    ru: "Без кода",
  },
  "One tool reaches every app Zapier connects to, without a blueprint per vendor.":
    {
      uz: "Bitta vosita Zapier ulaydigan barcha ilovalarga yetadi, har bir xizmat uchun alohida shablon kerak emas.",
      ru: "Один инструмент достаёт до всех приложений Zapier — без отдельного шаблона для каждого сервиса.",
    },
  "The Zap owns the credentials for downstream apps, so nothing else is stored here.":
    {
      uz: "Keyingi ilovalar uchun kirish ma'lumotlari Zap'da saqlanadi, shuning uchun bu yerda boshqa hech narsa saqlanmaydi.",
      ru: "Учётные данные для других приложений хранит Zap, поэтому здесь больше ничего не хранится.",
    },
  "Add fields by adding parameters — the payload is just the arguments as JSON.":
    {
      uz: "Parametr qo'shib maydon qo'shing — yuboriladigan ma'lumot shunchaki JSON ko'rinishidagi argumentlar.",
      ru: "Добавляйте поля через параметры — данные отправляются просто как аргументы в JSON.",
    },
  "Catch hook URL": {
    uz: "Catch hook URL manzili",
    ru: "URL Catch hook",
  },
  "The hook URL is the credential — regenerate the Zap to rotate it.": {
    uz: "Hook URL — bu kirish ma'lumoti; yangilash uchun Zap'ni qayta yarating.",
    ru: "URL хука — это учётные данные; чтобы сменить его, пересоздайте Zap.",
  },
  "Create a Zap with the Webhooks by Zapier catch hook trigger and paste its URL.":
    {
      uz: "Webhooks by Zapier catch hook triggeri bilan Zap yarating va uning URL manzilini qo'ying.",
      ru: "Создайте Zap с триггером Webhooks by Zapier catch hook и вставьте его URL.",
    },
  "Send the collected details to Zapier so the rest of the workflow can run.": {
    uz: "Workflowning qolgan qismi ishlashi uchun to'plangan ma'lumotlarni Zapier'ga yuborish.",
    ru: "Отправить собранные данные в Zapier, чтобы выполнилась остальная часть workflow.",
  },
  "What the assistant is handing off.": {
    uz: "Yordamchi nimani uzatmoqda.",
    ru: "Что передаёт ассистент.",
  },
  "Customer email address, when it is known.": {
    uz: "Ma'lum bo'lsa, mijozning email manzili.",
    ru: "Email клиента, если он известен.",
  },
  "Order id, ticket id or other reference.": {
    uz: "Buyurtma ID, tiket ID yoki boshqa raqam.",
    ru: "ID заказа, тикета или другой номер.",
  },
  "Make scenario": {
    uz: "Make ssenariysi",
    ru: "Сценарий Make",
  },
  "Kick off a Make scenario with the conversation's data as its payload.": {
    uz: "Suhbat ma'lumotlari bilan Make ssenariysini ishga tushirish.",
    ru: "Запустить сценарий Make с данными диалога.",
  },
  "Custom webhook": {
    uz: "Maxsus webhook",
    ru: "Свой вебхук",
  },
  "Make's webhook module infers the payload shape from the first call it receives.":
    {
      uz: "Make webhook moduli ma'lumot tuzilishini birinchi kelgan chaqiruvdan aniqlaydi.",
      ru: "Модуль вебхука Make определяет структуру данных по первому полученному вызову.",
    },
  "Scenario runs are logged in Make, which is where you debug a failed handoff.":
    {
      uz: "Ssenariy ishga tushirishlari Make'da qayd etiladi — muvaffaqiyatsiz uzatishni o'sha yerda tekshirasiz.",
      ru: "Запуски сценария записываются в Make — там и разбирают неудачные передачи.",
    },
  "Scenario webhook URL": {
    uz: "Ssenariy webhook URL manzili",
    ru: "URL вебхука сценария",
  },
  "Anyone with the URL can start the scenario.": {
    uz: "URL manzili bor har kim ssenariyni ishga tushira oladi.",
    ru: "Любой, у кого есть URL, может запустить сценарий.",
  },
  "Add a custom webhook module in Make and paste its address here.": {
    uz: "Make'da maxsus webhook modulini qo'shing va uning manzilini shu yerga qo'ying.",
    ru: "Добавьте в Make модуль Custom webhook и вставьте его адрес сюда.",
  },
  "Start the Make scenario that handles this kind of request.": {
    uz: "Bunday so'rovni bajaradigan Make ssenariysini ishga tushirish.",
    ru: "Запустить сценарий Make, который обрабатывает такие запросы.",
  },
  "Knowledge base search": {
    uz: "Bilim bazasidan qidirish",
    ru: "Поиск по базе знаний",
  },
  Included: {
    uz: "Kiritilgan",
    ru: "Включено",
  },
  "Answers from your uploaded documents and articles, interpreted by the model you choose.":
    {
      uz: "Siz yuklagan hujjat va maqolalar asosida javob beradi; ularni siz tanlagan model talqin qiladi.",
      ru: "Отвечает по загруженным документам и статьям, их интерпретирует выбранная вами модель.",
    },
  Retrieval: {
    uz: "Qidiruv",
    ru: "Поиск",
  },
  "Searches everything in the workspace knowledge base, scoped to this organization.":
    {
      uz: "Ish maydonidagi bilim bazasining hammasidan qidiradi, faqat shu tashkilot doirasida.",
      ru: "Ищет по всей базе знаний рабочего пространства, только в рамках этой организации.",
    },
  "The interpreting model is configurable per workspace.": {
    uz: "Talqin qiluvchi modelni har bir ish maydoni uchun sozlash mumkin.",
    ru: "Модель интерпретации настраивается для каждого рабочего пространства.",
  },
  "Runs on both chat and voice channels.": {
    uz: "Chat va ovozli kanallarda ishlaydi.",
    ru: "Работает в чате и голосовых каналах.",
  },
  "Escalates the conversation to an operator and marks it for the inbox.": {
    uz: "Suhbatni operatorga uzatadi va Inbox uchun belgilaydi.",
    ru: "Передаёт диалог оператору и помечает его для входящих.",
  },
  Escalation: {
    uz: "Uzatish",
    ru: "Эскалация",
  },
  "Moves the thread into the operator inbox with its full history attached.": {
    uz: "Suhbatni butun tarixi bilan operator Inbox'iga o'tkazadi.",
    ru: "Переносит диалог во входящие оператора со всей историей.",
  },
  "The assistant stops replying until an operator releases the thread.": {
    uz: "Operator suhbatni bo'shatmaguncha yordamchi javob bermaydi.",
    ru: "Ассистент не отвечает, пока оператор не освободит диалог.",
  },
  "Chat only — a voice call uses warm transfer instead.": {
    uz: "Faqat chat — ovozli qo'ng'iroqda buning o'rniga qo'ng'iroqni uzatish ishlatiladi.",
    ru: "Только чат — в голосовом звонке вместо этого используется перевод звонка.",
  },
  "Resolve conversation": {
    uz: "Suhbatni hal qilingan deb belgilash",
    ru: "Закрыть диалог как решённый",
  },
  "Closes the thread once the customer's issue has actually been settled.": {
    uz: "Mijozning muammosi haqiqatan hal bo'lgach, suhbatni yopadi.",
    ru: "Закрывает диалог, когда вопрос клиента действительно решён.",
  },
  Lifecycle: {
    uz: "Hayot sikli",
    ru: "Жизненный цикл",
  },
  "Marks the conversation resolved so it leaves the open queue.": {
    uz: "Suhbatni hal qilingan deb belgilaydi, shunda u ochiq navbatdan chiqadi.",
    ru: "Помечает диалог решённым, и он уходит из открытой очереди.",
  },
  "The description you write is what stops the model closing threads early.": {
    uz: "Siz yozgan tavsif modelning suhbatlarni muddatidan oldin yopishiga yo'l qo'ymaydi.",
    ru: "Именно ваше описание не даёт модели закрывать диалоги раньше времени.",
  },
  "Chat only.": {
    uz: "Faqat chat.",
    ru: "Только чат.",
  },
  "Warm call transfer": {
    uz: "Qo'ng'iroqni izoh bilan uzatish",
    ru: "Перевод звонка с контекстом",
  },
  "Hand a live voice call to a human with the transcript and context already summarised.":
    {
      uz: "Jonli ovozli qo'ng'iroqni yozuv va qisqacha mazmun bilan xodimga uzatish.",
      ru: "Передать живой звонок человеку вместе с расшифровкой и кратким контекстом.",
    },
  "Bridges the caller to an on-call number instead of ending the call.": {
    uz: "Qo'ng'iroqni tugatish o'rniga qo'ng'iroq qiluvchini navbatchi raqamga ulaydi.",
    ru: "Соединяет звонящего с дежурным номером вместо завершения звонка.",
  },
  "Passes a summary of the conversation so far to whoever picks up.": {
    uz: "Hozirgacha bo'lgan suhbatning qisqacha mazmunini go'shakni ko'targan kishiga uzatadi.",
    ru: "Передаёт тому, кто ответит, краткое содержание разговора.",
  },
  "Search events or check availability before booking.": {
    uz: "Yozilishdan oldin tadbirlarni qidirish yoki bo'sh vaqtni tekshirish.",
    ru: "Найти события или проверить свободное время перед записью.",
  },
  "Book a new event with the details the assistant collected.": {
    uz: "Yordamchi to'plagan ma'lumotlar bilan yangi tadbir yaratish.",
    ru: "Создать новое событие по собранным ассистентом данным.",
  },
  "Find one event, then change its time or details.": {
    uz: "Bitta tadbirni topib, vaqti yoki tafsilotlarini o'zgartirish.",
    ru: "Найти одно событие и изменить его время или детали.",
  },
  "Find one event and cancel it.": {
    uz: "Bitta tadbirni topib, bekor qilish.",
    ru: "Найти одно событие и отменить его.",
  },
  "Searches by text and/or a time window, the same way Google Calendar search works.":
    {
      uz: "Google Calendar qidiruvi kabi matn va/yoki vaqt oralig'i bo'yicha qidiradi.",
      ru: "Ищет по тексту и/или временному диапазону — так же, как поиск в Google Calendar.",
    },
  "Returns each event's ID, so a follow-up update or cancel can target it directly.":
    {
      uz: "Har bir tadbir ID'sini qaytaradi, shuning uchun keyingi yangilash yoki bekor qilish aynan unga yo'naltiriladi.",
      ru: "Возвращает ID каждого события, чтобы следующее изменение или отмена попали точно в него.",
    },
  "Attendees are invited automatically when an email is provided.": {
    uz: "Email ko'rsatilsa, ishtirokchilar avtomatik taklif qilinadi.",
    ru: "Участники приглашаются автоматически, если указан email.",
  },
  "Accepts either a full date-time or a bare date for all-day events.": {
    uz: "To'liq sana-vaqt yoki kun bo'yi tadbirlar uchun faqat sanani qabul qiladi.",
    ru: "Принимает полную дату и время или просто дату для событий на весь день.",
  },
  "Pass an event_id from a previous search, or let it search by text and time range.":
    {
      uz: "Oldingi qidiruvdagi event_id'ni bering yoki matn va vaqt oralig'i bo'yicha qidirishga qo'ying.",
      ru: "Передайте event_id из предыдущего поиска или дайте ему искать по тексту и времени.",
    },
  "Refuses to guess when more than one event matches — it lists them instead.":
    {
      uz: "Bir nechta tadbir mos kelsa, taxmin qilmaydi — buning o'rniga ularni sanab beradi.",
      ru: "Если подходит несколько событий, не угадывает — а перечисляет их.",
    },
  "Same unambiguous-match rule as update — it will not cancel the wrong event.":
    {
      uz: "Yangilashdagi kabi aniq moslik qoidasi — noto'g'ri tadbirni bekor qilmaydi.",
      ru: "То же правило однозначного совпадения, что и при изменении, — не отменит не то событие.",
    },
  "Notifies attendees that the event was cancelled.": {
    uz: "Ishtirokchilarga tadbir bekor qilinganini xabar qiladi.",
    ru: "Уведомляет участников об отмене события.",
  },
  Calendar: {
    uz: "Kalendar",
    ru: "Календарь",
  },
  "Google account": {
    uz: "Google hisobi",
    ru: "Аккаунт Google",
  },
  "Connect once for the whole workspace — every Calendar tool reuses it.": {
    uz: "Butun ish maydoni uchun bir marta ulang — barcha Calendar vositalari undan foydalanadi.",
    ru: "Подключите один раз для всего пространства — все инструменты Calendar будут его использовать.",
  },
  "Connect your Google account, then point this tool at the calendar it should use.":
    {
      uz: "Google hisobingizni ulang, so'ng bu vositani u ishlatishi kerak bo'lgan kalendarga yo'naltiring.",
      ru: "Подключите аккаунт Google, затем укажите, с каким календарём работать этому инструменту.",
    },
  "Assistant actions": {
    uz: "Yordamchi harakatlari",
    ru: "Действия ассистента",
  },
  "Built-in behaviour every assistant ships with.": {
    uz: "Har bir yordamchida bo'ladigan ichki imkoniyatlar.",
    ru: "Встроенные возможности каждого ассистента.",
  },
  "Data & records": {
    uz: "Ma'lumotlar va yozuvlar",
    ru: "Данные и записи",
  },
  "Read and write rows in the systems your team already keeps.": {
    uz: "Jamoangiz allaqachon yuritadigan tizimlarda qatorlarni o'qish va yozish.",
    ru: "Чтение и запись строк в системах, которые уже ведёт ваша команда.",
  },
  "Messaging & alerts": {
    uz: "Xabarlar va ogohlantirishlar",
    ru: "Сообщения и оповещения",
  },
  "Let the assistant reach a person or a channel.": {
    uz: "Yordamchiga odam yoki kanal bilan bog'lanishga ruxsat berish.",
    ru: "Пусть ассистент связывается с человеком или каналом.",
  },
  "Customer & billing": {
    uz: "Mijoz va to'lovlar",
    ru: "Клиенты и оплата",
  },
  "Customer, subscription, order and support records.": {
    uz: "Mijoz, obuna, buyurtma va qo'llab-quvvatlash yozuvlari.",
    ru: "Записи о клиентах, подписках, заказах и обращениях.",
  },
  "Work management": {
    uz: "Ishlarni boshqarish",
    ru: "Управление работой",
  },
  "Tickets, tasks and bookings in the tools your team runs on.": {
    uz: "Jamoangiz ishlatadigan vositalardagi tiketlar, vazifalar va bronlar.",
    ru: "Тикеты, задачи и бронирования в инструментах вашей команды.",
  },
  "Hand work off to an automation platform you already run.": {
    uz: "Ishni allaqachon ishlatayotgan avtomatlashtirish platformangizga topshiring.",
    ru: "Передавайте работу платформе автоматизации, которую вы уже используете.",
  },
  "Custom & developer": {
    uz: "Maxsus va dasturchilar uchun",
    ru: "Своё и для разработчиков",
  },
  "Anything with an HTTP endpoint.": {
    uz: "HTTP endpointi bor har qanday narsa.",
    ru: "Всё, у чего есть HTTP-эндпоинт.",
  },
  "Give the private app contact write scope, then add any extra properties to the body template.":
    {
      uz: "Shaxsiy ilovaga kontaktlarni yozish ruxsatini bering, so'ng tana shabloniga kerakli qo'shimcha xususiyatlarni qo'shing.",
      ru: "Дайте приватному приложению право записи контактов и добавьте нужные свойства в шаблон тела.",
    },
  "Create a contact in HubSpot for a new lead captured during the conversation.":
    {
      uz: "Suhbat davomida olingan yangi lid uchun HubSpot'da kontakt yaratish.",
      ru: "Создать контакт в HubSpot для нового лида из диалога.",
    },
  "The lead's email address.": {
    uz: "Lidning email manzili.",
    ru: "Email лида.",
  },
  "The lead's first name.": {
    uz: "Lidning ismi.",
    ru: "Имя лида.",
  },
  "The lead's last name.": {
    uz: "Lidning familiyasi.",
    ru: "Фамилия лида.",
  },
  "Company the lead works for.": {
    uz: "Lid ishlaydigan kompaniya.",
    ru: "Компания, где работает лид.",
  },
  "Zendesk ticket": {
    uz: "Zendesk tiketi",
    ru: "Тикет Zendesk",
  },
  "Open a support ticket with the conversation's context when the assistant cannot finish the job.":
    {
      uz: "Yordamchi ishni tugata olmasa, suhbat konteksti bilan qo'llab-quvvatlash tiketini ochish.",
      ru: "Открыть тикет поддержки с контекстом диалога, когда ассистент не может завершить задачу.",
    },
  Support: {
    uz: "Qo'llab-quvvatlash",
    ru: "Поддержка",
  },
  "Basic auth": {
    uz: "Basic auth",
    ru: "Basic auth",
  },
  "Files against the requester's own email, so the ticket threads to their existing history.":
    {
      uz: "Tiket murojaat qiluvchining o'z emailiga yoziladi, shuning uchun u avvalgi tarixi bilan bog'lanadi.",
      ru: "Тикет оформляется на email обратившегося, поэтому связывается с его историей.",
    },
  "Priority is a parameter — the assistant can escalate a genuine outage.": {
    uz: "Muhimlik — parametr, shuning uchun yordamchi haqiqiy nosozlikni yuqori darajaga ko'tara oladi.",
    ru: "Приоритет — это параметр, так что ассистент может эскалировать настоящий сбой.",
  },
  "Uses an API token, not an agent password.": {
    uz: "Agent paroli emas, API token ishlatiladi.",
    ru: "Используется API-токен, а не пароль агента.",
  },
  "Agent email and API token": {
    uz: "Agent emaili va API token",
    ru: "Email агента и API-токен",
  },
  "Base64 of agent@example.com/token:your_api_token.": {
    uz: "agent@example.com/token:your_api_token ning Base64 ko'rinishi.",
    ru: "Base64 от agent@example.com/token:your_api_token.",
  },
  "Swap yourdomain for your Zendesk subdomain, and enable token access in Admin → API.":
    {
      uz: "yourdomain o'rniga Zendesk subdomeningizni yozing va Admin → API'da token orqali kirishni yoqing.",
      ru: "Замените yourdomain на свой поддомен Zendesk и включите доступ по токену в Admin → API.",
    },
  "Open a Zendesk support ticket describing the customer's unresolved issue.": {
    uz: "Mijozning hal qilinmagan muammosini tasvirlovchi Zendesk tiketini ochish.",
    ru: "Открыть тикет Zendesk с описанием нерешённой проблемы клиента.",
  },
  "Short subject line for the ticket.": {
    uz: "Tiket uchun qisqa mavzu.",
    ru: "Короткая тема тикета.",
  },
  "Full description of the issue, including context.": {
    uz: "Kontekst bilan birga muammoning to'liq tavsifi.",
    ru: "Полное описание проблемы с контекстом.",
  },
  "Email address of the customer raising it.": {
    uz: "Murojaat qilgan mijozning email manzili.",
    ru: "Email клиента, который обратился.",
  },
  "One of low, normal, high or urgent.": {
    uz: "low, normal, high yoki urgent dan biri.",
    ru: "Одно из: low, normal, high или urgent.",
  },
  "Zendesk ticket status": {
    uz: "Zendesk tiket holati",
    ru: "Статус тикета Zendesk",
  },
  'Answer "where is my ticket?" from the live queue instead of promising a follow-up.':
    {
      uz: "\"Tiketim qayerda?\" savoliga keyinroq javob berishni va'da qilish o'rniga jonli navbatdan javob berish.",
      ru: "Отвечать на «где мой тикет?» по живой очереди, а не обещать вернуться позже.",
    },
  "Read-only": {
    uz: "Faqat o'qish",
    ru: "Только чтение",
  },
  "Search syntax goes straight through, so requester, status and tag filters all work.":
    {
      uz: "Qidiruv sintaksisi to'g'ridan-to'g'ri uzatiladi, shuning uchun murojaat qiluvchi, holat va teg filtrlari ishlaydi.",
      ru: "Синтаксис поиска передаётся как есть, поэтому работают фильтры по заявителю, статусу и тегам.",
    },
  "Read-only token scope is enough.": {
    uz: "Faqat o'qish uchun token ruxsati yetarli.",
    ru: "Достаточно токена с правами только на чтение.",
  },
  "The query parameter is passed straight to Zendesk search — teach the assistant the syntax in the description.":
    {
      uz: "So'rov parametri to'g'ridan-to'g'ri Zendesk qidiruviga uzatiladi — tavsifda yordamchiga sintaksisni o'rgating.",
      ru: "Параметр запроса передаётся прямо в поиск Zendesk — объясните ассистенту синтаксис в описании.",
    },
  "Search Zendesk for the customer's tickets, e.g. type:ticket requester:customer@example.com.":
    {
      uz: "Zendesk'dan mijoz tiketlarini qidirish, masalan, type:ticket requester:customer@example.com.",
      ru: "Найти тикеты клиента в Zendesk, например type:ticket requester:customer@example.com.",
    },
  "Zendesk search query, e.g. type:ticket requester:customer@example.com status<solved.":
    {
      uz: "Zendesk qidiruv so'rovi, masalan, type:ticket requester:customer@example.com status<solved.",
      ru: "Поисковый запрос Zendesk, например type:ticket requester:customer@example.com status<solved.",
    },
  "Intercom contact lookup": {
    uz: "Intercom kontaktini topish",
    ru: "Поиск контакта в Intercom",
  },
  "Pull the customer's Intercom record so the assistant knows the plan and the history.":
    {
      uz: "Yordamchi tarif va tarixni bilishi uchun mijozning Intercom yozuvini olish.",
      ru: "Получить запись клиента в Intercom, чтобы ассистент знал тариф и историю.",
    },
  "Searches by email against the workspace's contacts.": {
    uz: "Ish maydoni kontaktlari orasidan email bo'yicha qidiradi.",
    ru: "Ищет по email среди контактов рабочего пространства.",
  },
  "Returns custom attributes, so plan and account tier come through.": {
    uz: "Maxsus atributlarni qaytaradi, shuning uchun tarif va hisob darajasi ham keladi.",
    ru: "Возвращает пользовательские атрибуты, поэтому приходят тариф и уровень аккаунта.",
  },
  "Intercom access token": {
    uz: "Intercom kirish tokeni",
    ru: "Токен доступа Intercom",
  },
  "From the Developer Hub app's Authentication tab.": {
    uz: "Developer Hub ilovasining Authentication bo'limidan.",
    ru: "Со вкладки Authentication приложения в Developer Hub.",
  },
  "Paste an access token with contact read permission — the query shape is already in the body.":
    {
      uz: "Kontaktlarni o'qish ruxsati bor kirish tokenini qo'ying — so'rov tuzilishi tanada allaqachon bor.",
      ru: "Вставьте токен доступа с правом чтения контактов — структура запроса уже есть в теле.",
    },
  "Find the customer's Intercom contact record from their email address.": {
    uz: "Mijozning email manzili bo'yicha Intercom kontakt yozuvini topish.",
    ru: "Найти контакт клиента в Intercom по его email.",
  },
  "Freshdesk ticket": {
    uz: "Freshdesk tiketi",
    ru: "Тикет Freshdesk",
  },
  "Raise a Freshdesk ticket with the transcript attached to the customer's email.":
    {
      uz: "Mijoz emailiga suhbat yozuvi biriktirilgan Freshdesk tiketini ochish.",
      ru: "Создать тикет Freshdesk с расшифровкой диалога на email клиента.",
    },
  "The API key doubles as the basic-auth username, so no agent password is stored.":
    {
      uz: "API kalit basic-auth foydalanuvchi nomi sifatida ham ishlaydi, shuning uchun agent paroli saqlanmaydi.",
      ru: "API-ключ служит и логином basic-auth, поэтому пароль агента не хранится.",
    },
  "Status and priority default to open and normal unless the assistant sets them.":
    {
      uz: "Yordamchi o'rnatmasa, holat va muhimlik standart bo'yicha open va normal bo'ladi.",
      ru: "Статус и приоритет по умолчанию — open и normal, если ассистент не задаст иное.",
    },
  "Base64 of your_api_key:X — the password half is literally X.": {
    uz: "your_api_key:X ning Base64 ko'rinishi — parol qismi aynan X.",
    ru: "Base64 от your_api_key:X — пароль буквально X.",
  },
  "Swap yourdomain for your Freshdesk subdomain before saving.": {
    uz: "Saqlashdan oldin yourdomain o'rniga Freshdesk subdomeningizni yozing.",
    ru: "Перед сохранением замените yourdomain на свой поддомен Freshdesk.",
  },
  "Create a Freshdesk ticket for an issue the assistant could not resolve.": {
    uz: "Yordamchi hal qila olmagan muammo uchun Freshdesk tiketini yaratish.",
    ru: "Создать тикет Freshdesk по проблеме, которую ассистент не смог решить.",
  },
  "Full description of the issue.": {
    uz: "Muammoning to'liq tavsifi.",
    ru: "Полное описание проблемы.",
  },
  "HubSpot contact lookup": {
    uz: "HubSpot kontaktini topish",
    ru: "Поиск контакта в HubSpot",
  },
  "Stripe customer lookup": {
    uz: "Stripe mijozini topish",
    ru: "Поиск клиента в Stripe",
  },
  "Confirm who is asking and what they pay for, straight from billing.": {
    uz: "Kim so'rayotganini va nima uchun to'lashini to'g'ridan-to'g'ri to'lov tizimidan tasdiqlash.",
    ru: "Подтвердить, кто спрашивает и за что платит, прямо из биллинга.",
  },
  "Restricted key": {
    uz: "Cheklangan kalit",
    ru: "Ограниченный ключ",
  },
  "Use a restricted key with read access to customers only — it cannot move money.":
    {
      uz: "Faqat mijozlarni o'qish ruxsati bor cheklangan kalitdan foydalaning — u pul o'tkaza olmaydi.",
      ru: "Используйте ограниченный ключ с доступом только на чтение клиентов — он не может переводить деньги.",
    },
  "Matches on email, the field a customer can actually give you over chat.": {
    uz: "Email bo'yicha moslaydi — mijoz chatda haqiqatan bera oladigan maydon.",
    ru: "Ищет по email — это поле клиент действительно может назвать в чате.",
  },
  "Never returns card numbers: Stripe only exposes the last four digits.": {
    uz: "Hech qachon karta raqamlarini qaytarmaydi: Stripe faqat oxirgi to'rt raqamni ko'rsatadi.",
    ru: "Никогда не возвращает номера карт: Stripe показывает только последние четыре цифры.",
  },
  "Restricted API key": {
    uz: "Cheklangan API kalit",
    ru: "Ограниченный API-ключ",
  },
  "Create one under Developers → API keys with customer read access.": {
    uz: "Developers → API keys bo'limida mijozlarni o'qish ruxsati bilan yarating.",
    ru: "Создайте его в Developers → API keys с правом чтения клиентов.",
  },
  "A restricted key with read-only customer access is enough — never paste a secret key here.":
    {
      uz: "Mijozlarni faqat o'qish ruxsati bor cheklangan kalit yetarli — bu yerga hech qachon maxfiy kalitni qo'ymang.",
      ru: "Достаточно ограниченного ключа с правом только чтения клиентов — никогда не вставляйте сюда секретный ключ.",
    },
  "Look up a Stripe customer by email to confirm their billing status.": {
    uz: "To'lov holatini tasdiqlash uchun Stripe mijozini email bo'yicha topish.",
    ru: "Найти клиента Stripe по email, чтобы подтвердить статус оплаты.",
  },
  "Email address on the Stripe customer record.": {
    uz: "Stripe mijoz yozuvidagi email manzil.",
    ru: "Email в записи клиента Stripe.",
  },
  "Stripe subscription lookup": {
    uz: "Stripe obunasini topish",
    ru: "Поиск подписки Stripe",
  },
  "Tell the customer which plan they are on and when it renews, without an operator.":
    {
      uz: "Operatorsiz mijozga qaysi tarifda ekanini va qachon yangilanishini aytish.",
      ru: "Сообщить клиенту его тариф и дату продления без оператора.",
    },
  "Takes the customer id returned by the lookup tool, so the two chain naturally.":
    {
      uz: "Topish vositasi qaytargan mijoz ID'sini oladi, shuning uchun ikkalasi tabiiy ravishda bog'lanadi.",
      ru: "Принимает ID клиента из инструмента поиска, поэтому они естественно работают в связке.",
    },
  "Shows status, current period end and the price the customer is on.": {
    uz: "Holatni, joriy davr tugashini va mijoz to'layotgan narxni ko'rsatadi.",
    ru: "Показывает статус, окончание текущего периода и цену для клиента.",
  },
  "Read access to subscriptions.": {
    uz: "Obunalarni o'qish ruxsati.",
    ru: "Доступ на чтение подписок.",
  },
  "Pair this with the customer lookup so the assistant already has a cus_ id to pass.":
    {
      uz: "Yordamchida uzatish uchun cus_ ID allaqachon bo'lishi uchun buni mijozni topish vositasi bilan birga ishlating.",
      ru: "Используйте вместе с поиском клиента, чтобы у ассистента уже был cus_ ID.",
    },
  "List the Stripe subscriptions for a customer id to confirm plan and renewal date.":
    {
      uz: "Tarif va yangilanish sanasini tasdiqlash uchun mijoz ID'si bo'yicha Stripe obunalarini sanab berish.",
      ru: "Получить подписки Stripe по ID клиента, чтобы подтвердить тариф и дату продления.",
    },
  "Stripe customer id, in the form cus_XXXXXXXX.": {
    uz: "Stripe mijoz ID'si, cus_XXXXXXXX ko'rinishida.",
    ru: "ID клиента Stripe в формате cus_XXXXXXXX.",
  },
  "Stripe refund": {
    uz: "Stripe orqali pulni qaytarish",
    ru: "Возврат через Stripe",
  },
  "Issue a refund on a specific charge — the highest-trust action in the catalog.":
    {
      uz: "Muayyan to'lov bo'yicha pulni qaytarish — katalogdagi eng yuqori ishonch talab qiladigan harakat.",
      ru: "Сделать возврат по конкретному платежу — действие с наивысшим уровнем доверия в каталоге.",
    },
  "Writes money": {
    uz: "Pul bilan ishlaydi",
    ru: "Двигает деньги",
  },
  "Form encoded": {
    uz: "Form encoded",
    ru: "Form encoded",
  },
  "Search the CRM by email so the assistant answers with the customer's real record.":
    {
      uz: "Yordamchi mijozning haqiqiy yozuvi asosida javob berishi uchun CRM'dan email bo'yicha qidirish.",
      ru: "Искать в CRM по email, чтобы ассистент отвечал по реальной записи клиента.",
    },
  "Moves real money: keep it off voice and describe the policy precisely in the tool description.":
    {
      uz: "Haqiqiy pul o'tkazadi: ovozli kanalda ishlatmang va vosita tavsifida qoidani aniq yozing.",
      ru: "Двигает реальные деньги: не включайте для голоса и точно опишите правила в описании инструмента.",
    },
  "Scoped to one charge id, so the assistant cannot refund an account wholesale.":
    {
      uz: "Bitta to'lov ID'si bilan cheklangan, shuning uchun yordamchi butun hisob bo'yicha pul qaytara olmaydi.",
      ru: "Ограничено одним ID платежа, поэтому ассистент не может вернуть деньги по всему аккаунту.",
    },
  "Amount is optional — omit it for a full refund of that charge.": {
    uz: "Summa ixtiyoriy — o'sha to'lovni to'liq qaytarish uchun uni ko'rsatmang.",
    ru: "Сумма необязательна — не указывайте её для полного возврата по платежу.",
  },
  "Restricted API key with refund write": {
    uz: "Qaytarish yozish ruxsati bor cheklangan API kalit",
    ru: "Ограниченный API-ключ с правом на возвраты",
  },
  "Grant refunds write and nothing else.": {
    uz: "Faqat qaytarishlarni yozish ruxsatini bering, boshqa hech narsa emas.",
    ru: "Дайте право записи возвратов и ничего больше.",
  },
  "Private app": {
    uz: "Shaxsiy ilova",
    ru: "Приватное приложение",
  },
  "Write the refund policy into the tool description — it is the only thing gating the call.":
    {
      uz: "Qaytarish qoidasini vosita tavsifiga yozing — chaqiruvni faqat shu cheklaydi.",
      ru: "Пропишите правила возврата в описании инструмента — только это ограничивает вызов.",
    },
  "Refund a Stripe charge when the customer qualifies under the published refund policy.":
    {
      uz: "Mijoz e'lon qilingan qaytarish qoidasiga mos kelsa, Stripe to'lovini qaytarish.",
      ru: "Вернуть платёж Stripe, если клиент подходит под опубликованные правила возврата.",
    },
  "Stripe charge id to refund, in the form ch_XXXXXXXX.": {
    uz: "Qaytariladigan Stripe to'lov ID'si, ch_XXXXXXXX ko'rinishida.",
    ru: "ID платежа Stripe для возврата в формате ch_XXXXXXXX.",
  },
  "Amount to refund in the smallest currency unit.": {
    uz: "Qaytariladigan summa eng kichik valyuta birligida.",
    ru: "Сумма возврата в минимальных единицах валюты.",
  },
  "Reads with a private-app token scoped to the properties you list — nothing else is exposed.":
    {
      uz: "Siz sanagan xususiyatlar bilan cheklangan shaxsiy ilova tokeni bilan o'qiydi — boshqa hech narsa ochilmaydi.",
      ru: "Читает токеном приватного приложения, ограниченным перечисленными свойствами, — больше ничего не открывается.",
    },
  "Shopify order lookup": {
    uz: "Shopify buyurtmasini topish",
    ru: "Поиск заказа Shopify",
  },
  "Returns the properties named in the body, so the model never sees the whole contact.":
    {
      uz: "Tanada ko'rsatilgan xususiyatlarni qaytaradi, shuning uchun model kontaktni to'liq ko'rmaydi.",
      ru: "Возвращает только указанные в теле свойства, поэтому модель не видит контакт целиком.",
    },
  'Answer "where is my order?" with the real fulfilment status and tracking number.':
    {
      uz: '"Buyurtmam qayerda?" savoliga haqiqiy yetkazish holati va kuzatuv raqami bilan javob berish.',
      ru: "Отвечать на «где мой заказ?» реальным статусом доставки и трек-номером.",
    },
  Commerce: {
    uz: "Savdo",
    ru: "Торговля",
  },
  "Admin API": {
    uz: "Admin API",
    ru: "Admin API",
  },
  "Matches on the order name the customer reads off their confirmation email.":
    {
      uz: "Mijoz tasdiqlash xatidan o'qiydigan buyurtma nomi bo'yicha moslaydi.",
      ru: "Ищет по номеру заказа, который клиент видит в письме-подтверждении.",
    },
  "A custom app token with read_orders is the whole permission surface.": {
    uz: "read_orders ruxsati bor maxsus ilova tokeni — bor-yo'g'i shu ruxsat.",
    ru: "Токен собственного приложения с read_orders — это все права.",
  },
  "Returns fulfilment status and tracking, so the assistant can answer in one turn.":
    {
      uz: "Yetkazish holati va kuzatuv raqamini qaytaradi, shuning uchun yordamchi bitta javobda javob bera oladi.",
      ru: "Возвращает статус доставки и трек-номер, чтобы ассистент ответил за один раз.",
    },
  "Read-only: no CRM record is created or changed by this tool.": {
    uz: "Faqat o'qish: bu vosita CRM yozuvini yaratmaydi va o'zgartirmaydi.",
    ru: "Только чтение: инструмент не создаёт и не меняет записи в CRM.",
  },
  "Admin API access token": {
    uz: "Admin API kirish tokeni",
    ru: "Токен доступа Admin API",
  },
  "From a custom app in your store's admin, with read_orders.": {
    uz: "Do'koningiz admin panelidagi maxsus ilovadan, read_orders bilan.",
    ru: "Из собственного приложения в админке магазина, с read_orders.",
  },
  "Swap your-store for your shop domain and install a custom app with read_orders.":
    {
      uz: "your-store o'rniga do'kon domeningizni yozing va read_orders bilan maxsus ilova o'rnating.",
      ru: "Замените your-store на домен магазина и установите собственное приложение с read_orders.",
    },
  "Look up a Shopify order by its order number to report status and tracking.":
    {
      uz: "Holat va kuzatuv ma'lumotini berish uchun Shopify buyurtmasini raqami bo'yicha topish.",
      ru: "Найти заказ Shopify по номеру, чтобы сообщить статус и трек-номер.",
    },
  "Order number as the customer sees it, e.g. #1001.": {
    uz: "Mijoz ko'radigan buyurtma raqami, masalan, #1001.",
    ru: "Номер заказа, как его видит клиент, например #1001.",
  },
  "Order status filter — any, open, closed or cancelled.": {
    uz: "Buyurtma holati filtri — any, open, closed yoki cancelled.",
    ru: "Фильтр статуса заказа — any, open, closed или cancelled.",
  },
  "Shopify customer lookup": {
    uz: "Shopify mijozini topish",
    ru: "Поиск клиента Shopify",
  },
  "Private app access token": {
    uz: "Shaxsiy ilova kirish tokeni",
    ru: "Токен доступа приватного приложения",
  },
  "Find the shopper's account to confirm the email on file and their order history.":
    {
      uz: "Saqlangan email va buyurtmalar tarixini tasdiqlash uchun xaridor hisobini topish.",
      ru: "Найти аккаунт покупателя, чтобы подтвердить email и историю заказов.",
    },
  "Search syntax accepts email:, phone: and name: filters.": {
    uz: "Qidiruv sintaksisi email:, phone: va name: filtrlarini qabul qiladi.",
    ru: "Синтаксис поиска поддерживает фильтры email:, phone: и name:.",
  },
  "Needs read_customers on the custom app token.": {
    uz: "Maxsus ilova tokenida read_customers kerak.",
    ru: "Токену приложения нужен read_customers.",
  },
  "Settings → Integrations → Private Apps, with crm.objects.contacts.read.": {
    uz: "Settings → Integrations → Private Apps, crm.objects.contacts.read bilan.",
    ru: "Settings → Integrations → Private Apps, с crm.objects.contacts.read.",
  },
  "Needs read_customers.": {
    uz: "read_customers kerak.",
    ru: "Нужен read_customers.",
  },
  "Swap your-store for your shop domain before saving.": {
    uz: "Saqlashdan oldin your-store o'rniga do'kon domeningizni yozing.",
    ru: "Перед сохранением замените your-store на домен магазина.",
  },
  "Search Shopify customers, e.g. email:customer@example.com, to confirm the account.":
    {
      uz: "Hisobni tasdiqlash uchun Shopify mijozlarini qidirish, masalan, email:customer@example.com.",
      ru: "Найти клиентов Shopify, например email:customer@example.com, чтобы подтвердить аккаунт.",
    },
  "Search query, e.g. email:customer@example.com.": {
    uz: "Qidiruv so'rovi, masalan, email:customer@example.com.",
    ru: "Поисковый запрос, например email:customer@example.com.",
  },
  "Pipedrive person lookup": {
    uz: "Pipedrive shaxsini topish",
    ru: "Поиск контакта в Pipedrive",
  },
  "Check whether the person in the conversation is already in the pipeline, and who owns them.":
    {
      uz: "Suhbatdagi odam allaqachon savdo voronkasida bormi va kim unga mas'ul — tekshirish.",
      ru: "Проверить, есть ли собеседник уже в воронке и кто его ведёт.",
    },
  "API token": {
    uz: "API token",
    ru: "API-токен",
  },
  "The API token travels as a query parameter, so no header setup is needed.": {
    uz: "API token so'rov parametri sifatida yuboriladi, shuning uchun sarlavha sozlash kerak emas.",
    ru: "API-токен передаётся параметром запроса, поэтому заголовки настраивать не нужно.",
  },
  "Returns the owner, so the assistant can name the right account manager.": {
    uz: "Mas'ul shaxsni qaytaradi, shuning uchun yordamchi to'g'ri menejerni ayta oladi.",
    ru: "Возвращает ответственного, чтобы ассистент назвал нужного менеджера.",
  },
  "API token in the endpoint": {
    uz: "Endpointdagi API token",
    ru: "API-токен в эндпоинте",
  },
  "Append ?api_token=… to the URL — from Personal preferences → API.": {
    uz: "URL oxiriga ?api_token=… qo'shing — Personal preferences → API'dan.",
    ru: "Добавьте ?api_token=… к URL — из Personal preferences → API.",
  },
  "Append your API token to the endpoint as ?api_token=… before saving.": {
    uz: "Saqlashdan oldin API tokeningizni endpointga ?api_token=… ko'rinishida qo'shing.",
    ru: "Перед сохранением добавьте свой API-токен к эндпоинту как ?api_token=….",
  },
  "Search Pipedrive for a person by name or email to find their deal owner.": {
    uz: "Bitim mas'ulini topish uchun Pipedrive'dan shaxsni ism yoki email bo'yicha qidirish.",
    ru: "Найти контакт в Pipedrive по имени или email, чтобы узнать ответственного за сделку.",
  },
  "Name, email or phone number to search for.": {
    uz: "Qidiriladigan ism, email yoki telefon raqami.",
    ru: "Имя, email или телефон для поиска.",
  },
  "Salesforce records": {
    uz: "Salesforce yozuvlari",
    ru: "Записи Salesforce",
  },
  "Read and update Accounts, Contacts and Cases through a connected app.": {
    uz: "Ulangan ilova orqali Accounts, Contacts va Cases'ni o'qish va yangilash.",
    ru: "Чтение и обновление Accounts, Contacts и Cases через подключённое приложение.",
  },
  "Needs a connected app and per-org instance URL, which the endpoint field cannot hold yet.":
    {
      uz: "Ulangan ilova va har bir tashkilot uchun alohida URL kerak — endpoint maydoni buni hali saqlay olmaydi.",
      ru: "Нужны подключённое приложение и URL инстанса организации, которые поле эндпоинта пока не поддерживает.",
    },
  "SOQL support so a lookup can span related objects in one call.": {
    uz: "Bitta chaqiruvda bog'liq obyektlarni qamrab olish uchun SOQL qo'llab-quvvatlashi.",
    ru: "Поддержка SOQL, чтобы один запрос охватывал связанные объекты.",
  },
  "ServiceNow incident": {
    uz: "ServiceNow hodisasi",
    ru: "Инцидент ServiceNow",
  },
  "File and track incidents on the ITSM instance your internal helpdesk already runs.":
    {
      uz: "Ichki yordam xizmatingiz ishlatadigan ITSM tizimida hodisalarni ro'yxatga olish va kuzatish.",
      ru: "Регистрировать и отслеживать инциденты в ITSM, которой уже пользуется ваша внутренняя поддержка.",
    },
  "Instance-scoped endpoints plus OAuth, so it needs the credential vault first.":
    {
      uz: "Tizimga bog'liq endpointlar va OAuth — avval ma'lumotlar xazinasi kerak.",
      ru: "Эндпоинты инстанса и OAuth — сначала нужно хранилище учётных данных.",
    },
  "Assignment groups and categories mapped from the conversation.": {
    uz: "Tayinlash guruhlari va toifalar suhbatdan aniqlanadi.",
    ru: "Группы назначения и категории определяются по диалогу.",
  },
  "Create a private app with contact read scope and paste its token as the credential.":
    {
      uz: "Kontaktlarni o'qish ruxsati bor shaxsiy ilova yarating va uning tokenini kirish ma'lumoti sifatida qo'ying.",
      ru: "Создайте приватное приложение с правом чтения контактов и вставьте его токен как учётные данные.",
    },
  "Look up a customer in HubSpot by their email address to confirm plan, owner and lifecycle stage.":
    {
      uz: "Tarif, mas'ul va hayot sikli bosqichini tasdiqlash uchun HubSpot'dan mijozni email bo'yicha topish.",
      ru: "Найти клиента в HubSpot по email, чтобы подтвердить тариф, ответственного и стадию жизненного цикла.",
    },
  "The customer's email address.": {
    uz: "Mijozning email manzili.",
    ru: "Email клиента.",
  },
  "HubSpot contact create": {
    uz: "HubSpot kontaktini yaratish",
    ru: "Создание контакта в HubSpot",
  },
  "Capture a qualified lead into the CRM without an operator retyping the conversation.":
    {
      uz: "Operator suhbatni qayta yozib o'tirmasdan, sifatli lidni CRM'ga kiritish.",
      ru: "Заносить квалифицированного лида в CRM без перепечатки диалога оператором.",
    },
  "Lead capture": {
    uz: "Lidlarni yig'ish",
    ru: "Сбор лидов",
  },
  "Writes only the properties in the template, so a stray field cannot be invented.":
    {
      uz: "Faqat shablondagi xususiyatlarni yozadi, shuning uchun ortiqcha maydon o'ylab topilmaydi.",
      ru: "Записывает только свойства из шаблона, поэтому лишнее поле не появится.",
    },
  "Needs crm.objects.contacts.write on the private app token.": {
    uz: "Shaxsiy ilova tokenida crm.objects.contacts.write kerak.",
    ru: "Токену приватного приложения нужен crm.objects.contacts.write.",
  },
  "Requires crm.objects.contacts.write.": {
    uz: "crm.objects.contacts.write talab qilinadi.",
    ru: "Требуется crm.objects.contacts.write.",
  },
  "Send a fixed query or mutation with variables, so the model chooses values and never the shape.":
    {
      uz: "O'zgaruvchilar bilan qat'iy query yoki mutation yuborish — model faqat qiymatlarni tanlaydi, tuzilishini emas.",
      ru: "Отправлять фиксированный query или mutation с переменными — модель выбирает значения, но не структуру.",
    },
  "The operation is pinned in the template; only the variables interpolate.": {
    uz: "Operatsiya shablonda mahkamlangan; faqat o'zgaruvchilar qo'yiladi.",
    ru: "Операция зафиксирована в шаблоне; подставляются только переменные.",
  },
  "One endpoint covers reads and writes, which suits internal APIs behind a gateway.":
    {
      uz: "Bitta endpoint o'qish va yozishni qamraydi — gateway ortidagi ichki API'lar uchun qulay.",
      ru: "Один эндпоинт для чтения и записи — удобно для внутренних API за шлюзом.",
    },
  "However your gateway authenticates.": {
    uz: "Gateway'ingiz qanday tasdiqlasa, shunday.",
    ru: "Как бы ни авторизовал ваш шлюз.",
  },
  "Replace the query string with your operation, and map each variable to a parameter.":
    {
      uz: "So'rov matnini o'z operatsiyangiz bilan almashtiring va har bir o'zgaruvchini parametrga bog'lang.",
      ru: "Замените строку запроса своей операцией и свяжите каждую переменную с параметром.",
    },
  "Run the stored GraphQL operation with the given variables.": {
    uz: "Saqlangan GraphQL operatsiyasini berilgan o'zgaruvchilar bilan ishga tushirish.",
    ru: "Выполнить сохранённую операцию GraphQL с заданными переменными.",
  },
  "Identifier to pass as the query variable.": {
    uz: "So'rov o'zgaruvchisi sifatida uzatiladigan identifikator.",
    ru: "Идентификатор для передачи как переменная запроса.",
  },
  "Your endpoint": {
    uz: "Sizning endpointingiz",
    ru: "Ваш эндпоинт",
  },
  "The simplest possible contract: your arguments arrive as flat JSON on one URL.":
    {
      uz: "Eng oddiy kelishuv: argumentlaringiz bitta URL'ga oddiy JSON ko'rinishida keladi.",
      ru: "Самый простой контракт: аргументы приходят плоским JSON на один URL.",
    },
  "No template": {
    uz: "Shablonsiz",
    ru: "Без шаблона",
  },
  "No headers, no body template — add a parameter and it appears in the payload.":
    {
      uz: "Sarlavha ham, tana shabloni ham yo'q — parametr qo'shsangiz, u yuboriladigan ma'lumotda paydo bo'ladi.",
      ru: "Ни заголовков, ни шаблона тела — добавьте параметр, и он появится в данных.",
    },
  "Good for a first integration you intend to replace with a typed one later.":
    {
      uz: "Keyinchalik aniqroq integratsiya bilan almashtirmoqchi bo'lgan birinchi integratsiya uchun qulay.",
      ru: "Подходит для первой интеграции, которую вы потом замените типизированной.",
    },
  "Endpoint URL": {
    uz: "Endpoint URL manzili",
    ru: "URL эндпоинта",
  },
  "Include a secret path segment or query token if the endpoint is public.": {
    uz: "Endpoint ochiq bo'lsa, maxfiy yo'l qismi yoki so'rov tokenini qo'shing.",
    ru: "Если эндпоинт публичный, добавьте секретный сегмент пути или токен в запросе.",
  },
  "Every parameter you add is delivered as a top-level key in the JSON body.": {
    uz: "Qo'shgan har bir parametringiz JSON tanasida yuqori darajadagi kalit sifatida yuboriladi.",
    ru: "Каждый добавленный параметр передаётся ключом верхнего уровня в JSON-теле.",
  },
  "Send the collected details to the team's endpoint for processing.": {
    uz: "To'plangan ma'lumotlarni qayta ishlash uchun jamoa endpointiga yuborish.",
    ru: "Отправить собранные данные на эндпоинт команды для обработки.",
  },
  "What the assistant is sending over.": {
    uz: "Yordamchi nimani yubormoqda.",
    ru: "Что отправляет ассистент.",
  },
  "Any identifier the endpoint needs.": {
    uz: "Endpointga kerak bo'lgan har qanday identifikator.",
    ru: "Любой идентификатор, нужный эндпоинту.",
  },
  "Status page check": {
    uz: "Holat sahifasini tekshirish",
    ru: "Проверка страницы статуса",
  },
  'Read your own public status endpoint so "is it down?" is answered from fact, not guesswork.':
    {
      uz: "\"Ishlamayaptimi?\" degan savolga taxmin bilan emas, fakt bilan javob berish uchun o'z ochiq holat endpointingizni o'qish.",
      ru: "Читать свой публичный эндпоинт статуса, чтобы на «оно упало?» отвечать фактами, а не догадками.",
    },
  Public: {
    uz: "Ochiq",
    ru: "Публичный",
  },
  "Most status pages expose summary.json publicly, so no credential is needed.":
    {
      uz: "Ko'pchilik holat sahifalari summary.json'ni ochiq beradi, shuning uchun kirish ma'lumoti kerak emas.",
      ru: "Большинство страниц статуса отдают summary.json публично, учётные данные не нужны.",
    },
  "Stops the assistant from denying an incident that is already declared.": {
    uz: "Yordamchi allaqachon e'lon qilingan nosozlikni inkor qilishiga yo'l qo'ymaydi.",
    ru: "Не даёт ассистенту отрицать уже объявленный инцидент.",
  },
  "Public status endpoints need no credential.": {
    uz: "Ochiq holat endpointlari uchun kirish ma'lumoti kerak emas.",
    ru: "Публичным эндпоинтам статуса учётные данные не нужны.",
  },
  "Point at your status page's summary.json — no parameters are needed.": {
    uz: "Holat sahifangizning summary.json manziliga yo'naltiring — parametrlar kerak emas.",
    ru: "Укажите summary.json вашей страницы статуса — параметры не нужны.",
  },
  "Check the public status page for ongoing incidents before answering an outage question.":
    {
      uz: "Nosozlik haqidagi savolga javob berishdan oldin ochiq holat sahifasida davom etayotgan hodisalarni tekshirish.",
      ru: "Проверить публичную страницу статуса на текущие инциденты перед ответом о сбое.",
    },
  "OpenAPI import": {
    uz: "OpenAPI import",
    ru: "Импорт OpenAPI",
  },
  "Any specification": {
    uz: "Har qanday spetsifikatsiya",
    ru: "Любая спецификация",
  },
  "Paste a spec, pick the operations to expose, and get typed tools with parameters filled in.":
    {
      uz: "Spetsifikatsiyani qo'ying, kerakli operatsiyalarni tanlang va parametrlari to'ldirilgan tayyor vositalarni oling.",
      ru: "Вставьте спецификацию, выберите операции и получите типизированные инструменты с заполненными параметрами.",
    },
  Bulk: {
    uz: "Ommaviy",
    ru: "Массово",
  },
  "Parameters, descriptions and body templates generated from the schema.": {
    uz: "Parametrlar, tavsiflar va tana shablonlari sxemadan yaratiladi.",
    ru: "Параметры, описания и шаблоны тела генерируются из схемы.",
  },
  "MCP servers": {
    uz: "MCP serverlar",
    ru: "MCP-серверы",
  },
  "Connect an MCP server and expose its tools to the assistant without wiring each one by hand.":
    {
      uz: "MCP serverni ulang va uning vositalarini har birini qo'lda sozlamasdan yordamchiga taqdim eting.",
      ru: "Подключите MCP-сервер и откройте его инструменты ассистенту без ручной настройки каждого.",
    },
  "One connection publishes every tool the server advertises.": {
    uz: "Bitta ulanish server e'lon qilgan barcha vositalarni taqdim etadi.",
    ru: "Одно подключение публикует все инструменты, которые предлагает сервер.",
  },
  "Tool definitions stay in sync with the server instead of being copied here.":
    {
      uz: "Vosita ta'riflari bu yerga nusxalanmaydi, server bilan sinxron qoladi.",
      ru: "Описания инструментов синхронизируются с сервером, а не копируются сюда.",
    },
  "Signed requests": {
    uz: "Imzolangan so'rovlar",
    ru: "Подписанные запросы",
  },
  "Prove the call came from your workspace with a request signature or a client certificate.":
    {
      uz: "So'rov imzosi yoki mijoz sertifikati bilan chaqiruv ish maydoningizdan kelganini isbotlash.",
      ru: "Подтверждать, что вызов пришёл из вашего пространства, подписью запроса или клиентским сертификатом.",
    },
  "HMAC signing over the body with a rotating shared secret.": {
    uz: "Almashib turuvchi umumiy sir bilan tana bo'yicha HMAC imzolash.",
    ru: "HMAC-подпись тела с периодически меняемым общим секретом.",
  },
  "Client certificates for endpoints that will not accept bearer tokens.": {
    uz: "Bearer tokenlarni qabul qilmaydigan endpointlar uchun mijoz sertifikatlari.",
    ru: "Клиентские сертификаты для эндпоинтов, которые не принимают bearer-токены.",
  },
  "REST lookup": {
    uz: "REST orqali topish",
    ru: "REST-поиск",
  },
  "Any HTTP API": {
    uz: "Har qanday HTTP API",
    ru: "Любой HTTP API",
  },
  "Read from any internal service — every parameter is appended to the URL as a query string.":
    {
      uz: "Har qanday ichki xizmatdan o'qish — har bir parametr URL'ga so'rov qatori sifatida qo'shiladi.",
      ru: "Читать из любого внутреннего сервиса — каждый параметр добавляется в URL как строка запроса.",
    },
  "Start here for internal APIs: point at the endpoint, name the parameters, done.":
    {
      uz: "Ichki API'lar uchun shundan boshlang: endpointni ko'rsating, parametrlarni nomlang — tayyor.",
      ru: "Начните отсюда для внутренних API: укажите эндпоинт, назовите параметры — готово.",
    },
  "GET calls carry no body, so there is no template to keep in sync.": {
    uz: "GET chaqiruvlarida tana yo'q, shuning uchun sinxron tutiladigan shablon ham yo'q.",
    ru: "У GET-вызовов нет тела, поэтому нет шаблона, который надо синхронизировать.",
  },
  "Outbound requests are fenced to public https hosts, redirects included.": {
    uz: "Chiquvchi so'rovlar, yo'naltirishlar ham, faqat ochiq https hostlar bilan cheklangan.",
    ru: "Исходящие запросы, включая редиректы, ограничены публичными https-хостами.",
  },
  "Bearer token": {
    uz: "Bearer token",
    ru: "Bearer-токен",
  },
  "Optional — leave the credential blank for an open endpoint.": {
    uz: "Ixtiyoriy — ochiq endpoint uchun kirish ma'lumotini bo'sh qoldiring.",
    ru: "Необязательно — для открытого эндпоинта оставьте учётные данные пустыми.",
  },
  "Each parameter becomes a query string value, so name them the way your API expects.":
    {
      uz: "Har bir parametr so'rov qatoridagi qiymatga aylanadi, shuning uchun ularni API kutganidek nomlang.",
      ru: "Каждый параметр становится значением строки запроса, поэтому называйте их так, как ждёт ваш API.",
    },
  "Look up a record in the internal service by the identifier the customer gives.":
    {
      uz: "Mijoz bergan identifikator bo'yicha ichki xizmatdan yozuvni topish.",
      ru: "Найти запись во внутреннем сервисе по идентификатору от клиента.",
    },
  "Identifier to look the record up by.": {
    uz: "Yozuvni topish uchun identifikator.",
    ru: "Идентификатор для поиска записи.",
  },
  "REST action": {
    uz: "REST harakati",
    ru: "REST-действие",
  },
  "Post a JSON body you shape yourself, with placeholders for whatever the model collected.":
    {
      uz: "O'zingiz tuzgan JSON tanasini model to'plagan ma'lumotlar uchun joy belgilari bilan yuborish.",
      ru: "Отправлять JSON-тело своей структуры с подстановками для собранных моделью данных.",
    },
  "Body template": {
    uz: "Tana shabloni",
    ru: "Шаблон тела",
  },
  "The body template is the contract — the model fills placeholders, it never designs the payload.":
    {
      uz: "Tana shabloni — bu kelishuv: model joy belgilarini to'ldiradi, tuzilishini o'zi yaratmaydi.",
      ru: "Шаблон тела — это контракт: модель заполняет подстановки, но не придумывает структуру.",
    },
  "Leave the template empty to post the raw arguments as a flat JSON object.": {
    uz: "Argumentlarni oddiy JSON obyekt sifatida yuborish uchun shablonni bo'sh qoldiring.",
    ru: "Оставьте шаблон пустым, чтобы отправлять аргументы плоским JSON-объектом.",
  },
  "Bearer, basic and custom header credentials are all masked in the editor.": {
    uz: "Bearer, basic va maxsus sarlavha ma'lumotlari muharrirda yashiriladi.",
    ru: "Учётные данные bearer, basic и своих заголовков скрываются в редакторе.",
  },
  "Optional — swap to a custom header if your API expects one.": {
    uz: "Ixtiyoriy — API'ingiz kutsa, maxsus sarlavhaga almashtiring.",
    ru: "Необязательно — замените на свой заголовок, если ваш API его ожидает.",
  },
  "Use {{parameter_name}} anywhere in the body template to place an argument.":
    {
      uz: "Argumentni joylash uchun tana shablonining istalgan joyida {{parameter_name}} dan foydalaning.",
      ru: "Используйте {{parameter_name}} в любом месте шаблона тела, чтобы подставить аргумент.",
    },
  "Create a record in the internal service from the details collected in the conversation.":
    {
      uz: "Suhbatda to'plangan ma'lumotlardan ichki xizmatda yozuv yaratish.",
      ru: "Создать запись во внутреннем сервисе по данным из диалога.",
    },
  "Short title for the record.": {
    uz: "Yozuv uchun qisqa sarlavha.",
    ru: "Короткий заголовок записи.",
  },
  "Everything worth recording about the request.": {
    uz: "So'rov haqida yozib qo'yishga arziydigan hamma narsa.",
    ru: "Всё, что стоит записать о запросе.",
  },
  "GraphQL operation": {
    uz: "GraphQL operatsiyasi",
    ru: "Операция GraphQL",
  },
  "Any GraphQL API": {
    uz: "Har qanday GraphQL API",
    ru: "Любой GraphQL API",
  },
  "Name to record.": {
    uz: "Yoziladigan ism.",
    ru: "Имя для записи.",
  },
  "Email address to record.": {
    uz: "Yoziladigan email manzil.",
    ru: "Email для записи.",
  },
  "Any extra context worth keeping on the record.": {
    uz: "Yozuvda saqlashga arziydigan qo'shimcha kontekst.",
    ru: "Дополнительный контекст, который стоит сохранить в записи.",
  },
  "Notion database query": {
    uz: "Notion bazasidan so'rov",
    ru: "Запрос к базе Notion",
  },
  "Search an internal wiki database — policies, inventory, FAQs — with a filter you define.":
    {
      uz: "Ichki wiki bazasidan — qoidalar, ombor, FAQ — siz belgilagan filtr bilan qidirish.",
      ru: "Искать во внутренней wiki-базе — правила, склад, FAQ — с заданным вами фильтром.",
    },
  Wiki: {
    uz: "Wiki",
    ru: "Wiki",
  },
  Filter: {
    uz: "Filtr",
    ru: "Фильтр",
  },
  "The integration only sees databases you explicitly share with it.": {
    uz: "Integratsiya faqat siz u bilan aniq ulashgan bazalarni ko'radi.",
    ru: "Интеграция видит только те базы, которыми вы явно с ней поделились.",
  },
  "Filter shape is fixed in the template, so the model cannot widen the query.":
    {
      uz: "Filtr tuzilishi shablonda qat'iy, shuning uchun model so'rovni kengaytira olmaydi.",
      ru: "Структура фильтра зафиксирована в шаблоне, модель не может расширить запрос.",
    },
  "Internal integration secret": {
    uz: "Ichki integratsiya siri",
    ru: "Секрет внутренней интеграции",
  },
  "Starts with ntn_ or secret_ — from notion.so/my-integrations.": {
    uz: "ntn_ yoki secret_ bilan boshlanadi — notion.so/my-integrations'dan.",
    ru: "Начинается с ntn_ или secret_ — из notion.so/my-integrations.",
  },
  "Share the database with your integration, then put its id in the endpoint.":
    {
      uz: "Bazani integratsiyangiz bilan ulashing, so'ng uning ID'sini endpointga yozing.",
      ru: "Поделитесь базой с интеграцией и укажите её ID в эндпоинте.",
    },
  "Search the internal Notion database for an entry matching the customer's question.":
    {
      uz: "Mijoz savoliga mos yozuvni ichki Notion bazasidan qidirish.",
      ru: "Найти во внутренней базе Notion запись по вопросу клиента.",
    },
  "Words to search the database titles for.": {
    uz: "Baza sarlavhalaridan qidiriladigan so'zlar.",
    ru: "Слова для поиска в заголовках базы.",
  },
  "Notion page create": {
    uz: "Notion sahifasini yaratish",
    ru: "Создание страницы Notion",
  },
  "File a structured note into a Notion database — feedback, bug reports, call summaries.":
    {
      uz: "Notion bazasiga tuzilgan eslatma yozish — fikr-mulohaza, xato hisobotlari, qo'ng'iroq xulosalari.",
      ru: "Записывать структурированную заметку в базу Notion — отзывы, баг-репорты, итоги звонков.",
    },
  "Writes a real database row, so views and filters in Notion pick it up immediately.":
    {
      uz: "Haqiqiy baza qatorini yozadi, shuning uchun Notion'dagi ko'rinish va filtrlar uni darhol ko'radi.",
      ru: "Записывает настоящую строку базы, поэтому представления и фильтры Notion сразу её видят.",
    },
  "The property names in the template must match the database schema exactly.":
    {
      uz: "Shablondagi xususiyat nomlari baza sxemasiga aynan mos kelishi kerak.",
      ru: "Названия свойств в шаблоне должны точно совпадать со схемой базы.",
    },
  "The integration must be shared into the target database.": {
    uz: "Integratsiya maqsadli bazaga ulashilgan bo'lishi kerak.",
    ru: "Интеграция должна иметь доступ к целевой базе.",
  },
  "Put your database id in the body template and share the database with the integration.":
    {
      uz: "Baza ID'sini tana shabloniga yozing va bazani integratsiya bilan ulashing.",
      ru: "Укажите ID базы в шаблоне тела и поделитесь базой с интеграцией.",
    },
  "Create an entry in the team's Notion database summarising the conversation.":
    {
      uz: "Jamoaning Notion bazasida suhbat xulosasi bilan yozuv yaratish.",
      ru: "Создать в базе Notion команды запись с итогом диалога.",
    },
  "Short title for the entry.": {
    uz: "Yozuv uchun qisqa sarlavha.",
    ru: "Короткий заголовок записи.",
  },
  "Summary of what the customer reported or asked for.": {
    uz: "Mijoz nima haqida xabar bergani yoki nima so'raganining qisqacha mazmuni.",
    ru: "Кратко, о чём сообщил или что попросил клиент.",
  },
  "Supabase function call": {
    uz: "Supabase funksiyasini chaqirish",
    ru: "Вызов функции Supabase",
  },
  "Call a Postgres function you wrote, so the assistant queries your database on your terms.":
    {
      uz: "O'zingiz yozgan Postgres funksiyasini chaqirish — yordamchi bazangizga sizning shartlaringiz bilan so'rov yuboradi.",
      ru: "Вызывать написанную вами функцию Postgres — ассистент обращается к базе на ваших условиях.",
    },
  "The function is the interface: row-level security and shaping stay in the database.":
    {
      uz: "Funksiya — bu interfeys: qator darajasidagi xavfsizlik va ma'lumot tuzilishi bazada qoladi.",
      ru: "Функция — это интерфейс: построчная безопасность и формирование данных остаются в базе.",
    },
  "No table access is granted — the assistant can only call what you exposed.":
    {
      uz: "Jadvallarga kirish berilmaydi — yordamchi faqat siz ochgan narsani chaqira oladi.",
      ru: "Доступ к таблицам не выдаётся — ассистент может вызывать только то, что вы открыли.",
    },
  "Use the anon key with RLS, or a service key when the function is security definer.":
    {
      uz: "RLS bilan anon kalitdan yoki funksiya security definer bo'lsa, service kalitdan foydalaning.",
      ru: "Используйте anon-ключ с RLS или service-ключ, если функция security definer.",
    },
  "Project API key": {
    uz: "Loyiha API kaliti",
    ru: "API-ключ проекта",
  },
  "Settings → API. Prefer the anon key with row-level security enabled.": {
    uz: "Settings → API. Qator darajasidagi xavfsizlik yoqilgan anon kalitni afzal ko'ring.",
    ru: "Settings → API. Лучше anon-ключ с включённой построчной безопасностью.",
  },
  "Create the Postgres function first, then point the endpoint at /rest/v1/rpc/<function-name>.":
    {
      uz: "Avval Postgres funksiyasini yarating, so'ng endpointni /rest/v1/rpc/<function-name> ga yo'naltiring.",
      ru: "Сначала создайте функцию Postgres, затем укажите эндпоинт /rest/v1/rpc/<function-name>.",
    },
  "Call the database function that returns a customer's record from their email address.":
    {
      uz: "Mijoz yozuvini email bo'yicha qaytaradigan baza funksiyasini chaqirish.",
      ru: "Вызвать функцию базы, которая возвращает запись клиента по email.",
    },
  "Email address to look the customer up by.": {
    uz: "Mijozni topish uchun email manzil.",
    ru: "Email для поиска клиента.",
  },
  "Supabase row insert": {
    uz: "Supabase'ga qator qo'shish",
    ru: "Вставка строки в Supabase",
  },
  "Insert straight into a table through PostgREST, with row-level security still enforced.":
    {
      uz: "PostgREST orqali to'g'ridan-to'g'ri jadvalga qo'shish, qator darajasidagi xavfsizlik amalda qoladi.",
      ru: "Вставлять прямо в таблицу через PostgREST с сохранением построчной безопасности.",
    },
  "Row-level security policies apply to the key you paste — the tool cannot bypass them.":
    {
      uz: "RLS qoidalari siz qo'ygan kalitga qo'llanadi — vosita ularni chetlab o'ta olmaydi.",
      ru: "Политики RLS применяются к вставленному ключу — инструмент не может их обойти.",
    },
  "Prefer: return=representation sends the inserted row back so the assistant can confirm it.":
    {
      uz: "Prefer: return=representation qo'shilgan qatorni qaytaradi, shunda yordamchi uni tasdiqlay oladi.",
      ru: "Prefer: return=representation возвращает вставленную строку, чтобы ассистент мог её подтвердить.",
    },
  "Use a key whose RLS policy allows exactly this insert.": {
    uz: "RLS qoidasi aynan shu qo'shishga ruxsat beradigan kalitdan foydalaning.",
    ru: "Используйте ключ, политика RLS которого разрешает ровно эту вставку.",
  },
  "Airtable record lookup": {
    uz: "Airtable yozuvini topish",
    ru: "Поиск записи Airtable",
  },
  "Point the endpoint at /rest/v1/<table> and match the body keys to your columns.":
    {
      uz: "Endpointni /rest/v1/<table> ga yo'naltiring va tana kalitlarini ustunlaringizga moslang.",
      ru: "Укажите эндпоинт /rest/v1/<table> и сопоставьте ключи тела со столбцами.",
    },
  "Insert a row into the table recording what the customer asked for.": {
    uz: "Mijoz nima so'raganini qayd etuvchi qatorni jadvalga qo'shish.",
    ru: "Добавить в таблицу строку о том, что попросил клиент.",
  },
  "Email address of the customer.": {
    uz: "Mijozning email manzili.",
    ru: "Email клиента.",
  },
  "What to record against them.": {
    uz: "Ular bo'yicha nimani qayd etish kerak.",
    ru: "Что записать по клиенту.",
  },
  "Smartsheet search": {
    uz: "Smartsheet qidiruvi",
    ru: "Поиск в Smartsheet",
  },
  "Search sheets your operations team maintains without giving the assistant edit rights.":
    {
      uz: "Yordamchiga tahrirlash huquqini bermasdan, operatsion jamoangiz yuritadigan jadvallardan qidirish.",
      ru: "Искать в таблицах операционной команды, не давая ассистенту прав на редактирование.",
    },
  Sheets: {
    uz: "Jadvallar",
    ru: "Таблицы",
  },
  "Searches everything the token's user can see, so sharing controls still hold.":
    {
      uz: "Token egasi ko'ra oladigan hamma narsadan qidiradi, shuning uchun ulashish sozlamalari amalda qoladi.",
      ru: "Ищет по всему, что видит владелец токена, поэтому настройки доступа сохраняются.",
    },
  "Returns the matching rows' context rather than a whole sheet.": {
    uz: "Butun jadvalni emas, mos qatorlar kontekstini qaytaradi.",
    ru: "Возвращает контекст найденных строк, а не всю таблицу.",
  },
  "API access token": {
    uz: "API kirish tokeni",
    ru: "Токен доступа API",
  },
  "Generated from Personal Settings → API Access.": {
    uz: "Personal Settings → API Access'da yaratiladi.",
    ru: "Создаётся в Personal Settings → API Access.",
  },
  "Scope the token to a workspace so the assistant cannot search the whole account.":
    {
      uz: "Yordamchi butun hisobdan qidira olmasligi uchun tokenni bitta ish maydoni bilan cheklang.",
      ru: "Ограничьте токен одним рабочим пространством, чтобы ассистент не искал по всему аккаунту.",
    },
  "Search Smartsheet for rows matching the customer's query.": {
    uz: "Mijoz so'roviga mos qatorlarni Smartsheet'dan qidirish.",
    ru: "Найти в Smartsheet строки по запросу клиента.",
  },
  "Text to search the sheets for.": {
    uz: "Jadvallardan qidiriladigan matn.",
    ru: "Текст для поиска в таблицах.",
  },
  "Elasticsearch query": {
    uz: "Elasticsearch so'rovi",
    ru: "Запрос Elasticsearch",
  },
  "Search an index you already run — product catalogue, docs, logs — from the conversation.":
    {
      uz: "Suhbatdan turib allaqachon ishlatayotgan indeksingizdan qidirish — mahsulotlar katalogi, hujjatlar, loglar.",
      ru: "Искать по вашему индексу — каталог товаров, документация, логи — прямо из диалога.",
    },
  "The query shape is fixed in the template; the model only supplies the search text.":
    {
      uz: "So'rov tuzilishi shablonda qat'iy; model faqat qidiruv matnini beradi.",
      ru: "Структура запроса зафиксирована в шаблоне; модель передаёт только текст поиска.",
    },
  "size caps the hits so a broad match cannot flood the reply.": {
    uz: "size natijalar sonini cheklaydi, shuning uchun keng moslik javobni to'ldirib yubormaydi.",
    ru: "size ограничивает число результатов, чтобы широкое совпадение не переполнило ответ.",
  },
  "Works against Elastic Cloud or a self-hosted cluster reachable over https.":
    {
      uz: "Elastic Cloud yoki https orqali ochiq o'z serveringizdagi klaster bilan ishlaydi.",
      ru: "Работает с Elastic Cloud или собственным кластером, доступным по https.",
    },
  "Elasticsearch API key": {
    uz: "Elasticsearch API kaliti",
    ru: "API-ключ Elasticsearch",
  },
  "Find a record in a base by email, order id or any field, using a formula you control.":
    {
      uz: "Siz boshqaradigan formula orqali bazadan email, buyurtma ID yoki istalgan maydon bo'yicha yozuv topish.",
      ru: "Найти запись в базе по email, ID заказа или любому полю с помощью вашей формулы.",
    },
  "Send it as ApiKey <base64-id:key> — created in Kibana under Stack Management.":
    {
      uz: "Uni ApiKey <base64-id:key> ko'rinishida yuboring — Kibana'da Stack Management bo'limida yaratiladi.",
      ru: "Отправляйте как ApiKey <base64-id:key> — создаётся в Kibana в Stack Management.",
    },
  "Point the endpoint at /<index>/_search and edit the fields list to match your mapping.":
    {
      uz: "Endpointni /<index>/_search ga yo'naltiring va maydonlar ro'yxatini mappingingizga moslang.",
      ru: "Укажите эндпоинт /<index>/_search и поправьте список полей под ваш маппинг.",
    },
  Base: {
    uz: "Baza",
    ru: "База",
  },
  Formula: {
    uz: "Formula",
    ru: "Формула",
  },
  "Search the product index for entries matching the customer's question.": {
    uz: "Mijoz savoliga mos yozuvlarni mahsulotlar indeksidan qidirish.",
    ru: "Найти в индексе товаров записи по вопросу клиента.",
  },
  "What the customer is looking for.": {
    uz: "Mijoz nimani qidirmoqda.",
    ru: "Что ищет клиент.",
  },
  "The filter formula lives in the template, so the model supplies a value and never a query.":
    {
      uz: "Filtr formulasi shablonda, shuning uchun model so'rov emas, faqat qiymat beradi.",
      ru: "Формула фильтра хранится в шаблоне, поэтому модель передаёт значение, а не запрос.",
    },
  "SQL query": {
    uz: "SQL so'rov",
    ru: "SQL-запрос",
  },
  "Run a parameterised, read-only statement against a database you connect once.":
    {
      uz: "Bir marta ulanadigan bazaga parametrli, faqat o'qish uchun so'rovni bajarish.",
      ru: "Выполнять параметризованный запрос только на чтение к базе, подключаемой один раз.",
    },
  Database: {
    uz: "Ma'lumotlar bazasi",
    ru: "База данных",
  },
  "maxRecords caps what comes back, keeping the reply inside the response budget.":
    {
      uz: "maxRecords qaytadigan natijalarni cheklaydi va javobni chegarada saqlaydi.",
      ru: "maxRecords ограничивает выдачу и удерживает ответ в рамках бюджета.",
    },
  "Statements are stored and parameterised — the model fills placeholders, never writes SQL.":
    {
      uz: "So'rovlar saqlanadi va parametrlanadi — model joy belgilarini to'ldiradi, SQL yozmaydi.",
      ru: "Запросы хранятся параметризованными — модель заполняет подстановки, а не пишет SQL.",
    },
  "Needs a pooled connection and a credential vault, which is the piece still missing.":
    {
      uz: "Ulanishlar puli va ma'lumotlar xazinasi kerak — hozircha aynan shu yetishmayapti.",
      ru: "Нужны пул соединений и хранилище учётных данных — их пока и не хватает.",
    },
  "Warehouse query": {
    uz: "Ma'lumotlar ombori so'rovi",
    ru: "Запрос к хранилищу данных",
  },
  "A personal access token scoped to one base is enough.": {
    uz: "Bitta bazaga cheklangan shaxsiy kirish tokeni yetarli.",
    ru: "Достаточно личного токена доступа, ограниченного одной базой.",
  },
  "Answer analytics questions from the warehouse with a saved, cost-bounded query.":
    {
      uz: "Saqlangan, xarajati cheklangan so'rov bilan analitika savollariga ma'lumotlar omboridan javob berish.",
      ru: "Отвечать на аналитические вопросы из хранилища сохранённым запросом с ограничением стоимости.",
    },
  "Byte and row limits enforced before the query runs.": {
    uz: "So'rov ishlashidan oldin bayt va qatorlar cheklovi qo'llanadi.",
    ru: "Лимиты байтов и строк применяются до выполнения запроса.",
  },
  "Results cached per parameter set so repeated questions cost nothing.": {
    uz: "Natijalar har bir parametr to'plami uchun keshlanadi, shuning uchun takroriy savollar bepul.",
    ru: "Результаты кешируются по набору параметров, поэтому повторные вопросы ничего не стоят.",
  },
  "Personal access token": {
    uz: "Shaxsiy kirish tokeni",
    ru: "Личный токен доступа",
  },
  "Create one at airtable.com/create/tokens with data.records:read on the base.":
    {
      uz: "airtable.com/create/tokens'da baza uchun data.records:read bilan yarating.",
      ru: "Создайте на airtable.com/create/tokens с data.records:read для базы.",
    },
  "Put your base and table ids in the endpoint, then edit the formula to match your field names.":
    {
      uz: "Baza va jadval ID'larini endpointga yozing, so'ng formulani maydon nomlaringizga moslang.",
      ru: "Укажите ID базы и таблицы в эндпоинте и поправьте формулу под названия полей.",
    },
  "Look up a record in the Airtable base by the customer's email address.": {
    uz: "Airtable bazasidan mijoz yozuvini email bo'yicha topish.",
    ru: "Найти запись клиента в базе Airtable по email.",
  },
  "Email address to search the base for.": {
    uz: "Bazadan qidiriladigan email manzil.",
    ru: "Email для поиска в базе.",
  },
  "Airtable record create": {
    uz: "Airtable yozuvini yaratish",
    ru: "Создание записи Airtable",
  },
  "Log a request, a lead or a booking into the base your operations team already works from.":
    {
      uz: "So'rov, lid yoki bronni operatsion jamoangiz ishlaydigan bazaga yozish.",
      ru: "Записывать запрос, лида или бронь в базу, с которой уже работает ваша команда.",
    },
  Write: {
    uz: "Yozish",
    ru: "Запись",
  },
  "Field names in the template are the contract — a renamed column fails loudly instead of writing junk.":
    {
      uz: "Shablondagi maydon nomlari — bu kelishuv: nomi o'zgargan ustun noto'g'ri ma'lumot yozish o'rniga aniq xato beradi.",
      ru: "Названия полей в шаблоне — это контракт: переименованный столбец даст явную ошибку, а не запишет мусор.",
    },
  "typecast lets Airtable coerce a select option it recognises.": {
    uz: "typecast Airtable'ga tanish select variantini moslashtirishga imkon beradi.",
    ru: "typecast позволяет Airtable привести знакомый вариант select.",
  },
  "Needs data.records:write on the base.": {
    uz: "Bazada data.records:write kerak.",
    ru: "Нужен data.records:write для базы.",
  },
  "Match the field names in the body template to the columns in your table.": {
    uz: "Tana shablonidagi maydon nomlarini jadvalingiz ustunlariga moslang.",
    ru: "Сопоставьте названия полей в шаблоне тела со столбцами таблицы.",
  },
  "Add a record to the Airtable base with the details captured in the conversation.":
    {
      uz: "Suhbatda olingan ma'lumotlar bilan Airtable bazasiga yozuv qo'shish.",
      ru: "Добавить запись в базу Airtable с данными из диалога.",
    },
  "No credential": {
    uz: "Kirish ma'lumoti yo'q",
    ru: "Без учётных данных",
  },
  "HTTP endpoint": {
    uz: "HTTP endpoint",
    ru: "HTTP-эндпоинт",
  },
  "API request": {
    uz: "API so'rovi",
    ru: "API-запрос",
  },
  Assistant: {
    uz: "Yordamchi",
    ru: "Ассистент",
  },
  "Reads data": {
    uz: "Ma'lumot o'qiydi",
    ru: "Читает данные",
  },
  "Writes data": {
    uz: "Ma'lumot yozadi",
    ru: "Записывает данные",
  },
  "Sends a message": {
    uz: "Xabar yuboradi",
    ru: "Отправляет сообщение",
  },
  Query: {
    uz: "So'rov",
    ru: "Запрос",
  },
  "Assistant action": {
    uz: "Yordamchi harakati",
    ru: "Действие ассистента",
  },
  Handoff: {
    uz: "Uzatish",
    ru: "Передача",
  },
  "The message to post in Slack.": {
    uz: "Slack'ga yuboriladigan xabar.",
    ru: "Сообщение для отправки в Slack.",
  },
  "Discord alert": {
    uz: "Discord ogohlantirishi",
    ru: "Оповещение в Discord",
  },
  "Send the assistant's message to a Discord channel webhook — useful for community and ops rooms.":
    {
      uz: "Yordamchi xabarini Discord kanal webhookiga yuborish — hamjamiyat va operatsion xonalar uchun qulay.",
      ru: "Отправлять сообщение ассистента в вебхук канала Discord — удобно для сообщества и операционных комнат.",
    },
  "Channel settings → Integrations → Webhooks is the entire setup.": {
    uz: "Kanal sozlamalari → Integrations → Webhooks — bor-yo'q sozlash shu.",
    ru: "Настройки канала → Integrations → Webhooks — вот и вся настройка.",
  },
  "Post as a named bot with your own avatar by extending the body template.": {
    uz: "Tana shablonini kengaytirib, o'z avataringiz bilan nomli bot sifatida yuboring.",
    ru: "Публикуйте от имени бота со своим аватаром, расширив шаблон тела.",
  },
  "Channel webhook URL": {
    uz: "Kanal webhook URL manzili",
    ru: "URL вебхука канала",
  },
  "Anyone with this URL can post to the channel.": {
    uz: "Bu URL manzili bor har kim kanalga xabar yoza oladi.",
    ru: "Любой, у кого есть этот URL, может писать в канал.",
  },
  "Channel settings → Integrations → Webhooks → copy the webhook URL.": {
    uz: "Kanal sozlamalari → Integrations → Webhooks → webhook URL'ni nusxalang.",
    ru: "Настройки канала → Integrations → Webhooks → скопируйте URL вебхука.",
  },
  "Post an alert message into the team's Discord channel.": {
    uz: "Jamoaning Discord kanaliga ogohlantirish xabarini yuborish.",
    ru: "Отправить оповещение в Discord-канал команды.",
  },
  "The message to post in Discord.": {
    uz: "Discord'ga yuboriladigan xabar.",
    ru: "Сообщение для отправки в Discord.",
  },
  "Telegram message": {
    uz: "Telegram xabari",
    ru: "Сообщение в Telegram",
  },
  "Deliver a message through your Telegram bot to a chat or group the team watches.":
    {
      uz: "Telegram botingiz orqali jamoa kuzatadigan chat yoki guruhga xabar yetkazish.",
      ru: "Доставлять сообщение через вашего Telegram-бота в чат или группу команды.",
    },
  "Bot API": {
    uz: "Bot API",
    ru: "Bot API",
  },
  "Works with groups, channels and one-to-one chats.": {
    uz: "Guruhlar, kanallar va shaxsiy chatlar bilan ishlaydi.",
    ru: "Работает с группами, каналами и личными чатами.",
  },
  "The bot token sits in the endpoint, so no extra header is needed.": {
    uz: "Bot tokeni endpointda, shuning uchun qo'shimcha sarlavha kerak emas.",
    ru: "Токен бота находится в эндпоинте, дополнительный заголовок не нужен.",
  },
  "Bot token in the endpoint": {
    uz: "Endpointdagi bot tokeni",
    ru: "Токен бота в эндпоинте",
  },
  "The token is part of the URL — rotate it in BotFather if it leaks.": {
    uz: "Token URL'ning bir qismi — oshkor bo'lsa, BotFather'da yangilang.",
    ru: "Токен — часть URL; если он утёк, смените его в BotFather.",
  },
  "Put your bot token in the endpoint and the destination chat id in the body template.":
    {
      uz: "Bot tokeningizni endpointga, qabul qiluvchi chat ID'sini esa tana shabloniga yozing.",
      ru: "Укажите токен бота в эндпоинте, а ID чата получателя — в шаблоне тела.",
    },
  "Send a message to the team's Telegram chat.": {
    uz: "Jamoaning Telegram chatiga xabar yuborish.",
    ru: "Отправить сообщение в Telegram-чат команды.",
  },
  "The message text to send.": {
    uz: "Yuboriladigan xabar matni.",
    ru: "Текст сообщения для отправки.",
  },
  "Microsoft Teams alert": {
    uz: "Microsoft Teams ogohlantirishi",
    ru: "Оповещение в Microsoft Teams",
  },
  "Drop a card into a Teams channel through a Workflows (Power Automate) webhook.":
    {
      uz: "Workflows (Power Automate) webhooki orqali Teams kanaliga karta yuborish.",
      ru: "Отправлять карточку в канал Teams через вебхук Workflows (Power Automate).",
    },
  "Uses the Workflows connector that replaced Office 365 connectors.": {
    uz: "Office 365 konnektorlari o'rnini bosgan Workflows konnektoridan foydalanadi.",
    ru: "Использует коннектор Workflows, заменивший коннекторы Office 365.",
  },
  "The flow URL is channel-scoped, so the assistant cannot address the whole tenant.":
    {
      uz: "Oqim URL'i bitta kanal bilan cheklangan, shuning uchun yordamchi butun tashkilotga yoza olmaydi.",
      ru: "URL потока привязан к каналу, поэтому ассистент не может писать во весь тенант.",
    },
  "Workflow HTTP trigger URL": {
    uz: "Workflow HTTP trigger URL manzili",
    ru: "URL HTTP-триггера workflow",
  },
  "Created from the channel's Workflows → Post to a channel when a webhook request is received.":
    {
      uz: "Kanalning Workflows → Post to a channel when a webhook request is received bo'limidan yaratiladi.",
      ru: "Создаётся в канале: Workflows → Post to a channel when a webhook request is received.",
    },
  "Create the Workflows trigger in the Teams channel and paste its URL here.": {
    uz: "Teams kanalida Workflows triggerini yarating va uning URL manzilini shu yerga qo'ying.",
    ru: "Создайте триггер Workflows в канале Teams и вставьте его URL сюда.",
  },
  "Post an alert into the team's Microsoft Teams channel.": {
    uz: "Jamoaning Microsoft Teams kanaliga ogohlantirish yuborish.",
    ru: "Отправить оповещение в канал Microsoft Teams команды.",
  },
  "The alert text to post in Teams.": {
    uz: "Teams'ga yuboriladigan ogohlantirish matni.",
    ru: "Текст оповещения для Teams.",
  },
  "WhatsApp message": {
    uz: "WhatsApp xabari",
    ru: "Сообщение в WhatsApp",
  },
  "Reply to a customer on WhatsApp with a template or a free-form message inside the service window.":
    {
      uz: "Mijozga WhatsApp'da shablon yoki xizmat oynasi ichida erkin xabar bilan javob berish.",
      ru: "Отвечать клиенту в WhatsApp шаблоном или свободным сообщением в пределах окна обслуживания.",
    },
  "Cloud API": {
    uz: "Cloud API",
    ru: "Cloud API",
  },
  "Sends through your own WhatsApp Business number.": {
    uz: "O'zingizning WhatsApp Business raqamingiz orqali yuboradi.",
    ru: "Отправляет с вашего номера WhatsApp Business.",
  },
  "Free-form text only works inside the 24-hour service window — use a template outside it.":
    {
      uz: "Erkin matn faqat 24 soatlik xizmat oynasi ichida ishlaydi — undan tashqarida shablon ishlating.",
      ru: "Свободный текст работает только в 24-часовом окне обслуживания — вне его используйте шаблон.",
    },
  "System user access token": {
    uz: "Tizim foydalanuvchisi kirish tokeni",
    ru: "Токен доступа системного пользователя",
  },
  "Generated in Meta Business settings for the WhatsApp app.": {
    uz: "WhatsApp ilovasi uchun Meta Business sozlamalarida yaratiladi.",
    ru: "Создаётся в настройках Meta Business для приложения WhatsApp.",
  },
  "Put your phone number id in the endpoint and the system user token in the credential field.":
    {
      uz: "Telefon raqami ID'sini endpointga, tizim foydalanuvchisi tokenini esa ma'lumotlar maydoniga yozing.",
      ru: "Укажите ID номера телефона в эндпоинте, а токен системного пользователя — в поле учётных данных.",
    },
  "Send a WhatsApp message to a customer's phone number in E.164 format.": {
    uz: "Mijozning E.164 formatidagi telefon raqamiga WhatsApp xabarini yuborish.",
    ru: "Отправить сообщение WhatsApp на номер клиента в формате E.164.",
  },
  "Destination phone number in E.164 format, e.g. +14155550123.": {
    uz: "Qabul qiluvchi telefon raqami E.164 formatida, masalan, +14155550123.",
    ru: "Номер получателя в формате E.164, например +14155550123.",
  },
  "The message body to send.": {
    uz: "Yuboriladigan xabar matni.",
    ru: "Текст сообщения для отправки.",
  },
  "SMS message": {
    uz: "SMS xabar",
    ru: "SMS-сообщение",
  },
  "Text a customer a code, a confirmation or a link straight from the conversation.":
    {
      uz: "Suhbatdan to'g'ridan-to'g'ri mijozga kod, tasdiq yoki havolani SMS orqali yuborish.",
      ru: "Отправлять клиенту код, подтверждение или ссылку по SMS прямо из диалога.",
    },
  "Form-encoded, exactly as the Twilio Messages resource expects.": {
    uz: "Twilio Messages resursi kutganidek, aynan form-encoded ko'rinishida.",
    ru: "В формате form-encoded — ровно как ожидает ресурс Twilio Messages.",
  },
  "Your sending number is fixed in the body, so the assistant only chooses the recipient.":
    {
      uz: "Yuboruvchi raqamingiz tanada qat'iy belgilangan, shuning uchun yordamchi faqat qabul qiluvchini tanlaydi.",
      ru: "Ваш номер отправителя зафиксирован в теле, ассистент выбирает только получателя.",
    },
  "Account SID and auth token": {
    uz: "Account SID va auth token",
    ru: "Account SID и auth token",
  },
  "Base64 of ACxxxx:auth_token — from the Twilio console.": {
    uz: "ACxxxx:auth_token ning Base64 ko'rinishi — Twilio konsolidan.",
    ru: "Base64 от ACxxxx:auth_token — из консоли Twilio.",
  },
  "Twilio expects form encoding — keep the content type header and set your sending number in the body.":
    {
      uz: "Twilio form encoding kutadi — content type sarlavhasini qoldiring va tanada yuboruvchi raqamingizni yozing.",
      ru: "Twilio ожидает form encoding — оставьте заголовок content type и укажите номер отправителя в теле.",
    },
  "Send an SMS message to a customer phone number.": {
    uz: "Mijoz telefon raqamiga SMS xabar yuborish.",
    ru: "Отправить SMS на номер клиента.",
  },
  "Slack alert": {
    uz: "Slack ogohlantirishi",
    ru: "Оповещение в Slack",
  },
  "Destination phone number in E.164 format.": {
    uz: "Qabul qiluvchi telefon raqami E.164 formatida.",
    ru: "Номер получателя в формате E.164.",
  },
  "The SMS body to send.": {
    uz: "Yuboriladigan SMS matni.",
    ru: "Текст SMS для отправки.",
  },
  "WhatsApp via Twilio": {
    uz: "Twilio orqali WhatsApp",
    ru: "WhatsApp через Twilio",
  },
  "Send WhatsApp messages on the Twilio number you already run your SMS traffic through.":
    {
      uz: "SMS trafigingiz o'tadigan Twilio raqami orqali WhatsApp xabarlarini yuborish.",
      ru: "Отправлять WhatsApp-сообщения с номера Twilio, через который уже идут ваши SMS.",
    },
  "Same credentials and console as your Twilio SMS traffic.": {
    uz: "Twilio SMS trafigingiz bilan bir xil kirish ma'lumotlari va konsol.",
    ru: "Те же учётные данные и консоль, что и для SMS в Twilio.",
  },
  "The whatsapp: prefix on both numbers is what routes it off SMS.": {
    uz: "Ikkala raqamdagi whatsapp: prefiksi xabarni SMS'dan boshqa yo'lga yo'naltiradi.",
    ru: "Префикс whatsapp: у обоих номеров уводит сообщение из SMS.",
  },
  "Prefix both numbers with whatsapp: — the sending number is already set in the body.":
    {
      uz: "Ikkala raqam oldiga whatsapp: qo'shing — yuboruvchi raqam tanada allaqachon yozilgan.",
      ru: "Добавьте whatsapp: перед обоими номерами — номер отправителя уже задан в теле.",
    },
  "Send a WhatsApp message to a customer through Twilio.": {
    uz: "Twilio orqali mijozga WhatsApp xabarini yuborish.",
    ru: "Отправить клиенту сообщение WhatsApp через Twilio.",
  },
  "Destination number in E.164 format, without the prefix.": {
    uz: "Qabul qiluvchi raqam E.164 formatida, prefiksiz.",
    ru: "Номер получателя в формате E.164, без префикса.",
  },
  "Transactional email": {
    uz: "Tranzaksion email",
    ru: "Транзакционное письмо",
  },
  "Let the assistant send a confirmation, summary or follow-up email from your own domain.":
    {
      uz: "Yordamchiga o'z domeningizdan tasdiq, xulosa yoki keyingi email yuborishga ruxsat berish.",
      ru: "Пусть ассистент отправляет подтверждения, итоги и письма-напоминания с вашего домена.",
    },
  "Sends from a domain you have already verified, so it lands in the inbox.": {
    uz: "Allaqachon tasdiqlangan domendan yuboradi, shuning uchun xat Inbox'ga tushadi.",
    ru: "Отправляет с уже подтверждённого домена, поэтому письмо попадает во входящие.",
  },
  "The from-address is fixed in the template — the assistant only fills recipient, subject and body.":
    {
      uz: "Yuboruvchi manzil shablonda qat'iy — yordamchi faqat qabul qiluvchi, mavzu va matnni to'ldiradi.",
      ru: "Адрес отправителя зафиксирован в шаблоне — ассистент заполняет только получателя, тему и текст.",
    },
  "Accepts simple HTML, so a summary can keep its formatting.": {
    uz: "Oddiy HTML'ni qabul qiladi, shuning uchun xulosa formatlanishini saqlaydi.",
    ru: "Принимает простой HTML, поэтому итог сохраняет форматирование.",
  },
  "Resend API key": {
    uz: "Resend API kaliti",
    ru: "API-ключ Resend",
  },
  "Starts with re_ — created under API Keys in the Resend dashboard.": {
    uz: "re_ bilan boshlanadi — Resend panelidagi API Keys bo'limida yaratiladi.",
    ru: "Начинается с re_ — создаётся в разделе API Keys панели Resend.",
  },
  "Add your Resend API key as the bearer token and set the verified from-address in the body.":
    {
      uz: "Resend API kalitini bearer token sifatida qo'shing va tanada tasdiqlangan yuboruvchi manzilni yozing.",
      ru: "Добавьте API-ключ Resend как bearer-токен и укажите подтверждённый адрес отправителя в теле.",
    },
  "Send a transactional email to the customer with a subject and body.": {
    uz: "Mijozga mavzu va matn bilan tranzaksion email yuborish.",
    ru: "Отправить клиенту транзакционное письмо с темой и текстом.",
  },
  "Post into a Slack channel through an incoming webhook when the assistant needs a human to look.":
    {
      uz: "Yordamchiga odam qarashi kerak bo'lganda, incoming webhook orqali Slack kanaliga yozish.",
      ru: "Писать в канал Slack через входящий вебхук, когда ассистенту нужен взгляд человека.",
    },
  "Recipient email address.": {
    uz: "Qabul qiluvchining email manzili.",
    ru: "Email получателя.",
  },
  "Subject line of the email.": {
    uz: "Email mavzusi.",
    ru: "Тема письма.",
  },
  "Body of the email, in plain text or simple HTML.": {
    uz: "Email matni, oddiy matn yoki oddiy HTML ko'rinishida.",
    ru: "Текст письма — обычный текст или простой HTML.",
  },
  "Email via SendGrid": {
    uz: "SendGrid orqali email",
    ru: "Email через SendGrid",
  },
  "Incoming webhook": {
    uz: "Incoming webhook",
    ru: "Входящий вебхук",
  },
  Notify: {
    uz: "Xabardor qilish",
    ru: "Уведомить",
  },
  "Send through the SendGrid mail pipeline your marketing and product email already uses.":
    {
      uz: "Marketing va mahsulot xatlaringiz ishlatadigan SendGrid pochta tizimi orqali yuborish.",
      ru: "Отправлять через почтовый конвейер SendGrid, которым уже пользуются ваши маркетинговые и продуктовые письма.",
    },
  "Reuses the sender identity and suppression lists you already maintain.": {
    uz: "Siz allaqachon yuritadigan yuboruvchi ma'lumotlari va bloklash ro'yxatlaridan foydalanadi.",
    ru: "Использует уже настроенные данные отправителя и списки подавления.",
  },
  "Returns 202 with an empty body on success — the assistant sees the confirmation, not a payload.":
    {
      uz: "Muvaffaqiyatli bo'lsa, bo'sh tana bilan 202 qaytaradi — yordamchi ma'lumot emas, tasdiqni ko'radi.",
      ru: "При успехе возвращает 202 с пустым телом — ассистент видит подтверждение, а не данные.",
    },
  "SendGrid API key": {
    uz: "SendGrid API kaliti",
    ru: "API-ключ SendGrid",
  },
  "Needs only the Mail Send permission.": {
    uz: "Faqat Mail Send ruxsati kerak.",
    ru: "Нужно только право Mail Send.",
  },
  "No Slack app review — an incoming webhook URL is the whole setup.": {
    uz: "Slack ilovasini tekshiruvdan o'tkazish kerak emas — incoming webhook URL'i bor-yo'g'i sozlash.",
    ru: "Не нужна проверка приложения Slack — вся настройка это URL входящего вебхука.",
  },
  "Set the verified from-address in the body template, then paste a Mail Send API key.":
    {
      uz: "Tana shablonida tasdiqlangan yuboruvchi manzilni yozing, so'ng Mail Send API kalitini qo'ying.",
      ru: "Укажите подтверждённый адрес отправителя в шаблоне тела, затем вставьте API-ключ Mail Send.",
    },
  "Send an email to the customer through SendGrid.": {
    uz: "SendGrid orqali mijozga email yuborish.",
    ru: "Отправить клиенту письмо через SendGrid.",
  },
  "The webhook is already scoped to one channel, so the assistant cannot post anywhere else.":
    {
      uz: "Webhook allaqachon bitta kanal bilan cheklangan, shuning uchun yordamchi boshqa joyga yoza olmaydi.",
      ru: "Вебхук уже привязан к одному каналу, поэтому ассистент не может писать в другие.",
    },
  "Plain-text body of the email.": {
    uz: "Emailning oddiy matnli qismi.",
    ru: "Текст письма без форматирования.",
  },
  "Safe on voice: the assistant can raise a flag mid-call without leaving the call.":
    {
      uz: "Ovozli kanalda xavfsiz: yordamchi qo'ng'iroqdan chiqmasdan signal bera oladi.",
      ru: "Безопасно для голоса: ассистент может поднять флаг, не выходя из звонка.",
    },
  "Email via Postmark": {
    uz: "Postmark orqali email",
    ru: "Email через Postmark",
  },
  "Transactional delivery on a separate stream, so assistant mail never mixes with bulk sends.":
    {
      uz: "Alohida oqimda tranzaksion yetkazish, shuning uchun yordamchi xatlari ommaviy yuborishlar bilan aralashmaydi.",
      ru: "Транзакционная доставка отдельным потоком — письма ассистента не смешиваются с массовыми рассылками.",
    },
  "Server token": {
    uz: "Server tokeni",
    ru: "Токен сервера",
  },
  "Message streams keep transactional mail off your broadcast reputation.": {
    uz: "Xabar oqimlari tranzaksion xatlarni ommaviy yuborishlar obro'sidan ajratadi.",
    ru: "Потоки сообщений отделяют транзакционные письма от репутации рассылок.",
  },
  "The server token scopes the tool to one Postmark server.": {
    uz: "Server tokeni vositani bitta Postmark server bilan cheklaydi.",
    ru: "Токен сервера ограничивает инструмент одним сервером Postmark.",
  },
  "Postmark server token": {
    uz: "Postmark server tokeni",
    ru: "Токен сервера Postmark",
  },
  "Found under the server's API Tokens tab.": {
    uz: "Serverning API Tokens bo'limida joylashgan.",
    ru: "Находится на вкладке API Tokens сервера.",
  },
  "Incoming webhook URL": {
    uz: "Incoming webhook URL manzili",
    ru: "URL входящего вебхука",
  },
  "Paste the server token and set a verified sender signature in the body template.":
    {
      uz: "Server tokenini qo'ying va tana shablonida tasdiqlangan yuboruvchi imzosini yozing.",
      ru: "Вставьте токен сервера и укажите подтверждённую подпись отправителя в шаблоне тела.",
    },
  "Send a transactional email through Postmark.": {
    uz: "Postmark orqali tranzaksion email yuborish.",
    ru: "Отправить транзакционное письмо через Postmark.",
  },
  "The URL is the credential — treat it as a secret.": {
    uz: "URL — bu kirish ma'lumoti, uni sir sifatida saqlang.",
    ru: "URL — это учётные данные, храните его в секрете.",
  },
  "PagerDuty incident": {
    uz: "PagerDuty hodisasi",
    ru: "Инцидент PagerDuty",
  },
  "Raise an incident on the on-call rotation when a conversation turns into an outage report.":
    {
      uz: "Suhbat nosozlik haqidagi xabarga aylansa, navbatchilar jadvalida hodisa ochish.",
      ru: "Поднимать инцидент на дежурную смену, когда диалог превращается в сообщение о сбое.",
    },
  "Events API": {
    uz: "Events API",
    ru: "Events API",
  },
  "On-call": {
    uz: "Navbatchilik",
    ru: "Дежурство",
  },
  "Goes through Events API v2, so routing and escalation policies still apply.":
    {
      uz: "Events API v2 orqali o'tadi, shuning uchun yo'naltirish va eskalatsiya qoidalari amalda qoladi.",
      ru: "Идёт через Events API v2, поэтому правила маршрутизации и эскалации продолжают действовать.",
    },
  "Severity is a parameter, so the assistant can distinguish a nuisance from an outage.":
    {
      uz: "Jiddiylik — parametr, shuning uchun yordamchi mayda muammoni nosozlikdan ajrata oladi.",
      ru: "Важность — это параметр, поэтому ассистент отличит мелочь от сбоя.",
    },
  "A dedup key stops one recurring complaint from paging twice.": {
    uz: "Dedup kaliti bitta takroriy shikoyat ikki marta chaqirishiga yo'l qo'ymaydi.",
    ru: "Ключ дедупликации не даёт одной повторной жалобе вызвать дежурного дважды.",
  },
  "Routing key in the body": {
    uz: "Tanadagi yo'naltirish kaliti",
    ru: "Ключ маршрутизации в теле",
  },
  "The integration routing key identifies the service — it lives in the body template.":
    {
      uz: "Integratsiya yo'naltirish kaliti xizmatni aniqlaydi — u tana shablonida turadi.",
      ru: "Ключ маршрутизации интеграции определяет сервис — он хранится в шаблоне тела.",
    },
  "Replace the routing key in the body template with your service's integration key.":
    {
      uz: "Tana shablonidagi yo'naltirish kalitini xizmatingizning integratsiya kaliti bilan almashtiring.",
      ru: "Замените ключ маршрутизации в шаблоне тела ключом интеграции вашего сервиса.",
    },
  "Raise a PagerDuty incident when the customer reports something broken in production.":
    {
      uz: "Mijoz ishlab turgan tizimda nimadir buzilganini aytsa, PagerDuty hodisasini ochish.",
      ru: "Поднять инцидент PagerDuty, когда клиент сообщает о поломке в продакшене.",
    },
  "One-line description of what is broken.": {
    uz: "Nima buzilganining bir qatorli tavsifi.",
    ru: "Однострочное описание поломки.",
  },
  "One of critical, error, warning or info.": {
    uz: "critical, error, warning yoki info dan biri.",
    ru: "Одно из: critical, error, warning или info.",
  },
  "Stable key for the same underlying problem, so repeats group into one incident.":
    {
      uz: "Bir xil muammo uchun barqaror kalit — takrorlar bitta hodisaga guruhlanadi.",
      ru: "Постоянный ключ для одной и той же проблемы, чтобы повторы объединялись в один инцидент.",
    },
  "Gmail send": {
    uz: "Gmail orqali yuborish",
    ru: "Отправка через Gmail",
  },
  "Create an incoming webhook in your Slack workspace and paste its URL as the endpoint.":
    {
      uz: "Slack ish maydoningizda incoming webhook yarating va uning URL manzilini endpoint sifatida qo'ying.",
      ru: "Создайте входящий вебхук в рабочем пространстве Slack и вставьте его URL как эндпоинт.",
    },
  "Send from a real mailbox so the reply lands in the thread the customer already knows.":
    {
      uz: "Haqiqiy pochta qutisidan yuborish, shunda javob mijozga tanish yozishmaga tushadi.",
      ru: "Отправлять с настоящего ящика, чтобы ответ попал в знакомую клиенту переписку.",
    },
  "Needs a Google Workspace OAuth grant per mailbox.": {
    uz: "Har bir pochta qutisi uchun Google Workspace OAuth ruxsati kerak.",
    ru: "Нужно разрешение Google Workspace OAuth для каждого ящика.",
  },
  "Replies thread against the original message rather than starting a new one.":
    {
      uz: "Javoblar yangi yozishma ochmasdan, asl xat yozishmasiga qo'shiladi.",
      ru: "Ответы попадают в цепочку исходного письма, а не создают новую.",
    },
  "Post a short alert into the team's Slack channel when a conversation needs attention.":
    {
      uz: "Suhbat e'tibor talab qilganda jamoaning Slack kanaliga qisqa ogohlantirish yuborish.",
      ru: "Отправить короткое оповещение в канал Slack, когда диалогу нужно внимание.",
    },
  "The alert text to post in Slack.": {
    uz: "Slack'ga yuboriladigan ogohlantirish matni.",
    ru: "Текст оповещения для Slack.",
  },
  "Slack channel message": {
    uz: "Slack kanaliga xabar",
    ru: "Сообщение в канал Slack",
  },
  "Post to any channel your bot is in through the Web API, with threading and rich text.":
    {
      uz: "Web API orqali botingiz a'zo bo'lgan istalgan kanalga yozish — yozishma tarmoqlari va formatlangan matn bilan.",
      ru: "Писать в любой канал, где есть бот, через Web API — с тредами и форматированием.",
    },
  "Web API": {
    uz: "Web API",
    ru: "Web API",
  },
  "Bot token": {
    uz: "Bot tokeni",
    ru: "Токен бота",
  },
  "One bot token reaches every channel the bot has been invited to.": {
    uz: "Bitta bot tokeni bot taklif qilingan barcha kanallarga yetadi.",
    ru: "Один токен бота работает во всех каналах, куда бота пригласили.",
  },
  "Set the channel id once in the body template to pin the tool to a room.": {
    uz: "Vositani bitta xonaga bog'lash uchun tana shablonida kanal ID'sini bir marta yozing.",
    ru: "Укажите ID канала в шаблоне тела один раз, чтобы привязать инструмент к комнате.",
  },
  "Supports Slack markdown, so links and code render properly.": {
    uz: "Slack markdown'ni qo'llab-quvvatlaydi, shuning uchun havolalar va kod to'g'ri ko'rinadi.",
    ru: "Поддерживает разметку Slack, поэтому ссылки и код отображаются правильно.",
  },
  "Bot user OAuth token": {
    uz: "Bot foydalanuvchisi OAuth tokeni",
    ru: "OAuth-токен бота",
  },
  "Starts with xoxb- — found under OAuth & Permissions in your Slack app.": {
    uz: "xoxb- bilan boshlanadi — Slack ilovangizdagi OAuth & Permissions bo'limida.",
    ru: "Начинается с xoxb- — в разделе OAuth & Permissions вашего приложения Slack.",
  },
  "Paste the bot token as the credential and replace the channel id in the body template.":
    {
      uz: "Bot tokenini kirish ma'lumoti sifatida qo'ying va tana shablonidagi kanal ID'sini almashtiring.",
      ru: "Вставьте токен бота как учётные данные и замените ID канала в шаблоне тела.",
    },
  "Post a message into the team's Slack channel using the workspace bot.": {
    uz: "Ish maydoni boti orqali jamoaning Slack kanaliga xabar yuborish.",
    ru: "Отправить сообщение в канал Slack команды от бота пространства.",
  },
  "The team id in the template decides which board it lands on.": {
    uz: "Shablondagi jamoa ID'si u qaysi doskaga tushishini belgilaydi.",
    ru: "ID команды в шаблоне определяет, на какую доску попадёт задача.",
  },
  "Personal API keys are sent raw, without a Bearer prefix — the template already does this.":
    {
      uz: "Shaxsiy API kalitlar Bearer prefiksisiz yuboriladi — shablon buni allaqachon qiladi.",
      ru: "Личные API-ключи отправляются без префикса Bearer — шаблон уже это делает.",
    },
  "Linear API key": {
    uz: "Linear API kaliti",
    ru: "API-ключ Linear",
  },
  "Settings → API → Personal API keys. Send it raw, with no Bearer prefix.": {
    uz: "Settings → API → Personal API keys. Bearer prefiksisiz yuboring.",
    ru: "Settings → API → Personal API keys. Отправляйте без префикса Bearer.",
  },
  "Replace the teamId in the body template with the team the issues should land in.":
    {
      uz: "Tana shablonidagi teamId'ni masalalar tushishi kerak bo'lgan jamoa bilan almashtiring.",
      ru: "Замените teamId в шаблоне тела на команду, куда должны попадать задачи.",
    },
  "Create a Linear issue describing a bug or feature request from the conversation.":
    {
      uz: "Suhbatdagi xato yoki funksiya so'rovini tasvirlovchi Linear masalasini yaratish.",
      ru: "Создать задачу в Linear с описанием бага или запроса из диалога.",
    },
  "Short title for the issue.": {
    uz: "Masala uchun qisqa sarlavha.",
    ru: "Короткий заголовок задачи.",
  },
  "What happened, in the customer's words plus context.": {
    uz: "Nima bo'ldi — mijoz so'zlari va kontekst bilan.",
    ru: "Что произошло — словами клиента плюс контекст.",
  },
  "Asana task": {
    uz: "Asana vazifasi",
    ru: "Задача Asana",
  },
  "Drop a follow-up into the project your team runs its week from.": {
    uz: "Jamoangiz haftalik ishini yuritadigan loyihaga keyingi vazifani qo'shish.",
    ru: "Добавить задачу в проект, по которому команда планирует неделю.",
  },
  Tasks: {
    uz: "Vazifalar",
    ru: "Задачи",
  },
  "Lands in a specific project, so it appears on the board rather than in someone's inbox.":
    {
      uz: "Aniq loyihaga tushadi, shuning uchun kimningdir pochtasida emas, doskada ko'rinadi.",
      ru: "Попадает в конкретный проект и видна на доске, а не в чьих-то входящих.",
    },
  "Due dates can be passed through as a parameter when the customer names one.":
    {
      uz: "Mijoz muddat aytsa, uni parametr sifatida uzatish mumkin.",
      ru: "Если клиент назвал срок, его можно передать параметром.",
    },
  "Created under My Settings → Apps → Manage developer apps.": {
    uz: "My Settings → Apps → Manage developer apps bo'limida yaratiladi.",
    ru: "Создаётся в My Settings → Apps → Manage developer apps.",
  },
  "Put your workspace and project ids in the body template before saving.": {
    uz: "Saqlashdan oldin ish maydoni va loyiha ID'larini tana shabloniga yozing.",
    ru: "Перед сохранением укажите ID пространства и проекта в шаблоне тела.",
  },
  "Create an Asana task for follow-up work the conversation generated.": {
    uz: "Suhbatdan kelib chiqqan keyingi ish uchun Asana vazifasini yaratish.",
    ru: "Создать задачу Asana по работе, возникшей из диалога.",
  },
  "Task title.": {
    uz: "Vazifa sarlavhasi.",
    ru: "Название задачи.",
  },
  "Context for whoever picks the task up.": {
    uz: "Vazifani oladigan kishi uchun kontekst.",
    ru: "Контекст для того, кто возьмёт задачу.",
  },
  "Due date in YYYY-MM-DD, when the customer named one.": {
    uz: "Mijoz muddat aytgan bo'lsa, YYYY-MM-DD formatidagi muddat.",
    ru: "Срок в формате YYYY-MM-DD, если клиент его назвал.",
  },
  "ClickUp task": {
    uz: "ClickUp vazifasi",
    ru: "Задача ClickUp",
  },
  "Create a task in a specific list, with priority mapped from how urgent the customer sounds.":
    {
      uz: "Mijoz qanchalik shoshilinch gapirayotganiga qarab muhimlik bilan aniq ro'yxatda vazifa yaratish.",
      ru: "Создать задачу в конкретном списке с приоритетом по тому, насколько срочно звучит клиент.",
    },
  "The list id in the endpoint pins where tasks land.": {
    uz: "Endpointdagi ro'yxat ID'si vazifalar qayerga tushishini belgilaydi.",
    ru: "ID списка в эндпоинте определяет, куда попадают задачи.",
  },
  "Priority is 1–4, urgent through low, so escalation survives the handoff.": {
    uz: "Muhimlik 1–4, urgent'dan low'gacha, shuning uchun eskalatsiya uzatishda yo'qolmaydi.",
    ru: "Приоритет 1–4, от urgent до low, поэтому эскалация сохраняется при передаче.",
  },
  "ClickUp API token": {
    uz: "ClickUp API tokeni",
    ru: "API-токен ClickUp",
  },
  "Settings → Apps → API token. Sent raw, with no Bearer prefix.": {
    uz: "Settings → Apps → API token. Bearer prefiksisiz yuboriladi.",
    ru: "Settings → Apps → API token. Отправляется без префикса Bearer.",
  },
  "Put the destination list id into the endpoint before saving.": {
    uz: "Saqlashdan oldin qabul qiluvchi ro'yxat ID'sini endpointga yozing.",
    ru: "Перед сохранением укажите ID списка-получателя в эндпоинте.",
  },
  "Create a ClickUp task for work raised in the conversation.": {
    uz: "Suhbatda ko'tarilgan ish uchun ClickUp vazifasini yaratish.",
    ru: "Создать задачу ClickUp по работе из диалога.",
  },
  "What needs doing and why.": {
    uz: "Nima qilish kerak va nima uchun.",
    ru: "Что нужно сделать и зачем.",
  },
  "Trello card": {
    uz: "Trello kartasi",
    ru: "Карточка Trello",
  },
  "Add a card to the board a small team triages from, no project tool required.":
    {
      uz: "Kichik jamoa ishlarni saralaydigan doskaga karta qo'shish — loyiha vositasi shart emas.",
      ru: "Добавить карточку на доску, с которой работает небольшая команда, — без отдельного таск-трекера.",
    },
  Board: {
    uz: "Doska",
    ru: "Доска",
  },
  "Key and token ride in the endpoint, so there is no header to configure.": {
    uz: "Kalit va token endpointda, shuning uchun sozlanadigan sarlavha yo'q.",
    ru: "Ключ и токен передаются в эндпоинте, поэтому заголовки настраивать не нужно.",
  },
  "The list id decides the column, which is usually an intake or triage lane.":
    {
      uz: "Ro'yxat ID'si ustunni belgilaydi — odatda bu qabul qilish yoki saralash ustuni.",
      ru: "ID списка определяет колонку — обычно это колонка входящих или сортировки.",
    },
  "API key and token in the endpoint": {
    uz: "Endpointdagi API kalit va token",
    ru: "API-ключ и токен в эндпоинте",
  },
  "Append ?key=…&token=… to the URL.": {
    uz: "URL oxiriga ?key=…&token=… qo'shing.",
    ru: "Добавьте ?key=…&token=… к URL.",
  },
  "Append your key and token to the endpoint and set the target list id in the body.":
    {
      uz: "Kalit va tokenni endpointga qo'shing va tanada maqsadli ro'yxat ID'sini yozing.",
      ru: "Добавьте ключ и токен к эндпоинту и укажите ID целевого списка в теле.",
    },
  "Add a Trello card to the team's triage list.": {
    uz: "Jamoaning saralash ro'yxatiga Trello kartasini qo'shish.",
    ru: "Добавить карточку Trello в список сортировки команды.",
  },
  "Card title.": {
    uz: "Karta sarlavhasi.",
    ru: "Название карточки.",
  },
  "Context to put on the back of the card.": {
    uz: "Kartaning orqa tomoniga yoziladigan kontekst.",
    ru: "Контекст для обратной стороны карточки.",
  },
  "monday.com item": {
    uz: "monday.com elementi",
    ru: "Элемент monday.com",
  },
  "Jira issue": {
    uz: "Jira masalasi",
    ru: "Задача Jira",
  },
  "Create a board item so the request enters the workflow your ops team manages.":
    {
      uz: "So'rov operatsion jamoangiz boshqaradigan jarayonga tushishi uchun doskada element yaratish.",
      ru: "Создать элемент на доске, чтобы запрос попал в процесс вашей операционной команды.",
    },
  "One GraphQL mutation against the board id you pin in the template.": {
    uz: "Shablonda belgilangan doska ID'siga bitta GraphQL mutation.",
    ru: "Одна мутация GraphQL к ID доски, зафиксированному в шаблоне.",
  },
  "Column values can be extended to carry status, owner or priority.": {
    uz: "Ustun qiymatlarini holat, mas'ul yoki muhimlikni o'tkazish uchun kengaytirish mumkin.",
    ru: "Значения колонок можно расширить, чтобы передавать статус, ответственного или приоритет.",
  },
  "monday.com API token": {
    uz: "monday.com API tokeni",
    ru: "API-токен monday.com",
  },
  "Avatar → Developers → My access tokens.": {
    uz: "Avatar → Developers → My access tokens.",
    ru: "Avatar → Developers → My access tokens.",
  },
  "Replace the board id in the mutation with the board items should land on.": {
    uz: "Mutation'dagi doska ID'sini elementlar tushishi kerak bo'lgan doska bilan almashtiring.",
    ru: "Замените ID доски в мутации на доску, куда должны попадать элементы.",
  },
  "Create an item on the team's monday.com board.": {
    uz: "Jamoaning monday.com doskasida element yaratish.",
    ru: "Создать элемент на доске monday.com команды.",
  },
  "Name of the item to create on the board.": {
    uz: "Doskada yaratiladigan element nomi.",
    ru: "Название элемента на доске.",
  },
  "Todoist task": {
    uz: "Todoist vazifasi",
    ru: "Задача Todoist",
  },
  "Capture a personal follow-up when the team runs on a list rather than a tracker.":
    {
      uz: "Jamoa trekker emas, ro'yxat bilan ishlasa, shaxsiy keyingi vazifani yozib qo'yish.",
      ru: "Записать личную задачу, когда команда работает со списком, а не трекером.",
    },
  'Natural-language due strings work, so "next Tuesday" schedules correctly.': {
    uz: "Oddiy tildagi muddatlar ishlaydi, shuning uchun \"keyingi seshanba\" to'g'ri rejalashtiriladi.",
    ru: "Сроки на естественном языке работают, поэтому «в следующий вторник» планируется правильно.",
  },
  "The project id is optional — leave it out and tasks land in the inbox.": {
    uz: "Loyiha ID'si ixtiyoriy — ko'rsatmasangiz, vazifalar Inbox'ga tushadi.",
    ru: "ID проекта необязателен — без него задачи попадают во входящие.",
  },
  "Settings → Integrations → Developer.": {
    uz: "Settings → Integrations → Developer.",
    ru: "Settings → Integrations → Developer.",
  },
  "Add a project_id to the body template to pin the destination.": {
    uz: "Qabul qiluvchi joyni belgilash uchun tana shabloniga project_id qo'shing.",
    ru: "Добавьте project_id в шаблон тела, чтобы зафиксировать место назначения.",
  },
  "Add a follow-up task to Todoist.": {
    uz: "Todoist'ga keyingi vazifa qo'shish.",
    ru: "Добавить задачу в Todoist.",
  },
  "What the task is.": {
    uz: "Vazifa nima.",
    ru: "В чём задача.",
  },
  "When it is due, in plain language, e.g. tomorrow 9am.": {
    uz: "Qachon bajarilishi kerak, oddiy tilda, masalan, ertaga soat 9da.",
    ru: "Когда срок, обычными словами, например завтра в 9 утра.",
  },
  "Cal.com booking": {
    uz: "Cal.com orqali yozilish",
    ru: "Бронирование в Cal.com",
  },
  "Book a real slot on a team calendar while the customer is still in the conversation.":
    {
      uz: "Mijoz hali suhbatda ekan, jamoa kalendarida haqiqiy vaqtni band qilish.",
      ru: "Бронировать реальное время в календаре команды, пока клиент ещё в диалоге.",
    },
  Scheduling: {
    uz: "Rejalashtirish",
    ru: "Планирование",
  },
  "File a bug or request into the project your engineers already work out of.":
    {
      uz: "Xato yoki so'rovni dasturchilaringiz ishlaydigan loyihaga yozish.",
      ru: "Заводить баг или запрос в проект, где уже работают ваши инженеры.",
    },
  "Books against a specific event type, so duration and availability rules still apply.":
    {
      uz: "Aniq tadbir turi bo'yicha band qiladi, shuning uchun davomiylik va bo'sh vaqt qoidalari amalda qoladi.",
      ru: "Бронирует под конкретный тип события, поэтому правила длительности и доступности действуют.",
    },
  "Double bookings are refused by Cal.com, not by prompt instructions.": {
    uz: "Ikki marta band qilishni prompt ko'rsatmalari emas, Cal.com rad etadi.",
    ru: "Двойное бронирование отклоняет сам Cal.com, а не инструкции в промпте.",
  },
  'Works on voice, where "can you book me in" is the most common request there is.':
    {
      uz: "Ovozli kanalda ishlaydi — u yerda \"meni yozib qo'ya olasizmi\" eng ko'p uchraydigan so'rov.",
      ru: "Работает в голосе, где «можете меня записать?» — самый частый запрос.",
    },
  "Cal.com API key": {
    uz: "Cal.com API kaliti",
    ru: "API-ключ Cal.com",
  },
  "Starts with cal_live_ — from Settings → Developer → API keys.": {
    uz: "cal_live_ bilan boshlanadi — Settings → Developer → API keys'dan.",
    ru: "Начинается с cal_live_ — из Settings → Developer → API keys.",
  },
  "Issue tracking": {
    uz: "Masalalarni kuzatish",
    ru: "Трекинг задач",
  },
  "Set the event type id and your timezone in the body template before saving.":
    {
      uz: "Saqlashdan oldin tana shablonida tadbir turi ID'si va vaqt mintaqangizni yozing.",
      ru: "Перед сохранением укажите ID типа события и часовой пояс в шаблоне тела.",
    },
  "Book a meeting slot for the customer at a start time they confirmed.": {
    uz: "Mijoz tasdiqlagan boshlanish vaqtiga uchrashuv vaqtini band qilish.",
    ru: "Забронировать встречу для клиента на подтверждённое им время.",
  },
  "Project key and issue type are pinned in the template — the assistant only writes the content.":
    {
      uz: "Loyiha kaliti va masala turi shablonda qat'iy — yordamchi faqat mazmunni yozadi.",
      ru: "Ключ проекта и тип задачи зафиксированы в шаблоне — ассистент пишет только содержание.",
    },
  "Start time in ISO 8601 UTC, e.g. 2026-09-14T15:00:00Z.": {
    uz: "Boshlanish vaqti ISO 8601 UTC formatida, masalan, 2026-09-14T15:00:00Z.",
    ru: "Время начала в ISO 8601 UTC, например 2026-09-14T15:00:00Z.",
  },
  "Name of the person attending.": {
    uz: "Qatnashuvchi shaxsning ismi.",
    ru: "Имя участника.",
  },
  "Email address to send the invitation to.": {
    uz: "Taklifnoma yuboriladigan email manzil.",
    ru: "Email для отправки приглашения.",
  },
  "Uses an Atlassian API token, so no user password is stored.": {
    uz: "Atlassian API tokenidan foydalanadi, shuning uchun foydalanuvchi paroli saqlanmaydi.",
    ru: "Использует API-токен Atlassian, поэтому пароль пользователя не хранится.",
  },
  "Calendly booking lookup": {
    uz: "Calendly bronini topish",
    ru: "Поиск брони в Calendly",
  },
  "Description is sent in Atlassian document format, which is what the v3 API expects.":
    {
      uz: "Tavsif Atlassian hujjat formatida yuboriladi — v3 API aynan shuni kutadi.",
      ru: "Описание отправляется в формате документа Atlassian, как ожидает API v3.",
    },
  "Confirm when a customer's meeting is booked instead of asking them to check their inbox.":
    {
      uz: "Mijozdan pochtasini tekshirishni so'ramasdan, uchrashuvi qachon band qilinganini tasdiqlash.",
      ru: "Подтверждать, когда назначена встреча клиента, не отправляя его проверять почту.",
    },
  "Filters scheduled events by the invitee's email address.": {
    uz: "Rejalashtirilgan tadbirlarni taklif qilingan shaxsning emaili bo'yicha filtrlaydi.",
    ru: "Фильтрует запланированные события по email приглашённого.",
  },
  "Read-only: the assistant can confirm a booking but not move it.": {
    uz: "Faqat o'qish: yordamchi bronni tasdiqlay oladi, lekin ko'chira olmaydi.",
    ru: "Только чтение: ассистент может подтвердить бронь, но не перенести её.",
  },
  "Integrations → API & webhooks → Personal access tokens.": {
    uz: "Integrations → API & webhooks → Personal access tokens.",
    ru: "Integrations → API & webhooks → Personal access tokens.",
  },
  "Put your user or organization URI in the endpoint's query string before saving.":
    {
      uz: "Saqlashdan oldin endpoint so'rov qatoriga foydalanuvchi yoki tashkilot URI'ni yozing.",
      ru: "Перед сохранением укажите URI пользователя или организации в строке запроса эндпоинта.",
    },
  "Find the customer's upcoming Calendly meeting from their email address.": {
    uz: "Mijozning yaqinlashayotgan Calendly uchrashuvini email bo'yicha topish.",
    ru: "Найти ближайшую встречу клиента в Calendly по его email.",
  },
  "Email address the meeting was booked under.": {
    uz: "Uchrashuv band qilingan email manzil.",
    ru: "Email, на который назначена встреча.",
  },
  "Calendar booking": {
    uz: "Kalendar orqali yozilish",
    ru: "Бронирование в календаре",
  },
  "Check real availability and hold a slot on a connected calendar, not a scheduling link.":
    {
      uz: "Rejalashtirish havolasi emas, ulangan kalendarda haqiqiy bo'sh vaqtni tekshirib, vaqtni band qilish.",
      ru: "Проверять реальную занятость и бронировать время в подключённом календаре, а не давать ссылку на запись.",
    },
  "Atlassian email and API token": {
    uz: "Atlassian emaili va API token",
    ru: "Email Atlassian и API-токен",
  },
  "Free/busy lookup before offering times, so the assistant never offers a taken slot.":
    {
      uz: "Vaqt taklif qilishdan oldin bandlikni tekshiradi, shuning uchun yordamchi hech qachon band vaqtni taklif qilmaydi.",
      ru: "Проверяет занятость перед предложением времени, поэтому ассистент не предложит занятый слот.",
    },
  "Needs a per-workspace OAuth grant like the Google Sheets connection.": {
    uz: "Google Sheets ulanishi kabi har bir ish maydoni uchun OAuth ruxsati kerak.",
    ru: "Нужно разрешение OAuth для каждого пространства, как у подключения Google Sheets.",
  },
  "Zoom meeting": {
    uz: "Zoom uchrashuvi",
    ru: "Встреча Zoom",
  },
  "Base64 of you@example.com:your_api_token.": {
    uz: "you@example.com:your_api_token ning Base64 ko'rinishi.",
    ru: "Base64 от you@example.com:your_api_token.",
  },
  "Create a meeting and hand the customer a join link inside the conversation.":
    {
      uz: "Uchrashuv yaratib, mijozga suhbat ichida qo'shilish havolasini berish.",
      ru: "Создать встречу и дать клиенту ссылку для подключения прямо в диалоге.",
    },
  Meetings: {
    uz: "Uchrashuvlar",
    ru: "Встречи",
  },
  "Server-to-server tokens expire hourly, so this needs the credential vault to refresh them.":
    {
      uz: "Serverlararo tokenlar har soatda eskiradi, shuning uchun ularni yangilash uchun ma'lumotlar xazinasi kerak.",
      ru: "Серверные токены истекают каждый час, поэтому для их обновления нужно хранилище учётных данных.",
    },
  "Swap your-domain for your Atlassian site and set the project key in the body template.":
    {
      uz: "your-domain o'rniga Atlassian saytingizni yozing va tana shablonida loyiha kalitini belgilang.",
      ru: "Замените your-domain на свой сайт Atlassian и укажите ключ проекта в шаблоне тела.",
    },
  "File a Jira issue for a bug or request the assistant could not resolve.": {
    uz: "Yordamchi hal qila olmagan xato yoki so'rov uchun Jira masalasini ochish.",
    ru: "Завести задачу Jira по багу или запросу, который ассистент не смог решить.",
  },
  "One-line summary of the issue.": {
    uz: "Masalaning bir qatorli qisqacha mazmuni.",
    ru: "Однострочное резюме задачи.",
  },
  "Full description, including steps and context.": {
    uz: "Qadamlar va kontekst bilan to'liq tavsif.",
    ru: "Полное описание с шагами и контекстом.",
  },
  "Linear issue": {
    uz: "Linear masalasi",
    ru: "Задача Linear",
  },
  "Create an issue in the team's Linear workspace straight from a customer report.":
    {
      uz: "Mijoz xabaridan to'g'ridan-to'g'ri jamoaning Linear ish maydonida masala yaratish.",
      ru: "Создать задачу в Linear команды прямо из сообщения клиента.",
    },
  "One GraphQL mutation, so there is no REST resource shape to keep in sync.": {
    uz: "Bitta GraphQL mutation, shuning uchun sinxron tutiladigan REST tuzilishi yo'q.",
    ru: "Одна мутация GraphQL — не нужно синхронизировать структуру REST.",
  },
  "Find rows by any column — the assistant only receives the columns you return.":
    {
      uz: "Istalgan ustun bo'yicha qatorlarni topish — yordamchi faqat siz qaytargan ustunlarni oladi.",
      ru: "Найти строки по любому столбцу — ассистент получает только столбцы, которые вы вернули.",
    },
  "Write a new row with the values the assistant collected.": {
    uz: "Yordamchi to'plagan qiymatlar bilan yangi qator yozish.",
    ru: "Записать новую строку со значениями, собранными ассистентом.",
  },
  "Match one row, then change only the columns you allow.": {
    uz: "Bitta qatorni topib, faqat siz ruxsat bergan ustunlarni o'zgartirish.",
    ru: "Найти одну строку и изменить только разрешённые вами столбцы.",
  },
  "Match one row and remove it, with a unique-match guard.": {
    uz: "Bitta qatorni topib, o'chirish — yagona moslik himoyasi bilan.",
    ru: "Найти одну строку и удалить её, с защитой от неоднозначного совпадения.",
  },
  "Column headers are read live from the sheet — no field mapping to maintain.":
    {
      uz: "Ustun sarlavhalari jadvaldan jonli o'qiladi — yuritiladigan maydon moslashtirishi yo'q.",
      ru: "Заголовки столбцов читаются из таблицы вживую — сопоставление полей поддерживать не нужно.",
    },
  "Server-side query on large sheets, so a 50,000-row tab stays fast.": {
    uz: "Katta jadvallarda server tomonida so'rov, shuning uchun 50 000 qatorli varaq ham tez ishlaydi.",
    ru: "Запрос на сервере для больших таблиц, поэтому лист на 50 000 строк остаётся быстрым.",
  },
  "Return columns are allow-listed: the model never sees a column you did not pick.":
    {
      uz: "Qaytariladigan ustunlar ruxsat ro'yxatida: model siz tanlamagan ustunni hech qachon ko'rmaydi.",
      ru: "Возвращаемые столбцы — по белому списку: модель не видит столбцы, которые вы не выбрали.",
    },
  "Parameters are generated from the columns you tick, so the schema cannot drift.":
    {
      uz: "Parametrlar siz belgilagan ustunlardan yaratiladi, shuning uchun sxema chalkashmaydi.",
      ru: "Параметры создаются из отмеченных вами столбцов, поэтому схема не расходится.",
    },
  "Values land in the sheet's own column order, whatever order they arrive in.":
    {
      uz: "Qiymatlar qaysi tartibda kelishidan qat'i nazar, jadvalning o'z ustunlar tartibida yoziladi.",
      ru: "Значения записываются в порядке столбцов таблицы, в каком бы порядке они ни пришли.",
    },
  "Search columns find the row; update columns bound what may change.": {
    uz: "Qidiruv ustunlari qatorni topadi; yangilash ustunlari nima o'zgarishi mumkinligini cheklaydi.",
    ru: "Столбцы поиска находят строку; столбцы обновления ограничивают, что можно менять.",
  },
  "A unique-match guard blocks the write when more than one row matches.": {
    uz: "Bir nechta qator mos kelsa, yagona moslik himoyasi yozishni to'xtatadi.",
    ru: "Если подходит больше одной строки, защита от неоднозначности блокирует запись.",
  },
  "Deletes by match, never by row number, so an inserted row cannot shift the target.":
    {
      uz: "Qator raqami bo'yicha emas, moslik bo'yicha o'chiradi, shuning uchun qo'shilgan qator maqsadni siljitmaydi.",
      ru: "Удаляет по совпадению, а не по номеру строки, поэтому вставленная строка не сдвинет цель.",
    },
  "Unique-match guard is on by default.": {
    uz: "Yagona moslik himoyasi standart bo'yicha yoqilgan.",
    ru: "Защита от неоднозначного совпадения включена по умолчанию.",
  },
  Spreadsheet: {
    uz: "Jadval",
    ru: "Таблица",
  },
  "Connect once for the whole workspace — every Sheets tool reuses it.": {
    uz: "Butun ish maydoni uchun bir marta ulang — barcha Sheets vositalari undan foydalanadi.",
    ru: "Подключите один раз для всего пространства — все инструменты Sheets будут его использовать.",
  },
  "Pick the spreadsheet and tab, then choose which columns the assistant may touch.":
    {
      uz: "Jadval va varaqni tanlang, so'ng yordamchi qaysi ustunlarga tega olishini belgilang.",
      ru: "Выберите таблицу и лист, затем укажите, к каким столбцам может обращаться ассистент.",
    },
  'Value to find the row by, matched against the "phone" column.': {
    uz: 'Qatorni topish uchun qiymat, "phone" ustuni bilan solishtiriladi.',
    ru: "Значение для поиска строки, сравнивается со столбцом «phone».",
  },
  "Insert a new row with name, phone, and other fields": {
    uz: "Ism, telefon va boshqa maydonlar bilan yangi qator qo'shish",
    ru: "Добавить новую строку с именем, телефоном и другими полями",
  },
  "Add a new row to the Google Sheet with the provided column values. Use this only for a record that is not in the sheet yet — to change something already recorded, use the update tool instead.":
    {
      uz: "Berilgan ustun qiymatlari bilan Google Sheet'ga yangi qator qo'shish. Buni faqat jadvalda hali yo'q yozuv uchun ishlating — mavjud yozuvni o'zgartirish uchun yangilash vositasidan foydalaning.",
      ru: "Добавить новую строку в Google Sheet с указанными значениями. Используйте только для записи, которой ещё нет в таблице, — чтобы изменить существующую, используйте инструмент обновления.",
    },
  'Value for the "name" column of the new row.': {
    uz: 'Yangi qatorning "name" ustuni uchun qiymat.',
    ru: "Значение для столбца «name» новой строки.",
  },
  'Value for the "phone" column of the new row.': {
    uz: 'Yangi qatorning "phone" ustuni uchun qiymat.',
    ru: "Значение для столбца «phone» новой строки.",
  },
  'Value for the "email" column of the new row.': {
    uz: 'Yangi qatorning "email" ustuni uchun qiymat.',
    ru: "Значение для столбца «email» новой строки.",
  },
  "Find a row and update its fields": {
    uz: "Qatorni topib, maydonlarini yangilash",
    ru: "Найти строку и обновить её поля",
  },
  "Correct or change a row that is already in the Google Sheet: find it with the values currently stored there, then write the new values. Use this whenever the user changes something that was recorded earlier.":
    {
      uz: "Google Sheet'dagi mavjud qatorni tuzatish yoki o'zgartirish: uni hozir saqlangan qiymatlar bo'yicha toping, so'ng yangi qiymatlarni yozing. Foydalanuvchi avval yozilgan narsani o'zgartirganda doim shundan foydalaning.",
      ru: "Исправить или изменить строку, которая уже есть в Google Sheet: найти её по текущим значениям и записать новые. Используйте, когда пользователь меняет ранее записанное.",
    },
  'The value already stored in the "name" column, used to find the row to change. Never pass the new value here.':
    {
      uz: '"name" ustunida hozir saqlangan qiymat, o\'zgartiriladigan qatorni topish uchun. Bu yerga hech qachon yangi qiymatni bermang.',
      ru: "Текущее значение в столбце «name» для поиска изменяемой строки. Никогда не передавайте сюда новое значение.",
    },
  'The value already stored in the "phone" column, used to find the row to change. Never pass the new value here.':
    {
      uz: '"phone" ustunida hozir saqlangan qiymat, o\'zgartiriladigan qatorni topish uchun. Bu yerga hech qachon yangi qiymatni bermang.',
      ru: "Текущее значение в столбце «phone» для поиска изменяемой строки. Никогда не передавайте сюда новое значение.",
    },
  'New value to write into the "phone" column, replacing what is there.': {
    uz: '"phone" ustuniga yoziladigan yangi qiymat, u yerdagisini almashtiradi.',
    ru: "Новое значение для столбца «phone», заменит текущее.",
  },
  'New value to write into the "email" column, replacing what is there.': {
    uz: '"email" ustuniga yoziladigan yangi qiymat, u yerdagisini almashtiradi.',
    ru: "Новое значение для столбца «email», заменит текущее.",
  },
  'New value to write into the "status" column, replacing what is there.': {
    uz: '"status" ustuniga yoziladigan yangi qiymat, u yerdagisini almashtiradi.',
    ru: "Новое значение для столбца «status», заменит текущее.",
  },
  "Find a row and remove it from the sheet": {
    uz: "Qatorni topib, jadvaldan o'chirish",
    ru: "Найти строку и удалить её из таблицы",
  },
  "Find a row in the Google Sheet using lookup fields and delete it. Use this only when the user asks for the record to be removed.":
    {
      uz: "Qidiruv maydonlari yordamida Google Sheet'dan qatorni topib o'chirish. Buni faqat foydalanuvchi yozuvni o'chirishni so'raganda ishlating.",
      ru: "Найти строку в Google Sheet по полям поиска и удалить её. Используйте, только когда пользователь просит удалить запись.",
    },
  'Value to find the row to delete by, matched against the "name" column.': {
    uz: 'O\'chiriladigan qatorni topish uchun qiymat, "name" ustuni bilan solishtiriladi.',
    ru: "Значение для поиска удаляемой строки, сравнивается со столбцом «name».",
  },
  'Value to find the row to delete by, matched against the "phone" column.': {
    uz: 'O\'chiriladigan qatorni topish uchun qiymat, "phone" ustuni bilan solishtiriladi.',
    ru: "Значение для поиска удаляемой строки, сравнивается со столбцом «phone».",
  },
  "Find events": {
    uz: "Tadbirlarni topish",
    ru: "Найти события",
  },
  "Create event": {
    uz: "Tadbir yaratish",
    ru: "Создать событие",
  },
  "Update event": {
    uz: "Tadbirni yangilash",
    ru: "Изменить событие",
  },
  "Cancel event": {
    uz: "Tadbirni bekor qilish",
    ru: "Отменить событие",
  },
  "Search events by text, or check what's on the calendar": {
    uz: "Tadbirlarni matn bo'yicha qidirish yoki kalendarda nima borligini tekshirish",
    ru: "Искать события по тексту или проверить, что в календаре",
  },
  "Search the calendar for events matching a query, or list what's scheduled in a time range. Use this to check availability before booking.":
    {
      uz: "So'rovga mos tadbirlarni kalendardan qidirish yoki vaqt oralig'ida nima rejalashtirilganini ko'rsatish. Yozishdan oldin bo'sh vaqtni tekshirish uchun shundan foydalaning.",
      ru: "Искать в календаре события по запросу или показать, что запланировано в диапазоне времени. Используйте для проверки занятости перед записью.",
    },
  "Text to search for in event titles or descriptions": {
    uz: "Tadbir sarlavhalari yoki tavsiflaridan qidiriladigan matn",
    ru: "Текст для поиска в названиях или описаниях событий",
  },
  "Only include events starting after this ISO 8601 date/time": {
    uz: "Faqat shu ISO 8601 sana/vaqtdan keyin boshlanadigan tadbirlar",
    ru: "Только события, начинающиеся после этой даты/времени ISO 8601",
  },
  "Only include events starting before this ISO 8601 date/time": {
    uz: "Faqat shu ISO 8601 sana/vaqtdan oldin boshlanadigan tadbirlar",
    ru: "Только события, начинающиеся до этой даты/времени ISO 8601",
  },
  "Book a new event on the calendar": {
    uz: "Kalendarda yangi tadbir band qilish",
    ru: "Забронировать новое событие в календаре",
  },
  "Create a new event on the calendar, such as booking an appointment.": {
    uz: "Kalendarda yangi tadbir yaratish, masalan, uchrashuvga yozish.",
    ru: "Создать новое событие в календаре, например запись на приём.",
  },
  "Title of the event": {
    uz: "Tadbir sarlavhasi",
    ru: "Название события",
  },
  "API Request": {
    uz: "API so'rovi",
    ru: "API-запрос",
  },
  "Start time as an ISO 8601 date/time (e.g. 2026-09-01T14:00:00+05:00)": {
    uz: "Boshlanish vaqti ISO 8601 sana/vaqt formatida (masalan, 2026-09-01T14:00:00+05:00)",
    ru: "Время начала в формате ISO 8601 (например, 2026-09-01T14:00:00+05:00)",
  },
  "End time as an ISO 8601 date/time": {
    uz: "Tugash vaqti ISO 8601 sana/vaqt formatida",
    ru: "Время окончания в формате ISO 8601",
  },
  "Custom Tool": {
    uz: "Maxsus vosita",
    ru: "Свой инструмент",
  },
  "Extra details about the event": {
    uz: "Tadbir haqida qo'shimcha ma'lumot",
    ru: "Дополнительные сведения о событии",
  },
  "Where the event takes place": {
    uz: "Tadbir qayerda bo'ladi",
    ru: "Где проходит событие",
  },
  "Comma-separated email addresses to invite": {
    uz: "Taklif qilinadigan email manzillar, vergul bilan ajratilgan",
    ru: "Email для приглашения через запятую",
  },
  "Find an event and change its details": {
    uz: "Tadbirni topib, tafsilotlarini o'zgartirish",
    ru: "Найти событие и изменить детали",
  },
  "Update an existing calendar event. Pass event_id if it is already known from a previous search, otherwise pass a query and/or time range to find it first.":
    {
      uz: "Mavjud kalendar tadbirini yangilash. Agar event_id oldingi qidiruvdan ma'lum bo'lsa, uni bering, aks holda avval topish uchun so'rov va/yoki vaqt oralig'ini bering.",
      ru: "Изменить существующее событие календаря. Передайте event_id, если он известен из предыдущего поиска, иначе передайте запрос и/или диапазон времени для поиска.",
    },
  "ID of the event to update, if already known": {
    uz: "Yangilanadigan tadbir ID'si, agar ma'lum bo'lsa",
    ru: "ID изменяемого события, если известен",
  },
  "Text to find the event by, if the ID is not known": {
    uz: "ID ma'lum bo'lmasa, tadbirni topish uchun matn",
    ru: "Текст для поиска события, если ID неизвестен",
  },
  "Narrows the search to events starting after this ISO 8601 date/time": {
    uz: "Qidiruvni shu ISO 8601 sana/vaqtdan keyin boshlanadigan tadbirlar bilan cheklaydi",
    ru: "Сужает поиск до событий, начинающихся после этой даты/времени ISO 8601",
  },
  "Narrows the search to events starting before this ISO 8601 date/time": {
    uz: "Qidiruvni shu ISO 8601 sana/vaqtdan oldin boshlanadigan tadbirlar bilan cheklaydi",
    ru: "Сужает поиск до событий, начинающихся до этой даты/времени ISO 8601",
  },
  "New title for the event": {
    uz: "Tadbirning yangi sarlavhasi",
    ru: "Новое название события",
  },
  "New start time as an ISO 8601 date/time": {
    uz: "Yangi boshlanish vaqti ISO 8601 sana/vaqt formatida",
    ru: "Новое время начала в формате ISO 8601",
  },
  "Look up row": {
    uz: "Qatorni topish",
    ru: "Найти строку",
  },
  "New end time as an ISO 8601 date/time": {
    uz: "Yangi tugash vaqti ISO 8601 sana/vaqt formatida",
    ru: "Новое время окончания в формате ISO 8601",
  },
  "Add row": {
    uz: "Qator qo'shish",
    ru: "Добавить строку",
  },
  "Find an event and remove it from the calendar": {
    uz: "Tadbirni topib, kalendardan o'chirish",
    ru: "Найти событие и удалить его из календаря",
  },
  "Cancel and remove an existing calendar event. Pass event_id if it is already known from a previous search, otherwise pass a query and/or time range to find it first.":
    {
      uz: "Mavjud kalendar tadbirini bekor qilish va o'chirish. Agar event_id oldingi qidiruvdan ma'lum bo'lsa, uni bering, aks holda avval topish uchun so'rov va/yoki vaqt oralig'ini bering.",
      ru: "Отменить и удалить существующее событие. Передайте event_id, если он известен из предыдущего поиска, иначе передайте запрос и/или диапазон времени для поиска.",
    },
  "Update row": {
    uz: "Qatorni yangilash",
    ru: "Обновить строку",
  },
  "ID of the event to cancel, if already known": {
    uz: "Bekor qilinadigan tadbir ID'si, agar ma'lum bo'lsa",
    ru: "ID отменяемого события, если известен",
  },
  "Delete row": {
    uz: "Qatorni o'chirish",
    ru: "Удалить строку",
  },
  "Exact match": {
    uz: "Aniq moslik",
    ru: "Точное совпадение",
  },
  "Case-insensitive full cell match, ignoring separators in phone numbers": {
    uz: "Katta-kichik harfga qaramasdan butun katak mosligi, telefon raqamlaridagi ajratgichlar hisobga olinmaydi",
    ru: "Полное совпадение ячейки без учёта регистра, разделители в телефонах игнорируются",
  },
  Contains: {
    uz: "O'z ichiga oladi",
    ru: "Содержит",
  },
  "Substring match (legacy fuzzy behavior)": {
    uz: "Qism-qator mosligi (eski noaniq usul)",
    ru: "Совпадение по подстроке (старый нечёткий режим)",
  },
  "Equals (case-sensitive)": {
    uz: "Teng (katta-kichik harf hisobga olinadi)",
    ru: "Равно (с учётом регистра)",
  },
  "Exact characters including case": {
    uz: "Katta-kichik harf bilan birga aynan bir xil belgilar",
    ru: "Точные символы с учётом регистра",
  },
  "Server query (recommended)": {
    uz: "Server so'rovi (tavsiya etiladi)",
    ru: "Запрос на сервере (рекомендуется)",
  },
  "Ask Google for matching rows only — best for large sheets": {
    uz: "Google'dan faqat mos qatorlarni so'rash — katta jadvallar uchun eng yaxshisi",
    ru: "Запрашивать у Google только подходящие строки — лучше всего для больших таблиц",
  },
  "Bounded scan": {
    uz: "Cheklangan ko'rib chiqish",
    ru: "Ограниченный просмотр",
  },
  "Download a capped range and filter locally": {
    uz: "Cheklangan oraliqni yuklab olib, mahalliy filtrlash",
    ru: "Скачать ограниченный диапазон и отфильтровать локально",
  },
  "Find rows by name, phone, or other columns": {
    uz: "Qatorlarni ism, telefon yoki boshqa ustunlar bo'yicha topish",
    ru: "Найти строки по имени, телефону или другим столбцам",
  },
  "Look up an existing row in the Google Sheet using the provided search fields.":
    {
      uz: "Berilgan qidiruv maydonlari yordamida Google Sheet'dagi mavjud qatorni topish.",
      ru: "Найти существующую строку в Google Sheet по указанным полям поиска.",
    },
  'Value to find the row by, matched against the "name" column.': {
    uz: 'Qatorni topish uchun qiymat, "name" ustuni bilan solishtiriladi.',
    ru: "Значение для поиска строки, сравнивается со столбцом «name».",
  },
  "No credential set": {
    uz: "Kirish ma'lumoti o'rnatilmagan",
    ru: "Учётные данные не заданы",
  },
  "Still the example value": {
    uz: "Hali namuna qiymat turibdi",
    ru: "Всё ещё пример значения",
  },
  "Credential set": {
    uz: "Kirish ma'lumoti o'rnatilgan",
    ru: "Учётные данные заданы",
  },
  "Custom header": {
    uz: "Maxsus sarlavha",
    ru: "Свой заголовок",
  },
  "Credential in the URL": {
    uz: "URL ichidagi kirish ma'lumoti",
    ru: "Учётные данные в URL",
  },
  "Secret URL": {
    uz: "Maxfiy URL",
    ru: "Секретный URL",
  },
  "Untitled tool": {
    uz: "Nomsiz vosita",
    ru: "Инструмент без названия",
  },
  "Live on chat and voice": {
    uz: "Chat va ovozda ishlamoqda",
    ru: "Работает в чате и голосе",
  },
  "Live on voice": {
    uz: "Ovozda ishlamoqda",
    ru: "Работает в голосе",
  },
  "Live on chat": {
    uz: "Chatda ishlamoqda",
    ru: "Работает в чате",
  },
  "Connect Google to finish": {
    uz: "Tugatish uchun Google'ni ulang",
    ru: "Подключите Google, чтобы завершить",
  },
  "Choose a spreadsheet": {
    uz: "Jadvalni tanlang",
    ru: "Выберите таблицу",
  },
  "Choose a calendar": {
    uz: "Kalendarni tanlang",
    ru: "Выберите календарь",
  },
  "Add the web address": {
    uz: "Veb-manzilni qo'shing",
    ru: "Добавьте веб-адрес",
  },
  "Add your API key": {
    uz: "API kalitingizni qo'shing",
    ru: "Добавьте API-ключ",
  },
  "Replace the example key": {
    uz: "Namuna kalitni almashtiring",
    ru: "Замените пример ключа",
  },
  "Switched off": {
    uz: "O'chirilgan",
    ru: "Выключен",
  },
  "Not on any channel": {
    uz: "Hech bir kanalda emas",
    ru: "Ни в одном канале",
  },
  Does: {
    uz: "Nima qiladi",
    ru: "Что делает",
  },
  "Works on": {
    uz: "Qayerda ishlaydi",
    ru: "Где работает",
  },
  "This one isn't available yet, so it can't be added. It's listed because it's on our roadmap.":
    {
      uz: "Bu hali mavjud emas, shuning uchun uni qo'shib bo'lmaydi. U rejalarimizda bo'lgani uchun ro'yxatda.",
      ru: "Это пока недоступно, поэтому добавить нельзя. Показано, потому что есть в наших планах.",
    },
  "What it does": {
    uz: "Nima qiladi",
    ru: "Что делает",
  },
  "What you'll need": {
    uz: "Sizga nima kerak bo'ladi",
    ru: "Что понадобится",
  },
  "Where to find it": {
    uz: "Uni qayerdan topish mumkin",
    ru: "Где это найти",
  },
  "What the assistant sends": {
    uz: "Yordamchi nima yuboradi",
    ru: "Что отправляет ассистент",
  },
  "For developers: the request it makes": {
    uz: "Dasturchilar uchun: u yuboradigan so'rov",
    ru: "Для разработчиков: запрос, который он делает",
  },
  "Signs in with:": {
    uz: "Kirish usuli:",
    ru: "Вход через:",
  },
  "Set it up": {
    uz: "Sozlash",
    ru: "Настроить",
  },
  "Connect Google first": {
    uz: "Avval Google'ni ulang",
    ru: "Сначала подключите Google",
  },
  "Add another": {
    uz: "Yana qo'shish",
    ru: "Добавить ещё",
  },
  "Add to my assistant": {
    uz: "Yordamchimga qo'shish",
    ru: "Добавить моему ассистенту",
  },
  "No key needed": {
    uz: "Kalit kerak emas",
    ru: "Ключ не нужен",
  },
  "Needs a private link": {
    uz: "Maxfiy havola kerak",
    ru: "Нужна секретная ссылка",
  },
  "Needs an API key": {
    uz: "API kalit kerak",
    ru: "Нужен API-ключ",
  },
  "Coming soon": {
    uz: "Tez orada",
    ru: "Скоро",
  },
  Added: {
    uz: "Qo'shilgan",
    ru: "Добавлено",
  },
  "Uses your Google account": {
    uz: "Google hisobingizdan foydalanadi",
    ru: "Использует ваш аккаунт Google",
  },
  "None yet. Once a tool points at a web address it shows up here, with the key it uses and whether that key has been filled in.":
    {
      uz: "Hali yo'q. Vosita biror veb-manzilga yo'naltirilgach, u ishlatadigan kalit va u to'ldirilganmi — shu yerda ko'rinadi.",
      ru: "Пока нет. Когда инструмент будет указывать на веб-адрес, он появится здесь вместе с ключом и тем, заполнен ли он.",
    },
  "All switched off": {
    uz: "Hammasi o'chirilgan",
    ru: "Всё выключено",
  },
  Manage: {
    uz: "Boshqarish",
    ru: "Управлять",
  },
  "Connect the account whose calendar the assistant should check and book on. It can only see and change calendars that account can open.":
    {
      uz: "Yordamchi tekshiradigan va yozadigan kalendar egasining hisobini ulang. U faqat shu hisob ocha oladigan kalendarlarni ko'radi va o'zgartiradi.",
      ru: "Подключите аккаунт, в календаре которого ассистент будет проверять время и записывать. Он видит и меняет только календари, доступные этому аккаунту.",
    },
  "Disconnect Google Calendar?": {
    uz: "Google Calendar uzilsinmi?",
    ru: "Отключить Google Calendar?",
  },
  "Booking and availability tools stop working until an account is connected again. Your tools and their settings are kept.":
    {
      uz: "Hisob qayta ulanmaguncha bron va bo'sh vaqt vositalari ishlamaydi. Vositalaringiz va ularning sozlamalari saqlanib qoladi.",
      ru: "Инструменты записи и проверки времени перестанут работать, пока аккаунт не подключат снова. Инструменты и их настройки сохранятся.",
    },
  "Keep connected": {
    uz: "Ulangan holda qoldirish",
    ru: "Оставить подключённым",
  },
  "Opening Google…": {
    uz: "Google ochilmoqda…",
    ru: "Открываем Google…",
  },
  "Connect Google": {
    uz: "Google'ni ulash",
    ru: "Подключить Google",
  },
  "Google Calendar sign-in isn't switched on for this workspace yet. Ask whoever runs your Osonflow account to add the Google Calendar sign-in keys.":
    {
      uz: "Bu ish maydoni uchun Google Calendar orqali kirish hali yoqilmagan. Osonflow hisobingizni boshqaradigan kishidan Google Calendar kalitlarini qo'shishni so'rang.",
      ru: "Вход через Google Calendar для этого пространства пока не включён. Попросите того, кто управляет аккаунтом Osonflow, добавить ключи входа Google Calendar.",
    },
  Refresh: {
    uz: "Yangilash",
    ru: "Обновить",
  },
  "Google sign-in isn't switched on for this workspace yet. Ask whoever runs your Osonflow account to add the Google Sheets sign-in keys.":
    {
      uz: "Bu ish maydoni uchun Google orqali kirish hali yoqilmagan. Osonflow hisobingizni boshqaradigan kishidan Google Sheets kalitlarini qo'shishni so'rang.",
      ru: "Вход через Google для этого пространства пока не включён. Попросите того, кто управляет аккаунтом Osonflow, добавить ключи входа Google Sheets.",
    },
  "Connect once and every spreadsheet tool uses this account. The assistant only sees spreadsheets this Google account can open.":
    {
      uz: "Bir marta ulang — barcha jadval vositalari shu hisobdan foydalanadi. Yordamchi faqat shu Google hisobi ocha oladigan jadvallarni ko'radi.",
      ru: "Подключите один раз — все инструменты таблиц будут использовать этот аккаунт. Ассистент видит только таблицы, доступные этому аккаунту Google.",
    },
  "Disconnect Google Sheets?": {
    uz: "Google Sheets uzilsinmi?",
    ru: "Отключить Google Sheets?",
  },
  "Every spreadsheet tool stops working until an account is connected again. Your tools and their settings are kept.":
    {
      uz: "Hisob qayta ulanmaguncha barcha jadval vositalari ishlamaydi. Vositalaringiz va ularning sozlamalari saqlanib qoladi.",
      ru: "Все инструменты таблиц перестанут работать, пока аккаунт не подключат снова. Инструменты и их настройки сохранятся.",
    },
  "Google sign-in isn't switched on for this workspace yet. Ask whoever runs your Osonflow account to add the Google Sheets sign-in keys, or use an API key below for lookups.":
    {
      uz: "Bu ish maydoni uchun Google orqali kirish hali yoqilmagan. Osonflow hisobingizni boshqaradigan kishidan Google Sheets kalitlarini qo'shishni so'rang yoki qidiruv uchun quyidagi API kalitdan foydalaning.",
      ru: "Вход через Google для этого пространства пока не включён. Попросите добавить ключи входа Google Sheets или используйте API-ключ ниже для поиска.",
    },
  "Spreadsheets not showing up?": {
    uz: "Jadvallar ko'rinmayaptimi?",
    ru: "Таблицы не отображаются?",
  },
  "Remove Osonflow from your": {
    uz: "Osonflow'ni quyidagidan olib tashlang:",
    ru: "Удалите Osonflow из",
  },
  "Google account permissions": {
    uz: "Google hisobi ruxsatlari",
    ru: "разрешений аккаунта Google",
  },
  ", then disconnect and connect again so Drive access is granted. The Google Drive API also has to be enabled for the sign-in project.":
    {
      uz: ", so'ng Drive'ga kirish berilishi uchun uzib, qayta ulang. Kirish loyihasida Google Drive API ham yoqilgan bo'lishi kerak.",
      ru: ", затем отключите и подключите снова, чтобы выдать доступ к Drive. В проекте входа также должен быть включён Google Drive API.",
    },
  "Use an API key instead": {
    uz: "Buning o'rniga API kalitdan foydalanish",
    ru: "Использовать API-ключ",
  },
  "For developers. An API key only reads public sheets or sheets shared with your Google Cloud project, and it can only look rows up — adding, changing or deleting rows needs a connected account.":
    {
      uz: "Dasturchilar uchun. API kalit faqat ochiq jadvallarni yoki Google Cloud loyihangiz bilan ulashilgan jadvallarni o'qiydi va faqat qator topa oladi — qator qo'shish, o'zgartirish yoki o'chirish uchun ulangan hisob kerak.",
      ru: "Для разработчиков. API-ключ читает только публичные таблицы или таблицы, открытые вашему проекту Google Cloud, и умеет только искать строки — для добавления, изменения или удаления нужен подключённый аккаунт.",
    },
  "Google Sheets API key": {
    uz: "Google Sheets API kaliti",
    ru: "API-ключ Google Sheets",
  },
  "Save key": {
    uz: "Kalitni saqlash",
    ru: "Сохранить ключ",
  },
  "API key — lookups only": {
    uz: "API kalit — faqat qidiruv",
    ru: "API-ключ — только поиск",
  },
  "Stored headers are not valid JSON.": {
    uz: "Saqlangan sarlavhalar to'g'ri JSON emas.",
    ru: "Сохранённые заголовки — некорректный JSON.",
  },
  "Headers JSON": {
    uz: "Sarlavhalar JSON",
    ru: "JSON заголовков",
  },
  "Use guided editor": {
    uz: "Yo'naltiruvchi muharrirdan foydalanish",
    ru: "Использовать пошаговый редактор",
  },
  "How it signs in": {
    uz: "Qanday kiradi",
    ru: "Как авторизуется",
  },
  "Edit as JSON": {
    uz: "JSON sifatida tahrirlash",
    ru: "Редактировать как JSON",
  },
  "API key (Bearer)": {
    uz: "API kalit (Bearer)",
    ru: "API-ключ (Bearer)",
  },
  "If the service expects its key in a named header, add it under extra headers below.":
    {
      uz: "Agar xizmat kalitni nomlangan sarlavhada kutsa, uni quyidagi qo'shimcha sarlavhalarga qo'shing.",
      ru: "Если сервис ожидает ключ в именованном заголовке, добавьте его в дополнительные заголовки ниже.",
    },
  "Hide credential": {
    uz: "Kirish ma'lumotini yashirish",
    ru: "Скрыть учётные данные",
  },
  "Show credential": {
    uz: "Kirish ma'lumotini ko'rsatish",
    ru: "Показать учётные данные",
  },
  "Extra headers": {
    uz: "Qo'shimcha sarlavhalar",
    ru: "Дополнительные заголовки",
  },
  "Add header": {
    uz: "Sarlavha qo'shish",
    ru: "Добавить заголовок",
  },
  Only: {
    uz: "Faqat",
    ru: "Только",
  },
  "is sent by default.": {
    uz: "standart bo'yicha yuboriladi.",
    ru: "отправляется по умолчанию.",
  },
  Value: {
    uz: "Qiymat",
    ru: "Значение",
  },
  Basic: {
    uz: "Basic",
    ru: "Basic",
  },
  "Add the web address above and the exact request appears here.": {
    uz: "Yuqorida veb-manzilni qo'shing — aniq so'rov shu yerda paydo bo'ladi.",
    ru: "Добавьте веб-адрес выше, и здесь появится точный запрос.",
  },
  "from the assistant · sample data": {
    uz: "yordamchidan · namuna ma'lumotlar",
    ru: "от ассистента · пример данных",
  },
  "Copy as cURL": {
    uz: "cURL sifatida nusxalash",
    ru: "Копировать как cURL",
  },
  "Keys are hidden here. The copied command carries the real values, so a developer can reproduce the call exactly.":
    {
      uz: "Kalitlar bu yerda yashirilgan. Nusxalangan buyruqda haqiqiy qiymatlar bor, shuning uchun dasturchi chaqiruvni aynan takrorlay oladi.",
      ru: "Ключи здесь скрыты. В скопированной команде настоящие значения, поэтому разработчик сможет точно повторить вызов.",
    },
  "Choose a spreadsheet and tab above to load its columns.": {
    uz: "Ustunlarini yuklash uchun yuqorida jadval va varaqni tanlang.",
    ru: "Выберите таблицу и лист выше, чтобы загрузить столбцы.",
  },
  "Loading columns": {
    uz: "Ustunlar yuklanmoqda",
    ru: "Загрузка столбцов",
  },
  "Set up": {
    uz: "Sozlash",
    ru: "Настроить",
  },
  Add: {
    uz: "Qo'shish",
    ru: "Добавить",
  },
  "Search the tool library": {
    uz: "Vositalar kutubxonasidan qidirish",
    ru: "Поиск в библиотеке инструментов",
  },
  "Search by app or job — “HubSpot”, “book a meeting”, “order status”": {
    uz: "Ilova yoki vazifa bo'yicha qidiring — “HubSpot”, “uchrashuvga yozish”, “buyurtma holati”",
    ru: "Ищите по приложению или задаче — «HubSpot», «записать на встречу», «статус заказа»",
  },
  "Filter the library by category": {
    uz: "Kutubxonani toifa bo'yicha filtrlash",
    ru: "Фильтр библиотеки по категории",
  },
  Everything: {
    uz: "Hammasi",
    ru: "Всё",
  },
  "Nothing in the library matches that.": {
    uz: "Kutubxonada bunga mos narsa yo'q.",
    ru: "В библиотеке ничего не найдено.",
  },
  "If the app you use has an API, a developer can still connect it with the custom API request tool.":
    {
      uz: "Agar siz ishlatadigan ilovada API bo'lsa, dasturchi uni maxsus API so'rovi vositasi orqali baribir ulay oladi.",
      ru: "Если у вашего приложения есть API, разработчик всё равно сможет подключить его через инструмент «Свой API-запрос».",
    },
  "Show everything": {
    uz: "Hammasini ko'rsatish",
    ru: "Показать всё",
  },
  "Where most businesses start — each takes a few minutes to set up.": {
    uz: "Ko'pchilik bizneslar shulardan boshlaydi — har birini sozlash bir necha daqiqa oladi.",
    ru: "С этого начинает большинство бизнесов — настройка каждого занимает пару минут.",
  },
  "Popular first tools": {
    uz: "Mashhur birinchi vositalar",
    ru: "Популярные первые инструменты",
  },
  Results: {
    uz: "Natijalar",
    ru: "Результаты",
  },
  "On our roadmap. Listed so you know they're coming — they can't be added yet.":
    {
      uz: "Rejalarimizda. Kelayotganini bilishingiz uchun ro'yxatda — hozircha qo'shib bo'lmaydi.",
      ru: "В наших планах. Показаны, чтобы вы знали, что они появятся, — добавить пока нельзя.",
    },
  "Your tools": {
    uz: "Vositalaringiz",
    ru: "Ваши инструменты",
  },
  "Search your tools": {
    uz: "Vositalaringizdan qidirish",
    ru: "Поиск по вашим инструментам",
  },
  "Show tools": {
    uz: "Vositalarni ko'rsatish",
    ru: "Показать инструменты",
  },
  "Adding now": {
    uz: "Qo'shilmoqda",
    ru: "Добавляется",
  },
  "Not saved yet": {
    uz: "Hali saqlanmagan",
    ru: "Ещё не сохранено",
  },
  "Every tool is switched on.": {
    uz: "Barcha vositalar yoqilgan.",
    ru: "Все инструменты включены.",
  },
  "Nothing here yet.": {
    uz: "Bu yerda hali hech narsa yo'q.",
    ru: "Здесь пока ничего нет.",
  },
  "Show all tools": {
    uz: "Barcha vositalarni ko'rsatish",
    ru: "Показать все инструменты",
  },
  "Built in": {
    uz: "Ichki",
    ru: "Встроенные",
  },
  "Connected apps": {
    uz: "Ulangan ilovalar",
    ru: "Подключённые приложения",
  },
  "None yet. Connect an app you already use so your assistant can look things up and take action there.":
    {
      uz: "Hali yo'q. Yordamchingiz ma'lumot topib, harakat qila olishi uchun allaqachon ishlatayotgan ilovangizni ulang.",
      ru: "Пока нет. Подключите приложение, которым уже пользуетесь, чтобы ассистент мог искать там данные и действовать.",
    },
  "Add a tool": {
    uz: "Vosita qo'shish",
    ru: "Добавить инструмент",
  },
  Required: {
    uz: "Majburiy",
    ru: "Обязательно",
  },
  "Add a value": {
    uz: "Qiymat qo'shish",
    ru: "Добавить значение",
  },
  Text: {
    uz: "Matn",
    ru: "Текст",
  },
  Number: {
    uz: "Raqam",
    ru: "Число",
  },
  "Yes / no": {
    uz: "Ha / yo'q",
    ru: "Да / нет",
  },
  "The assistant calls this tool without sending anything. Add a value if the service needs to know something — an email, an order number.":
    {
      uz: "Yordamchi bu vositani hech narsa yubormasdan chaqiradi. Agar xizmatga biror narsa kerak bo'lsa — email, buyurtma raqami — qiymat qo'shing.",
      ru: "Ассистент вызывает этот инструмент, ничего не отправляя. Добавьте значение, если сервису нужно что-то знать — email, номер заказа.",
    },
  "What the assistant should put here": {
    uz: "Yordamchi bu yerga nima qo'yishi kerak",
    ru: "Что ассистент должен сюда подставить",
  },
  "The customer's email address": {
    uz: "Mijozning email manzili",
    ru: "Email клиента",
  },
  "Everything is in place.": {
    uz: "Hammasi joyida.",
    ru: "Всё на месте.",
  },
  "Your assistant will use this tool whenever a conversation matches the description below.":
    {
      uz: "Suhbat quyidagi tavsifga mos kelganda yordamchingiz shu vositadan foydalanadi.",
      ru: "Ассистент будет использовать этот инструмент, когда диалог подходит под описание ниже.",
    },
  "The test values must be a JSON object.": {
    uz: "Test qiymatlari JSON obyekt bo'lishi kerak.",
    ru: "Тестовые значения должны быть JSON-объектом.",
  },
  "The test values must be valid JSON.": {
    uz: "Test qiymatlari to'g'ri JSON bo'lishi kerak.",
    ru: "Тестовые значения должны быть корректным JSON.",
  },
  "Test failed.": {
    uz: "Test muvaffaqiyatsiz.",
    ru: "Тест не прошёл.",
  },
  "This tool takes no values": {
    uz: "Bu vosita qiymat qabul qilmaydi",
    ru: "Этот инструмент не принимает значений",
  },
  "Values the assistant would send": {
    uz: "Yordamchi yuboradigan qiymatlar",
    ru: "Значения, которые отправит ассистент",
  },
  "Use the form": {
    uz: "Formadan foydalanish",
    ru: "Использовать форму",
  },
  "Test values as JSON": {
    uz: "Test qiymatlari JSON ko'rinishida",
    ru: "Тестовые значения в JSON",
  },
  "Run it to see what comes back.": {
    uz: "Nima qaytishini ko'rish uchun ishga tushiring.",
    ru: "Запустите, чтобы увидеть результат.",
  },
  "Running…": {
    uz: "Ishlamoqda…",
    ru: "Выполняется…",
  },
  "Run test": {
    uz: "Testni ishga tushirish",
    ru: "Запустить тест",
  },
  "Uses the saved setup and calls the real service, exactly as the assistant would.":
    {
      uz: "Saqlangan sozlamalardan foydalanadi va haqiqiy xizmatni yordamchi qanday chaqirsa, aynan shunday chaqiradi.",
      ru: "Использует сохранённые настройки и вызывает реальный сервис ровно так, как это сделал бы ассистент.",
    },
  Failed: {
    uz: "Xato",
    ru: "Ошибка",
  },
  Worked: {
    uz: "Ishladi",
    ru: "Сработало",
  },
  Step: {
    uz: "Qadam",
    ru: "Шаг",
  },
  ", done": {
    uz: ", bajarildi",
    ru: ", готово",
  },
  "Unable to save Google Sheets key": {
    uz: "Google Sheets kalitini saqlab bo'lmadi",
    ru: "Не удалось сохранить ключ Google Sheets",
  },
  "Save this tool before running a test.": {
    uz: "Testni ishga tushirishdan oldin bu vositani saqlang.",
    ru: "Сохраните инструмент перед запуском теста.",
  },
  "Save your changes before running a test.": {
    uz: "Testni ishga tushirishdan oldin o'zgarishlaringizni saqlang.",
    ru: "Сохраните изменения перед запуском теста.",
  },
  "Turn the tool on to run it.": {
    uz: "Ishga tushirish uchun vositani yoqing.",
    ru: "Включите инструмент, чтобы запустить его.",
  },
  "Tests run over the chat channel — enable Chat first.": {
    uz: "Testlar chat kanali orqali ishlaydi — avval Chat'ni yoqing.",
    ru: "Тесты идут через чат — сначала включите Чат.",
  },
  "Go to setup": {
    uz: "Sozlashga o'tish",
    ru: "Перейти к настройке",
  },
  "Describe when to use it": {
    uz: "Qachon ishlatilishini tasvirlang",
    ru: "Опишите, когда его использовать",
  },
  "Your assistant only uses a tool when a conversation matches its description. Write it below.":
    {
      uz: "Yordamchingiz vositani faqat suhbat uning tavsifiga mos kelganda ishlatadi. Uni quyida yozing.",
      ru: "Ассистент использует инструмент, только когда диалог подходит под описание. Напишите его ниже.",
    },
  Overview: {
    uz: "Umumiy ko'rinish",
    ru: "Обзор",
  },
  Setup: {
    uz: "Sozlash",
    ru: "Настройка",
  },
  "Try it": {
    uz: "Sinab ko'rish",
    ru: "Попробовать",
  },
  "Not added yet — save to finish": {
    uz: "Hali qo'shilmagan — tugatish uchun saqlang",
    ru: "Ещё не добавлен — сохраните, чтобы завершить",
  },
  "Unsaved changes": {
    uz: "Saqlanmagan o'zgarishlar",
    ru: "Несохранённые изменения",
  },
  "Working now": {
    uz: "Hozir ishlamoqda",
    ru: "Работает сейчас",
  },
  "In chat": {
    uz: "Chatda",
    ru: "В чате",
  },
  "Website widget and messaging apps": {
    uz: "Sayt vidjeti va messenjerlar",
    ru: "Виджет сайта и мессенджеры",
  },
  "On voice calls": {
    uz: "Ovozli qo'ng'iroqlarda",
    ru: "В голосовых звонках",
  },
  "Your voice assistant": {
    uz: "Ovozli yordamchingiz",
    ru: "Ваш голосовой ассистент",
  },
  "Ready to add": {
    uz: "Qo'shishga tayyor",
    ru: "Готов к добавлению",
  },
  "Ready to use": {
    uz: "Foydalanishga tayyor",
    ru: "Готов к работе",
  },
  "Nothing is missing.": {
    uz: "Hech narsa yetishmayapti.",
    ru: "Всё готово.",
  },
  "When should your assistant use it?": {
    uz: "Yordamchingiz uni qachon ishlatishi kerak?",
    ru: "Когда ассистенту его использовать?",
  },
  "Your assistant reads this to decide when the tool fits. Describe the situation a customer is in — not the technology.":
    {
      uz: "Yordamchingiz vosita qachon mos kelishini shu matnga qarab hal qiladi. Texnologiyani emas, mijoz qanday vaziyatda ekanini tasvirlang.",
      ru: "Ассистент читает это, чтобы решить, когда инструмент уместен. Опишите ситуацию клиента, а не технологию.",
    },
  "Use when a customer asks where their order is and gives an order number or the email they ordered with.":
    {
      uz: "Mijoz buyurtmasi qayerdaligini so'rasa va buyurtma raqami yoki buyurtma berilgan emailni aytsa, foydalaning.",
      ru: "Используй, когда клиент спрашивает, где его заказ, и называет номер заказа или email, с которым оформлял.",
    },
  "Good descriptions say": {
    uz: "Yaxshi tavsifda aytiladi",
    ru: "Хорошее описание говорит",
  },
  "what the customer gives you": {
    uz: "mijoz sizga nima beradi",
    ru: "что даёт вам клиент",
  },
  "Where it works": {
    uz: "Qayerda ishlaydi",
    ru: "Где работает",
  },
  "Choose where customers can reach this tool through your assistant.": {
    uz: "Mijozlar bu vositadan yordamchingiz orqali qayerda foydalana olishini tanlang.",
    ru: "Выберите, где клиенты смогут воспользоваться этим инструментом через ассистента.",
  },
  "Your website widget, Telegram, WhatsApp and Instagram": {
    uz: "Sayt vidjetingiz, Telegram, WhatsApp va Instagram",
    ru: "Виджет сайта, Telegram, WhatsApp и Instagram",
  },
  "Voice calls can't hand over or close a conversation": {
    uz: "Ovozli qo'ng'iroqlar suhbatni uzata yoki yopa olmaydi",
    ru: "Голосовые звонки не могут передать или закрыть диалог",
  },
  "Your voice assistant, on OpenAI Realtime and Gemini Live": {
    uz: "OpenAI Realtime va Gemini Live'dagi ovozli yordamchingiz",
    ru: "Ваш голосовой ассистент на OpenAI Realtime и Gemini Live",
  },
  "This tool is switched off, so neither channel uses it.": {
    uz: "Bu vosita o'chirilgan, shuning uchun hech bir kanal undan foydalanmaydi.",
    ru: "Инструмент выключен, поэтому ни один канал его не использует.",
  },
  "Turn it on": {
    uz: "Yoqish",
    ru: "Включить",
  },
  "How it reads your documents": {
    uz: "Hujjatlaringizni qanday o'qiydi",
    ru: "Как он читает ваши документы",
  },
  "The AI model that reads what the search finds before your assistant answers. Faster models cost less; stronger ones handle long, detailed documents better.":
    {
      uz: "Yordamchingiz javob berishidan oldin qidiruv topgan narsani o'qiydigan AI model. Tezroq modellar arzonroq; kuchliroqlari uzun va batafsil hujjatlarni yaxshiroq tushunadi.",
      ru: "AI-модель, которая читает найденное до ответа ассистента. Быстрые модели дешевле; более сильные лучше справляются с длинными подробными документами.",
    },
  "Knowledge base model": {
    uz: "Bilim bazasi modeli",
    ru: "Модель базы знаний",
  },
  "Select model": {
    uz: "Modelni tanlang",
    ru: "Выберите модель",
  },
  "Built-in tools run inside Osonflow — there's nothing to connect and no key to store.":
    {
      uz: "Ichki vositalar Osonflow ichida ishlaydi — ulash kerak bo'lgan narsa ham, saqlanadigan kalit ham yo'q.",
      ru: "Встроенные инструменты работают внутри Osonflow — ничего не нужно подключать и хранить ключи.",
    },
  Connection: {
    uz: "Ulanish",
    ru: "Подключение",
  },
  "How this tool reaches": {
    uz: "Bu vosita qanday yetib boradi",
    ru: "Как этот инструмент обращается к",
  },
  "Change setup": {
    uz: "Sozlamani o'zgartirish",
    ru: "Изменить настройку",
  },
  App: {
    uz: "Ilova",
    ru: "Приложение",
  },
  "Sends to": {
    uz: "Qayerga yuboradi",
    ru: "Отправляет в",
  },
  "Not set yet": {
    uz: "Hali o'rnatilmagan",
    ru: "Ещё не задано",
  },
  Key: {
    uz: "Kalit",
    ru: "Ключ",
  },
  "Advanced: the name your assistant calls it by": {
    uz: "Kengaytirilgan: yordamchingiz uni qanday nom bilan chaqiradi",
    ru: "Дополнительно: имя, по которому ассистент его вызывает",
  },
  "Tool name": {
    uz: "Vosita nomi",
    ru: "Название инструмента",
  },
  "Built-in tools keep a fixed name.": {
    uz: "Ichki vositalarning nomi o'zgarmaydi.",
    ru: "Встроенные инструменты имеют фиксированное имя.",
  },
  "Will be saved as": {
    uz: "Quyidagicha saqlanadi",
    ru: "Будет сохранено как",
  },
  "Only the AI sees this. Lowercase letters, numbers and underscores.": {
    uz: "Buni faqat AI ko'radi. Kichik harflar, raqamlar va pastki chiziq.",
    ru: "Это видит только AI. Строчные буквы, цифры и подчёркивания.",
  },
  "Request method": {
    uz: "So'rov usuli",
    ru: "Метод запроса",
  },
  "POST — send data": {
    uz: "POST — ma'lumot yuborish",
    ru: "POST — отправить данные",
  },
  "GET — fetch data": {
    uz: "GET — ma'lumot olish",
    ru: "GET — получить данные",
  },
  "Connect once — every spreadsheet tool uses the same account.": {
    uz: "Bir marta ulang — barcha jadval vositalari bitta hisobdan foydalanadi.",
    ru: "Подключите один раз — все инструменты таблиц используют один аккаунт.",
  },
  "Connect your Google account": {
    uz: "Google hisobingizni ulang",
    ru: "Подключите аккаунт Google",
  },
  "Pick the file and the tab. The first row of the tab should hold your column names.":
    {
      uz: "Fayl va varaqni tanlang. Varaqning birinchi qatorida ustun nomlari bo'lishi kerak.",
      ru: "Выберите файл и лист. В первой строке листа должны быть названия столбцов.",
    },
  "Choose the spreadsheet": {
    uz: "Jadvalni tanlang",
    ru: "Выберите таблицу",
  },
  "An API key can only look rows up. Connect a Google account to add, change or delete rows.":
    {
      uz: "API kalit faqat qator topa oladi. Qator qo'shish, o'zgartirish yoki o'chirish uchun Google hisobini ulang.",
      ru: "API-ключ умеет только искать строки. Чтобы добавлять, менять или удалять, подключите аккаунт Google.",
    },
  "Filter spreadsheets": {
    uz: "Jadvallarni filtrlash",
    ru: "Фильтр таблиц",
  },
  "Filter spreadsheets…": {
    uz: "Jadvallarni filtrlash…",
    ru: "Фильтр таблиц…",
  },
  "Loading your spreadsheets…": {
    uz: "Jadvallaringiz yuklanmoqda…",
    ru: "Загрузка таблиц…",
  },
  "No spreadsheets found in this Google account.": {
    uz: "Bu Google hisobida jadvallar topilmadi.",
    ru: "В этом аккаунте Google таблиц не найдено.",
  },
  "Paste a spreadsheet ID instead": {
    uz: "Buning o'rniga jadval ID'sini qo'yish",
    ru: "Вставить ID таблицы",
  },
  "Choose from my Google Drive": {
    uz: "Google Drive'imdan tanlash",
    ru: "Выбрать из Google Drive",
  },
  "It's the long code in the spreadsheet's web address, between /d/ and /edit.":
    {
      uz: "Bu jadval veb-manzilidagi /d/ va /edit orasidagi uzun kod.",
      ru: "Это длинный код в адресе таблицы между /d/ и /edit.",
    },
  Tab: {
    uz: "Varaq",
    ru: "Лист",
  },
  "Loading tabs…": {
    uz: "Varaqlar yuklanmoqda…",
    ru: "Загрузка листов…",
  },
  "Choose a tab": {
    uz: "Varaqni tanlang",
    ru: "Выберите лист",
  },
  "Tool library": {
    uz: "Vositalar kutubxonasi",
    ru: "Библиотека инструментов",
  },
  "Choose the columns": {
    uz: "Ustunlarni tanlang",
    ru: "Выберите столбцы",
  },
  "Accounts & security": {
    uz: "Hisoblar va xavfsizlik",
    ru: "Аккаунты и безопасность",
  },
  "Used to find the right row. The assistant asks the customer for these and matches them against what's already in the sheet.":
    {
      uz: "To'g'ri qatorni topish uchun ishlatiladi. Yordamchi bularni mijozdan so'raydi va jadvaldagi mavjud ma'lumotlar bilan solishtiradi.",
      ru: "Используется для поиска нужной строки. Ассистент спрашивает их у клиента и сверяет с тем, что уже есть в таблице.",
    },
  "Find the row by": {
    uz: "Qatorni nima bo'yicha topish",
    ru: "Искать строку по",
  },
  "The columns your assistant fills in when it adds a new row.": {
    uz: "Yangi qator qo'shganda yordamchingiz to'ldiradigan ustunlar.",
    ru: "Столбцы, которые ассистент заполняет при добавлении новой строки.",
  },
  "Fill in": {
    uz: "To'ldirish",
    ru: "Заполнять",
  },
  "The columns your assistant may change once it finds the row.": {
    uz: "Qatorni topgach, yordamchingiz o'zgartirishi mumkin bo'lgan ustunlar.",
    ru: "Столбцы, которые ассистент может изменить, найдя строку.",
  },
  "Allowed to change": {
    uz: "O'zgartirishga ruxsat",
    ru: "Можно менять",
  },
  "Only these columns are read back to your assistant. Leave all unselected to share every column.":
    {
      uz: "Yordamchingizga faqat shu ustunlar qaytariladi. Barcha ustunlarni ulashish uchun hech birini tanlamang.",
      ru: "Ассистенту возвращаются только эти столбцы. Ничего не выбирайте, чтобы делиться всеми.",
    },
  "Share back (optional)": {
    uz: "Qaytariladigan ustunlar (ixtiyoriy)",
    ru: "Возвращать (необязательно)",
  },
  "Generated from your columns — your assistant collects exactly these from the customer.":
    {
      uz: "Ustunlaringizdan yaratilgan — yordamchingiz mijozdan aynan shularni to'playdi.",
      ru: "Создано из ваших столбцов — ассистент соберёт у клиента ровно это.",
    },
  "Check what your assistant will ask for": {
    uz: "Yordamchingiz nimalarni so'rashini tekshiring",
    ru: "Проверьте, что спросит ассистент",
  },
  "Choose columns above and they appear here.": {
    uz: "Yuqorida ustunlarni tanlang — ular shu yerda paydo bo'ladi.",
    ru: "Выберите столбцы выше, и они появятся здесь.",
  },
  "Only your workspace can use them": {
    uz: "Ulardan faqat sizning ish maydoningiz foydalana oladi",
    ru: "Пользоваться ими может только ваше пространство",
  },
  "A column used both to find the row and to change it appears twice: the plain name is the value already in the sheet, and the":
    {
      uz: "Qatorni topish uchun ham, o'zgartirish uchun ham ishlatiladigan ustun ikki marta ko'rinadi: oddiy nomi jadvaldagi mavjud qiymat,",
      ru: "Столбец, по которому ищут и который меняют, появляется дважды: простое имя — это текущее значение в таблице, а",
    },
  "one is the corrected value to write.": {
    uz: "belgili nomi esa yoziladigan tuzatilgan qiymat.",
    ru: "— исправленное значение для записи.",
  },
  "A tool is visible only to assistants in the business that added it, and only on the channels it's switched on for.":
    {
      uz: "Vosita faqat uni qo'shgan biznesning yordamchilariga va faqat u yoqilgan kanallarda ko'rinadi.",
      ru: "Инструмент виден только ассистентам бизнеса, который его добавил, и только в включённых каналах.",
    },
  "Advanced: matching and limits": {
    uz: "Kengaytirilgan: moslash va cheklovlar",
    ru: "Дополнительно: сопоставление и лимиты",
  },
  "How values are matched": {
    uz: "Qiymatlar qanday solishtiriladi",
    ru: "Как сопоставляются значения",
  },
  "Search method": {
    uz: "Qidiruv usuli",
    ru: "Способ поиска",
  },
  "Calls only go to the public internet": {
    uz: "Chaqiruvlar faqat ochiq internetga boradi",
    ru: "Вызовы идут только в публичный интернет",
  },
  "Requests must use http or https. Private, local and internal network addresses are refused, and every redirect is checked again.":
    {
      uz: "So'rovlar http yoki https ishlatishi kerak. Shaxsiy, mahalliy va ichki tarmoq manzillari rad etiladi, har bir yo'naltirish qayta tekshiriladi.",
      ru: "Запросы должны использовать http или https. Частные, локальные и внутренние адреса отклоняются, каждый редирект проверяется заново.",
    },
  "Most rows returned": {
    uz: "Ko'pi bilan qaytariladigan qatorlar",
    ru: "Максимум возвращаемых строк",
  },
  "Most rows scanned": {
    uz: "Ko'pi bilan ko'rib chiqiladigan qatorlar",
    ru: "Максимум просматриваемых строк",
  },
  "Answers are kept short": {
    uz: "Javoblar qisqa saqlanadi",
    ru: "Ответы остаются короткими",
  },
  "Row with column names": {
    uz: "Ustun nomlari joylashgan qator",
    ru: "Строка с названиями столбцов",
  },
  "At most 4,000 characters of a reply reach your assistant, so a huge response can't flood the conversation.":
    {
      uz: "Javobning ko'pi bilan 4 000 belgisi yordamchingizga yetadi, shuning uchun juda katta javob suhbatni to'ldirib yubora olmaydi.",
      ru: "До ассистента доходит не более 4 000 символов ответа, поэтому огромный ответ не захлестнёт диалог.",
    },
  "Cell range (optional)": {
    uz: "Kataklar oralig'i (ixtiyoriy)",
    ru: "Диапазон ячеек (необязательно)",
  },
  "Limits large scans. Leave empty for the automatic limit.": {
    uz: "Katta ko'rib chiqishlarni cheklaydi. Avtomatik cheklov uchun bo'sh qoldiring.",
    ru: "Ограничивает большие просмотры. Оставьте пустым для автоматического лимита.",
  },
  "Stops the change when more than one row matches, so the wrong row is never touched.":
    {
      uz: "Bir nechta qator mos kelsa, o'zgarishni to'xtatadi, shunda noto'g'ri qatorga hech qachon tegilmaydi.",
      ru: "Останавливает изменение, если подходит больше одной строки, чтобы не затронуть не ту.",
    },
  "Only change a single, exact match": {
    uz: "Faqat yagona, aniq moslikni o'zgartirish",
    ru: "Менять только единственное точное совпадение",
  },
  "Keys stay out of the conversation": {
    uz: "Kalitlar suhbatga tushmaydi",
    ru: "Ключи не попадают в диалог",
  },
  "Keys are sent to the app you connected and nowhere else. Your assistant only ever sees the answer, never the key.":
    {
      uz: "Kalitlar faqat siz ulagan ilovaga yuboriladi. Yordamchingiz kalitni emas, faqat javobni ko'radi.",
      ru: "Ключи отправляются только в подключённое приложение. Ассистент видит только ответ, а не ключ.",
    },
  "Connect once — every calendar tool uses the same account.": {
    uz: "Bir marta ulang — barcha kalendar vositalari bitta hisobdan foydalanadi.",
    ru: "Подключите один раз — все инструменты календаря используют один аккаунт.",
  },
  "Connect Google Calendar": {
    uz: "Google Calendar'ni ulash",
    ru: "Подключить Google Calendar",
  },
  "for the connected account's own calendar, or paste another calendar's ID from its settings in Google Calendar.":
    {
      uz: "— ulangan hisobning o'z kalendari uchun, yoki Google Calendar sozlamalaridan boshqa kalendar ID'sini qo'ying.",
      ru: "— для собственного календаря подключённого аккаунта, или вставьте ID другого календаря из его настроек в Google Calendar.",
    },
  "Choose the calendar": {
    uz: "Kalendarni tanlang",
    ru: "Выберите календарь",
  },
  "Calendar ID": {
    uz: "Kalendar ID",
    ru: "ID календаря",
  },
  "Each value is something your assistant works out from the conversation.": {
    uz: "Har bir qiymatni yordamchingiz suhbatdan aniqlaydi.",
    ru: "Каждое значение ассистент берёт из диалога.",
  },
  "What your assistant fills in": {
    uz: "Yordamchingiz nimalarni to'ldiradi",
    ru: "Что заполняет ассистент",
  },
  "For developers: request body": {
    uz: "Dasturchilar uchun: so'rov tanasi",
    ru: "Для разработчиков: тело запроса",
  },
  Use: {
    uz: "Foydalaning:",
    ru: "Используйте",
  },
  "where a value from your assistant should go. Leave it empty to send the values as plain JSON.":
    {
      uz: "yordamchingiz qiymati qo'yilishi kerak bo'lgan joyda. Qiymatlarni oddiy JSON sifatida yuborish uchun bo'sh qoldiring.",
      ru: "там, где должно стоять значение от ассистента. Оставьте пустым, чтобы отправлять значения простым JSON.",
    },
  "Loading assistant tools": {
    uz: "Yordamchi vositalari yuklanmoqda",
    ru: "Загрузка инструментов ассистента",
  },
  "A GET request has no body — every value is added to the web address instead.":
    {
      uz: "GET so'rovida tana yo'q — har bir qiymat veb-manzilga qo'shiladi.",
      ru: "У GET-запроса нет тела — каждое значение добавляется к веб-адресу.",
    },
  "For developers: preview the exact request": {
    uz: "Dasturchilar uchun: aniq so'rovni oldindan ko'rish",
    ru: "Для разработчиков: предпросмотр точного запроса",
  },
  "The web address from the app's documentation.": {
    uz: "Ilova hujjatlaridagi veb-manzil.",
    ru: "Веб-адрес из документации приложения.",
  },
  "Where it sends the request": {
    uz: "So'rovni qayerga yuboradi",
    ru: "Куда отправляется запрос",
  },
  "Web address": {
    uz: "Veb-manzil",
    ru: "Веб-адрес",
  },
  "Stored with this tool and only ever sent to the address above.": {
    uz: "Shu vosita bilan saqlanadi va faqat yuqoridagi manzilga yuboriladi.",
    ru: "Хранится с этим инструментом и отправляется только по адресу выше.",
  },
  "Add your key, if it needs one": {
    uz: "Kerak bo'lsa, kalitingizni qo'shing",
    ru: "Добавьте ключ, если он нужен",
  },
  "Your assistant's values arrive there as a simple JSON object — ideal for Zapier, Make, n8n or your own server.":
    {
      uz: "Yordamchingiz qiymatlari u yerga oddiy JSON obyekt sifatida keladi — Zapier, Make, n8n yoki o'z serveringiz uchun ideal.",
      ru: "Значения ассистента приходят туда простым JSON-объектом — идеально для Zapier, Make, n8n или своего сервера.",
    },
  "Where it sends the data": {
    uz: "Ma'lumotlarni qayerga yuboradi",
    ru: "Куда отправляются данные",
  },
  "Webhook address": {
    uz: "Webhook manzili",
    ru: "Адрес вебхука",
  },
  "Try it before your customers do": {
    uz: "Mijozlaringizdan oldin sinab ko'ring",
    ru: "Попробуйте раньше ваших клиентов",
  },
  "Type what a customer might tell your assistant, run the tool, and read exactly what comes back.":
    {
      uz: "Mijoz yordamchingizga nima deyishi mumkinligini yozing, vositani ishga tushiring va aynan nima qaytganini o'qing.",
      ru: "Напишите, что мог бы сказать клиент, запустите инструмент и посмотрите, что именно вернулось.",
    },
  "· Built in": {
    uz: "· Ichki",
    ru: "· Встроенный",
  },
  "Switch this tool off": {
    uz: "Bu vositani o'chirish",
    ru: "Выключить этот инструмент",
  },
  "Switch this tool on": {
    uz: "Bu vositani yoqish",
    ru: "Включить этот инструмент",
  },
  "More actions": {
    uz: "Boshqa amallar",
    ru: "Другие действия",
  },
  "Delete tool": {
    uz: "Vositani o'chirish",
    ru: "Удалить инструмент",
  },
  "Tool sections": {
    uz: "Vosita bo'limlari",
    ru: "Разделы инструмента",
  },
  Ready: {
    uz: "Tayyor",
    ru: "Готово",
  },
  "Not added yet": {
    uz: "Hali qo'shilmagan",
    ru: "Ещё не добавлен",
  },
  "Saved — changes apply everywhere this tool is on": {
    uz: "Saqlandi — o'zgarishlar vosita yoqilgan hamma joyda qo'llanadi",
    ru: "Сохранено — изменения применяются везде, где инструмент включён",
  },
  "Add tool": {
    uz: "Vosita qo'shish",
    ru: "Добавить инструмент",
  },
  "Pick a tool on the left to change what it does.": {
    uz: "Nima qilishini o'zgartirish uchun chapdan vositani tanlang.",
    ru: "Выберите инструмент слева, чтобы изменить, что он делает.",
  },
  "Or give your assistant something new to do. These are where most businesses start:":
    {
      uz: "Yoki yordamchingizga yangi vazifa bering. Ko'pchilik bizneslar shulardan boshlaydi:",
      ru: "Или дайте ассистенту новую задачу. С этого начинает большинство бизнесов:",
    },
  "See all": {
    uz: "Hammasini ko'rish",
    ru: "Смотреть все",
  },
  "Assistant tools sections": {
    uz: "Yordamchi vositalari bo'limlari",
    ru: "Разделы инструментов ассистента",
  },
  "Sign in once here. Every tool that uses the account shares the same connection.":
    {
      uz: "Bu yerda bir marta kiring. Hisobdan foydalanadigan har bir vosita bitta ulanishni ishlatadi.",
      ru: "Войдите здесь один раз. Все инструменты, использующие аккаунт, разделяют одно подключение.",
    },
  "Connected accounts": {
    uz: "Ulangan hisoblar",
    ru: "Подключённые аккаунты",
  },
  "Every outside address your tools reach, the key each one uses, and whether that key has actually been filled in.":
    {
      uz: "Vositalaringiz murojaat qiladigan har bir tashqi manzil, har biri ishlatadigan kalit va u haqiqatan to'ldirilganmi.",
      ru: "Все внешние адреса, к которым обращаются инструменты, ключ каждого и заполнен ли он на самом деле.",
    },
  "Apps your assistant calls": {
    uz: "Yordamchingiz chaqiradigan ilovalar",
    ru: "Приложения, которые вызывает ассистент",
  },
  "What happens between your assistant deciding to use a tool and the answer coming back.":
    {
      uz: "Yordamchingiz vositadan foydalanishga qaror qilganidan javob qaytgunicha nima sodir bo'ladi.",
      ru: "Что происходит между решением ассистента использовать инструмент и получением ответа.",
    },
  "How tool calls stay safe": {
    uz: "Vosita chaqiruvlari qanday xavfsiz qoladi",
    ru: "Как вызовы инструментов остаются безопасными",
  },
  "Leave without saving?": {
    uz: "Saqlamasdan chiqasizmi?",
    ru: "Выйти без сохранения?",
  },
  "This tool has changes that haven't been saved. If you leave now they'll be lost.":
    {
      uz: "Bu vositada saqlanmagan o'zgarishlar bor. Hozir chiqsangiz, ular yo'qoladi.",
      ru: "В этом инструменте есть несохранённые изменения. Если уйти сейчас, они пропадут.",
    },
  "Keep editing": {
    uz: "Tahrirlashda davom etish",
    ru: "Продолжить редактирование",
  },
  "Discard changes": {
    uz: "O'zgarishlarni bekor qilish",
    ru: "Отменить изменения",
  },
  "this tool": {
    uz: "bu vosita",
    ru: "этот инструмент",
  },
  "Your assistant stops using it straight away. This can't be undone — to pause it instead, switch it off.":
    {
      uz: "Yordamchingiz undan darhol foydalanishni to'xtatadi. Buni ortga qaytarib bo'lmaydi — vaqtincha to'xtatish uchun uni o'chirib qo'ying.",
      ru: "Ассистент сразу перестанет его использовать. Это нельзя отменить — чтобы приостановить, просто выключите его.",
    },
  "New tool": {
    uz: "Yangi vosita",
    ru: "Новый инструмент",
  },
  "No spreadsheets were returned. Enable the Google Drive API in Google Cloud Console, then disconnect and reconnect this account.":
    {
      uz: "Hech qanday jadval qaytmadi. Google Cloud Console'da Google Drive API'ni yoqing, so'ng bu hisobni uzib, qayta ulang.",
      ru: "Таблицы не вернулись. Включите Google Drive API в Google Cloud Console, затем отключите и снова подключите аккаунт.",
    },
  "Unable to load spreadsheets": {
    uz: "Jadvallarni yuklab bo'lmadi",
    ru: "Не удалось загрузить таблицы",
  },
  "That built-in tool is still being prepared.": {
    uz: "Bu ichki vosita hali tayyorlanmoqda.",
    ru: "Этот встроенный инструмент ещё готовится.",
  },
  "Tool name and description are required": {
    uz: "Vosita nomi va tavsifi majburiy",
    ru: "Название и описание инструмента обязательны",
  },
  "Choose a spreadsheet before saving": {
    uz: "Saqlashdan oldin jadvalni tanlang",
    ru: "Выберите таблицу перед сохранением",
  },
  "Choose a sheet tab before saving": {
    uz: "Saqlashdan oldin varaqni tanlang",
    ru: "Выберите лист перед сохранением",
  },
  "Select at least one search column": {
    uz: "Kamida bitta qidiruv ustunini tanlang",
    ru: "Выберите хотя бы один столбец поиска",
  },
  "Select at least one value column": {
    uz: "Kamida bitta qiymat ustunini tanlang",
    ru: "Выберите хотя бы один столбец значений",
  },
  "Select at least one update column": {
    uz: "Kamida bitta yangilash ustunini tanlang",
    ru: "Выберите хотя бы один столбец обновления",
  },
  "Choose a calendar before saving": {
    uz: "Saqlashdan oldin kalendarni tanlang",
    ru: "Выберите календарь перед сохранением",
  },
  "Add the endpoint this tool should call": {
    uz: "Bu vosita chaqirishi kerak bo'lgan endpointni qo'shing",
    ru: "Добавьте эндпоинт, который должен вызывать инструмент",
  },
  "Add the webhook URL this tool should post to": {
    uz: "Bu vosita yuborishi kerak bo'lgan webhook URL'ni qo'shing",
    ru: "Добавьте URL вебхука, куда инструмент должен отправлять данные",
  },
  "Tool created": {
    uz: "Vosita yaratildi",
    ru: "Инструмент создан",
  },
  "Tool updated": {
    uz: "Vosita yangilandi",
    ru: "Инструмент обновлён",
  },
  "Unable to save assistant tool": {
    uz: "Yordamchi vositasini saqlab bo'lmadi",
    ru: "Не удалось сохранить инструмент ассистента",
  },
  "Tool duplicated — it stays off until you enable it": {
    uz: "Vosita nusxalandi — siz yoqmaguningizcha o'chiq turadi",
    ru: "Инструмент продублирован — он выключен, пока вы его не включите",
  },
  "Unable to duplicate this tool": {
    uz: "Bu vositani nusxalab bo'lmadi",
    ru: "Не удалось дублировать инструмент",
  },
  "Tool deleted": {
    uz: "Vosita o'chirildi",
    ru: "Инструмент удалён",
  },
  "Unable to delete assistant tool": {
    uz: "Yordamchi vositasini o'chirib bo'lmadi",
    ru: "Не удалось удалить инструмент ассистента",
  },
  "Unable to start Google sign-in": {
    uz: "Google orqali kirishni boshlab bo'lmadi",
    ru: "Не удалось начать вход через Google",
  },
  "Google account disconnected": {
    uz: "Google hisobi uzildi",
    ru: "Аккаунт Google отключён",
  },
  "Unable to disconnect Google account": {
    uz: "Google hisobini uzib bo'lmadi",
    ru: "Не удалось отключить аккаунт Google",
  },
  "Google Calendar disconnected": {
    uz: "Google Calendar uzildi",
    ru: "Google Calendar отключён",
  },
  "Unable to disconnect Google Calendar": {
    uz: "Google Calendar'ni uzib bo'lmadi",
    ru: "Не удалось отключить Google Calendar",
  },
  "Google Sheets API key is required": {
    uz: "Google Sheets API kaliti majburiy",
    ru: "Нужен API-ключ Google Sheets",
  },
  "Google Sheets API key saved": {
    uz: "Google Sheets API kaliti saqlandi",
    ru: "API-ключ Google Sheets сохранён",
  },
  "Connecting Google Calendar": {
    uz: "Google Calendar ulanmoqda",
    ru: "Подключение Google Calendar",
  },
  "Finishing authorization and saving your account...": {
    uz: "Avtorizatsiya yakunlanmoqda va hisobingiz saqlanmoqda...",
    ru: "Завершаем авторизацию и сохраняем аккаунт...",
  },
  "Failed to connect Google account": {
    uz: "Google hisobini ulab bo'lmadi",
    ru: "Не удалось подключить аккаунт Google",
  },
  "Google authorization was cancelled": {
    uz: "Google avtorizatsiyasi bekor qilindi",
    ru: "Авторизация Google отменена",
  },
  "Missing Google authorization response": {
    uz: "Google avtorizatsiya javobi yo'q",
    ru: "Нет ответа авторизации Google",
  },
  "Google Calendar connected": {
    uz: "Google Calendar ulandi",
    ru: "Google Calendar подключён",
  },
  "Connecting Google Sheets": {
    uz: "Google Sheets ulanmoqda",
    ru: "Подключение Google Sheets",
  },
  "Google account connected": {
    uz: "Google hisobi ulandi",
    ru: "Аккаунт Google подключён",
  },
  "Context on every returning customer": {
    uz: "Har bir qaytgan mijoz haqida kontekst",
    ru: "Контекст по каждому вернувшемуся клиенту",
  },
  "Answers trained on your own content": {
    uz: "O'z kontentingiz asosida o'rgatilgan javoblar",
    ru: "Ответы на основе вашего контента",
  },
  "Voice AI": {
    uz: "Ovozli AI",
    ru: "Голосовой AI",
  },
  "Realtime calls with full transcripts": {
    uz: "To'liq yozuvlar bilan real vaqtdagi qo'ng'iroqlar",
    ru: "Звонки в реальном времени с полными расшифровками",
  },
  "Pro plan": {
    uz: "Pro tarif",
    ru: "Тариф Pro",
  },
  "Unlock this workspace": {
    uz: "Bu ish maydonini ochish",
    ru: "Открыть это пространство",
  },
  "This page is part of the Pro plan, alongside the rest of the premium AI toolset.":
    {
      uz: "Bu sahifa premium AI vositalari qatori Pro tarifga kiradi.",
      ru: "Эта страница входит в тариф Pro вместе с остальными премиум AI-инструментами.",
    },
  "Not included": {
    uz: "Kiritilmagan",
    ru: "Не включено",
  },
  Active: {
    uz: "Faol",
    ru: "Активна",
  },
  Trial: {
    uz: "Sinov davri",
    ru: "Пробный период",
  },
  "Past due": {
    uz: "To'lov muddati o'tgan",
    ru: "Просрочена",
  },
  Canceled: {
    uz: "Bekor qilingan",
    ru: "Отменена",
  },
  Inactive: {
    uz: "Faol emas",
    ru: "Неактивна",
  },
  "Upgrade successful": {
    uz: "Tarif muvaffaqiyatli yangilandi",
    ru: "Тариф успешно обновлён",
  },
  "Your Pro subscription is active. Manage invoices and payment methods in the Polar customer portal.":
    {
      uz: "Pro obunangiz faol. Hisob-fakturalar va to'lov usullarini Polar mijoz portalida boshqaring.",
      ru: "Подписка Pro активна. Счета и способы оплаты управляются в клиентском портале Polar.",
    },
  "Clipboard content is not valid JSON.": {
    uz: "Buferdagi ma'lumot to'g'ri JSON emas.",
    ru: "Содержимое буфера обмена — некорректный JSON.",
  },
  "Settings JSON is missing required fields or has invalid values.": {
    uz: "Sozlamalar JSON'ida majburiy maydonlar yo'q yoki noto'g'ri qiymatlar bor.",
    ru: "В JSON настроек нет обязательных полей или есть неверные значения.",
  },
  "Forest green with a soft mint reply bubble.": {
    uz: "Yalpiz rangli yumshoq javob pufakchasi bilan o'rmon yashili.",
    ru: "Лесной зелёный с мягким мятным пузырём ответа.",
  },
  "Warm amber to rust. High energy, retail and hospitality.": {
    uz: "Iliq qahrabodan zangga. Yuqori energiya, savdo va mehmondo'stlik.",
    ru: "От тёплого янтаря к ржавчине. Энергично — для ритейла и гостеприимства.",
  },
  "Ink on ivory with a serif brand mark. Publishing and legal.": {
    uz: "Fil suyagi rangida siyoh va serifli brend belgisi. Nashriyot va huquq.",
    ru: "Чернила на слоновой кости с антиквенным знаком. Издательства и юристы.",
  },
  "Monospaced and graphite. Developer tools and infrastructure.": {
    uz: "Monoshirinli va grafit. Dasturchi vositalari va infratuzilma.",
    ru: "Моноширинный и графит. Инструменты разработчиков и инфраструктура.",
  },
  "Neutral black on paper. The safest match for most brands.": {
    uz: "Qog'ozda neytral qora. Ko'pchilik brendlar uchun eng xavfsiz tanlov.",
    ru: "Нейтральный чёрный на бумаге. Самый безопасный вариант для большинства брендов.",
  },
  "Deep navy with a cool indigo fade. Reads as enterprise SaaS.": {
    uz: "Sovuq indigo o'tishli to'q ko'k. Korporativ SaaS kabi ko'rinadi.",
    ru: "Тёмно-синий с холодным индиго. Смотрится как корпоративный SaaS.",
  },
  "Violet to fuchsia. Confident and product-led.": {
    uz: "Binafshadan fuksiyaga. Ishonchli va mahsulotga yo'naltirilgan.",
    ru: "От фиолетового к фуксии. Уверенно и продуктово.",
  },
  "Teal and sky. Calm, common in fintech and healthcare.": {
    uz: "Feruza va osmon rangi. Xotirjam, fintech va sog'liqni saqlashda keng tarqalgan.",
    ru: "Бирюзовый и небесный. Спокойно, часто в финтехе и медицине.",
  },
  "Voice launcher label is required": {
    uz: "Ovozli tugma yorlig'i majburiy",
    ru: "Подпись голосовой кнопки обязательна",
  },
  "Voice launcher label must be at most 40 characters": {
    uz: "Ovozli tugma yorlig'i ko'pi bilan 40 belgi bo'lishi kerak",
    ru: "Подпись голосовой кнопки — не больше 40 символов",
  },
  "Launcher prompt text is required": {
    uz: "Tugma yonidagi taklif matni majburiy",
    ru: "Текст приглашения у кнопки обязателен",
  },
  "Launcher prompt text must be at most 80 characters": {
    uz: "Tugma yonidagi taklif matni ko'pi bilan 80 belgi bo'lishi kerak",
    ru: "Текст приглашения у кнопки — не больше 80 символов",
  },
  "A quick reply must be at most 40 characters": {
    uz: "Tezkor javob ko'pi bilan 40 belgi bo'lishi kerak",
    ru: "Быстрый ответ — не больше 40 символов",
  },
  "Please provide a valid image URL": {
    uz: "To'g'ri rasm URL manzilini kiriting",
    ru: "Укажите корректный URL изображения",
  },
  "Greeting is required": {
    uz: "Salomlashuv majburiy",
    ru: "Приветствие обязательно",
  },
  "Greeting must be at most 60 characters": {
    uz: "Salomlashuv ko'pi bilan 60 belgi bo'lishi kerak",
    ru: "Приветствие — не больше 60 символов",
  },
  "Headline is required": {
    uz: "Sarlavha majburiy",
    ru: "Заголовок обязателен",
  },
  "Headline must be at most 90 characters": {
    uz: "Sarlavha ko'pi bilan 90 belgi bo'lishi kerak",
    ru: "Заголовок — не больше 90 символов",
  },
  "Button label is required": {
    uz: "Tugma yorlig'i majburiy",
    ru: "Подпись кнопки обязательна",
  },
  "Button label must be at most 40 characters": {
    uz: "Tugma yorlig'i ko'pi bilan 40 belgi bo'lishi kerak",
    ru: "Подпись кнопки — не больше 40 символов",
  },
  "Placeholder is required": {
    uz: "Placeholder majburiy",
    ru: "Подсказка в поле обязательна",
  },
  "Placeholder must be at most 60 characters": {
    uz: "Placeholder ko'pi bilan 60 belgi bo'lishi kerak",
    ru: "Подсказка в поле — не больше 60 символов",
  },
  "Status label is required": {
    uz: "Holat yorlig'i majburiy",
    ru: "Подпись статуса обязательна",
  },
  "Status label must be at most 40 characters": {
    uz: "Holat yorlig'i ko'pi bilan 40 belgi bo'lishi kerak",
    ru: "Подпись статуса — не больше 40 символов",
  },
  "Button label must be at most 28 characters": {
    uz: "Tugma yorlig'i ko'pi bilan 28 belgi bo'lishi kerak",
    ru: "Подпись кнопки — не больше 28 символов",
  },
  "Brand text must be at most 60 characters": {
    uz: "Brend matni ko'pi bilan 60 belgi bo'lishi kerak",
    ru: "Текст бренда — не больше 60 символов",
  },
  "Agent name is required": {
    uz: "Agent nomi majburiy",
    ru: "Имя агента обязательно",
  },
  "Agent renamed": {
    uz: "Agent nomi o'zgartirildi",
    ru: "Агент переименован",
  },
  "Unable to rename agent": {
    uz: "Agent nomini o'zgartirib bo'lmadi",
    ru: "Не удалось переименовать агента",
  },
  "Loading agents...": {
    uz: "Agentlar yuklanmoqda...",
    ru: "Загрузка агентов...",
  },
  "Select agent": {
    uz: "Agentni tanlang",
    ru: "Выберите агента",
  },
  "Rename agent": {
    uz: "Agent nomini o'zgartirish",
    ru: "Переименовать агента",
  },
  "Create agent": {
    uz: "Agent yaratish",
    ru: "Создать агента",
  },
  "· Upgrade to Pro for up to 5": {
    uz: "· 5 tagacha uchun Pro'ga o'ting",
    ru: "· Перейдите на Pro, чтобы было до 5",
  },
  "Each agent has its own widget settings and embed snippet.": {
    uz: "Har bir agentning o'z vidjet sozlamalari va o'rnatish kodi bor.",
    ru: "У каждого агента свои настройки виджета и код для сайта.",
  },
  Create: {
    uz: "Yaratish",
    ru: "Создать",
  },
  "This name is only used in the dashboard. Visitor-facing names come from theme settings.":
    {
      uz: "Bu nom faqat boshqaruv panelida ishlatiladi. Tashrif buyuruvchilar ko'radigan nomlar mavzu sozlamalaridan olinadi.",
      ru: "Это имя используется только в панели. Имена, которые видят посетители, задаются в настройках темы.",
    },
  "Saving...": {
    uz: "Saqlanmoqda...",
    ru: "Сохранение...",
  },
  "Agent created": {
    uz: "Agent yaratildi",
    ru: "Агент создан",
  },
  "Unable to create agent": {
    uz: "Agent yaratib bo'lmadi",
    ru: "Не удалось создать агента",
  },
  "Overshoots slightly": {
    uz: "Biroz oshib ketadi",
    ru: "Слегка проскакивает",
  },
  Still: {
    uz: "Harakatsiz",
    ru: "Неподвижно",
  },
  "No motion": {
    uz: "Harakat yo'q",
    ru: "Без анимации",
  },
  Pulse: {
    uz: "Pulsatsiya",
    ru: "Пульсация",
  },
  "A soft ring": {
    uz: "Yumshoq halqa",
    ru: "Мягкое кольцо",
  },
  Bounce: {
    uz: "Sakrash",
    ru: "Прыжок",
  },
  "Hops now and then": {
    uz: "Vaqti-vaqti bilan sakraydi",
    ru: "Иногда подпрыгивает",
  },
  Wiggle: {
    uz: "Silkinish",
    ru: "Покачивание",
  },
  "A playful shake": {
    uz: "O'ynoqi silkinish",
    ru: "Игривое покачивание",
  },
  Glow: {
    uz: "Yorqinlik",
    ru: "Свечение",
  },
  "Brightens in a halo": {
    uz: "Atrofida nur yonadi",
    ru: "Загорается ореолом",
  },
  Compact: {
    uz: "Ixcham",
    ru: "Компактный",
  },
  Standard: {
    uz: "Standart",
    ru: "Стандартный",
  },
  Large: {
    uz: "Katta",
    ru: "Большой",
  },
  "Extra large": {
    uz: "Juda katta",
    ru: "Очень большой",
  },
  Default: {
    uz: "Standart",
    ru: "По умолчанию",
  },
  "Clears right rails": {
    uz: "O'ng paneldan qochadi",
    ru: "Не перекрывает правые панели",
  },
  "Once per session": {
    uz: "Har bir sessiyada bir marta",
    ru: "Раз за сессию",
  },
  "Resets on close": {
    uz: "Yopilganda qayta boshlanadi",
    ru: "Сбрасывается при закрытии",
  },
  "Once per visitor": {
    uz: "Har bir tashrif buyuruvchiga bir marta",
    ru: "Раз на посетителя",
  },
  Remembered: {
    uz: "Eslab qolinadi",
    ru: "Запоминается",
  },
  "Every page": {
    uz: "Har bir sahifada",
    ru: "На каждой странице",
  },
  "Most intrusive": {
    uz: "Eng bezovta qiluvchi",
    ru: "Самый навязчивый",
  },
  "The button that sits on your customer's page when the widget is closed.": {
    uz: "Vidjet yopiq bo'lganda mijozingiz sahifasida turadigan tugma.",
    ru: "Кнопка на странице клиента, когда виджет закрыт.",
  },
  Launcher: {
    uz: "Ochish tugmasi",
    ru: "Кнопка запуска",
  },
  "Launcher label": {
    uz: "Tugma yorlig'i",
    ru: "Подпись кнопки",
  },
  "Revealed next to the icon. Hidden when a launcher image is set.": {
    uz: "Belgi yonida ko'rinadi. Tugma rasmi o'rnatilganda yashiriladi.",
    ru: "Показывается рядом со значком. Скрыта, если задано изображение кнопки.",
  },
  "Launcher icon and label": {
    uz: "Tugma belgisi va yorlig'i",
    ru: "Значок и подпись кнопки",
  },
  "Background of the floating button.": {
    uz: "Suzuvchi tugma foni.",
    ru: "Фон плавающей кнопки.",
  },
  "Launcher colour": {
    uz: "Tugma rangi",
    ru: "Цвет кнопки",
  },
  "Replaces the icon entirely — the label is hidden when set.": {
    uz: "Belgini to'liq almashtiradi — o'rnatilganda yorliq yashiriladi.",
    ru: "Полностью заменяет значок — подпись при этом скрыта.",
  },
  "Circular crop · up to 5MB": {
    uz: "Doira shaklida kesish · 5MB gacha",
    ru: "Круглая обрезка · до 5 МБ",
  },
  "Launcher image": {
    uz: "Tugma rasmi",
    ru: "Изображение кнопки",
  },
  "Launcher icon": {
    uz: "Tugma belgisi",
    ru: "Значок кнопки",
  },
  "Used if the launcher image is ever removed.": {
    uz: "Tugma rasmi olib tashlansa ishlatiladi.",
    ru: "Используется, если изображение кнопки удалят.",
  },
  "Drawn inside the floating button.": {
    uz: "Suzuvchi tugma ichida chiziladi.",
    ru: "Рисуется внутри плавающей кнопки.",
  },
  "Attention motion": {
    uz: "E'tibor tortuvchi harakat",
    ru: "Анимация внимания",
  },
  "Plays every few seconds until the visitor opens the widget once, then stops. Visitors who turned off motion in their system settings never see it.":
    {
      uz: "Tashrif buyuruvchi vidjetni bir marta ochmaguncha har bir necha soniyada takrorlanadi, keyin to'xtaydi. Tizimda harakatni o'chirgan tashrif buyuruvchilar uni ko'rmaydi.",
      ru: "Повторяется каждые несколько секунд, пока посетитель не откроет виджет, затем останавливается. Те, кто отключил анимацию в системе, её не видят.",
    },
  "Where the launcher sits on the page and how large it is. Applied by the embed script the moment your settings load.":
    {
      uz: "Tugma sahifada qayerda turishi va qanchalik katta ekanligi. Sozlamalaringiz yuklanishi bilan o'rnatish skripti qo'llaydi.",
      ru: "Где на странице стоит кнопка и какого она размера. Применяется скриптом виджета сразу после загрузки настроек.",
    },
  Placement: {
    uz: "Joylashuv",
    ru: "Расположение",
  },
  "Side offset": {
    uz: "Yon tomondan masofa",
    ru: "Отступ сбоку",
  },
  "Bottom offset": {
    uz: "Pastdan masofa",
    ru: "Отступ снизу",
  },
  "Anything under 44px is below the recommended tap target on touch devices.": {
    uz: "44px dan kichik bo'lsa, sensorli qurilmalarda tavsiya etilgan bosish maydonidan kichik bo'ladi.",
    ru: "Меньше 44px — ниже рекомендуемого размера касания на сенсорных устройствах.",
  },
  "Launcher size": {
    uz: "Tugma o'lchami",
    ru: "Размер кнопки",
  },
  "On the page": {
    uz: "Sahifada",
    ru: "На странице",
  },
  "Raise the bottom offset to clear a cookie banner or a sticky checkout bar.":
    {
      uz: "Cookie bannerini yoki yopishqoq to'lov panelini chetlab o'tish uchun pastdan masofani oshiring.",
      ru: "Увеличьте отступ снизу, чтобы не перекрывать cookie-баннер или закреплённую панель оплаты.",
    },
  "How big the chat opens on your site. On a small screen it shrinks to fit, so phones are never overflowed.":
    {
      uz: "Chat saytingizda qanchalik katta ochiladi. Kichik ekranda moslashib kichrayadi, shuning uchun telefonlarda chiqib ketmaydi.",
      ru: "Какого размера открывается чат на сайте. На маленьких экранах он сжимается, поэтому на телефонах не вылезает за край.",
    },
  "Chat window size": {
    uz: "Chat oynasi o'lchami",
    ru: "Размер окна чата",
  },
  Width: {
    uz: "Kenglik",
    ru: "Ширина",
  },
  "Chat bubble": {
    uz: "Chat pufakchasi",
    ru: "Пузырь чата",
  },
  Height: {
    uz: "Balandlik",
    ru: "Высота",
  },
  "On a laptop screen": {
    uz: "Noutbuk ekranida",
    ru: "На экране ноутбука",
  },
  "Shown on a 1440 × 900 page. A taller window fits more of the conversation; a wider one gives long answers and tables room.":
    {
      uz: "1440 × 900 sahifada ko'rsatilgan. Balandroq oyna suhbatning ko'proq qismini sig'diradi; kengrog'i uzun javoblar va jadvallarga joy beradi.",
      ru: "Показано на странице 1440 × 900. Более высокое окно вмещает больше переписки; более широкое даёт место длинным ответам и таблицам.",
    },
  "A short message that appears above the launcher to invite the first conversation.":
    {
      uz: "Birinchi suhbatga taklif qilish uchun tugma ustida paydo bo'ladigan qisqa xabar.",
      ru: "Короткое сообщение над кнопкой, приглашающее начать первый диалог.",
    },
  "Invitation bubble": {
    uz: "Taklif pufakchasi",
    ru: "Пузырь-приглашение",
  },
  "Shows once per page load and disappears when the visitor dismisses it.": {
    uz: "Har bir sahifa yuklanganda bir marta ko'rinadi va tashrif buyuruvchi yopganda yo'qoladi.",
    ru: "Показывается один раз за загрузку страницы и исчезает, когда посетитель его закроет.",
  },
  "Show an invitation after a delay": {
    uz: "Biroz kutib, taklifni ko'rsatish",
    ru: "Показывать приглашение с задержкой",
  },
  Delay: {
    uz: "Kechikish",
    ru: "Задержка",
  },
  "Quick replies": {
    uz: "Tezkor javoblar",
    ru: "Быстрые ответы",
  },
  "Buttons under the message. Tapping one opens the chat and sends it as the visitor's first message. Leave a slot empty to hide it.":
    {
      uz: "Xabar ostidagi tugmalar. Bosilganda chat ochiladi va u tashrif buyuruvchining birinchi xabari sifatida yuboriladi. Yashirish uchun katakni bo'sh qoldiring.",
      ru: "Кнопки под сообщением. Нажатие открывает чат и отправляет текст как первое сообщение посетителя. Оставьте поле пустым, чтобы скрыть.",
    },
  "Adds a red “1” to the launcher while the invitation is waiting. Unread replies always show their count there, whatever this is set to.":
    {
      uz: "Taklif kutib turganda tugmaga qizil “1” qo'shadi. O'qilmagan javoblar soni bu sozlamadan qat'i nazar doim shu yerda ko'rinadi.",
      ru: "Добавляет красную «1» на кнопку, пока ждёт приглашение. Число непрочитанных ответов показывается всегда, независимо от этой настройки.",
    },
  "Notification badge": {
    uz: "Bildirishnoma belgisi",
    ru: "Значок уведомления",
  },
  "Let the widget open itself so a visitor sees the greeting without clicking.":
    {
      uz: "Tashrif buyuruvchi bosmasdan salomlashuvni ko'rishi uchun vidjet o'zi ochilsin.",
      ru: "Пусть виджет откроется сам, чтобы посетитель увидел приветствие без клика.",
    },
  "Proactive open": {
    uz: "Faol ochilish",
    ru: "Проактивное открытие",
  },
  "The visitor can still close it, and it never reopens within the same page view.":
    {
      uz: "Tashrif buyuruvchi baribir uni yopa oladi va u shu sahifa ko'rishida qayta ochilmaydi.",
      ru: "Посетитель всё равно может закрыть его, и в рамках этого просмотра страницы он больше не откроется.",
    },
  "Open the widget automatically": {
    uz: "Vidjetni avtomatik ochish",
    ru: "Открывать виджет автоматически",
  },
  "Measured from when the page finishes loading.": {
    uz: "Sahifa yuklanishi tugagan paytdan boshlab hisoblanadi.",
    ru: "Отсчитывается с момента полной загрузки страницы.",
  },
  "Delay before opening": {
    uz: "Ochilishdan oldingi kechikish",
    ru: "Задержка перед открытием",
  },
  "Rises into place": {
    uz: "Pastdan ko'tarilib chiqadi",
    ru: "Поднимается на место",
  },
  "How often": {
    uz: "Qanchalik tez-tez",
    ru: "Как часто",
  },
  "Opening on every page is intrusive": {
    uz: "Har bir sahifada ochilish bezovta qiladi",
    ru: "Открытие на каждой странице раздражает",
  },
  "Visitors who dismiss the widget will see it reopen on the next page. Prefer once per session unless you are running a short campaign.":
    {
      uz: "Vidjetni yopgan tashrif buyuruvchilar uni keyingi sahifada qayta ochilgan holda ko'radi. Qisqa aksiya o'tkazmayotgan bo'lsangiz, har bir sessiyada bir martani tanlang.",
      ru: "Посетители, закрывшие виджет, увидят его снова на следующей странице. Выбирайте «раз за сессию», если не проводите короткую акцию.",
    },
  "Motion, sound and the footer line shown under the composer.": {
    uz: "Harakat, ovoz va yozish maydoni ostidagi pastki qator.",
    ru: "Анимация, звук и строка под полем ввода.",
  },
  Behaviour: {
    uz: "Xatti-harakat",
    ru: "Поведение",
  },
  "Open and close motion": {
    uz: "Ochilish va yopilish harakati",
    ru: "Анимация открытия и закрытия",
  },
  "Grows from the launcher": {
    uz: "Tugmadan kattalashib chiqadi",
    ru: "Вырастает из кнопки",
  },
  "Plays a short chime when an operator or the assistant replies while the widget is not focused.":
    {
      uz: "Vidjet faol bo'lmaganda operator yoki yordamchi javob bersa, qisqa signal chaladi.",
      ru: "Проигрывает короткий сигнал, когда оператор или ассистент отвечает, а виджет не в фокусе.",
    },
  "Notification sound": {
    uz: "Bildirishnoma ovozi",
    ru: "Звук уведомления",
  },
  "A single line under the composer.": {
    uz: "Yozish maydoni ostidagi bitta qator.",
    ru: "Одна строка под полем ввода.",
  },
  "Show the footer credit": {
    uz: "Pastki qatordagi muallif yozuvini ko'rsatish",
    ru: "Показывать подпись в подвале",
  },
  "Credit text": {
    uz: "Muallif yozuvi matni",
    ru: "Текст подписи",
  },
  "No movement": {
    uz: "Harakatsiz",
    ru: "Без движения",
  },
  "Renders as": {
    uz: "Ko'rinishi",
    ru: "Выглядит так",
  },
  "Text on this colour": {
    uz: "Shu rangdagi matn",
    ru: "Текст на этом цвете",
  },
  "Sample a colour from the screen": {
    uz: "Ekrandan rang olish",
    ru: "Взять цвет с экрана",
  },
  Fail: {
    uz: "Mos emas",
    ru: "Не проходит",
  },
  "The two lines a visitor reads before they do anything else, shown over your home background.":
    {
      uz: "Tashrif buyuruvchi har qanday harakatdan oldin o'qiydigan ikki qator, bosh sahifa foningiz ustida ko'rsatiladi.",
      ru: "Две строки, которые посетитель читает первыми, — поверх фона главного экрана.",
    },
  "Home screen": {
    uz: "Bosh ekran",
    ru: "Главный экран",
  },
  "The small line above the headline.": {
    uz: "Sarlavha ustidagi kichik qator.",
    ru: "Маленькая строка над заголовком.",
  },
  Greeting: {
    uz: "Salomlashuv",
    ru: "Приветствие",
  },
  "The large headline. Keep it to one short sentence.": {
    uz: "Katta sarlavha. Uni bitta qisqa jumla bilan cheklang.",
    ru: "Крупный заголовок. Ограничьтесь одним коротким предложением.",
  },
  Headline: {
    uz: "Sarlavha",
    ru: "Заголовок",
  },
  "Label on the button that starts a new conversation.": {
    uz: "Yangi suhbatni boshlaydigan tugmadagi yorliq.",
    ru: "Подпись на кнопке, начинающей новый диалог.",
  },
  "Start chat button": {
    uz: "Chatni boshlash tugmasi",
    ru: "Кнопка начала чата",
  },
  "Shown next to the live dot in the chat header.": {
    uz: "Chat sarlavhasidagi jonli nuqta yonida ko'rsatiladi.",
    ru: "Показывается рядом с индикатором онлайна в шапке чата.",
  },
  "Availability label": {
    uz: "Mavjudlik yorlig'i",
    ru: "Подпись доступности",
  },
  "What the assistant opens with, and the chips offered before the visitor types.":
    {
      uz: "Yordamchi nima bilan boshlaydi va tashrif buyuruvchi yozishidan oldin taklif qilinadigan tugmachalar.",
      ru: "С чего начинает ассистент и какие подсказки предлагаются до того, как посетитель начнёт писать.",
    },
  "Conversation opener": {
    uz: "Suhbat boshlanishi",
    ru: "Начало диалога",
  },
  "Greeting message": {
    uz: "Salomlashuv xabari",
    ru: "Приветственное сообщение",
  },
  "The first message in every new conversation.": {
    uz: "Har bir yangi suhbatdagi birinchi xabar.",
    ru: "Первое сообщение в каждом новом диалоге.",
  },
  "Suggested first messages": {
    uz: "Taklif qilinadigan birinchi xabarlar",
    ru: "Предлагаемые первые сообщения",
  },
  "Up to three chips shown under the greeting. Leave one empty to hide it.": {
    uz: "Salomlashuv ostida ko'rsatiladigan uchtagacha tugmacha. Yashirish uchun birini bo'sh qoldiring.",
    ru: "До трёх подсказок под приветствием. Оставьте поле пустым, чтобы скрыть.",
  },
  "Interface strings the visitor sees while typing.": {
    uz: "Tashrif buyuruvchi yozayotganda ko'radigan interfeys matnlari.",
    ru: "Тексты интерфейса, которые посетитель видит при наборе.",
  },
  Composer: {
    uz: "Yozish maydoni",
    ru: "Поле ввода",
  },
  "Placeholder inside the message box.": {
    uz: "Xabar maydoni ichidagi yordamchi matn.",
    ru: "Подсказка внутри поля сообщения.",
  },
  "Input placeholder": {
    uz: "Kiritish maydonidagi yordamchi matn",
    ru: "Подсказка в поле ввода",
  },
  "No brand mark": {
    uz: "Brend belgisi yo'q",
    ru: "Без знака бренда",
  },
  Wordmark: {
    uz: "Matnli logotip",
    ru: "Словесный знак",
  },
  Logo: {
    uz: "Logotip",
    ru: "Логотип",
  },
  Right: {
    uz: "O'ngda",
    ru: "Справа",
  },
  Left: {
    uz: "Chapda",
    ru: "Слева",
  },
  Hidden: {
    uz: "Yashirin",
    ru: "Скрыто",
  },
  "Live voice on": {
    uz: "Jonli ovoz yoqilgan",
    ru: "Живой голос включён",
  },
  "Widget settings copied to clipboard": {
    uz: "Vidjet sozlamalari buferga nusxalandi",
    ru: "Настройки виджета скопированы в буфер",
  },
  "Failed to copy widget settings": {
    uz: "Vidjet sozlamalarini nusxalab bo'lmadi",
    ru: "Не удалось скопировать настройки виджета",
  },
  "Settings imported as draft": {
    uz: "Sozlamalar qoralama sifatida import qilindi",
    ru: "Настройки импортированы как черновик",
  },
  "Some images were uploaded to another environment. Re-upload logos and backgrounds if they do not appear.":
    {
      uz: "Ba'zi rasmlar boshqa muhitga yuklangan. Agar ko'rinmasa, logotip va fonlarni qayta yuklang.",
      ru: "Некоторые изображения загружены в другое окружение. Перезагрузите логотипы и фоны, если они не отображаются.",
    },
  Autosaved: {
    uz: "Avtomatik saqlandi",
    ru: "Автосохранено",
  },
  "The model that answers, and how much of your context it carries into every reply.":
    {
      uz: "Javob beradigan model va u har bir javobga kontekstingizning qancha qismini olib boradi.",
      ru: "Модель, которая отвечает, и сколько вашего контекста она учитывает в каждом ответе.",
    },
  Reasoning: {
    uz: "Fikrlash",
    ru: "Рассуждение",
  },
  "Chat response model": {
    uz: "Chat javob modeli",
    ru: "Модель ответов в чате",
  },
  "Used for widget chat replies with your saved OpenAI key. Live voice models are set in the Voice section.":
    {
      uz: "Saqlangan OpenAI kalitingiz bilan vidjet chat javoblari uchun ishlatiladi. Jonli ovoz modellari Ovoz bo'limida sozlanadi.",
      ru: "Используется для ответов виджета с вашим сохранённым ключом OpenAI. Модели живого голоса задаются в разделе «Голос».",
    },
  "System prompt": {
    uz: "Tizim ko'rsatmasi",
    ru: "Системный промпт",
  },
  "Sent with every customer conversation. Keep it specific about tone, escalation and what the assistant must never do.":
    {
      uz: "Har bir mijoz suhbati bilan yuboriladi. Ohang, uzatish va yordamchi hech qachon qilmasligi kerak bo'lgan narsalar haqida aniq yozing.",
      ru: "Отправляется с каждым диалогом. Конкретно опишите тон, передачу оператору и то, чего ассистент делать не должен.",
    },
  "Actions the assistant can take mid-conversation. Definitions live in Assistant tools.":
    {
      uz: "Yordamchi suhbat davomida bajara oladigan harakatlar. Ta'riflari Yordamchi vositalari bo'limida.",
      ru: "Действия, которые ассистент может выполнять в диалоге. Описания — в «Инструментах ассистента».",
    },
  "Saved with the draft and applied when you publish.": {
    uz: "Qoralama bilan saqlanadi va e'lon qilganingizda qo'llanadi.",
    ru: "Сохраняется с черновиком и применяется при публикации.",
  },
  "What a visitor can do with their own conversation history.": {
    uz: "Tashrif buyuruvchi o'z suhbatlar tarixi bilan nima qila oladi.",
    ru: "Что посетитель может делать со своей историей диалогов.",
  },
  "Adds a download button to the chat header so visitors can save the transcript.":
    {
      uz: "Tashrif buyuruvchilar yozishmani saqlab olishi uchun chat sarlavhasiga yuklab olish tugmasini qo'shadi.",
      ru: "Добавляет в шапку чата кнопку скачивания, чтобы посетители могли сохранить переписку.",
    },
  "Allow transcript download": {
    uz: "Yozishmani yuklab olishga ruxsat berish",
    ru: "Разрешить скачивание переписки",
  },
  "Whether visitors can send you screenshots and photos, and what the widget accepts when they do. Operators can always attach images to a reply.":
    {
      uz: "Tashrif buyuruvchilar sizga skrinshot va rasm yubora oladimi va bunda vidjet nimani qabul qiladi. Operatorlar javobga doim rasm biriktira oladi.",
      ru: "Могут ли посетители присылать скриншоты и фото и что виджет при этом принимает. Операторы всегда могут прикреплять изображения к ответу.",
    },
  "Image attachments": {
    uz: "Rasm biriktirish",
    ru: "Вложения-изображения",
  },
  "Adds an attach button to the widget composer. Visitors can also paste or drag an image straight into the chat.":
    {
      uz: "Vidjet yozish maydoniga biriktirish tugmasini qo'shadi. Tashrif buyuruvchilar rasmni chatga to'g'ridan-to'g'ri qo'yishi yoki sudrab tashlashi ham mumkin.",
      ru: "Добавляет кнопку вложения в поле ввода. Посетители также могут вставить или перетащить изображение прямо в чат.",
    },
  "Let visitors attach images": {
    uz: "Tashrif buyuruvchilarga rasm biriktirishga ruxsat berish",
    ru: "Разрешить посетителям прикреплять изображения",
  },
  "Checked on the server after the upload lands. Images are resized in the browser first, so most photos arrive well under any limit.":
    {
      uz: "Yuklash tugagach serverda tekshiriladi. Rasmlar avval brauzerda kichraytiriladi, shuning uchun ko'pchilik suratlar har qanday cheklovdan ancha kichik keladi.",
      ru: "Проверяется на сервере после загрузки. Изображения сначала уменьшаются в браузере, поэтому большинство фото приходят намного меньше лимита.",
    },
  "Largest image accepted": {
    uz: "Qabul qilinadigan eng katta rasm",
    ru: "Максимальный размер изображения",
  },
  "How many images a visitor can send in one message.": {
    uz: "Tashrif buyuruvchi bitta xabarda nechta rasm yubora oladi.",
    ru: "Сколько изображений посетитель может отправить в одном сообщении.",
  },
  "Images per message": {
    uz: "Bir xabardagi rasmlar soni",
    ru: "Изображений в сообщении",
  },
  "The assistant reads an attached image on the turn it arrives, then answers from the conversation text alone. Turn this off to keep images between the visitor and your operators.":
    {
      uz: "Yordamchi biriktirilgan rasmni u kelgan navbatda o'qiydi, keyin faqat suhbat matni asosida javob beradi. Rasmlar faqat tashrif buyuruvchi va operatorlaringiz o'rtasida qolishi uchun buni o'chiring.",
      ru: "Ассистент читает прикреплённое изображение в момент получения, а дальше отвечает только по тексту диалога. Выключите, чтобы изображения оставались только между посетителем и операторами.",
    },
  "Let the assistant read attached images": {
    uz: "Yordamchiga biriktirilgan rasmlarni o'qishga ruxsat berish",
    ru: "Разрешить ассистенту читать прикреплённые изображения",
  },
  "Written answers the widget can show before anyone starts a conversation.": {
    uz: "Hech kim suhbat boshlamasidan oldin vidjet ko'rsata oladigan yozma javoblar.",
    ru: "Готовые ответы, которые виджет может показать ещё до начала диалога.",
  },
  "Setup guides and first steps for new users.": {
    uz: "Yangi foydalanuvchilar uchun sozlash qo'llanmalari va birinchi qadamlar.",
    ru: "Руководства по настройке и первые шаги для новых пользователей.",
  },
  Availability: {
    uz: "Mavjudlik",
    ru: "Доступность",
  },
  "Hides the Help button, the search entry and the home cards without deleting any topics or articles.":
    {
      uz: "Mavzu va maqolalarni o'chirmasdan Yordam tugmasi, qidiruv va bosh sahifa kartalarini yashiradi.",
      ru: "Скрывает кнопку «Помощь», поиск и карточки на главной, не удаляя темы и статьи.",
    },
  "Show the help centre in the widget": {
    uz: "Vidjetda yordam markazini ko'rsatish",
    ru: "Показывать справочный центр в виджете",
  },
  "Add card": {
    uz: "Karta qo'shish",
    ru: "Добавить карточку",
  },
  "The topics or articles shown on the widget home screen, in order.": {
    uz: "Vidjet bosh ekranida ko'rsatiladigan mavzu yoki maqolalar, tartib bilan.",
    ru: "Темы или статьи на главном экране виджета, по порядку.",
  },
  "No help content yet": {
    uz: "Hali yordam kontenti yo'q",
    ru: "Справочных материалов пока нет",
  },
  "Add a topic below to switch the help centre back on.": {
    uz: "Yordam markazini qayta yoqish uchun quyida mavzu qo'shing.",
    ru: "Добавьте тему ниже, чтобы снова включить справочный центр.",
  },
  "Topics and articles": {
    uz: "Mavzular va maqolalar",
    ru: "Темы и статьи",
  },
  "The widget Help button stays disabled until a topic has at least one article.":
    {
      uz: "Mavzuda kamida bitta maqola bo'lmaguncha vidjetdagi Yordam tugmasi o'chiq turadi.",
      ru: "Кнопка «Помощь» в виджете выключена, пока в теме нет хотя бы одной статьи.",
    },
  "When a live voice provider is enabled, the published widget opens straight into a voice-only assistant.":
    {
      uz: "Jonli ovoz provayderi yoqilganda, e'lon qilingan vidjet to'g'ridan-to'g'ri faqat ovozli yordamchi bilan ochiladi.",
      ru: "Когда включён провайдер живого голоса, опубликованный виджет сразу открывается в режиме голосового ассистента.",
    },
  "Live voice": {
    uz: "Jonli ovoz",
    ru: "Живой голос",
  },
  "Live voice replaces the chat surface": {
    uz: "Jonli ovoz chat oynasining o'rnini egallaydi",
    ru: "Живой голос заменяет окно чата",
  },
  "Visitors are stored as an anonymous voice visitor, the regular chat view is hidden, and final transcript lines are saved under AI voice chats.":
    {
      uz: "Tashrif buyuruvchilar anonim ovozli tashrif buyuruvchi sifatida saqlanadi, oddiy chat ko'rinishi yashiriladi va yakuniy yozuv qatorlari AI ovozli suhbatlar bo'limida saqlanadi.",
      ru: "Посетители сохраняются как анонимные голосовые, обычный чат скрыт, а итоговые строки расшифровки сохраняются в «Голосовых чатах AI».",
    },
  "Voice launcher text": {
    uz: "Ovozli tugma matni",
    ru: "Текст голосовой кнопки",
  },
  "Shown beside the animated voice orb when live voice opens the widget directly.":
    {
      uz: "Jonli ovoz vidjetni to'g'ridan-to'g'ri ochganda, animatsiyali ovoz shari yonida ko'rsatiladi.",
      ru: "Показывается рядом с анимированной голосовой сферой, когда живой голос открывает виджет напрямую.",
    },
  "All changes saved": {
    uz: "Barcha o'zgarishlar saqlandi",
    ru: "Все изменения сохранены",
  },
  "Publish to push this draft to your customers": {
    uz: "Bu qoralamani mijozlaringizga yetkazish uchun e'lon qiling",
    ru: "Опубликуйте, чтобы этот черновик увидели клиенты",
  },
  "Live and draft are identical": {
    uz: "Jonli versiya va qoralama bir xil",
    ru: "Опубликованная версия и черновик совпадают",
  },
  "Preview link": {
    uz: "Oldindan ko'rish havolasi",
    ru: "Ссылка на предпросмотр",
  },
  "Save draft": {
    uz: "Qoralamani saqlash",
    ru: "Сохранить черновик",
  },
  "Publishing…": {
    uz: "E'lon qilinmoqda…",
    ru: "Публикация…",
  },
  "Import widget settings": {
    uz: "Vidjet sozlamalarini import qilish",
    ru: "Импорт настроек виджета",
  },
  "Paste settings copied from another org or environment. This replaces the current draft for this organization.":
    {
      uz: "Boshqa tashkilot yoki muhitdan nusxalangan sozlamalarni qo'ying. Bu shu tashkilotning joriy qoralamasini almashtiradi.",
      ru: "Вставьте настройки, скопированные из другой организации или окружения. Это заменит текущий черновик этой организации.",
    },
  'Paste exported JSON here, e.g. {"type":"osonflow-widget-settings",...}': {
    uz: 'Eksport qilingan JSON\'ni shu yerga qo\'ying, masalan, {"type":"osonflow-widget-settings",...}',
    ru: 'Вставьте сюда экспортированный JSON, например {"type":"osonflow-widget-settings",...}',
  },
  "Importing…": {
    uz: "Import qilinmoqda…",
    ru: "Импорт…",
  },
  "Import draft": {
    uz: "Qoralamani import qilish",
    ru: "Импортировать черновик",
  },
  "Legacy multimodal GPT-4o model": {
    uz: "Eski multimodal GPT-4o modeli",
    ru: "Устаревшая мультимодальная модель GPT-4o",
  },
  "Not available": {
    uz: "Mavjud emas",
    ru: "Недоступно",
  },
  Bold: {
    uz: "Qalin",
    ru: "Жирный",
  },
  Italic: {
    uz: "Kursiv",
    ru: "Курсив",
  },
  Link: {
    uz: "Havola",
    ru: "Ссылка",
  },
  "Paste a link": {
    uz: "Havolani qo'ying",
    ru: "Вставьте ссылку",
  },
  Article: {
    uz: "Maqola",
    ru: "Статья",
  },
  "The model that answers, the instructions it follows, and the tools it may call.":
    {
      uz: "Javob beradigan model, u amal qiladigan ko'rsatmalar va u chaqira oladigan vositalar.",
      ru: "Модель, которая отвечает, её инструкции и инструменты, которые она может вызывать.",
    },
  "Every visitor-facing string, from the home headline to the composer placeholder.":
    {
      uz: "Tashrif buyuruvchi ko'radigan barcha matnlar — bosh sahifa sarlavhasidan yozish maydoni yordamchi matnigacha.",
      ru: "Все тексты для посетителей — от заголовка главной до подсказки в поле ввода.",
    },
  "Brand kit": {
    uz: "Brend to'plami",
    ru: "Фирменный стиль",
  },
  "Colour, typeface, logo and the marks a visitor recognises as yours.": {
    uz: "Rang, shrift, logotip va tashrif buyuruvchi sizniki deb taniydigan belgilar.",
    ru: "Цвет, шрифт, логотип и знаки, по которым посетитель узнаёт вас.",
  },
  "The floating button: where it sits, how large it is, and when it opens itself.":
    {
      uz: "Suzuvchi tugma: qayerda turadi, qanchalik katta va qachon o'zi ochiladi.",
      ru: "Плавающая кнопка: где стоит, какого размера и когда открывается сама.",
    },
  "Help centre": {
    uz: "Yordam markazi",
    ru: "Справочный центр",
  },
  "Topics and articles the widget can answer from before starting a conversation.":
    {
      uz: "Suhbat boshlanmasdan oldin vidjet javob bera oladigan mavzu va maqolalar.",
      ru: "Темы и статьи, по которым виджет может отвечать до начала диалога.",
    },
  "Live voice providers, the voice launcher and call handling.": {
    uz: "Jonli ovoz provayderlari, ovozli tugma va qo'ng'iroqlarni boshqarish.",
    ru: "Провайдеры живого голоса, голосовая кнопка и обработка звонков.",
  },
  "Image set": {
    uz: "Rasm o'rnatilgan",
    ru: "Изображение задано",
  },
  Replace: {
    uz: "Almashtirish",
    ru: "Заменить",
  },
  Upload: {
    uz: "Yuklash",
    ru: "Загрузить",
  },
  "PNG, JPG or WebP · up to 5MB": {
    uz: "PNG, JPG yoki WebP · 5MB gacha",
    ru: "PNG, JPG или WebP · до 5 МБ",
  },
  "Unable to upload this image": {
    uz: "Bu rasmni yuklab bo'lmadi",
    ru: "Не удалось загрузить изображение",
  },
  "Please select an image file.": {
    uz: "Iltimos, rasm faylini tanlang.",
    ru: "Пожалуйста, выберите файл изображения.",
  },
  "Could not upload the selected image.": {
    uz: "Tanlangan rasmni yuklab bo'lmadi.",
    ru: "Не удалось загрузить выбранное изображение.",
  },
  "Add the organization's OpenAI key in Integrations first, then choose the realtime model and voice used here.":
    {
      uz: "Avval Integratsiyalar bo'limida tashkilotning OpenAI kalitini qo'shing, so'ng bu yerda ishlatiladigan realtime model va ovozni tanlang.",
      ru: "Сначала добавьте ключ OpenAI организации в «Интеграциях», затем выберите здесь realtime-модель и голос.",
    },
  "Opens the widget directly into live voice and hides the regular chat and contact form.":
    {
      uz: "Vidjetni to'g'ridan-to'g'ri jonli ovoz bilan ochadi, oddiy chat va aloqa formasini yashiradi.",
      ru: "Открывает виджет сразу в живом голосе и скрывает обычный чат и контактную форму.",
    },
  "Documented OpenAI Realtime aliases and dated snapshots.": {
    uz: "Hujjatlashtirilgan OpenAI Realtime nomlari va sanali versiyalari.",
    ru: "Документированные алиасы OpenAI Realtime и датированные версии.",
  },
  "The assistant's spoken voice.": {
    uz: "Yordamchining ovozi.",
    ru: "Голос ассистента.",
  },
  "Add the organization's Gemini key in Integrations first, then choose the live model and voice used here.":
    {
      uz: "Avval Integratsiyalar bo'limida tashkilotning Gemini kalitini qo'shing, so'ng bu yerda ishlatiladigan live model va ovozni tanlang.",
      ru: "Сначала добавьте ключ Gemini организации в «Интеграциях», затем выберите здесь live-модель и голос.",
    },
  "Current documented Gemini Live model options.": {
    uz: "Hujjatlashtirilgan joriy Gemini Live modellari.",
    ru: "Текущие документированные модели Gemini Live.",
  },
  "Names follow Gemini's prebuilt voice list.": {
    uz: "Nomlar Gemini'ning tayyor ovozlar ro'yxatiga mos.",
    ru: "Названия соответствуют списку готовых голосов Gemini.",
  },
  "Every publish is versioned. Roll back to any earlier version, or move this widget's settings to another organization.":
    {
      uz: "Har bir e'lon versiyalanadi. Istalgan oldingi versiyaga qayting yoki bu vidjet sozlamalarini boshqa tashkilotga ko'chiring.",
      ru: "Каждая публикация сохраняется как версия. Откатитесь к любой прежней или перенесите настройки виджета в другую организацию.",
    },
  "Live version": {
    uz: "Jonli versiya",
    ru: "Опубликованная версия",
  },
  "Autosaved as you edit": {
    uz: "Tahrirlash davomida avtomatik saqlanadi",
    ru: "Сохраняется автоматически при редактировании",
  },
  "Roll back": {
    uz: "Orqaga qaytarish",
    ru: "Откатить",
  },
  "Republishes an earlier version as a new one, so the history stays intact.": {
    uz: "Oldingi versiyani yangi versiya sifatida qayta e'lon qiladi, shuning uchun tarix saqlanib qoladi.",
    ru: "Публикует прежнюю версию как новую, поэтому история сохраняется.",
  },
  "Select a version": {
    uz: "Versiyani tanlang",
    ru: "Выберите версию",
  },
  "Rolling back…": {
    uz: "Orqaga qaytarilmoqda…",
    ru: "Откат…",
  },
  Transfer: {
    uz: "Ko'chirish",
    ru: "Перенос",
  },
  "Copy these settings and paste them into another organization or environment. Knowledge base, workflows and API keys move through":
    {
      uz: "Bu sozlamalarni nusxalab, boshqa tashkilot yoki muhitga qo'ying. Bilim bazasi, workflowlar va API kalitlar quyidagi orqali ko'chiriladi:",
      ru: "Скопируйте эти настройки и вставьте в другую организацию или окружение. База знаний, workflow и API-ключи переносятся через",
    },
  "Copy settings": {
    uz: "Sozlamalarni nusxalash",
    ru: "Копировать настройки",
  },
  "Import settings": {
    uz: "Sozlamalarni import qilish",
    ru: "Импортировать настройки",
  },
  History: {
    uz: "Tarix",
    ru: "История",
  },
  "Nothing published yet.": {
    uz: "Hali hech narsa e'lon qilinmagan.",
    ru: "Ещё ничего не опубликовано.",
  },
  "Rolled back": {
    uz: "Orqaga qaytarildi",
    ru: "Откачено",
  },
  "Initial version": {
    uz: "Dastlabki versiya",
    ru: "Первая версия",
  },
  Releases: {
    uz: "Relizlar",
    ru: "Релизы",
  },
  "Real questions your customers asked, answered again with your draft. Nothing is sent to anyone, and bookings or other actions don't really run.":
    {
      uz: "Mijozlaringiz bergan haqiqiy savollarga qoralamangiz bilan qayta javob beriladi. Hech kimga hech narsa yuborilmaydi, bron va boshqa harakatlar haqiqatan bajarilmaydi.",
      ru: "Реальные вопросы ваших клиентов, на которые заново отвечает черновик. Никому ничего не отправляется, а бронирования и другие действия на самом деле не выполняются.",
    },
  "The check didn't finish. Try running it again.": {
    uz: "Tekshiruv tugamadi. Qayta ishga tushirib ko'ring.",
    ru: "Проверка не завершилась. Запустите её ещё раз.",
  },
  "Contrast against WCAG AA": {
    uz: "WCAG AA bo'yicha kontrast",
    ru: "Контраст по WCAG AA",
  },
  "All passing": {
    uz: "Hammasi o'tdi",
    ru: "Всё проходит",
  },
  "A starting point for colour, radius and typeface. Applying one never touches your copy, help content or launcher behaviour.":
    {
      uz: "Rang, burchak radiusi va shrift uchun boshlang'ich nuqta. Uni qo'llash matnlaringiz, yordam kontenti yoki tugma xatti-harakatiga tegmaydi.",
      ru: "Отправная точка для цвета, скругления и шрифта. Применение не затрагивает тексты, справку и поведение кнопки.",
    },
  Presets: {
    uz: "Tayyor uslublar",
    ru: "Пресеты",
  },
  "How the assistant introduces itself and the typeface every widget surface inherits.":
    {
      uz: "Yordamchi o'zini qanday tanishtiradi va vidjetning barcha qismlari ishlatadigan shrift.",
      ru: "Как ассистент представляется и шрифт, который наследуют все части виджета.",
    },
  "Shown in the chat header and used as the fallback wordmark.": {
    uz: "Chat sarlavhasida ko'rsatiladi va zaxira matnli logotip sifatida ishlatiladi.",
    ru: "Показывается в шапке чата и используется как запасной словесный знак.",
  },
  "Square works best — shown in the chat header.": {
    uz: "Kvadrat eng yaxshi — chat sarlavhasida ko'rsatiladi.",
    ru: "Лучше квадратный — показывается в шапке чата.",
  },
  Typeface: {
    uz: "Shrift",
    ru: "Шрифт",
  },
  "Applied to every widget screen — home, chat, help centre and voice.": {
    uz: "Vidjetning barcha ekranlariga qo'llanadi — bosh sahifa, chat, yordam markazi va ovoz.",
    ru: "Применяется ко всем экранам виджета — главная, чат, справка и голос.",
  },
  "The mark that sits at the top of the widget home screen, over your background.":
    {
      uz: "Vidjet bosh ekranining yuqorisida, foningiz ustida turadigan belgi.",
      ru: "Знак вверху главного экрана виджета, поверх фона.",
    },
  "Home brand mark": {
    uz: "Bosh sahifa brend belgisi",
    ru: "Знак бренда на главной",
  },
  "Falls back to your logo when empty.": {
    uz: "Bo'sh bo'lsa, logotipingiz ishlatiladi.",
    ru: "Если пусто, используется логотип.",
  },
  "A wide lockup reads better here than a square icon": {
    uz: "Bu yerda kvadrat belgidan ko'ra keng logotip yaxshiroq ko'rinadi",
    ru: "Здесь широкий логотип смотрится лучше квадратного значка",
  },
  "Brand image": {
    uz: "Brend rasmi",
    ru: "Изображение бренда",
  },
  "Leave empty to use the assistant name.": {
    uz: "Yordamchi nomidan foydalanish uchun bo'sh qoldiring.",
    ru: "Оставьте пустым, чтобы использовать имя ассистента.",
  },
  "Wordmark typeface": {
    uz: "Matnli logotip shrifti",
    ru: "Шрифт словесного знака",
  },
  Brand: {
    uz: "Brend",
    ru: "Бренд",
  },
  "Wordmark container": {
    uz: "Matnli logotip konteyneri",
    ru: "Подложка словесного знака",
  },
  "Colour of the wordmark itself.": {
    uz: "Matnli logotipning o'z rangi.",
    ru: "Цвет самого словесного знака.",
  },
  "Wordmark colour": {
    uz: "Matnli logotip rangi",
    ru: "Цвет словесного знака",
  },
  "Tint behind the wordmark for the pill and gradient containers.": {
    uz: "Pill va gradient konteynerlar uchun matnli logotip ortidagi tus.",
    ru: "Оттенок под словесным знаком для подложек «капсула» и «градиент».",
  },
  "Container accent": {
    uz: "Konteyner urg'usi",
    ru: "Акцент подложки",
  },
  "Image behind the welcome and help cards on the widget home screen.": {
    uz: "Vidjet bosh ekranidagi xush kelibsiz va yordam kartalari ortidagi rasm.",
    ru: "Изображение за приветственной и справочными карточками на главном экране виджета.",
  },
  "A dark overlay is applied so white text stays readable.": {
    uz: "Oq matn o'qiladigan bo'lib qolishi uchun to'q qatlam qo'llanadi.",
    ru: "Накладывается тёмный слой, чтобы белый текст оставался читаемым.",
  },
  "Wide image, up to 5MB · falls back to the header gradient": {
    uz: "Keng rasm, 5MB gacha · bo'lmasa sarlavha gradienti ishlatiladi",
    ru: "Широкое изображение до 5 МБ · иначе используется градиент шапки",
  },
  "Background image": {
    uz: "Fon rasmi",
    ru: "Фоновое изображение",
  },
  "Surfaces the visitor actually sees. Contrast is checked live against WCAG AA.":
    {
      uz: "Tashrif buyuruvchi haqiqatan ko'radigan yuzalar. Kontrast WCAG AA bo'yicha jonli tekshiriladi.",
      ru: "Поверхности, которые реально видит посетитель. Контраст проверяется по WCAG AA в реальном времени.",
    },
  Colours: {
    uz: "Ranglar",
    ru: "Цвета",
  },
  "Button text": {
    uz: "Tugma matni",
    ru: "Текст кнопки",
  },
  "Send button, links and primary actions.": {
    uz: "Yuborish tugmasi, havolalar va asosiy harakatlar.",
    ru: "Кнопка отправки, ссылки и основные действия.",
  },
  "White header text": {
    uz: "Oq sarlavha matni",
    ru: "Белый текст шапки",
  },
  "Top of the home hero and chat header.": {
    uz: "Bosh sahifa bannerining va chat sarlavhasining yuqori qismi.",
    ru: "Верх баннера главной и шапки чата.",
  },
  "Header gradient start": {
    uz: "Sarlavha gradienti boshi",
    ru: "Начало градиента шапки",
  },
  "Bottom of the gradient.": {
    uz: "Gradientning pastki qismi.",
    ru: "Низ градиента.",
  },
  "Header gradient end": {
    uz: "Sarlavha gradienti oxiri",
    ru: "Конец градиента шапки",
  },
  "Gradient preview": {
    uz: "Gradientni oldindan ko'rish",
    ru: "Предпросмотр градиента",
  },
  "Set both stops to the same value for a flat header.": {
    uz: "Tekis sarlavha uchun ikkala nuqtani bir xil qiymatga qo'ying.",
    ru: "Задайте обеим точкам одинаковое значение для однотонной шапки.",
  },
  "Show an image": {
    uz: "Rasm ko'rsatish",
    ru: "Показать изображение",
  },
  "Visitor message text": {
    uz: "Tashrif buyuruvchi xabari matni",
    ru: "Текст сообщений посетителя",
  },
  "Messages sent by the visitor.": {
    uz: "Tashrif buyuruvchi yuborgan xabarlar.",
    ru: "Сообщения, отправленные посетителем.",
  },
  "Visitor bubble": {
    uz: "Tashrif buyuruvchi pufakchasi",
    ru: "Пузырь посетителя",
  },
  "Show brand text": {
    uz: "Brend matnini ko'rsatish",
    ru: "Показать текст бренда",
  },
  "Assistant message text": {
    uz: "Yordamchi xabari matni",
    ru: "Текст сообщений ассистента",
  },
  "Messages sent by the assistant.": {
    uz: "Yordamchi yuborgan xabarlar.",
    ru: "Сообщения, отправленные ассистентом.",
  },
  "Assistant bubble": {
    uz: "Yordamchi pufakchasi",
    ru: "Пузырь ассистента",
  },
  "Hide the mark": {
    uz: "Belgini yashirish",
    ru: "Скрыть знак",
  },
  "Applied to the widget frame, message bubbles and cards.": {
    uz: "Vidjet ramkasi, xabar pufakchalari va kartalarga qo'llanadi.",
    ru: "Применяется к рамке виджета, пузырям сообщений и карточкам.",
  },
  "Corner radius": {
    uz: "Burchak radiusi",
    ru: "Скругление углов",
  },
  Radius: {
    uz: "Radius",
    ru: "Радиус",
  },
  "Every visitor-facing colour pair, measured. Anything under 4.5:1 is hard to read at body size.":
    {
      uz: "Tashrif buyuruvchi ko'radigan har bir rang juftligi o'lchangan. 4.5:1 dan pasti oddiy matn o'lchamida qiyin o'qiladi.",
      ru: "Измерена каждая цветовая пара для посетителей. Всё ниже 4.5:1 трудно читать обычным размером текста.",
    },
  Accessibility: {
    uz: "Qulaylik",
    ru: "Доступность",
  },
  "Header text over gradient start": {
    uz: "Gradient boshi ustidagi sarlavha matni",
    ru: "Текст шапки на начале градиента",
  },
  "Primary button label": {
    uz: "Asosiy tugma yorlig'i",
    ru: "Подпись основной кнопки",
  },
  Plain: {
    uz: "Oddiy",
    ru: "Простой",
  },
  "No container": {
    uz: "Konteynersiz",
    ru: "Без подложки",
  },
  Pill: {
    uz: "Kapsula",
    ru: "Капсула",
  },
  "Tinted capsule": {
    uz: "Tusli kapsula",
    ru: "Тонированная капсула",
  },
  Gradient: {
    uz: "Gradient",
    ru: "Градиент",
  },
  "Accent fade": {
    uz: "Urg'uli o'tish",
    ru: "Акцентный переход",
  },
  Sans: {
    uz: "Sans",
    ru: "Без засечек",
  },
  Serif: {
    uz: "Serif",
    ru: "С засечками",
  },
  Rounded: {
    uz: "Yumaloq",
    ru: "Скруглённый",
  },
  Mono: {
    uz: "Mono",
    ru: "Моноширинный",
  },
  Display: {
    uz: "Display",
    ru: "Акцидентный",
  },
  "End the call if nobody speaks for this long.": {
    uz: "Shuncha vaqt hech kim gapirmasa, qo'ng'iroqni tugatish.",
    ru: "Завершать звонок, если никто не говорит столько времени.",
  },
  "Maximum call length": {
    uz: "Qo'ng'iroqning eng uzun davomiyligi",
    ru: "Максимальная длительность звонка",
  },
  "Select max duration": {
    uz: "Eng uzun davomiylikni tanlang",
    ru: "Выберите максимальную длительность",
  },
  "Hard cap that ends the call even if the visitor is still active.": {
    uz: "Tashrif buyuruvchi hali faol bo'lsa ham qo'ng'iroqni tugatadigan qat'iy chegara.",
    ru: "Жёсткий лимит, который завершает звонок, даже если посетитель ещё активен.",
  },
  "Custom goodbye phrases": {
    uz: "Maxsus xayrlashuv iboralari",
    ru: "Свои фразы прощания",
  },
  "Optional. One phrase per line, checked in addition to the built-in goodbye patterns.":
    {
      uz: "Ixtiyoriy. Har bir qatorda bitta ibora, ichki xayrlashuv iboralariga qo'shimcha ravishda tekshiriladi.",
      ru: "Необязательно. По одной фразе в строке, проверяются вдобавок к встроенным шаблонам прощания.",
    },
  "30 seconds": {
    uz: "30 soniya",
    ru: "30 секунд",
  },
  "1 minute": {
    uz: "1 daqiqa",
    ru: "1 минута",
  },
  "2 minutes": {
    uz: "2 daqiqa",
    ru: "2 минуты",
  },
  "5 minutes": {
    uz: "5 daqiqa",
    ru: "5 минут",
  },
  "10 minutes": {
    uz: "10 daqiqa",
    ru: "10 минут",
  },
  "15 minutes": {
    uz: "15 daqiqa",
    ru: "15 минут",
  },
  "When a live voice call ends on its own, so an idle browser tab never holds a session open.":
    {
      uz: "Jonli ovozli qo'ng'iroq o'z-o'zidan qachon tugaydi — shunda brauzerning faol bo'lmagan varag'i sessiyani ochiq ushlab turmaydi.",
      ru: "Когда живой звонок завершается сам, чтобы неактивная вкладка браузера не держала сессию открытой.",
    },
  "Call limits": {
    uz: "Qo'ng'iroq cheklovlari",
    ru: "Лимиты звонков",
  },
  'Ends the call when the visitor signals they are done, including phrases like "thanks" or "no more questions".':
    {
      uz: 'Tashrif buyuruvchi tugatganini bildirganda, jumladan "rahmat" yoki "boshqa savolim yo\'q" kabi iboralar bilan, qo\'ng\'iroqni tugatadi.',
      ru: "Завершает звонок, когда посетитель даёт понять, что закончил, включая фразы вроде «спасибо» или «больше вопросов нет».",
    },
  "End when the visitor says goodbye": {
    uz: "Tashrif buyuruvchi xayrlashganda tugatish",
    ru: "Завершать, когда посетитель прощается",
  },
  "Idle timeout": {
    uz: "Harakatsizlik vaqti",
    ru: "Тайм-аут бездействия",
  },
  "Select idle timeout": {
    uz: "Harakatsizlik vaqtini tanlang",
    ru: "Выберите тайм-аут бездействия",
  },
  "Can you walk me through this?": {
    uz: "Buni menga bosqichma-bosqich tushuntira olasizmi?",
    ru: "Можете объяснить мне по шагам?",
  },
  "Of course — here is how it works, step by step.": {
    uz: "Albatta — mana qanday ishlashi, qadamma-qadam.",
    ru: "Конечно — вот как это работает, шаг за шагом.",
  },
  "Voice only": {
    uz: "Faqat ovoz",
    ru: "Только голос",
  },
  "Preview on a light page": {
    uz: "Yorug' sahifada oldindan ko'rish",
    ru: "Предпросмотр на светлой странице",
  },
  "Preview on a dark page": {
    uz: "Qorong'i sahifada oldindan ko'rish",
    ru: "Предпросмотр на тёмной странице",
  },
  "Light host page": {
    uz: "Yorug' sahifa",
    ru: "Светлая страница",
  },
  "Dark host page": {
    uz: "Qorong'i sahifa",
    ru: "Тёмная страница",
  },
  "Auto-open": {
    uz: "Avto-ochilish",
    ru: "Автооткрытие",
  },
  "Select all": {
    uz: "Hammasini tanlash",
    ru: "Выбрать все",
  },
  "No tools selected — the assistant will answer from the system prompt alone.":
    {
      uz: "Vositalar tanlanmagan — yordamchi faqat tizim ko'rsatmasi asosida javob beradi.",
      ru: "Инструменты не выбраны — ассистент будет отвечать только по системному промпту.",
    },
  "Loading assistant tools...": {
    uz: "Yordamchi vositalari yuklanmoqda...",
    ru: "Загрузка инструментов ассистента...",
  },
  "No chat-enabled tools yet": {
    uz: "Hali chatda yoqilgan vositalar yo'q",
    ru: "Пока нет инструментов, включённых для чата",
  },
  "Install and enable a tool in": {
    uz: "Vositani quyidagi bo'limda o'rnating va yoqing:",
    ru: "Установите и включите инструмент в разделе",
  },
  ", then choose which ones this widget may call.": {
    uz: ", so'ng bu vidjet qaysilarini chaqira olishini tanlang.",
    ru: ", затем выберите, какие из них может вызывать этот виджет.",
  },
  "Open preview": {
    uz: "Oldindan ko'rishni ochish",
    ru: "Открыть предпросмотр",
  },
  Versions: {
    uz: "Versiyalar",
    ru: "Версии",
  },
  "Anonymous voice visitor": {
    uz: "Anonim ovozli tashrif buyuruvchi",
    ru: "Анонимный голосовой посетитель",
  },
  "Anonymous voice session": {
    uz: "Anonim ovozli sessiya",
    ru: "Анонимная голосовая сессия",
  },
  "Call downloaded": {
    uz: "Qo'ng'iroq yuklab olindi",
    ru: "Звонок скачан",
  },
  "Could not download the call": {
    uz: "Qo'ng'iroqni yuklab bo'lmadi",
    ru: "Не удалось скачать звонок",
  },
  "Call deleted": {
    uz: "Qo'ng'iroq o'chirildi",
    ru: "Звонок удалён",
  },
  "Could not delete the call": {
    uz: "Qo'ng'iroqni o'chirib bo'lmadi",
    ru: "Не удалось удалить звонок",
  },
  "Downloading...": {
    uz: "Yuklab olinmoqda...",
    ru: "Скачивание...",
  },
  Download: {
    uz: "Yuklab olish",
    ru: "Скачать",
  },
  "Delete from database": {
    uz: "Ma'lumotlar bazasidan o'chirish",
    ru: "Удалить из базы данных",
  },
  "Delete this call?": {
    uz: "Bu qo'ng'iroq o'chirilsinmi?",
    ru: "Удалить этот звонок?",
  },
  'This removes "': {
    uz: "Bu “",
    ru: "Это удалит «",
  },
  "this call": {
    uz: "bu qo'ng'iroq",
    ru: "этот звонок",
  },
  '" and its transcript from the database. This action cannot be undone.': {
    uz: "” va uning yozuvini ma'lumotlar bazasidan o'chiradi. Buni ortga qaytarib bo'lmaydi.",
    ru: "» и его расшифровку из базы данных. Это действие нельзя отменить.",
  },
  "Instagram profile": {
    uz: "Instagram profili",
    ru: "Профиль Instagram",
  },
  "Failed to refresh Instagram profile": {
    uz: "Instagram profilini yangilab bo'lmadi",
    ru: "Не удалось обновить профиль Instagram",
  },
  "Profile name": {
    uz: "Profil nomi",
    ru: "Имя профиля",
  },
  "Instagram ID": {
    uz: "Instagram ID",
    ru: "Instagram ID",
  },
  Followers: {
    uz: "Obunachilar",
    ru: "Подписчики",
  },
  "WhatsApp phone": {
    uz: "WhatsApp telefoni",
    ru: "Телефон WhatsApp",
  },
  "Phone number ID": {
    uz: "Telefon raqami ID",
    ru: "ID номера телефона",
  },
  "Open in Telegram": {
    uz: "Telegram'da ochish",
    ru: "Открыть в Telegram",
  },
  Unknown: {
    uz: "Noma'lum",
    ru: "Неизвестно",
  },
  Workflow: {
    uz: "Workflow",
    ru: "Workflow",
  },
  "Conversation downloaded": {
    uz: "Suhbat yuklab olindi",
    ru: "Диалог скачан",
  },
  "Failed to download conversation": {
    uz: "Suhbatni yuklab bo'lmadi",
    ru: "Не удалось скачать диалог",
  },
  "Conversation deleted": {
    uz: "Suhbat o'chirildi",
    ru: "Диалог удалён",
  },
  "Failed to delete conversation": {
    uz: "Suhbatni o'chirib bo'lmadi",
    ru: "Не удалось удалить диалог",
  },
  "No conversations yet": {
    uz: "Hali suhbatlar yo'q",
    ru: "Диалогов пока нет",
  },
  "Customer messages from your widget will appear here.": {
    uz: "Vidjetingizdan kelgan mijoz xabarlari shu yerda paydo bo'ladi.",
    ru: "Здесь появятся сообщения клиентов из вашего виджета.",
  },
  "No conversations match this view": {
    uz: "Bu ko'rinishga mos suhbatlar yo'q",
    ru: "Нет диалогов для этого представления",
  },
  "Reset the filters to see every conversation.": {
    uz: "Barcha suhbatlarni ko'rish uchun filtrlarni tozalang.",
    ru: "Сбросьте фильтры, чтобы увидеть все диалоги.",
  },
  Me: {
    uz: "Men",
    ru: "Я",
  },
  Assigned: {
    uz: "Tayinlangan",
    ru: "Назначенные",
  },
  "Delete conversation?": {
    uz: "Suhbat o'chirilsinmi?",
    ru: "Удалить диалог?",
  },
  "this conversation": {
    uz: "bu suhbat",
    ru: "этот диалог",
  },
  '" from the database. This action cannot be undone.': {
    uz: "” ni ma'lumotlar bazasidan o'chiradi. Buni ortga qaytarib bo'lmaydi.",
    ru: "» из базы данных. Это действие нельзя отменить.",
  },
  "Dark mode": {
    uz: "Qorong'i rejim",
    ru: "Тёмная тема",
  },
  "Light mode": {
    uz: "Yorug' rejim",
    ru: "Светлая тема",
  },
  Theme: {
    uz: "Mavzu",
    ru: "Тема",
  },
  "Loading analytics": {
    uz: "Analitika yuklanmoqda",
    ru: "Загрузка аналитики",
  },
  "Loading customer memory": {
    uz: "Mijoz xotirasi yuklanmoqda",
    ru: "Загрузка памяти о клиентах",
  },
  "Loading leads": {
    uz: "Lidlar yuklanmoqda",
    ru: "Загрузка лидов",
  },
  "Loading knowledge base": {
    uz: "Bilim bazasi yuklanmoqda",
    ru: "Загрузка базы знаний",
  },
  "Loading data transfer": {
    uz: "Ma'lumotlar ko'chirish yuklanmoqda",
    ru: "Загрузка переноса данных",
  },
  Areas: {
    uz: "Bo'limlar",
    ru: "Разделы",
  },
  "Back to voice calls": {
    uz: "Ovozli qo'ng'iroqlarga qaytish",
    ru: "Назад к голосовым звонкам",
  },
  "The call is saved. Final transcript lines will appear here as the voice provider returns them.":
    {
      uz: "Qo'ng'iroq saqlandi. Ovoz provayderi qaytarishi bilan yakuniy yozuv qatorlari shu yerda paydo bo'ladi.",
      ru: "Звонок сохранён. Итоговые строки расшифровки появятся здесь, когда их вернёт голосовой провайдер.",
    },
  "No conversations analysed yet": {
    uz: "Hali tahlil qilingan suhbatlar yo'q",
    ru: "Проанализированных диалогов пока нет",
  },
  "Intents are classified automatically once conversations start coming in.": {
    uz: "Suhbatlar kela boshlagach, maqsadlar avtomatik tasniflanadi.",
    ru: "Намерения классифицируются автоматически, как только начнут поступать диалоги.",
  },
  "Nothing went unanswered in this window — the knowledge base covered every question.":
    {
      uz: "Bu davrda javobsiz qolgan savol bo'lmadi — bilim bazasi har bir savolni qamradi.",
      ru: "В этот период не было вопросов без ответа — база знаний покрыла все.",
    },
  "resolved ·": {
    uz: "hal qilindi ·",
    ru: "решено ·",
  },
  No: {
    uz: "Yo'q",
    ru: "Нет",
  },
  "voice calls": {
    uz: "ovozli qo'ng'iroq",
    ru: "голосовых звонков",
  },
  "in this window.": {
    uz: "bu davrda.",
    ru: "за этот период.",
  },
  Happy: {
    uz: "Mamnun",
    ru: "Довольны",
  },
  Neutral: {
    uz: "Neytral",
    ru: "Нейтрально",
  },
  Frustrated: {
    uz: "Norozi",
    ru: "Недовольны",
  },
  "How customers felt": {
    uz: "Mijozlar o'zini qanday his qildi",
    ru: "Как себя чувствовали клиенты",
  },
  "Handed to team": {
    uz: "Jamoaga uzatildi",
    ru: "Передано команде",
  },
  "Summaries appear here after new chat or voice conversations are analysed.": {
    uz: "Yangi chat yoki ovozli suhbatlar tahlil qilingach, xulosalar shu yerda paydo bo'ladi.",
    ru: "Сводки появятся здесь после анализа новых чатов или голосовых диалогов.",
  },
  Summary: {
    uz: "Xulosa",
    ru: "Сводка",
  },
  Metric: {
    uz: "Ko'rsatkich",
    ru: "Показатель",
  },
  Unanswered: {
    uz: "Javobsiz",
    ru: "Без ответа",
  },
  Count: {
    uz: "Soni",
    ru: "Количество",
  },
  Total: {
    uz: "Jami",
    ru: "Всего",
  },
  Sentiment: {
    uz: "Kayfiyat",
    ru: "Настроение",
  },
  Urgency: {
    uz: "Shoshilinchlik",
    ru: "Срочность",
  },
  "Failed to export analytics": {
    uz: "Analitikani eksport qilib bo'lmadi",
    ru: "Не удалось экспортировать аналитику",
  },
  "The jobs customers came to get done, across chat and voice.": {
    uz: "Mijozlar chat va ovoz orqali hal qilish uchun kelgan vazifalar.",
    ru: "Задачи, с которыми клиенты приходили в чат и на звонки.",
  },
  "What customers asked for": {
    uz: "Mijozlar nimani so'radi",
    ru: "Что спрашивали клиенты",
  },
  "How each channel ended — solved by the assistant, taken over by your team, or still open.":
    {
      uz: "Har bir kanal qanday yakunlandi — yordamchi hal qildi, jamoangiz o'z qo'liga oldi yoki hali ochiq.",
      ru: "Чем закончился каждый канал — решил ассистент, подключилась команда или ещё открыто.",
    },
  "Chat and voice": {
    uz: "Chat va ovoz",
    ru: "Чат и голос",
  },
  "What it still needs to learn": {
    uz: "Unga yana nimani o'rganish kerak",
    ru: "Чему ему ещё нужно научиться",
  },
  "The latest conversations, summarised as they were analysed.": {
    uz: "Eng so'nggi suhbatlar, tahlil qilinganidek qisqacha.",
    ru: "Последние диалоги в кратком изложении, по мере анализа.",
  },
  "Recent conversations": {
    uz: "So'nggi suhbatlar",
    ru: "Последние диалоги",
  },
  "Attach an image": {
    uz: "Rasm biriktirish",
    ru: "Прикрепить изображение",
  },
  "Enhancing...": {
    uz: "Yaxshilanmoqda...",
    ru: "Улучшаем...",
  },
  Enhance: {
    uz: "Yaxshilash",
    ru: "Улучшить",
  },
  Title: {
    uz: "Sarlavha",
    ru: "Заголовок",
  },
  "Update reply": {
    uz: "Javobni yangilash",
    ru: "Обновить ответ",
  },
  "Create reply": {
    uz: "Javob yaratish",
    ru: "Создать ответ",
  },
  "Image deleted": {
    uz: "Rasm o'chirildi",
    ru: "Изображение удалено",
  },
  "Failed to delete the image": {
    uz: "Rasmni o'chirib bo'lmadi",
    ru: "Не удалось удалить изображение",
  },
  "Failed to send the message": {
    uz: "Xabarni yuborib bo'lmadi",
    ru: "Не удалось отправить сообщение",
  },
  "Voice upload failed": {
    uz: "Ovozli xabarni yuklab bo'lmadi",
    ru: "Не удалось загрузить голосовое сообщение",
  },
  "Assigned to me": {
    uz: "Menga tayinlangan",
    ru: "Назначено мне",
  },
  "Open contact details": {
    uz: "Kontakt ma'lumotlarini ochish",
    ru: "Открыть данные контакта",
  },
  Unassign: {
    uz: "Tayinlashni bekor qilish",
    ru: "Снять назначение",
  },
  "Beginning of conversation": {
    uz: "Suhbat boshlanishi",
    ru: "Начало диалога",
  },
  "This conversation has been resolved": {
    uz: "Bu suhbat hal qilingan",
    ru: "Этот диалог решён",
  },
  "Type your response as an operator...": {
    uz: "Operator sifatida javobingizni yozing...",
    ru: "Напишите ответ как оператор...",
  },
  Everyone: {
    uz: "Hamma",
    ru: "Все",
  },
  "Back this month": {
    uz: "Shu oy qaytganlar",
    ru: "Вернулись в этом месяце",
  },
  "Mostly resolved": {
    uz: "Ko'pincha hal qilingan",
    ru: "В основном решено",
  },
  "Unknown customer": {
    uz: "Noma'lum mijoz",
    ru: "Неизвестный клиент",
  },
  "· needed team": {
    uz: "· jamoa kerak bo'ldi",
    ru: "· понадобилась команда",
  },
  "What your assistant remembers": {
    uz: "Yordamchingiz nimani eslab qoladi",
    ru: "Что помнит ваш ассистент",
  },
  "Nothing specific captured yet — facts appear as this customer shares them.":
    {
      uz: "Hali aniq hech narsa yozilmagan — mijoz ma'lumot bergani sari faktlar paydo bo'ladi.",
      ru: "Пока ничего конкретного — факты появятся, когда клиент ими поделится.",
    },
  "Usually asks about": {
    uz: "Odatda nima haqida so'raydi",
    ru: "Обычно спрашивает о",
  },
  "No conversations recorded yet.": {
    uz: "Hali suhbatlar yozilmagan.",
    ru: "Диалогов пока нет.",
  },
  "Failed to export customer memory": {
    uz: "Mijoz xotirasini eksport qilib bo'lmadi",
    ru: "Не удалось экспортировать память о клиентах",
  },
  "Exporting…": {
    uz: "Eksport qilinmoqda…",
    ru: "Экспорт…",
  },
  "Export CSV": {
    uz: "CSV eksport qilish",
    ru: "Экспорт в CSV",
  },
  "Search customers": {
    uz: "Mijozlarni qidirish",
    ru: "Поиск клиентов",
  },
  "Search names, emails, or notes": {
    uz: "Ism, email yoki eslatmalardan qidiring",
    ru: "Ищите по имени, email или заметкам",
  },
  "Filter customers": {
    uz: "Mijozlarni filtrlash",
    ru: "Фильтр клиентов",
  },
  "No one matches this filter": {
    uz: "Bu filtrga hech kim mos kelmaydi",
    ru: "Под этот фильтр никто не подходит",
  },
  "and search": {
    uz: "va qidiruv",
    ru: "и поиск",
  },
  ". Try": {
    uz: ". Sinab ko'ring:",
    ru: ". Попробуйте",
  },
  "showing everyone": {
    uz: "hammani ko'rsatish",
    ru: "показать всех",
  },
  "When a customer shares their email in chat or voice, your assistant starts keeping notes — who they are, what they asked, and how it ended — so nobody has to repeat themselves.":
    {
      uz: "Mijoz chat yoki ovozda emailini aytganda, yordamchingiz eslatmalar yurita boshlaydi — u kim, nima so'ragan va qanday yakunlangan — shunda hech kim takrorlashiga to'g'ri kelmaydi.",
      ru: "Когда клиент называет email в чате или по голосу, ассистент начинает вести заметки — кто он, что спрашивал и чем всё закончилось, — чтобы никому не приходилось повторяться.",
    },
  "Which channels bring people in, which sites send them, and what they were reading when they reached out.":
    {
      uz: "Qaysi kanallar odamlarni olib keladi, qaysi saytlar yuboradi va murojaat qilganda nimani o'qiyotgan edi.",
      ru: "Какие каналы приводят людей, какие сайты их присылают и что они читали, когда написали.",
    },
  "Where they come from": {
    uz: "Ular qayerdan keladi",
    ru: "Откуда они приходят",
  },
  "Workflow chat": {
    uz: "Workflow chat",
    ru: "Чат workflow",
  },
  "When a visitor shares their name and email in your chat widget, or messages you on Telegram, WhatsApp or Instagram, they appear here — with where they came from and a one-click way to reach them.":
    {
      uz: "Tashrif buyuruvchi chat vidjetida ismi va emailini qoldirsa yoki sizga Telegram, WhatsApp yoki Instagram'da yozsa, u shu yerda paydo bo'ladi — qayerdan kelgani va bir bosishda bog'lanish imkoni bilan.",
      ru: "Когда посетитель оставляет имя и email в чат-виджете или пишет вам в Telegram, WhatsApp или Instagram, он появляется здесь — с источником и связью в один клик.",
    },
  "Unnamed visitor": {
    uz: "Ismsiz tashrif buyuruvchi",
    ru: "Посетитель без имени",
  },
  "Home page": {
    uz: "Bosh sahifa",
    ru: "Главная страница",
  },
  "in the last 30 days": {
    uz: "so'nggi 30 kunda",
    ru: "за последние 30 дней",
  },
  "No one new yet this month": {
    uz: "Bu oy hali yangi odam yo'q",
    ru: "В этом месяце пока никого нового",
  },
  "With your team": {
    uz: "Jamoangiz bilan",
    ru: "С вашей командой",
  },
  "Talking to your assistant": {
    uz: "Yordamchingiz bilan gaplashmoqda",
    ru: "Общается с ассистентом",
  },
  "· from": {
    uz: "· qayerdan:",
    ru: "· из",
  },
  "Open conversation": {
    uz: "Suhbatni ochish",
    ru: "Открыть диалог",
  },
  "· New this week": {
    uz: "· Shu hafta yangi",
    ru: "· Новый на этой неделе",
  },
  "Waiting for your reply": {
    uz: "Javobingizni kutmoqda",
    ru: "Ждёт вашего ответа",
  },
  "Never chatted": {
    uz: "Hech qachon yozishmagan",
    ru: "Ни разу не писал",
  },
  "Everyone came to your site directly.": {
    uz: "Hamma saytingizga to'g'ridan-to'g'ri kelgan.",
    ru: "Все пришли на сайт напрямую.",
  },
  "Sent by": {
    uz: "Kim yuborgan",
    ru: "Источник",
  },
  "No page information captured yet.": {
    uz: "Hali sahifa ma'lumoti yozilmagan.",
    ru: "Данных о страницах пока нет.",
  },
  "Page they were on": {
    uz: "Qaysi sahifada edi",
    ru: "На какой странице был",
  },
  "No leads to export": {
    uz: "Eksport qilish uchun lidlar yo'q",
    ru: "Нет лидов для экспорта",
  },
  "Failed to export leads": {
    uz: "Lidlarni eksport qilib bo'lmadi",
    ru: "Не удалось экспортировать лидов",
  },
  "Filter leads": {
    uz: "Lidlarni filtrlash",
    ru: "Фильтр лидов",
  },
  "Search leads": {
    uz: "Lidlarni qidirish",
    ru: "Поиск лидов",
  },
  "Search names, emails, pages": {
    uz: "Ism, email yoki sahifalardan qidiring",
    ru: "Ищите по имени, email или страницам",
  },
  "You're all caught up — no one is waiting for a reply.": {
    uz: "Hammasiga javob berdingiz — hech kim javob kutmayapti.",
    ru: "Всё разобрано — никто не ждёт ответа.",
  },
  "No new leads this week yet.": {
    uz: "Bu hafta hali yangi lidlar yo'q.",
    ru: "На этой неделе новых лидов пока нет.",
  },
  Web: {
    uz: "Veb",
    ru: "Веб",
  },
  "Everyone who left their details also started a chat.": {
    uz: "Ma'lumot qoldirgan har bir kishi chat ham boshlagan.",
    ru: "Все, кто оставил данные, также начали чат.",
  },
  "No leads to show.": {
    uz: "Ko'rsatadigan lidlar yo'q.",
    ru: "Нет лидов для показа.",
  },
  "Show everyone": {
    uz: "Hammani ko'rsatish",
    ru: "Показать всех",
  },
  "Give the key a name so you can tell it apart later.": {
    uz: "Keyinchalik ajrata olishingiz uchun kalitga nom bering.",
    ru: "Дайте ключу имя, чтобы потом его различать.",
  },
  "Choose at least one thing this key may do.": {
    uz: "Bu kalit bajara oladigan kamida bitta narsani tanlang.",
    ru: "Выберите хотя бы одно действие, разрешённое ключу.",
  },
  "Key updated": {
    uz: "Kalit yangilandi",
    ru: "Ключ обновлён",
  },
  "The key could not be saved": {
    uz: "Kalitni saqlab bo'lmadi",
    ru: "Не удалось сохранить ключ",
  },
  "Changes apply to the next call made with this key.": {
    uz: "O'zgarishlar shu kalit bilan qilingan keyingi chaqiruvdan boshlab qo'llanadi.",
    ru: "Изменения применятся к следующему вызову с этим ключом.",
  },
  "Give it to the developer or system that needs it. You can change what it may do at any time.":
    {
      uz: "Uni kerakli dasturchi yoki tizimga bering. U nima qila olishini istalgan vaqtda o'zgartirishingiz mumkin.",
      ru: "Передайте его разработчику или системе, которой он нужен. Права можно поменять в любой момент.",
    },
  "e.g. CRM sync, Mobile app": {
    uz: "masalan, CRM sinxronlash, Mobil ilova",
    ru: "например, Синхронизация CRM, Мобильное приложение",
  },
  "Leave a box empty to use your organization's limit. A key can never go above it.":
    {
      uz: "Tashkilotingiz cheklovidan foydalanish uchun katakni bo'sh qoldiring. Kalit hech qachon undan oshib keta olmaydi.",
      ru: "Оставьте поле пустым, чтобы использовать лимит организации. Ключ никогда не может его превысить.",
    },
  "One per line. Leave empty to allow servers only — the safest choice, because a key in a web page can be copied.":
    {
      uz: "Har qatorda bittadan. Faqat serverlarga ruxsat berish uchun bo'sh qoldiring — bu eng xavfsiz tanlov, chunki veb-sahifadagi kalitni nusxalab olish mumkin.",
      ru: "По одному в строке. Оставьте пустым, чтобы разрешить только серверы — это безопаснее всего, ведь ключ на веб-странице можно скопировать.",
    },
  "One per line, addresses or ranges. Leave empty to allow any.": {
    uz: "Har qatorda bittadan, manzil yoki oraliq. Hammasiga ruxsat berish uchun bo'sh qoldiring.",
    ru: "По одному в строке, адреса или диапазоны. Оставьте пустым, чтобы разрешить любые.",
  },
  "Clipboard unavailable — select and copy it instead": {
    uz: "Buferdan foydalanib bo'lmaydi — belgilab, o'zingiz nusxalang",
    ru: "Буфер обмена недоступен — выделите и скопируйте вручную",
  },
  "Clipboard unavailable — select and copy the key instead": {
    uz: "Buferdan foydalanib bo'lmaydi — kalitni belgilab, o'zingiz nusxalang",
    ru: "Буфер обмена недоступен — выделите ключ и скопируйте вручную",
  },
  "This is the only time “": {
    uz: "Faqat hozir “",
    ru: "Только сейчас ключ «",
  },
  "” is shown in full. Store it somewhere safe, such as your server's environment settings. If you lose it, roll the key to get a new one.":
    {
      uz: "” to'liq ko'rsatiladi. Uni xavfsiz joyda, masalan, serveringizning muhit sozlamalarida saqlang. Yo'qotsangiz, yangisini olish uchun kalitni almashtiring.",
      ru: "» показан полностью. Сохраните его в надёжном месте, например в переменных окружения сервера. Если потеряете — перевыпустите ключ.",
    },
  "I've stored it": {
    uz: "Saqlab qo'ydim",
    ru: "Я сохранил",
  },
  "Own limits": {
    uz: "O'z cheklovlari",
    ru: "Свои лимиты",
  },
  Revoked: {
    uz: "Bekor qilingan",
    ru: "Отозван",
  },
  Expired: {
    uz: "Muddati o'tgan",
    ru: "Истёк",
  },
  Created: {
    uz: "Yaratilgan",
    ru: "Создан",
  },
  "· Last used": {
    uz: "· Oxirgi foydalanish",
    ru: "· Последнее использование",
  },
  "Remove this key from the list?": {
    uz: "Bu kalit ro'yxatdan olib tashlansinmi?",
    ru: "Убрать этот ключ из списка?",
  },
  "calls in the last 30 days": {
    uz: "so'nggi 30 kundagi chaqiruvlar",
    ru: "вызовов за последние 30 дней",
  },
  "used AI ·": {
    uz: "AI ishlatdi ·",
    ru: "с AI ·",
  },
  "failed ·": {
    uz: "xato ·",
    ru: "с ошибкой ·",
  },
  "hit a limit": {
    uz: "cheklovga yetdi",
    ru: "упёрлись в лимит",
  },
  "Today (UTC)": {
    uz: "Bugun (UTC)",
    ru: "Сегодня (UTC)",
  },
  "Limits saved": {
    uz: "Cheklovlar saqlandi",
    ru: "Лимиты сохранены",
  },
  "The limits could not be saved": {
    uz: "Cheklovlarni saqlab bo'lmadi",
    ru: "Не удалось сохранить лимиты",
  },
  "Back to the default": {
    uz: "Standartga qaytarildi",
    ru: "Возвращено к значению по умолчанию",
  },
  "The limit could not be reset": {
    uz: "Cheklovni tiklab bo'lmadi",
    ru: "Не удалось сбросить лимит",
  },
  ", up to": {
    uz: ", ko'pi bilan",
    ru: ", не больше",
  },
  "Applies to calls made from now on. Daily totals are kept for 90 days.": {
    uz: "Hozirdan boshlab qilinadigan chaqiruvlarga qo'llanadi. Kunlik jami 90 kun saqlanadi.",
    ru: "Применяется к вызовам с этого момента. Дневные итоги хранятся 90 дней.",
  },
  "Filter calls": {
    uz: "Chaqiruvlarni filtrlash",
    ru: "Фильтр вызовов",
  },
  "Loading calls…": {
    uz: "Chaqiruvlar yuklanmoqda…",
    ru: "Загрузка вызовов…",
  },
  "No failed calls. Everything your keys asked for went through.": {
    uz: "Muvaffaqiyatsiz chaqiruvlar yo'q. Kalitlaringiz so'ragan hamma narsa bajarildi.",
    ru: "Неудачных вызовов нет. Всё, что запрашивали ключи, прошло.",
  },
  "Removed key": {
    uz: "Olib tashlangan kalit",
    ru: "Удалённый ключ",
  },
  "API access is on": {
    uz: "API ruxsati yoqilgan",
    ru: "Доступ к API включён",
  },
  "API access is off — every key is paused": {
    uz: "API ruxsati o'chirilgan — barcha kalitlar to'xtatilgan",
    ru: "Доступ к API выключен — все ключи приостановлены",
  },
  "The setting could not be saved": {
    uz: "Sozlamani saqlab bo'lmadi",
    ru: "Не удалось сохранить настройку",
  },
  "Key revoked": {
    uz: "Kalit bekor qilindi",
    ru: "Ключ отозван",
  },
  "Key removed": {
    uz: "Kalit olib tashlandi",
    ru: "Ключ удалён",
  },
  "That didn't work — try again": {
    uz: "Bo'lmadi — qayta urinib ko'ring",
    ru: "Не получилось — попробуйте ещё раз",
  },
  "The developer API is switched off on this Osonflow installation.": {
    uz: "Bu Osonflow o'rnatmasida dasturchilar API'si o'chirilgan.",
    ru: "API для разработчиков отключён в этой установке Osonflow.",
  },
  "The developer API is part of paid plans. Keys work once your organization has an active plan.":
    {
      uz: "Dasturchilar API'si pullik tariflarga kiradi. Tashkilotingizda faol tarif bo'lgach, kalitlar ishlaydi.",
      ru: "API для разработчиков входит в платные тарифы. Ключи заработают, когда у организации будет активный тариф.",
    },
  "Every call from every key over the last 30 days. Days run midnight to midnight UTC, the same days the daily limits use.":
    {
      uz: "So'nggi 30 kundagi har bir kalitdan har bir chaqiruv. Kunlar UTC bo'yicha yarim tundan yarim tungacha — kunlik cheklovlar ishlatadigan kunlar bilan bir xil.",
      ru: "Все вызовы со всех ключей за последние 30 дней. Сутки считаются от полуночи до полуночи по UTC — так же, как для дневных лимитов.",
    },
  "Loading usage…": {
    uz: "Foydalanish yuklanmoqda…",
    ru: "Загрузка статистики…",
  },
  "Off. Every key is refused until you turn it back on; their settings are kept.":
    {
      uz: "O'chirilgan. Qayta yoqmaguningizcha har bir kalit rad etiladi; ularning sozlamalari saqlanadi.",
      ru: "Выключено. Все ключи отклоняются, пока вы снова не включите; их настройки сохраняются.",
    },
  "Create one for each system that connects — a separate key per app makes it easy to see who is calling and to switch one off without affecting the others.":
    {
      uz: "Ulanadigan har bir tizim uchun alohida yarating — har bir ilova uchun alohida kalit kim chaqirayotganini ko'rishni va boshqalariga ta'sir qilmasdan bittasini o'chirishni osonlashtiradi.",
      ru: "Создайте по ключу для каждой подключаемой системы — так видно, кто вызывает, и можно отключить один, не затрагивая остальные.",
    },
  "How much the API may do across all keys. Lower limits protect your AI budget; a single key can be given tighter limits of its own.":
    {
      uz: "API barcha kalitlar bo'yicha qancha ish qila oladi. Pastroq cheklovlar AI byudjetingizni himoya qiladi; bitta kalitga o'zining qattiqroq cheklovlarini berish mumkin.",
      ru: "Сколько может делать API по всем ключам. Низкие лимиты защищают ваш AI-бюджет; отдельному ключу можно задать более строгие лимиты.",
    },
  "Delete source": {
    uz: "Manbani o'chirish",
    ru: "Удалить источник",
  },
  "Something went wrong. Please try again.": {
    uz: "Nimadir noto'g'ri ketdi. Iltimos, qayta urinib ko'ring.",
    ru: "Что-то пошло не так. Попробуйте ещё раз.",
  },
  "Scraping…": {
    uz: "Sayt o'qilmoqda…",
    ru: "Читаем сайт…",
  },
  "Uploading…": {
    uz: "Yuklanmoqda…",
    ru: "Загрузка…",
  },
  "Scrape & Save": {
    uz: "O'qish va saqlash",
    ru: "Прочитать и сохранить",
  },
  "Your assistant can answer from this source.": {
    uz: "Yordamchingiz shu manba asosida javob bera oladi.",
    ru: "Ассистент может отвечать по этому источнику.",
  },
  "Still being read — it will be usable in a moment.": {
    uz: "Hali o'qilmoqda — birozdan keyin foydalanish mumkin bo'ladi.",
    ru: "Ещё читается — скоро будет доступно.",
  },
  "This source couldn't be read. Delete it and add it again.": {
    uz: "Bu manbani o'qib bo'lmadi. Uni o'chirib, qayta qo'shing.",
    ru: "Не удалось прочитать источник. Удалите его и добавьте снова.",
  },
  "Well supported by your sources": {
    uz: "Manbalaringiz bilan yaxshi qo'llab-quvvatlangan",
    ru: "Хорошо подкреплено вашими источниками",
  },
  "Partly supported by your sources": {
    uz: "Manbalaringiz bilan qisman qo'llab-quvvatlangan",
    ru: "Частично подкреплено вашими источниками",
  },
  "Barely supported — consider adding a source": {
    uz: "Deyarli qo'llab-quvvatlanmagan — manba qo'shishni o'ylab ko'ring",
    ru: "Почти не подкреплено — стоит добавить источник",
  },
  "Not in your sources yet": {
    uz: "Hali manbalaringizda yo'q",
    ru: "Пока нет в ваших источниках",
  },
  "Ask your knowledge base a customer question": {
    uz: "Bilim bazangizga mijoz savolini bering",
    ru: "Задайте базе знаний вопрос клиента",
  },
  "Add a source first, then ask it a question": {
    uz: "Avval manba qo'shing, so'ng savol bering",
    ru: "Сначала добавьте источник, затем задайте вопрос",
  },
  "Ask a question a customer would ask": {
    uz: "Mijoz beradigan savolni yozing",
    ru: "Задайте вопрос, который задал бы клиент",
  },
  Ask: {
    uz: "So'rash",
    ru: "Спросить",
  },
  "Why:": {
    uz: "Sababi:",
    ru: "Почему:",
  },
  "Drawn from": {
    uz: "Manba",
    ru: "Источник",
  },
  "No source matched this question.": {
    uz: "Bu savolga hech bir manba mos kelmadi.",
    ru: "Ни один источник не подошёл к этому вопросу.",
  },
  View: {
    uz: "Ko'rish",
    ru: "Открыть",
  },
  "Point it at your site and review what it writes.": {
    uz: "Uni saytingizga yo'naltiring va u yozganini ko'rib chiqing.",
    ru: "Укажите ваш сайт и проверьте, что он напишет.",
  },
  "AI answer cache is already empty.": {
    uz: "AI javoblar keshi allaqachon bo'sh.",
    ru: "Кеш AI-ответов уже пуст.",
  },
  "Document Viewer": {
    uz: "Hujjatni ko'rish",
    ru: "Просмотр документа",
  },
  Sources: {
    uz: "Manbalar",
    ru: "Источники",
  },
  "Saved answers": {
    uz: "Saqlangan javoblar",
    ru: "Сохранённые ответы",
  },
  "Every document and web page your assistant searches before it replies. Open one to see exactly what it read.":
    {
      uz: "Yordamchingiz javob berishdan oldin qidiradigan har bir hujjat va veb-sahifa. U aynan nimani o'qiganini ko'rish uchun birini oching.",
      ru: "Все документы и веб-страницы, которые ассистент просматривает перед ответом. Откройте любой, чтобы увидеть, что именно он прочитал.",
    },
  "Filter by category": {
    uz: "Toifa bo'yicha filtrlash",
    ru: "Фильтр по категории",
  },
  "Search sources": {
    uz: "Manbalardan qidirish",
    ru: "Поиск источников",
  },
  "Nothing matches": {
    uz: "Hech narsa topilmadi",
    ru: "Ничего не найдено",
  },
  "Show all sources": {
    uz: "Barcha manbalarni ko'rsatish",
    ru: "Показать все источники",
  },
  "Other sources": {
    uz: "Boshqa manbalar",
    ru: "Другие источники",
  },
  "See the answer your assistant would give, and which sources it used. Nothing is sent to customers.":
    {
      uz: "Yordamchingiz qanday javob berishini va qaysi manbalardan foydalanganini ko'ring. Mijozlarga hech narsa yuborilmaydi.",
      ru: "Посмотрите, как ответит ассистент и какие источники использует. Клиентам ничего не отправляется.",
    },
  "When customers ask something already answered, your assistant reuses that answer — faster, and cheaper. Saved answers clear themselves whenever your sources change.":
    {
      uz: "Mijozlar allaqachon javob berilgan narsani so'rasa, yordamchingiz o'sha javobni qayta ishlatadi — tezroq va arzonroq. Manbalaringiz o'zgarganda saqlangan javoblar o'zi tozalanadi.",
      ru: "Когда клиенты спрашивают то, на что уже был ответ, ассистент использует его повторно — быстрее и дешевле. Сохранённые ответы очищаются сами при изменении источников.",
    },
  "No saved answers yet. They build up as customers ask similar questions.": {
    uz: "Hali saqlangan javoblar yo'q. Mijozlar o'xshash savollar bergani sari ular to'planadi.",
    ru: "Сохранённых ответов пока нет. Они накапливаются, когда клиенты задают похожие вопросы.",
  },
  "Instagram and WhatsApp only allow a message within 24 hours of the customer's last one, so follow-ups there always go out within a day. On the website, the customer sees it the next time they open the chat.":
    {
      uz: "Instagram va WhatsApp mijozning oxirgi xabaridan keyin faqat 24 soat ichida xabar yuborishga ruxsat beradi, shuning uchun u yerda eslatmalar doim bir kun ichida yuboriladi. Saytda mijoz uni keyingi safar chatni ochganda ko'radi.",
      ru: "Instagram и WhatsApp разрешают писать только в течение 24 часов после последнего сообщения клиента, поэтому там напоминания всегда уходят в течение суток. На сайте клиент увидит его, когда снова откроет чат.",
    },
  "It goes out right away and can't be taken back once delivered.": {
    uz: "U darhol yuboriladi va yetkazilgach, qaytarib olib bo'lmaydi.",
    ru: "Отправляется сразу, и после доставки его нельзя отозвать.",
  },
  "is stored securely for your organization only, and is never included in widget settings.":
    {
      uz: "faqat tashkilotingiz uchun xavfsiz saqlanadi va hech qachon vidjet sozlamalariga kiritilmaydi.",
      ru: "надёжно хранится только для вашей организации и никогда не попадает в настройки виджета.",
    },
  "OpenAI logo": {
    uz: "OpenAI logotipi",
    ru: "Логотип OpenAI",
  },
  "Custom OpenAI key saved": {
    uz: "Shaxsiy OpenAI kaliti saqlandi",
    ru: "Собственный ключ OpenAI сохранён",
  },
  "OpenAI API key saved": {
    uz: "OpenAI API kaliti saqlandi",
    ru: "API-ключ OpenAI сохранён",
  },
  "OpenAI API key removed": {
    uz: "OpenAI API kaliti olib tashlandi",
    ru: "API-ключ OpenAI удалён",
  },
  "Google Gemini logo": {
    uz: "Google Gemini logotipi",
    ru: "Логотип Google Gemini",
  },
  "Custom Gemini key saved": {
    uz: "Shaxsiy Gemini kaliti saqlandi",
    ru: "Собственный ключ Gemini сохранён",
  },
  "Gemini API key saved": {
    uz: "Gemini API kaliti saqlandi",
    ru: "API-ключ Gemini сохранён",
  },
  "Gemini API key removed": {
    uz: "Gemini API kaliti olib tashlandi",
    ru: "API-ключ Gemini удалён",
  },
  "Using Osonflow's key": {
    uz: "Osonflow kaliti ishlatilmoqda",
    ru: "Используется ключ Osonflow",
  },
  "Paste a new key to replace it": {
    uz: "Almashtirish uchun yangi kalitni qo'ying",
    ru: "Вставьте новый ключ для замены",
  },
  "Connecting Instagram": {
    uz: "Instagram ulanmoqda",
    ru: "Подключение Instagram",
  },
  "Failed to connect Instagram account": {
    uz: "Instagram hisobini ulab bo'lmadi",
    ru: "Не удалось подключить аккаунт Instagram",
  },
  "Instagram authorization was cancelled": {
    uz: "Instagram avtorizatsiyasi bekor qilindi",
    ru: "Авторизация Instagram отменена",
  },
  "Missing Instagram authorization response": {
    uz: "Instagram avtorizatsiya javobi yo'q",
    ru: "Нет ответа авторизации Instagram",
  },
  "Instagram account connected": {
    uz: "Instagram hisobi ulandi",
    ru: "Аккаунт Instagram подключён",
  },
  "Instagram account saved. Add a webhook base URL to receive DMs.": {
    uz: "Instagram hisobi saqlandi. Shaxsiy xabarlarni olish uchun webhook asosiy URL manzilini qo'shing.",
    ru: "Аккаунт Instagram сохранён. Добавьте базовый URL вебхука, чтобы получать личные сообщения.",
  },
  "Webhook destination disabled": {
    uz: "Webhook manzili o'chirildi",
    ru: "Адрес вебхука отключён",
  },
  "Webhook destination enabled": {
    uz: "Webhook manzili yoqildi",
    ru: "Адрес вебхука включён",
  },
  "Connection error": {
    uz: "Ulanish xatosi",
    ru: "Ошибка подключения",
  },
  "Finish webhook setup": {
    uz: "Webhook sozlashni yakunlang",
    ru: "Завершите настройку вебхука",
  },
  "Check webhook address": {
    uz: "Webhook manzilini tekshiring",
    ru: "Проверьте адрес вебхука",
  },
  "Add the code to your site once": {
    uz: "Kodni saytingizga bir marta qo'shing",
    ru: "Добавьте код на сайт один раз",
  },
  "Using Osonflow's keys": {
    uz: "Osonflow kalitlari ishlatilmoqda",
    ru: "Используются ключи Osonflow",
  },
  "None set up": {
    uz: "Hech biri sozlanmagan",
    ru: "Ничего не настроено",
  },
  "Last delivery failed": {
    uz: "Oxirgi yetkazish muvaffaqiyatsiz",
    ru: "Последняя доставка не удалась",
  },
  "Where is your website built?": {
    uz: "Saytingiz nimada qurilgan?",
    ru: "На чём сделан ваш сайт?",
  },
  "Website platform": {
    uz: "Sayt platformasi",
    ru: "Платформа сайта",
  },
  "Any website": {
    uz: "Har qanday sayt",
    ru: "Любой сайт",
  },
  "Not sure? Choose this — it works with plain HTML and most site builders.": {
    uz: "Ishonchingiz komil emasmi? Buni tanlang — u oddiy HTML va ko'pchilik sayt konstruktorlari bilan ishlaydi.",
    ru: "Не уверены? Выберите это — работает с обычным HTML и большинством конструкторов сайтов.",
  },
  "Copy your code": {
    uz: "Kodingizni nusxalang",
    ru: "Скопируйте код",
  },
  "Copy code": {
    uz: "Kodni nusxalash",
    ru: "Копировать код",
  },
  "The script address under Advanced options isn't a valid web address, so the code can't be copied yet.":
    {
      uz: "Kengaytirilgan sozlamalardagi skript manzili to'g'ri veb-manzil emas, shuning uchun kodni hali nusxalab bo'lmaydi.",
      ru: "Адрес скрипта в дополнительных настройках — некорректный веб-адрес, поэтому код пока нельзя скопировать.",
    },
  "Paste it on your site and publish": {
    uz: "Uni saytingizga qo'ying va e'lon qiling",
    ru: "Вставьте его на сайт и опубликуйте",
  },
  "Then open your site — the chat button appears in the": {
    uz: "So'ng saytingizni oching — chat tugmasi quyidagi joyda paydo bo'ladi:",
    ru: "Затем откройте сайт — кнопка чата появится",
  },
  "bottom right": {
    uz: "pastki o'ng burchak",
    ru: "в правом нижнем углу",
  },
  "Advanced options": {
    uz: "Kengaytirilgan sozlamalar",
    ru: "Дополнительные настройки",
  },
  "Select assistant": {
    uz: "Yordamchini tanlang",
    ru: "Выберите ассистента",
  },
  "The code loads this assistant's published settings.": {
    uz: "Kod shu yordamchining e'lon qilingan sozlamalarini yuklaydi.",
    ru: "Код загружает опубликованные настройки этого ассистента.",
  },
  "Chat button position": {
    uz: "Chat tugmasi joylashuvi",
    ru: "Расположение кнопки чата",
  },
  "Script address": {
    uz: "Skript manzili",
    ru: "Адрес скрипта",
  },
  "Only change this if Osonflow support asked you to.": {
    uz: "Buni faqat Osonflow qo'llab-quvvatlash xizmati so'ragan bo'lsa o'zgartiring.",
    ru: "Меняйте, только если об этом попросила поддержка Osonflow.",
  },
  "Organization ID": {
    uz: "Tashkilot ID",
    ru: "ID организации",
  },
  "Customers messaging your bot will no longer reach your inbox or your assistant. Past conversations stay in Osonflow.":
    {
      uz: "Botingizga yozgan mijozlar endi Inbox'ingizga ham, yordamchingizga ham yetib bormaydi. Oldingi suhbatlar Osonflow'da qoladi.",
      ru: "Сообщения клиентов боту больше не будут попадать во входящие и к ассистенту. Прошлые диалоги останутся в Osonflow.",
    },
  "your Telegram bot": {
    uz: "Telegram botingiz",
    ru: "ваш Telegram-бот",
  },
  "Customers who message your Telegram bot are answered by your assistant, and the conversations land in your inbox.":
    {
      uz: "Telegram botingizga yozgan mijozlarga yordamchingiz javob beradi va suhbatlar Inbox'ingizga tushadi.",
      ru: "Клиентам, которые пишут вашему Telegram-боту, отвечает ассистент, а диалоги попадают во входящие.",
    },
  "Create a bot with BotFather": {
    uz: "BotFather orqali bot yarating",
    ru: "Создайте бота через BotFather",
  },
  "Open BotFather in Telegram, send": {
    uz: "Telegram'da BotFather'ni oching, yuboring:",
    ru: "Откройте BotFather в Telegram, отправьте",
  },
  "and follow its questions — it takes a minute.": {
    uz: "va uning savollariga javob bering — bir daqiqa oladi.",
    ru: "и ответьте на его вопросы — это займёт минуту.",
  },
  "Open BotFather": {
    uz: "BotFather'ni ochish",
    ru: "Открыть BotFather",
  },
  "Paste the token BotFather sends you": {
    uz: "BotFather yuborgan tokenni qo'ying",
    ru: "Вставьте токен, который прислал BotFather",
  },
  "Connecting…": {
    uz: "Ulanmoqda…",
    ru: "Подключение…",
  },
  Connect: {
    uz: "Ulash",
    ru: "Подключить",
  },
  "It looks like": {
    uz: "U shunday ko'rinadi:",
    ru: "Он выглядит так:",
  },
  "Keep it private — anyone with it controls your bot.": {
    uz: "Uni sir saqlang — u bor har kim botingizni boshqaradi.",
    ru: "Держите его в секрете — у кого он есть, тот управляет ботом.",
  },
  "Say hello to your bot": {
    uz: "Botingizga salom yozing",
    ru: "Поздоровайтесь с ботом",
  },
  "Open your bot, tap Start and send a message. It appears in your inbox within seconds.":
    {
      uz: "Botingizni oching, Start tugmasini bosing va xabar yuboring. U bir necha soniyada Inbox'ingizda paydo bo'ladi.",
      ru: "Откройте бота, нажмите Start и отправьте сообщение. Оно появится во входящих за пару секунд.",
    },
  Bot: {
    uz: "Bot",
    ru: "Бот",
  },
  "Last message": {
    uz: "Oxirgi xabar",
    ru: "Последнее сообщение",
  },
  "None yet": {
    uz: "Hali yo'q",
    ru: "Пока нет",
  },
  "Open @": {
    uz: "Ochish: @",
    ru: "Открыть @",
  },
  "Send it a text message to test. Only text messages are handled for now.": {
    uz: "Sinash uchun unga matnli xabar yuboring. Hozircha faqat matnli xabarlar qayta ishlanadi.",
    ru: "Отправьте ему текстовое сообщение для проверки. Пока обрабатываются только текстовые сообщения.",
  },
  "Refresh connection": {
    uz: "Ulanishni yangilash",
    ru: "Обновить подключение",
  },
  "Instagram DMs will stop reaching your inbox and your assistant. Past conversations stay in Osonflow.":
    {
      uz: "Instagram shaxsiy xabarlari endi Inbox'ingizga ham, yordamchingizga ham yetib bormaydi. Oldingi suhbatlar Osonflow'da qoladi.",
      ru: "Личные сообщения Instagram больше не будут попадать во входящие и к ассистенту. Прошлые диалоги останутся в Osonflow.",
    },
  "Direct messages to your Instagram professional account are answered by your assistant and collected in your inbox.":
    {
      uz: "Instagram professional hisobingizga kelgan shaxsiy xabarlarga yordamchingiz javob beradi va ular Inbox'ingizda to'planadi.",
      ru: "На личные сообщения в профессиональный аккаунт Instagram отвечает ассистент, и они собираются во входящих.",
    },
  "Sign in with Instagram": {
    uz: "Instagram orqali kirish",
    ru: "Войти через Instagram",
  },
  "You'll be asked to allow Osonflow to:": {
    uz: "Sizdan Osonflow'ga quyidagilarga ruxsat berish so'raladi:",
    ru: "Вас попросят разрешить Osonflow:",
  },
  "Read and reply to direct messages": {
    uz: "Shaxsiy xabarlarni o'qish va ularga javob berish",
    ru: "Читать личные сообщения и отвечать на них",
  },
  "Read and reply to comments on your posts": {
    uz: "Postlaringizdagi izohlarni o'qish va ularga javob berish",
    ru: "Читать комментарии к постам и отвечать на них",
  },
  "See your account's name and profile picture": {
    uz: "Hisobingiz nomi va profil rasmini ko'rish",
    ru: "Видеть имя аккаунта и фото профиля",
  },
  "Opening Instagram…": {
    uz: "Instagram ochilmoqda…",
    ru: "Открываем Instagram…",
  },
  "Continue with Instagram": {
    uz: "Instagram orqali davom etish",
    ru: "Продолжить через Instagram",
  },
  "Come back here": {
    uz: "Shu yerga qayting",
    ru: "Вернитесь сюда",
  },
  "After you approve, Instagram sends you back and your account shows as connected. Nothing to copy or paste.":
    {
      uz: "Tasdiqlaganingizdan so'ng Instagram sizni qaytaradi va hisobingiz ulangan bo'lib ko'rinadi. Hech narsa nusxalash shart emas.",
      ru: "После подтверждения Instagram вернёт вас сюда, и аккаунт отобразится как подключённый. Ничего копировать не нужно.",
    },
  "Instagram is connected, but messages can't arrive until the Meta webhook setup is finished.":
    {
      uz: "Instagram ulangan, lekin Meta webhook sozlamasi tugamaguncha xabarlar kelmaydi.",
      ru: "Instagram подключён, но сообщения не будут приходить, пока не завершена настройка вебхука Meta.",
    },
  "Your Meta webhook may point to a different Osonflow environment. Press Refresh connection, then check the callback URL in your Meta app.":
    {
      uz: "Meta webhookingiz boshqa Osonflow muhitiga yo'naltirilgan bo'lishi mumkin. Ulanishni yangilash tugmasini bosing, so'ng Meta ilovangizdagi callback URL'ni tekshiring.",
      ru: "Возможно, вебхук Meta указывает на другое окружение Osonflow. Нажмите «Обновить подключение» и проверьте callback URL в приложении Meta.",
    },
  "Meta app setup (for your developer)": {
    uz: "Meta ilovasini sozlash (dasturchingiz uchun)",
    ru: "Настройка приложения Meta (для разработчика)",
  },
  "In Meta App Dashboard, open Instagram → Webhooks and make sure": {
    uz: "Meta App Dashboard'da Instagram → Webhooks'ni oching va quyidagiga ishonch hosil qiling:",
    ru: "В Meta App Dashboard откройте Instagram → Webhooks и убедитесь, что",
  },
  "is subscribed — it's required for DMs and only needs doing once. For production, switch the Meta app to Live mode and complete App Review so any professional account can connect.":
    {
      uz: "obuna bo'lgan — bu shaxsiy xabarlar uchun zarur va faqat bir marta qilinadi. Ishlab chiqarish uchun Meta ilovasini Live rejimiga o'tkazing va istalgan professional hisob ulana olishi uchun App Review'dan o'ting.",
      ru: "есть подписка — это нужно для личных сообщений и делается один раз. Для продакшена переведите приложение Meta в режим Live и пройдите App Review, чтобы подключался любой профессиональный аккаунт.",
    },
  "Account ID": {
    uz: "Hisob ID",
    ru: "ID аккаунта",
  },
  "Messages to this WhatsApp number will stop reaching your inbox and your assistant. Past conversations stay in Osonflow.":
    {
      uz: "Bu WhatsApp raqamiga kelgan xabarlar endi Inbox'ingizga ham, yordamchingizga ham yetib bormaydi. Oldingi suhbatlar Osonflow'da qoladi.",
      ru: "Сообщения на этот номер WhatsApp больше не будут попадать во входящие и к ассистенту. Прошлые диалоги останутся в Osonflow.",
    },
  "Messages to your WhatsApp Business number are answered by your assistant and collected in your inbox.":
    {
      uz: "WhatsApp Business raqamingizga kelgan xabarlarga yordamchingiz javob beradi va ular Inbox'ingizda to'planadi.",
      ru: "На сообщения на ваш номер WhatsApp Business отвечает ассистент, и они собираются во входящих.",
    },
  "Open WhatsApp API setup in Meta": {
    uz: "Meta'da WhatsApp API sozlamasini ochish",
    ru: "Открыть настройку WhatsApp API в Meta",
  },
  "In your Meta developer app, go to WhatsApp → API setup. You need the": {
    uz: "Meta dasturchi ilovangizda WhatsApp → API setup'ga o'ting. Sizga kerak:",
    ru: "В приложении Meta для разработчиков откройте WhatsApp → API setup. Понадобятся",
  },
  "and a": {
    uz: "va",
    ru: "и",
  },
  "permanent access token": {
    uz: "doimiy kirish tokeni",
    ru: "постоянный токен доступа",
  },
  "Open Meta for Developers": {
    uz: "Meta for Developers'ni ochish",
    ru: "Открыть Meta for Developers",
  },
  "Paste them here": {
    uz: "Ularni shu yerga qo'ying",
    ru: "Вставьте их сюда",
  },
  "Access token": {
    uz: "Kirish tokeni",
    ru: "Токен доступа",
  },
  "Business account ID": {
    uz: "Biznes hisob ID",
    ru: "ID бизнес-аккаунта",
  },
  "Connect WhatsApp": {
    uz: "WhatsApp'ni ulash",
    ru: "Подключить WhatsApp",
  },
  "Finish the webhook in Meta": {
    uz: "Meta'da webhookni yakunlang",
    ru: "Завершите вебхук в Meta",
  },
  "Once connected, this page shows the callback URL and verify token to paste into Meta's webhook settings.":
    {
      uz: "Ulangandan so'ng, bu sahifada Meta webhook sozlamalariga qo'yiladigan callback URL va tasdiqlash tokeni ko'rsatiladi.",
      ru: "После подключения здесь появятся callback URL и токен проверки для настроек вебхука Meta.",
    },
  "Connected — paste the callback URL and verify token below into Meta's webhook settings so messages can arrive.":
    {
      uz: "Ulandi — xabarlar kelishi uchun quyidagi callback URL va tasdiqlash tokenini Meta webhook sozlamalariga qo'ying.",
      ru: "Подключено — вставьте callback URL и токен проверки ниже в настройки вебхука Meta, чтобы приходили сообщения.",
    },
  "Meta webhook settings": {
    uz: "Meta webhook sozlamalari",
    ru: "Настройки вебхука Meta",
  },
  "Callback URL": {
    uz: "Callback URL",
    ru: "Callback URL",
  },
  "Verify token": {
    uz: "Tasdiqlash tokeni",
    ru: "Токен проверки",
  },
  "Osonflow's own AI keys work out of the box. Add your company's keys only if you want AI usage billed to your own OpenAI or Google account.":
    {
      uz: "Osonflow'ning o'z AI kalitlari darhol ishlaydi. AI xarajatlari o'z OpenAI yoki Google hisobingizga yozilishini istasangizgina kompaniyangiz kalitlarini qo'shing.",
      ru: "Собственные AI-ключи Osonflow работают сразу. Добавляйте ключи компании, только если хотите, чтобы AI оплачивался с вашего аккаунта OpenAI или Google.",
    },
  "Add destination": {
    uz: "Manzil qo'shish",
    ru: "Добавить получателя",
  },
  "Send a notice to Discord, Telegram, WhatsApp or your own system whenever something happens — a new chat, a message, a conversation handed to your team.":
    {
      uz: "Biror narsa sodir bo'lganda — yangi chat, xabar, jamoaga uzatilgan suhbat — Discord, Telegram, WhatsApp yoki o'z tizimingizga xabarnoma yuboring.",
      ru: "Отправляйте уведомления в Discord, Telegram, WhatsApp или свою систему, когда что-то происходит — новый чат, сообщение, передача диалога команде.",
    },
  "Save this signing secret now — it's shown only once.": {
    uz: "Bu imzo sirini hozir saqlang — u faqat bir marta ko'rsatiladi.",
    ru: "Сохраните этот секрет подписи сейчас — он показывается только один раз.",
  },
  "Signing secret": {
    uz: "Imzo siri",
    ru: "Секрет подписи",
  },
  "Your developer uses it to confirm events really came from Osonflow.": {
    uz: "Dasturchingiz u orqali hodisalar haqiqatan Osonflow'dan kelganini tasdiqlaydi.",
    ru: "С его помощью разработчик проверяет, что события действительно пришли от Osonflow.",
  },
  Destinations: {
    uz: "Manzillar",
    ru: "Получатели",
  },
  "On · no events yet": {
    uz: "Yoqilgan · hali hodisalar yo'q",
    ru: "Включено · событий пока нет",
  },
  "Pause destination": {
    uz: "Manzilni to'xtatish",
    ru: "Приостановить получателя",
  },
  "Turn destination on": {
    uz: "Manzilni yoqish",
    ru: "Включить получателя",
  },
  "Sends:": {
    uz: "Yuboradi:",
    ru: "Отправляет:",
  },
  "New signing secret": {
    uz: "Yangi imzo siri",
    ru: "Новый секрет подписи",
  },
  "Remove this destination?": {
    uz: "Bu manzil olib tashlansinmi?",
    ru: "Удалить этого получателя?",
  },
  "This permanently deletes the": {
    uz: "Quyidagi butunlay o'chiriladi:",
    ru: "Это навсегда удалит",
  },
  "and its delivery history.": {
    uz: "va uning yetkazish tarixi.",
    ru: "и его историю доставок.",
  },
  "Add a destination": {
    uz: "Manzil qo'shish",
    ru: "Добавить получателя",
  },
  "Add your first destination": {
    uz: "Birinchi manzilni qo'shing",
    ru: "Добавьте первого получателя",
  },
  "Where should notices go?": {
    uz: "Xabarnomalar qayerga borsin?",
    ru: "Куда отправлять уведомления?",
  },
  Destination: {
    uz: "Manzil",
    ru: "Получатель",
  },
  "Connection details": {
    uz: "Ulanish ma'lumotlari",
    ru: "Данные подключения",
  },
  "Send to phone number": {
    uz: "Telefon raqamiga yuborish",
    ru: "Отправлять на номер телефона",
  },
  "Endpoint URL (optional)": {
    uz: "Endpoint URL (ixtiyoriy)",
    ru: "URL эндпоинта (необязательно)",
  },
  "Webhook URL": {
    uz: "Webhook URL",
    ru: "URL вебхука",
  },
  "Leave as it is unless you use a custom relay.": {
    uz: "Maxsus relay ishlatmasangiz, o'zgartirmang.",
    ru: "Оставьте как есть, если не используете свой ретранслятор.",
  },
  "In Discord: channel settings → Integrations → Webhooks → Copy webhook URL.":
    {
      uz: "Discord'da: kanal sozlamalari → Integrations → Webhooks → Copy webhook URL.",
      ru: "В Discord: настройки канала → Integrations → Webhooks → Copy webhook URL.",
    },
  "The address your system gave you for receiving events.": {
    uz: "Tizimingiz hodisalarni qabul qilish uchun bergan manzil.",
    ru: "Адрес, который ваша система дала для приёма событий.",
  },
  "e.g. Reception alerts": {
    uz: "masalan, Qabulxona ogohlantirishlari",
    ru: "например, Оповещения ресепшена",
  },
  "What should it be told about?": {
    uz: "U nima haqida xabardor qilinsin?",
    ru: "О чём сообщать?",
  },
  "Creating…": {
    uz: "Yaratilmoqda…",
    ru: "Создание…",
  },
  "Create destination": {
    uz: "Manzil yaratish",
    ru: "Создать получателя",
  },
  "Recent deliveries": {
    uz: "So'nggi yetkazishlar",
    ru: "Последние доставки",
  },
  "delivered ·": {
    uz: "yetkazildi ·",
    ru: "доставлено ·",
  },
  "Clearing…": {
    uz: "Tozalanmoqda…",
    ru: "Очистка…",
  },
  "This permanently deletes all": {
    uz: "Quyidagilarning barchasi butunlay o'chiriladi:",
    ru: "Это навсегда удалит все",
  },
  "Nothing sent yet. Deliveries appear here the first time an event fires.": {
    uz: "Hali hech narsa yuborilmagan. Hodisa birinchi marta sodir bo'lganda yetkazishlar shu yerda paydo bo'ladi.",
    ru: "Пока ничего не отправлено. Доставки появятся здесь при первом событии.",
  },
  "Setup sections": {
    uz: "Sozlash bo'limlari",
    ru: "Разделы настройки",
  },
  "Render <EchoWidget /> once, in your root component.": {
    uz: "<EchoWidget /> ni asosiy komponentingizda bir marta joylashtiring.",
    ru: "Отрендерите <EchoWidget /> один раз в корневом компоненте.",
  },
  "Render <EchoWidgetScript /> once, in your root layout.": {
    uz: "<EchoWidgetScript /> ni asosiy layoutingizda bir marta joylashtiring.",
    ru: "Отрендерите <EchoWidgetScript /> один раз в корневом layout.",
  },
  "Run it once when your page loads.": {
    uz: "Sahifangiz yuklanganda uni bir marta ishga tushiring.",
    ru: "Запустите один раз при загрузке страницы.",
  },
  "Organization ID copied": {
    uz: "Tashkilot ID nusxalandi",
    ru: "ID организации скопирован",
  },
  "Failed to copy organization ID": {
    uz: "Tashkilot ID'sini nusxalab bo'lmadi",
    ru: "Не удалось скопировать ID организации",
  },
  "Telegram bot connected": {
    uz: "Telegram bot ulandi",
    ru: "Telegram-бот подключён",
  },
  "Failed to start Instagram authorization": {
    uz: "Instagram avtorizatsiyasini boshlab bo'lmadi",
    ru: "Не удалось начать авторизацию Instagram",
  },
  "Instagram account disconnected": {
    uz: "Instagram hisobi uzildi",
    ru: "Аккаунт Instagram отключён",
  },
  "Failed to disconnect Instagram account": {
    uz: "Instagram hisobini uzib bo'lmadi",
    ru: "Не удалось отключить аккаунт Instagram",
  },
  "Instagram webhooks refreshed": {
    uz: "Instagram webhooklari yangilandi",
    ru: "Вебхуки Instagram обновлены",
  },
  "Instagram connected, but webhook setup still needs attention": {
    uz: "Instagram ulandi, lekin webhook sozlamasi hali e'tibor talab qiladi",
    ru: "Instagram подключён, но настройка вебхука ещё требует внимания",
  },
  "Failed to refresh Instagram webhooks": {
    uz: "Instagram webhooklarini yangilab bo'lmadi",
    ru: "Не удалось обновить вебхуки Instagram",
  },
  "WhatsApp phone number ID and access token are required": {
    uz: "WhatsApp telefon raqami ID va kirish tokeni majburiy",
    ru: "Нужны ID номера WhatsApp и токен доступа",
  },
  "WhatsApp number connected": {
    uz: "WhatsApp raqami ulandi",
    ru: "Номер WhatsApp подключён",
  },
  "WhatsApp number saved. Add a webhook base URL to receive messages.": {
    uz: "WhatsApp raqami saqlandi. Xabarlarni olish uchun webhook asosiy URL manzilini qo'shing.",
    ru: "Номер WhatsApp сохранён. Добавьте базовый URL вебхука, чтобы получать сообщения.",
  },
  "Failed to connect WhatsApp number": {
    uz: "WhatsApp raqamini ulab bo'lmadi",
    ru: "Не удалось подключить номер WhatsApp",
  },
  "WhatsApp number disconnected": {
    uz: "WhatsApp raqami uzildi",
    ru: "Номер WhatsApp отключён",
  },
  "Failed to disconnect WhatsApp number": {
    uz: "WhatsApp raqamini uzib bo'lmadi",
    ru: "Не удалось отключить номер WhatsApp",
  },
  "First chat": {
    uz: "Birinchi chat",
    ru: "Первый чат",
  },
  "Every chat arrives in your inbox. You can read along while the assistant answers and step in as a human at any point.":
    {
      uz: "Har bir chat Inbox'ingizga keladi. Yordamchi javob berayotganda kuzatib turishingiz va istalgan paytda o'zingiz aralashishingiz mumkin.",
      ru: "Каждый чат приходит во входящие. Можно следить, как отвечает ассистент, и подключиться самому в любой момент.",
    },
  "This step ticks itself once a real customer writes in.": {
    uz: "Haqiqiy mijoz yozishi bilan bu qadam o'zi belgilanadi.",
    ru: "Этот шаг отметится сам, когда напишет настоящий клиент.",
  },
  "First conversation received": {
    uz: "Birinchi suhbat qabul qilindi",
    ru: "Получен первый диалог",
  },
  "Open the inbox": {
    uz: "Inbox'ni ochish",
    ru: "Открыть входящие",
  },
  "The pages you will actually live in once you are set up.": {
    uz: "Sozlab bo'lgach, asosan ishlaydigan sahifalaringiz.",
    ru: "Страницы, в которых вы будете работать после настройки.",
  },
  "Every chat with a customer. Read them, reply yourself, and mark them done.":
    {
      uz: "Mijoz bilan har bir chat. O'qing, o'zingiz javob bering va bajarilgan deb belgilang.",
      ru: "Все чаты с клиентами. Читайте, отвечайте сами и отмечайте как решённые.",
    },
  "Transcripts of spoken conversations, if you turn on voice.": {
    uz: "Ovozni yoqsangiz, og'zaki suhbatlar yozuvlari.",
    ru: "Расшифровки голосовых разговоров, если вы включите голос.",
  },
  "People who left a name, email or phone number. Your follow-up list.": {
    uz: "Ism, email yoki telefon raqamini qoldirgan odamlar. Bog'lanish ro'yxatingiz.",
    ru: "Люди, оставившие имя, email или телефон. Ваш список для связи.",
  },
  "What the assistant remembers about people who come back a second time.": {
    uz: "Ikkinchi marta qaytgan odamlar haqida yordamchi nimani eslab qoladi.",
    ru: "Что ассистент помнит о людях, которые возвращаются.",
  },
  "Give it your website address, answer a few questions, and it writes your knowledge base, instructions and chat window for you to review.":
    {
      uz: "Unga saytingiz manzilini bering, bir nechta savolga javob bering — u ko'rib chiqishingiz uchun bilim bazasi, ko'rsatmalar va chat oynasini yozib beradi.",
      ru: "Дайте адрес сайта, ответьте на пару вопросов — и он напишет базу знаний, инструкции и окно чата, чтобы вы проверили.",
    },
  "The documents and web pages the assistant is allowed to answer from. The single most important page here.":
    {
      uz: "Yordamchi javob berishi mumkin bo'lgan hujjat va veb-sahifalar. Bu yerdagi eng muhim sahifa.",
      ru: "Документы и веб-страницы, по которым ассистенту можно отвечать. Самая важная страница здесь.",
    },
  "Things the assistant can do beyond talking — look something up, write a row into a spreadsheet, book a call.":
    {
      uz: "Yordamchi gaplashishdan tashqari qila oladigan ishlar — biror narsani topish, jadvalga qator yozish, qo'ng'iroqqa yozish.",
      ru: "Что ассистент умеет кроме разговора — найти данные, записать строку в таблицу, записать на звонок.",
    },
  "For questions you want answered the exact same way every time — a refund request, a booking — you can draw the steps instead of trusting the assistant to improvise.":
    {
      uz: "Har safar aynan bir xil javob berilishini istagan savollar uchun — pulni qaytarish so'rovi, yozilish — yordamchi o'zi o'ylab topishiga ishonish o'rniga qadamlarni chizishingiz mumkin.",
      ru: "Для вопросов, на которые нужен всегда одинаковый ответ — возврат, запись, — можно нарисовать шаги, а не полагаться на импровизацию ассистента.",
    },
  "You will visit these while getting started, then rarely again.": {
    uz: "Bularga boshlashda kirasiz, keyin kamdan-kam.",
    ru: "Сюда вы заглянете при настройке, а потом редко.",
  },
  "How the chat window looks and what it says, from colours to the greeting.": {
    uz: "Chat oynasi qanday ko'rinishi va nima deyishi — ranglardan salomlashuvgacha.",
    ru: "Как выглядит окно чата и что в нём написано — от цветов до приветствия.",
  },
  "The code for your website, plus Telegram, Instagram and WhatsApp.": {
    uz: "Saytingiz uchun kod, shuningdek Telegram, Instagram va WhatsApp.",
    ru: "Код для сайта, а также Telegram, Instagram и WhatsApp.",
  },
  "You teach it": {
    uz: "Siz o'rgatasiz",
    ru: "Вы обучаете",
  },
  "It answers": {
    uz: "U javob beradi",
    ru: "Он отвечает",
  },
  "Customers ask questions on your website, and it replies in seconds, day or night.":
    {
      uz: "Mijozlar saytingizda savol beradi va u kechayu kunduz bir necha soniyada javob beradi.",
      ru: "Клиенты задают вопросы на сайте, а он отвечает за секунды днём и ночью.",
    },
  "You take over": {
    uz: "Siz o'z qo'lingizga olasiz",
    ru: "Вы подключаетесь",
  },
  "Anything it cannot handle lands in your inbox with the whole conversation attached.":
    {
      uz: "U hal qila olmagan hamma narsa butun suhbat bilan Inbox'ingizga tushadi.",
      ru: "Всё, с чем он не справился, попадает во входящие вместе со всем диалогом.",
    },
  "Switch it on": {
    uz: "Uni yoqing",
    ru: "Включите его",
  },
  "Osonflow writes answers using OpenAI. Paste your OpenAI key once and the assistant can start replying.":
    {
      uz: "Osonflow javoblarni OpenAI yordamida yozadi. OpenAI kalitingizni bir marta qo'ying — yordamchi javob bera boshlaydi.",
      ru: "Osonflow пишет ответы с помощью OpenAI. Вставьте ключ OpenAI один раз, и ассистент начнёт отвечать.",
    },
  "Without a key the assistant can read your documents but cannot write a reply.":
    {
      uz: "Kalitsiz yordamchi hujjatlaringizni o'qiy oladi, lekin javob yoza olmaydi.",
      ru: "Без ключа ассистент может читать документы, но не может писать ответы.",
    },
  "2 min": {
    uz: "2 daqiqa",
    ru: "2 мин",
  },
  "Assistant is switched on": {
    uz: "Yordamchi yoqilgan",
    ru: "Ассистент включён",
  },
  "Open Integrations": {
    uz: "Integratsiyalarni ochish",
    ru: "Открыть интеграции",
  },
  "Teach it": {
    uz: "Uni o'rgating",
    ru: "Обучите его",
  },
  "Paste your website address and it will read the pages itself. You can add price lists, policies and FAQs later.":
    {
      uz: "Saytingiz manzilini qo'ying — u sahifalarni o'zi o'qiydi. Narxlar ro'yxati, qoidalar va FAQ'ni keyinroq qo'shishingiz mumkin.",
      ru: "Вставьте адрес сайта, и он сам прочитает страницы. Прайс-листы, правила и FAQ можно добавить позже.",
    },
  "The assistant answers only from what you put here, so it cannot invent a price or a policy.":
    {
      uz: "Yordamchi faqat siz bu yerga qo'ygan narsalar asosida javob beradi, shuning uchun narx yoki qoidani o'ylab topa olmaydi.",
      ru: "Ассистент отвечает только по тому, что вы сюда добавили, поэтому не придумает цену или правило.",
    },
  "5 min": {
    uz: "5 daqiqa",
    ru: "5 мин",
  },
  "It knows your business": {
    uz: "U biznesingizni biladi",
    ru: "Он знает ваш бизнес",
  },
  "Open Knowledge base": {
    uz: "Bilim bazasini ochish",
    ru: "Открыть базу знаний",
  },
  "Make it yours": {
    uz: "O'zingizga moslang",
    ru: "Сделайте своим",
  },
  "Choose the assistant's name, the first thing it says, and the colour of the chat button.":
    {
      uz: "Yordamchi nomini, birinchi aytadigan gapini va chat tugmasi rangini tanlang.",
      ru: "Выберите имя ассистента, его первую фразу и цвет кнопки чата.",
    },
  "This is the part your customers actually see, so it should look like the rest of your site.":
    {
      uz: "Mijozlaringiz aynan shu qismni ko'radi, shuning uchun u saytingizning qolgan qismiga o'xshashi kerak.",
      ru: "Именно это видят клиенты, поэтому оно должно выглядеть как остальной сайт.",
    },
  "3 min": {
    uz: "3 daqiqa",
    ru: "3 мин",
  },
  "Your look is published": {
    uz: "Ko'rinishingiz e'lon qilindi",
    ru: "Оформление опубликовано",
  },
  "Open the full designer": {
    uz: "To'liq dizaynerni ochish",
    ru: "Открыть полный дизайнер",
  },
  "Add to your site": {
    uz: "Saytingizga qo'shing",
    ru: "Добавьте на сайт",
  },
  "Copy one line of code and paste it into your site. A chat button then appears in the corner of every page.":
    {
      uz: "Bir qator kodni nusxalab, saytingizga qo'ying. Shundan so'ng har bir sahifa burchagida chat tugmasi paydo bo'ladi.",
      ru: "Скопируйте одну строку кода и вставьте на сайт. После этого в углу каждой страницы появится кнопка чата.",
    },
  "Send the line to whoever manages your website if you would rather not touch the code yourself.":
    {
      uz: "Kodga o'zingiz tegmoqchi bo'lmasangiz, bu qatorni saytingizni boshqaradigan kishiga yuboring.",
      ru: "Если не хотите трогать код сами, отправьте эту строку тому, кто управляет сайтом.",
    },
  "Visitors have opened it": {
    uz: "Tashrif buyuruvchilar uni ochdi",
    ru: "Посетители его открыли",
  },
  "See all install options": {
    uz: "Barcha o'rnatish usullarini ko'rish",
    ru: "Все варианты установки",
  },
  "You're live": {
    uz: "Siz ishga tushdingiz",
    ru: "Вы запустились",
  },
  "Let's begin": {
    uz: "Boshlaymiz",
    ru: "Начнём",
  },
  "Nearly there": {
    uz: "Oz qoldi",
    ru: "Почти готово",
  },
  "Setup steps": {
    uz: "Sozlash qadamlari",
    ru: "Шаги настройки",
  },
  "Your customers will see this the next time they open it.": {
    uz: "Mijozlaringiz buni keyingi safar ochganda ko'radi.",
    ru: "Клиенты увидят это при следующем открытии.",
  },
  "Could not publish that. Please try again.": {
    uz: "Buni e'lon qilib bo'lmadi. Iltimos, qayta urinib ko'ring.",
    ru: "Не удалось опубликовать. Попробуйте ещё раз.",
  },
  "Skip ahead": {
    uz: "O'tkazib yuborish",
    ru: "Пропустить",
  },
  Publishing: {
    uz: "E'lon qilinmoqda",
    ru: "Публикация",
  },
  "What should it be called?": {
    uz: "U qanday nomlansin?",
    ru: "Как его назвать?",
  },
  "The first thing a customer reads when they open the chat.": {
    uz: "Mijoz chatni ochganda birinchi o'qiydigan narsa.",
    ru: "Первое, что читает клиент, открыв чат.",
  },
  "How should it say hello?": {
    uz: "U qanday salomlashsin?",
    ru: "Как ему здороваться?",
  },
  "Used for the chat header, your customer's messages and the button on your site. Fine-tune every colour later in the designer.":
    {
      uz: "Chat sarlavhasi, mijozingiz xabarlari va saytingizdagi tugma uchun ishlatiladi. Har bir rangni keyinroq dizaynerda sozlang.",
      ru: "Используется для шапки чата, сообщений клиента и кнопки на сайте. Каждый цвет можно донастроить позже в дизайнере.",
    },
  "Your colour": {
    uz: "Rangingiz",
    ru: "Ваш цвет",
  },
  "Pick a custom colour": {
    uz: "Boshqa rang tanlash",
    ru: "Выбрать свой цвет",
  },
  ". It stays private to your workspace and is never shown again after saving.":
    {
      uz: ". U faqat ish maydoningizda qoladi va saqlangandan keyin boshqa ko'rsatilmaydi.",
      ru: ". Он остаётся только в вашем пространстве и после сохранения больше не показывается.",
    },
  "Your OpenAI key": {
    uz: "OpenAI kalitingiz",
    ru: "Ваш ключ OpenAI",
  },
  "Paste your OpenAI key first": {
    uz: "Avval OpenAI kalitingizni qo'ying",
    ru: "Сначала вставьте ключ OpenAI",
  },
  "Key saved — your assistant can now write answers": {
    uz: "Kalit saqlandi — yordamchingiz endi javob yoza oladi",
    ru: "Ключ сохранён — ассистент теперь может писать ответы",
  },
  "Could not save that key. Check it and try again.": {
    uz: "Bu kalitni saqlab bo'lmadi. Tekshirib, qayta urinib ko'ring.",
    ru: "Не удалось сохранить ключ. Проверьте его и попробуйте снова.",
  },
  "Next step": {
    uz: "Keyingi qadam",
    ru: "Следующий шаг",
  },
  "Your key is stored and in use. You can replace it any time from Integrations.":
    {
      uz: "Kalitingiz saqlangan va ishlatilmoqda. Uni istalgan vaqtda Integratsiyalar bo'limida almashtirishingiz mumkin.",
      ru: "Ключ сохранён и используется. Заменить его можно в любой момент в «Интеграциях».",
    },
  "Don't have one yet? Create a key at": {
    uz: "Hali kalitingiz yo'qmi? Kalitni shu yerda yarating:",
    ru: "Ещё нет ключа? Создайте его на",
  },
  "It answers first": {
    uz: "U birinchi javob beradi",
    ru: "Он отвечает первым",
  },
  "Questions your documents cover are handled in seconds, at any hour.": {
    uz: "Hujjatlaringizda bor savollar istalgan soatda bir necha soniyada hal qilinadi.",
    ru: "Вопросы, которые есть в документах, решаются за секунды в любое время.",
  },
  "You get the hard ones": {
    uz: "Qiyinlari sizga keladi",
    ru: "Сложные достаются вам",
  },
  "Anything it cannot answer is handed to you with the whole conversation attached.":
    {
      uz: "U javob bera olmagan hamma narsa butun suhbat bilan sizga uzatiladi.",
      ru: "Всё, на что он не может ответить, передаётся вам вместе со всем диалогом.",
    },
  "It gets better": {
    uz: "U yaxshilanib boradi",
    ru: "Он становится лучше",
  },
  "AI performance shows you the questions it missed, so you know exactly what to add next.":
    {
      uz: "AI samaradorligi u o'tkazib yuborgan savollarni ko'rsatadi, shuning uchun keyin nima qo'shishni aniq bilasiz.",
      ru: "Раздел эффективности AI показывает вопросы, которые он пропустил, — вы точно знаете, что добавить дальше.",
    },
  "Go to my inbox": {
    uz: "Inbox'imga o'tish",
    ru: "Перейти во входящие",
  },
  "You're live.": {
    uz: "Siz ishga tushdingiz.",
    ru: "Вы запустились.",
  },
  "Real customers are talking to your assistant. Everything from here happens in the inbox.":
    {
      uz: "Haqiqiy mijozlar yordamchingiz bilan gaplashmoqda. Bundan keyingi hamma narsa Inbox'da bo'ladi.",
      ru: "С ассистентом общаются настоящие клиенты. Дальше всё происходит во входящих.",
    },
  "Want to test it yourself first?": {
    uz: "Avval o'zingiz sinab ko'rmoqchimisiz?",
    ru: "Хотите сначала проверить сами?",
  },
  "Open your widget in a new tab": {
    uz: "Vidjetingizni yangi varaqda oching",
    ru: "Откройте виджет в новой вкладке",
  },
  "and send it a message — it arrives in the inbox like any other.": {
    uz: "va unga xabar yuboring — u Inbox'ga boshqalar kabi keladi.",
    ru: "и отправьте сообщение — оно придёт во входящие, как и любое другое.",
  },
  "Paste before </body>": {
    uz: "</body> dan oldin qo'ying",
    ru: "Вставьте перед </body>",
  },
  "Loading your snippet…": {
    uz: "Kodingiz yuklanmoqda…",
    ru: "Загрузка кода…",
  },
  "Email this to my developer": {
    uz: "Buni dasturchimga email qilish",
    ru: "Отправить разработчику по email",
  },
  "Opens your mail app with the instructions already written.": {
    uz: "Ko'rsatmalar allaqachon yozilgan holda pochta ilovangizni ochadi.",
    ru: "Откроет почтовое приложение с уже написанными инструкциями.",
  },
  "Detected — someone has opened the chat on your site.": {
    uz: "Aniqlandi — kimdir saytingizda chatni ochdi.",
    ru: "Обнаружено — кто-то открыл чат на вашем сайте.",
  },
  "Waiting for the first visitor. This ticks itself the moment the chat button loads on your website.":
    {
      uz: "Birinchi tashrif buyuruvchi kutilmoqda. Chat tugmasi saytingizda yuklanishi bilan bu o'zi belgilanadi.",
      ru: "Ждём первого посетителя. Отметится само, как только кнопка чата загрузится на сайте.",
    },
  "Could not copy. Select the code and copy it manually.": {
    uz: "Nusxalab bo'lmadi. Kodni belgilab, o'zingiz nusxalang.",
    ru: "Не удалось скопировать. Выделите код и скопируйте вручную.",
  },
  "Copy the code": {
    uz: "Kodni nusxalash",
    ru: "Скопировать код",
  },
  "Could not run that test right now.": {
    uz: "Bu testni hozir ishga tushirib bo'lmadi.",
    ru: "Не удалось запустить тест сейчас.",
  },
  "It follows the links on the page and saves what it finds. Add more pages, PDFs or spreadsheets later from the Knowledge base.":
    {
      uz: "U sahifadagi havolalar bo'ylab yurib, topganlarini saqlaydi. Ko'proq sahifa, PDF yoki jadvallarni keyinroq Bilim bazasidan qo'shing.",
      ru: "Он проходит по ссылкам на странице и сохраняет найденное. Больше страниц, PDF и таблиц можно добавить позже в базе знаний.",
    },
  Reading: {
    uz: "O'qilmoqda",
    ru: "Чтение",
  },
  "Upload documents instead": {
    uz: "Buning o'rniga hujjat yuklash",
    ru: "Загрузить документы вместо этого",
  },
  "Ask it something": {
    uz: "Undan biror narsa so'rang",
    ru: "Спросите его о чём-нибудь",
  },
  "Try a question a real customer would ask. The answer comes only from what you have given it.":
    {
      uz: "Haqiqiy mijoz beradigan savolni sinab ko'ring. Javob faqat siz bergan ma'lumotlardan olinadi.",
      ru: "Попробуйте вопрос настоящего клиента. Ответ берётся только из того, что вы дали.",
    },
  "How much does delivery cost?": {
    uz: "Yetkazib berish qancha turadi?",
    ru: "Сколько стоит доставка?",
  },
  "· add more detail in the Knowledge base": {
    uz: "· Bilim bazasida batafsilroq ma'lumot qo'shing",
    ru: "· добавьте подробностей в базе знаний",
  },
  "Answered from your content": {
    uz: "Kontentingiz asosida javob berildi",
    ru: "Отвечено по вашему контенту",
  },
  "Partly answered": {
    uz: "Qisman javob berildi",
    ru: "Отвечено частично",
  },
  "Thin on detail": {
    uz: "Ma'lumot kam",
    ru: "Мало подробностей",
  },
  "Not in your content yet": {
    uz: "Hali kontentingizda yo'q",
    ru: "Пока нет в вашем контенте",
  },
  "Enter your website address first": {
    uz: "Avval saytingiz manzilini kiriting",
    ru: "Сначала введите адрес сайта",
  },
  "Read and saved": {
    uz: "O'qildi va saqlandi",
    ru: "Прочитано и сохранено",
  },
  "Ask it a question below to see what it picked up.": {
    uz: "U nimani o'rganganini ko'rish uchun quyida savol bering.",
    ru: "Задайте вопрос ниже, чтобы увидеть, что он усвоил.",
  },
  "Could not read that address. Check it and try again.": {
    uz: "Bu manzilni o'qib bo'lmadi. Tekshirib, qayta urinib ko'ring.",
    ru: "Не удалось прочитать адрес. Проверьте его и попробуйте снова.",
  },
  "Could not read that address.": {
    uz: "Bu manzilni o'qib bo'lmadi.",
    ru: "Не удалось прочитать адрес.",
  },
  "Could not save that. Please try again.": {
    uz: "Buni saqlab bo'lmadi. Iltimos, qayta urinib ko'ring.",
    ru: "Не удалось сохранить. Попробуйте ещё раз.",
  },
  "Welcome to Osonflow": {
    uz: "Osonflow'ga xush kelibsiz",
    ru: "Добро пожаловать в Osonflow",
  },
  "Everything is connected and your assistant is answering customers. This page stays here as a map of the dashboard.":
    {
      uz: "Hammasi ulangan va yordamchingiz mijozlarga javob bermoqda. Bu sahifa boshqaruv paneli xaritasi sifatida shu yerda qoladi.",
      ru: "Всё подключено, ассистент отвечает клиентам. Эта страница остаётся здесь как карта панели.",
    },
  "Five short steps, all of them done right here. Leave whenever you like — your progress is saved as you go.":
    {
      uz: "Beshta qisqa qadam, hammasi shu yerda bajariladi. Xohlagan paytingizda chiqing — jarayoningiz saqlanib boradi.",
      ru: "Пять коротких шагов, все прямо здесь. Уходите когда угодно — прогресс сохраняется.",
    },
  "Skip setup": {
    uz: "Sozlashni o'tkazib yuborish",
    ru: "Пропустить настройку",
  },
  "Where everything lives": {
    uz: "Hammasi qayerda joylashgan",
    ru: "Где что находится",
  },
  "A plain-English version of the menu on the left.": {
    uz: "Chapdagi menyuning oddiy tildagi ko'rinishi.",
    ru: "Меню слева простыми словами.",
  },
  ". Check that the widget host is reachable from this network.": {
    uz: ". Vidjet serveri shu tarmoqdan ochilishini tekshiring.",
    ru: ". Проверьте, доступен ли сервер виджета из этой сети.",
  },
  "Publishing a change in the designer updates this page on the next reload. Anything you send here is a real conversation, so feel free to resolve it afterwards.":
    {
      uz: "Dizaynerda o'zgarishni e'lon qilsangiz, bu sahifa keyingi yangilanishda yangilanadi. Bu yerda yuborgan har bir narsa haqiqiy suhbat, shuning uchun keyin uni hal qilingan deb belgilashingiz mumkin.",
      ru: "Публикация изменения в дизайнере обновит эту страницу при следующей перезагрузке. Всё, что вы отправите здесь, — настоящий диалог, так что потом его можно закрыть.",
    },
  "Back to setup": {
    uz: "Sozlashga qaytish",
    ru: "Назад к настройке",
  },
  "Change how it looks": {
    uz: "Ko'rinishini o'zgartirish",
    ru: "Изменить оформление",
  },
  "This is your website": {
    uz: "Bu sizning saytingiz",
    ru: "Это ваш сайт",
  },
  "Not really — but your published chat button is sitting in the corner exactly as it will on your own pages. Open it and ask a question; the conversation lands in your inbox like any other.":
    {
      uz: "Aslida emas — lekin e'lon qilingan chat tugmangiz burchakda xuddi o'z sahifalaringizdagidek turibdi. Uni oching va savol bering; suhbat Inbox'ingizga boshqalar kabi tushadi.",
      ru: "Не совсем — но опубликованная кнопка чата стоит в углу точно так же, как на ваших страницах. Откройте её и задайте вопрос; диалог попадёт во входящие, как любой другой.",
    },
  "Loading your workspace…": {
    uz: "Ish maydoningiz yuklanmoqda…",
    ru: "Загрузка пространства…",
  },
  "The widget script could not be loaded from": {
    uz: "Vidjet skriptini quyidagi manzildan yuklab bo'lmadi:",
    ru: "Не удалось загрузить скрипт виджета с",
  },
  "Widget published to your site": {
    uz: "Vidjet saytingizda e'lon qilindi",
    ru: "Виджет опубликован на сайте",
  },
  "Knowledge sources added": {
    uz: "Bilim manbalari qo'shildi",
    ru: "Источники знаний добавлены",
  },
  "Knowledge sources skipped (already here)": {
    uz: "Bilim manbalari o'tkazib yuborildi (allaqachon bor)",
    ru: "Источники знаний пропущены (уже есть)",
  },
  "Existing knowledge sources removed": {
    uz: "Mavjud bilim manbalari olib tashlandi",
    ru: "Существующие источники знаний удалены",
  },
  "This isn't valid JSON — make sure you copied the whole file.": {
    uz: "Bu to'g'ri JSON emas — butun faylni nusxalaganingizga ishonch hosil qiling.",
    ru: "Это некорректный JSON — убедитесь, что скопировали весь файл.",
  },
  "This isn't an Osonflow setup file.": {
    uz: "Bu Osonflow sozlamalar fayli emas.",
    ru: "Это не файл настроек Osonflow.",
  },
  "This file comes from a newer version of Osonflow.": {
    uz: "Bu fayl Osonflow'ning yangiroq versiyasidan.",
    ru: "Этот файл из более новой версии Osonflow.",
  },
  "Setup copied to your clipboard": {
    uz: "Sozlamalar buferga nusxalandi",
    ru: "Настройки скопированы в буфер",
  },
  "Setup copy is ready": {
    uz: "Sozlamalar nusxasi tayyor",
    ru: "Копия настроек готова",
  },
  "Your clipboard isn't available — download the file instead.": {
    uz: "Bufer mavjud emas — buning o'rniga faylni yuklab oling.",
    ru: "Буфер обмена недоступен — скачайте файл.",
  },
  "Failed to export organization data": {
    uz: "Tashkilot ma'lumotlarini eksport qilib bo'lmadi",
    ru: "Не удалось экспортировать данные организации",
  },
  "Copied again": {
    uz: "Yana nusxalandi",
    ru: "Скопировано снова",
  },
  "Clipboard unavailable — download the file instead": {
    uz: "Bufer mavjud emas — buning o'rniga faylni yuklab oling",
    ru: "Буфер обмена недоступен — скачайте файл",
  },
  "Export organization data first": {
    uz: "Avval tashkilot ma'lumotlarini eksport qiling",
    ru: "Сначала экспортируйте данные организации",
  },
  "Bundle downloaded": {
    uz: "To'plam yuklab olindi",
    ru: "Пакет скачан",
  },
  "Could not read that JSON file": {
    uz: "Bu JSON faylni o'qib bo'lmadi",
    ru: "Не удалось прочитать этот JSON-файл",
  },
  "Your clipboard is empty — paste the file contents below": {
    uz: "Buferingiz bo'sh — fayl mazmunini quyiga qo'ying",
    ru: "Буфер обмена пуст — вставьте содержимое файла ниже",
  },
  "Paste the file contents into the box below": {
    uz: "Fayl mazmunini quyidagi maydonga qo'ying",
    ru: "Вставьте содержимое файла в поле ниже",
  },
  "Setup imported — with a few notes below": {
    uz: "Sozlamalar import qilindi — quyida bir nechta eslatma bilan",
    ru: "Настройки импортированы — с несколькими замечаниями ниже",
  },
  "Setup imported": {
    uz: "Sozlamalar import qilindi",
    ru: "Настройки импортированы",
  },
  "Makes a file with everything needed to rebuild this setup somewhere else. Nothing here changes.":
    {
      uz: "Bu sozlamani boshqa joyda qayta qurish uchun kerak bo'lgan hamma narsa bilan fayl yaratadi. Bu yerda hech narsa o'zgarmaydi.",
      ru: "Создаёт файл со всем, что нужно, чтобы воссоздать эту настройку в другом месте. Здесь ничего не меняется.",
    },
  "Take a copy": {
    uz: "Nusxa olish",
    ru: "Сделать копию",
  },
  "Create the copy": {
    uz: "Nusxa yaratish",
    ru: "Создать копию",
  },
  "Gathering your setup…": {
    uz: "Sozlamalaringiz yig'ilmoqda…",
    ru: "Собираем настройки…",
  },
  "Create a fresh copy": {
    uz: "Yangi nusxa yaratish",
    ru: "Создать новую копию",
  },
  "Create copy": {
    uz: "Nusxa yaratish",
    ru: "Создать копию",
  },
  "It's also copied to your clipboard.": {
    uz: "U buferga ham nusxalandi.",
    ru: "Она также скопирована в буфер.",
  },
  "In this copy": {
    uz: "Bu nusxada",
    ru: "В этой копии",
  },
  "Keep it somewhere safe": {
    uz: "Uni xavfsiz joyda saqlang",
    ru: "Храните её в надёжном месте",
  },
  "Download the file, or paste it straight into the other organization. It can contain your API keys, so share it only with people you trust.":
    {
      uz: "Faylni yuklab oling yoki to'g'ridan-to'g'ri boshqa tashkilotga qo'ying. Unda API kalitlaringiz bo'lishi mumkin, shuning uchun uni faqat ishonchli odamlar bilan ulashing.",
      ru: "Скачайте файл или вставьте прямо в другую организацию. В нём могут быть API-ключи, поэтому делитесь только с теми, кому доверяете.",
    },
  "Download file": {
    uz: "Faylni yuklab olish",
    ru: "Скачать файл",
  },
  "Copy again": {
    uz: "Yana nusxalash",
    ru: "Скопировать снова",
  },
  "Adds a copy into the organization you're signed in to now. You'll see what's inside before anything is written.":
    {
      uz: "Hozir kirgan tashkilotingizga nusxa qo'shadi. Hech narsa yozilishidan oldin ichida nima borligini ko'rasiz.",
      ru: "Добавляет копию в организацию, в которую вы сейчас вошли. Вы увидите содержимое до того, как что-то будет записано.",
    },
  "Bring a copy in": {
    uz: "Nusxani olib kirish",
    ru: "Загрузить копию",
  },
  "Add the file": {
    uz: "Faylni qo'shing",
    ru: "Добавьте файл",
  },
  "Drop the setup file here": {
    uz: "Sozlamalar faylini shu yerga tashlang",
    ru: "Перетащите файл настроек сюда",
  },
  "Choose file": {
    uz: "Fayl tanlash",
    ru: "Выбрать файл",
  },
  "Paste from clipboard": {
    uz: "Buferdan qo'yish",
    ru: "Вставить из буфера",
  },
  "Setup file contents": {
    uz: "Sozlamalar fayli mazmuni",
    ru: "Содержимое файла настроек",
  },
  'Paste the copied setup here — it starts with {"type":"osonflow-org-bundle"':
    {
      uz: 'Nusxalangan sozlamalarni shu yerga qo\'ying — u {"type":"osonflow-org-bundle" bilan boshlanadi',
      ru: 'Вставьте скопированные настройки — они начинаются с {"type":"osonflow-org-bundle"',
    },
  "Choose a file instead": {
    uz: "Buning o'rniga fayl tanlash",
    ru: "Выбрать файл вместо этого",
  },
  "Pasted setup": {
    uz: "Qo'yilgan sozlamalar",
    ru: "Вставленные настройки",
  },
  Inside: {
    uz: "Ichida",
    ru: "Внутри",
  },
  "Choose how it lands": {
    uz: "Qanday qo'shilishini tanlang",
    ru: "Выберите, как применить",
  },
  "Put the widget live right away": {
    uz: "Vidjetni darhol jonli qilish",
    ru: "Сразу опубликовать виджет",
  },
  "Otherwise it's saved as a draft you publish from Widget customization.": {
    uz: "Aks holda u Vidjet sozlamalari bo'limidan e'lon qilinadigan qoralama sifatida saqlanadi.",
    ru: "Иначе он сохранится черновиком, который вы опубликуете в настройках виджета.",
  },
  "Replace the current knowledge base": {
    uz: "Joriy bilim bazasini almashtirish",
    ru: "Заменить текущую базу знаний",
  },
  "Removes the sources already here first. Leave off to add alongside them — duplicates are skipped.":
    {
      uz: "Avval mavjud manbalarni olib tashlaydi. Ularning yoniga qo'shish uchun o'chiq qoldiring — takrorlanganlar o'tkazib yuboriladi.",
      ru: "Сначала удаляет имеющиеся источники. Оставьте выключенным, чтобы добавить рядом — дубликаты пропускаются.",
    },
  Import: {
    uz: "Import qilish",
    ru: "Импортировать",
  },
  "Import into this organization": {
    uz: "Shu tashkilotga import qilish",
    ru: "Импортировать в эту организацию",
  },
  "Add a setup file first.": {
    uz: "Avval sozlamalar faylini qo'shing.",
    ru: "Сначала добавьте файл настроек.",
  },
  Imported: {
    uz: "Import qilindi",
    ru: "Импортировано",
  },
  "A copy carries your setup, not your history or connected accounts. After importing, finish these by hand.":
    {
      uz: "Nusxa tarix yoki ulangan hisoblarni emas, sozlamalaringizni olib o'tadi. Importdan keyin quyidagilarni qo'lda yakunlang.",
      ru: "Копия переносит настройки, но не историю и подключённые аккаунты. После импорта завершите это вручную.",
    },
  "What doesn't move": {
    uz: "Nima ko'chmaydi",
    ru: "Что не переносится",
  },
  "Conversations and customer memory": {
    uz: "Suhbatlar va mijoz xotirasi",
    ru: "Диалоги и память о клиентах",
  },
  "They stay with the original organization.": {
    uz: "Ular asl tashkilotda qoladi.",
    ru: "Они остаются в исходной организации.",
  },
  "Telegram, Instagram and WhatsApp": {
    uz: "Telegram, Instagram va WhatsApp",
    ru: "Telegram, Instagram и WhatsApp",
  },
  "Reconnect each one in the new organization.": {
    uz: "Har birini yangi tashkilotda qayta ulang.",
    ru: "Переподключите каждый в новой организации.",
  },
  "Open Setup & integrations": {
    uz: "Sozlash va integratsiyalarni ochish",
    ru: "Открыть «Настройка и интеграции»",
  },
  "Widget images": {
    uz: "Vidjet rasmlari",
    ru: "Изображения виджета",
  },
  "If a logo or background looks broken, upload it again.": {
    uz: "Logotip yoki fon buzilgan ko'rinsa, uni qayta yuklang.",
    ru: "Если логотип или фон выглядят сломанными, загрузите их снова.",
  },
  "Open Widget customization": {
    uz: "Vidjet sozlamalarini ochish",
    ru: "Открыть настройки виджета",
  },
  "Only need the widget's look? Use the quick copy tools in": {
    uz: "Faqat vidjet ko'rinishi kerakmi? Tezkor nusxalash vositalaridan foydalaning:",
    ru: "Нужно только оформление виджета? Используйте быстрое копирование в",
  },
  "Replace your knowledge base?": {
    uz: "Bilim bazangiz almashtirilsinmi?",
    ru: "Заменить базу знаний?",
  },
  "Every knowledge source currently in this organization will be removed, then the ones in the file are added. Your assistant answers only from the imported sources afterwards.":
    {
      uz: "Bu tashkilotdagi barcha bilim manbalari o'chiriladi, so'ng fayldagilari qo'shiladi. Shundan keyin yordamchingiz faqat import qilingan manbalar asosida javob beradi.",
      ru: "Все источники знаний в этой организации будут удалены, затем добавятся источники из файла. После этого ассистент отвечает только по импортированным источникам.",
    },
  "Replace and import": {
    uz: "Almashtirish va import qilish",
    ru: "Заменить и импортировать",
  },
  "Widget look and settings": {
    uz: "Vidjet ko'rinishi va sozlamalari",
    ru: "Оформление и настройки виджета",
  },
  "Integration keys": {
    uz: "Integratsiya kalitlari",
    ru: "Ключи интеграций",
  },
  "Customers asked this and the assistant didn't know": {
    uz: "Mijozlar buni so'radi, yordamchi esa bilmadi",
    ru: "Клиенты спросили, а ассистент не знал",
  },
  "Didn't open? Open the link": {
    uz: "Ochilmadimi? Havolani oching",
    ru: "Не открылось? Откройте ссылку",
  },
  "Deleting...": {
    uz: "O'chirilmoqda...",
    ru: "Удаление...",
  },
  Debug: {
    uz: "Tafsilot",
    ru: "Отладка",
  },
  Warn: {
    uz: "Ogohlantirish",
    ru: "Предупреждение",
  },
  Fatal: {
    uz: "Jiddiy xato",
    ru: "Критическая ошибка",
  },
  "Re-import to pick up API changes instead of hand-editing each tool.": {
    uz: "Har bir vositani qo'lda tahrirlash o'rniga API o'zgarishlarini olish uchun qayta import qiling.",
    ru: "Импортируйте заново, чтобы подхватить изменения API, вместо ручной правки каждого инструмента.",
  },
  "Could not import widget settings": {
    uz: "Vidjet sozlamalarini import qilib bo'lmadi",
    ru: "Не удалось импортировать настройки виджета",
  },
  "Failed to import organization data": {
    uz: "Tashkilot ma'lumotlarini import qilib bo'lmadi",
    ru: "Не удалось импортировать данные организации",
  },
  "Paste it just before the closing </body> tag — or into the custom code / footer section of your site builder.":
    {
      uz: "Uni yopuvchi </body> tegidan oldin yoki sayt konstruktoringizning maxsus kod / pastki qism bo'limiga qo'ying.",
      ru: "Вставьте его перед закрывающим тегом </body> — или в раздел своего кода / подвала в конструкторе сайта.",
    },
}
