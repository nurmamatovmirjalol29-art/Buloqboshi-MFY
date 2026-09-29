/* ============================================================
   BULOQBOSHI MAHALLA SAYTI — asosiy skript
   ============================================================ */

/* ---------- 0. TILLAR (I18N) ---------- */

const LANG_KEY = "buloqboshi_lang";
let currentLang = localStorage.getItem(LANG_KEY) || "uz";
let currentFilter = "all";
let cachedStories = [];

const OYLAR = {
  uz:  ["yanvar","fevral","mart","aprel","may","iyun","iyul","avgust","sentabr","oktabr","noyabr","dekabr"],
  uzc: ["январ","феврал","март","апрел","май","июн","июл","август","сентябр","октябр","ноябр","декабр"],
  ru:  ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],
  en:  ["January","February","March","April","May","June","July","August","September","October","November","December"]
};

const TUR_NOMLARI = {
  uz:  { ilm:"Ilm maskani", ibodat:"Ibodat", tibbiyot:"Tibbiyot", dam:"Dam olish", savdo:"Savdo", tabiat:"Tabiat", hokimiyat:"Hokimiyat" },
  uzc: { ilm:"Илм маскани", ibodat:"Ибодат", tibbiyot:"Тиббиёт", dam:"Дам олиш", savdo:"Савдо", tabiat:"Табиат", hokimiyat:"Ҳокимият" },
  ru:  { ilm:"Образование", ibodat:"Религия", tibbiyot:"Медицина", dam:"Отдых", savdo:"Торговля", tabiat:"Природа", hokimiyat:"Управление" },
  en:  { ilm:"Education", ibodat:"Worship", tibbiyot:"Healthcare", dam:"Leisure", savdo:"Shopping", tabiat:"Nature", hokimiyat:"Administration" }
};

