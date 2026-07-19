/**
 * ADD.JS — Экран добавления слов с поддержкой реляционной структуры примеров.
 * Полностью интегрирован с глобальным состоянием ядра (main.js).
 */

// Грамматические категории (Части речи) для селекта
const grammarCategories = [
    { id: 'существительное', name: 'существительное' },
    { id: 'глагол', name: 'глагол' },
    { id: 'прилагательное', name: 'прилагательное' },
    { id: 'числительное', name: 'числительное' },
    { id: 'местоимение', name: 'местоимение' },
    { id: 'имя собственное', name: 'имя собственное' },
    { id: 'наречие', name: 'наречие' },
    { id: 'другое', name: 'другое' }
];

// Глобальное состояние текущей карточки в рамках экрана добавления
let currentCardState = {
    Concept_ID: null,
    Lang_ID: '',
    Word: '',
    Translation: '',
    Transcription: '',
    Variations: '', // Раздельное поле: Варианты / Синонимы
    Source: '',     // Раздельное поле: Источник памятника
    Association: '',
    Image_URL: '',
    Folder: 'Общая',
    Part_Of_Speech: '',
    Comment: '',
    examples: [] // Массив объектов новой структуры Examples
};

// Флаги видимости дополнительных полей UI
let activeOptionalFields = {
    grammar: false,
    transcription: false,
    association: false,
    comment: false,
	variations: false,
	source: false,
    image_url: false,
    examples: false // Строго в самом конце списка
};

/**
 * Инициализация экрана добавления (вызывается роутером из main.js)
 */
function initAddScreen(container) {
    const languages = window.APP_STATE.languages || [];

    // Предзаполняем язык, если он выбран на дашборде
    if (typeof dashboardState !== 'undefined' && dashboardState.selectedLangId) {
        currentCardState.Lang_ID = dashboardState.selectedLangId;
    } else if (languages.length > 0) {
        currentCardState.Lang_ID = languages[0].ID;
    }
    
    if (typeof dashboardState !== 'undefined' && dashboardState.selectedFolderName) {
        currentCardState.Folder = dashboardState.selectedFolderName;
    }

    renderAddForm(container);
}

/**
 * Отрисовка формы в переданный контейнер рабочей зоны
 */
