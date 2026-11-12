// Генерира статичния сайт в public/ от src/pages/*.html и data/blog-posts.json.
// Без външни пакети: стартира се с `node tools/build.js` (или `npm run build`).
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public");
const BASE = "https://kolizascrap.vercel.app";
const SITE = "Коли за скрап София";
const PHONE = "+359885701660";
const PHONE_LABEL = "0885 70 16 60";

// ── Помощни функции ───────────────────────────────────────────
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const img = (p) => encodeURI(p); // "/old cars.webp" -> "/old%20cars.webp"
const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const fmtDate = (iso) => {
  try {
    return new Intl.DateTimeFormat("bg-BG", { day: "numeric", month: "long", year: "numeric" })
      .format(new Date(iso)).replace(/\s*г\.$/, "");
  } catch {
    return iso;
  }
};

// ── Икони (inline SVG) ───────────────────────────────────────
const svg = (d, size = 24) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICONS = {
  PHONE_ICON: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>', 20),
  ICON_PHONE_BIG: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
  ICON_TRUCK: svg('<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),
  ICON_DOC: svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>'),
  ICON_CASH: svg('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
  ICON_CLOCK: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  ICON_CHAT: svg('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>'),
  ICON_MAIL: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),
};

const CTA = `<section class="cta">
  <div class="container cta__inner">
    <div>
      <h2>Имате кола за скрап?</h2>
      <p>Обадете се за безплатна оценка на момента. Работим всеки ден от 08:00 до 20:00.</p>
    </div>
    <a class="btn btn--light btn--lg" href="tel:${PHONE}" aria-label="Обадете се на ${PHONE_LABEL}">${ICONS.PHONE_ICON} ${PHONE_LABEL}</a>
  </div>
</section>`;

const fill = (html) =>
  html.replace(/\{\{(\w+)\}\}/g, (m, key) => (key === "CTA" ? CTA : ICONS[key] ?? m));

// ── Общ шаблон ───────────────────────────────────────────────
const NAV = [
  ["/", "Начало"],
  ["/about", "За нас"],
  ["/services", "Услуги"],
  ["/blog", "Блог"],
  ["/contact", "Контакти"],
];

function layout({ path: pagePath, title, description, keywords, ogImage, ogType = "website", head = "", body, noindex = false, active }) {
  const url = BASE + (pagePath === "/" ? "" : pagePath);
  const nav = NAV.map(([href, label]) => {
    const current = active === href;
    return `<li><a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a></li>`;
  }).join("");
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="bg">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ""}
<meta name="robots" content="${noindex ? "noindex, follow" : "index, follow"}">
${noindex ? "" : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#14532d">
<link rel="icon" href="/favicon.ico">
<link rel="manifest" href="/manifest.json">
<link rel="alternate" type="application/rss+xml" title="${SITE} - Блог" href="/rss.xml">
<meta property="og:locale" content="bg_BG">
<meta property="og:site_name" content="${SITE}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}${img(ogImage || "/mercedes.webp")}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap&subset=cyrillic" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
${head}
</head>
<body>
<a class="skip" href="#main">Към съдържанието</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="logo" href="/" aria-label="Начална страница - ${SITE}">
      <span class="logo__mark" aria-hidden="true">${svg('<path d="M3 17h2l1-5h12l1 5h2"/><circle cx="7.5" cy="17.5" r="2"/><circle cx="16.5" cy="17.5" r="2"/><path d="M6 12l2-5h8l2 5"/>', 22)}</span>
      <span>Коли за скрап</span>
    </a>
    <button class="nav-toggle" type="button" aria-label="Меню" aria-expanded="false" aria-controls="site-nav">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Основно меню">
      <ul>${nav}</ul>
      <a class="btn btn--primary site-nav__phone" href="tel:${PHONE}">${ICONS.PHONE_ICON} ${PHONE_LABEL}</a>
    </nav>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="container site-footer__grid">
    <div>
      <p class="site-footer__brand">${SITE}</p>
      <p>Лицензиран рециклатор на ИУМПС.<br>Работим 7 дни от 08:00 до 20:00.</p>
    </div>
    <div>
      <p class="site-footer__title">Навигация</p>
      <ul>${NAV.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul>
    </div>
    <div>
      <p class="site-footer__title">Контакти</p>
      <ul>
        <li><a href="tel:${PHONE}">${PHONE_LABEL}</a></li>
        <li><a href="mailto:cars@ecometal.bg">cars@ecometal.bg</a></li>
        <li><a href="https://www.facebook.com/ecometal/" target="_blank" rel="noopener noreferrer">Facebook</a></li>
      </ul>
      <address>ул. Свети Георги Победоносец №1а,<br>кв. Кремиковци, София 1849</address>
    </div>
  </div>
  <div class="container site-footer__bottom">
    <p>&copy; ${year} ${SITE}. Всички права запазени.</p>
    <p><a href="https://inweblife.net/" target="_blank" rel="noopener noreferrer"><strong>Изработка на уебсайт и оптимизация</strong></a></p>
  </div>
</footer>

<a class="call-fab" href="tel:${PHONE}" aria-label="Обадете се на ${PHONE_LABEL}">${ICONS.PHONE_ICON}<span>Обадете се</span></a>
<script src="/main.js" defer></script>
</body>
</html>
`;
}

const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const page = (name) => fill(fs.readFileSync(path.join(ROOT, "src", "pages", name), "utf8"));

// ── Статични страници ────────────────────────────────────────
const STATIC = [
  {
    file: "index.html", path: "/", active: "/",
    title: "Коли за скрап София | Изкупуване и Безплатен транспорт",
    description: "Изкупуване на коли за скрап в София. Безплатен транспорт от адрес, плащане в брой, удостоверение за дерегистрация. Работим 7 дни в седмицата.",
    keywords: "Коли за скрап София, Изкупуване на коли, автомобили за скрап",
    ogImage: "/mercedes.webp",
    head:
      '<meta name="google-site-verification" content="o3yDWZaFGvq8nSbZFsW2kJnBTWBvjgYuVkIS_8vihgQ">\n' +
      '<link rel="preload" as="image" href="/mercedes.webp">\n' +
      ld({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${BASE}/#business`,
        name: SITE,
        url: BASE,
        description: "Изкупуване на автомобили за скрап в София и Софийска област. Безплатен транспорт от адрес, плащане в брой на момента, удостоверение за дерегистрация.",
        telephone: PHONE,
        email: "cars@ecometal.bg",
        image: `${BASE}/mercedes.webp`,
        logo: `${BASE}/mercedes.webp`,
        sameAs: ["https://www.facebook.com/ecometal/"],
        address: {
          "@type": "PostalAddress",
          streetAddress: "ул. Свети Георги Победоносец №1а",
          addressLocality: "София",
          addressRegion: "Кремиковци",
          postalCode: "1849",
          addressCountry: "BG",
        },
        areaServed: {
          "@type": "GeoCircle",
          geoMidpoint: { "@type": "GeoCoordinates", latitude: 42.6977, longitude: 23.3219 },
          geoRadius: "50000",
        },
        priceRange: "$$",
        openingHours: "Mo-Su 08:00-20:00",
      }),
  },
  {
    file: "about.html", path: "/about", active: "/about",
    title: "За нас | Коли за скрап София",
    description: "Лицензиран център за изкупуване и бракуване на коли в София. Над 100 000 обработени автомобила. Безплатен транспорт и плащане в брой на адрес.",
    keywords: "коли за скрап София, изкупуване на коли, бракуване на автомобили, лицензиран център за разкомплектоване",
    ogImage: "/carsold.webp",
  },
  {
    file: "services.html", path: "/services", active: "/services",
    title: "Услуги | Коли за скрап София",
    description: "Изкупуване на коли за скрап в София – безплатен транспорт от адрес, плащане в брой, удостоверение за дерегистрация в КАТ. Работим 7 дни.",
    keywords: "услуги коли за скрап, безплатен транспорт, удостоверение за дерегистрация, бракуване на МПС, изкупуване на коли София",
    ogImage: "/carsforscrap.webp",
  },
  {
    file: "contact.html", path: "/contact", active: "/contact",
    title: "Контакт | Коли за скрап София",
    description: "Свържете се с нас на 0885 70 16 60. Работим без почивен ден от 08:00 до 20:00. Безплатен транспорт от адрес в София и Софийска област. Онлайн оценка на момента.",
    keywords: "контакт коли за скрап, телефон изкупуване коли, оценка кола за скрап онлайн, коли за скрап Sofia",
    ogImage: "/avtoscrap.webp",
  },
  {
    file: "404.html", path: "/404", noindex: true,
    title: "404 - Страницата не е намерена | Коли за скрап",
    description: "Страницата която търсите не съществува. Върни се към начало.",
  },
];

