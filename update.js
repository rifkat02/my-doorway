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

    const todayDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

    for (const kw of allKeywords) {
        const slug = slugify(kw);
        if (!slug) continue;

        const pageFilename = `pages/${slug}.html`;
        let articlesHtml = `<li>Актуальные официальные данные по запросу "${kw}" обновляются...</li>`;

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

    <title>${kw.charAt(0).toUpperCase() + kw.slice(1)}: Правовые нормы и практика 2026</title>
    <meta name="description" content="Полное руководство по теме ${kw}. Разбор законодательства, экспертные разъяснения и рекомендации юристов.">
    
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${kw.charAt(0).toUpperCase() + kw.slice(1)}",
      "description": "Правовой анализ и практика по теме ${kw}",
      "dateModified": "${new Date().toISOString()}",
      "author": {
        "@type": "Person",
        "name": "Александр Семенов",
        "jobTitle": "Ведущий юрист по гражданскому праву"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Центр Правовой Помощи"
      }
    }
    </script>

    <style>
        :root {
            --primary: #1e3a8a;
            --primary-hover: #1e40af;
            --accent: #0284c7;
            --bg: #f8fafc;
            --text: #0f172a;
            --card-bg: #ffffff;
            --border: #e2e8f0;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 0; line-height: 1.7; }
        
        /* Шапка портала */
        header { background: #0f172a; color: #fff; padding: 15px 20px; }
        .nav { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: 700; font-size: 20px; color: #fff; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .nav-links a { color: #94a3b8; text-decoration: none; margin-left: 20px; font-size: 14px; transition: color 0.2s; }
        .nav-links a:hover { color: #fff; }
        
        /* Основной контейнер */
        .container { max-width: 1000px; margin: 30px auto; padding: 0 20px; display: grid; grid-template-columns: 1fr; gap: 30px; }
        .card { background: var(--card-bg); padding: 35px; border-radius: 12px; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        
        /* Метаданные статьи */
        .article-meta { display: flex; gap: 15px; font-size: 13px; color: #64748b; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; flex-wrap: wrap; }
        .meta-item { display: flex; align-items: center; gap: 5px; }

        h1 { font-size: 32px; color: #0f172a; margin-top: 0; line-height: 1.3; font-weight: 800; }
        h2 { font-size: 22px; color: var(--primary); margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        
        /* Блок автора */
        .author-box { display: flex; align-items: center; gap: 15px; background: #f1f5f9; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
        .author-avatar { width: 50px; height: 50px; border-radius: 50%; background: #cbd5e1; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #475569; }
        .author-info { font-size: 14px; }
        .author-name { font-weight: bold; color: #0f172a; }
        .author-title { color: #64748b; font-size: 13px; }

        /* Внимание / Дисклеймер */
        .warning-box { background: #fffbebf5; border-left: 4px solid #f59e0b; padding: 18px; border-radius: 0 8px 8px 0; margin: 25px 0; font-size: 15px; color: #92400e; }

        /* Главный рекламный баннер / Оффер */
        .banner { background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); color: white; padding: 25px; border-radius: 10px; margin: 30px 0; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15); }
        .banner h3 { margin: 0 0 10px 0; font-size: 20px; }
        .banner p { margin: 0 0 15px 0; font-size: 15px; opacity: 0.9; }
        .btn { display: inline-block; background: #22c55e; color: white; padding: 12px 26px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px; transition: background 0.2s; border: none; cursor: pointer; }
        .btn:hover { background: #16a34a; }

        /* Чек-лист / Шаги */
        .steps-list { list-style: none; padding: 0; margin: 20px 0; }
        .steps-list li { position: relative; padding-left: 35px; margin-bottom: 12px; }
        .steps-list li::before { content: "✓"; position: absolute; left: 0; top: 0; width: 22px; height: 22px; background: #e0f2fe; color: #0284c7; border-radius: 50%; text-align: center; line-height: 22px; font-weight: bold; font-size: 12px; }

        /* Блок FAQ */
        .faq-item { margin-bottom: 15px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
        .faq-q { font-weight: 700; color: #0f172a; margin-bottom: 5px; }
        .faq-a { color: #334155; font-size: 15px; }

        /* Перелинковка тегов */
        .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 15px; }
        .tag-item { background: #f1f5f9; color: #334155; padding: 6px 14px; border-radius: 6px; text-decoration: none; font-size: 13px; border: 1px solid #e2e8f0; transition: all 0.2s; }
        .tag-item:hover { background: #e2e8f0; color: var(--primary); border-color: #cbd5e1; }

        /* Плавающий чат-виджет */
        .widget-chat { position: fixed; bottom: 20px; right: 20px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.15); border-radius: 12px; padding: 15px; width: 280px; z-index: 999; }
        .widget-title { font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 5px; display: flex; align-items: center; gap: 6px; }
        .widget-status { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; display: inline-block; }
        .widget-text { font-size: 13px; color: #64748b; margin-bottom: 10px; }
        .widget-btn { display: block; text-align: center; background: var(--primary); color: white; padding: 8px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; }

        footer { background: #0f172a; color: #94a3b8; padding: 40px 20px; text-align: center; font-size: 13px; margin-top: 50px; }
        footer a { color: #cbd5e1; text-decoration: none; }
    </style>
</head>
<body>

    <header>
        <div class="nav">
            <a href="../index.html" class="logo">⚖️ Единый Юридический Портал</a>
            <div class="nav-links">
                <a href="../index.html">Реестр материалов</a>
                <a href="#practical">Практика</a>
                <a href="#faq">Вопросы-ответы</a>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="card">
            
            <div class="article-meta">
                <span class="meta-item">📅 Обновлено: ${todayDate}</span>
                <span class="meta-item">⏱ Время чтения: ~4 мин</span>
                <span class="meta-item">🛡 Проверено юристом</span>
            </div>

            <h1>${kw.charAt(0).toUpperCase() + kw.slice(1)}</h1>

            <div class="author-box">
                <div class="author-avatar">АС</div>
                <div class="author-info">
                    <div class="author-name">Материал подготовил: Александр Семенов</div>
                    <div class="author-title">Эксперт по правовым вопросам, стаж работы 14 лет</div>
                </div>
            </div>

            <p>Вопросы по теме <strong>«${kw}»</strong> требуют детального анализа действующего законодательства РФ и сложившейся судебной практики. Ниже представлен актуальный правовой разбор и нормативные разъяснения.</p>
            
            <div class="warning-box">
                <strong>Важное примечание:</strong> Сведения проверены на соответствие действующим нормативно-правовым актам. При рассмотрении индивидуальных правовых споров рекомендуется учитывать специфику конкретной ситуации.
            </div>

            <!-- Главный блок действия / Оффер -->
            <div class="banner">
                <h3>Нужна персональная правовая помощь по вашей ситуации?</h3>
                <p>Получите разъяснения специалистов и полный доступ к нормативной базе в нашем специализированном сообществе.</p>
                <a href="${TARGET_URL}" class="btn" target="_blank">Получить подробную консультацию &rarr;</a>
            </div>

            <h2 id="practical">Пошаговый порядок действий</h2>
            <ul class="steps-list">
                <li>Проверьте наличие необходимых документов и обоснований по вашему вопросу.</li>
                <li>Ознакомьтесь с актуальными разъяснениями Верховного Суда РФ.</li>
                <li>В случае необходимости составьте досудебную претензию или запрос.</li>
                <li>Обратитесь за профессиональной юридической оценкой для минимизации рисков.</li>
            </ul>

            <h2>Официальные публикации и новости</h2>
            <ul>
                ${articlesHtml}
            </ul>

            <h2 id="faq">Разбор частых вопросов (FAQ)</h2>
            <div class="faq-item">
                <div class="faq-q">Вопрос: Как регулируется тема «${kw}» в законодательстве?</div>
                <div class="faq-a">Ответ: Основные положения закреплены в профильных федеральных законах и подзаконных актах. Подробный перечень норм обновляется ежедневно.</div>
            </div>
            <div class="faq-item">
                <div class="faq-q">Вопрос: Какие документы необходимы в первую очередь?</div>
                <div class="faq-a">Ответ: Перечень зависит от характера дела, но стандартный пакет включает документы, удостоверяющие личность, и базовые соглашения/чеки/акты.</div>
            </div>

            <h2>Смежные темы и статьи реестра</h2>
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

    <!-- Плавающий виджет -->
    <div class="widget-chat">
        <div class="widget-title"><span class="widget-status"></span> Дежурный юрист онлайн</div>
        <div class="widget-text">Готовы ответить на ваши вопросы по теме "${kw}".</div>
        <a href="${TARGET_URL}" class="widget-btn" target="_blank">Задать вопрос</a>
    </div>

    <footer>
        <p>&copy; 2026 Единый Информационно-Правовой Портал. Все материалы защищены. <br>Информация носит справочный характер и не является публичной офертой. | <a href="../index.html">Карта сайта</a></p>
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

    <title>Единый Правовой Портал — Реестр материалов</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; background: #f8fafc; color: #0f172a; }
        .card { background: #fff; padding: 35px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        h1 { color: #1e3a8a; }
        a { color: #0284c7; text-decoration: none; display: block; margin-bottom: 12px; font-weight: 500; }
        a:hover { text-decoration: underline; color: #1e3a8a; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Реестр информационно-правовых материалов</h1>
        <p>Всего проиндексировано страниц в каталоге: <strong>${generatedPages.length}</strong></p>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:20px 0;">
        <div>\n`;

    for (const p of generatedPages) {
        indexHtml += `<a href="${p.path}">📄 ${p.kw.charAt(0).toUpperCase() + p.kw.slice(1)}</a>\n`;
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
