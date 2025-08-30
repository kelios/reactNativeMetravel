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

// Картинки (заглушки — замени на свои)
const IMG_START  = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_PARK   = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_WHEEL  = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_PLANET = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_OPERA  = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_ISLAND = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_TRINITY= tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const IMG_FINALE = tryImage(() => require('@/assets/quests/minskDragon/1.png'));
const VIDEO = (() => { try { return require('@/assets/quests/minskDragon/minskDragon.mp4'); } catch { return null; } })();

export const MINSK_DRAGON_CITY: QuestCity = {
    name: 'Минск',
    lat: 53.9023,
    lng: 27.5619,
    countryCode: 'BY',
};

// ===== Интро =====
export const MINSK_DRAGON_INTRO: QuestStep = {
    id: 'intro',
    title: 'Тайна Свислочского Цмока',
    location: 'Начало пути',
    story:
        `**Старинная белорусская легенда гласит:**\n\n` +
        `В водах Свислочи испокон веков жил могучий Цмок — дух-хранитель этих земель. \n\n` +
        `Когда-то его дочь, прекрасная река Свислочь, влюбилась в человека по имени Менеск. \n` +
        `Цмок даровал им благословение, и так возник город Минск.\n\n` +
        `**Сейчас:**\nПрошли века, и люди забыли о своём защитнике. Цмок погрузился в многовековой сон, \n` +
        `а без его защиты город стал уязвим для тёмных сил забвения.\n\n` +
        `**Твоя миссия:**\nПройди по семи сакральным точкам города, собери древние артефакты-воспоминания \n` +
        `и разбуди Цмока от многовекового сна!`,
    task: 'Найди первую точку у входа в Парк Горького и нажми "Начать квест"',
    answer: () => true,
    lat: 53.9039, lng: 27.5719,
    mapsUrl: 'https://maps.google.com/?q=53.9039,27.5719',
    image: IMG_START,
};

