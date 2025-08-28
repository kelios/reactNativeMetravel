// components/quests/minsk/minskDragon.ts
import type { QuestStep, QuestFinale } from '@/components/quests/QuestWizard';
import {QuestCity} from "@/components/quests/QuestWizard";

const normalize = (s: string) =>
    s.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?'„”"–—-]/g, '')
        .replace('ё', 'е')
        .trim();

function tryImage<T>(fn: () => T): T | null {
    try { return fn(); } catch { return null as any; }
}

// --- картинки (assets/quests/minskDragon/1.png … 5.png)
const IMG2 = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG3 = tryImage(() => require('@/assets/quests/minskDragon/2.png'));
const IMG4 = tryImage(() => require('@/assets/quests/minskDragon/3.png'));
const IMG5 = tryImage(() => require('@/assets/quests/minskDragon/4.png'));
const VIDEO = (() => { try { return require('@/assets/quests/minskDragon/minskDragon.mp4'); } catch { return null; } })();
export const MINSK_DRAGON_CITY: QuestCity = { name: 'Минск', lat: 53.9023, lng: 27.5619, countryCode: 'BY' };

// ===== Интро (отдельно) =====
export const MINSK_DRAGON_INTRO: QuestStep = {
    id: 'intro',
    title: 'Как пройти квест?',
    location: 'Старт',
    story:
        `Ты идёшь по следам Цмока — древнего хранителя Минска.
1) Читай легенду и задание для каждой точки.
2) Открой карту и найди место.
3) Выполни задание на месте.
4) Введи ответ — откроется следующий шаг.
Подсказки направляют, но не выдают ответ.`,
    task: 'Нажми «Начать квест», чтобы отправиться в путь.',
    hint: undefined,
    answer: () => true,
    lat: 53.9022, lng: 27.5619,
    mapsUrl: 'https://maps.google.com/?q=Minsk',
    image: '',
};

// ===== Реальные шаги (без интро) =====
export const MINSK_DRAGON_STEPS: QuestStep[] = [
    {
        id: '1-park-chelusk',
        title: 'Сосны Челюскенцев',
        location: 'Парк Челюскенцев',
        story: 'Высокие сосны здесь хранят дыхание старого леса. Это символ корней и памяти.',
        task: 'Сколько сосен изображено на гербе Минска возле входа в парк? (число)',
        hint: 'Герб установлен у входа с проспекта Независимости.',
        answer: s => parseInt(s, 10) === 2,
        lat: 53.92430686676978, lng: 27.61481592257963,
        mapsUrl: 'https://maps.google.com/?q=Park%20Cheluskintsev%20Minsk',
        image: IMG2,
    },
    {
        id: '2-svisloch',
        title: 'Отражения Свислочи',
        location: 'Набережная Свислочи',
        story: 'Река течёт сквозь века, отражая дома и небо. Символ жизни и движения.',
        task: 'Посмотри на воду. Сколько мостов видно отсюда в обе стороны? (число)',
        hint: 'Оглянись — они соединяют берега недалеко.',
        answer: s => { const n = parseInt(s, 10); return n >= 2 && n <= 4; },
        lat: 53.9064, lng: 27.5710,
        mapsUrl: 'https://www.google.com/maps/place/53%C2%B054\'23.0%22N+27%C2%B034\'15.6%22E/@53.9057126,27.5673284,13.91z/data=!4m4!3m3!8m2!3d53.9064!4d27.571?entry=ttu&g_ep=EgoyMDI1MDgxOS4wIKXMDSoASAFQAw%3D%3D',
        image: IMG3,
    },
    {
        id: '3-trinity',
        title: 'Камни Троицкого',
        location: 'Троицкое предместье',
        story: 'Старые каменные стены — символ стойкости города. Здесь Минск пережил века.',
        task: 'Какого цвета крыши у домов вдоль набережной? Введи одно слово.',
        hint: 'Смотри вверх на черепицу.',
        answer: s => ['красные','красный','рыжие','рыжая'].includes(normalize(s)),
        lat: 53.90863880232267, lng: 27.556269762430954,
        mapsUrl: 'https://maps.google.com/?q=Trinity%20Suburb%20Minsk',
        image: IMG4,
    },
    {
        id: '4-gorky',
        title: 'Огонь и Солнце',
        location: 'Парк Горького',
        story: 'Колесо обозрения поднимает к солнцу. Это символ надежды и света.',
        task: 'Сколько кабинок у колеса обозрения? (число)',
        hint: 'Посчитай по кругу или найди табличку рядом.',
        answer: s => { const n = parseInt(s, 10); return n >= 30 && n <= 42; },
        lat: 53.90343184320839, lng: 27.574398874525993,
        mapsUrl: 'https://maps.app.goo.gl/BzFiWVsKTUztndpt8',
        image: IMG5,
    },
];

// ===== Финал =====
export const MINSK_DRAGON_FINALE: QuestFinale = {
    text:
        `
        Ты прошёл путь через сердце Минска — слышал шёпот сосен, видел отражения воды, касался старых камней и поднялся к солнцу. Цмок, древний хранитель города, выходит из глубин Свислочи. 
        
        «Ты собрал все символы, путник. Теперь ты знаешь: город живёт не только в камнях и улицах, но и в людях. В тебе тоже».
        
        Дракон касается крылами воды — и она вспыхивает золотым светом. 
        
        «Пока ты хранишь легенду — Минск дышит».`,
    video: VIDEO,
};

export const MINSK_DRAGON_TITLE = 'По следам Цмока';
export const MINSK_DRAGON_STORAGE_KEY = 'quest_minsk_dragon_v1';

// Опционально экспортировать утилиты, если нужны где-то ещё:
export { normalize, tryImage };