const I18N = {
  uz: {
    nav_home:"Bosh sahifa", nav_map:"Xarita", nav_places:"Joylar", nav_gallery:"Lavhalar", nav_cta:"Hikoya qo'shish",
    hero_eyebrow:"Nurobod tumani, Buloqboshi MFY",
    hero_title_1:"Bizning mahalla,", hero_title_2:"bizning hikoya.",
    hero_lead:"Buloqboshi — odamlar bir-birini ismi bilan taniydigan, har bir ko'cha o'z xotirasiga ega bo'lgan qadrdon maskan.",
    hero_btn_places:"Joylarga sayohat", hero_btn_story:"Hikoya qo'shish",
    hero_stat_places:"qadrli maskan", hero_stat_years:"yillik tarix", hero_stat_memories:"xotira yozilgan",
    hero_card_title:"Buloq", hero_card_text:"Mahalla nomi shu chashmadan kelib chiqqan",
    map_eyebrow:"Mahalla xaritasi", map_title:"Bu yerda hayot bor.",
    map_sub:"Qayerda choy ichiladi, qayerda bolalar o'ynaydi — barchasini birga topamiz.",
    places_eyebrow:"Joylar va manzillar", places_title:"Mahallamizning yuragi",
    filter_all:"Barchasi",
    gallery_eyebrow:"So'nggi lavhalar", gallery_title:"Xotiralar albomi",
    gallery_sub:"Mahalla hayotidan yorqin lahzalar.",
    gallery_empty_title:"Hozircha hikoyalar yo'q.", gallery_empty_sub:"Birinchi bo'lib xotirangizni qoldiring!",
    cards_empty:"Bu turkumda hozircha joy yo'q.",
    story_eyebrow:"Sizning xotirangiz", story_title:"Shu mahallaga tegishli.",
    story_lead:"Bir surat, bir voqea yoki oddiygina yaxshi so'z — Buloqboshi tarixining yangi sahifasi.",
    story_li1:"Ismingizni qoldiring", story_li2:"Rasm tanlang (galereyadan)", story_li3:"Xotirani yozing", story_li4:"Moderatsiyadan keyin saytda chiqadi",
    form_label_name:"Ismingiz *", form_placeholder_name:"Masalan: Mirjalol",
    form_label_email:"Email (ixtiyoriy)", form_placeholder_email:"siz@misol.uz",
    form_label_memory:"Xotirangiz *", form_placeholder_memory:"Bolaligimda bu yerda...",
    form_label_photo:"Rasm (ixtiyoriy)",
    form_submit:"Hikoyani yuborish", form_submit_sending:"Yuborilmoqda...",
    form_note:"Yuborilgach, moderator tasdiqlagach saytda chiqadi.",
    err_name:"Ism kamida 2 harf bo'lishi kerak", err_email:"Email formati noto'g'ri",
    err_memory:"Xotira kamida 10 belgi bo'lishi kerak", err_photo:"Rasm hajmi 5 MB dan oshmasin",
    footer_sections:"Bo'limlar", footer_contact:"Aloqa", footer_telegram:"Telegram kanal",
    footer_rights:"Barcha huquqlar himoyalangan."
  },
  uzc: {
    nav_home:"Бош сахифа", nav_map:"Харита", nav_places:"Жойлар", nav_gallery:"Лавҳалар", nav_cta:"Ҳикоя қўшиш",
    hero_eyebrow:"Нуробод тумани, Булоқбоши МФЙ",
    hero_title_1:"Бизнинг маҳалла,", hero_title_2:"бизнинг ҳикоя.",
    hero_lead:"Булоқбоши — одамлар бир-бирини исми билан танийдиган, ҳар бир кўча ўз хотирасига эга бўлган қадрдон маскан.",
    hero_btn_places:"Жойларга саёҳат", hero_btn_story:"Ҳикоя қўшиш",
    hero_stat_places:"қадрли маскан", hero_stat_years:"йиллик тарих", hero_stat_memories:"хотира ёзилган",
    hero_card_title:"Булоқ", hero_card_text:"Маҳалла номи шу чашмадан келиб чиққан",
    map_eyebrow:"Маҳалла харитаси", map_title:"Бу ерда ҳаёт бор.",
    map_sub:"Қаерда чой ичилади, қаерда болалар ўйнайди — барчасини бирга топамиз.",
    places_eyebrow:"Жойлар ва манзиллар", places_title:"Маҳалламизнинг юраги",
    filter_all:"Барчаси",
    gallery_eyebrow:"Сўнгги лавҳалар", gallery_title:"Хотиралар альбоми",
    gallery_sub:"Маҳалла ҳаётидан ёрқин лаҳзалар.",
    gallery_empty_title:"Ҳозирча ҳикоялар йўқ.", gallery_empty_sub:"Биринчи бўлиб хотирангизни қолдиринг!",
    cards_empty:"Бу туркумда ҳозирча жой йўқ.",
    story_eyebrow:"Сизнинг хотирангиз", story_title:"Шу маҳаллага тегишли.",
    story_lead:"Бир сурат, бир воқеа ёки оддийгина яхши сўз — Булоқбоши тарихининг янги саҳифаси.",
    story_li1:"Исмингизни қолдиринг", story_li2:"Расм танланг (галереядан)", story_li3:"Хотирани ёзинг", story_li4:"Модерациядан кейин сайтда чиқади",
    form_label_name:"Исмингиз *", form_placeholder_name:"Мисол учун: Миржалол",
    form_label_email:"Email (ихтиёрий)", form_placeholder_email:"siz@misol.uz",
    form_label_memory:"Хотирангиз *", form_placeholder_memory:"Болалигимда бу ерда...",
    form_label_photo:"Расм (ихтиёрий)",
    form_submit:"Ҳикояни юбориш", form_submit_sending:"Юборилмоқда...",
    form_note:"Юборилгач, модератор тасдиқлагач сайтда чиқади.",
    err_name:"Исм камида 2 ҳарф бўлиши керак", err_email:"Email формати нотўғри",
    err_memory:"Хотира камида 10 белги бўлиши керак", err_photo:"Расм ҳажми 5 МБ дан ошмасин",
    footer_sections:"Бўлимлар", footer_contact:"Алоқа", footer_telegram:"Telegram канали",
    footer_rights:"Барча ҳуқуқлар ҳимояланган."
  },
  ru: {
    nav_home:"Главная", nav_map:"Карта", nav_places:"Места", nav_gallery:"Моменты", nav_cta:"Добавить историю",
    hero_eyebrow:"Нурабадский район, махалля Булокбоши",
    hero_title_1:"Наша махалля —", hero_title_2:"наша история.",
    hero_lead:"Булокбоши — родной уголок, где люди знают друг друга по именам, а у каждой улицы есть своя память.",
    hero_btn_places:"Путешествие по местам", hero_btn_story:"Добавить историю",
    hero_stat_places:"памятных мест", hero_stat_years:"лет истории", hero_stat_memories:"историй записано",
    hero_card_title:"Родник", hero_card_text:"Название махалли произошло от этого родника",
    map_eyebrow:"Карта махалли", map_title:"Здесь кипит жизнь.",
    map_sub:"Где пьют чай, где играют дети — узнаем всё вместе.",
    places_eyebrow:"Места и адреса", places_title:"Сердце нашей махалли",
    filter_all:"Все",
    gallery_eyebrow:"Последние моменты", gallery_title:"Альбом воспоминаний",
    gallery_sub:"Яркие моменты жизни махалли.",
    gallery_empty_title:"Историй пока нет.", gallery_empty_sub:"Станьте первым, кто поделится воспоминанием!",
    cards_empty:"В этой категории пока нет мест.",
    story_eyebrow:"Ваше воспоминание", story_title:"Это часть нашей махалли.",
    story_lead:"Одна фотография, одно событие или просто доброе слово могут стать новой страницей истории.",
    story_li1:"Укажите своё имя", story_li2:"Выберите фото (из галереи)", story_li3:"Напишите воспоминание", story_li4:"Появится на сайте после модерации",
    form_label_name:"Ваше имя *", form_placeholder_name:"Например: Мирджалол",
    form_label_email:"Email (необязательно)", form_placeholder_email:"you@example.uz",
    form_label_memory:"Ваше воспоминание *", form_placeholder_memory:"В детстве здесь...",
    form_label_photo:"Фото (необязательно)",
    form_submit:"Отправить историю", form_submit_sending:"Отправка...",
    form_note:"После отправки появится на сайте, когда модератор подтвердит.",
    err_name:"Имя должно содержать минимум 2 буквы", err_email:"Неверный формат email",
    err_memory:"Текст должен содержать минимум 10 символов", err_photo:"Размер фото не должен превышать 5 МБ",
    footer_sections:"Разделы", footer_contact:"Контакты", footer_telegram:"Telegram-канал",
    footer_rights:"Все права защищены."
  },
  en: {
    nav_home:"Home", nav_map:"Map", nav_places:"Places", nav_gallery:"Moments", nav_cta:"Add a story",
    hero_eyebrow:"Nurabad district, Buloqboshi neighborhood",
    hero_title_1:"Our neighborhood,", hero_title_2:"our story.",
    hero_lead:"Buloqboshi is a place where people know each other by name, and every street holds its own memory.",
    hero_btn_places:"Explore places", hero_btn_story:"Add a story",
    hero_stat_places:"cherished places", hero_stat_years:"years of history", hero_stat_memories:"memories shared",
    hero_card_title:"The Spring", hero_card_text:"The neighborhood's name comes from this very spring",
    map_eyebrow:"Neighborhood map", map_title:"Life happens here.",
    map_sub:"Where tea is poured, where children play — let's find it all together.",
    places_eyebrow:"Places & addresses", places_title:"The heart of our neighborhood",
    filter_all:"All",
    gallery_eyebrow:"Latest moments", gallery_title:"Album of memories",
    gallery_sub:"Bright moments from neighborhood life.",
    gallery_empty_title:"No stories yet.", gallery_empty_sub:"Be the first to share your memory!",
    cards_empty:"No places in this category yet.",
    story_eyebrow:"Your memory", story_title:"It belongs to this neighborhood.",
    story_lead:"A single photo, a moment, or just a kind word can become a new page in Buloqboshi's story.",
    story_li1:"Leave your name", story_li2:"Choose a photo (optional)", story_li3:"Write your memory", story_li4:"It appears on the site after moderation",
    form_label_name:"Your name *", form_placeholder_name:"e.g. Mirjalol",
    form_label_email:"Email (optional)", form_placeholder_email:"you@example.com",
    form_label_memory:"Your memory *", form_placeholder_memory:"When I was a child here...",
    form_label_photo:"Photo (optional)",
    form_submit:"Submit story", form_submit_sending:"Sending...",
    form_note:"It will appear on the site once a moderator approves it.",
    err_name:"Name must be at least 2 characters", err_email:"Invalid email format",
    err_memory:"Memory must be at least 10 characters", err_photo:"Photo size must not exceed 5 MB",
    footer_sections:"Sections", footer_contact:"Contact", footer_telegram:"Telegram channel",
    footer_rights:"All rights reserved."
  }
};

