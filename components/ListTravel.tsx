import React, {useState, useEffect} from 'react';
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
import {Button as PaperButton} from 'react-native-paper';
import FiltersComponent from '../components/FiltersComponent';
import PaginationComponent from '../components/PaginationComponent';
import {fetchTravels, fetchFilters, fetchFiltersCountry, deleteTravel} from '@/src/api/travels';
import {useLocalSearchParams, useRouter} from 'expo-router';
import {SearchBar} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute} from '@react-navigation/native';
import TravelListItem from '../components/TravelListItem';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ListTravel() {
    const {width} = useWindowDimensions();
    const isMobile = width <= 768;
    const cardWidth = isMobile ? width * 0.9 : 600;
    const numColumns = isMobile ? 1 : 2;

    const router = useRouter();
    const route = useRoute();
    const {user_id} = useLocalSearchParams();

    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({ showModerationPending: false });
    const [travels, setTravels] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [userId, setUserId] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);

    const [menuVisible, setMenuVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState<string | null>(null);

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
        const [filtersData, countries] = await Promise.all([fetchFilters(), fetchFiltersCountry()]);
        setFilters({...filtersData, countries});
    };

    const fetchMore = async () => {
        setIsLoading(true);
        try {
            const params = { ...cleanFilters(filterValue) };

            const isModerationPending = filterValue?.showModerationPending ?? false;
            if (isModerationPending) {
                params.publish = 1;
                params.moderation = 0;
            } else {
                if (isMeTravel) params.user_id = userId;
                else if (isTravelBy) Object.assign(params, { countries: [3], publish: 1, moderation: 1 });
                else Object.assign(params, { publish: 1, moderation: 1 });

                if (user_id) params.user_id = user_id;
            }

            const data = await fetchTravels(currentPage, itemsPerPage, search, params);
            setTravels(data);
        } finally {
            setIsLoading(false);
        }
    };

    const cleanFilters = (filtersObject) => {
        return Object.fromEntries(Object.entries(filtersObject).filter(([_, v]) => v && v.length));
    };

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

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.contentWrapper}>
                {/* Фильтры */}
                {(menuVisible || !isMobile) && (
                    <View style={{
                        backgroundColor: '#f8f8f8',
                        padding: 10,
                        maxWidth: isMobile ? '100%' : 300,
                        borderRightWidth: 1,
                        borderRightColor: '#ddd',
                    }}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            onSelectedItemsChange={(field, items) => setFilterValue({...filterValue, [field]: items})}
                            handleTextFilterChange={(year) => setFilterValue({...filterValue, year})}
                            handleApplyFilters={(updatedFilters) => setFilterValue(updatedFilters)}
                            resetFilters={() => setFilterValue({ showModerationPending: false, year: '' })}
                            closeMenu={() => setMenuVisible(false)}
                            isSuperuser={isSuperuser}
                        />
                    </View>
                )}

                {/* Список путешествий */}
                <View style={styles.content}>
                    {isMobile && !menuVisible && (
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
                    />

                    {isLoading ? (
                        <ActivityIndicator size="large" color="#ff7f50"/>
                    ) : travels?.data?.length === 0 ? (
                        <Text>Путешествий не найдено</Text>
                    ) : (
                        <FlatList
                            key={`list-cols-${numColumns}`}
                            numColumns={numColumns}
                            columnWrapperStyle={numColumns > 1 ? {justifyContent: 'center', gap: 16} : undefined}
                            data={travels?.data || []}
                            renderItem={({item}) => (
                                <View style={{
                                    flex: 1,
                                    maxWidth: '50%', // Сделать карточки шире
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
    container: {flex: 1},
    contentWrapper: {flexDirection: 'row', flex: 1},
    sidebar: {
        backgroundColor: '#f8f8f8',
        padding: 10,
        maxWidth: 300,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
    },
    content: {flex: 1, padding: 16},
    filterButton: {marginBottom: 12, backgroundColor: '#ff7f50'},
    searchBar: {backgroundColor: 'transparent', marginBottom: 16},
    searchInputContainer: {backgroundColor: '#fff', borderRadius: 8, height: 42},
});

