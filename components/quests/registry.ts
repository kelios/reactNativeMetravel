// src/quests/registry.ts
import type { QuestFinale, QuestStep, QuestCity } from '@/components/quests/QuestWizard';

// --- Kraków: Вавельский дракон
import {
    KRAKOW_DRAGON_INTRO,
    KRAKOW_DRAGON_STEPS,
    KRAKOW_DRAGON_FINALE,
} from '@/components/quests/data/krakow/krakowDragon';

// --- Барковщина: лесной квест
import {
    BARKOV_INTRO,
    BARKOV_STEPS,
    BARKOV_FINALE,
    BARKOV_TITLE,
    BARKOV_CITY,
    BARKOV_STORAGE_KEY,
} from '@/components/quests/data/forestLakes/barkovshchinaQuest';

// --- Минск: Цмок
import {
    MINSK_DRAGON_INTRO,
    MINSK_DRAGON_STEPS,
    MINSK_DRAGON_FINALE,
    MINSK_DRAGON_TITLE,
    MINSK_DRAGON_CITY,
    MINSK_DRAGON_STORAGE_KEY,
} from '@/components/quests/data/minsk/minskDragon';

import {
    PAKOCIM_INTRO,
    PAKOCIM_STEPS,
    PAKOCIM_CAFE_BONUS,
    PAKOCIM_FINALE,
} from '@/components/quests/data/krakow/pakocim';

// ===================== ТИПЫ =====================
export type QuestBundle = {
    title: string;
    steps: QuestStep[];
    finale: QuestFinale;
    intro?: QuestStep;
    storageKey?: string;
    city?: QuestCity;
};

// метаданные для каталогов/поиска (совместимо с тем, что было в cityQuests.ts)
export type QuestMeta = {
    id: string;
    title: string;
    points: number;
    cityId: string;
    lat: number;
    lng: number;
    durationMin?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    petFriendly?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cover?: any;
};

type Provider = {
    id: string;
    aliases?: string[]; // поддержим старые/альтернативные id
    bundle: QuestBundle;
    meta: Omit<QuestMeta, 'id' | 'title' | 'points'>; // title/points берём из bundle
};

// ===================== РЕЕСТР =====================
const PROVIDERS: Provider[] = [
    {
        id: 'krakow-dragon',
        bundle: {
            title: 'Тайна Краковского дракона',
            steps: KRAKOW_DRAGON_STEPS,
            finale: KRAKOW_DRAGON_FINALE,
            intro: KRAKOW_DRAGON_INTRO,
            storageKey: 'quest_krakow_dragon_v1',
            city: { name: 'Kraków', lat: 50.0614, lng: 19.9366, countryCode: 'PL' },
        },
        meta: {
            cityId: 'krakow',
            lat: 50.0617,
            lng: 19.9371,
            durationMin: 120,
            difficulty: 'easy',
            tags: ['legend', 'citywalk', 'history'],
            petFriendly: true,
            cover: require('@/assets/quests/krakowDragon/cover.png'),
        },
    },
    {
        id: 'pakocim-voices',
        bundle: {
            title: 'Голоса Прокоцина',
            steps: [...PAKOCIM_STEPS], // бонус в конце
            finale: PAKOCIM_FINALE,
            intro: PAKOCIM_INTRO,
            storageKey: 'quest_pakocim_v1',
            city: { name: 'Kraków – Prokocim', lat: 50.0185, lng: 19.9941, countryCode: 'PL' },
        },
        meta: {
            cityId: 'krakow',
            lat: 50.0185,
            lng: 19.9941,
            durationMin: 90,
            difficulty: 'easy',
            tags: ['park', 'history', 'nature', 'family'],
            petFriendly: true,
            cover: require('@/assets/quests/pakocim/cover.png'), // сюда можно положить обложку
        },
    },
    {
        id: 'barkovshchina-spirits',
        aliases: ['barkovshchina-forest-secrets'], // алиас для совместимости
        bundle: {
            title: BARKOV_TITLE,
            steps: BARKOV_STEPS,
            finale: BARKOV_FINALE,
            intro: BARKOV_INTRO,
            storageKey: BARKOV_STORAGE_KEY,
            city: BARKOV_CITY,
        },
        meta: {
            cityId: 'barkovshchina',
            lat: BARKOV_CITY.lat,
            lng: BARKOV_CITY.lng,
            durationMin: 60,
            difficulty: 'easy',
            tags: ['nature', 'forest', 'lake', 'legend'],
            petFriendly: true,
            cover: require('@/assets/quests/barkovshchina/cover.png'),
        },
    },
    {
        id: 'minsk-cmok',
        bundle: {
            title: MINSK_DRAGON_TITLE,
            steps: MINSK_DRAGON_STEPS,
            finale: MINSK_DRAGON_FINALE,
            intro: MINSK_DRAGON_INTRO,
            storageKey: MINSK_DRAGON_STORAGE_KEY,
            city: MINSK_DRAGON_CITY,
        },
        meta: {
            cityId: 'minsk',
            lat: 53.9045,
            lng: 27.5615,
            durationMin: 45,
            difficulty: 'easy',
            tags: ['citywalk', 'myth'],
            petFriendly: false,
            cover: require('@/assets/quests/minskDragon/cover.png'),
        },
    },
];

// ===================== АПИ =====================
export function getQuestById(questId: string): QuestBundle | null {
    const key = String(questId || '').toLowerCase();
    const found = PROVIDERS.find(
        (p) => p.id === key || (p.aliases && p.aliases.includes(key)),
    );
    return found ? found.bundle : null;
}

// Полный список метаданных для каталогов
export const ALL_QUESTS_META: QuestMeta[] = PROVIDERS.map((p) => ({
    id: p.id,
    title: p.bundle.title,
    points: p.bundle.steps.length,
    cityId: p.meta.cityId,
    lat: p.meta.lat,
    lng: p.meta.lng,
    durationMin: p.meta.durationMin,
    difficulty: p.meta.difficulty,
    tags: p.meta.tags,
    petFriendly: p.meta.petFriendly,
    cover: p.meta.cover,
}));

// Индекс «город => квесты»
export const CITY_QUESTS_INDEX: Record<string, QuestMeta[]> = ALL_QUESTS_META.reduce(
    (acc, q) => {
        (acc[q.cityId] ||= []).push(q);
        return acc;
    },
    {} as Record<string, QuestMeta[]>,
);

// Упрощённые шаги — удобно для списков без гео/стори
export type ShortQuestStep = {
    id: string;
    title: string;
    task: string;
    hint?: string;
    answer: (input: string) => boolean;
};

export const SHORT_STEPS_BY_QUEST_ID: Record<string, ShortQuestStep[]> = PROVIDERS.reduce(
    (acc, p) => {
        const short = p.bundle.steps.map((s) => ({
            id: s.id,
            title: s.title,
            task: s.task,
            hint: s.hint,
            answer: s.answer,
        }));
        acc[p.id] = short;
        // зеркалим на алиасы, если есть
        (p.aliases || []).forEach((alias) => (acc[alias] = short));
        return acc;
    },
    {} as Record<string, ShortQuestStep[]>,
);
