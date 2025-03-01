import React, {useState, useEffect} from 'react';
import {
    SafeAreaView,
    View,
    ActivityIndicator,
    FlatList,
    useWindowDimensions,
    Text,
    StyleSheet,
} from 'react-native';
import {Dialog, Portal, Button as PaperButton, useTheme} from 'react-native-paper';
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
    const numColumns = isMobile ? 1 : 2;

    const {colors} = useTheme(); // Тема подтянется от глобального PaperProvider

    const router = useRouter();
    const route = useRoute();
    const {user_id} = useLocalSearchParams();

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
            setFilters({...filtersData, countries});
        } catch (error) {
            console.log('Ошибка при загрузке фильтров:', error);
        } finally {
            setIsLoadingFilters(false);
        }
    };

    const fetchMore = async () => {
        setIsLoading(true);
        try {
            const params = {...cleanFilters(filterValue)};

            if (isMeTravel) params.user_id = userId;
            else if (isTravelBy) Object.assign(params, {countries: [3], publish: 1, moderation: 1});
            else Object.assign(params, {publish: 1, moderation: 1});

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
        <SafeAreaView style={{flex: 1}}>
            <View style={{flexDirection: isMobile ? 'column' : 'row', flex: 1}}>
                {(menuVisible || !isMobile) && (
                    <View style={styles.sidebar}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            isLoadingFilters={isLoadingFilters}
                            onSelectedItemsChange={(field, items) => setFilterValue({...filterValue, [field]: items})}
                            handleTextFilterChange={(year) => setFilterValue({...filterValue, year})}
                            resetFilters={() => setFilterValue({})}
                            handleApplyFilters={(year) => setFilterValue(prev => ({...prev, year}))}
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
                        <ActivityIndicator size="large"/>
                    ) : (
                        <FlatList
                            numColumns={numColumns}
                            columnWrapperStyle={numColumns > 1 ? {justifyContent: 'space-between'} : undefined}
                            data={travels?.data || []}
                            renderItem={({item}) => (
                                <TravelListItem
                                    travel={item}
                                    currentUserId={userId ?? ''}
                                    isSuperuser={isSuperuser}
                                    onEditPress={() => router.push(`/travel/${item.id}`)}
                                    onDeletePress={() => openDeleteDialog(String(item.id))}
                                />
                            )}
                            keyExtractor={item => String(item.id)}
                        />
                    )}
                    <PaginationComponent {...{
                        currentPage,
                        itemsPerPage,
                        itemsPerPageOptions,
                        setCurrentPage,
                        setItemsPerPage,
                        totalItems: travels?.total
                    }} />
                </View>
            </View>
            <ConfirmDialog
                visible={deleteDialogVisible}
                onClose={() => setDeleteDialogVisible(false)}
                onConfirm={handleDelete}
                title="Удаление"
                message="Удалить это путешествие?"
                confirmText="Удалить"
                cancelText="Отмена"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sidebar: {width: 300, padding: 10, backgroundColor: '#f8f8f8'},
    content: {flex: 1, padding: 10},
    filterButton: {marginVertical: 10, backgroundColor: '#555'},
    searchBar: {backgroundColor: 'transparent'},
    searchInputContainer: {backgroundColor: '#fff', borderRadius: 8, height: 40},
    searchInput: {fontSize: 16},
    dialog: {
        width: '90%',
        maxWidth: 380,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    dialogTitle: {
        fontWeight: '600',
        fontSize: 18,
        color: '#444',
        marginBottom: 8,
    },
    dialogText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelButton: {
        color: '#666',
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: '#ff7f50',
        color: '#fff',
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
        textTransform: 'uppercase',
        fontSize: 14,
    }
});
