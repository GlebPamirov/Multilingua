/**
 * DICTIONARY.JS — Модуль словаря.
 * Отвечает за быстрый поиск, фильтрацию по языкам и вывод списка всех слов.
 */

// Глобальное состояние конкретно для этого модуля
const DictionaryState = {
    selectedLang: 'all',
    searchQuery: ''
};

/**
 * Главная функция инициализации экрана словаря
 * @param {HTMLElement} container — куда рендерить словарь
 */
function initDictionary(container) {
    // Берём актуальные языки из глобального состояния базы данных
    const realLanguages = window.APP_STATE.languages || [];

    container.innerHTML = `
        <div class="dictionary-controls">
            <div class="search-wrapper">
                <input type="text" id="dict-search" placeholder="Поиск слова, перевода или ассоциации..." value="${DictionaryState.searchQuery}">
            </div>
            <div class="lang-filter-wrapper">
                <select id="dict-lang-filter">
                    <option value="all" ${DictionaryState.selectedLang === 'all' ? 'selected' : ''}>Все языки</option>
                    ${realLanguages.map(lang => `
                        <option value="${lang.ID}" ${DictionaryState.selectedLang === lang.ID ? 'selected' : ''}>${lang.Language_Name}</option>
                    `).join('')}
                </select>
            </div>
        </div>
        <div id="dictionary-list" class="dictionary-list"></div>
    `;

    renderDictionaryList();
    setupDictionaryListeners();
}

/**
 * Фильтрует базу данных и отрисовывает строки словаря
 */
function renderDictionaryList() {
    const listContainer = document.getElementById('dictionary-list');
    if (!listContainer) return;

    const query = DictionaryState.searchQuery.toLowerCase().trim();
    const langFilter = DictionaryState.selectedLang;

    // Фильтруем массив testWords (который живет в cards.js)
    const filteredWords = window.APP_STATE.words.filter(item => {
        // 1. Фильтр по языку
        if (langFilter !== 'all' && item.Lang_ID !== langFilter) return false;

        // 2. Фильтр по поисковому запросу
        if (query) {
            const inWord = item.Word.toLowerCase().includes(query);
            const inTrans = item.transcription ? item.transcription.toLowerCase().includes(query) : false;
            const inAssoc = item.association ? item.association.toLowerCase().includes(query) : false;
            
            // Дополнительно ищем по переводам этого же концепта на русский язык, 
            // чтобы введя русское слово, найти его иностранные эквиваленты
            const russianTranslation = window.APP_STATE.words.find(w => w.concept_id === item.concept_id && w.Lang_ID=== 'ru');
            const inTranslation = russianTranslation ? russianTranslation.word.toLowerCase().includes(query) : false;

            return inWord || inTrans || inAssoc || inTranslation;
        }

        return true;
    });

    // Если ничего не нашли
    if (filteredWords.length === 0) {
        listContainer.innerHTML = `<p class="loading-text">Ничего не найдено</p>`;
        return;
    }

    // Собираем HTML списка
    listContainer.innerHTML = filteredWords.map(item => {
        const lang = testLanguages.find(l => l.id === item.Lang_ID) || { name: item.Lang_ID };
        // Находим русский перевод для контекста, если текущая строка не на русском
        const ruItem = item.Lang_ID !== 'ru' ? testWords.find(w => w.concept_id === item.concept_id && w.Lang_ID === 'ru') : null;

        return `
            <div class="dict-item" data-concept="${item.concept_id}">
                <div class="dict-item-main">
                    <span class="dict-word ${lang.font || ''}">${item.Word}</span>
                    <span class="dict-lang-tag">${item.Lang_ID.toUpperCase()}</span>
                </div>
                <div class="dict-item-details">
                    ${item.transcription ? `<span class="dict-trans">${item.transcription}</span>` : ''}
                    ${ruItem ? `<span class="dict-ru-trans"> — ${ruitem.Word}</span>` : ''}
                </div>
                ${item.association ? `<div class="dict-assoc-preview">💡 ${item.association}</div>` : ''}
            </div>
        `;
    }).join('');
}

/**
 * Следит за вводом текста и выбором языка
 */
function setupDictionaryListeners() {
    const searchInput = document.getElementById('dict-search');
    const langSelect = document.getElementById('dict-lang-filter');

    // Поиск "на лету" при каждом вводе символа
    searchInput.addEventListener('input', (e) => {
        DictionaryState.searchQuery = e.target.value;
        renderDictionaryList();
    });

    // Смена языка в выпадающем списке
    langSelect.addEventListener('change', (e) => {
        DictionaryState.selectedLang = e.target.value;
        renderDictionaryList();
    });

    // Клик по элементу словаря (в будущем может открывать полную карточку слова)
    const listContainer = document.getElementById('dictionary-list');
    listContainer.addEventListener('click', (e) => {
        const dictItem = e.target.closest('.dict-item');
        if (!dictItem) return;
        
        const conceptId = dictItem.dataset.concept;
        console.log(`Кликнули по концепту #${conceptId}. Здесь можно настроить переход на экран карточек.`);
    });
}

window.initDictionary = initDictionary;