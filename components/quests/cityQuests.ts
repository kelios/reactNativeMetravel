// src/data/cityQuests.ts

// Города остаются здесь: это плоский справочник для карты/фильтров
export type City = {
    id: string;         // 'krakow'
    name: string;       // 'Kraków'
    country: 'PL' | 'BY';
    lat: number;        // координаты города для карты/центра
    lng: number;
};

export const CITIES: City[] = [
    { id: 'krakow',        name: 'Kraków',       country: 'PL', lat: 50.0614, lng: 19.9366 },
    { id: 'minsk',         name: 'Минск',        country: 'BY', lat: 53.9023, lng: 27.5619 },
    { id: 'barkovshchina', name: 'Барковщина',   country: 'BY', lat: 55.1012, lng: 28.6038 },
];

// --- Всё остальное (квесты, шаги, индексы) берём из единого реестра ---
export type { QuestMeta } from '@/components/quests/registry';
// Раньше здесь была "урезанная" версия шага — теперь это ShortQuestStep из реестра.
export type { ShortQuestStep as QuestStep } from '@/components/quests/registry';

// Совместимые имена экспортов для существующего кода:
// - ALL_QUESTS: список метаданных всех квестов
// - CITY_QUESTS: индекс город -> квесты
// - QUEST_STEPS: урезанные шаги по id квеста
export {
    ALL_QUESTS_META as ALL_QUESTS,
    CITY_QUESTS_INDEX as CITY_QUESTS,
    SHORT_STEPS_BY_QUEST_ID as QUEST_STEPS,
} from '@/components/quests/registry';
