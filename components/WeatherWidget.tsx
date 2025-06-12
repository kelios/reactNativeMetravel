import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, Image } from 'react-native';

type Props = {
    points: { coord: string; address?: string }[];
    countryName?: string;
};

type DailyForecast = {
    date: string;
    temperatureMin: number;
    temperatureMax: number;
    condition: string;
    icon: string;
};

export default function WeatherWidget({ points, countryName }: Props) {
    const [forecast, setForecast] = useState<DailyForecast[]>([]);
    const [locationLabel, setLocationLabel] = useState<string>('');

    useEffect(() => {
        if (Platform.OS !== 'web' || !points?.length) return;

        const [latStr, lonStr] = points[0].coord.split(',').map((s) => s.trim());
        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);
        if (isNaN(lat) || isNaN(lon)) return;

        const rawAddress = points[0]?.address ?? '';
        const addressParts = rawAddress.split(',').map(part => part.trim());

        // Просто берём 0,1,2 элементы + country
        const locationParts = addressParts.slice(0, 3).filter(Boolean);
        if (countryName) {
            locationParts.push(countryName);
        }

        setLocationLabel(locationParts.join(', '));

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                const dates = data?.daily?.time ?? [];
                const tempMax = data?.daily?.temperature_2m_max ?? [];
                const tempMin = data?.daily?.temperature_2m_min ?? [];
                const codes = data?.daily?.weather_code ?? [];

                const forecastData: DailyForecast[] = dates.slice(0, 3).map((date: string, i: number) => ({
                    date,
                    temperatureMin: tempMin[i],
                    temperatureMax: tempMax[i],
                    condition: weatherDescriptions[codes[i]] ?? 'Неизвестно',
                    icon: iconFromCode(codes[i]),
                }));

                setForecast(forecastData);
            })
            .catch(() => {});
    }, [points, countryName]);

    if (Platform.OS !== 'web' || !forecast.length || !locationLabel) return null;

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Погода в {locationLabel}</Text>
            {forecast.map((day) => (
                <View key={day.date} style={styles.box}>
                    <Image source={{ uri: day.icon }} style={styles.icon} {...(Platform.OS === 'web' ? { loading: 'lazy' } : {})} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.date}>{formatDate(day.date)}</Text>
                        <Text style={styles.temp}>
                            {Math.round(day.temperatureMin)}°C / {Math.round(day.temperatureMax)}°C
                        </Text>
                        <Text style={styles.desc}>{day.condition}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const capitalize = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
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
        marginBottom: 12,
    },
    date: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
        fontFamily: 'Roboto-Regular',
    },
    temp: {
        fontSize: 16,
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
    2: 'Переменная облачность',
    3: 'Пасмурно',
    45: 'Туман',
    48: 'Инейный туман',
    51: 'Мелкий моросящий дождь',
    53: 'Умеренный моросящий дождь',
    55: 'Сильный моросящий дождь',
    56: 'Ледяной моросящий дождь',
    57: 'Сильный ледяной моросящий дождь',
    61: 'Слабый дождь',
    63: 'Умеренный дождь',
    65: 'Сильный дождь',
    66: 'Слабый ледяной дождь',
    67: 'Сильный ледяной дождь',
    71: 'Слабый снег',
    73: 'Умеренный снег',
    75: 'Сильный снег',
    77: 'Снежная крупа',
    80: 'Слабый ливневый дождь',
    81: 'Умеренный ливневый дождь',
    82: 'Сильный ливневый дождь',
    85: 'Слабый ливневый снег',
    86: 'Сильный ливневый снег',
    95: 'Гроза',
    96: 'Гроза с градом',
    99: 'Сильная гроза с градом',
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
