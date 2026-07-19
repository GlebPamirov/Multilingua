// 1. Конфигурация и глобальное состояние приложения
const CONFIG = {
    // Вставьте сюда полученный URL после развертывания скрипта в Google Таблицах
    API_URL: 'https://script.google.com/macros/s/AKfycbwTCfjjGniuCIE4Y2YjffknmlpUwacoM3HWBfeQg6gPhWsVB-kHp4gZ8ny3tReoLT8k/exec' 
};

let APP_STATE = {
    languages: [],
    words: [],
    examples: [],
    currentLanguageId: null
};

// 2. Инициализация приложения при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupFormListeners();
});

async function initApp() {
    updateStatus('checking');
    try {
        const response = await fetch(CONFIG.API_URL);
        const result = await response.json();
        
        if (result.status === 'success') {
            APP_STATE.languages = result.data.languages;
            APP_STATE.words = result.data.words;
            APP_STATE.examples = result.data.examples;
            
            updateStatus('online');
            renderLanguageList();
            populateLanguageSelects();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        updateStatus('offline');
    }
}

// 3. Динамическая сборка данных формы добавления
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    showAutosaveStatus('process');
    submitBtn.disabled = true;

    // Генерируем уникальный Concept_ID (таймштамп вполне подходит для уникальности внутри базы)
    const conceptId = 'C_' + Date.now();
    const langId = form.querySelector('#form-lang-select').value;

    // Собираем данные для таблицы Words
    const wordData = {
        _targetSheet: 'Words', // Маркер для GAS-скрипта
        Concept_ID: conceptId,
        Lang_ID: langId,
        Word: form.querySelector('#input-word').value.trim(),
        Transcription: form.querySelector('#input-transcription').value.trim(),
        Variations: form.querySelector('#input-variations').value.trim(),
        Association: form.querySelector('#input-association').value.trim(),
        Image_URL: form.querySelector('#input-image-url').value.trim(),
        Source: form.querySelector('#input-source').value.trim(),
        Folder: form.querySelector('#form-folder-select').value,
        Part_Of_Speech: form.querySelector('#form-pos-select').value,
        Comment: form.querySelector('#textarea-comment').value.trim()
    };

    // Собираем динамические примеры, если они были добавлены в форму
    const exampleRows = form.querySelectorAll('.example-form-row');
    const examplesPromises = Array.from(exampleRows).map(row => {
        return {
            _targetSheet: 'Examples', // Отправляем на лист Примеров
            Concept_ID: conceptId,
            Lang_ID: langId,
            Example_Text: row.querySelector('.ex-text-input').value.trim(),
            Example_Transcription: row.querySelector('.ex-transc-input').value.trim(),
            Example_Translation: row.querySelector('.ex-trans-input').value.trim(),
            Example_Comment: row.querySelector('.ex-comment-input').value.trim(),
            Example_Source: row.querySelector('.ex-source-input').value.trim(),
            Example_Font: row.querySelector('.ex-font-select').value || "",
            Additional_Concept_IDs: row.querySelector('.ex-add-ids-input').value.trim()
        };
    });

    try {
        // 1. Отправляем сначала главное слово
        await sendToDatabase(wordData);
        
        // 2. Отправляем пачку примеров (если они есть) параллельно
        if (examplesPromises.length > 0) {
            await Promise.all(examplesPromises.map(ex => sendToDatabase(ex)));
        }

        showAutosaveStatus('success');
        form.reset();
        clearDynamicExamples(); // Очищаем сгенерированные блоки примеров в HTML
        
        // Перезапускаем синхронизацию, чтобы обновить кеш и локальные списки
        await initApp(); 
        
    } catch (error) {
        console.error('Ошибка сохранения данных:', error);
        showAutosaveStatus('error');
    } finally {
        submitBtn.disabled = false;
    }
}

// 4. Сетевой транспорт для связи с Google Таблицей
async function sendToDatabase(payload) {
    const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        mode: 'no-cors', // Важно для обхода CORS ограничений скриптов Google
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    return response;
}

// 5. Динамическое управление интерфейсом и кастомными шрифтами
function renderLanguageList() {
    const container = document.querySelector('.languages-list');
    if (!container) return;
    container.innerHTML = '';

    if (APP_STATE.languages.length === 0) {
        container.innerHTML = '<div class="empty-notify">Список языков пуст</div>';
        return;
    }

    APP_STATE.languages.forEach(lang => {
        const card = document.createElement('div');
        card.className = 'lang-card';
        
        // Динамически применяем основной кастомный шрифт из БД для отображения метаданных, если требуется
        card.style.setProperty('--card-primary-font', lang.Script_Font_1 || 'inherit');

        card.innerHTML = `
            <div class="lang-card-main">
                <div class="select-lang-trigger" onclick="selectLanguage('${lang.ID}')">
                    <span class="lang-card-name">${lang.Language_Name}</span>
                    <span class="lang-card-code">[${lang.Language_Code}]</span>
                    <div class="lang-card-meta">Слов: ${lang.Words_Count || 0} | Изучено: ${lang.Mastered_Percentage || 0}%</div>
                </div>
                <button class="play-btn" onclick="startTest('${lang.ID}')">Play</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Заполнение выпадающих списков языков в формах
function populateLanguageSelects() {
    const select = document.getElementById('form-lang-select');
    if (!select) return;
    
    select.innerHTML = '<option value="" disabled selected>Выберите язык...</option>';
    APP_STATE.languages.forEach(lang => {
        const opt = document.createElement('option');
        opt.value = lang.ID;
        opt.textContent = `${lang.Language_Name} (${lang.Language_Code})`;
        select.appendChild(opt);
    });
}

// 6. Управление статусами UI
function updateStatus(statusClass) {
    const badge = document.querySelector('.status-badge');
    if (!badge) return;
    badge.className = `status-badge ${statusClass}`;
    if (statusClass === 'online') badge.textContent = 'online';
    if (statusClass === 'offline') badge.textContent = 'offline';
    if (statusClass === 'checking') badge.textContent = 'синхронизация...';
}

function showAutosaveStatus(state) {
    const statusEl = document.querySelector('.autosave-status');
    if (!statusEl) return;
    statusEl.className = `autosave-status ${state}`;
    if (state === 'process') statusEl.textContent = 'Запись в таблицу...';
    if (state === 'success') statusEl.textContent = 'Успешно сохранено!';
    if (state === 'error') statusEl.textContent = 'Ошибка сохранения';
}

function setupFormListeners() {
    const form = document.getElementById('add-word-form');
    if (form) form.addEventListener('submit', handleFormSubmit);
}

function clearDynamicExamples() {
    const container = document.getElementById('dynamic-examples-container');
    if (container) container.innerHTML = '';
}