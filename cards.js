/**
 * CARDS.JS — Модуль интерактивных Fluid-карточек концептов с нижней панелью примеров.
 */

// Временные тестовые данные языков
const testLanguages = [
    { id: 'en', name: 'Английский' },
    { id: 'ru', name: 'Русский' },
    { id: 'akk', name: 'Аккадский' },
    { id: 'zh', name: 'Китайский' },
    { id: 'ja', name: 'Японский' },
    { id: 'egy', name: 'Древнеегипетский' },
    { id: 'sa', name: 'Санскрит' },
    { id: 'de', name: 'Немецкий' },
    { id: 'la', name: 'Латынь' },
    { id: 'grc', name: 'Древнегреческий' }
];

// 5 Концептов
const testConcepts = [
    { id: 1, name_ru: 'Вода' },
    { id: 2, name_ru: 'Солнце' },
    { id: 3, name_ru: 'Дом' },
    { id: 4, name_ru: 'Огонь' },
    { id: 5, name_ru: 'Дерево' }
];

// Слова для 5 концептов
const testWords = [
    // 1. Вода
    { id: 101, concept_id: 1, lang_id: 'zh', word: '水', transcription: 'shuǐ', type: 'glyph' },
    { id: 102, concept_id: 1, lang_id: 'ja', word: '水', transcription: 'mizu', type: 'glyph' },
    { id: 103, concept_id: 1, lang_id: 'akk', word: 'A.MEŠ', transcription: 'mû', type: 'glyph' },
    { id: 104, concept_id: 1, lang_id: 'egy', word: '𓈋𓈋𓈋', transcription: 'mw', type: 'glyph' },
    { id: 105, concept_id: 1, lang_id: 'sa', word: 'जल', transcription: 'jala', type: 'glyph' },
    { id: 106, concept_id: 1, lang_id: 'en', word: 'water', transcription: '[ˈwɔːtər]', type: 'alpha' },
    { id: 107, concept_id: 1, lang_id: 'de', word: 'Wasser', transcription: '[ˈvasɐ]', type: 'alpha' },
    { id: 108, concept_id: 1, lang_id: 'la', word: 'aqua', transcription: '[ˈa.kʷa]', type: 'alpha' },
    { id: 109, concept_id: 1, lang_id: 'grc', word: 'ὕδωρ', transcription: '[hýdɔːr]', type: 'alpha' },
    { id: 110, concept_id: 1, lang_id: 'ru', word: 'Вода', transcription: '[vɐˈda]', type: 'alpha' },

    // 2. Солнце
    { id: 201, concept_id: 2, lang_id: 'zh', word: '日', transcription: 'rì', type: 'glyph' },
    { id: 202, concept_id: 2, lang_id: 'ja', word: '日', transcription: 'hi', type: 'glyph' },
    { id: 203, concept_id: 2, lang_id: 'akk', word: 'ŠAMŠU', transcription: 'šamšu', type: 'glyph' },
    { id: 204, concept_id: 2, lang_id: 'egy', word: '𓇳', transcription: 'rʿ', type: 'glyph' },
    { id: 205, concept_id: 2, lang_id: 'sa', word: 'सूर्य', transcription: 'sūrya', type: 'glyph' },
    { id: 206, concept_id: 2, lang_id: 'en', word: 'sun', transcription: '[sʌn]', type: 'alpha' },
    { id: 207, concept_id: 2, lang_id: 'de', word: 'Sonne', transcription: '[ˈzɔnə]', type: 'alpha' },
    { id: 208, concept_id: 2, lang_id: 'la', word: 'sol', transcription: '[soːl]', type: 'alpha' },
    { id: 209, concept_id: 2, lang_id: 'grc', word: 'ἥλιος', transcription: '[hɛ̌ːlios]', type: 'alpha' },
    { id: 210, concept_id: 2, lang_id: 'ru', word: 'Солнце', transcription: '[ˈsontsə]', type: 'alpha' },

    // 3. Дом
    { id: 301, concept_id: 3, lang_id: 'zh', word: '家', transcription: 'jiā', type: 'glyph' },
    { id: 302, concept_id: 3, lang_id: 'ja', word: '家', transcription: 'ie', type: 'glyph' },
    { id: 303, concept_id: 3, lang_id: 'akk', word: 'BĪTU', transcription: 'bītu', type: 'glyph' },
    { id: 304, concept_id: 3, lang_id: 'egy', word: '𓉐', transcription: 'pr', type: 'glyph' },
    { id: 305, concept_id: 3, lang_id: 'sa', word: 'गृह', transcription: 'gṛha', type: 'glyph' },
    { id: 306, concept_id: 3, lang_id: 'en', word: 'house', transcription: '[haʊs]', type: 'alpha' },
    { id: 307, concept_id: 3, lang_id: 'de', word: 'Haus', transcription: '[haʊs]', type: 'alpha' },
    { id: 308, concept_id: 3, lang_id: 'la', word: 'domus', transcription: '[ˈdo.mʊs]', type: 'alpha' },
    { id: 309, concept_id: 3, lang_id: 'grc', word: 'οἶκος', transcription: '[oî̯.kos]', type: 'alpha' },
    { id: 310, concept_id: 3, lang_id: 'ru', word: 'Дом', transcription: '[dom]', type: 'alpha' },

    // 4. Огонь
    { id: 401, concept_id: 4, lang_id: 'zh', word: '火', transcription: 'huǒ', type: 'glyph' },
    { id: 402, concept_id: 4, lang_id: 'ja', word: '火', transcription: 'hi', type: 'glyph' },
    { id: 403, concept_id: 4, lang_id: 'akk', word: 'IŠĀTU', transcription: 'išātu', type: 'glyph' },
    { id: 404, concept_id: 4, lang_id: 'egy', word: '𓊮', transcription: 'ḫt', type: 'glyph' },
    { id: 405, concept_id: 4, lang_id: 'sa', word: 'अग्नि', transcription: 'agni', type: 'glyph' },
    { id: 406, concept_id: 4, lang_id: 'en', word: 'fire', transcription: '[ˈfaɪər]', type: 'alpha' },
    { id: 407, concept_id: 4, lang_id: 'de', word: 'Feuer', transcription: '[ˈfɔʏɐ]', type: 'alpha' },
    { id: 408, concept_id: 4, lang_id: 'la', word: 'ignis', transcription: '[ˈɪɡ.nɪs]', type: 'alpha' },
    { id: 409, concept_id: 4, lang_id: 'grc', word: 'πῦρ', transcription: '[pŷːr]', type: 'alpha' },
    { id: 410, concept_id: 4, lang_id: 'ru', word: 'Огонь', transcription: '[ɐˈɡonʲ]', type: 'alpha' },

    // 5. Дерево
    { id: 501, concept_id: 5, lang_id: 'zh', word: '木', transcription: 'mù', type: 'glyph' },
    { id: 502, concept_id: 5, lang_id: 'ja', word: '木', transcription: 'ki', type: 'glyph' },
    { id: 503, concept_id: 5, lang_id: 'akk', word: 'IṢU', transcription: 'iṣu', type: 'glyph' },
    { id: 504, concept_id: 5, lang_id: 'egy', word: '𓆱', transcription: 'ḫt', type: 'glyph' },
    { id: 505, concept_id: 5, lang_id: 'sa', word: 'वृक्ष', transcription: 'vṛkṣa', type: 'glyph' },
    { id: 506, concept_id: 5, lang_id: 'en', word: 'tree', transcription: '[triː]', type: 'alpha' },
    { id: 507, concept_id: 5, lang_id: 'de', word: 'Baum', transcription: '[baʊ̯m]', type: 'alpha' },
    { id: 508, concept_id: 5, lang_id: 'la', word: 'arbor', transcription: '[ˈar.bor]', type: 'alpha' },
    { id: 509, concept_id: 5, lang_id: 'grc', word: 'δένδρον', transcription: '[dén.dron]', type: 'alpha' },
    { id: 510, concept_id: 5, lang_id: 'ru', word: 'Дерево', transcription: '[ˈdʲerʲəvə]', type: 'alpha' }
];

