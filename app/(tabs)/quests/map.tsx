// app/quests/map.tsx (обёртка над MapPageComponent)
import React, { useMemo, useState } from 'react';
import { CITY_QUESTS } from '@/components/quests/cityQuests';
import { getQuestById } from '@/components/quests/registry';
import { useRouter } from 'expo-router';
import {Platform} from "react-native";

let MapPageComponent: React.FC<any> | null = null;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
    MapPageComponent = require('@/components/MapPage/Map').default;
}

type Point = {
    id?: number;
    coord: string;
    address: string;
    travelImageThumbUrl: string;
    categoryName: string;
    articleUrl?: string;
    urlTravel?: string;
};

export default function QuestsMapScreen() {
    const router = useRouter();

    const travel = useMemo(() => {
        const data: Point[] = [];
        for (const [cityId, list] of Object.entries(CITY_QUESTS)) {
            for (const q of list) {
                const b = getQuestById(q.id);
                if (!b?.city?.lat || !b?.city?.lng) continue;
                data.push({
                    id: undefined,
                    coord: `${b.city.lat},${b.city.lng}`, // строка "lat,lng"
                    address: b.city?.name || cityId,
                    travelImageThumbUrl: '', // при желании добавь cover
                    categoryName: 'Квест',
                    urlTravel: `/quests/${cityId}/${q.id}`,
                    articleUrl: undefined,
                });
            }
        }
        return { data };
    }, []);

    const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState(0);
    const [fullRoute, setFullRoute] = useState<[number, number][]>([]);

    return (
        <MapPageComponent
            travel={travel}
            coordinates={{ latitude: 53.9, longitude: 27.56 }} // стартовый центр (Минск), можно сменить
            mode="radius"              // или "route", если хочешь строить маршрут между двумя точками
            transportMode="foot"       // 'car' | 'bike' | 'foot'
            routePoints={routePoints}
            setRoutePoints={setRoutePoints}
            onMapClick={(lng, lat) => { /* можно всплывашку/подбор ближайшего квеста */ }}
            setRouteDistance={setDistance}
            setFullRouteCoords={setFullRoute}
        />
    );
}
