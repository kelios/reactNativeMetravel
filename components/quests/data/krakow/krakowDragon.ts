// data/krakow/krakowDragon.ts
import type { QuestStep, QuestFinale } from '@/components/quests/QuestWizard';

const normalize = (s: string) =>
    s.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?'„”"–—-]/g, '')
        .replace('ё', 'е')
        .trim();

// util to avoid bundler crash if asset missing
function tryImage<T>(fn: () => T): T | null {
    try { return fn(); } catch { return null as any; }
}

const IMG1 = tryImage(() => require('@/assets/quests/krakowDragon/1.png'));
const IMG2 = tryImage(() => require('@/assets/quests/krakowDragon/2.png'));
const IMG3 = tryImage(() => require('@/assets/quests/krakowDragon/3.png'));
const IMG4 = tryImage(() => require('@/assets/quests/krakowDragon/4.png'));
const IMG5 = tryImage(() => require('@/assets/quests/krakowDragon/5.png'));
const IMG6 = tryImage(() => require('@/assets/quests/krakowDragon/6.png'));
const IMG7 = tryImage(() => require('@/assets/quests/krakowDragon/7.png'));
const VIDEO = (() => { try { return require('@/assets/quests/krakowDragon/krakowDragon.mp4'); } catch { return null; } })();

export const KRAKOW_DRAGON_INTRO: QuestStep = {
    id: 'intro',
    title: 'Как пройти квест?',
    location: 'Начало приключения',
    story: `Этот квест — путешествие по Кракову, где оживает легенда о Вавельском драконе.

⚡ Что делать:
1) Прочитай легенду и задание для каждой точки.
2) Найди место на карте.
3) Осмотрись и выполни задание.
4) Введи ответ — откроется следующий шаг.

🎭 Подсказки: подсказывают направление, но не выдают ответ.

🐉 Финал: после всех испытаний — встреча с драконом!`,
    task: 'Нажми «Начать квест», чтобы отправиться в путь.',
    hint: undefined,
    answer: () => true,
    lat: 0, lng: 0, mapsUrl: '', image: null,
};

export const KRAKOW_DRAGON_STEPS: QuestStep[] = [
    {
        id: '1-rynek',
        title: 'Рыночная площадь — пробуждение легенды',
        location: 'Rynek Główny',
        story: 'Сердце Кракова бьётся здесь. Камни площади хранят первые шёпоты о чудовище, что жил под Вавелем.',
        task: 'Посмотри на Суконные ряды напротив «Eros Bendato». Сколько окон над аркадами смотят на площадь?',
        hint: 'Они расположены высоко и идут одно за другим.',
        answer: s => { const n = parseInt(s,10); return !Number.isNaN(n) && n>=26 && n<=32; },
        lat: 50.061697, lng: 19.937117,
        mapsUrl: 'https://maps.google.com/?q=Rynek%20G%C5%82%C3%B3wny%20Krak%C3%B3w',
        image: IMG1,
    },
    {
        id: '2-mariacki',
        title: 'Мариацкий костёл — оборванная мелодия',
        location: 'Bazylika Mariacka',
        story: 'Трубач каждый час поднимал тревогу, но стрела прервала его песнь. С тех пор мелодия всегда обрывается.',
        task: 'Сколько раз он слышен в течение суток?',
        hint: 'Подумай о том, сколько раз сменяется часовая стрелка.',
        answer: s => parseInt(s,10) === 24,
        lat: 50.061721, lng: 19.939094,
        mapsUrl: 'https://maps.google.com/?q=St%20Mary%27s%20Basilica%20Krakow',
        image: IMG2,
    },
    {
        id: '3-sukiennice',
        title: 'Суконные ряды — печать города',
        location: 'Sukiennice',
        story: 'На фасаде — герб-печать, что веками оберегала город от бед. В её символах заключена сила.',
        task: 'Что изображено на гербе? Введи одно ключевое слово.',
        hint: 'Это часть крепости, венчаемая знаком власти.',
        answer: s => ['ворота','башни','корона','замок'].some(k => normalize(s).includes(k)),
        lat: 50.061667, lng: 19.937373,
        mapsUrl: 'https://maps.google.com/?q=Sukiennice%20Krakow',
        image: IMG3,
    },
    {
        id: '4-barbakan',
        title: 'Барбакан — страж на рубеже',
        location: 'Barbakan',
        story: 'Стены Барбакана считались щитом города. Но и они не могли остановить чудовище.',
        task: 'Найди барельеф над порталом. Какая птица хранит вход?',
        hint: 'Его крылья раскинуты широко, а взгляд полон силы.',
        answer: s => normalize(s) === 'орел',
        lat: 50.06551229826169, lng: 19.941680331885227,
        mapsUrl: 'https://maps.google.com/?q=Barbakan%20Krakow',
        image: IMG4,
    },
    {
        id: '5-kazimierz',
        title: 'Казимеж — перекрёсток голосов',
        location: 'Старая синагога',
        story: 'В этих кварталах легенду рассказывали каждый по-своему. И правда о драконе отражалась в окнах истории.',
        task: 'Сколько больших окон выходит на фасад Старой синагоги?',
        hint: 'Их немного — меньше десяти, но больше четырёх.',
        answer: s => { const n = parseInt(s,10); return !Number.isNaN(n) && n>=5 && n<=7; },
        lat: 50.05152733785882, lng: 19.94864899181073,
        mapsUrl: 'https://maps.google.com/?q=Old%20Synagogue%20Krakow',
        image: IMG5,
    },
    {
        id: '6-wawel',
        title: 'Вавель — испытание мудрости',
        location: 'Wawel',
        story: 'Мечи не брали дракона. Тогда юноша набил шкуру овцы веществом едким и жёлтым, словно сам огонь земли. Это стало началом конца.',
        task: 'Как называлось это вещество?',
        hint: 'Оно жгучее, его запах напоминает дым и молнии.',
        answer: s => normalize(s) === 'сера',
        lat: 50.054444, lng: 19.936389,
        mapsUrl: 'https://maps.google.com/?q=Wawel%20Royal%20Castle',
        image: IMG6,
    },
    {
        id: '7-smocza-jama',
        title: 'Smocza Jama — логово чудовища',
        location: 'Пещера дракона',
        story: 'Вот она — пещера, где спал и дышал огнём Вавельский дракон. Теперь сюда ведёт каменная лестница вниз. Каждый шаг звучит, как эхо его рыка.',
        task: 'Сосчитай ступени на пути вниз. Сколько их?',
        hint: 'Это длинный спуск, и число ближе к семидесяти.',
        answer: s => { const n = parseInt(s,10); return !Number.isNaN(n) && n>=60 && n<=80; },
        lat: 50.05317524594176, lng: 19.93359915663944,
        mapsUrl: 'https://maps.google.com/?q=Smocza%20Jama%20Krakow',
        image: IMG7,
    },
];

export const KRAKOW_DRAGON_FINALE: QuestFinale = {
    text:   'Ты прошёл путь легенды! Под холмом спал дракон, но его дух не исчез. ' +
            'Он живёт в каждом камне, в шуме Вислы и в сердце Кракова. ' +
            'Пока звучит история — дракон просыпается вновь, напоминая: сила города — в единстве его людей и в их памяти.',
    video: VIDEO,
};

// удобные реэкспорты, если где-то пригодится normalize/tryImage
export { normalize, tryImage };
