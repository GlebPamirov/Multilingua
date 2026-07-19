/**
 * DASHBOARD.JS — Двухуровневая приборная панель + Динамические папки и карточки из БД.
 * Полностью интегрирован с глобальным состоянием ядра (main.js).
 */

// Глобальное состояние навигации внутри дашборда
let dashboardState = {
    currentView: 'languages', // 'languages', 'folders', 'words'
    selectedLangId: null,      // ID выбранного языка
    selectedFolderName: null   // Имя выбранной папки (вычисляется из Words.Folder)
};

let activeMenuLangId = null;
let activeMenuFolderName = null;

/**
 * Инициализация экрана дашборда (вызывается роутером из main.js)
 */
function initDashboard(container) {
    renderDashboard(container);
}

/**
 * Главный распределитель рендеринга видов дашборда
 */
function renderDashboard(container) {
    if (dashboardState.currentView === 'languages') {
        renderLanguagesView(container);
    } else if (dashboardState.currentView === 'folders') {
        renderFoldersView(container);
    } else if (dashboardState.currentView === 'words') {
        renderWordsView(container);
    }
}

/**
 * 1. Экран ЯЗЫКОВ (Берет данные из реального кеша БД)
 */
function renderLanguagesView(container) {
    const languages = window.APP_STATE.languages || [];
    const words = window.APP_STATE.words || [];

    const languagesHTML = languages.map(lang => {
        const total = lang.Words_Count || 0;
        const progress = lang.Mastered_Percentage || 0;

        // Вычисляем показатели для меню PLAY по этому языку
        const langWords = words.filter(w => w.Lang_ID == lang.ID);
        const unlearned = langWords.filter(w => !w.Repetitions || parseInt(w.Repetitions) === 0).length;
        const now = new Date();
        const readyForReview = langWords.filter(w => w.Next_Review && new Date(w.Next_Review) <= now).length;

        return `
            <div class="lang-card" data-lang-id="${lang.ID}">
                <div class="lang-card-main">
                    <div class="lang-card-info select-lang-trigger">
                        <div class="lang-card-name" style="font-family: ${lang.Script_Font_1 || 'inherit'}">${lang.Language_Name} <span class="lang-card-code">(${lang.Language_Code})</span></div>
                        <div class="lang-card-meta"><span>Слов: <b>${total}</b></span> • <span>Прогресс: <b>${progress}%</b></span></div>
                    </div>
                    <button class="play-btn lang-play-trigger" data-lang-id="${lang.ID}" data-unlearned="${unlearned}" data-review="${readyForReview}">PLAY</button>
                </div>
                <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${progress}%"></div></div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="dashboard-container">
            <h2 class="screen-title">Ваши языки</h2>
            <div class="languages-list">${languagesHTML || '<p class="empty-notify">Список языков пуст. Нажмите (+), чтобы добавить первый язык.</p>'}</div>
            <div class="plus-btn-container"><button id="add-new-lang-btn" class="huge-plus-btn">＋</button></div>
        </div>
        ${getModalMenuHTML()}
    `;
    setupLanguagesListeners(container);
}

/**
 * 2. Экран ПАПОК (Динамически группирует из Words)
 */
function renderFoldersView(container) {
    const languages = window.APP_STATE.languages || [];
    const words = window.APP_STATE.words || [];
    
    const currentLang = languages.find(l => l.ID == dashboardState.selectedLangId);
    
    // Вытаскиваем все слова выбранного языка
    const langWords = words.filter(w => w.Lang_ID == dashboardState.selectedLangId);
    
    // Собираем уникальный список папок
    const folderMap = {};
    langWords.forEach(w => {
        const fName = w.Folder || "Общая";
        if (!folderMap[fName]) {
            folderMap[fName] = { name: fName, total_words: 0, unlearned: 0, ready_for_review: 0, mastered: 0 };
        }
        folderMap[fName].total_words++;
        if (!w.Repetitions || parseInt(w.Repetitions) === 0) folderMap[fName].unlearned++;
        if (w.Interval_Step && parseInt(w.Interval_Step) >= 4) folderMap[fName].mastered++;
        
        const now = new Date();
        if (w.Next_Review && new Date(w.Next_Review) <= now) folderMap[fName].ready_for_review++;
    });

    const foldersHTML = Object.values(folderMap).map(folder => {
        const progress = folder.total_words > 0 ? Math.round((folder.mastered / folder.total_words) * 100) : 0;
        return `
            <div class="lang-card folder-card" data-folder-name="${folder.name}">
                <div class="lang-card-main">
                    <div class="lang-card-info select-folder-trigger">
                        <div class="lang-card-name">📁 ${folder.name}</div>
                        <div class="lang-card-meta"><span>Слов: <b>${folder.total_words}</b></span> • <span>Прогресс: <b>${progress}%</b></span></div>
                    </div>
                    <button class="play-btn folder-play-trigger" data-folder-name="${folder.name}" data-unlearned="${folder.unlearned}" data-review="${folder.ready_for_review}">PLAY</button>
                </div>
                <div class="progress-bar-container"><div class="progress-bar-fill" style="width: ${progress}%"></div></div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header-nav">
                <button id="back-to-langs-btn" class="back-link-btn">← Назад к языкам</button>
                <h2 class="screen-title text-accent">${currentLang ? currentLang.Language_Name : 'Категории'}</h2>
            </div>
            <div class="languages-list">${foldersHTML || '<p class="empty-notify">В этом языке еще нет папок. Добавьте первое слово!</p>'}</div>
            <button id="add-new-folder-btn" class="huge-plus-btn type-folder">＋</button>
        </div>
        ${getModalMenuHTML()}
    `;
    setupFoldersListeners(container);
}

/**
 * 3. Экран списка слов в выбранной папке
 */
function renderWordsView(container) {
    const languages = window.APP_STATE.languages || [];
    const words = window.APP_STATE.words || [];

    const currentLang = languages.find(l => l.ID == dashboardState.selectedLangId);
    const folderWords = words.filter(w => w.Lang_ID == dashboardState.selectedLangId && (w.Folder || "Общая") === dashboardState.selectedFolderName);

    const wordsHTML = folderWords.map(w => `
        <div class="word-list-row" data-concept-id="${w.Concept_ID}">
            <span class="word-cell-native" style="font-family: ${currentLang?.Script_Font_1 || 'inherit'}">${w.Word}</span>
            <span class="word-cell-arrow">→</span>
			<span class="word-cell-native" style="font-family: ${currentLang?.Script_Font_1 || 'inherit'}">${w.Translation}</span>
            
        </div>
    `).join('');

    container.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header-nav">
                <button id="back-to-folders-btn" class="back-link-btn">← Назад к папкам</button>
                <h2 class="screen-title text-accent">📁 ${dashboardState.selectedFolderName}</h2>
            </div>
            
            <div class="words-simplified-list">
                ${wordsHTML || '<p class="empty-notify">В этой категории пока нет слов.</p>'}
            </div>

            <button id="add-new-word-direct-btn" class="huge-plus-btn type-word" title="Добавить слово в эту папку">＋</button>
        </div>
        
        <div id="word-card-overlay" class="modal-overlay hidden">
            <div class="word-detail-card animate-fade">
                <button id="close-card-btn" class="close-card-top-btn">✕</button>
                <div id="word-card-content"></div>
            </div>
        </div>
    `;

    setupWordsListeners(container);
}

/**
 * Модальное окно режимов обучения / повторения сессии
 */
function getModalMenuHTML() {
    return `
        <div id="play-menu-overlay" class="modal-overlay hidden">
            <div class="play-menu-modal">
                <div class="modal-header">
                    <h3 id="modal-lang-title">Выбор действия</h3>
                    <button id="close-modal-btn" class="close-modal-btn">✕</button>
                </div>
                <div class="modal-menu-options">
                    <button class="menu-opt-btn" data-action="add"><span>0) Добавить новое слово</span></button>
                    <button class="menu-opt-btn" data-action="learn" id="opt-learn-btn"><span>1) Учить новые слова</span><small class="opt-badge" id="badge-unlearned">--</small></button>
                    <button class="menu-opt-btn" data-action="review" id="opt-review-btn"><span>2) Повторить</span><small class="opt-badge warning" id="badge-review">--</small></button>
                    <button class="menu-opt-btn" data-action="browse"><span>4) Обзор всех карточек</span></button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Слушатели для вида ЯЗЫКОВ
 */
function setupLanguagesListeners(container) {
    container.querySelectorAll('.select-lang-trigger').forEach(trigger => {
        trigger.onclick = (e) => {
            const card = e.target.closest('.lang-card');
            dashboardState.currentView = 'folders';
            dashboardState.selectedLangId = card.dataset.langId;
            renderDashboard(container);
        };
    });

    container.querySelectorAll('.lang-play-trigger').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const t = e.target;
            activeMenuLangId = t.dataset.langId;
            activeMenuFolderName = null;
            const languages = window.APP_STATE.languages || [];
            const langObj = languages.find(l => l.ID == activeMenuLangId);
            if (langObj) {
                openPlayMenu(langObj.Language_Name, { unlearned: t.dataset.unlearned, ready_for_review: t.dataset.review });
            }
        };
    });

    const addLangBtn = document.getElementById('add-new-lang-btn');
    if (addLangBtn) {
        addLangBtn.onclick = async () => {
            const name = prompt('Название нового языка (например, Akkadian Cuneiform):');
            const code = prompt('Короткий код для UI (например, AKK):');
            const font = prompt('Имя шрифта CSS (опционально):') || '';
            
            if (name && code) {
                if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('process');
                try {
                    await window.sendToDatabase({
                        _targetSheet: 'Languages',
                        ID: 'L_' + Date.now(),
                        Language_Name: name.trim(),
                        Language_Code: code.trim().toUpperCase(),
                        Script_Font_1: font.trim(),
                        Words_Count: 0,
                        Mastered_Percentage: 0
                    });
                    
                    if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('success');
                    
                    // Перезапрашиваем данные из Google Таблиц в кэш ядра
                    if (typeof window.initApp === 'function') {
                        await window.initApp();
                    }
                } catch (err) {
                    console.error('Ошибка добавления языка:', err);
                    if (typeof window.showAutosaveStatus === 'function') window.showAutosaveStatus('error');
                }
            }
        };
    }
    setupSharedModalListeners();
}