function t(key){
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.uz[key] || key;
}

function pickI18n(field){
  if (field && typeof field === "object") {
    return field[currentLang] || field.uz || "";
  }
  return field || "";
}

function applyLanguage(lang){
  currentLang = I18N[lang] ? lang : "uz";
  localStorage.setItem(LANG_KEY, currentLang);
  document.documentElement.lang = currentLang === "uzc" ? "uz" : currentLang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-tur]").forEach(el => {
    const key = el.dataset.i18nTur;
    el.textContent = (TUR_NOMLARI[currentLang] && TUR_NOMLARI[currentLang][key]) || key;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll(".lang-btn").forEach(b => {
    b.classList.toggle("is-active", b.dataset.lang === currentLang);
  });

  renderCards(currentFilter);
  renderGallery(cachedStories);
}

document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

/* ---------- 1. MA'LUMOTLAR ---------- */

const JOYLAR = [
  {
    nom: { uz:"Buloqboshi MFY", uzc:"Булоқбоши МФЙ", ru:"Махалля Булокбоши", en:"Buloqboshi Neighborhood Council" },
    turi: "hokimiyat",
    tavsif: { uz:"Mahalla fuqarolar yig'ini — mahallamizning markazi.", uzc:"Маҳалла фуқаролар йиғини — маҳалламизнинг маркази.", ru:"Сход граждан махалли — административный центр.", en:"The citizens' assembly — the administrative center." },
    manzil: { uz:"Buloqboshi MFY, Nurobod tumani", uzc:"Булоқбоши МФЙ, Нуробод тумани", ru:"Махалля Булокбоши, Нурабадский район", en:"Buloqboshi MFY, Nurabad district" },
    lat: 39.648472, lng: 65.976070,
    rasm: "https://i.imgur.com/41Y3Y0M.jpeg"
  },
  {
    nom: { uz:"Bog'cha", uzc:"Боғча", ru:"Детский сад", en:"Kindergarten" },
    turi: "ilm",
    tavsif: { uz:"Yangi qurilgan zamonaviy bog'cha.", uzc:"Янги қурилган замонавий боғча.", ru:"Новый современный детский сад.", en:"A newly built modern kindergarten." },
    manzil: { uz:"Mahalla idorasi yonida", uzc:"Маҳалла идораси ёнида", ru:"Рядом с управлением махалли", en:"Next to the neighborhood office" },
    lat: 39.648230, lng: 65.976119,
    rasm: "https://i.imgur.com/vXuCKnD.jpeg"
  },
  {
    nom: { uz:"Oilaviy poliklinika", uzc:"Оилавий поликлиника", ru:"Семейная поликлиника", en:"Family Clinic" },
    turi: "tibbiyot",
    tavsif: { uz:"Yangi qurilgan zamonaviy poliklinika.", uzc:"Янги қурилган замонавий поликлиника.", ru:"Новая современная поликлиника.", en:"A modern new clinic." },
    manzil: { uz:"Mahalla idorasi yonida", uzc:"Маҳалла идораси ёнида", ru:"Рядом с управлением махалли", en:"Next to the neighborhood office" },
    lat: 39.648987, lng: 65.976482,
    rasm: "https://i.imgur.com/pY2cTOp.jpeg"
  },
  {
    nom: { uz:"Tez tibbiy yordam", uzc:"Тез тиббий ёрдам", ru:"Скорая помощь", en:"Emergency Services" },
    turi: "tibbiyot",
    tavsif: { uz:"Shoshilinch tibbiy yordam punkti.", uzc:"Шошилинч тиббий ёрдам пункти.", ru:"Пункт неотложной медицинской помощи.", en:"An emergency care point." },
    manzil: { uz:"Poliklinika yonida", uzc:"Поликлиника ёнида", ru:"Рядом с поликлиникой", en:"Next to the clinic" },
    lat: 39.649050, lng: 65.976550,
    rasm: "https://i.imgur.com/AerrKbW.jpeg"
  },
  {
    nom: { uz:"53-maktab", uzc:"53-мактаб", ru:"Школа №53", en:"School No. 53" },
    turi: "ilm",
    tavsif: { uz:"Mahallamizning asosiy ilm maskani.", uzc:"Маҳалламизнинг асосий илм маскани.", ru:"Главный образовательный центр.", en:"The main center of learning." },
    manzil: { uz:"Buloqboshi MFY", uzc:"Булоқбоши МФЙ", ru:"Махалля Булокбоши", en:"Buloqboshi MFY" },
    lat: 39.649962, lng: 65.974575,
    rasm: "https://i.imgur.com/ecqkRL0.jpeg"
  },
  {
    nom: { uz:"Futbol maydoni", uzc:"Футбол майдони", ru:"Футбольное поле", en:"Football Field" },
    turi: "dam",
    tavsif: { uz:"Bolalar va yoshlar uchun sport maydoni.", uzc:"Болалар ва ёшлар учун спорт майдони.", ru:"Спортивная площадка для детей и молодёжи.", en:"A sports field for children and youth." },
    manzil: { uz:"53-maktab yonida", uzc:"53-мактаб ёнида", ru:"Рядом со школой №53", en:"Next to School No. 53" },
    lat: 39.650564, lng: 65.973327,
    rasm: "https://i.imgur.com/xZK5kPa.jpeg"
  },
  {
    nom: { uz:"Do'kon", uzc:"Дўкон", ru:"Магазин", en:"Shop" },
    turi: "savdo",
    tavsif: { uz:"Mahalladagi asosiy savdo nuqtasi.", uzc:"Маҳалладаги асосий савдо нуқтаси.", ru:"Главная торговая точка махалли.", en:"The neighborhood's main store." },
    manzil: { uz:"Mahalla markazi", uzc:"Маҳалла маркази", ru:"Центр махалли", en:"Neighborhood center" },
    lat: 39.648448, lng: 65.977917,
    rasm: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80"
  },
  {
    nom: { uz:"Ziyod bobo to'ylar maskani", uzc:"Зиёд бобо тўйлар маскани", ru:"Той-зал «Зиёд бобо»", en:"Ziyod Bobo Celebration Hall" },
    turi: "dam",
    tavsif: { uz:"To'y va tantanalar o'tkaziladigan maskan.", uzc:"Тўй ва тантаналар ўтказиладиган маскан.", ru:"Место для свадеб и торжеств.", en:"A venue for weddings and celebrations." },
    manzil: { uz:"Buloqboshi MFY", uzc:"Булоқбоши МФЙ", ru:"Махалля Булокбоши", en:"Buloqboshi MFY" },
    lat: 39.646347, lng: 65.974989,
    rasm: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80"
  },
  {
    nom: { uz:"Qishloq masjidi", uzc:"Қишлоқ масжиди", ru:"Сельская мечеть", en:"Village Mosque" },
    turi: "ibodat",
    tavsif: { uz:"Mahallamizning qadimiy masjidi.", uzc:"Маҳалламизнинг қадимий масжиди.", ru:"Старинная мечеть нашей махалли.", en:"Our neighborhood's historic mosque." },
    manzil: { uz:"Buloqboshi MFY, shimoliy qismi", uzc:"Булоқбоши МФЙ, шимолий қисми", ru:"Махалля Булокбоши, северная часть", en:"Buloqboshi MFY, northern part" },
    lat: 39.655557, lng: 65.978160,
    rasm: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80"
  },
  {
    nom: { uz:"Buloq (chashma)", uzc:"Булоқ (чашма)", ru:"Родник (Булок)", en:"The Spring" },
    turi: "tabiat",
    tavsif: { uz:"Mahalla nomi shu buloqdan kelib chiqqan.", uzc:"Маҳалла номи шу булоқдан келиб чиққан.", ru:"Название махалли произошло от этого родника.", en:"The neighborhood is named after this spring." },
    manzil: { uz:"Qishloq chekkasi", uzc:"Қишлоқ чеккаси", ru:"Окраина села", en:"Edge of the village" },
    lat: 39.657133, lng: 65.982137,
    rasm: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800&q=80"
  }
];

