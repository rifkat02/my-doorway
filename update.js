const fs = require('fs');

// ==================== НАСТРОЙКИ ====================
const TARGET_URL = "https://t.me/your_telegram_channel"; // Куда сливать трафик
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
    <title>${kw.charAt(0).toUpperCase() + kw.slice(1)} — Обзор и руководства</title>
    <meta name="description" content="Вся информация по запросу ${kw}. Свежие статьи и материалы.">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; background: #f4f6f8; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 800px; margin: auto; background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #1a73e8; font-size: 26px; }
        .cta-box { background: #e8f0fe; border: 2px dashed #1a73e8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
        .cta-btn { display: inline-block; background: #28a745; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; font-size: 18px; border-radius: 5px; margin-top: 10px; }
        .cta-btn:hover { background: #218838; }
        .content { margin-top: 20px; }
        .links { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${kw.charAt(0).toUpperCase() + kw.slice(1)}</h1>

        <div class="cta-box">
            <h2>Ищете лучшую информацию по теме?</h2>
            <p>Полный доступ к материалам и сервисам на нашей главной платформе.</p>
            <a href="${TARGET_URL}" class="cta-btn" target="_blank">Перейти к просмотру &rarr;</a>
        </div>

        <div class="content">
            <h3>Последние упоминания в сети:</h3>
            <ul>
                ${articlesHtml}
            </ul>
        </div>

        <div class="links">
            <h4>Похожие запросы:</h4>
            <ul>
`;

        const randomLinks = allKeywords.filter(k => k !== kw).sort(() => 0.5 - Math.random()).slice(0, 8);
        for (const otherKw of randomLinks) {
            const otherSlug = slugify(otherKw);
            htmlContent += `<li><a href="${otherSlug}.html">${otherKw.charAt(0).toUpperCase() + otherKw.slice(1)}</a></li>\n`;
        }

        htmlContent += `
            </ul>
            <p><a href="../index.html">&larr; Главный каталог</a></p>
        </div>
    </div>
</body>
</html>`;

        fs.writeFileSync(pageFilename, htmlContent, 'utf-8');
        generatedPages.push({ kw, path: pageFilename });
    }

    let indexHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="yandex-verification" content="bae4782113b8f044" />
    <title>Информационный портал</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        a { color: #1a73e8; text-decoration: none; display: block; margin-bottom: 8px; }
    </style>
</head>
<body>
    <h1>Карта материалов портала</h1>
    <p>Всего страниц: ${generatedPages.length}</p>
    <div>\n`;

    for (const p of generatedPages) {
        indexHtml += `<a href="${p.path}">${p.kw.charAt(0).toUpperCase() + p.kw.slice(1)}</a>\n`;
    }

    indexHtml += `\n</div></body></html>`;
    fs.writeFileSync('index.html', indexHtml, 'utf-8');

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
