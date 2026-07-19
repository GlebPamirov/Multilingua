/**
 * CARDS.JS — Модуль интерфейса карточек для параллельного изучения.
 */

// Временные тестовые данные (имитация того, что прилетит из Google Sheets)
const testLanguages = [
    { id: 'en', name: 'Английский', font: 'Standard' },
    { id: 'ru', name: 'Русский', font: 'Standard' },
    { id: 'akk', name: 'Аккадский', font: 'Cuneiform_Akkadian' }
];

const testWords = [
    { concept_id: 1, lang_id: 'en', word: 'book', transcription: '[bʊk]', variations: 'books', association: 'Бук (буквенный лес)', image_url: '', source: 'Оксфорд' },
    { concept_id: 1, lang_id: 'ru', word: 'книга', transcription: '[кни́га]', variations: 'книги', association: 'Книжный червь', image_url: '', source: 'Толковый' },
    { concept_id: 1, lang_id: 'akk', word: 'ṭuppu', transcription: '[tuppu]', variations: '区分, tuppum', association: 'Глиняная табличка', image_url: 'https://via.placeholder.com/150', source: 'Бородин' }
];

const testExamples = [
    { concept_id: 1, lang_id: 'en', text: 'I read an interesting book.', translation: 'Я читаю интересную книгу.' },
    { concept_id: 1, lang_id: 'en', text: 'Open your books on page 5.', translation: 'Откройте книги на странице 5.' },
    { concept_id: 1, lang_id: 'akk', text: 'ṭuppam šaṭārum', translation: 'Написать табличку (книгу).' }
];

/**
 * Главная функция инициализации экрана карточек
 * @param {HTMLElement} container — куда рендерить карточки
 */
function initCards(container) {
    // На данном этапе берем концепт №1
    const currentConceptId = 1;
    
    // Генерируем HTML-структуру карточки
    container.innerHTML = renderConceptCard(currentConceptId);
    
    // Подключаем интерактив (аккордеоны примеров, переключение языков и т.д.)
    setupCardListeners(container);
}

/**
 * Генерирует HTML для всей мультиязычной карточки одного концепта
 */
function renderConceptCard(conceptId) {
    // Находим все переводы для этого концепта
    const wordsForConcept = testWords.filter(w => w.concept_id === conceptId);
    
    let languagesHTML = '';
    let imageHTML = '';

    wordsForConcept.forEach(wordData => {
        const lang = testLanguages.find(l => l.id === wordData.lang_id) || { name: wordData.lang_id };
        
        // Собираем примеры для конкретного языка этого слова
        const examples = testExamples.filter(e => e.concept_id === conceptId && e.lang_id === wordData.lang_id);
        let examplesHTML = '';
        
        if (examples.length > 0) {
            examplesHTML = `
                <div class="card-examples-section">
                    <button class="toggle-examples-btn">Примеры употребления (${examples.length}) ▾</button>
                    <div class="examples-list hidden">
                        ${examples.map(ex => `
                            <div class="example-item">
                                <p class="ex-text">${ex.text}</p>
                                <p class="ex-trans">${ex.translation}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Проверяем, есть ли картинка у этого слова (для экономии места выведем первую найденную в карточке)
        if (wordData.image_url && !imageHTML) {
            imageHTML = `
                <div class="card-image-wrapper">
                    <img src="${wordData.image_url}" alt="Concept Image" class="card-concept-img">
                </div>
            `;
        }

        // Собираем блок конкретного языка
        languagesHTML += `
            <div class="lang-row" data-lang="${wordData.lang_id}">
                <div class="lang-badge">${lang.name}</div>
                
                <div class="word-main-info">
                    <!-- Класс шрифта подставим динамически в будущем (например, для клинописи) -->
                    <span class="word-title ${lang.font || ''}">${wordData.word}</span>
                    ${wordData.transcription ? `<span class="word-transcription">${wordData.transcription}</span>` : ''}
                </div>

                ${wordData.variations ? `<p class="word-variations"><b>Варианты:</b> ${wordData.variations}</p>` : ''}
                ${wordData.association ? `<p class="word-association">💡 <b>Ассоциация:</b> ${wordData.association}</p>` : ''}
                
                ${examplesHTML}
                <hr class="lang-divider">
            </div>
        `;
    });

    return `
        <div class="concept-card">
            <div class="card-top-info">
                <span class="concept-id-badge">ID Концепта: #${conceptId}</span>
            </div>
            
            ${imageHTML}
            
            <div class="card-languages-container">
                ${languagesHTML}
            </div>
        </div>
    `;
}

/**
 * Навешивает события (клик по кнопкам раскрытия примеров)
 */
function setupCardListeners(container) {
    const toggleButtons = container.querySelectorAll('.toggle-examples-btn');
    
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const list = e.target.nextElementSibling;
            list.classList.toggle('hidden');
            
            // Меняем стрелочку на кнопке
            if (list.classList.contains('hidden')) {
                e.target.textContent = e.target.textContent.replace('▴', '▾');
            } else {
                e.target.textContent = e.target.textContent.replace('▾', '▴');
            }
        });
    });
}

window.initCards = initCards;