/* ---------- 2. SANALARNI FORMATLASH ---------- */

function sanaFormat(iso){
  const oylar = OYLAR[currentLang] || OYLAR.uz;
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  if (currentLang === "ru") return `${d.getDate()} ${oylar[d.getMonth()]} ${d.getFullYear()}`;
  return `${d.getDate()} ${oylar[d.getMonth()]}, ${d.getFullYear()}`;
}

/* ---------- 3. NAVIGATSIYA ---------- */

const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");

if(nav && burger && navLinks){
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 20);
  });

  burger.addEventListener("click", () => {
    burger.classList.toggle("is-open");
    navLinks.classList.toggle("is-open");
  });

  navLinks.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      burger.classList.remove("is-open");
      navLinks.classList.remove("is-open");
    });
  });
}

/* ---------- 4. JOYLAR KARTALARI + FILTR ---------- */

const cardsEl = document.getElementById("cards");
const filtersEl = document.getElementById("filters");

function cardHTML(j){
  const nom = pickI18n(j.nom);
  const tavsif = pickI18n(j.tavsif);
  const manzil = pickI18n(j.manzil);
  const turLabel = (TUR_NOMLARI[currentLang] && TUR_NOMLARI[currentLang][j.turi]) || j.turi;

  const rasmBlok = j.rasm
    ? `<a href="${j.rasm}" class="glightbox" data-gallery="joylar">
         <div class="card__img" style="background-image:url('${j.rasm}')">
           <span class="card__tag">${turLabel}</span>
         </div>
       </a>`
    : `<div class="card__img">
         <span class="card__tag">${turLabel}</span>
       </div>`;

  return `
    <article class="card" data-tur="${j.turi}">
      ${rasmBlok}
      <div class="card__body">
        <h3 class="card__title">${nom}</h3>
        <p class="card__desc">${tavsif}</p>
        <div class="card__addr">${manzil}</div>
      </div>
    </article>
  `;
}

