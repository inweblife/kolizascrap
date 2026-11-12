# Коли за скрап София

Статичен сайт на чист HTML + CSS. Live: https://kolizascrap.vercel.app/

## Структура

- `src/pages/*.html` – съдържанието на страниците (начало, за нас, услуги, контакти, 404)
- `data/blog-posts.json` – статиите в блога
- `src/styles.css`, `src/main.js` – дизайн и мобилно меню
- `tools/build.js` – сглобява готовите HTML файлове в `public/` (меню, footer, блог, sitemap.xml, rss.xml)
- `public/` – готовият сайт (това се качва във Vercel) + снимките

## Команди

```bash
npm run dev    # генерира сайта и го отваря на http://localhost:3000
npm run build  # само генерира public/
```

Не са нужни `npm install` или външни пакети – само Node.js.

## Нова статия

Добавете запис в `data/blog-posts.json` (снимката – в `public/`) и пуснете `npm run build`.
Статията се появява в `/blog`, в sitemap.xml и в rss.xml автоматично.
