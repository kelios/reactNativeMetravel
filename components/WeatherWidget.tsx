import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, Image } from 'react-native';

type Props = {
    points: { coord: string; address?: string }[];
    countryName?: string;
};

type WeatherData = {
    temperature: number;
    condition: string;
    icon: string;
};

export default function WeatherWidget({ points, countryName }: Props) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [city, setCity] = useState<string | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web' || !points?.length) return;

        const [latStr, lonStr] = points[0].coord.split(',').map((s) => s.trim());
        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);
        if (isNaN(lat) || isNaN(lon)) return;

        // Извлекаем название города
        const rawAddress = points[0]?.address ?? '';
        const extractedCity = rawAddress.split(',')[0]?.trim() ?? '';
        if (!extractedCity) return;

        setCity(capitalize(extractedCity));

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const temp = data?.current?.temperature_2m;
                const code = data?.current?.weather_code;

                if (typeof temp !== 'number' || typeof code !== 'number') return;

                const description = weatherDescriptions[code] ?? 'Неизвестно';
                const icon = iconFromCode(code);

                setWeather({ temperature: temp, condition: description, icon });
            })
            .catch(() => {});
    }, [points]);

    if (Platform.OS !== 'web' || !weather || !city) return null;

    const location = countryName ? `${city}, ${countryName}` : city;

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Погода в {location}</Text>
            <View style={styles.box}>
                <Image source={{ uri: weather.icon }} style={styles.icon} />
                <View>
                    <Text style={styles.temp}>{Math.round(weather.temperature)}°C</Text>
                    <Text style={styles.desc}>{weather.condition}</Text>
                </View>
            </View>
        </View>
    );
}

const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
        fontFamily: 'Roboto-Medium',
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    temp: {
        fontSize: 32,
        fontWeight: '600',
        fontFamily: 'Roboto-Medium',
    },
    desc: {
        fontSize: 14,
        color: '#555',
        fontFamily: 'Roboto-Regular',
    },
    icon: {
        width: 48,
        height: 48,
    },
});

const weatherDescriptions: Record<number, string> = {
    0: 'Ясно',
    1: 'Преимущественно ясно',
    2: 'Облачно',
    3: 'Пасмурно',
    45: 'Туман',
    51: 'Мелкий дождь',
    61: 'Дождь',
    80: 'Ливень',
    95: 'Гроза',
};

function iconFromCode(code: number): string {
    if (code === 0) return 'https://cdn-icons-png.flaticon.com/512/869/869869.png';
    if (code <= 2) return 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png';
    if (code <= 3) return 'https://cdn-icons-png.flaticon.com/512/414/414825.png';
    if (code >= 45 && code < 60) return 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png';
    if (code >= 60 && code < 70) return 'https://cdn-icons-png.flaticon.com/512/3075/3075858.png';
    if (code >= 80) return 'https://cdn-icons-png.flaticon.com/512/1146/1146869.png';
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163624.png';
}
