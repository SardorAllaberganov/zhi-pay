/**
 * News CMS — mock single source of truth for the `/content/news` surface.
 *
 * Schema reuses `docs/models.md` §8 NEWS verbatim:
 *   id · title_uz/ru/en · body_uz/ru/en · image_url · is_published ·
 *   published_at · created_at
 *
 * `body_*` fields are HTML strings produced by the dashboard's TipTap RTE
 * and sanitized server-side by the real backend. The dashboard only renders
 * them via `dangerouslySetInnerHTML` inside the trusted preview pane and
 * editor.
 *
 * Mock-only audit-trail surrogates: `createdBy / lastEditedAt / lastEditedBy`
 * (same precedent as `mockStories` / `mockAppVersions` / `mockBlacklist`).
 *
 * Status is **derived** from `isPublished` — 2 values (`published | draft`).
 *
 * Mutators: `addNews` / `editNews` / `publishNews` / `unpublishNews` /
 * `deleteNews`. All emit one audit row, bridged into the central
 * `mockAuditLog` surface via `bridgeNewsAudit`.
 */

// =====================================================================
// Types
// =====================================================================

export type NewsStatus = 'published' | 'draft';

export interface News {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  /** Rich-text HTML — produced by TipTap, sanitized server-side. */
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  /** Optional cover image URL (recommended 16:9). */
  imageUrl: string | null;
  isPublished: boolean;
  /** NULL until the author hits Publish. */
  publishedAt: Date | null;
  createdAt: Date;

  // Mock-only audit-trail surrogates (would live on a separate audit table
  // in the real backend).
  createdBy: string;
  lastEditedAt: Date | null;
  lastEditedBy: string | null;
}

// =====================================================================
// Reference time + admin pool — keep aligned with sibling modules
// =====================================================================

const NOW = new Date('2026-04-29T10:30:00Z');

