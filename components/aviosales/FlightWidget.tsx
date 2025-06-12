import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { useInView } from 'react-intersection-observer'; // 🚀 добавляем useInView

const countryToIata: Record<string, string> = {
    Польша: 'WAW', Германия: 'BER', Беларусь: 'MSQ', Украина: 'IEV',
    Литва: 'VNO', Латвия: 'RIX', Эстония: 'TLL', Чехия: 'PRG',
    Австрия: 'VIE', Венгрия: 'BUD', Словакия: 'BTS', Словения: 'LJU',
    Хорватия: 'ZAG', Болгария: 'SOF', Румыния: 'OTP', Греция: 'ATH',
    Италия: 'ROM', Испания: 'MAD', Франция: 'PAR', Португалия: 'LIS',
    Швейцария: 'ZRH', Нидерланды: 'AMS', Бельгия: 'BRU', Дания: 'CPH',
    Швеция: 'STO', Финляндия: 'HEL', Норвегия: 'OSL', Великобритания: 'LON',
    Ирландия: 'DUB', Турция: 'IST', Египет: 'CAI', Таиланд: 'BKK',
    США: 'NYC', Канада: 'YYZ', Мальта: 'MLA', Кипр: 'LCA',
    Маврикий: 'MRU', Маврикия: 'MRU',
};

const cityToIata: Record<string, string> = {
    minsk: 'MSQ', moscow: 'MOW', stpetersburg: 'LED', kyiv: 'IEV', odessa: 'ODS',
    warsaw: 'WAW', krakow: 'KRK', wroclaw: 'WRO', vilnius: 'VNO', kaunas: 'KUN',
    riga: 'RIX', tallinn: 'TLL', berlin: 'BER', frankfurt: 'FRA', munich: 'MUC',
    prague: 'PRG', vienna: 'VIE', budapest: 'BUD', bratislava: 'BTS', ljubljana: 'LJU',
    zagreb: 'ZAG', sofia: 'SOF', bucharest: 'OTP', athens: 'ATH', thessaloniki: 'SKG',
    rome: 'ROM', milan: 'MIL', venice: 'VCE', florence: 'FLR', bologna: 'BLQ',
    madrid: 'MAD', barcelona: 'BCN', valencia: 'VLC', seville: 'SVQ',
    paris: 'PAR', lyon: 'LYS', marseille: 'MRS', nice: 'NCE',
    lisbon: 'LIS', porto: 'OPO', amsterdam: 'AMS', brussels: 'BRU',
    copenhagen: 'CPH', stockholm: 'STO', gothenburg: 'GOT', helsinki: 'HEL', oslo: 'OSL',
    london: 'LON', manchester: 'MAN', dublin: 'DUB', istanbul: 'IST', bangkok: 'BKK',
    cairo: 'CAI', newyork: 'NYC', toronto: 'YYZ', chicago: 'CHI', losangeles: 'LAX',
};

const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '');

export default function FlightWidget({ country }: { country?: string }) {
    const widgetRef = useRef<HTMLDivElement>(null);
    const [origin, setOrigin] = useState<string | null>(null);
    const [city, setCity] = useState<string | null>(null);

    const [refInView, inView] = useInView({
        triggerOnce: true,
        rootMargin: '200px',
    });

    /* ────── 1. IP‑Lookup ────── */
    useEffect(() => {
        if (Platform.OS !== 'web') return;
        fetch('https://ipapi.co/json/?language=en')
            .then(res => res.json())
            .then(data => {
                const key = normalize(data?.city || '');
                if (key && cityToIata[key]) {
                    setOrigin(cityToIata[key]);
                    setCity(data.city);
                }
            })
            .catch(() => {});
    }, []);

    /* ────── 2. Widget Injection ────── */
    useEffect(() => {
        if (Platform.OS !== 'web' || !country || !widgetRef.current || !inView) return;

        widgetRef.current.innerHTML = '';
        document.getElementById('tp-widget-script')?.remove();

        const mainCountry = country.split(/[,/–—]/)[0].trim();
        const destination = countryToIata[mainCountry] ?? 'ANY';

        const script = document.createElement('script');
        script.id = 'tp-widget-script';
        script.async = true;
        script.charset = 'utf-8';
        script.src =
            `https://tp.media/content?currency=byn&trs=423278&shmarker=637690&combine_promos=101_7873&show_hotels=true` +
            `&powered_by=true&locale=ru&searchUrl=www.aviasales.com%2Fsearch` +
            `&open_target=true&target_blank=1&rel=noreferrer` +
            `&primary_override=%23DD9E32ff&color_button=%2373716Fff&color_icons=%23DD9E32FF` +
            `&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4` +
            `&color_focused=%23DD9E32FF&border_radius=0&no_labels=true&plain=true` +
            `&promo_id=7879&campaign_id=100` +
            `&destination=${destination}` +
            (origin ? `&origin=${origin}` : '');

        widgetRef.current.appendChild(script);

        const enforceSafeLinks = () => {
            const links = widgetRef.current?.querySelectorAll('a') || [];
            links.forEach(link => {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            });
        };

        const attempts = [500, 1500, 3000];
        attempts.forEach(timeout => {
            setTimeout(enforceSafeLinks, timeout);
        });
    }, [country, origin, inView]); // 🚀 добавляем inView сюда

    if (Platform.OS !== 'web' || !country) return null;

    const mainCountry = country.split(/[,/–—]/)[0].trim();

    return (
        <View ref={refInView} style={{ width: '100%', marginBottom: 32, paddingTop: 20, paddingBottom: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                Поиск авиабилетов
            </Text>
            <Text style={{ marginBottom: 12 }}>
                Найди недорогие билеты в {mainCountry}
                {city ? ` с вылетом из ${city}` : ''}.
            </Text>
            <View style={{ width: '100%', minHeight: 100 }}>
                {inView && <div ref={widgetRef} />} {/* 🚀 рендерим div только если inView === true */}
            </View>
        </View>
    );
}