function renderAddForm(container) {
    const languages = window.APP_STATE.languages || [];
    const words = window.APP_STATE.words || [];

    // Генерируем опции языков на базе загруженного глобального APP_STATE
    const langOptions = languages.map(l => 
        `<option value="${l.ID}">${l.Language_Name} (${l.Language_Code})</option>`
    ).join('');
    
    const grammarOptions = `<option value="">Часть речи...</option>` + 
        grammarCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    // Сбор уникальных папок из базы для автодополнения/выбора
    const uniqueFolders = [...new Set(words.map(w => w.Folder || "Общая"))];
    if (!uniqueFolders.includes(currentCardState.Folder)) {
        uniqueFolders.push(currentCardState.Folder);
    }
    const folderOptions = uniqueFolders.map(f => `<option value="${f}">${f}</option>`).join('');

    // Рендеринг расширенного блока примеров (до 10 штук) в виде компактных строк
    let examplesHTML = '';
    if (activeOptionalFields.examples) {
        examplesHTML = '<div class="examples-dynamic-section">';
        
        currentCardState.examples.forEach((ex, index) => {
            const isExpanded = !!ex._expanded;
            examplesHTML += `
                <div class="example-form-row card-meta-bubble animate-fade" data-index="${index}">
                    <div class="example-row-header">
                        <strong>Пример #${index + 1}</strong>
                        <div class="example-actions-group" style="display: flex; gap: 10px; align-items: center;">
                            <button type="button" class="toggle-example-details-btn" data-index="${index}" title="${isExpanded ? 'Скрыть доп. поля' : 'Показать доп. поля'}" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; color: var(--primary-color, #2563eb); font-weight: bold;">
                                ${isExpanded ? '−' : '＋'}
                            </button>
                            <button class="remove-example-btn" data-index="${index}" title="Удалить пример">✕</button>
                        </div>
                    </div>
                    <div class="example-inputs-grid">
                        <!-- Базовое поле текста примера (доступно всегда) -->
                        <input type="text" class="minimal-input ex-text-input" placeholder="Текст примера (обязательно)..." value="${ex.Example_Text || ''}">
                        
                        <!-- Дополнительные поля мелким шрифтом, скрытые по умолчанию -->
                        ${isExpanded ? `
                            <div class="example-optional-fields animate-fade" style="display: flex; flex-direction: column; gap: 6px; margin-top: 4px;">
                                <input type="text" class="minimal-input ex-trans-input" placeholder="Перевод примера..." value="${ex.Example_Translation || ''}" style="font-size: 0.85rem; padding: 6px 8px;">
                                <input type="text" class="minimal-input ex-transc-input" placeholder="[Транскрипция примера / IPA]" value="${ex.Example_Transcription || ''}" style="font-size: 0.85rem; padding: 6px 8px;">
                                <input type="text" class="minimal-input ex-comment-input" placeholder="Комментарий к примеру..." value="${ex.Example_Comment || ''}" style="font-size: 0.85rem; padding: 6px 8px;">
                                <input type="text" class="minimal-input ex-source-input" placeholder="Источник примера..." value="${ex.Example_Source || ''}" style="font-size: 0.85rem; padding: 6px 8px;">
                                <input type="text" class="minimal-input ex-font-input" placeholder="Шрифт примера (Кастомный CSS Font)..." value="${ex.Example_Font || ''}" style="font-size: 0.85rem; padding: 6px 8px;">
                                <input type="text" class="minimal-input ex-add-concepts-input" placeholder="Дополнительные Concept_IDs (через запятую)..." value="${ex.Additional_Concept_IDs || ''}" style="font-size: 0.85rem; padding: 6px 8px;">
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        if (currentCardState.examples.length < 10) {
            examplesHTML += `
                <div class="add-more-example-zone animate-fade" style="text-align: left; margin-top: 10px;">
                    <button id="add-more-example-btn" class="add-sub-link-btn">+ Добавить пример (${currentCardState.examples.length}/10)</button>
                </div>
            `;
        }
        examplesHTML += '</div>';
    }

    container.innerHTML = `
        <div class="add-screen-container">
            <!-- КНОПКА ОЧИСТКИ ВЕРХНЕЙ ЧАСТИ ФОРМЫ -->
            <div class="clear-zone-container">
                <button id="clear-fields-btn" class="clear-action-link">✕ Очистить введенные поля</button>
            </div>

            <div class="field-block section-original">
                <!-- Основные поля ввода -->
                <div class="input-group-row">
                    <input type="text" id="input-word" class="minimal-input" placeholder="Новое слово..." value="${currentCardState.Word}">
                    <select id="form-lang-select" class="minimal-select">${langOptions}</select>
                </div>

                <div class="input-group-row">
                    <input type="text" id="input-translation" class="minimal-input" placeholder="Перевод..." value="${currentCardState.Translation || ''}">
                </div>

                <div class="dynamic-fields-container align-left-fields">
                    ${activeOptionalFields.grammar ? `
                        <div class="input-group-row dynamic-row animate-fade dropdown-group-row">
                            <select id="form-pos-select" class="minimal-select full-width-select">${grammarOptions}</select>
                            <select id="form-folder-select" class="minimal-select full-width-select">
                                ${folderOptions}
                                <option value="__NEW__">+ Создать новую папку...</option>
                            </select>
                        </div>
                    ` : ''}

                    ${activeOptionalFields.transcription ? `
                        <div class="input-group-row dynamic-row animate-fade">
                            <input type="text" id="input-transcription" class="minimal-input sub-input" placeholder="[транскрипция]" value="${currentCardState.Transcription}">
                        </div>
                    ` : ''}

                    ${activeOptionalFields.association ? `
                        <div class="input-group-row dynamic-row animate-fade">
                            <input type="text" id="input-association" class="minimal-input sub-input mental-input" placeholder="💡 Мнемоническая ассоциация..." value="${currentCardState.Association}">
                        </div>
                    ` : ''}

                    ${activeOptionalFields.comment ? `
                        <div class="input-group-row dynamic-row animate-fade">
                            <textarea id="textarea-comment" class="minimal-input sub-input" placeholder="💬 Лингвистический комментарий..." style="height: 60px; resize: vertical;">${currentCardState.Comment}</textarea>
                        </div>
                    ` : ''}

                    ${activeOptionalFields.variations ? `
                        <div class="input-group-row dynamic-row animate-fade">
                            <input type="text" id="input-variations" class="minimal-input sub-input" placeholder="🎲 Синонимы..." value="${currentCardState.Variations}">
                        </div>
                    ` : ''}
					
					${activeOptionalFields.source ? `
                        <div class="input-group-row dynamic-row animate-fade">
                            <input type="text" id="input-source" class="minimal-input sub-input" placeholder="📖 Источник слова (книга, табличка, автор)..." value="${currentCardState.Source}">
                        </div>
                    ` : ''}

                    ${activeOptionalFields.image_url ? `
                        <div class="input-group-row dynamic-row animate-fade">
                            <input type="url" id="input-image-url" class="minimal-input sub-input url-input" placeholder="🖼️ Ссылка на картинку или образ..." value="${currentCardState.Image_URL}">
                        </div>
                    ` : ''}
                    
                    <!-- Примеры контекста строго в самом конце списка полей -->
                    ${examplesHTML}
                </div>
            </div>

            <!-- ПАНЕЛЬ ТУГГЛОВ -->
            <div class="optional-fields-toggles">
                <button class="toggle-field-btn ${activeOptionalFields.grammar ? 'active' : ''}" data-field="grammar">Категория</button>
                <button class="toggle-field-btn ${activeOptionalFields.transcription ? 'active' : ''}" data-field="transcription">Транскрипция</button>
                <button class="toggle-field-btn ${activeOptionalFields.association ? 'active' : ''}" data-field="association">Ассоциация</button>
                <button class="toggle-field-btn ${activeOptionalFields.comment ? 'active' : ''}" data-field="comment">Комментарий</button>
                <button class="toggle-field-btn ${activeOptionalFields.variations ? 'active' : ''}" data-field="variations">Синонимы</button>
                <button class="toggle-field-btn ${activeOptionalFields.source ? 'active' : ''}" data-field="source">Источник</button>
				<button class="toggle-field-btn ${activeOptionalFields.image_url ? 'active' : ''}" data-field="image_url">Картинка</button>
                <button class="toggle-field-btn ${activeOptionalFields.examples ? 'active' : ''}" data-field="examples">Примеры контекста</button>
            </div>

            <!-- ИНДИКАТОР АВТОСОХРАНЕНИЯ -->
            <div class="autosave-status" style="text-align:center; min-height:20px; margin: 10px 0;"></div>

            <!-- ФИКСИРОВАННАЯ КНОПКА ОТПРАВКИ -->
            <div class="plus-btn-container">
                <button id="submit-word-btn" class="huge-plus-btn" title="Сохранить слово и примеры в Google Таблицу">＋</button>
            </div>
        </div>
    `;

    // Синхронизируем значения элементов выбора, если они отрендерены
    if (document.getElementById('form-lang-select')) {
        document.getElementById('form-lang-select').value = currentCardState.Lang_ID;
    }
    if (activeOptionalFields.grammar) {
        if (document.getElementById('form-pos-select')) document.getElementById('form-pos-select').value = currentCardState.Part_Of_Speech;
        if (document.getElementById('form-folder-select')) document.getElementById('form-folder-select').value = currentCardState.Folder;
    }

    setupAddListeners(container);
}

/**
 * Привязка слушателей событий UI и отправка в бэкенд
 */
function setupAddListeners(container) {
    
    // Сбор текущего состояния UI в объект JS
    const syncStateFromDOM = () => {
        const wordInput = document.getElementById('input-word');
        const translationInput = document.getElementById('input-translation');
        const langSelect = document.getElementById('form-lang-select');
        
        if (wordInput) currentCardState.Word = wordInput.value.trim();
        if (translationInput) currentCardState.Translation = translationInput.value.trim();
        if (langSelect) currentCardState.Lang_ID = langSelect.value;
        
        if (activeOptionalFields.grammar) {
            const posSelect = document.getElementById('form-pos-select');
            const folderSelect = document.getElementById('form-folder-select');
            if (posSelect) currentCardState.Part_Of_Speech = posSelect.value;
            if (folderSelect) currentCardState.Folder = folderSelect.value;
        }
        if (activeOptionalFields.transcription && document.getElementById('input-transcription')) {
            currentCardState.Transcription = document.getElementById('input-transcription').value.trim();
        }
        if (activeOptionalFields.association && document.getElementById('input-association')) {
            currentCardState.Association = document.getElementById('input-association').value.trim();
        }
        if (activeOptionalFields.comment && document.getElementById('textarea-comment')) {
            currentCardState.Comment = document.getElementById('textarea-comment').value.trim();
        }
        if (activeOptionalFields.variations && document.getElementById('input-variations')) {
            currentCardState.Variations = document.getElementById('input-variations').value.trim();
        }
        if (activeOptionalFields.source && document.getElementById('input-source')) {
            currentCardState.Source = document.getElementById('input-source').value.trim();
        }
        if (activeOptionalFields.image_url && document.getElementById('input-image-url')) {
            currentCardState.Image_URL = document.getElementById('input-image-url').value.trim();
        }
        
        // Чтение динамических полей примеров
        if (activeOptionalFields.examples) {
            const rows = container.querySelectorAll('.example-form-row');
            currentCardState.examples = Array.from(rows).map((row, i) => {
                const transInp = row.querySelector('.ex-trans-input');
                const transcInp = row.querySelector('.ex-transc-input');
                const commInp = row.querySelector('.ex-comment-input');
                const srcInp = row.querySelector('.ex-source-input');
                const fontInp = row.querySelector('.ex-font-input');
                const addConInp = row.querySelector('.ex-add-concepts-input');

                return {
                    Example_Text: row.querySelector('.ex-text-input').value.trim(),
                    Example_Translation: transInp ? transInp.value.trim() : (currentCardState.examples[i]?.Example_Translation || ''),
                    Example_Transcription: transcInp ? transcInp.value.trim() : (currentCardState.examples[i]?.Example_Transcription || ''),
                    Example_Comment: commInp ? commInp.value.trim() : (currentCardState.examples[i]?.Example_Comment || ''),
                    Example_Source: srcInp ? srcInp.value.trim() : (currentCardState.examples[i]?.Example_Source || ''),
                    Example_Font: fontInp ? fontInp.value.trim() : (currentCardState.examples[i]?.Example_Font || ''),
                    Additional_Concept_IDs: addConInp ? addConInp.value.trim() : (currentCardState.examples[i]?.Additional_Concept_IDs || ''),
                    _expanded: currentCardState.examples[i]?._expanded || false
                };
            });
        }
    };

    // Слушатель для кнопки полной очистки полей формы
    const clearBtn = document.getElementById('clear-fields-btn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            currentCardState.Word = '';
            currentCardState.Translation = '';
            currentCardState.Transcription = '';
            currentCardState.Variations = '';
            currentCardState.Association = '';
            currentCardState.Image_URL = '';
            currentCardState.Source = '';
            currentCardState.Part_Of_Speech = '';
            currentCardState.Comment = '';
            currentCardState.examples = [];
            
            // Закрываем вкладки дополнительных полей
            Object.keys(activeOptionalFields).forEach(key => activeOptionalFields[key] = false);
            
            renderAddForm(container);
        };
    }

    // Переключатели доп. панелей тугглов
    container.querySelectorAll('.toggle-field-btn').forEach(btn => {
        btn.onclick = (e) => {
            const field = e.target.dataset.field;
            syncStateFromDOM();
            activeOptionalFields[field] = !activeOptionalFields[field];
            renderAddForm(container);
        };
    });

    // Создание новой папки через prompt диалог
    if (activeOptionalFields.grammar) {
        const folderSelect = document.getElementById('form-folder-select');
        if (folderSelect) {
            folderSelect.onchange = () => {
                if (folderSelect.value === '__NEW__') {
                    const newName = prompt('Введите название новой категории/папки:');
                    if (newName && newName.trim()) {
                        currentCardState.Folder = newName.trim();
                    } else {
                        currentCardState.Folder = 'Общая';
                    }
                    renderAddForm(container);
                }
            };
        }
    }

    // Управление динамическими примерами (Добавление / Удаление в строке / Разворачивание полей)
    if (activeOptionalFields.examples) {
        const addMoreBtn = document.getElementById('add-more-example-btn');
        if (addMoreBtn) {
            addMoreBtn.onclick = () => {
                syncStateFromDOM();
                if (currentCardState.examples.length < 10) {
                    currentCardState.examples.push({ 
                        Example_Text: '', 
                        Example_Translation: '',
                        Example_Transcription: '', 
                        Example_Comment: '', 
                        Example_Source: '',
                        Example_Font: '',
                        Additional_Concept_IDs: '',
                        _expanded: false
                    });
                    renderAddForm(container);
                }
            };
        }

        // Слушатель разворачивания дополнительных полей примера через "+"
        container.querySelectorAll('.toggle-example-details-btn').forEach(btn => {
            btn.onclick = (e) => {
                syncStateFromDOM();
                const idx = parseInt(e.currentTarget.dataset.index, 10);
                currentCardState.examples[idx]._expanded = !currentCardState.examples[idx]._expanded;
                renderAddForm(container);
            };
        });

        container.querySelectorAll('.remove-example-btn').forEach(btn => {
            btn.onclick = (e) => {
                syncStateFromDOM();
                const idx = parseInt(e.target.dataset.index, 10);
                currentCardState.examples.splice(idx, 1);
                renderAddForm(container);
            };
        });
    }

    // Финальная кнопка отправки данных (Обращение к транспорту ядра main.js)
    const submitBtn = document.getElementById('submit-word-btn');
    if (submitBtn) {
        submitBtn.onclick = async () => {
            syncStateFromDOM();
            
            if (!currentCardState.Word) {
                if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('error');
                alert('Поле "Новое слово" обязательно для заполнения!');
                return;
            }

            // Валидация обязательных полей для заполненных примеров
            if (activeOptionalFields.examples && currentCardState.examples.length > 0) {
                for (let i = 0; i < currentCardState.examples.length; i++) {
                    const ex = currentCardState.examples[i];
                    if (!ex.Example_Text) {
                        if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('error');
                        alert(`В примере #${i + 1} поле "Текст примера" обязательно для заполнения!`);
                        return;
                    }
                }
            }

            // Блокируем элемент управления отправкой
            submitBtn.disabled = true;
            if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('process');

            // ID связи для реляционной целостности таблиц
            const conceptId = 'C_' + Date.now();

            // 1. Формируем тело запроса для Слова
            const wordPayload = {
                _targetSheet: 'Words',
                Concept_ID: conceptId,
                Lang_ID: currentCardState.Lang_ID,
                Word: currentCardState.Word,
                Translation: currentCardState.Translation,
                Transcription: currentCardState.Transcription,
                Variations: currentCardState.Variations, // Сохраняем варианты отдельно
                Source: currentCardState.Source,         // Сохраняем источник отдельно
                Association: currentCardState.Association,
                Image_URL: currentCardState.Image_URL,
                Folder: currentCardState.Folder,
                Part_Of_Speech: currentCardState.Part_Of_Speech,
                Comment: currentCardState.Comment
            };

            // 2. Сборка массива промисов примеров с автовычислением служебных тэгов Concept_ID и Lang_ID
            const examplesPromises = currentCardState.examples.map(ex => {
                return window.sendToDatabase({
                    _targetSheet: 'Examples',
                    Concept_ID: conceptId,       
                    Lang_ID: currentCardState.Lang_ID, 
                    Example_Text: ex.Example_Text,
                    Example_Transcription: ex.Example_Transcription,
                    Example_Translation: ex.Example_Translation,
                    Example_Comment: ex.Example_Comment,
                    Example_Source: ex.Example_Source,
                    Example_Font: ex.Example_Font,
                    Additional_Concept_IDs: ex.Additional_Concept_IDs
                });
            });

            try {
                // Отправляем основное слово через глобальный транспорт ядра
                await window.sendToDatabase(wordPayload);
                
                // Отправляем связанные примеры пачкой (параллельно)
                if (examplesPromises.length > 0) {
                    await Promise.all(examplesPromises);
                }

                if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('success');

                // Мягкий сброс формы (сохраняем выбранную папку, язык и источник для потокового ввода)
                currentCardState = {
                    Concept_ID: null,
                    Lang_ID: currentCardState.Lang_ID,
                    Word: '',
                    Translation: '',
                    Transcription: '',
                    Variations: '',
                    Association: '',
                    Image_URL: '',
                    Source: currentCardState.Source, // Оставляем для потокового ввода памятников
                    Folder: currentCardState.Folder,
                    Part_Of_Speech: '',
                    Comment: '',
                    examples: []
                };

                // Сворачиваем дополнительные вкладки для чистоты интерфейса
                Object.keys(activeOptionalFields).forEach(key => activeOptionalFields[key] = false);
                
                // Перезагружаем кэш данных приложения и обновляем списки
                if (typeof window.initApp === 'function') {
                    await window.initApp();
                }

                // Фокусируем пользователя обратно на поле ввода
                const newWordInput = document.getElementById('input-word');
                if (newWordInput) newWordInput.focus();

            } catch (err) {
                console.error('Ошибка добавления записи:', err);
                if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('error');
            } finally {
                submitBtn.disabled = false;
            }
        };
    }
}

// Экспортируем функции в глобальную область видимости для роутера ядра
window.initAddScreen = initAddScreen;
window.renderAddForm = renderAddForm;