import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'metravel_progress_v1';

export type ProgressBucket = Record<string, { unlockedIndex: number; answers: Record<string, string> }>;

export type SaveState = {
    user?: { name: string } | null;
    progress: Record<string, ProgressBucket>; // прогресс по городам → по квестам
};

export async function loadState(): Promise<SaveState> {
    try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : { progress: {} }; } catch { return { progress: {} }; }
}

export async function saveState(state: SaveState) {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
}