import React, { useEffect, useState, useCallback } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    ActivityIndicator,
    Dimensions,
    Pressable, FlatList,
} from 'react-native';
import FiltersComponent from '@/components/FiltersComponent';
import TravelListComponent from '@/components/TravelListComponent';
import PaginationComponent from '@/components/PaginationComponent';
import { Travels } from '@/src/types/types';
import {
    fetchTravels,
    fetchFilters,
    fetchFiltersTravel,
    fetchFiltersCountry, deleteTravel,
} from '@/src/api/travels';
import { useLocalSearchParams } from 'expo-router';
import { SearchBar, Button } from 'react-native-elements';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRoute} from "@react-navigation/native";
import TravelListItem from "@/components/TravelListItem";

export default function ListTravel() {
    const initialPage = 0;
    const windowWidth = Dimensions.get('window').width;
    const styles = getStyles(windowWidth);
    const [search, setSearch] = useState('');

    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({});
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);

    const isMobile = windowWidth <= 768;
    const numColumns = isMobile ? 1 : 2;
    const initMenuVisible = !isMobile;

    const [menuVisible, setMenuVisible] = useState(initMenuVisible);
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
        if (userId && isMeTravel) {
            fetchMore();
        }
        else if (!isMeTravel) {
            fetchMore();
        }
    }, [userId]);

    useEffect(() => {
        if (userId && isMeTravel) {
            fetchMore();
        }
        else if (!isMeTravel) {
            fetchMore();
        }
    }, [currentPage, itemsPerPage, search, filterValue]);

    useEffect(() => {
        setCurrentPage(0);
    }, [itemsPerPage, search, userId]);

    const fetchMore = async () => {
        if (isLoading) return;
        setIsLoading(true);
        let param = {};
        if (isMeTravel) {
            param = {
                user_id: userId || null,
            }
        } else if (isTravelBy) {
            param = {
                moderation: 1,
                publish: 1,
                countries: [3],
            }
        } else {
            param = {
                moderation: 1,
                publish: 1,
            }
        }

        if(user_id){
            param = {
                ...param,  // Сохраняем все существующие свойства param
                user_id: user_id // Добавляем или обновляем свойство user_id
            };
        }

        const newData = await fetchTravels(currentPage, itemsPerPage, search, param);
        setTravels(newData);
        setIsLoading(false);
    };

    const getFilters = useCallback(async () => {
        if (isLoadingFilters) return;
        setIsLoadingFilters(true);
        const newData = await fetchFilters();
        setFilters((prevFilters) => ({
            ...prevFilters,
            categories: newData?.categories || [],
            categoryTravelAddress: newData?.categoryTravelAddress || [],
            companion: newData?.companion || [],
            complexity: newData?.complexity || [],
            month: newData?.month || [],
            overNightStay: newData?.overNightStay || [],
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
        if (isLoading) return;
        setIsLoading(true);
        const newData = await fetchFiltersTravel(
            currentPage,
            itemsPerPage,
            search,
            filterValue
        );
        setTravels(newData);
        setIsLoading(false);
        if (isMobile) {
            closeMenu();
        }
    };

    const updateSearch = (search: string) => {
        setSearch(search);
    };

    const onSelectedItemsChange =
        (field: string) => (selectedItems: string[]) => {
            setFilterValue({
                ...filterValue,
                [field]: selectedItems,
            });
        };

    const handleTextFilterChange = (value: string) => {
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


    const handleEdit = (id: string) => {
        // Переход на страницу редактирования с передачей id путешествия
        navigation.navigate('travel/'+id)
    }

    const handleDelete = async (id: string) => {
        try {
            // Подтверждение удаления
            Alert.alert(
                "Удаление",
                "Вы уверены, что хотите удалить это путешествие?",
                [
                    {
                        text: "Отмена",
                        style: "cancel"
                    },
                    {
                        text: "Удалить",
                        onPress: async () => {
                            // Вызов API для удаления путешествия
                            await deleteTravel(id)
                            // Обновление списка путешествий
                            setTravels((prevTravels) => prevTravels.filter(travel => travel.id !== id))
                        }
                    }
                ]
            )
        } catch (error) {
            console.error("Ошибка при удалении путешествия:", error)
        }
    }

    if (!filters || !travels?.data) {
        return <ActivityIndicator />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                {isMobile && menuVisible && <Pressable onPress={closeMenu} style={styles.overlay} />}
                {isMobile ? (
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
                            handleApplyFilters={handleApplyFilters}
                            closeMenu={closeMenu}
                            isMobile={isMobile}
                        />
                    </View>
                ) : (
                    <View style={[styles.sideMenu, styles.desktopSideMenu]}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            isLoadingFilters={isLoadingFilters}
                            onSelectedItemsChange={onSelectedItemsChange}
                            handleTextFilterChange={handleTextFilterChange}
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
                        renderItem={({ item }) =>
                            <TravelListItem
                                travel={item}
                                currentUserId={user_id}
                                onEditPress={(id) => handleEdit(item.id.toString())}
                                onDeletePress={(id) => handleDelete(item.id.toString())}
                            />
                        }
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={numColumns}
                        key={numColumns}
                    />
                    <PaginationComponent
                        currentPage={currentPage}
                        totalItems={travels?.total}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        itemsPerPageOptions={itemsPerPageOptions}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (windowWidth: number) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
            width: '100%',
            backgroundColor: 'white',
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
        },
        sideMenu: {
            padding: 20,
            backgroundColor: 'white',
        },
        mobileSideMenu: {
            width: '100%',
            position: 'absolute',
            backgroundColor: 'white',
            zIndex: 999,
            elevation: 2,
            top: 0,
            left: 0,
            transform: [{ translateX: -1000 }],
        },
        visibleMobileSideMenu: {
            transform: [{ translateX: 0 }],
        },
        desktopSideMenu: {
            width: 300,
            backgroundColor: 'white',
        },
        containerSearch: {
            marginTop: 10,
            paddingHorizontal: 10,
            backgroundColor: 'white',
            color: 'black',
            width: '100%',
        },
        searchBarContainer: {
            backgroundColor: 'white',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            borderBottomColor: 'transparent',
            borderTopColor: 'transparent',
        },
        menuButtonContainer: {
            width: 600,
        },
        menuButton: {
            backgroundColor: '#6aaaaa',
        },
        menuButtonText: {
            color: 'white',
            fontWeight: 'bold',
        },
    });
};