// Примеры контекста для всех 5 концептов
const testExamples = [
    // Concept 1: Вода
    { concept_id: 1, lang_id: 'zh', text: '清澈的水在川流不息地向前奔流。', translation: 'Прозрачная вода непрерывно течет вперед.' },
    { concept_id: 1, lang_id: 'ja', text: '冷たい水が川を静かに流れていきます。', translation: 'Холодная вода тихо течет по реке.' },
    { concept_id: 1, lang_id: 'akk', text: 'A.MEŠ ba-na-a ana ma-a-ti i-na-at-ti-nk.', translation: 'Прекрасные воды текут на землю.' },
    { concept_id: 1, lang_id: 'egy', text: 'mw nfr n jtrw ḥnʿ ḥsmn.', translation: 'Чистая вода реки соединяется с солью.' },
    { concept_id: 1, lang_id: 'sa', text: 'जलम् एव जीवनस्य आधारः अस्ति।', translation: 'Вода — истинная основа жизни.' },
    { concept_id: 1, lang_id: 'en', text: 'Water flows quietly through the ancient mountain valley.', translation: 'Вода тихо течет через древнюю горную долину.' },
    { concept_id: 1, lang_id: 'de', text: 'Das kalte Wasser fließt ruhig durch den tiefen Wald.', translation: 'Холодная вода спокойно течет через густой лес.' },
    { concept_id: 1, lang_id: 'la', text: 'Aqua vitae est fontis purissimi.', translation: 'Вода жизни из чистейшего источника.' },
    { concept_id: 1, lang_id: 'grc', text: 'Ὕδωρ ἐστὶν ἄριστον τοῖς ἀνθρώποις.', translation: 'Вода — лучшее благо для людей.' },
    { concept_id: 1, lang_id: 'ru', text: 'Чистая вода струится по гладким камням.', translation: 'Чистая вода струится по гладким камням.' },

    // Concept 2: Солнце
    { concept_id: 2, lang_id: 'zh', text: '明亮的太阳在蓝天中高高升起。', translation: 'Яркое солнце высоко поднимается в синем небе.' },
    { concept_id: 2, lang_id: 'ja', text: '明るい日差しが部屋全体に広がります。', translation: 'Яркий солнечный свет заполняет всю комнату.' },
    { concept_id: 2, lang_id: 'akk', text: 'ŠA.MŠU ra-bi-u i-na ša-me-e i-šar-ra-ḫu.', translation: 'Великое солнце сияет в небесах.' },
    { concept_id: 2, lang_id: 'egy', text: 'rʿ wbn m pt ḥnʿ ḥtp.', translation: 'Солнце восходит на небесах и заходит.' },
    { concept_id: 2, lang_id: 'sa', text: 'सूर्यः गगने तीव्रं तपति।', translation: 'Солнце ярко светит в небесах.' },
    { concept_id: 2, lang_id: 'en', text: 'The morning sun warms the quiet green forest.', translation: 'Утреннее солнце согревает тихий зеленый лес.' },
    { concept_id: 2, lang_id: 'de', text: 'Die Sonne scheint heute sehr warm am Himmel.', translation: 'Сегодня солнце очень тепло светит на небе.' },
    { concept_id: 2, lang_id: 'la', text: 'Sol fulget in caelo sereno et alto.', translation: 'Солнце сияет в ясном и высоком небе.' },
    { concept_id: 2, lang_id: 'grc', text: 'Ὁ ἥλιος λάμπει ἐν τῷ οὐρανῷ.', translation: 'Солнце сияет на небе.' },
    { concept_id: 2, lang_id: 'ru', text: 'Теплый солнечный луч упал на старый стол.', translation: 'Теплый солнечный луч упал на старый стол.' },

    // Concept 3: Дом
    { concept_id: 3, lang_id: 'zh', text: '我们的家充满着温暖与欢欢喜喜。', translation: 'Наш дом полон тепла и радости.' },
    { concept_id: 3, lang_id: 'ja', text: '新しい家は美しい山の上に立っています。', translation: 'Новый дом стоит на красивой горе.' },
    { concept_id: 3, lang_id: 'akk', text: 'bītu epšu ina libbi āli ša šarri.', translation: 'Построенный дом в центре царского города.' },
    { concept_id: 3, lang_id: 'egy', text: 'pr nfr n ḥm-nṯr m ḥwt-k3.', translation: 'Прекрасный дом жреца в храме.' },
    { concept_id: 3, lang_id: 'sa', text: 'अयं गृहः मम परिवारस्य सुखस्य स्थानम्।', translation: 'Этот дом — место счастья моей семьи.' },
    { concept_id: 3, lang_id: 'en', text: 'Light shined through the windows of the wooden house.', translation: 'Свет светил сквозь окна деревянного дома.' },
    { concept_id: 3, lang_id: 'de', text: 'Das alte Haus steht seit vielen Jahren am Fluss.', translation: 'Старый дом стоит у реки уже много лет.' },
    { concept_id: 3, lang_id: 'la', text: 'Domus mea est fortitudo mea et pax.', translation: 'Мой дом — моя крепость и покой.' },
    { concept_id: 3, lang_id: 'grc', text: 'Ὁ οἶκος ἡμῶν ἐστιν ἐν τῇ πόλει.', translation: 'Наш дом находится в городе.' },
    { concept_id: 3, lang_id: 'ru', text: 'В окнах старого дома зажглись вечерние огни.', translation: 'В окнах старого дома зажглись вечерние огни.' },

    // Concept 4: Огонь
    { concept_id: 4, lang_id: 'zh', text: '篝火在漆黑的夜晚也照亮了周围。', translation: 'Костер осветил всё вокруг в темную ночь.' },
    { concept_id: 4, lang_id: 'ja', text: '暖炉の火が静かに燃えています。', translation: 'Огонь в камине тихо горит.' },
    { concept_id: 4, lang_id: 'akk', text: 'išātu kabiltu iṣṣī takkal.', translation: 'Сильный огонь пожирает деревья.' },
    { concept_id: 4, lang_id: 'egy', text: 'ḫt psḏ m wꜣwt n kkw.', translation: 'Огонь светит во тьме дорог.' },
    { concept_id: 4, lang_id: 'sa', text: 'अग्निः तमसं नाशयति तेजसा।', translation: 'Огонь уничтожает тьму своим светом.' },
    { concept_id: 4, lang_id: 'en', text: 'The bright fire danced during the dark night.', translation: 'Яркий огонь танцевал среди темной ночи.' },
    { concept_id: 4, lang_id: 'de', text: 'Das Feuer brennt hell in der kalten Nacht.', translation: 'Огонь ярко горит в холодную ночь.' },
    { concept_id: 4, lang_id: 'la', text: 'Ignis purgat et illuminat viam nostram.', translation: 'Огонь очищает и освещает наш путь.' },
    { concept_id: 4, lang_id: 'grc', text: 'Τὸ πῦρ καίει ἐν τῇ ἑστίᾳ.', translation: 'Огонь горит в очаге.' },
    { concept_id: 4, lang_id: 'ru', text: 'Вечерний огонь в камине дарил уют.', translation: 'Вечерний огонь в камине дарил уют.' },

    // Concept 5: Дерево
    { concept_id: 5, lang_id: 'zh', text: '高大的树木在秋风中摇曳。', translation: 'Высокие деревья качаются на осеннем ветру.' },
    { concept_id: 5, lang_id: 'ja', text: '庭の大きな木が綺麗な花を咲かせます。', translation: 'Большое дерево в саду расцветает красивыми цветами.' },
    { concept_id: 5, lang_id: 'akk', text: 'iṣu rabû ina qišti i-rab-bi.', translation: 'Большое дерево растет в лесу.' },
    { concept_id: 5, lang_id: 'egy', text: 'ḫt ꜥꜣ m ḥwt-nṯr.', translation: 'Великое дерево в священном храме.' },
    { concept_id: 5, lang_id: 'sa', text: 'वृक्षः मधुरं फलं ददाति सर्वदा।', translation: 'Дерево всегда дает сладкие плоды.' },
    { concept_id: 5, lang_id: 'en', text: 'The ancient tree stands at the center of the field.', translation: 'Древнее дерево стоит в центре поля.' },
    { concept_id: 5, lang_id: 'de', text: 'Der große Baum spendet im Sommer kühlen Schatten.', translation: 'Большое дерево дарит прохладную тень летом.' },
    { concept_id: 5, lang_id: 'la', text: 'Arbor alta in silva crescit cum tempore.', translation: 'Высокое дерево в лесу растет со временем.' },
    { concept_id: 5, lang_id: 'grc', text: 'Τὸ δένδρον φέρει καρποὺς καλούς.', translation: 'Дерево приносит хорошие плоды.' },
    { concept_id: 5, lang_id: 'ru', text: 'Старое дерево укрывало от дождя своими ветвями.', translation: 'Старое дерево укрывало от дождя своими ветвями.' }
];

