import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    ActivityIndicator,
    FlatList,
    useWindowDimensions,
    Text,
} from 'react-native';
import { Provider as PaperProvider, Dialog, Portal, Button as PaperButton } from 'react-native-paper';
import FiltersComponent from '@/components/FiltersComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { Travels } from '@/src/types/types';
import {
    fetchTravels,
    fetchFilters,
    fetchFiltersCountry,
    deleteTravel,
} from '@/src/api/travels';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchBar, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import TravelListItem from '@/components/TravelListItem';

export default function ListTravel() {
    const { width: windowWidth } = useWindowDimensions();
    const styles = getStyles(windowWidth);

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({});
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);

    const [menuVisible, setMenuVisible] = useState(false);
    const [travels, setTravels] = useState<Travels | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [userId, setUserId] = useState('');
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);

    const isMobile = windowWidth <= 768;
    const numColumns = windowWidth <= 1400 ? 1 : 2;

    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();

    // Определяем, на какой экран зашли
    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    // Параметры пагинации
    const itemsPerPageOptions = [10, 20, 30, 50, 100];
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]); // Значение по умолчанию = 30

    /**
     * Получаем userId из AsyncStorage
     */
    useEffect(() => {
        const getUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (storedUserId) {
                setUserId(storedUserId);
            }
        };
        getUserId();
    }, []);

    /**
     * Загружаем фильтры один раз при монтировании экрана.
     * ВАЖНО: пустой массив зависимостей [] — вызовется ровно один раз.
     */
    useEffect(() => {
        const loadFilters = async () => {
            try {
                setIsLoadingFilters(true);
                // Параллельная загрузка основных фильтров и стран.
                const [filtersData, countryData] = await Promise.all([
                    fetchFilters(),
                    fetchFiltersCountry(),
                ]);

                setFilters({
                    categories: filtersData?.categories || [],
                    categoryTravelAddress: filtersData?.categoryTravelAddress || [],
                    companions: filtersData?.companions || [],
                    complexity: filtersData?.complexity || [],
                    month: filtersData?.month || [],
                    over_nights_stay: filtersData?.over_nights_stay || [],
                    transports: filtersData?.transports || [],
                    countries: countryData || [],
                });
            } catch (error) {
                console.log('Ошибка при загрузке фильтров:', error);
            } finally {
                setIsLoadingFilters(false);
            }
        };

        loadFilters();
    }, []);

    /**
     * Каждый раз, когда меняются критичные параметры (фильтры, поиск, количество на странице),
     * сбрасываем страницу на 0. Затем отдельный эффект (ниже) будет вызывать `fetchMore`.
     */
    useEffect(() => {
        setCurrentPage(0);
    }, [itemsPerPage, search, filterValue, userId]);

    /**
     * Когда изменяется страница, userId, фильтры, поиск — выполняем запрос данных
     * (учитывая, что для `metravel` необходимо дождаться userId).
     */
    useEffect(() => {
        if (isMeTravel && !userId) {
            // Если на metravel и userId ещё не получен — не делаем запрос, ждём userId
            return;
        }
        fetchMore();
    }, [currentPage, itemsPerPage, search, filterValue, userId, isMeTravel]);

    /**
     * Функция очистки и подготовки фильтров
     */
    const cleanFilters = (filtersObject: Record<string, any>) => {
        const cleanedFilters: Record<string, any> = {};
        Object.keys(filtersObject).forEach((key) => {
            const value = filtersObject[key];
            if (Array.isArray(value) && value.length > 0) {
                cleanedFilters[key] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
                cleanedFilters[key] = value;
            }
        });
        return cleanedFilters;
    };

    /**
     * Основная функция для получения данных (списка путешествий)
     */
    const fetchMore = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            let param: any = {};

            if (isMeTravel) {
                // Путешествия текущего пользователя
                param.user_id = userId;
            } else if (isTravelBy) {
                // Например, travelsby = только модерированные и опубликованные + конкретные страны
                param = {
                    moderation: 1,
                    publish: 1,
                    countries: [3],
                };
            } else {
                // Обычный сценарий
                param = {
                    moderation: 1,
                    publish: 1,
                };
            }

            // Пришёл ли user_id из параметров маршрута (например, /travelsby?user_id=...)
            if (user_id) {
                param.user_id = user_id;
            }

            // Добавляем очищенные фильтры
            const cleaned = cleanFilters(filterValue);
            param = { ...param, ...cleaned };

            // Делаем запрос
            const newData = await fetchTravels(currentPage, itemsPerPage, search, param);
            setTravels(newData);
        } catch (error) {
            console.log('Ошибка при загрузке путешествий:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Сброс всех фильтров
     */
    const resetAllFilters = () => {
        setFilterValue({});
    };

    /**
     * Применение фильтров (можно задать год)
     */
    const handleApplyFilters = (yearInput?: string) => {
        const updatedFilters = { ...filterValue };
        if (yearInput !== undefined) {
            updatedFilters.year = yearInput;
        }
        setFilterValue(updatedFilters);
    };

    /**
     * Обновление строки поиска
     */
    const updateSearch = (searchText: string) => {
        setSearch(searchText);
    };

    /**
     * Выбор значений из мульти-селектов
     */
    const onSelectedItemsChange = (field: string, selectedItems: string[]) => {
        setFilterValue({
            ...filterValue,
            [field]: selectedItems,
        });
    };

    /**
     * Изменение текстового значения (например, для года)
     */
    const handleTextFilterChange = (value?: string) => {
        setFilterValue({
            ...filterValue,
            year: value,
        });
    };

    /**
     * Показ/скрытие бокового меню на мобильных
     */
    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };
    const closeMenu = () => {
        setMenuVisible(false);
    };

    /**
     * Переход по страницам
     */
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    /**
     * Изменение количества элементов на странице
     */
    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
    };

    /**
     * Обработка редактирования путешествия
     */
    const handleEdit = (id: string) => {
        router.push(`/travel/${id}`);
    };

    /**
     * Удаление путешествия
     */
    const handleDelete = async () => {
        if (!currentDeleteId) return;

        try {
            const response = await deleteTravel(currentDeleteId);
            if (response.status === 204) {
                setTravels((prevTravels) => {
                    if (!prevTravels || !Array.isArray(prevTravels.data)) return prevTravels;
                    const updatedData = prevTravels.data.filter(
                        (t) => String(t.id) !== String(currentDeleteId)
                    );
                    return {
                        ...prevTravels,
                        data: updatedData,
                    };
                });
            } else {
                console.log(`Ошибка удаления: ${response.message}`);
            }
        } catch (error) {
            console.log('Произошла ошибка при удалении', error);
        } finally {
            setDeleteDialogVisible(false);
        }
    };

    /**
     * Открытие диалога подтверждения удаления
     */
    const openDeleteDialog = (id: string) => {
        setCurrentDeleteId(id);
        setDeleteDialogVisible(true);
    };

    /**
     * Если фильтры ещё грузятся (первый рендер) — покажем лоадер
     */
    if (isLoadingFilters && !Object.keys(filters).length) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6aaaaa" />
            </View>
        );
    }

    return (
        <PaperProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.container}>
                    {/* Боковое меню фильтров */}
                    {(!isMobile || menuVisible) && (
                        <View style={[styles.sideMenu, menuVisible && styles.sideMenuVisible]}>
                            <FiltersComponent
                                filters={filters}
                                filterValue={filterValue}
                                isLoadingFilters={isLoadingFilters}
                                onSelectedItemsChange={onSelectedItemsChange}
                                handleTextFilterChange={handleTextFilterChange}
                                resetFilters={resetAllFilters}
                                handleApplyFilters={handleApplyFilters}
                                closeMenu={closeMenu}
                                isMobile={isMobile}
                            />
                        </View>
                    )}

                    {/* Основная часть со списком */}
                    <View style={styles.content}>
                        {isMobile && (
                            <Button
                                title="Фильтры"
                                onPress={toggleMenu}
                                containerStyle={styles.menuButtonContainer}
                                buttonStyle={styles.menuButton}
                                titleStyle={styles.menuButtonText}
                            />
                        )}
                        <View style={styles.searchContainer}>
                            <SearchBar
                                placeholder="Введите ключевые слова..."
                                onChangeText={updateSearch}
                                value={search}
                                lightTheme
                                round
                                containerStyle={styles.searchBarContainer}
                                inputContainerStyle={styles.searchInputContainer}
                                inputStyle={styles.searchInput}
                            />
                        </View>

                        {isLoading ? (
                            <ActivityIndicator size="large" color="#6aaaaa" />
                        ) : (
                            <FlatList
                                key={`flatlist-columns-${numColumns}`}
                                data={travels?.data || []}
                                renderItem={({ item }) => (
                                    <View style={styles.itemContainer}>
                                        <TravelListItem
                                            travel={item}
                                            currentUserId={user_id}
                                            onEditPress={() => handleEdit(String(item.id))}
                                            onDeletePress={() => openDeleteDialog(String(item.id))}
                                        />
                                    </View>
                                )}
                                keyExtractor={(item) => String(item.id)}
                                numColumns={numColumns}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={() => (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>
                                            Нет данных для отображения
                                        </Text>
                                    </View>
                                )}
                            />
                        )}

                        {/* Компонент пагинации */}
                        <View style={styles.paginationWrapper}>
                            <PaginationComponent
                                currentPage={currentPage}
                                totalItems={travels?.total || 0}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                itemsPerPageOptions={itemsPerPageOptions}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </View>
                    </View>
                </View>

                {/* Диалог удаления */}
                <Portal>
                    <Dialog
                        visible={deleteDialogVisible}
                        onDismiss={() => setDeleteDialogVisible(false)}
                    >
                        <Dialog.Title>Подтверждение удаления</Dialog.Title>
                        <Dialog.Content>
                            <Text>Вы уверены, что хотите удалить это путешествие?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <PaperButton onPress={() => setDeleteDialogVisible(false)}>
                                Отмена
                            </PaperButton>
                            <PaperButton onPress={handleDelete}>Удалить</PaperButton>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </SafeAreaView>
        </PaperProvider>
    );
}

