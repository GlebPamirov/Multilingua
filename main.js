/**
 * MAIN.JS — Архитектурное ядро приложения.
 * Управляет глобальным состоянием (БД), навигацией и статусом подключения.
 */

// Глобальное состояние приложения, наполняемое из Google Sheets
window.APP_STATE = {
    languages: [], // Данные листа Languages
    words: [],     // Данные листа Words
    examples: []   // Данные листа Examples
};

// URL вашего развернутого Web App Google Apps Script
const DATABASE_URL = 'https://script.google.com/macros/s/AKfycbwTCfjjGniuCIE4Y2YjffknmlpUwacoM3HWBfeQg6gPhWsVB-kHp4gZ8ny3tReoLT8k/exec'; 

// DOM Элементы
const mainContainer = document.getElementById('main-container');
const connectionStatus = document.getElementById('connection-status');
const navButtons = document.querySelectorAll('.nav-btn');

/**
 * Инициализация приложения при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', async () => {
    setupNavigationListeners();
    await initApp();
});

/**
 * Основная функция загрузки данных и проверки связи с БД
 */
async function initApp() {
    updateConnectionStatus('checking', 'Проверка связи...');
    
    try {
        const response = await fetch(`${DATABASE_URL}?action=get_state`);
        if (!response.ok) throw new Error('Сетевая ошибка при ответе БД');
        
        const data = await response.json();
        
        // Наполняем глобальное состояние (работаем через window.APP_STATE)
        window.APP_STATE.languages = data.languages || [];
        window.APP_STATE.words = data.words || [];
        window.APP_STATE.examples = data.examples || [];
        
        updateConnectionStatus('online', 'БД Online');
        
        // Вызываем функции отрисовки интерфейса из первого файла, 
        // если они объявлены в глобальной области видимости
        if (typeof renderLanguageList === 'function') renderLanguageList();
        if (typeof populateLanguageSelects === 'function') populateLanguageSelects();
        
        // Маршрутизация экранов
        const activeNav = document.querySelector('.nav-btn.active');
        if (activeNav) {
            switchScreen(activeNav.dataset.screen);
        }

    } catch (error) {
        console.error('Ошибка подключения к Google Sheets:', error);
        updateConnectionStatus('offline', 'БД Offline');
    }
}

/**
 * Функция отправки данных в БД (вызывается из add.js и модулей повторения)
 */
async function sendToDatabase(payload) {
    updateConnectionStatus('sync', 'Синхронизация...');
    
    try {
        const response = await fetch(DATABASE_URL, {
            method: 'POST',
            redirect: 'follow', // Важно для работы с редиректами Google Apps Script
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) throw new Error('Ошибка записи в таблицу');
        
        updateConnectionStatus('online', 'БД Online');
        return await response.json();
    } catch (error) {
        console.error('Ошибка записи:', error);
        updateConnectionStatus('offline', 'Ошибка сохранения');
        throw error;
    }
}

/**
 * Вспомогательная функция управления текстом и стилем бейджа статуса
 */
function updateConnectionStatus(statusClass, text) {
    if (!connectionStatus) return;
    
    // Сбрасываем все старые классы состояния
    connectionStatus.className = 'status-badge ' + statusClass;
    connectionStatus.textContent = text;
}

/**
 * Управление глобальной навигацией (Нижний таб-бар)
 */
function setupNavigationListeners() {
    navButtons.forEach(btn => {
        btn.onclick = (e) => {
            navButtons.forEach(b => b.classList.remove('active'));
            const targetBtn = e.target.closest('.nav-btn');
            targetBtn.classList.add('active');
            
            switchScreen(targetBtn.dataset.screen);
        };
    });
}

/**
 * Роутер экранов: очищает контейнер и запускает рендеринг нужного модуля
 */
function switchScreen(screenName) {
    if (!mainContainer) return;
    mainContainer.innerHTML = ''; // Очистка рабочей зоны

    switch (screenName) {
        case 'dashboard':
            if (typeof window.initDashboard === 'function') {
                window.initDashboard(mainContainer);
            } else {
                mainContainer.innerHTML = '<p class="empty-notify">Модуль приборной панели не найден.</p>';
            }
            break;
        case 'cards':
            // ИСПРАВЛЕНО: имя функции изменено с initCardsScreen на initCards
            if (typeof window.initCards === 'function') {
                window.initCards(mainContainer);
            } else {
                mainContainer.innerHTML = '<p class="empty-notify">Модуль интервальных карточек скоро будет подключен...</p>';
            }
            break;
        case 'dictionary':
            // ИСПРАВЛЕНО: имя функции изменено с initDictionaryScreen на initDictionary
            if (typeof window.initDictionary === 'function') {
                window.initDictionary(mainContainer);
            } else {
                mainContainer.innerHTML = '<p class="empty-notify">Модуль полного словаря в разработке...</p>';
            }
            break;
        case 'add':
            if (typeof window.initAddScreen === 'function') {
                window.initAddScreen(mainContainer);
            } else {
                mainContainer.innerHTML = '<p class="empty-notify">Модуль добавления слов не найден.</p>';
            }
            break;
        default:
            mainContainer.innerHTML = '<p class="empty-notify">Экран не найден.</p>';
    }
}

// Делаем функции доступными глобально для вызовов из других файлов при необходимости
window.initApp = initApp;
window.sendToDatabase = sendToDatabase;
window.showAutosaveStatus = (status) => {
    if (status === 'process') updateConnectionStatus('sync', 'Сохранение...');
    if (status === 'success') updateConnectionStatus('online', 'БД Online');
    if (status === 'error') updateConnectionStatus('offline', 'Ошибка');
};