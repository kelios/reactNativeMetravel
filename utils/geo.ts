// src/utils/geo.ts
import { ALL_QUESTS, QuestMeta } from '@/components/quests/cityQuests';

const R_EARTH_KM = 6371;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const lat1 = toRad(aLat);
    const lat2 = toRad(bLat);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R_EARTH_KM * Math.asin(Math.sqrt(h));
}

export function getQuestsNearby(lat: number, lng: number, radiusKm: number, opts?: {
    petFriendlyOnly?: boolean;
    difficulty?: Array<QuestMeta['difficulty']>;
    tagsAnyOf?: string[];
}): QuestMeta[] {
    const { petFriendlyOnly, difficulty, tagsAnyOf } = opts || {};
    return ALL_QUESTS
        .filter(q => {
            if (petFriendlyOnly && !q.petFriendly) return false;
            if (difficulty && difficulty.length && !difficulty.includes(q.difficulty ?? 'easy')) return false;
            if (tagsAnyOf && tagsAnyOf.length && !tagsAnyOf.some(t => q.tags?.includes(t))) return false;
            return true;
        })
        .map(q => ({ q, dist: haversineKm(lat, lng, q.lat, q.lng) }))
        .filter(x => x.dist <= radiusKm)
        .sort((a, b) => a.dist - b.dist)
        .map(x => x.q);
}
