import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text } from 'react-native';
import { normalize, transliterate, CITY_ALIASES, MANUAL_IDS } from "@/utils/CityUtils";

type Point = { id: string; address: string; coord: string };
type Props = { points: Point[] };

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

export default function HotelWidget({ points }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [locationId, setLocationId] = useState<string | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' || !points?.length) return;

        setLocationId(null);
        if (ref.current) {
            ref.current.innerHTML = '<p style="text-align:center; color:#aaa; font-size:14px;">Загрузка отелей...</p>';
        }

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

            setLocationId(foundId);
        };

        processLocation();
    }, [points]);

    useEffect(() => {
        if (Platform.OS !== 'web' || !ref.current || !locationId) return;

        // Удаляем старый скрипт
        ref.current.innerHTML = '';
        document.getElementById('hl-widget')?.remove();

        // Создаём новый скрипт
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
            powered_by: 'true',
            id: locationId!,
            categories: 'center',
            primary: '#ff8e00',
            special: '#e0e0e0',
            promo_id: '4026',
            campaign_id: '101',
        });

        script.src = `https://tpwgt.com/content?${params.toString()}`;
        ref.current.appendChild(script);
    }, [locationId]);

    if (Platform.OS !== 'web' || !locationId) return null;

    return (
        <View style={{ width: '100%', marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                Отели рядом
            </Text>
            <View style={{ width: '100%', minHeight: 600 }}>
                <div ref={ref} />
            </View>
        </View>
    );
}