// ===== 7 шагов =====
export const MINSK_DRAGON_STEPS: QuestStep[] = [
    {
        id: '1-forest-memory',
        title: 'Артефакт Леса',
        location: 'Главный вход в Парк Горького',
        story:
            `Здесь начинался древний лес, где Цмок встречался с духами природы. \n` +
            `Люди превратили его в сад, но древняя энергия всё ещё жива здесь.\n\n` +
            `*Прикоснись к воротам и почувствуй вибрации древнего леса*`,
        task: 'В каком году был основан Губернаторский сад (ныне Парк Горького)? (год)',
        hint: 'Подсказка: начало XIX века',
        answer: s => parseInt(s, 10) === 1805,
        lat: 53.9039, lng: 27.5719,
        mapsUrl: 'https://maps.google.com/?q=53.9039,27.5719',
        image: IMG_PARK,
        inputType: 'number',
    },
    {
        id: '2-sun-memory',
        title: 'Артефакт Солнца',
        location: 'Колесо обозрения',
        story:
            `Цмок часто принимал форму солнечного зайчика, играющего на волнах Свислочи. \n` +
            `Это колесо — современное воплощение того солнечного круга, что видели древние жители.\n\n` +
            `*Поднимись на колесо или просто представь, как Цмок любовался городом с высоты*`,
        task: 'Сколько полных метров в высоту колесо обозрения? (цифра)',
        hint: 'Подсказка: примерно как 18-этажный дом',
        answer: s => parseInt(s, 10) === 54,
        lat: 53.9034, lng: 27.5744,
        mapsUrl: 'https://maps.google.com/?q=53.9034,27.5744',
        image: IMG_WHEEL,
        inputType: 'number',
    },
    {
        id: '3-star-memory',
        title: 'Артефакт Звёзд',
        location: 'Минский планетарий',
        story:
            `По ночам Цмок превращался в созвездие и купался в водах Свислочи, \n` +
            `отражающей звёзды. Здесь люди построили храм звёздам.\n\n` +
            `*Посмотри на купол и представь, как Цмок-созвездие парит над городом*`,
        task: 'В каком году открылся планетарий? (год)',
        hint: 'Подсказка: эпоха космонавтики, 1960-е',
        answer: s => parseInt(s, 10) === 1965,
        lat: 53.9045, lng: 27.5745,
        mapsUrl: 'https://maps.google.com/?q=53.9045,27.5745',
        image: IMG_PLANET,
        inputType: 'number',
    },
    {
        id: '4-voice-memory',
        title: 'Артефакт Голоса',
        location: 'Большой театр оперы и балета',
        story:
            `Голос Цмока был подобен самой прекрасной музыке. \n` +
            `Он пел древние песни на берегах Свислочи, и эти мелодии до сих пор \n` +
            `звучат в стенах этого театра.\n\n` +
            `*Прислушайся — может быть, услышишь отголоски древней песни Цмока*`,
        task: 'В каком году состоялась первая премьера в театре («Кармен»)? (год)',
        hint: 'Подсказка: 1930-е годы',
        answer: s => parseInt(s, 10) === 1933,
        lat: 53.9104, lng: 27.5617,
        mapsUrl: 'https://maps.google.com/?q=53.9104,27.5617',
        image: IMG_OPERA,
        inputType: 'number',
    },
    {
        id: '5-memory-memory',
        title: 'Артефакт Памяти',
        location: 'Остров слёз',
        story:
            `Цмок плакал слезами из чистого хрусталя, когда терял тех, кого защищал. \n` +
            `Эти слезы превращались в острова памяти.\n\n` +
            `*Почти память воинов — Цмок уважает мужество и скорбит с теми, кто помнит*`,
        task: 'В каком году открыли мемориал? (год)',
        hint: 'Подсказка: 1990-е, после Афганской войны',
        answer: s => parseInt(s, 10) === 1996,
        lat: 53.9072, lng: 27.5585,
        mapsUrl: 'https://maps.google.com/?q=53.9072,27.5585',
        image: IMG_ISLAND,
        inputType: 'number',
    },
    {
        id: '6-word-memory',
        title: 'Артефакт Слова',
        location: 'Троицкое предместье, памятная скамейка',
        story:
            `Цмок вдохновлял поэтов через шепот Свислочи. Найдите скамейку, \n` +
            `где запечатлены строки того, кто слышал голос речного духа.`,
        task: 'Какое слово повторяется в первой и последней строке стихотворения на скамейке?',
        hint: 'Подсказка: связано с тем, что течёт и имеет голос',
        // принимаем бел/рус варианты
        answer: s => {
            const n = normalize(s);
            return n === 'рака' || n === 'ракі' || n === 'река' || n === 'реки';
        },
        // ориентировочные координаты у Троицкого (при необходимости уточни)
        lat: 53.9079, lng: 27.5575,
        mapsUrl: 'https://maps.google.com/?q=53.9079,27.5575',
        image: IMG_TRINITY,
        inputType: 'text',
    },
    {
        id: '7-water-memory',
        title: 'Последний артефакт',
        location: 'Набережная Свислочи у Троицкого',
        story:
            `Теперь у тебя есть все артефакты! Лес, Солнце, Звёзды, Голос, Память и Слово.\n\n` +
            `Выйди на набережную, встань лицом к воде и произнеси:\n` +
            `"Цмок Свислочский, я принёс тебе воспоминания твоего города!"\n\n` +
            `*Брось воображаемые артефакты в воду и жди знака*`,
        task: 'Какое настоящее имя Цмока из древних легенд? (подсказка: ищи на информационных щитах)',
        hint: 'Подсказка: два слова: «Свислочский …» / «Свіслацкі …»',
        // принимаем рус/бел + порядок слов
        answer: s => {
            const n = normalize(s);
            return (
                n === 'свислочский цмок' ||
                n === 'цмок свислочский' ||
                n === 'свіслацкі цмок' ||
                n === 'цмок свіслацкі'
            );
        },
        lat: 53.9080, lng: 27.5570,
        mapsUrl: 'https://maps.google.com/?q=53.9080,27.5570',
        image: IMG_FINALE,
        inputType: 'text',
    }
];

// ===== Финал =====
export const MINSK_DRAGON_FINALE: QuestFinale = {
    text:
        `**Воды Свислочи вдруг забурлили, и из глубины поднялся величественный Цмок!**\n\n` +
        `*"Благодарю тебя, хранитель памяти. Ты вернул мне силу, собрав артефакты воспоминаний."*\n\n` +
        `*"Пока живёт память — жив город. Пока течёт Свислочь — жив я."*\n\n` +
        `*"Расскажи другим эту легенду, чтобы не забывали..."*\n\n` +
        `Цмок медленно погружается обратно в воды, но теперь ты знаешь — он бодрствует и защищает город.\n\n` +
        `**Квест завершён! Ты разбудил хранителя Минска!**`,
    video: VIDEO,
};

export const MINSK_DRAGON_TITLE = 'Тайна Свислочского Цмока: Легенда оживает';
export const MINSK_DRAGON_STORAGE_KEY = 'quest_minsk_smok_awakened_v3';

export { normalize, tryImage };
