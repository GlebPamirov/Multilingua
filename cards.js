/**
 * CARDS.JS — Интерактивные Fluid-карточки с группировкой по Concept_ID.
 * Ожидает массив объектов со структурой:
 * { Concept_ID, Lang_ID, Word, Translation, Transcription }
 */

let cardsState = {
    groupedConcepts: [], // Массив сгруппированных карточек
    currentIndex: 0,
    activeCloudInstance: null
};

/**
 * Инициализация модуля карточек.
 * @param {HTMLElement} container — Элемент-контейнер.
 * @param {Array<Object>} rawData — Плоский массив строк из таблицы БД.
 */
function initCards(container, rawData = []) {
    // --- [DEBUG START: Проверка входящих данных] ---
    console.group('🔍 [DEBUG CARDS] Вызов initCards()');
    console.log('Контейнер:', container);
    console.log('Тип rawData:', typeof rawData, 'Is Array:', Array.isArray(rawData));
    console.log('Количество элементов rawData:', rawData ? rawData.length : 0);

    if (rawData && rawData.length > 0) {
        console.log('Пример первой сырой строки:', rawData[0]);
        console.log('Ключи первой строки:', Object.keys(rawData[0]));

        // Ищем сэмплы концепта L_1 в исходных данных
        const debugTargetRows = rawData.filter(row => {
            const cId = String(row.Concept_ID || row.concept_id || '').trim();
            return cId === 'L_1';
        });

        if (debugTargetRows.length > 0) {
            console.log('%c✅ Найдены строки для L_1 в rawData:', 'color: #10b981; font-weight: bold;', debugTargetRows);
        } else {
            console.warn('%c⚠️ Концепт L_1 не найден в rawData!', 'color: #f59e0b; font-weight: bold;');
            console.log('Доступные Concept_ID в rawData:', [...new Set(rawData.map(r => r.Concept_ID || r.concept_id))]);
        }
    } else {
        console.error('%c❌ rawData пуст или не передан!', 'color: #ef4444; font-weight: bold;');
    }
    console.groupEnd();
    // --- [DEBUG END] ---

    injectCardsStyles();

    if (!rawData || rawData.length === 0) {
        container.innerHTML = `<div class="cards-empty">В базе данных нет записей для карточек.</div>`;
        return;
    }

    // Группируем плоские строки по Concept_ID
    cardsState.groupedConcepts = groupDataByConcept(rawData);
    cardsState.currentIndex = 0;

    // --- [DEBUG START: Проверка сгруппированных данных] ---
    console.group('🔍 [DEBUG CARDS] Результат groupDataByConcept()');
    console.log('Всего сгруппировано концептов:', cardsState.groupedConcepts.length);

    const debugGroupedTarget = cardsState.groupedConcepts.find(g => g.conceptId === 'L_1');
    if (debugGroupedTarget) {
        console.log('%c🎯 Сгруппированный объект L_1:', 'color: #10b981; font-weight: bold; font-size: 14px;', debugGroupedTarget);
    } else {
        console.warn('%c⚠️ L_1 отсутствует в сгруппированном массиве cardsState.groupedConcepts!', 'color: #f59e0b;');
    }
    console.groupEnd();
    // --- [DEBUG END] ---

    // Рендерим каркас
    container.innerHTML = renderCarouselWrapperHTML();

    // Загружаем первую карточку
    loadConceptCard(cardsState.currentIndex);

    // Настраиваем кнопки «Вперед / Назад»
    setupCarouselControls();
}

/**
 * Группировка плоских данных из Google Sheets
 */
function groupDataByConcept(rows) {
    const map = new Map();

    rows.forEach((row, index) => {
        // Проверяем оба регистра ключа
        const conceptId = String(row.Concept_ID || row.concept_id || '').trim();
        
        if (!conceptId) {
            if (index < 5) console.warn(`[DEBUG] Пропущена строка index=${index}, т.к. Concept_ID пуст:`, row);
            return;
        }

        if (!map.has(conceptId)) {
            map.set(conceptId, {
                conceptId: conceptId,
                items: []
            });
        }

        map.get(conceptId).items.push({
            langId: String(row.Lang_ID || row.lang_id || '').toLowerCase().trim(),
            word: String(row.Word || row.word || '').trim(),
            translation: String(row.Translation || row.translation || '').trim(),
            transcription: String(row.Transcription || row.transcription || '').trim()
        });
    });

    return Array.from(map.values());
}