function ago(days: number, hour = 9, minute = 0): Date {
  const d = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

const SUPER_ADMIN = { id: 'admin_super_01', name: 'Yulduz Otaboeva' } as const;
const FINANCE_ADMIN = { id: 'admin_finance_02', name: 'Adel Ortiqova' } as const;

// =====================================================================
// Body authoring helpers — small DSL so the seed stays readable
// =====================================================================

function p(text: string): string {
  return `<p>${text}</p>`;
}

function h2(text: string): string {
  return `<h2>${text}</h2>`;
}

function ul(items: string[]): string {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

function blockquote(text: string): string {
  return `<blockquote><p>${text}</p></blockquote>`;
}

function body(...nodes: string[]): string {
  return nodes.join('');
}

// =====================================================================
// Seed — 27 articles: 23 published + 4 drafts
// =====================================================================

const NEWS: News[] = [
  // -------------------------------------------------------------------
  // PUBLISHED (23) — newest first
  // -------------------------------------------------------------------
  {
    id: 'news_001',
    titleUz: 'Yangi tariflar e’lon qilindi',
    titleRu: 'Объявлены новые тарифы',
    titleEn: 'New rates announced',
    bodyUz: body(
      p('ZhiPay yangi tariflar tarmog‘ini joriy etdi. Foydalanuvchilar uchun komissiya yanada shaffof va tushunarli bo‘ldi.'),
      p('Yangi tartibda har bir o‘tkazma uchun komissiya 0.5% dan 2% gacha bo‘lib, eng kam to‘lov 5 000 so‘mni tashkil etadi. Korporativ mijozlar uchun chegirmalar ham ko‘zda tutilgan.'),
      h2('Yangiliklar nima beradi'),
      ul([
        'Foiz stavkalar diapazoni aniq ko‘rsatildi',
        'Korporativ tarifda alohida chegirma',
        'Eng kam komissiya 5 000 so‘m bilan cheklandi',
      ]),
      p('Tariflar bilan tanishib chiqing va o‘zingizga qulay variantni tanlang.'),
    ),
    bodyRu: body(
      p('ZhiPay внедрил обновлённую сетку тарифов. Комиссия за переводы стала ещё прозрачнее.'),
      p('По новой схеме комиссия за каждый перевод варьируется от 0,5% до 2%, а минимальная плата составляет 5 000 сум. Корпоративные клиенты получают дополнительные скидки.'),
      h2('Что вы получаете'),
      ul([
        'Чёткий диапазон процентных ставок',
        'Отдельная скидка для корпоративных клиентов',
        'Минимальная комиссия зафиксирована на уровне 5 000 сум',
      ]),
      p('Ознакомьтесь с тарифами и выберите вариант, который вам подходит.'),
    ),
    bodyEn: body(
      p('ZhiPay has rolled out an updated rate grid. Transfer fees are now clearer than ever.'),
      p('Under the new schedule, every transfer carries a fee between 0.5% and 2%, with a minimum of 5,000 UZS. Corporate clients qualify for additional discounts.'),
      h2('What you get'),
      ul([
        'Explicit percentage range',
        'Separate discount tier for corporate clients',
        'Minimum fee capped at 5,000 UZS',
      ]),
      p('Review the rates and pick the option that fits your needs.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/rates-2026.jpg',
    isPublished: true,
    publishedAt: ago(2, 9, 0),
    createdAt: ago(3, 14, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: ago(2, 8, 45),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'news_002',
    titleUz: 'Navruz bayrami munosabati bilan',
    titleRu: 'К празднику Навруз',
    titleEn: 'Navruz holiday',
    bodyUz: body(
      p('Aziz mijozlar! ZhiPay jamoasi sizni bahor bayrami — Navruz bilan samimiy tabriklaydi.'),
      p('21 mart kuni bayram munosabati bilan barcha o‘tkazmalar uchun komissiya 50% ga kamaytiriladi. Aksiya 21 mart soat 00:00 dan 22 mart soat 00:00 gacha amal qiladi.'),
      blockquote('Navruz — yangilanish, mehr va yorug‘ niyatlar bayrami. Bayramingiz qutlug‘ bo‘lsin!'),
    ),
    bodyRu: body(
      p('Дорогие клиенты! Команда ZhiPay сердечно поздравляет вас с праздником весны — Навруз.'),
      p('21 марта в честь праздника комиссия по всем переводам будет снижена на 50%. Акция действует с 00:00 21 марта по 00:00 22 марта.'),
      blockquote('Навруз — праздник обновления, тепла и светлых начинаний. С праздником!'),
    ),
    bodyEn: body(
      p('Dear customers! The ZhiPay team warmly congratulates you on the spring holiday — Navruz.'),
      p('On March 21, in celebration of the holiday, the commission on all transfers will be cut by 50%. The promotion runs from 00:00 March 21 to 00:00 March 22.'),
      blockquote('Navruz is a celebration of renewal, warmth, and bright beginnings. Happy holiday!'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/navruz.jpg',
    isPublished: true,
    publishedAt: ago(5, 8, 0),
    createdAt: ago(7, 11, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_003',
    titleUz: 'Tezroq jo‘natish — yangilangan tezlik',
    titleRu: 'Быстрее: новая скорость переводов',
    titleEn: 'Faster transfers — new processing speed',
    bodyUz: body(
      p('ZhiPay infratuzilmasi yangilandi: Alipay va WeChat Pay yo‘nalishlari bo‘yicha o‘tkazmalarning o‘rtacha bajarilish vaqti 90 sekunddan 30 sekundgacha qisqardi.'),
      p('Yangi quvvat ZhiPay xizmat ko‘rsatuvchi banklar bilan yaqindan integratsiya hisobiga erishildi. Tizim o‘tkazmalarni real vaqt rejimida qayta ishlaydi.'),
      h2('Sezilarli o‘zgarishlar'),
      ul([
        '99% o‘tkazmalar 30 sekund ichida bajariladi',
        'Tizim ishlamay qolish ko‘rsatkichi 0.05% dan past',
        'Avtomatik qayta urinish mexanizmi',
      ]),
    ),
    bodyRu: body(
      p('Инфраструктура ZhiPay обновлена: средняя скорость переводов в направлении Alipay и WeChat Pay сократилась с 90 секунд до 30.'),
      p('Прирост достигнут благодаря тесной интеграции с банками-партнёрами ZhiPay. Система обрабатывает переводы в режиме реального времени.'),
      h2('Что заметно изменилось'),
      ul([
        '99% переводов выполняются за 30 секунд',
        'Доля сбоев системы — менее 0,05%',
        'Автоматический механизм повторных попыток',
      ]),
    ),
    bodyEn: body(
      p('ZhiPay infrastructure has been upgraded: average transfer speed for Alipay and WeChat Pay rails dropped from 90 seconds to 30.'),
      p('The gain comes from tighter integration with ZhiPay’s partner banks. The system now processes transfers in true real time.'),
      h2('What changed noticeably'),
      ul([
        '99% of transfers complete within 30 seconds',
        'System failure rate below 0.05%',
        'Automatic retry mechanism',
      ]),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/speed.jpg',
    isPublished: true,
    publishedAt: ago(8, 10, 0),
    createdAt: ago(9, 16, 20),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: ago(8, 9, 30),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'news_004',
    titleUz: 'MyID orqali tezda KYC',
    titleRu: 'KYC через MyID за минуту',
    titleEn: 'Fast KYC via MyID',
    bodyUz: body(
      p('Endi MyID xizmati orqali shaxsni tasdiqlash atigi 1 daqiqada amalga oshadi. Foydalanuvchi MyID ilovasini ochadi va telefonida tasdiqlaydi — bo‘ldi.'),
      p('Bunda passport ma‘lumotlari ZhiPay tomonida saqlanmaydi: faqat tasdiqlangan PINFL va KYC darajasi olinadi.'),
      h2('KYC nimaga kerak'),
      p('Yuqori darajadagi KYC kun va oy bo‘yicha o‘tkazma limitlarini oshiradi va saqlangan oluvchilar ro‘yxatini kengaytirish imkonini beradi.'),
    ),
    bodyRu: body(
      p('Теперь подтверждение личности через MyID занимает всего 1 минуту. Пользователь открывает приложение MyID и подтверждает запрос на телефоне — готово.'),
      p('Паспортные данные при этом не хранятся на стороне ZhiPay: передаются только подтверждённый ПИНФЛ и уровень KYC.'),
      h2('Зачем нужен KYC'),
      p('Высокий уровень KYC увеличивает дневные и месячные лимиты переводов и расширяет список сохранённых получателей.'),
    ),
    bodyEn: body(
      p('Identity verification via MyID now takes just 1 minute. The user opens the MyID app and confirms the request on their phone — done.'),
      p('Passport data isn’t stored on the ZhiPay side: only the verified PINFL and KYC tier are received.'),
      h2('Why KYC matters'),
      p('A higher KYC tier raises daily and monthly transfer limits and expands your saved-recipient list.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/myid-flow.jpg',
    isPublished: true,
    publishedAt: ago(12, 9, 0),
    createdAt: ago(14, 12, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_005',
    titleUz: 'O‘zbekiston-Xitoy savdo statistikasi',
    titleRu: 'Статистика торговли Узбекистан-Китай',
    titleEn: 'UZ-CN trade stats',
    bodyUz: body(
      p('2025-yil yakunlariga ko‘ra O‘zbekiston va Xitoy o‘rtasidagi tovar ayirboshlash hajmi 14 milliard AQSh dollaridan oshdi. Bu o‘tgan yilga nisbatan 22% ga ko‘p.'),
      p('Asosiy import yo‘nalishlari: elektronika, mashinasozlik mahsulotlari, to‘qimachilik xom ashyosi va ehtiyot qismlar.'),
      p('ZhiPay foydalanuvchilari shaxsiy o‘tkazmalardan tashqari, kichik ulgurji savdo bilan bog‘liq operatsiyalarni ham bajarish imkoniga ega.'),
    ),
    bodyRu: body(
      p('По итогам 2025 года товарооборот между Узбекистаном и Китаем превысил 14 млрд долларов США. Это на 22% больше, чем годом ранее.'),
      p('Основные импортные категории: электроника, машиностроительная продукция, текстильное сырьё и запасные части.'),
      p('Пользователи ZhiPay проводят не только личные переводы, но и операции, связанные с мелкооптовой торговлей.'),
    ),
    bodyEn: body(
      p('In 2025, trade turnover between Uzbekistan and China exceeded $14 billion. That’s a 22% increase year-over-year.'),
      p('Top import categories: electronics, machinery, textile raw materials, and spare parts.'),
      p('ZhiPay users handle not only personal transfers but also small-scale wholesale-trade operations.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/uz-cn-trade.jpg',
    isPublished: true,
    publishedAt: ago(15, 10, 30),
    createdAt: ago(17, 9, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_006',
    titleUz: 'Qurbon hayitingiz muborak bo‘lsin',
    titleRu: 'С праздником Курбан-хайит',
    titleEn: 'Happy Eid al-Adha',
    bodyUz: body(
      p('ZhiPay jamoasi barcha mijozlarini muborak Qurbon hayiti bilan samimiy tabriklaydi. Bu kunlar — saxiylik, mehribonlik va birdamlik kunlari.'),
      p('Bayram munosabati bilan 7 iyundan 9 iyungacha o‘tkazmalardan olinadigan komissiya 25% ga kamaytiriladi.'),
      blockquote('Bayramingiz qutlug‘ bo‘lsin! Sog‘liq, baraka va xayrli amallar.'),
    ),
    bodyRu: body(
      p('Команда ZhiPay сердечно поздравляет всех клиентов со священным праздником Курбан-хайит. Эти дни — время щедрости, доброты и единения.'),
      p('В честь праздника с 7 по 9 июня комиссия по переводам снижена на 25%.'),
      blockquote('Праздничного настроения, здоровья, благодати и добрых дел!'),
    ),
    bodyEn: body(
      p('The ZhiPay team warmly congratulates all customers on the holy holiday of Eid al-Adha. These days are a time of generosity, kindness, and unity.'),
      p('In honor of the holiday, from June 7 to 9, transfer commissions are reduced by 25%.'),
      blockquote('A blessed holiday — health, abundance, and good deeds to you and your family.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/eid-al-adha.jpg',
    isPublished: true,
    publishedAt: ago(18, 11, 0),
    createdAt: ago(19, 14, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_007',
    titleUz: 'Mavsumiy chegirmalar Yangi yil arafasida',
    titleRu: 'Сезонные скидки в преддверии Нового года',
    titleEn: 'Seasonal discounts ahead of New Year',
    bodyUz: body(
      p('Yangi yil arafasida ZhiPay maxsus aksiya e’lon qiladi: 25 dekabrdan 5 yanvargacha barcha o‘tkazmalarda komissiya 30% ga kamaytiriladi.'),
      p('Bundan tashqari, har bir 10-mijozga 10 000 so‘mlik bonus beriladi. Bonus avtomatik tarzda hisobga o‘tkaziladi.'),
    ),
    bodyRu: body(
      p('В преддверии Нового года ZhiPay объявляет специальную акцию: с 25 декабря по 5 января комиссия по всем переводам снижается на 30%.'),
      p('Кроме того, каждый 10-й клиент получает бонус в размере 10 000 сум. Бонус начисляется автоматически.'),
    ),
    bodyEn: body(
      p('Ahead of New Year, ZhiPay is launching a special promotion: from December 25 to January 5, commission on all transfers will be reduced by 30%.'),
      p('Additionally, every 10th customer will receive a 10,000 UZS bonus. The bonus is credited automatically.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/new-year-2026.jpg',
    isPublished: true,
    publishedAt: ago(22, 9, 0),
    createdAt: ago(24, 16, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_008',
    titleUz: 'Mobil ilovaning yangi versiyasi chiqdi',
    titleRu: 'Вышла новая версия мобильного приложения',
    titleEn: 'New mobile app version released',
    bodyUz: body(
      p('ZhiPay mobil ilovasining 1.4.0 versiyasi App Store va Google Play do‘konlarida mavjud bo‘ldi.'),
      h2('Yangiliklar'),
      ul([
        'Yangi qabul qiluvchilar ekrani',
        'Tezkor jo‘natish yorlig‘i bosh ekranda',
        'Qoraqalpoq tilini qo‘llab-quvvatlash uchun zamin',
        'Bir nechta xato tuzatildi',
      ]),
      p('Ilovani yangilash uchun App Store yoki Google Playga kiring va “Yangilash” tugmasini bosing.'),
    ),
    bodyRu: body(
      p('Версия 1.4.0 мобильного приложения ZhiPay доступна в App Store и Google Play.'),
      h2('Что нового'),
      ul([
        'Обновлённый экран получателей',
        'Ярлык быстрого перевода на главном экране',
        'Подготовка к поддержке каракалпакского языка',
        'Исправлено несколько ошибок',
      ]),
      p('Чтобы обновить приложение, зайдите в App Store или Google Play и нажмите «Обновить».'),
    ),
    bodyEn: body(
      p('Version 1.4.0 of the ZhiPay mobile app is now available on the App Store and Google Play.'),
      h2('What’s new'),
      ul([
        'Redesigned recipients screen',
        'Quick-send shortcut on the home screen',
        'Groundwork for Karakalpak language support',
        'Several bugs fixed',
      ]),
      p('To update the app, open the App Store or Google Play and tap "Update".'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/app-1-4-0.jpg',
    isPublished: true,
    publishedAt: ago(26, 13, 30),
    createdAt: ago(27, 9, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_009',
    titleUz: 'Markaziy bank kursi yangilanishi haqida',
    titleRu: 'Об обновлении курса Центрального банка',
    titleEn: 'Central bank rate update',
    bodyUz: body(
      p('O‘zbekiston Markaziy banki yuan-so‘m valyuta juftligi bo‘yicha rasmiy kursni yangiladi. Yangi kurs 30 aprel kunidan amalda.'),
      p('ZhiPay xizmatida o‘tkazma yaratilgan paytdagi kurs yopiq holda saqlanadi va keyin o‘zgarmaydi. Demak, allaqachon ishga tushirilgan o‘tkazmalar ushbu o‘zgarishdan ta’sirlanmaydi.'),
    ),
    bodyRu: body(
      p('Центральный банк Узбекистана обновил официальный курс по валютной паре юань — сум. Новый курс действует с 30 апреля.'),
      p('В ZhiPay курс, действовавший на момент создания перевода, фиксируется и не меняется. Уже запущенные переводы это изменение не затронет.'),
    ),
    bodyEn: body(
      p('The Central Bank of Uzbekistan has updated the official rate for the yuan-to-som currency pair. The new rate is effective from April 30.'),
      p('In ZhiPay, the rate at the time of transfer creation is locked and does not change. Already initiated transfers will not be affected by this change.'),
    ),
    imageUrl: null,
    isPublished: true,
    publishedAt: ago(30, 10, 0),
    createdAt: ago(31, 9, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_010',
    titleUz: 'Mehnat bayramini tabriklaymiz',
    titleRu: 'С Днём труда',
    titleEn: 'Happy Labour Day',
    bodyUz: body(
      p('1-may — Mehnat bayrami munosabati bilan barchamizni tabriklaymiz. Bu kun — mehnat va do‘stlik bayrami.'),
      p('1-may kuni ZhiPay mijozlarni qo‘llab-quvvatlash xizmati ham har kungidek ishlaydi.'),
    ),
    bodyRu: body(
      p('Поздравляем всех с 1 Мая — Днём труда. Это праздник труда и дружбы.'),
      p('1 мая служба поддержки ZhiPay работает в обычном режиме.'),
    ),
    bodyEn: body(
      p('Congratulations to everyone on May 1 — Labour Day. This is a celebration of work and friendship.'),
      p('On May 1, the ZhiPay support service operates as usual.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/labour-day.jpg',
    isPublished: true,
    publishedAt: ago(34, 8, 0),
    createdAt: ago(35, 11, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_011',
    titleUz: 'Saqlangan oluvchilar — endi qulay',
    titleRu: 'Сохранённые получатели — теперь удобнее',
    titleEn: 'Saved recipients — now more convenient',
    bodyUz: body(
      p('Tez-tez foydalanadigan oluvchilarni endi taxallus bilan saqlash mumkin. “Onam”, “Yiwu yetkazib beruvchi” — har qanday qulay nom ishlaydi.'),
      p('Saqlangan oluvchilarga jo‘natish bir tugma bosish bilan amalga oshadi.'),
    ),
    bodyRu: body(
      p('Часто используемых получателей теперь можно сохранять с прозвищем. «Мама», «поставщик в Иу» — подойдёт любое удобное имя.'),
      p('Перевод сохранённому получателю занимает один клик.'),
    ),
    bodyEn: body(
      p('Frequently used recipients can now be saved with a nickname. "Mom", "Yiwu supplier" — any convenient name works.'),
      p('Sending to a saved recipient takes a single tap.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/saved-recipients.jpg',
    isPublished: true,
    publishedAt: ago(38, 9, 30),
    createdAt: ago(39, 14, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_012',
    titleUz: 'Qo‘llab-quvvatlash xizmati 24/7',
    titleRu: 'Поддержка работает 24/7',
    titleEn: 'Support is now 24/7',
    bodyUz: body(
      p('Mijozlarni qo‘llab-quvvatlash xizmati endi sutkasiga 24 soat va haftada 7 kun ishlaydi.'),
      p('Telegram bot va ilovadagi chat orqali aloqaga chiqishingiz mumkin. Tunda javob berish vaqti 5 daqiqadan ko‘p emas.'),
    ),
    bodyRu: body(
      p('Служба поддержки клиентов теперь работает 24 часа в сутки 7 дней в неделю.'),
      p('Связаться можно через Telegram-бота и чат в приложении. Ночью время ответа не превышает 5 минут.'),
    ),
    bodyEn: body(
      p('Customer support is now available 24 hours a day, 7 days a week.'),
      p('Contact us via the Telegram bot or in-app chat. Night-time response time does not exceed 5 minutes.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/support-24-7.jpg',
    isPublished: true,
    publishedAt: ago(42, 10, 0),
    createdAt: ago(43, 12, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_013',
    titleUz: 'Bir kechada uchta mukofot',
    titleRu: 'Три награды за одну ночь',
    titleEn: 'Three awards in one night',
    bodyUz: body(
      p('ZhiPay “Yil fintex loyihasi”, “Eng innovatsion mahsulot” va “Foydalanuvchi tanlovi” nominatsiyalarida g‘olib bo‘ldi.'),
      p('Bu yutuqlar — jamoamizning sa’y-harakatlari va mijozlarimizning ishonchi natijasi. Sizga rahmat!'),
    ),
    bodyRu: body(
      p('ZhiPay стал победителем в номинациях «Финтех-проект года», «Самый инновационный продукт» и «Выбор пользователей».'),
      p('Эти награды — результат усилий нашей команды и доверия наших клиентов. Спасибо вам!'),
    ),
    bodyEn: body(
      p('ZhiPay won in the "Fintech Project of the Year", "Most Innovative Product", and "User’s Choice" categories.'),
      p('These achievements are the result of our team’s efforts and the trust of our customers. Thank you!'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/awards.jpg',
    isPublished: true,
    publishedAt: ago(46, 11, 0),
    createdAt: ago(47, 9, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_014',
    titleUz: 'Avtomatik kurs himoyasi',
    titleRu: 'Автоматическая защита курса',
    titleEn: 'Automatic rate protection',
    bodyUz: body(
      p('Endi har bir o‘tkazma uchun valyuta kursi yaratilgan paytda qulflanadi. Bu — sizning xavfsizligingiz.'),
      p('Agar Markaziy bank kursi keskin o‘zgarsa ham, sizdan yashirin qo‘shimcha to‘lov olinmaydi.'),
    ),
    bodyRu: body(
      p('Теперь курс по каждому переводу фиксируется в момент создания. Это ваша защита.'),
      p('Даже если курс Центрального банка резко изменится, скрытая доплата с вас не взимается.'),
    ),
    bodyEn: body(
      p('The exchange rate for each transfer is now locked at the time of creation. That’s your safeguard.'),
      p('Even if the Central Bank rate moves sharply, no hidden surcharge is charged to you.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/rate-lock.jpg',
    isPublished: true,
    publishedAt: ago(50, 10, 0),
    createdAt: ago(51, 13, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_015',
    titleUz: 'Ramazon oyi munosabati bilan',
    titleRu: 'К месяцу Рамадан',
    titleEn: 'Ramadan',
    bodyUz: body(
      p('Aziz mijozlar! Ramazon oyi munosabati bilan ZhiPay barcha musulmon birodarlarimizni tabriklaydi.'),
      p('Iftorlik vaqti komissiya 20% ga kamaytiriladi. Aksiya butun Ramazon oyi davomida amal qiladi.'),
    ),
    bodyRu: body(
      p('Дорогие клиенты! По случаю месяца Рамадан команда ZhiPay поздравляет всех мусульман.'),
      p('Во время ифтара комиссия снижается на 20%. Акция действует на протяжении всего месяца.'),
    ),
    bodyEn: body(
      p('Dear customers! On the occasion of the month of Ramadan, the ZhiPay team congratulates all Muslims.'),
      p('During iftar, the commission is reduced by 20%. The promotion runs throughout the entire month.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/ramadan.jpg',
    isPublished: true,
    publishedAt: ago(55, 9, 0),
    createdAt: ago(57, 11, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_016',
    titleUz: 'Mustaqillik bayramini tabriklaymiz',
    titleRu: 'С Днём независимости',
    titleEn: 'Happy Independence Day',
    bodyUz: body(
      p('1-sentyabr — O‘zbekiston Mustaqilligi kuni. ZhiPay jamoasi siz bilan birgalikda bu bayramni nishonlaydi.'),
      p('Bayram munosabati bilan barcha foydalanuvchilarga 5 000 so‘mlik bonus beriladi.'),
    ),
    bodyRu: body(
      p('1 сентября — День независимости Узбекистана. Команда ZhiPay вместе с вами отмечает этот праздник.'),
      p('В честь праздника всем пользователям начисляется бонус в размере 5 000 сум.'),
    ),
    bodyEn: body(
      p('September 1 is Independence Day of Uzbekistan. The ZhiPay team celebrates this holiday together with you.'),
      p('In honor of the holiday, all users receive a 5,000 UZS bonus.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/independence.jpg',
    isPublished: true,
    publishedAt: ago(60, 9, 0),
    createdAt: ago(62, 14, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_017',
    titleUz: 'Korxonalar uchun yangi tarif',
    titleRu: 'Новый тариф для бизнеса',
    titleEn: 'New tariff for business',
    bodyUz: body(
      p('Korporativ mijozlar uchun maxsus tarif joriy etildi. Oylik aylanma 10 000 AQSh dollaridan oshganda komissiya 0.3% gacha kamayadi.'),
      p('Tarifdan foydalanish uchun korxonangizni ZhiPay Business platformasida ro‘yxatdan o‘tkazing.'),
    ),
    bodyRu: body(
      p('Для корпоративных клиентов введён специальный тариф. При обороте более 10 000 долларов в месяц комиссия снижается до 0,3%.'),
      p('Чтобы воспользоваться тарифом, зарегистрируйте компанию в платформе ZhiPay Business.'),
    ),
    bodyEn: body(
      p('A special tariff has been introduced for corporate clients. With monthly turnover over $10,000, the commission drops to 0.3%.'),
      p('To use the tariff, register your company in the ZhiPay Business platform.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/business-tariff.jpg',
    isPublished: true,
    publishedAt: ago(65, 10, 30),
    createdAt: ago(66, 9, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: ago(65, 9, 45),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'news_018',
    titleUz: 'Hamkor banklar tarmog‘i kengaytirildi',
    titleRu: 'Расширена сеть банков-партнёров',
    titleEn: 'Partner bank network expanded',
    bodyUz: body(
      p('ZhiPay xizmati endi 5 ta yangi O‘zbekiston banki bilan ham ishlaydi. Hamkor banklar tarmog‘i 18 taga yetdi.'),
      p('Bu — muammosiz to‘lov uchun yanada ko‘proq imkoniyat va yuqori ishonchlilik degani.'),
    ),
    bodyRu: body(
      p('Сервис ZhiPay теперь работает с 5 новыми банками Узбекистана. Сеть банков-партнёров достигла 18.'),
      p('Это означает больше возможностей для бесперебойной оплаты и более высокую надёжность.'),
    ),
    bodyEn: body(
      p('ZhiPay now works with 5 additional Uzbek banks. The partner bank network now numbers 18.'),
      p('That means more options for seamless payments and higher reliability.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/banks-network.jpg',
    isPublished: true,
    publishedAt: ago(70, 11, 0),
    createdAt: ago(71, 13, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_019',
    titleUz: 'Yiwu bozori uchun maxsus rejim',
    titleRu: 'Специальный режим для рынка Иу',
    titleEn: 'Yiwu market — special mode',
    bodyUz: body(
      p('ZhiPay Yiwu bozorida xarid qiladigan tijoratchilar uchun “Trader” rejimini qo‘shdi. Rejim ko‘p qatorli o‘tkazmalarni qo‘llab-quvvatlaydi.'),
      ul([
        'Bir vaqtda 50 tagacha qabul qiluvchi',
        'Yagona ekran orqali tahrirlash',
        'CSV import qilish',
      ]),
    ),
    bodyRu: body(
      p('ZhiPay добавил режим «Trader» для торговцев, закупающихся на рынке Иу. Режим поддерживает многострочные переводы.'),
      ul([
        'До 50 получателей одновременно',
        'Редактирование через единый экран',
        'Импорт из CSV',
      ]),
    ),
    bodyEn: body(
      p('ZhiPay has added a "Trader" mode for merchants sourcing from the Yiwu market. The mode supports multi-line transfers.'),
      ul([
        'Up to 50 recipients at once',
        'Edit via a single screen',
        'CSV import',
      ]),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/yiwu-trader.jpg',
    isPublished: true,
    publishedAt: ago(75, 9, 0),
    createdAt: ago(77, 14, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_020',
    titleUz: 'Talabalar uchun chegirma',
    titleRu: 'Скидка для студентов',
    titleEn: 'Student discount',
    bodyUz: body(
      p('Talabalar uchun komissiya 50% ga kamaytirildi. Aksiyadan foydalanish uchun ID-kartani tasdiqlash kifoya.'),
    ),
    bodyRu: body(
      p('Для студентов комиссия снижена на 50%. Для участия в акции достаточно подтвердить студенческий билет.'),
    ),
    bodyEn: body(
      p('For students, the commission is cut by 50%. To take advantage of the promotion, simply confirm your student ID.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/students.jpg',
    isPublished: true,
    publishedAt: ago(82, 10, 0),
    createdAt: ago(83, 12, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_021',
    titleUz: 'Til sozlamalari qo‘shildi',
    titleRu: 'Добавлены настройки языка',
    titleEn: 'Language settings added',
    bodyUz: body(
      p('Endi ilova tilini sozlamalarda qo‘lda tanlash mumkin. Avtomatik aniqlashdan farqli o‘laroq, til parametri qurilmadan ajralgan holda saqlanadi.'),
    ),
    bodyRu: body(
      p('Теперь язык приложения можно выбрать вручную в настройках. В отличие от автоматического определения, параметр языка сохраняется отдельно от устройства.'),
    ),
    bodyEn: body(
      p('You can now manually select the app language in settings. Unlike automatic detection, the language preference is stored independently of the device.'),
    ),
    imageUrl: null,
    isPublished: true,
    publishedAt: ago(88, 11, 0),
    createdAt: ago(89, 9, 30),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_022',
    titleUz: 'Yangi xavfsizlik mexanizmlari',
    titleRu: 'Новые механизмы безопасности',
    titleEn: 'New security mechanisms',
    bodyUz: body(
      p('Hisobingizni himoya qilish uchun yana ikkita qatlam qo‘shildi: ikki bosqichli tasdiqlash (2FA) va qurilma ishonchi.'),
      h2('Sozlash uchun'),
      ul([
        'Sozlamalar → Xavfsizlik → 2FA',
        'Sozlamalar → Qurilmalar → Ishonchni qayta tiklash',
      ]),
    ),
    bodyRu: body(
      p('Для защиты вашего аккаунта добавлены ещё два слоя: двухфакторная аутентификация (2FA) и доверие устройств.'),
      h2('Для настройки'),
      ul([
        'Настройки → Безопасность → 2FA',
        'Настройки → Устройства → Сбросить доверие',
      ]),
    ),
    bodyEn: body(
      p('To protect your account, two more layers have been added: two-factor authentication (2FA) and device trust.'),
      h2('To configure'),
      ul([
        'Settings → Security → 2FA',
        'Settings → Devices → Reset trust',
      ]),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/security.jpg',
    isPublished: true,
    publishedAt: ago(93, 9, 30),
    createdAt: ago(94, 14, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_023',
    titleUz: 'ZhiPay 1 yoshda',
    titleRu: 'ZhiPay 1 год',
    titleEn: 'ZhiPay turns 1',
    bodyUz: body(
      p('Bir yil oldin biz birinchi o‘tkazmamizni amalga oshirdik. Bugun esa har kuni 50 000 dan ortiq foydalanuvchi xizmatdan foydalanmoqda.'),
      p('Sizning ishonchingiz — bizning eng katta yutug‘imiz. Rahmat!'),
    ),
    bodyRu: body(
      p('Год назад мы провели наш первый перевод. Сегодня сервисом пользуются более 50 000 человек ежедневно.'),
      p('Ваше доверие — наша главная победа. Спасибо!'),
    ),
    bodyEn: body(
      p('A year ago we processed our first transfer. Today the service is used by more than 50,000 people every day.'),
      p('Your trust is our greatest achievement. Thank you!'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/anniversary.jpg',
    isPublished: true,
    publishedAt: ago(100, 10, 0),
    createdAt: ago(102, 9, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },

  // -------------------------------------------------------------------
  // DRAFTS (4) — work-in-progress, not yet visible
  // -------------------------------------------------------------------
  {
    id: 'news_024',
    titleUz: 'Yangi yo‘nalish: Qozog‘istonga o‘tkazmalar',
    titleRu: 'Новое направление: переводы в Казахстан',
    titleEn: 'New corridor: transfers to Kazakhstan',
    bodyUz: body(
      p('Tez kunda ZhiPay foydalanuvchilari Qozog‘istonga to‘g‘ridan-to‘g‘ri o‘tkazma yuborish imkoniyatiga ega bo‘lishadi.'),
      p('Hozirda integratsiya bosqichi davom etmoqda. Batafsil ma’lumot keyinchalik e’lon qilinadi.'),
    ),
    bodyRu: body(
      p('Совсем скоро пользователи ZhiPay смогут отправлять переводы напрямую в Казахстан.'),
      p('В настоящее время идёт этап интеграции. Подробности будут объявлены позже.'),
    ),
    bodyEn: body(
      p('Soon ZhiPay users will be able to send transfers directly to Kazakhstan.'),
      p('Integration is currently under way. Details will be announced later.'),
    ),
    imageUrl: 'https://cdn.zhipay.uz/news/kz-corridor-draft.jpg',
    isPublished: false,
    publishedAt: null,
    createdAt: ago(1, 10, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: ago(0, 14, 30),
    lastEditedBy: SUPER_ADMIN.name,
  },
  {
    id: 'news_025',
    titleUz: 'Yangi qabul qiluvchilar ekrani — yopiq beta',
    titleRu: 'Новый экран получателей — закрытая бета',
    titleEn: 'New recipients screen — closed beta',
    bodyUz: body(
      p('Tez orada qabul qiluvchilar ekrani jiddiy yangilanadi: avtomatik tanlov, takroriy o‘tkazma uchun yorliq, izlash.'),
      p('Hozirgi paytda yopiq beta-test bosqichida.'),
    ),
    bodyRu: body(
      p('Скоро экран получателей серьёзно обновится: автоподбор, ярлык повторного перевода, поиск.'),
      p('Сейчас идёт закрытое бета-тестирование.'),
    ),
    bodyEn: body(
      p('The recipients screen is about to receive a major update: smart selection, repeat-transfer shortcut, search.'),
      p('Currently in closed beta.'),
    ),
    imageUrl: null,
    isPublished: false,
    publishedAt: null,
    createdAt: ago(4, 13, 0),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: ago(2, 11, 0),
    lastEditedBy: FINANCE_ADMIN.name,
  },
  {
    id: 'news_026',
    titleUz: 'Hamkorlik dasturi haqida',
    titleRu: 'О партнёрской программе',
    titleEn: 'About the referral program',
    bodyUz: body(
      p('Do‘stingizni ZhiPayga taklif qiling va ikkala tomon ham bonus oladi. Dastur sharoitlari yakuniy bosqichda muhokama qilinmoqda.'),
    ),
    bodyRu: body(
      p('Пригласите друга в ZhiPay, и оба получите бонус. Условия программы находятся в финальной стадии обсуждения.'),
    ),
    bodyEn: body(
      p('Invite a friend to ZhiPay and both sides receive a bonus. Program terms are in the final discussion phase.'),
    ),
    imageUrl: null,
    isPublished: false,
    publishedAt: null,
    createdAt: ago(6, 9, 0),
    createdBy: SUPER_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
  {
    id: 'news_027',
    titleUz: 'Audit hisobotlari haqida e’lon',
    titleRu: 'Анонс аудиторских отчётов',
    titleEn: 'Audit reports announcement',
    bodyUz: body(
      p('Yaqin oylarda ZhiPay xalqaro audit hisobotini e’lon qiladi. Bu — mijozlarimiz uchun shaffoflikning muhim qadami.'),
    ),
    bodyRu: body(
      p('В ближайшие месяцы ZhiPay опубликует отчёт международного аудита. Это важный шаг к прозрачности для наших клиентов.'),
    ),
    bodyEn: body(
      p('In the coming months, ZhiPay will publish an international audit report. It’s an important step toward transparency for our customers.'),
    ),
    imageUrl: null,
    isPublished: false,
    publishedAt: null,
    createdAt: ago(11, 10, 30),
    createdBy: FINANCE_ADMIN.name,
    lastEditedAt: null,
    lastEditedBy: null,
  },
];

// =====================================================================
// Helpers
// =====================================================================

export function getStatus(item: News): NewsStatus {
  return item.isPublished ? 'published' : 'draft';
}

export function listNews(): News[] {
  return [...NEWS];
}

export function getNews(id: string): News | undefined {
  return NEWS.find((n) => n.id === id);
}

/**
 * Default sort:
 *   - drafts first, by createdAt DESC
 *   - then published, by publishedAt DESC
 */
export function defaultNewsSort(rows: News[]): News[] {
  return [...rows].sort((a, b) => {
    if (a.isPublished !== b.isPublished) return a.isPublished ? 1 : -1;
    if (!a.isPublished && !b.isPublished) {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    const aT = a.publishedAt?.getTime() ?? 0;
    const bT = b.publishedAt?.getTime() ?? 0;
    return bT - aT;
  });
}

export function getDistinctEditors(): string[] {
  const set = new Set<string>();
  for (const n of NEWS) {
    set.add(n.createdBy);
    if (n.lastEditedBy) set.add(n.lastEditedBy);
  }
  return Array.from(set).sort();
}

export function countByStatus(): Record<NewsStatus, number> {
  let published = 0;
  let draft = 0;
  for (const n of NEWS) {
    if (n.isPublished) published++;
    else draft++;
  }
  return { published, draft };
}

// =====================================================================
// Mutators — all emit a single audit row
// =====================================================================

export type NewsAuditAction = 'add' | 'edit' | 'publish' | 'unpublish' | 'delete';

export interface NewsAuditEntry {
  id: string;
  newsId: string;
  action: NewsAuditAction;
  actorId: string;
  actorName: string;
  reason: string;
  /** Snapshot at the moment of the action — read-stable even if the row is later deleted. */
  snapshot: {
    titleEn: string;
    isPublished: boolean;
    publishedAt: Date | null;
    hasImage: boolean;
  };
  /** Per-field previous values for `edit` (changed fields only). */
  previous?: Record<string, unknown>;
  createdAt: Date;
}

const NEWS_AUDIT: NewsAuditEntry[] = [];
let auditSeq = 1;
function nextAuditId(): string {
  return `news_audit_${String(auditSeq++).padStart(4, '0')}`;
}

let newsSeq = NEWS.length + 1;
function nextNewsId(): string {
  return `news_${String(newsSeq++).padStart(3, '0')}`;
}

interface MutatorActor {
  id: string;
  name: string;
}

const DEFAULT_ACTOR: MutatorActor = SUPER_ADMIN;

function snapshotOf(n: News): NewsAuditEntry['snapshot'] {
  return {
    titleEn: n.titleEn,
    isPublished: n.isPublished,
    publishedAt: n.publishedAt,
    hasImage: n.imageUrl != null,
  };
}

export interface AddNewsInput {
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  imageUrl: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
}

export function addNews(input: AddNewsInput, actor: MutatorActor = DEFAULT_ACTOR): News {
  const item: News = {
    id: nextNewsId(),
    titleUz: input.titleUz,
    titleRu: input.titleRu,
    titleEn: input.titleEn,
    bodyUz: input.bodyUz,
    bodyRu: input.bodyRu,
    bodyEn: input.bodyEn,
    imageUrl: input.imageUrl,
    isPublished: input.isPublished,
    publishedAt: input.isPublished ? input.publishedAt ?? new Date() : null,
    createdAt: new Date(),
    createdBy: actor.name,
    lastEditedAt: null,
    lastEditedBy: null,
  };
  NEWS.unshift(item);
  NEWS_AUDIT.unshift({
    id: nextAuditId(),
    newsId: item.id,
    action: 'add',
    actorId: actor.id,
    actorName: actor.name,
    reason: '',
    snapshot: snapshotOf(item),
    createdAt: item.createdAt,
  });
  return item;
}

export interface EditNewsInput {
  id: string;
  titleUz: string;
  titleRu: string;
  titleEn: string;
  bodyUz: string;
  bodyRu: string;
  bodyEn: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  /** Required when editing an already-published article. Drafts may pass ''. */
  reason: string;
}

export function editNews(input: EditNewsInput, actor: MutatorActor = DEFAULT_ACTOR): News {
  const idx = NEWS.findIndex((n) => n.id === input.id);
  if (idx < 0) throw new Error(`News not found: ${input.id}`);
  const before = NEWS[idx];
  const requireReason = before.isPublished;
  if (requireReason && input.reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters when editing a published article.');
  }
  const previous: Record<string, unknown> = {};
  if (before.titleEn !== input.titleEn) previous.titleEn = before.titleEn;
  if (before.titleUz !== input.titleUz) previous.titleUz = before.titleUz;
  if (before.titleRu !== input.titleRu) previous.titleRu = before.titleRu;
  if (before.bodyEn !== input.bodyEn) previous.bodyEn = '<changed>';
  if (before.bodyUz !== input.bodyUz) previous.bodyUz = '<changed>';
  if (before.bodyRu !== input.bodyRu) previous.bodyRu = '<changed>';
  if (before.imageUrl !== input.imageUrl) previous.imageUrl = before.imageUrl;
  if ((before.publishedAt?.getTime() ?? null) !== (input.publishedAt?.getTime() ?? null)) {
    previous.publishedAt = before.publishedAt;
  }
  const updated: News = {
    ...before,
    titleUz: input.titleUz,
    titleRu: input.titleRu,
    titleEn: input.titleEn,
    bodyUz: input.bodyUz,
    bodyRu: input.bodyRu,
    bodyEn: input.bodyEn,
    imageUrl: input.imageUrl,
    publishedAt: input.publishedAt,
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  NEWS[idx] = updated;
  NEWS_AUDIT.unshift({
    id: nextAuditId(),
    newsId: updated.id,
    action: 'edit',
    actorId: actor.id,
    actorName: actor.name,
    reason: input.reason.trim(),
    snapshot: snapshotOf(updated),
    previous,
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

export function publishNews(id: string, actor: MutatorActor = DEFAULT_ACTOR): News {
  const idx = NEWS.findIndex((n) => n.id === id);
  if (idx < 0) throw new Error(`News not found: ${id}`);
  const before = NEWS[idx];
  const updated: News = {
    ...before,
    isPublished: true,
    publishedAt: before.publishedAt ?? new Date(),
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  NEWS[idx] = updated;
  NEWS_AUDIT.unshift({
    id: nextAuditId(),
    newsId: updated.id,
    action: 'publish',
    actorId: actor.id,
    actorName: actor.name,
    reason: '',
    snapshot: snapshotOf(updated),
    previous: {
      isPublished: before.isPublished,
      publishedAt: before.publishedAt,
    },
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

export function unpublishNews(id: string, reason: string, actor: MutatorActor = DEFAULT_ACTOR): News {
  const idx = NEWS.findIndex((n) => n.id === id);
  if (idx < 0) throw new Error(`News not found: ${id}`);
  if (reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters.');
  }
  const before = NEWS[idx];
  const updated: News = {
    ...before,
    isPublished: false,
    lastEditedAt: new Date(),
    lastEditedBy: actor.name,
  };
  NEWS[idx] = updated;
  NEWS_AUDIT.unshift({
    id: nextAuditId(),
    newsId: updated.id,
    action: 'unpublish',
    actorId: actor.id,
    actorName: actor.name,
    reason: reason.trim(),
    snapshot: snapshotOf(updated),
    previous: { isPublished: true },
    createdAt: updated.lastEditedAt!,
  });
  return updated;
}

export function deleteNews(id: string, reason: string, actor: MutatorActor = DEFAULT_ACTOR): News {
  const idx = NEWS.findIndex((n) => n.id === id);
  if (idx < 0) throw new Error(`News not found: ${id}`);
  if (reason.trim().length < 20) {
    throw new Error('Reason must be at least 20 characters.');
  }
  const before = NEWS[idx];
  NEWS.splice(idx, 1);
  NEWS_AUDIT.unshift({
    id: nextAuditId(),
    newsId: before.id,
    action: 'delete',
    actorId: actor.id,
    actorName: actor.name,
    reason: reason.trim(),
    snapshot: snapshotOf(before),
    createdAt: new Date(),
  });
  return before;
}

export function listNewsAudit(): NewsAuditEntry[] {
  return [...NEWS_AUDIT];
}