function renderCards(filter = "all"){
  if(!cardsEl) return;
  currentFilter = filter;
  const list = filter === "all"
    ? JOYLAR
    : JOYLAR.filter(j => j.turi === filter);

  cardsEl.innerHTML = list.map(cardHTML).join("");

  if(list.length === 0){
    cardsEl.innerHTML = `<p style="color:var(--ink-soft);grid-column:1/-1;text-align:center;padding:40px 0">
      ${t("cards_empty")}
    </p>`;
  }

  refreshLightbox();
}

if(filtersEl){
  filtersEl.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if(!chip) return;
    filtersEl.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderCards(chip.dataset.filter);
  });
}

/* ---------- 5. LAVHALAR ---------- */

const galleryEl = document.getElementById("gallery");

function postHTML(p){
  const rasmBlok = p.rasm
    ? `<a href="${p.rasm}" class="glightbox" data-gallery="lavhalar">
         <div class="post__img" style="background-image:url('${p.rasm}')"></div>
       </a>`
    : `<div class="post__img"></div>`;

  return `
    <article class="post">
      ${rasmBlok}
      <div class="post__body">
        <h3 class="post__title">${p.sarlavha}</h3>
        <p class="post__text">${p.matn}</p>
        <div class="post__meta">
          <span>${p.muallif}</span>
          <span>${sanaFormat(p.sana)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderGallery(serverStories){
  if(!galleryEl) return;

  if(!serverStories || serverStories.length === 0){
    galleryEl.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--ink-soft)">
        <p style="font-size:3rem;margin-bottom:16px">📖</p>
        <p style="font-size:1.1rem">${t("gallery_empty_title")}</p>
        <p style="margin-top:8px">${t("gallery_empty_sub")}</p>
      </div>
    `;
    const statEl = document.getElementById("statXotira");
    if(statEl) statEl.textContent = "0";
    return;
  }

  const serverPosts = serverStories.map(s => ({
    sarlavha: s.ism,
    matn: s.matn,
    muallif: s.ism,
    sana: s.sana.slice(0, 10),
    rasm: s.rasm || ""
  }));

  galleryEl.innerHTML = serverPosts.map(postHTML).join("");

  const statEl = document.getElementById("statXotira");
  if(statEl) statEl.textContent = serverStories.length;

  refreshLightbox();
}