/**
 * Слушатели для вида ПАПОК
 */
function setupFoldersListeners(container) {
    const backBtn = document.getElementById('back-to-langs-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            dashboardState.currentView = 'languages';
            dashboardState.selectedLangId = null;
            renderDashboard(container);
        };
    }

    container.querySelectorAll('.select-folder-trigger').forEach(trigger => {
        trigger.onclick = (e) => {
            const card = e.target.closest('.lang-card');
            dashboardState.currentView = 'words';
            dashboardState.selectedFolderName = card.dataset.folderName;
            renderDashboard(container);
        };
    });

    container.querySelectorAll('.folder-play-trigger').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const t = e.target;
            activeMenuFolderName = t.dataset.folderName;
            activeMenuLangId = dashboardState.selectedLangId;
            openPlayMenu(`Папка: ${activeMenuFolderName}`, { unlearned: t.dataset.unlearned, ready_for_review: t.dataset.review });
        };
    });

    const addFolderBtn = document.getElementById('add-new-folder-btn');
    if (addFolderBtn) {
        addFolderBtn.onclick = () => {
            const folderName = prompt('Введите название новой папки:');
            if (folderName && folderName.trim()) {
                // В реляционной архитектуре папка физически материализуется при создании в ней первого слова
                dashboardState.currentView = 'words';
                dashboardState.selectedFolderName = folderName.trim();
                renderDashboard(container);
            }
        };
    }
    setupSharedModalListeners();
}

