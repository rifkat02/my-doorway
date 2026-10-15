const fs = require('fs');

// ==================== НАСТРОЙКИ ====================
const TARGET_URL = "https://t.me/your_telegram_channel"; // Куда сливать трафик (замени на свою ссылку)
const SITE_DOMAIN = "https://rifkat02.github.io/my-doorway"; // Твой адрес сайта
// ====================================================

function slugify(text) {
    return text.toLowerCase()
        .replace(/[^а-яa-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

if (!fs.existsSync('pages')) {
    fs.mkdirSync('pages');
}

async function main() {
    console.log("🛠 Генерация HTML-страниц по собранным ключам...");
    
    let currentKeywords = [];
    if (fs.existsSync('keywords.txt')) {
        const fileContent = fs.readFileSync('keywords.txt', 'utf-8');
        currentKeywords = fileContent.split('\n').map(k => k.trim()).filter(Boolean);
    }
    
    if (currentKeywords.length === 0) {
        currentKeywords = ["юрист онлайн"];
    }

    const allKeywords = currentKeywords;
    let generatedPages = [];

    for (const kw of allKeywords) {
        const slug = slugify(kw);
        if (!slug) continue;

        const pageFilename = `pages/${slug}.html`;
        let articlesHtml = `<li>Актуальные данные по запросу "${kw}" обновляются...</li>`;

        try {
            const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(kw)}&hl=ru&gl=RU&ceid=RU:ru`;
            const res = await fetch(rssUrl);
            const text = await res.text();

            const titles = [];
            const itemRegex = /<item>([\s\S]*?)<\/item>/g;
            let match;
            while ((match = itemRegex.exec(text)) && titles.length < 3) {
                const itemContent = match[1];
                const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
                const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
                if (titleMatch && linkMatch) {
                    titles.push({
                        title: titleMatch[1].replace('<![CDATA[', '').replace(']]>', ''),
                        link: linkMatch[1].trim()
                    });
                }
            }

            if (titles.length > 0) {
                articlesHtml = titles.map(art => `<li><a href="${art.link}" target="_blank" rel="nofollow">${art.title}</a></li>`).join('');
            }
        } catch (e) {}

        let htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="yandex-verification" content="bae4782113b8f044" />
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6V8S1KXS68"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6V8S1KXS68');
    </script>

    <title>${kw.charAt(0).toUpperCase() + kw.slice(1)} — Обзор и руководства</title>
    <meta name="description" content="Вся информация по запросу ${kw}. Свежие статьи, новости и рекомендации.">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${kw.charAt(0).toUpperCase() + kw.slice(1)}",
      "description": "Актуальный дайджест и руководства по запросу ${kw}",
      "author": {
        "@type": "Organization",
        "name": "Правовой Портал"
      }
    }
    </script>

    <style>
        :root { --primary: #2563eb; --bg: #f8fafc; --text: #1e293b; --card-bg: #ffffff; --border: #e2e8f0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.6; }
        header { background: var(--card-bg); border-bottom: 1px solid var(--border); padding: 15px 20px; }
        .nav { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: bold; font-size: 20px; color: var(--primary); text-decoration: none; }
        .nav-links a { color: #64748b; text-decoration: none; margin-left: 15px; font-size: 14px; }
        .container { max-width: 900px; margin: 30px auto; padding: 0 20px; }
        .card { background: var(--card-bg); padding: 30px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 25px; }
        h1 { font-size: 28px; color: #0f172a; margin-top: 0; }
        h2 { font-size: 20px; color: #334155; margin-top: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
        .banner { background: #eff6ff; border-left: 4px solid var(--primary); padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0; }
        .banner h3 { margin: 0 0 10px 0; color: #1e40af; }
        .btn { display: inline-block; background: var(--primary); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 10px; }
        .btn:hover { background: #1d4ed8; }
        .faq-item { margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px; }
        .faq-q { font-weight: 600; color: #0f172a; }
        .faq-a { color: #475569; font-size: 15px; margin-top: 5px; }
        .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
        .tag-item { background: #f1f5f9; color: #475569; padding: 6px 12px; border-radius: 20px; text-decoration: none; font-size: 13px; }
        .tag-item:hover { background: #e2e8f0; color: var(--primary); }
        footer { background: var(--card-bg); border-top: 1px solid var(--border); padding: 20px; text-align: center; color: #94a3b8; font-size: 13px; margin-top: 40px; }
    </style>
</head>
<body>

    <header>
        <div class="nav">
            <a href="../index.html" class="logo">Правовой и Инфо Портал</a>
            <div class="nav-links">
                <a href="../index.html">Главная</a>
                <a href="#news">Новости</a>
                <a href="#faq">Вопросы и ответы</a>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="card">
            <h1>${kw.charAt(0).toUpperCase() + kw.slice(1)}</h1>
            <p>Добро пожаловать в актуальный информационный раздел, посвященный теме <strong>«${kw}»</strong>. Мы регулярно мониторим правовые изменения, свежие новости и полезные материалы.</p>
            
            <div class="banner">
                <h3>Нужна подробная консультация или решение?</h3>
                <p>Получите актуальные рекомендации и полный доступ к материалам в нашем официальном канале.</p>
                <a href="${TARGET_URL}" class="btn" target="_blank">Перейти к просмотру &rarr;</a>
            </div>

            <h2 id="news">Свежие публикации по теме</h2>
            <ul>
                ${articlesHtml}
            </ul>

            <h2 id="faq">Часто задаваемые вопросы</h2>
            <div class="faq-item">
                <div class="faq-q">❓ Где найти актуальные документы по запросу «${kw}»?</div>
                <div class="faq-a">Все обновленные файлы и статьи публикуются на нашем ресурсе регулярно после официальных обновлений.</div>
            </div>
            <div class="faq-item">
                <div class="faq-q">❓ Как правильно действовать в этой ситуации?</div>
                <div class="faq-a">Рекомендуем ознакомиться с правовыми нормами или обратиться за консультацией через наш официальный канал связи выше.</div>
            </div>

            <h2>Похожие темы и категории</h2>
            <div class="tags">
`;

        const randomLinks = allKeywords.filter(k => k !== kw).sort(() => 0.5 - Math.random()).slice(0, 10);
        for (const otherKw of randomLinks) {
            const otherSlug = slugify(otherKw);
            htmlContent += `<a href="${otherSlug}.html" class="tag-item">${otherKw.charAt(0).toUpperCase() + otherKw.slice(1)}</a>\n`;
        }

        htmlContent += `
            </div>
        </div>
    </div>

    <footer>
        <p>&copy; 2026 Информационный портал. Все права защищены. | <a href="../index.html" style="color:#64748b;">Карта сайта</a></p>
    </footer>

</body>
</html>`;

        fs.writeFileSync(pageFilename, htmlContent, 'utf-8');
        generatedPages.push({ kw, path: pageFilename });
    }

    // Генерация главного каталога index.html
    let indexHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="yandex-verification" content="bae4782113b8f044" />
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-6V8S1KXS68"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-6V8S1KXS68');
    </script>

    <title>Информационный портал</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; background: #f8fafc; color: #1e293b; }
        .card { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; }
        a { color: #2563eb; text-decoration: none; display: block; margin-bottom: 10px; font-weight: 500; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Карта материалов портала</h1>
        <p>Всего материалов в каталоге: <strong>${generatedPages.length}</strong></p>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:20px 0;">
        <div>\n`;

    for (const p of generatedPages) {
        indexHtml += `<a href="${p.path}">${p.kw.charAt(0).toUpperCase() + p.kw.slice(1)}</a>\n`;
    }

    indexHtml += `\n</div></div></body></html>`;
    fs.writeFileSync('index.html', indexHtml, 'utf-8');

    // Генерация sitemap.xml
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    sitemap += `  <url><loc>${SITE_DOMAIN}/index.html</loc><priority>1.0</priority></url>\n`;

    for (const p of generatedPages) {
        sitemap += `  <url><loc>${SITE_DOMAIN}/${p.path}</loc><priority>0.8</priority></url>\n`;
    }
    sitemap += `</urlset>`;

    fs.writeFileSync('sitemap.xml', sitemap, 'utf-8');
    console.log("Сайт и карта сгенерированы успешно!");
}

main();