/* ---------- Lightbox ---------- */

let lightboxInstance = null;

function refreshLightbox(){
  if (typeof GLightbox === "undefined") return;
  if (lightboxInstance && lightboxInstance.destroy) {
    lightboxInstance.destroy();
  }
  lightboxInstance = GLightbox({
    selector: ".glightbox",
    touchNavigation: true,
    loop: true,
    zoomable: true,
    draggable: true
  });
}

/* ---------- 6. HIKOYA FORMASI ---------- */

const form = document.getElementById("form");
const formOk = document.getElementById("formOk");
const formErr = document.getElementById("formErr");
const submitBtn = document.getElementById("submitBtn");

function showError(name, msg){
  const field = document.querySelector(`[name="${name}"]`)?.closest(".field");
  const err = document.querySelector(`.error[data-for="${name}"]`);
  if(field) field.classList.add("has-error");
  if(err) err.textContent = msg || "";
}

function clearErrors(){
  document.querySelectorAll(".field").forEach(f => f.classList.remove("has-error"));
  document.querySelectorAll(".error").forEach(e => e.textContent = "");
}

if(form){
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    formOk.hidden = true;
    formErr.hidden = true;

    const ism = form.ism.value.trim();
    const email = form.email.value.trim();
    const matn = form.matn.value.trim();
    const rasmInput = form.rasm;
    let ok = true;

    if(ism.length < 2){ showError("ism", t("err_name")); ok = false; }
    if(email && !/^\S+@\S+\.\S+$/.test(email)){ showError("email", t("err_email")); ok = false; }
    if(matn.length < 10){ showError("matn", t("err_memory")); ok = false; }

    if(rasmInput && rasmInput.files[0]){
      const f = rasmInput.files[0];
      if(f.size > 5 * 1024 * 1024){
        showError("rasm", t("err_photo"));
        ok = false;
      }
    }

    if(!ok) return;

    submitBtn.disabled = true;
    submitBtn.textContent = t("form_submit_sending");

    try {
      const fd = new FormData();
      fd.append("ism", ism);
      fd.append("email", email);
      fd.append("matn", matn);
      if(rasmInput && rasmInput.files[0]){
        fd.append("rasm", rasmInput.files[0]);
      }

      const res = await fetch("/api/stories", {
        method: "POST",
        body: fd
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Xatolik");

      form.reset();
      const preview = document.getElementById("rasmPreview");
      if(preview){ preview.hidden = true; preview.innerHTML = ""; }

      formOk.textContent = "✓ " + (data.message || t("form_note"));
      formOk.hidden = false;
      setTimeout(() => { formOk.hidden = true; }, 6000);

      await loadStoriesFromServer();

    } catch (err) {
      formErr.textContent = "✗ " + err.message;
      formErr.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t("form_submit");
    }
  });
}

