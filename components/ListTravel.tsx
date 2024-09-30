import React, {useState, useEffect, useCallback} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    ActivityIndicator,
    FlatList,
    useWindowDimensions,
    Text,
} from 'react-native';
import {Provider as PaperProvider, Dialog, Portal, Button as PaperButton} from 'react-native-paper';
import FiltersComponent from '@/components/FiltersComponent';
import PaginationComponent from '@/components/PaginationComponent';
import {Travels} from '@/src/types/types';
import {
    fetchTravels,
    fetchFilters,
    fetchFiltersCountry,
    deleteTravel,
} from '@/src/api/travels';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {SearchBar, Button} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute, useNavigation} from '@react-navigation/native';
import TravelListItem from '@/components/TravelListItem';

export default function ListTravel() {
    const {width: windowWidth} = useWindowDimensions();
    const styles = getStyles(windowWidth);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({});
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [travels, setTravels] = useState<Travels[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null); // Для хранения ID удаляемого элемента

    const isMobile = windowWidth <= 768;
    const numColumns = windowWidth <= 1400 ? 1 : 2;

    const itemsPerPageOptions = [10, 20, 30, 50, 100];
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]);
    const {user_id} = useLocalSearchParams();
    const route = useRoute();

    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    useEffect(() => {
        const getUserId = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            if (storedUserId) {
                setUserId(storedUserId);
            }
        };
        getUserId();
    }, []);

    useEffect(() => {
        setCurrentPage(0);
    }, [itemsPerPage, search, filterValue, userId]);

    useEffect(() => {
        if (userId && isMeTravel) {
            fetchMore();
        }
        else if(!isMeTravel) {
            fetchMore();
        }
    }, [userId]);

    useEffect(() => {
        if (isMeTravel && userId) {
            // Если это страница metravel и userId получен, загружаем данные
            getFilters();
            getFiltersCountry();
            fetchMore();
        } else if (!isMeTravel) {
            // На других страницах загружаем данные сразу
            getFilters();
            getFiltersCountry();
            fetchMore();
        }
    }, [itemsPerPage, search, filterValue, isMeTravel]);

    const resetAllFilters = () => {
        setFilterValue({});
        fetchMore();
    };

    const fetchMore = async () => {
        if (isLoading) return;
        setIsLoading(true);

        let param = {};
        if (isMeTravel) {
            param = {
                user_id: userId || null,
            };
        } else if (isTravelBy) {
            param = {
                moderation: 1,
                publish: 1,
                countries: [3],
            };
        } else {
            param = {
                moderation: 1,
                publish: 1,
            };
        }

        const cleanedFilters = cleanFilters(filterValue);
        param = {...param, ...cleanedFilters};

        if (user_id) {
            param = {...param, user_id: user_id};
        }

        const newData = await fetchTravels(currentPage, itemsPerPage, search, param);
        setTravels(newData);
        setIsLoading(false);
    };

    const cleanFilters = (filters) => {
        const cleanedFilters = {};
        Object.keys(filters).forEach((key) => {
            const value = filters[key];
            if (Array.isArray(value) && value.length > 0) {
                cleanedFilters[key] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
                cleanedFilters[key] = value;
            }
        });
        return cleanedFilters;
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const newData = await fetchFilters();
        setFilters((prevFilters) => ({
            ...prevFilters,
            categories: newData?.categories || [],
            categoryTravelAddress: newData?.categoryTravelAddress || [],
            companions: newData?.companions || [],
            complexity: newData?.complexity || [],
            month: newData?.month || [],
            over_nights_stay: newData?.over_nights_stay || [],
            transports: newData?.transports || [],
        }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    const getFiltersCountry = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const country = await fetchFiltersCountry();
        setFilters((prevFilters) => ({
            ...prevFilters,
            countries: country,
        }));
        setIsLoadingFilters(false);
    }, [isLoadingFilters]);

    const handleApplyFilters = () => {
        setCurrentPage(0);
        fetchMore();
    };

    const updateSearch = (searchText: string) => {
        setCurrentPage(0);
        setSearch(searchText);
    };

    const onSelectedItemsChange = (field: string, selectedItems: string[]) => {
        setFilterValue({
            ...filterValue,
            [field]: selectedItems,
        });
    };

    const handleTextFilterChange = (value?: string) => {
        setFilterValue({
            ...filterValue,
            year: value,
        });
    };

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchMore();
    };

    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(0);
        fetchMore();
    };

    const handleEdit = (id: string) => {
        const router = useRouter();
        router.push(`/travel/${id}`);
    };

    const handleDelete = async () => {
        if (!currentDeleteId) return;

        try {
              const response = await deleteTravel(currentDeleteId);

            if (response.status === 204) {
                console.log("Путешествие успешно удалено!");

                // Обновляем список путешествий
                setTravels((prevTravels) => {
                    if (prevTravels && prevTravels.data && Array.isArray(prevTravels.data)) {
                        const updatedTravels = prevTravels.data.filter((travel) => {
                            return String(travel.id) !== String(currentDeleteId); // Сравнение как строки
                        });

                        return {
                            ...prevTravels,
                            data: updatedTravels,  // Обновляем только поле data
                        };
                    }
                    return prevTravels;
                });
            } else {
                console.log(`Ошибка удаления: ${response.message}`);
            }
        } catch (error) {
            console.log('Произошла ошибка при удалении');
        } finally {
            setDeleteDialogVisible(false); // Закрываем диалог
        }
    };

    const openDeleteDialog = (id: string) => {
        setCurrentDeleteId(id); // Сохраняем ID удаляемого элемента
        setDeleteDialogVisible(true); // Открываем диалог
    };

    if (!filters || !travels?.data) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6aaaaa"/>
            </View>
        );
    }

    return (
        <PaperProvider>
            <SafeAreaView style={{flex: 1}}>
                <View style={styles.container}>
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
                            <ActivityIndicator size="large" color="#6aaaaa"/>
                        ) : (
                            <FlatList
                                key={`flatlist-columns-${numColumns}`}
                                data={travels?.data}
                                renderItem={({item}) => (
                                    <View style={styles.itemContainer}>
                                    <TravelListItem
                                        travel={item}
                                        currentUserId={user_id}
                                        onEditPress={() => handleEdit(item.id.toString())}
                                        onDeletePress={() => openDeleteDialog(item.id.toString())} // Открываем диалог
                                    />
                                    </View>
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                numColumns={numColumns}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={() => (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>Нет данных для отображения</Text>
                                    </View>
                                )}
                            />
                        )}
                        <View style={styles.paginationWrapper}>
                            <PaginationComponent
                                currentPage={currentPage}
                                totalItems={travels?.total}
                                itemsPerPage={itemsPerPage}
                                onPageChange={handlePageChange}
                                itemsPerPageOptions={itemsPerPageOptions}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </View>
                    </View>
                </View>

                {/* Диалоговое окно для подтверждения удаления */}
                <Portal>
                    <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                        <Dialog.Title>Подтверждение удаления</Dialog.Title>
                        <Dialog.Content>
                            <Text>Вы уверены, что хотите удалить это путешествие?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <PaperButton onPress={() => setDeleteDialogVisible(false)}>Отмена</PaperButton>
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
            alignSelf: 'center',  // Центрирование на мобильных устройствах
        },
        itemContainer:{
            flex: 1,
            alignItems: 'center',         // Центрирование каждого элемента внутри своего контейнера
            marginHorizontal: 10,
        }
    });
};
