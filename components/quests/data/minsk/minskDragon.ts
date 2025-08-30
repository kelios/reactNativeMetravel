// components/quests/minsk/minskSmok.ts
import type { QuestStep, QuestFinale } from '@/components/quests/QuestWizard';
import { QuestCity } from "@/components/quests/QuestWizard";

const normalize = (s: string) =>
    s.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?'„”"–—-]/g, '')
        .replace(/ё/g, 'е')
        .trim();

function tryImage<T>(fn: () => T): T | null {
    try { return fn(); } catch { return null as any; }
}

// (опционально положи свои картинки в assets/quests/minskSmok/*.png)
const IMG1 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // вход в парк
const IMG2 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // колесо
const IMG3 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // планетарий
const IMG4 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // опера
const IMG5 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // остров слёз
const IMG6 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // троицкое
const IMG7 = tryImage(() => require('@/assets/quests/minskDragon/1.png')); // верхний город / вид на Свислочь
const VIDEO = null;

export const MINSK_DRAGON_CITY: QuestCity = {
    name: 'Минск',
    lat: 53.9023,
    lng: 27.5619,
    countryCode: 'BY',
};

// ===== Интро =====
export const MINSK_DRAGON_INTRO: QuestStep = {
    id: 'intro',
    title: 'Легенда о Свислочском Цмоке',
    location: 'Старт',
    story:
        `Говорят, в глубинах Свислочи живёт Цмок — хранитель города.
Его дочь Свислочь выбрала человека — Менеска, и так начался Минск.
Иди по следам Цмока от Парка Горького к Троицкому: 
на каждой точке — часть истории и точный факт.`,
    task: 'Нажми «Начать квест», чтобы вступить в путь.',
    answer: () => true,
    lat: 53.9039, lng: 27.5719,
    mapsUrl: '',
    image: '',
};

// ===== 7 шагов — только проверяемые факты, без «посчитать на месте» =====
export const MINSK_DRAGON_STEPS: QuestStep[] = [
    {
        id: '1-park-founded',
        title: 'Врата Цмока',
        location: 'Парк Горького, главный вход',
        story:
            'Цмок бережёт этот вход, как древний лес. Когда-то тут был первый городской сад.',
        task:
            'В каком году был основан будущий Парк Горького как Губернаторский сад? (год)',
        hint: 'Подсказка: начало XIX века.',
        answer: s => parseInt(s, 10) === 1805,
        lat: 53.9039, lng: 27.5719,
        mapsUrl: 'https://maps.google.com/?q=53.9039,27.5719',
        image: IMG1,
        inputType: 'number',
    },
    {
        id: '2-ferris-height',
        title: 'Круг солнца',
        location: 'Колесо обозрения, парк Горького',
        story:
            'Отсюда Цмок смотрит на город сверху. Высота известна — как эталон для путников.',
        task: 'Какова официальная высота колеса обозрения? (метры)',
        hint: 'Подсказка: 5 и 4.',
        answer: s => parseInt(s, 10) === 54,
        lat: 53.9034, lng: 27.5744,
        mapsUrl: 'https://maps.google.com/?q=53.9034,27.5744',
        image: IMG2,
        inputType: 'number',
    },
    {
        id: '3-ferris-installed',
        title: 'Когда поднялось солнце',
        location: 'Колесо обозрения, парк Горького',
        story:
            'Колесо поставили в начале нового века — и оно стало знаком прогулок по набережной.',
        task: 'В каком году установили нынешнее колесо обозрения? (год)',
        hint: 'Подсказка: начало 2000-х.',
        answer: s => parseInt(s, 10) === 2003,
        lat: 53.9034, lng: 27.5744,
        mapsUrl: 'https://maps.google.com/?q=53.9034,27.5744',
        image: IMG2,
        inputType: 'number',
    },
    {
        id: '4-planetarium-year',
        title: 'Звёздный купол',
        location: 'Минский планетарий',
        story:
            'Цмок любит смотреть на звёзды. Под этим куполом они ближе, чем кажется.',
        task: 'В каком году открылся Минский планетарий? (год)',
        hint: 'Подсказка: середина 1960-х.',
        answer: s => parseInt(s, 10) === 1965,
        lat: 53.9045, lng: 27.5745,
        mapsUrl: 'https://planetarium.by',
        image: IMG3,
        inputType: 'number',
    },
    {
        id: '5-opera-opened',
        title: 'Голос города',
        location: 'Большой театр оперы и балета',
        story:
            'Музыка — дыхание Цмока. Театр стал домом этого дыхания ещё до появления собственного здания.',
        task: 'В каком году открылся театр (первая премьера «Кармен»)? (год)',
        hint: 'Подсказка: первая половина 1930-х.',
        answer: s => parseInt(s, 10) === 1933,
        lat: 53.9104, lng: 27.5617,
        mapsUrl: 'https://bolshoibelarus.by',
        image: IMG4,
        inputType: 'number',
    },
    {
        id: '6-island-opened',
        title: 'Остров мужества и скорби',
        location: 'Остров слёз',
        story:
            'Цмок хранит память о погибших. Здесь — место тишины и имён.',
        task: 'В каком году официально открыли мемориал «Остров Мужества и Скорби»? (год)',
        hint: 'Подсказка: в 1990-е.',
        answer: s => parseInt(s, 10) === 1996,
        lat: 53.9072, lng: 27.5585,
        mapsUrl: 'https://maps.google.com/?q=53.9072,27.5585',
        image: IMG5,
        inputType: 'number',
    },
    {
        id: '7-trinity-museum',
        title: 'Камни Троицкого',
        location: 'Троицкое предместье',
        story:
            'Здесь живёт память слов. Поэт, которого любил Минск, остался в этих домах.',
        task:
            'Как называется музей в Троицком предместье, посвящённый Максиму Богдановичу? (полное название)',
        hint: 'Подсказка: «Литературный музей …».',
        answer: s => {
            const a = normalize(s);
            const ok = [
                'литературный музей максима богдановича',
                'лiтаратурны музей максiма багдановiча',
                'литературный музей м богдановича',
                'литературный музей м. богдановича',
                'литературный музей максима богдановича минск',
            ];
            return ok.includes(a);
        },
        lat: 53.9086, lng: 27.5562,
        mapsUrl: 'https://maps.google.com/?q=53.9086,27.5562',
        image: IMG6,
        inputType: 'text',
    },
];

// ===== Финал =====
export const MINSK_DRAGON_FINALE: QuestFinale = {
    text:
        `Ты собрал семь знаков Цмока: сад и солнце, звёзды и музыку, память и слово.
        Цмок поднимается из воды Свислочи и шепчет:
        «Пока ты помнишь — город дышит».`,
    video: VIDEO,
};

export const MINSK_DRAGON_TITLE = 'По следам Свислочского Цмока';
export const MINSK_DRAGON_STORAGE_KEY = 'quest_minsk_smok_facts_v2';

export { normalize, tryImage };
