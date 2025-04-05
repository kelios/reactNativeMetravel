import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    ActivityIndicator,
    FlatList,
    Text,
    useWindowDimensions,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

import FiltersComponent from '../components/FiltersComponent';
import PaginationComponent from '../components/PaginationComponent';
import TravelListItem from '../components/TravelListItem';
import ConfirmDialog from '../components/ConfirmDialog';
import SearchAndFilterBar from '../components/listTravel/SearchAndFilterBar';

import {
    fetchTravels,
    fetchFilters,
    fetchFiltersCountry,
    deleteTravel
} from '@/src/api/travels';
import { Travel } from '@/src/types/types';

export default function ListTravel() {
    // =========================
    // ХУКИ НА ВЕРХНЕМ УРОВНЕ
    // =========================
    const { width } = useWindowDimensions();
    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({ showModerationPending: false });
    const [travels, setTravels] = useState<Travel[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    // ======================================
    // ПРОЧИЕ ПЕРЕМЕННЫЕ И ВСПОМОГАТЕЛЬНЫЕ
    // ======================================
    const isMobile = width <= 768;
    const numColumns = isMobile ? 1 : 2;
    const itemsPerPageOptions = [10, 20, 30, 50, 100];
    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    // ========================
    // useEffect: загрузка
    // ========================
    useEffect(() => {
        // Загружаем ID юзера и флаг superuser
        const loadUserData = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                const superuserFlag = await AsyncStorage.getItem('isSuperuser');
                setUserId(storedUserId);
                setIsSuperuser(superuserFlag === 'true');
            } catch (error) {
                console.error('Ошибка загрузки данных пользователя:', error);
            }
        };

        loadUserData();
        loadFilters();
    }, []);

    useEffect(() => {
        // При изменении itemsPerPage, search, filterValue или userId сбрасываем страницу
        setCurrentPage(0);
    }, [itemsPerPage, search, filterValue, userId]);

    useEffect(() => {
        // Если мы на странице "Мои путешествия" (isMeTravel), но userId нет,
        // то не вызываем fetchMore() (пока ID не будет загружен)
        if (isMeTravel && !userId) return;
        fetchMore();
    }, [currentPage, itemsPerPage, search, filterValue, userId]);

    // =======================
    // Функции загрузки и fetch
    // =======================
    const loadFilters = async () => {
        try {
            const [filtersData, countries] = await Promise.all([
                fetchFilters(),
                fetchFiltersCountry(),
            ]);
            setFilters({ ...filtersData, countries });
        } catch (error) {
            console.error('Ошибка при загрузке фильтров:', error);
        }
    };

    const fetchMore = async () => {
        setIsLoading(true);
        try {
            // Чистим объект filters от пустых значений
            const params = { ...cleanFilters(filterValue) };
            const isModerationPending = filterValue?.showModerationPending ?? false;

            if (isModerationPending) {
                // Если установлен флаг "ожидают модерации"
                params.publish = 1;
                params.moderation = 0;
            } else {
                // Иначе стандартные условия
                if (isMeTravel) params.user_id = userId;
                else if (isTravelBy) {
                    Object.assign(params, { countries: [3], publish: 1, moderation: 1 });
                } else {
                    Object.assign(params, { publish: 1, moderation: 1 });
                }
                // Если page-url содержит user_id => берем travels для конкретного пользователя
                if (user_id) params.user_id = user_id;
            }

            const data = await fetchTravels(currentPage, itemsPerPage, search, params);
            setTravels(data);
        } catch (error) {
            console.error('Failed to fetch travels:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Фильтрация: убираем поля без значений
    const cleanFilters = (filtersObject) => {
        return Object.fromEntries(
            Object.entries(filtersObject).filter(([_, v]) => v && v.length)
        );
    };

    // ============================
    // Обработка удаления
    // ============================
    const handleDelete = async () => {
        if (currentDeleteId) {
            await deleteTravel(currentDeleteId);
            fetchMore();
            setDeleteDialogVisible(false);
        }
    };

    const openDeleteDialog = (id) => {
        setCurrentDeleteId(id);
        setDeleteDialogVisible(true);
    };

    // ================
    // РЕНДЕР
    // ================
    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.contentWrapper, isMobile && { flexDirection: 'column' }]}>
                {/* Левая колонка с фильтрами (только для десктопа) */}
                {!isMobile && (
                    <View style={styles.sidebar}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            onSelectedItemsChange={(field, items) =>
                                setFilterValue({ ...filterValue, [field]: items })
                            }
                            handleTextFilterChange={(year) =>
                                setFilterValue({ ...filterValue, year })
                            }
                            handleApplyFilters={(updatedFilters) =>
                                setFilterValue(updatedFilters)
                            }
                            resetFilters={() =>
                                setFilterValue({ showModerationPending: false, year: '' })
                            }
                            closeMenu={() => {}}
                            isSuperuser={isSuperuser}
                        />
                    </View>
                )}

                {/* Правая область (список/контент) */}
                <View style={styles.content}>
                    <SearchAndFilterBar
                        search={search}
                        setSearch={setSearch}
                        onToggleFilters={() => setIsFiltersVisible((prev) => !prev)}
                    />

                    {isMobile && isFiltersVisible && (
                        <View style={styles.mobileFiltersWrapper}>
                            <ScrollView contentContainerStyle={styles.mobileFiltersScroll}>
                                <FiltersComponent
                                    filters={filters}
                                    filterValue={filterValue}
                                    onSelectedItemsChange={(field, items) =>
                                        setFilterValue({ ...filterValue, [field]: items })
                                    }
                                    handleTextFilterChange={(year) =>
                                        setFilterValue({ ...filterValue, year })
                                    }
                                    handleApplyFilters={(updatedFilters) => {
                                        setFilterValue(updatedFilters);
                                        setIsFiltersVisible(false);
                                    }}
                                    resetFilters={() =>
                                        setFilterValue({ showModerationPending: false, year: '' })
                                    }
                                    closeMenu={() => setIsFiltersVisible(false)}
                                    isSuperuser={isSuperuser}
                                />
                            </ScrollView>
                        </View>
                    )}

                    {/* Состояние загрузки, либо список */}
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#ff7f50" />
                    ) : travels?.data?.length === 0 ? (
                        <Text>Путешествий не найдено</Text>
                    ) : (
                        <FlatList
                            key={`list-cols-${numColumns}`}
                            numColumns={numColumns}
                            columnWrapperStyle={
                                numColumns > 1 ? { justifyContent: 'center', gap: 16 } : undefined
                            }
                            data={travels?.data || []}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        flex: 1,
                                        paddingHorizontal: 8,
                                        marginBottom: 16,
                                    }}
                                >
                                    <TravelListItem
                                        travel={item}
                                        currentUserId={userId ?? ''}
                                        isSuperuser={isSuperuser}
                                        isMetravel={isMeTravel}
                                        onEditPress={() => router.push(`/travel/${item.id}`)}
                                        onDeletePress={() => openDeleteDialog(String(item.id))}
                                    />
                                </View>
                            )}
                            keyExtractor={(item) => String(item.id)}
                        />
                    )}

                    {/* Пагинация */}
                    <PaginationComponent
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        itemsPerPageOptions={itemsPerPageOptions}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={travels?.total}
                    />
                </View>
            </View>

            {/* Диалог подтверждения удаления */}
            <ConfirmDialog
                visible={deleteDialogVisible}
                onClose={() => setDeleteDialogVisible(false)}
                onConfirm={handleDelete}
                title="Удаление"
                message="Удалить это путешествие?"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentWrapper: {
        flexDirection: 'row',
        flex: 1,
    },
    sidebar: {
        backgroundColor: '#f8f8f8',
        padding: 10,
        maxWidth: 300,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    content: {
        flex: 1,
        paddingTop: 8,
        minHeight: 0,
    },
    mobileFiltersWrapper: {
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    mobileFiltersScroll: {
        paddingBottom: 100,
        paddingHorizontal: 8,
    },
});
