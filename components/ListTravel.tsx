import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    ActivityIndicator,
    FlatList,
    Text,
    useWindowDimensions,
    StyleSheet,
} from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import FiltersComponent from '../components/FiltersComponent';
import PaginationComponent from '../components/PaginationComponent';
import { fetchTravels, fetchFilters, fetchFiltersCountry, deleteTravel } from '@/src/api/travels';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SearchBar } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import TravelListItem from '../components/TravelListItem';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ListTravel() {
    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const cardWidth = isMobile ? width * 0.9 : 600;
    const numColumns = isMobile ? 1 : 2;

    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();

    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({});
    const [isLoadingFilters, setIsLoadingFilters] = useState(false);
    const [travels, setTravels] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);

    const [userId, setUserId] = useState<string | null>(null);
    const [isSuperuser, setIsSuperuser] = useState(false);

    const itemsPerPageOptions = [10, 20, 30, 50, 100];
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    useEffect(() => {
        const loadUserData = async () => {
            const storedUserId = await AsyncStorage.getItem('userId');
            const superuserFlag = await AsyncStorage.getItem('isSuperuser');
            setUserId(storedUserId);
            setIsSuperuser(superuserFlag === 'true');
        };
        loadUserData();
        loadFilters();
    }, []);

    useEffect(() => {
        setCurrentPage(0);
    }, [itemsPerPage, search, filterValue, userId]);

    useEffect(() => {
        if (isMeTravel && !userId) return;
        fetchMore();
    }, [currentPage, itemsPerPage, search, filterValue, userId]);

    const loadFilters = async () => {
        setIsLoadingFilters(true);
        try {
            const [filtersData, countries] = await Promise.all([fetchFilters(), fetchFiltersCountry()]);
            setFilters({ ...filtersData, countries });
        } catch (error) {
            console.error('Ошибка при загрузке фильтров:', error);
        } finally {
            setIsLoadingFilters(false);
        }
    };

    const fetchMore = async () => {
        setIsLoading(true);
        try {
            const params = { ...cleanFilters(filterValue) };

            if (isMeTravel) params.user_id = userId;
            else if (isTravelBy) Object.assign(params, { countries: [3], publish: 1, moderation: 1 });
            else Object.assign(params, { publish: 1, moderation: 1 });

            if (user_id) params.user_id = user_id;

            const data = await fetchTravels(currentPage, itemsPerPage, search, params);
            setTravels(data);
        } catch (error) {
            console.error('Ошибка при загрузке путешествий:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const cleanFilters = (filtersObject: Record<string, any>) => {
        const cleanedFilters: Record<string, any> = {};
        Object.keys(filtersObject).forEach(key => {
            const value = filtersObject[key];
            if (Array.isArray(value) && !value.length) return;
            if (value === '' || value == null) return;
            cleanedFilters[key] = value;
        });
        return cleanedFilters;
    };

    const handleDelete = async () => {
        if (!currentDeleteId) return;
        await deleteTravel(currentDeleteId);
        fetchMore();
        setDeleteDialogVisible(false);
    };

    const openDeleteDialog = (id: string) => {
        setCurrentDeleteId(id);
        setDeleteDialogVisible(true);
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: isMobile ? 'column' : 'row', flex: 1 }}>
                {(menuVisible || !isMobile) && (
                    <View style={styles.sidebar}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            isLoadingFilters={isLoadingFilters}
                            onSelectedItemsChange={(field, items) => setFilterValue({ ...filterValue, [field]: items })}
                            handleTextFilterChange={(year) => setFilterValue({ ...filterValue, year })}
                            resetFilters={() => setFilterValue({})}
                            handleApplyFilters={(year) => setFilterValue(prev => ({ ...prev, year }))}
                            closeMenu={() => setMenuVisible(false)}
                            isMobile={isMobile}
                        />
                    </View>
                )}
                <View style={styles.content}>
                    {isMobile && (
                        <PaperButton mode="contained" onPress={() => setMenuVisible(true)} style={styles.filterButton}>
                            ФИЛЬТРЫ
                        </PaperButton>
                    )}

                    <SearchBar
                        placeholder="Найти путешествие..."
                        onChangeText={setSearch}
                        value={search}
                        lightTheme
                        containerStyle={styles.searchBar}
                        inputContainerStyle={styles.searchInputContainer}
                        inputStyle={styles.searchInput}
                    />

                    {isLoading ? (
                        <View style={styles.loaderWrapper}>
                            <ActivityIndicator size="large" color="#ff7f50" />
                            <Text style={styles.loaderText}>Загрузка путешествий...</Text>
                        </View>
                    ) : travels?.data?.length === 0 ? (
                        <View style={styles.noDataWrapper}>
                            <Text style={styles.noDataText}>Путешествий не найдено</Text>
                            <PaperButton onPress={() => setFilterValue({})}>Сбросить фильтры</PaperButton>
                        </View>
                    ) : (
                        <FlatList
                            key={`list-cols-${numColumns}`}
                            numColumns={numColumns}
                            columnWrapperStyle={numColumns > 1 ? { justifyContent: 'center', gap: 16 } : undefined}
                            data={travels?.data || []}
                            renderItem={({ item }) => (
                                <View style={{
                                    flex: 1,
                                    maxWidth: 600, // Сделать карточки шире
                                    alignSelf: 'center',
                                    marginBottom: 16,
                                }}>
                                    <TravelListItem
                                        travel={item}
                                        currentUserId={userId ?? ''}
                                        isSuperuser={isSuperuser}
                                        onEditPress={() => router.push(`/travel/${item.id}`)}
                                        onDeletePress={() => openDeleteDialog(String(item.id))}
                                    />
                                </View>
                            )}
                            keyExtractor={item => String(item.id)}
                        />
                    )}
                    <View style={styles.paginationWrapper}>
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
            </View>
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
    sidebar: { width: 300, padding: 10, backgroundColor: '#f8f8f8' },
    content: { flex: 1, padding: 20 },
    filterButton: { marginBottom: 12, backgroundColor: '#ff7f50' },
    searchBar: { backgroundColor: 'transparent', marginBottom: 16 },
    searchInputContainer: { backgroundColor: '#fff', borderRadius: 8, height: 42 },
    searchInput: { fontSize: 16 },
    paginationWrapper: { alignItems: 'center', marginTop: 20 },
});