/**
 * Слушатели для вида СПИСКА СЛОВ
 */
function setupWordsListeners(container) {
    const backBtn = document.getElementById('back-to-folders-btn');
    if (backBtn) {
        backBtn.onclick = () => {
            dashboardState.currentView = 'folders';
            dashboardState.selectedFolderName = null;
            renderDashboard(container);
        };
    }

    container.querySelectorAll('.word-list-row').forEach(row => {
        row.onclick = () => {
            const conceptId = row.dataset.conceptId;
            const words = window.APP_STATE.words || [];
            const wordObj = words.find(w => w.Concept_ID === conceptId);
            if (wordObj) openFullWordCard(wordObj);
        };
    });

    const addWordDirectBtn = document.getElementById('add-new-word-direct-btn');
    if (addWordDirectBtn) {
        addWordDirectBtn.onclick = () => {
            handleMenuAction('add', dashboardState.selectedLangId, dashboardState.selectedFolderName);
        };
    }
}

/**
 * Открытие детальной карточки слова с подтягиванием связанных контекстных примеров
 */
function openFullWordCard(w) {
    const overlay = document.getElementById('word-card-overlay');
    const content = document.getElementById('word-card-content');
    const closeBtn = document.getElementById('close-card-btn');

    const languages = window.APP_STATE.languages || [];
    const examples = window.APP_STATE.examples || [];
    const currentLang = languages.find(l => l.ID == w.Lang_ID);

    // Вытягиваем реляционные примеры из кэша, проверяя основной и дополнительные Concept_ID
    const relatedExamples = examples.filter(ex => {
        if (ex.Concept_ID === w.Concept_ID) return true;
        if (ex.Additional_Concept_IDs) {
            const ids = ex.Additional_Concept_IDs.split(',').map(id => id.trim());
            return ids.includes(w.Concept_ID);
        }
        return false;
    });

    const examplesListHTML = relatedExamples.length > 0
        ? `<div class="card-detail-section">
            <h4 class="card-section-title">Примеры контекста:</h4>
            <ul class="card-examples-list">
                ${relatedExamples.map(ex => `
                    <li style="font-family: ${ex.Example_Font || currentLang?.Script_Font_1 || 'inherit'}">
                        <b>“ ${ex.Example_Text} ”</b>
                        ${ex.Example_Transcription ? `<br><small>[${ex.Example_Transcription}]</small>` : ''}
                        <br><span class="ex-trans-lbl">→ ${ex.Example_Translation}</span>
                        ${ex.Example_Comment ? `<br><i class="ex-comm-lbl">${ex.Example_Comment}</i>` : ''}
                    </li>
                `).join('')}
            </ul>
           </div>`
        : '';

    content.innerHTML = `
        <div class="card-header-badge">
            <span class="badge-lang-tag">${currentLang ? currentLang.Language_Code : '??'}</span>
            ${w.Part_Of_Speech ? `<span class="badge-pos-tag">${w.Part_Of_Speech}</span>` : ''}
            <span class="badge-folder-tag">📁 ${w.Folder || 'Общая'}</span>
        </div>
        
        <h1 class="card-native-word" style="font-family: ${currentLang?.Script_Font_1 || 'inherit'}">${w.Word}</h1>
        ${w.Transcription ? `<div class="card-transcription">[${w.Transcription}]</div>` : ''}
        
        <hr class="card-separator">
        
        <div class="card-translation-value">${w.Translation || 'Нет вариантов перевода'}</div>
        
        ${w.Association ? `<div class="card-meta-bubble association-bubble">💡 ${w.Association}</div>` : ''}
        ${w.Comment ? `<div class="card-meta-bubble comment-bubble">💬 ${w.Comment}</div>` : ''}
        
        ${examplesListHTML}
        
        ${w.Source ? `<div class="card-footer-link">📖 Источник: ${w.Source}</div>` : ''}
        ${w.Image_URL ? `<div class="card-image-preview"><img src="${w.Image_URL}" alt="Образ"></div>` : ''}
    `;

    if (overlay) overlay.classList.remove('hidden');
    if (closeBtn) closeBtn.onclick = () => overlay.classList.add('hidden');
    if (overlay) {
        overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.add('hidden'); };
    }
}

