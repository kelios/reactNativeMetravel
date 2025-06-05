import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text } from 'react-native';

type Point = { id: string; address: string; coord: string };
type Props = { points: Point[] };

const MANUAL_IDS: Record<string, string> = {
    'варшава': '2200', 'warszawa': '2200', 'warsaw': '2200',
    'минск': '2249', 'вильнюс': '2303', 'vilnius': '2303',
    'вена': '2337', 'vienna': '2337', 'wien': '2337',
    'влёра': '13837', 'vlora': '13837', 'vlorë': '13837', 'авлона': '13837',
    'краков': '2190', 'kraków': '2190', 'krakow': '2190',
};

const CITY_ALIASES: Record<string, string[]> = {
    'влёра': ['vlora', 'vlorë', 'авлона'],
    'варшава': ['warszawa', 'warsaw'],
    'вена': ['vienna', 'wien'],
    'краков': ['kraków', 'krakow'],
};

const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const transliterate = (text: string) => {
    const ru: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return text.split('').map(char => ru[char.toLowerCase()] || char).join('');
};

const CITY_CACHE = new Map<string, string | null>();

async function findCityId(term: string): Promise<string | null> {
    const cleanTerm = term.replace(/\s*\(.*?\)\s*/g, '').trim();
    const lowerTerm = cleanTerm.toLowerCase();
    const normalized = normalize(lowerTerm);
    const transliterated = transliterate(lowerTerm);
    const formsToTry = [lowerTerm, normalized, transliterated.toLowerCase()];

    for (const form of formsToTry) {
        if (CITY_CACHE.has(form)) return CITY_CACHE.get(form)!;
        if (MANUAL_IDS[form]) {
            CITY_CACHE.set(form, MANUAL_IDS[form]);
            return MANUAL_IDS[form];
        }
    }

    for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
        if ([city, ...aliases].some(alias => formsToTry.includes(alias.toLowerCase()))) {
            const id = MANUAL_IDS[city];
            if (id) {
                CITY_CACHE.set(lowerTerm, id);
                return id;
            }
        }
    }

    for (const lang of ['ru', 'en', 'de', 'it']) {
        try {
            const url = `https://engine.hotellook.com/api/v2/lookup.json?query=${encodeURIComponent(cleanTerm)}&lang=${lang}&lookFor=city&limit=5`;
            const response = await fetch(url);
            const data = await response.json();

            if (data?.results?.cities?.length) {
                const cities = data.results.cities;
                const exact = cities.find((c: any) =>
                    formsToTry.includes(c.name?.toLowerCase()) ||
                    formsToTry.includes(c.name_translit?.toLowerCase())
                );
                const found = exact || cities[0];
                if (found?.id && found.name) {
                    const cityId = String(found.id);
                    const key = normalize(found.name.toLowerCase());
                    MANUAL_IDS[key] = cityId;
                    CITY_CACHE.set(key, cityId);
                    return cityId;
                }
            }
        } catch {}
    }

    CITY_CACHE.set(lowerTerm, null);
    return null;
}

async function findCityByCoords(lat: number, lon: number): Promise<string | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`;
        const response = await fetch(url);
        const data = await response.json();

        const cityName =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county;

        if (cityName) return await findCityId(cityName);
    } catch {}
    return null;
}

export default function HotelWidget({ points }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [locationId, setLocationId] = useState<string | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' || !points?.length) return;

        setLocationId(null);
        if (ref.current) ref.current.innerHTML = '';

        const processLocation = async () => {
            const parts = points[0].address.split(',')
                .map(p => p.trim())
                .filter(p => p && !/\d/.test(p) && !p.match(/(область|region|district|country)/i));

            let foundId: string | null = null;
            for (const part of parts) {
                const id = await findCityId(part);
                if (id) {
                    foundId = id;
                    break;
                }
            }

            if (!foundId && points[0].coord) {
                const [lat, lon] = points[0].coord.split(',').map(v => parseFloat(v.trim()));
                if (!isNaN(lat) && !isNaN(lon)) {
                    const coordId = await findCityByCoords(lat, lon);
                    foundId = coordId;
                }
            }

            if (foundId) setLocationId(foundId);
        };

        processLocation();
    }, [points]);

    useEffect(() => {
        if (Platform.OS !== 'web' || !ref.current || !locationId) return;

        const loadWidget = () => {
            ref.current!.innerHTML = '';
            document.getElementById('hl-widget')?.remove();

            const script = document.createElement('script');
            script.async = true;
            script.charset = 'utf-8';
            script.id = 'hl-widget';

            const params = new URLSearchParams({
                currency: 'usd',
                trs: '423278',
                shmarker: '637690',
                type: 'compact',
                host: 'search.hotellook.com',
                locale: 'ru',
                limit: '10',
                powered_by: 'false',
                id: locationId,
                categories: 'center',
                promo_id: '4026',
                campaign_id: '101',
                primary: '#ff8e00',
                special: '#e0e0e0',
                nocache: Date.now().toString(),
            });

            script.src = `https://tpwgt.com/content?${params.toString()}`;
            ref.current.appendChild(script);
        };

        loadWidget();
    }, [locationId]);

    if (Platform.OS !== 'web' || !locationId) return null;

    return (
        <View style={{ width: '100%', marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                Отели рядом
            </Text>
            <View style={{ width: '100%', minHeight: 400 }}>
                <div ref={ref} />
            </View>
        </View>
    );
}
