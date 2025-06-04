import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';

// IATA-коды столиц или крупнейших аэропортов
const countryToIata: Record<string, string> = {
    Польша: 'WAW',
    Греция: 'ATH',
    Испания: 'MAD',
    Франция: 'PAR',
    Италия: 'ROM',
    Чехия: 'PRG',
    Беларусь: 'MSQ',
    Германия: 'BER',
    Португалия: 'LIS',
    Нидерланды: 'AMS',
    Австрия: 'VIE',
    Венгрия: 'BUD',
    Швейцария: 'ZRH',
    Великобритания: 'LON',
    Турция: 'IST',
    Египет: 'CAI',
    Таиланд: 'BKK',
    США: 'NYC',
    Канада: 'YYZ',
    Мальта: 'MLA',
    Кипр: 'LCA',
};

export default function FlightWidget({ country }: { country?: string }) {
    const widgetRef = useRef<HTMLDivElement>(null);
    const [origin, setOrigin] = useState<string>('ANY');
    // Определяем город пользователя по IP (для origin)
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        // Очищаем старое содержимое виджета
        widgetRef.current.innerHTML = '';

        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                if (data && data.city) {
                    setOrigin(data.city);
                }
            })
            .catch(() => {
                setOrigin('ANY');
            });
    }, []);


    /** 2. Подключаем (или пере-подключаем) виджет, когда меняется страна или origin */
    useEffect(() => {
        if (Platform.OS !== 'web' || !country || !widgetRef.current) return;

        // удаляем старый скрипт, если был
        const old = document.getElementById('tp-widget-script');
        if (old) old.remove();

        const destination = countryToIata[country] ?? 'ANY';

        const script = document.createElement('script');
        script.id = 'tp-widget-script';
        script.async = true;
        script.charset = 'utf-8';
        script.src =
            `https://tp.media/content?currency=byn` +
            `&trs=423278&shmarker=637690&combine_promos=101_7873&show_hotels=true` +
            `&powered_by=true&locale=ru&searchUrl=www.aviasales.com%2Fsearch` +
            `&primary_override=%23DD9E32ff&color_button=%2373716Fff&color_icons=%23DD9E32FF` +
            `&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4` +
            `&color_focused=%23DD9E32FF&border_radius=0&no_labels=true&plain=true` +
            `&promo_id=7879&campaign_id=100` +
            `&origin=${origin}&destination=${destination}`;

        widgetRef.current.appendChild(script);
    }, [country, origin]);

    if (Platform.OS !== 'web' || !country) return null;

    /** 3. Отрисовка заголовка и контейнера виджета */
    return (
        <View style={{ width: '100%', marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>
                Поиск билетов
            </Text>
            <Text style={{ marginBottom: 12 }}>
                Найди недорогие билеты в {country}
                {origin !== 'ANY' ? ` с вылетом из ${origin}` : ''}.
            </Text>
            <View style={{ width: '100%', minHeight: 300 }}>
                <div ref={widgetRef} />
            </View>
        </View>
    );
}
