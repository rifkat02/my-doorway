const fs = require('fs');

// Базовые семенные темы для генерации глубоких хвостов
const SEED_KEYWORDS = [
    "юрист онлайн",
    "помощь юриста"
];

// Символы и буквы для перебора в подсказках Google (дает сотни НЧ запросов)
const ALPHABET = ['', ' а', ' б', ' в', ' г', ' д', ' е', ' ж', ' з', ' и', ' к', ' л', ' м', ' н', ' о', ' п', ' р', ' с', ' т', ' у', ' ф', ' х', ' ц', ' ч', ' ш', ' щ', ' э', ' ю', ' я'];

// Поисковые префиксы-модификаторы
const PREFIXES = ['как ', 'где ', 'цена ', 'купить ', 'лучший ', 'отзывы о '];

async function fetchSuggestions(query) {
    try {
        const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=ru&q=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        const data = await res.json();
        return data[1] || [];
    } catch (e) {
        return [];
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("🚀 Запуск глубокого парсера НЧ-ключей...");
    
    let baseKeywords = SEED_KEYWORDS;
    
    // Если в keywords.txt уже есть ключи, берем первые 5 для расширения
    if (fs.existsSync('keywords.txt')) {
        const file = fs.readFileSync('keywords.txt', 'utf-8');
        const lines = file.split('\n').map(k => k.trim()).filter(Boolean);
        if (lines.length > 0) {
            baseKeywords = lines.slice(0, 5);
        }
    }

    const allKeys = new Set();

    // Загружаем старые ключи
    if (fs.existsSync('keywords.txt')) {
        const existing = fs.readFileSync('keywords.txt', 'utf-8').split('\n');
        existing.forEach(k => { if(k.trim()) allKeys.add(k.trim().toLowerCase()); });
    }

    for (const seed of baseKeywords) {
        console.log(`🔍 Парсим подсказки по семени: "${seed}"...`);
        
        // Прямой запрос
        const direct = await fetchSuggestions(seed);
        direct.forEach(k => allKeys.add(k.toLowerCase()));
        await sleep(250);

        // Перебор букв (хвосты)
        for (const letter of ALPHABET) {
            const q = seed + letter;
            const subs = await fetchSuggestions(q);
            subs.forEach(k => allKeys.add(k.toLowerCase()));
            await sleep(200);
        }

        // Перебор префиксов
        for (const pref of PREFIXES) {
            const q = pref + seed;
            const subs = await fetchSuggestions(q);
            subs.forEach(k => allKeys.add(k.toLowerCase()));
            await sleep(200);
        }
    }

    const result = Array.from(allKeys);
    console.log(`✅ Всего собрано уникальных НЧ-ключей: ${result.length}`);
    
    // Сохраняем итоговую базу
    fs.writeFileSync('keywords.txt', result.join('\n'), 'utf-8');
    console.log("💾 База ключей успешно сохранена в keywords.txt!");
}

main();
