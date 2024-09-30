import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSegments, useRouter } from 'expo-router';

const Breadcrumbs: React.FC = () => {
    const segments = useSegments();  // Получаем сегменты маршрута
    const router = useRouter();      // Получаем доступ к маршрутизатору

    // Функция для преобразования сегментов в удобные имена
    const getSegmentName = (segment: string) => {
        if (segment === '(tabs)') return 'Главная';
        if (segment === 'travels') return 'Маршруты';
        if (segment === '[id]') return 'Подробности маршрута';
        return segment;
    };

    // Функция для обработки нажатия на хлебные крошки
    const handleNavigation = (index: number) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        router.push(path);  // Навигация с использованием router.push
    };

    return (
        <View style={styles.breadcrumbContainer}>
            {segments.map((segment, index) => (
                <React.Fragment key={index}>
                    <TouchableOpacity onPress={() => handleNavigation(index)}>
                        <Text style={styles.breadcrumbText}>{getSegmentName(segment)}</Text>
                    </TouchableOpacity>
                    {index < segments.length - 1 && <Text>/</Text>}
                </React.Fragment>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    breadcrumbContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    breadcrumbText: {
        color: 'blue',
    },
});

export default Breadcrumbs;