let currentConceptIndex = 0;
let activeFluidCloudInstance = null;

function initCards(container) {
    injectCardsStyles();
    container.innerHTML = renderCarouselWrapperHTML();
    loadConceptCard(currentConceptIndex);
    setupCarouselControls();
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
            height: 320px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            border-radius: 16px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .concept-label {
            position: absolute;
            top: 12px;
            left: 14px;
            font-size: 0.75rem;
            font-weight: 700;
            color: #18181b;
            letter-spacing: 1px;
            text-transform: uppercase;
            pointer-events: none;
            z-index: 20;
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
            z-index: 30;
            padding: 0;
            border-radius: 50%;
        }

        .nav-arrow-btn svg {
            width: 22px;
            height: 22px;
            transition: transform 0.2s ease, stroke-width 0.2s ease;
        }

        .nav-arrow-btn:hover {
            color: #18181b;
            background: rgba(0,0,0,0.03);
        }

        .nav-arrow-btn:hover svg {
            stroke-width: 1.5;
            transform: scale(1.15);
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
            padding: 3px 6px;
            font-size: 0.7rem;
            font-weight: 600;
            color: #18181b;
            outline: none;
            cursor: pointer;
            text-transform: uppercase;
            box-shadow: 0 2px 6px rgba(0,0,0,0.04);
        }

        .lang-select-dropdown:hover {
            border-color: #18181b;
        }

        /* Нижний блок примеров */
        .examples-bottom-panel {
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

        .examples-panel-header {
            font-size: 0.65rem;
            font-weight: 700;
            color: #a1a1aa;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .examples-list-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 120px;
            overflow-y: auto;
        }

        .example-card-item {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.05);
            padding: 8px 10px;
            border-radius: 8px;
            transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .example-card-item.active-lang {
            border-color: #2563eb;
            background-color: rgba(37, 99, 235, 0.02);
        }

        .ex-text-orig {
            font-size: 0.82rem;
            font-weight: 600;
            color: #18181b;
            margin: 0 0 2px 0;
            line-height: 1.3;
        }

        .ex-text-trans {
            font-size: 0.75rem;
            color: #71717a;
            margin: 0;
            line-height: 1.2;
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
                <button class="nav-arrow-btn" id="carousel-prev-btn" title="Предыдущая карта">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>
                <div id="active-concept-title" style="font-size: 0.85rem; font-weight: 700; color: #18181b;"></div>
                <button class="nav-arrow-btn" id="carousel-next-btn" title="Следующая карта">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>

            <div class="carousel-viewport">
                <div id="fluid-cloud-stage" class="cloud-wrapper">
                    <div id="active-concept-label" class="concept-label"></div>
                </div>
            </div>

            <!-- Блок примеров в нижней части -->
            <div class="examples-bottom-panel">
                <div class="examples-panel-header">
                    <span>Примеры употребления</span>
                    <span id="examples-count-badge" style="color: #2563eb;"></span>
                </div>
                <div id="examples-list-target" class="examples-list-container"></div>
            </div>
        </div>
    `;
}

function loadConceptCard(index) {
    const concept = testConcepts[index];
    if (!concept) return;

    const titleEl = document.getElementById('active-concept-title');
    if (titleEl) {
        titleEl.textContent = `#0${concept.id} • ${concept.name_ru}`;
    }

    const stageEl = document.getElementById('fluid-cloud-stage');
    if (!stageEl) return;

    stageEl.querySelectorAll('canvas, .lang-select-dropdown').forEach(el => el.remove());

    const conceptWords = testWords.filter(w => w.concept_id === concept.id);
    const conceptExamples = testExamples.filter(e => e.concept_id === concept.id);

    activeFluidCloudInstance = new FluidConceptCloud(stageEl, conceptWords, conceptExamples);
}

function setupCarouselControls() {
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentConceptIndex--;
            if (currentConceptIndex < 0) currentConceptIndex = testConcepts.length - 1;
            loadConceptCard(currentConceptIndex);
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentConceptIndex = (currentConceptIndex + 1) % testConcepts.length;
            loadConceptCard(currentConceptIndex);
        };
    }
}