const getStyles = (windowWidth: number) => {
    const isMobile = windowWidth <= 768;

    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: isMobile ? 'column' : 'row',
            backgroundColor: '#f5f5f5',
        },
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        sideMenu: {
            width: isMobile ? '100%' : '25%',
            backgroundColor: '#fff',
            borderRightWidth: isMobile ? 0 : 1,
            borderColor: '#ddd',
            position: isMobile ? 'absolute' : 'relative',
            zIndex: 10,
            top: 0,
            left: isMobile ? -windowWidth : 0,
            height: '100%',
            paddingTop: isMobile ? 50 : 0,
        },
        sideMenuVisible: {
            left: 0,
            elevation: 5,
        },
        content: {
            flex: 1,
            backgroundColor: '#fff',
            paddingHorizontal: 10,
        },
        menuButtonContainer: {
            width: '100%',
            justifyContent: 'center',
            marginVertical: 10,
        },
        menuButton: {
            backgroundColor: '#6AAAAA',
        },
        menuButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
        searchContainer: {
            width: '100%',
            marginBottom: 10,
        },
        searchBarContainer: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderBottomWidth: 0,
            paddingHorizontal: 0,
        },
        searchInputContainer: {
            backgroundColor: '#e9e9e9',
        },
        searchInput: {
            fontSize: 14,
        },
        listContent: {
            justifyContent: 'center',
            paddingBottom: 20,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
        },
        emptyText: {
            fontSize: 16,
            color: '#777',
        },
        paginationWrapper: {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            alignSelf: 'center',
        },
        itemContainer: {
            flex: 1,
            alignItems: 'center',
            marginHorizontal: 10,
        },
    });
};
