import React, { useEffect, useState, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
} from 'react-native';
import FiltersComponent from '@/components/FiltersComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { Travels } from '@/src/types/types';
import {
    fetchTravels,
    fetchFilters,
    fetchFiltersCountry,
    deleteTravel,
} from '@/src/api/travels';
import { useLocalSearchParams } from 'expo-router';
import { SearchBar, Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import TravelListItem from '@/components/TravelListItem';
import Toast from 'react-native-toast-message';

export default function ListTravel() {
    const initialPage = 0;
    const windowWidth = Dimensions.get('window').width;
    const styles = getStyles(windowWidth);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({});
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);

    const isMobile = windowWidth <= 768;
    const isTablet = windowWidth > 768 && windowWidth <= 1400;
    const numColumns = isMobile || isTablet ? 1 : 2;
    const [menuVisible, setMenuVisible] = useState(false);
    const [travels, setTravels] = useState<Travels[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const itemsPerPageOptions = [10, 20, 30, 50, 100];
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[2]);
    const { user_id } = useLocalSearchParams();
    const [userId, setUserId] = useState('');

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
        getFilters();
        getFiltersCountry();
    }, []);

    useEffect(() => {
        fetchMore();
    }, [currentPage, itemsPerPage, search, filterValue]);

    useEffect(() => {
        setCurrentPage(0);
    }, [itemsPerPage, search, filterValue, userId]);

    const resetAllFilters = () => {
        setFilterValue({
            countries: [],
            categories: [],
            categoryTravelAddress: [],
            companions: [],
            complexity: [],
            month: [],
            over_nights_stay: [],
            transports: [],
            year: '',
        });
        fetchMore(); // Запрашиваем данные с новыми (пустыми) фильтрами
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
        param = { ...param, ...cleanedFilters };

        if (user_id) {
            param = { ...param, user_id: user_id };
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

    const handleApplyFilters = async () => {
        setCurrentPage(0);
        fetchMore();
    };

    const updateSearch = (search: string) => {
        setCurrentPage(0);
        setSearch(search);
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
        navigation.navigate('travel/' + id);
    };

    const handleDelete = async (id: string) => {
        try {
            Toast.show({
                type: 'info',
                text1: 'Удаление...',
            });

            const response = await deleteTravel(id);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Путешествие успешно удалено!',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: `Ошибка: ${response.message}`,
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Произошла ошибка при удалении',
            });
        }
    };

    if (!filters || !travels?.data) {
        return <ActivityIndicator />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {isMobile ? (
                    <ScrollView style={menuVisible ? styles.scrollContainer : null}>
                        <View
                            style={[
                                styles.sideMenu,
                                styles.mobileSideMenu,
                                menuVisible && styles.visibleMobileSideMenu,
                            ]}
                        >
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
                    </ScrollView>
                ) : (
                    <View style={[styles.sideMenu, styles.desktopSideMenu]}>
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
                    {isMobile && !menuVisible && (
                        <Button
                            title="Фильтры"
                            onPress={toggleMenu}
                            containerStyle={styles.menuButtonContainer}
                            buttonStyle={styles.menuButton}
                            titleStyle={styles.menuButtonText}
                        />
                    )}
                    <View style={styles.containerSearch}>
                        <SearchBar
                            placeholder="Введите ключевые слова..."
                            onChangeText={updateSearch}
                            value={search}
                            lightTheme
                            round
                            containerStyle={styles.searchBarContainer}
                            inputContainerStyle={{ backgroundColor: 'white' }}
                            inputStyle={{ backgroundColor: 'white', fontSize: 14 }}
                        />
                    </View>
                    <FlatList
                        data={travels?.data}
                        renderItem={({ item }) => (
                            <TravelListItem
                                travel={item}
                                currentUserId={user_id}
                                onEditPress={(id) => handleEdit(item.id.toString())}
                                onDeletePress={(id) => handleDelete(item.id.toString())}
                            />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={numColumns}
                        key={numColumns}
                    />
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
        </SafeAreaView>
    );
}

const getStyles = (windowWidth: number) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: windowWidth <= 1024 ? 'column' : 'row',
            width: '100%',
            backgroundColor: 'white',
        },
        scrollContainer: {
            flex: 1, // Устанавливаем высоту скролл-контейнера
            maxHeight: '90vh', // Ограничиваем высоту скролл-контейнера
        },
        sideMenu: {
            padding: 20,
            backgroundColor: 'white',
            width: windowWidth <= 1024 ? '100%' : '25%',
            minWidth: 250,
            borderRightWidth: windowWidth > 1024 ? 1 : 0,
            borderColor: '#ddd',
        },
        mobileSideMenu: {
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            backgroundColor: 'white',
            zIndex: 999,
            elevation: 2,
            transform: [{ translateX: -1000 }],
        },
        visibleMobileSideMenu: {
            transform: [{ translateX: 0 }],
        },
        content: {
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
            paddingHorizontal: 10,
        },
        containerSearch: {
            width: '100%',
            maxWidth: 1200,
            alignSelf: 'center',
            marginBottom: 20,
        },
        searchBarContainer: {
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomColor: 'transparent',
            borderTopColor: 'transparent',
            paddingHorizontal: 10,
        },
        menuButtonContainer: {
            width: '100%',
            justifyContent: 'center',
            marginBottom: 20,
        },
        menuButton: {
            backgroundColor: '#6aaaaa',
        },
        menuButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
        paginationWrapper: {
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        },
    });
};
