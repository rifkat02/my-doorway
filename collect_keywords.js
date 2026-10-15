const fs = require('fs');

// Базовые темы, с которых начинается сбор
const SEED_KEYWORDS = [
    "юрист онлайн",
    "помощь юриста"
];

// Русской алфавит и пробел для получения глубоких хвостов НЧ
const ALPHABET = ['', ' а', ' б', ' в', ' г', ' д', ' е', ' ж', ' з', ' и', ' к', ' л', ' м', ' н', ' о', ' п', ' р', ' с', ' т', ' у', ' ф', ' х', ' ц', ' ч', ' ш', ' щ', ' э', ' ю', ' я'];

// Поисковые префиксы (модификаторы для сбора горячего трафика)
const PREFIXES = ['как ', 'где ', 'цена ', 'купить ', 'лучший ', 'отзывы о '];

// Функция запроса подсказок Google
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

// Пауза между запросами, чтобы Google не заблокировал IP
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("🚀 Запуск глубокого парсера НЧ-ключей...");
    
    let baseKeywords = SEED_KEYWORDS;
    
    // Если файл keywords.txt уже существует, берем оттуда первые 5 ключей для расширения
    if (fs.existsSync('keywords.txt')) {
        const file = fs.readFileSync('keywords.txt', 'utf-8');
        const lines = file.split('\n').map(k => k.trim()).filter(Boolean);
        if (lines.length > 0) {
            baseKeywords = lines.slice(0, 5);
        }
    }

    const allKeys = new Set();

    // Загружаем уже имеющиеся ключи, если есть
    if (fs.existsSync('keywords.txt')) {
        const existing = fs.readFileSync('keywords.txt', 'utf-8').split('\n');
        existing.forEach(k => { if(k.trim()) allKeys.add(k.trim().toLowerCase()); });
    }

    for (const seed of baseKeywords) {
        console.log(`🔍 Парсим базу по ключу: "${seed}"...`);
        
        // 1. Прямые подсказки
        const direct = await fetchSuggestions(seed);
        direct.forEach(k => allKeys.add(k.toLowerCase()));
        await sleep(300);

        // 2. Буквенный перебор (дает сотни НЧ-запросов вида "юрист онлайн москва", "юрист онлайн бесплатно спб" и т.д.)
        for (const letter of ALPHABET) {
            const q = seed + letter;
            const subs = await fetchSuggestions(q);
            subs.forEach(k => allKeys.add(k.toLowerCase()));
            await sleep(250); // Защита от лимитов Google
        }

        // 3. Перебор с префиксами
        for (const pref of PREFIXES) {
            const q = pref + seed;
            const subs = await fetchSuggestions(q);
            subs.forEach(k => allKeys.add(k.toLowerCase()));
            await sleep(250);
        }
    }

    const result = Array.from(allKeys);
    console.log(`✅ Собрано уникальных НЧ-ключей: ${result.length}`);
    
    // Сохраняем в keywords.txt
    fs.writeFileSync('keywords.txt', result.join('\n'), 'utf-8');
    console.log("💾 Все ключи успешно сохранены в keywords.txt!");
}

main();