/**
 * Инициализация всплывающего модального меню PLAY сессии
 */
function openPlayMenu(title, stats) {
    const overlay = document.getElementById('play-menu-overlay');
    const modalTitle = document.getElementById('modal-lang-title');
    const badgeUnlearned = document.getElementById('badge-unlearned');
    const badgeReview = document.getElementById('badge-review');
    const reviewBtn = document.getElementById('opt-review-btn');
    
    if (modalTitle) modalTitle.textContent = title;
    if (badgeUnlearned) badgeUnlearned.textContent = stats.unlearned;
    
    if (badgeReview && reviewBtn) {
        if (parseInt(stats.ready_for_review) > 0) {
            badgeReview.textContent = stats.ready_for_review;
            reviewBtn.disabled = false;
            reviewBtn.classList.remove('disabled');
        } else {
            badgeReview.textContent = '0';
            reviewBtn.disabled = true;
            reviewBtn.classList.add('disabled');
        }
    }
    if (overlay) overlay.classList.remove('hidden');
}

/**
 * Общие слушатели кнопок управления модального меню
 */
function setupSharedModalListeners() {
    const overlay = document.getElementById('play-menu-overlay');
    const closeBtn = document.getElementById('close-modal-btn');
    if (!overlay || !closeBtn) return;
    
    closeBtn.onclick = () => overlay.classList.add('hidden');
    overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.add('hidden'); };

    document.querySelectorAll('.menu-opt-btn').forEach(btn => {
        btn.onclick = (e) => {
            const actionBtn = e.target.closest('.menu-opt-btn');
            if (actionBtn.classList.contains('disabled')) return;
            overlay.classList.add('hidden');
            handleMenuAction(actionBtn.dataset.action, activeMenuLangId, activeMenuFolderName);
        };
    });
}

/**
 * Обработка нажатий на действия меню (редирект или вызов подсистем)
 */
function handleMenuAction(action, langId, folderName) {
    if (action === 'add') {
        const addNavBtn = document.querySelector('.nav-btn[data-screen="add"]');
        if (addNavBtn) addNavBtn.click();
        
        setTimeout(() => {
            const selectLang = document.getElementById('form-lang-select');
            if (selectLang && langId) { 
                selectLang.value = langId; 
                selectLang.dispatchEvent(new Event('change')); 
            }
            
            const folderSelect = document.getElementById('form-folder-select');
            if (folderSelect && folderName) {
                // Если выбранной папки еще нет в селекте фильтра, динамически создаем опцию
                if (!folderSelect.querySelector(`option[value="${folderName}"]`)) {
                    const opt = new Option(folderName, folderName);
                    folderSelect.add(opt);
                }
                folderSelect.value = folderName;
                folderSelect.dispatchEvent(new Event('change'));
            }
        }, 120);
    } else {
        alert(`Модуль "${action}" подключается к сессии интервального повторения...`);
    }
}

// Экспортируем функции в глобальную область видимости для роутера ядра main.js
window.initDashboard = initDashboard;
window.renderDashboard = renderDashboard;
window.dashboardState = dashboardState;