for (const p of STATIC) write(p.file, layout({ ...p, body: page(p.file) }));

// ── Блог ─────────────────────────────────────────────────────
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "blog-posts.json"), "utf8"))
  .sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id);

// Допълнителен HTML в края на определени статии (запазен от старата версия).
const POST_EXTRA = {
  "bezplaten-transport-izkupuvane-na-koli":
    '<p><a href="https://seo-optimizacia.org/" target="_blank" rel="noopener noreferrer"><strong>SEO оптимизация</strong></a></p>',
};

const card = (post) => `<article class="post-card">
  <a class="post-card__img" href="/blog/${post.slug}" tabindex="-1" aria-hidden="true">
    <img src="${img(post.image || "/mercedes.webp")}" alt="" width="640" height="400" loading="lazy">
  </a>
  <div class="post-card__body">
    <time datetime="${post.date}">${fmtDate(post.date)}</time>
    <h2><a href="/blog/${post.slug}">${esc(post.title)}</a></h2>
    <p>${post.excerpt}</p>
    <a class="post-card__more" href="/blog/${post.slug}">Прочетете повече →</a>
  </div>
</article>`;

write("blog/index.html", layout({
  path: "/blog", active: "/blog",
  title: "Блог | Коли за скрап София",
  description: "Полезни статии и публикации за бракуване на автомобили, документи за КАТ и изкупуване на коли за скрап в София.",
  keywords: "блог, коли за скрап, бракуване, документи КАТ, автомобили за скрап",
  ogImage: "/mercedes.webp",
  head: ld({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Блог | Коли за скрап София",
    description: "Полезни статии и публикации за бракуване на автомобили, документи за КАТ и изкупуване на коли за скрап в София.",
    url: `${BASE}/blog`,
    publisher: { "@type": "Organization", name: SITE, logo: { "@type": "ImageObject", url: `${BASE}/mercedes.webp` } },
  }),
  body: `<section class="page-head">
  <div class="container">
    <p class="eyebrow">Блог</p>
    <h1>Полезни статии за колите за скрап</h1>
    <p class="page-head__lead">Последни публикации и полезни статии за автомобилите за скрап – бракуване, документи, КАТ и данъци.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="container post-grid">
${posts.map(card).join("\n")}
  </div>
</section>
${CTA}`,
}));