class FluidConceptCloud {
    constructor(container, words, examples) {
        this.container = container;
        this.words = words;
        this.examples = examples;

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
        this.renderExamplesPanel(this.nodes[0] ? this.nodes[0].lang_id : null);
        this.bindEvents();
        this.animate();
    }

    initCanvas() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }

    initNodes() {
        const cx = this.width / 2;
        const cy = this.height / 2;

        this.nodes = this.words.map((w, index) => {
            const isCenter = index === 0;
            const angle = (index / this.words.length) * Math.PI * 2;
            const radius = isCenter ? 0 : 85 + Math.random() * 15;

            const node = {
                ...w,
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                vx: 0, vy: 0,
                targetSize: isCenter ? 48 : (w.type === 'glyph' ? 22 : 15),
                currentSize: isCenter ? 48 : (w.type === 'glyph' ? 22 : 15),
                isCenter: isCenter,
                color: isCenter ? '#dc2626' : (w.type === 'glyph' ? '#d97706' : '#2563eb')
            };

            if (isCenter) this.centerNode = node;
            return node;
        });
    }

    createLangDropdown() {
        const select = document.createElement('select');
        select.className = 'lang-select-dropdown';

        this.words.forEach(w => {
            const option = document.createElement('option');
            option.value = w.lang_id;
            const langName = (testLanguages.find(l => l.id === w.lang_id) || {}).name || w.lang_id;
            option.textContent = `${w.lang_id.toUpperCase()} - ${langName}`;
            select.appendChild(option);
        });

        select.onchange = (e) => {
            this.setCenterByLang(e.target.value);
        };

        this.container.appendChild(select);
        this.langSelectEl = select;
    }

    setCenterByLang(langId) {
        const targetNode = this.nodes.find(n => n.lang_id === langId);
        if (!targetNode) return;

        this.nodes.forEach(n => {
            const isTarget = (n.id === targetNode.id);
            n.isCenter = isTarget;

            if (isTarget) {
                n.targetSize = n.type === 'alpha' ? 36 : 50;
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

        // Обновляем список примеров снизу под выделенный язык
        this.renderExamplesPanel(langId);
    }

    renderExamplesPanel(activeLangId) {
        const targetEl = document.getElementById('examples-list-target');
        const badgeEl = document.getElementById('examples-count-badge');
        if (!targetEl) return;

        if (badgeEl) badgeEl.textContent = `${this.examples.length} фразы`;

        // Сортируем так, чтобы выбранный язык оказался наверху
        const sorted = [...this.examples].sort((a, b) => {
            if (a.lang_id === activeLangId) return -1;
            if (b.lang_id === activeLangId) return 1;
            return 0;
        });

        targetEl.innerHTML = sorted.map(ex => {
            const langObj = testLanguages.find(l => l.id === ex.lang_id) || { name: ex.lang_id };
            const isActive = ex.lang_id === activeLangId;
            return `
                <div class="example-card-item ${isActive ? 'active-lang' : ''}">
                    <p class="ex-text-orig">${ex.text} <span style="font-size:0.65rem; color:#a1a1aa; font-weight:normal;">(${langObj.name})</span></p>
                    ${ex.translation ? `<p class="ex-text-trans">${ex.translation}</p>` : ''}
                </div>
            `;
        }).join('');

        // Прокручиваем к первому выделенному элементу
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

            if (!a.isCenter && a !== this.draggedNode) {
                const dx = this.centerNode.x - a.x;
                const dy = this.centerNode.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const targetDist = 90;

                const force = (dist - targetDist) * 0.0012;
                a.vx += (dx / dist) * force;
                a.vy += (dy / dist) * force;
            }

            for (let j = i + 1; j < this.nodes.length; j++) {
                let b = this.nodes[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const minDist = (a.currentSize + b.currentSize) * 1.3;

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

        // Отрисовка плавающих слов на чистом фоне
        this.nodes.forEach(n => {
            this.ctx.font = `${n.isCenter ? '800' : '600'} ${n.currentSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
            this.ctx.fillStyle = n.color;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(n.word, n.x, n.y);
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
                this.setCenterByLang(clicked.lang_id);
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