// Rasm preview
const rasmInput = document.getElementById("rasm");
const rasmPreview = document.getElementById("rasmPreview");
if(rasmInput && rasmPreview){
  rasmInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    rasmPreview.innerHTML = "";
    if(!file){ rasmPreview.hidden = true; return; }
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    rasmPreview.appendChild(img);
    rasmPreview.hidden = false;
  });
}

/* ---------- Serverdan hikoyalarni yuklash ---------- */

async function loadStoriesFromServer(){
  if(!galleryEl) return;
  try {
    const res = await fetch("/api/stories");
    const serverStories = await res.json();
    cachedStories = serverStories;
    renderGallery(cachedStories);
  } catch (e) {
    console.warn("Serverdan hikoyalarni olishda xatolik:", e.message);
  }
}

/* ---------- Serverdan joylarni yuklash ---------- */

async function loadPlacesFromServer(){
  try {
    const res = await fetch("/api/places");
    const serverPlaces = await res.json();

    if(serverPlaces.length === 0) return;

    serverPlaces.forEach(p => {
      JOYLAR.push({
        nom: p.nom,
        turi: p.turi,
        tavsif: p.tavsif,
        manzil: p.manzil,
        lat: p.lat,
        lng: p.lng,
        rasm: p.rasm
      });
    });

    if(cardsEl) renderCards(currentFilter);

    const statJoyEl = document.getElementById("statJoy");
    if(statJoyEl) statJoyEl.textContent = JOYLAR.length;

  } catch (e) {
    console.warn("Serverdan joylarni olishda xatolik:", e.message);
  }
}

/* ---------- 7. REVEAL ANIMATSIYA ---------- */

function initReveal(){
  const els = document.querySelectorAll(
    ".section__head, .map, .card, .post, .hikoya__text, .form"
  );
  els.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.classList.add("is-visible");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

/* ---------- 8. STATISTIKA ---------- */

function animateStat(el, target, duration = 1200){
  if(!el) return;
  const start = performance.now();
  const from = 0;
  function tick(t){
    const p = Math.min((t - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initStats(){
  animateStat(document.getElementById("statJoy"), JOYLAR.length);
  animateStat(document.getElementById("statYil"), 150, 1600);
  animateStat(document.getElementById("statXotira"), 0);
}

/* ---------- 9. FOOTER YIL ---------- */

const yilEl = document.getElementById("yil");
if(yilEl) yilEl.textContent = new Date().getFullYear();

/* ---------- 10. PWA ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(e => console.warn("SW:", e));
  });
}

/* ---------- 11. ISHGA TUSHIRISH ---------- */

document.addEventListener("DOMContentLoaded", () => {
  applyLanguage(currentLang);
  renderCards();
  initReveal();
  initStats();
  loadStoriesFromServer();
  loadPlacesFromServer();
});