posts.forEach((post, i) => {
  const newer = posts[i - 1];
  const older = posts[i + 1];
  const url = `${BASE}/blog/${post.slug}`;
  const image = `${BASE}${img(post.image || "/mercedes.webp")}`;
  const description = post.excerpt_plain || post.excerpt.replace(/<[^>]+>/g, "");

  write(`blog/${post.slug}.html`, layout({
    path: `/blog/${post.slug}`, active: "/blog",
    title: `${post.title} | Коли за скрап`,
    description,
    keywords: `${post.title}, коли за скрап, бракуване на автомобили, изкупуване на коли София`,
    ogImage: post.image,
    ogType: "article",
    head:
      `<meta property="article:published_time" content="${post.date}">\n` +
      `<meta property="article:author" content="${esc(post.author)}">\n` +
      ld({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Начало", item: BASE },
          { "@type": "ListItem", position: 2, name: "Блог", item: `${BASE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      }) + "\n" +
      ld({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        author: { "@type": "Person", name: post.author },
        datePublished: post.date,
        dateModified: post.date,
        url,
        image,
        publisher: { "@type": "Organization", name: SITE, logo: { "@type": "ImageObject", url: `${BASE}/mercedes.webp` } },
      }),
    body: `<article class="post">
  <header class="post__head container">
    <nav class="crumbs" aria-label="Навигация"><a href="/">Начало</a> / <a href="/blog">Блог</a></nav>
    <h1>${esc(post.title)}</h1>
    <p class="post__meta">${esc(post.author)} · <time datetime="${post.date}">${fmtDate(post.date)}</time></p>
  </header>
  ${post.image ? `<div class="container post__image"><img src="${img(post.image)}" alt="${esc(post.title)}" width="1200" height="675" fetchpriority="high"></div>` : ""}
  <div class="container prose">
${post.content}
${POST_EXTRA[post.slug] || ""}
  </div>
  <nav class="container post-nav" aria-label="Други статии">
    ${newer ? `<a class="post-nav__link" href="/blog/${newer.slug}"><span>← Предишен</span>${esc(newer.title)}</a>` : "<span></span>"}
    ${older ? `<a class="post-nav__link post-nav__link--next" href="/blog/${older.slug}"><span>Следващ →</span>${esc(older.title)}</a>` : "<span></span>"}
  </nav>
</article>
${CTA}`,
  }));
});

// ── sitemap.xml и rss.xml ────────────────────────────────────
// Дата на последната промяна на страниците (сменя се ръчно при промяна на текстовете).
const today = "2026-11-12";
const urls = [
  ["/", "daily", "1.0", today],
  ["/about", "monthly", "0.7", today],
  ["/services", "monthly", "0.7", today],
  ["/contact", "monthly", "0.6", today],
  ["/blog", "weekly", "0.8", posts[0]?.date || today],
  ...posts.map((p) => [`/blog/${p.slug}`, "monthly", "0.7", p.date]),
];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, f, pr, lm]) => `  <url>
    <loc>${BASE}${u === "/" ? "" : u}</loc>
    <lastmod>${lm}</lastmod>
    <changefreq>${f}</changefreq>
    <priority>${pr}</priority>
  </url>`).join("\n")}
</urlset>
`);

write("rss.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE} - Блог</title>
    <link>${BASE}</link>
    <description>Полезни статии за изкупуване и бракуване на автомобили в София и Софийска област</description>
    <language>bg</language>
    <lastBuildDate>${new Date(posts[0]?.date || Date.now()).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml"/>
${posts.map((p) => `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${BASE}/blog/${p.slug}</link>
      <guid isPermaLink="true">${BASE}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt_plain || p.excerpt.replace(/<[^>]+>/g, "")}]]></description>
    </item>`).join("\n")}
  </channel>
</rss>
`);

// ── CSS и JS ─────────────────────────────────────────────────
fs.copyFileSync(path.join(ROOT, "src", "styles.css"), path.join(OUT, "styles.css"));
fs.copyFileSync(path.join(ROOT, "src", "main.js"), path.join(OUT, "main.js"));

console.log(`Готово: ${STATIC.length} страници + блог с ${posts.length} статии → public/`);