function injectCardsStyles() {
    if (document.getElementById('fluid-cards-styles')) return;

    const style = document.createElement('style');
    style.id = 'fluid-cards-styles';
    style.innerHTML = `
        .carousel-root-container {
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            user-select: none;
        }

        .carousel-top-bar {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .carousel-viewport {
            width: 100%;
        }

        .cloud-wrapper {
            position: relative;
            width: 100%;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .nav-arrow-btn {
            background: transparent;
            border: none;
            outline: none;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #a1a1aa;
            transition: all 0.2s ease;
            padding: 0;
            border-radius: 50%;
        }

        .nav-arrow-btn svg {
            width: 22px;
            height: 22px;
        }

        .nav-arrow-btn:hover {
            color: #18181b;
            background: rgba(0,0,0,0.04);
        }

        .lang-select-dropdown {
            position: absolute;
            top: 10px;
            right: 12px;
            z-index: 20;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(6px);
            border: 1px solid rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 0.72rem;
            font-weight: 600;
            color: #18181b;
            outline: none;
            cursor: pointer;
            text-transform: uppercase;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        .translations-bottom-panel {
            width: 100%;
            background: #fafafa;
            border: 1px solid rgba(0, 0, 0, 0.06);
            border-radius: 12px;
            padding: 12px 14px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .translations-panel-header {
            font-size: 0.65rem;
            font-weight: 700;
            color: #a1a1aa;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .translations-list-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 140px;
            overflow-y: auto;
        }

        .translation-card-item {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.05);
            padding: 8px 12px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
        }

        .translation-card-item.active-lang {
            border-color: #dc2626;
            background-color: rgba(220, 38, 38, 0.03);
        }

        .tr-word-main {
            font-size: 0.85rem;
            font-weight: 700;
            color: #18181b;
        }

        .tr-transcription {
            font-size: 0.75rem;
            color: #71717a;
            margin-left: 6px;
            font-weight: normal;
        }

        .tr-translation {
            font-size: 0.8rem;
            color: #4b5563;
            font-weight: 500;
        }

        .cards-empty {
            padding: 40px;
            text-align: center;
            font-size: 0.85rem;
            color: #71717a;
        }

        canvas {
            display: block;
            width: 100%;
            height: 100%;
            cursor: grab;
        }

        canvas:active {
            cursor: grabbing;
        }
    `;
    document.head.appendChild(style);
}

function renderCarouselWrapperHTML() {
    return `
        <div class="carousel-root-container">
            <div class="carousel-top-bar">
                <button class="nav-arrow-btn" id="carousel-prev-btn" title="Предыдущий концепт">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <div id="active-concept-title" style="font-size: 0.88rem; font-weight: 700; color: #18181b;"></div>
                <button class="nav-arrow-btn" id="carousel-next-btn" title="Следующий концепт">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>

            <div class="carousel-viewport">
                <div id="fluid-cloud-stage" class="cloud-wrapper"></div>
            </div>

            <div class="translations-bottom-panel">
                <div class="translations-panel-header">Значения и переводы</div>
                <div id="translations-list-target" class="translations-list-container"></div>
            </div>
        </div>
    `;
}

function loadConceptCard(index) {
    const conceptData = cardsState.groupedConcepts[index];
    
    // --- [DEBUG LOG] ---
    console.log(`[DEBUG] Загрузка карточки index=${index}:`, conceptData);

    if (!conceptData) return;

    const titleEl = document.getElementById('active-concept-title');
    if (titleEl) {
        titleEl.textContent = `Концепт: ${conceptData.conceptId}`;
    }

    const stageEl = document.getElementById('fluid-cloud-stage');
    if (!stageEl) return;

    stageEl.querySelectorAll('canvas, .lang-select-dropdown').forEach(el => el.remove());

    cardsState.activeCloudInstance = new FluidConceptCloud(stageEl, conceptData.items);
}

function setupCarouselControls() {
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');

    if (prevBtn) {
        prevBtn.onclick = () => {
            cardsState.currentIndex--;
            if (cardsState.currentIndex < 0) cardsState.currentIndex = cardsState.groupedConcepts.length - 1;
            loadConceptCard(cardsState.currentIndex);
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            cardsState.currentIndex = (cardsState.currentIndex + 1) % cardsState.groupedConcepts.length;
            loadConceptCard(cardsState.currentIndex);
        };
    }
}

class FluidConceptCloud {
    constructor(container, items) {
        this.container = container;
        this.items = items || [];

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.nodes = [];
        this.centerNode = null;
        this.dpr = window.devicePixelRatio || 1;
        this.draggedNode = null;

        this.initCanvas();
        this.initNodes();
        this.createLangDropdown();
        this.renderTranslationsPanel(this.nodes[0] ? this.nodes[0].langId : null);
        this.bindEvents();
        this.animate();
    }

    initCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 340;
        this.height = rect.height || 300;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }

    initNodes() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.nodes = this.items.map((item, index) => {
            const isCenter = index === 0;
            const angle = (index / (this.items.length || 1)) * Math.PI * 2;
            const radius = isCenter ? 0 : 80 + Math.random() * 20;

            // Определяем символы/глифы
            const isGlyph = item.word.length <= 3 && !/^[a-zA-Zа-яА-Я0-9]+$/.test(item.word);

            const node = {
                ...item,
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                vx: 0, vy: 0,
                type: isGlyph ? 'glyph' : 'alpha',
                targetSize: isCenter ? (isGlyph ? 46 : 32) : (isGlyph ? 22 : 15),
                currentSize: isCenter ? (isGlyph ? 46 : 32) : (isGlyph ? 22 : 15),
                isCenter: isCenter,
                color: isCenter ? '#dc2626' : (isGlyph ? '#d97706' : '#2563eb')
            };

            if (isCenter) this.centerNode = node;
            return node;
        });
    }

    createLangDropdown() {
        if (this.items.length === 0) return;

        const select = document.createElement('select');
        select.className = 'lang-select-dropdown';

        this.items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.langId;
            option.textContent = item.langId.toUpperCase();
            select.appendChild(option);
        });

        select.onchange = (e) => {
            this.setCenterByLang(e.target.value);
        };

        this.container.appendChild(select);
        this.langSelectEl = select;
    }

    setCenterByLang(langId) {
        const targetNode = this.nodes.find(n => n.langId === langId);
        if (!targetNode) return;

        this.nodes.forEach(n => {
            const isTarget = (n === targetNode);
            n.isCenter = isTarget;

            if (isTarget) {
                n.targetSize = n.type === 'glyph' ? 46 : 32;
                n.color = '#dc2626';
                this.centerNode = n;
            } else {
                n.targetSize = n.type === 'glyph' ? 22 : 15;
                n.color = n.type === 'glyph' ? '#d97706' : '#2563eb';
            }
        });

        if (this.langSelectEl && this.langSelectEl.value !== langId) {
            this.langSelectEl.value = langId;
        }

        this.renderTranslationsPanel(langId);
    }

    renderTranslationsPanel(activeLangId) {
        const targetEl = document.getElementById('translations-list-target');
        if (!targetEl) return;

        // Сортируем: сначала активный язык, потом остальные
        const sorted = [...this.items].sort((a, b) => {
            if (a.langId === activeLangId) return -1;
            if (b.langId === activeLangId) return 1;
            return 0;
        });

        targetEl.innerHTML = sorted.map(item => {
            const isActive = item.langId === activeLangId;
            return `
                <div class="translation-card-item ${isActive ? 'active-lang' : ''}">
                    <div>
                        <span class="tr-word-main">${item.word}</span>
                        ${item.transcription ? `<span class="tr-transcription">[${item.transcription}]</span>` : ''}
                        <span style="font-size:0.65rem; color:#a1a1aa; font-weight:700; margin-left:6px;">${item.langId.toUpperCase()}</span>
                    </div>
                    <div class="tr-translation">${item.translation}</div>
                </div>
            `;
        }).join('');

        targetEl.scrollTop = 0;
    }

    updatePhysics() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        if (this.centerNode && this.centerNode !== this.draggedNode) {
            this.centerNode.vx += (cx - this.centerNode.x) * 0.025;
            this.centerNode.vy += (cy - this.centerNode.y) * 0.025;
        }

        for (let i = 0; i < this.nodes.length; i++) {
            let a = this.nodes[i];
            a.currentSize += (a.targetSize - a.currentSize) * 0.08;

            if (!a.isCenter && a !== this.draggedNode && this.centerNode) {
                const dx = this.centerNode.x - a.x;
                const dy = this.centerNode.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const targetDist = 85;

                const force = (dist - targetDist) * 0.0012;
                a.vx += (dx / dist) * force;
                a.vy += (dy / dist) * force;
            }

            for (let j = i + 1; j < this.nodes.length; j++) {
                let b = this.nodes[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const minDist = (a.currentSize + b.currentSize) * 1.2;

                if (dist < minDist) {
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const repulse = overlap * 0.01;
                    if (a !== this.draggedNode) { a.vx -= nx * repulse; a.vy -= ny * repulse; }
                    if (b !== this.draggedNode) { b.vx += nx * repulse; b.vy += ny * repulse; }
                }
            }

            a.vx *= 0.75;
            a.vy *= 0.75;

            if (a !== this.draggedNode) {
                a.x += a.vx;
                a.y += a.vy;
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.nodes.forEach(n => {
            this.ctx.font = `${n.isCenter ? '800' : '600'} ${n.currentSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
            this.ctx.fillStyle = n.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(n.word || '', n.x, n.y);
        });
    }

    animate() {
        this.updatePhysics();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    bindEvents() {
        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        };

        const handleStart = (e) => {
            const pos = getPos(e);
            const clicked = this.nodes.find(n => {
                const dx = n.x - pos.x;
                const dy = n.y - pos.y;
                return Math.sqrt(dx * dx + dy * dy) < n.currentSize * 0.8;
            });

            if (clicked) {
                this.draggedNode = clicked;
                this.setCenterByLang(clicked.langId);
            }
        };

        const handleMove = (e) => {
            if (this.draggedNode) {
                const pos = getPos(e);
                this.draggedNode.x = pos.x;
                this.draggedNode.y = pos.y;
            }
        };

        const handleEnd = () => {
            this.draggedNode = null;
        };

        this.canvas.addEventListener('mousedown', handleStart);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleEnd);

        this.canvas.addEventListener('touchstart', handleStart);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleEnd);
    }
}

window.initCards = initCards;
