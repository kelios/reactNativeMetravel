import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';

import FiltersComponent from './FiltersComponent';
import RenderTravelItem from './RenderTravelItem';
import PaginationComponent from '../PaginationComponent';
import SearchAndFilterBar from './SearchAndFilterBar';
import ConfirmDialog from '../ConfirmDialog';

import {
    deleteTravel,
    fetchFilters,
    fetchFiltersCountry,
    fetchTravels,
} from '@/src/api/travels';

const INITIAL_FILTER = { year: '', showModerationPending: false };
const BELARUS_ID = 3;
const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50];

const MemoizedFiltersComponent = memo(FiltersComponent);
const MemoizedSearchAndFilterBar = memo(SearchAndFilterBar);
const MemoizedPaginationComponent = memo(PaginationComponent);

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

const ListTravel = () => {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();

    const isMobile = useMemo(() => width < 768, [width]);
    const isTablet = useMemo(() => width >= 768 && width < 1024, [width]);
    const numColumns = useMemo(() => isMobile ? 1 : isTablet ? 2 : 3, [isMobile, isTablet]);
    const isMeTravel = useMemo(() => route.name === 'metravel', [route.name]);
    const isTravelBy = useMemo(() => route.name === 'travelsby', [route.name]);

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search);
    const [filterValue, setFilterValue] = useState(INITIAL_FILTER);
    const [travels, setTravels] = useState(null);
    const [filters, setFilters] = useState({});
    const [filtersLoaded, setFiltersLoaded] = useState(false);
    const [status, setStatus] = useState('idle');
    const [userId, setUserId] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [isFiltersVisible, setFiltersVisible] = useState(false);

    const isMounted = useRef(true);
    useEffect(() => () => { isMounted.current = false; }, []);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const [userId, isSuperuser] = await AsyncStorage.multiGet(['userId', 'isSuperuser']);
                if (isMounted.current) {
                    setUserId(userId[1]);
                    setIsSuperuser(isSuperuser[1] === 'true');
                }
            } catch (error) {
                console.error('Failed to load user data', error);
            }
        };
        loadUserData();
    }, []);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [f, c] = await Promise.all([fetchFilters(), fetchFiltersCountry()]);
                if (isMounted.current) {
                    setFilters({ ...f, countries: c });
                    setFiltersLoaded(true);
                }
            } catch (error) {
                console.error('Failed to load filters', error);
            }
        };
        loadFilters();
    }, []);

    const queryParams = useMemo(() => {
        const params = {
            ...Object.fromEntries(
                Object.entries(filterValue).filter(([key, v]) => {
                    if (key === 'showModerationPending') return false; // <-- убрать из params!
                    if (Array.isArray(v)) {
                        return v.length > 0;
                    }
                    return v !== undefined && v !== null && v !== '';
                })
            )
        };

        // добавить служебные поля вручную:
        if (filterValue.showModerationPending) {
            params.moderation = 0;
        } else {
            params.publish = 1;
            params.moderation = 1;
        }

        if (!filterValue.showModerationPending) {
            if (isMeTravel) params.user_id = userId;
            if (user_id) params.user_id = user_id;
        }

        if (isTravelBy) params.countries = [BELARUS_ID];

        return params;
    }, [filterValue, isMeTravel, isTravelBy, userId, user_id]);

    const loadTravels = useCallback(async () => {
        if (isMeTravel && !userId) return;

        setStatus('loading');
        try {
            const data = await fetchTravels(currentPage, itemsPerPage, debouncedSearch, queryParams);
            if (isMounted.current) {
                setTravels(data);
                setStatus('success');
            }
        } catch (error) {
            if (isMounted.current) {
                setStatus('error');
            }
            console.error('Failed to load travels', error);
        }
    }, [currentPage, itemsPerPage, debouncedSearch, queryParams, isMeTravel, userId]);

    useEffect(() => {
        loadTravels();
    }, [loadTravels]);

    useEffect(() => {
        setCurrentPage(0);
    }, [itemsPerPage, debouncedSearch, filterValue]);

    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        try {
            await deleteTravel(deleteId);
            setDeleteId(null);
            loadTravels();
        } catch (error) {
            console.error('Failed to delete travel', error);
        }
    }, [deleteId, loadTravels]);

    const renderItem = useCallback(
        ({ item, index }) => (
            <RenderTravelItem
                item={item}
                isMobile={isMobile}
                isSuperuser={isSuperuser}
                isMetravel={isMeTravel}
                userId={userId}
                onEditPress={router.push}
                onDeletePress={setDeleteId}
                isFirst={index === 0}
            />
        ),
        [isMobile, isSuperuser, isMeTravel, userId, router.push, setDeleteId]
    );

    const handleFilterChange = useCallback((field, items) => {
        setFilterValue(prev => ({ ...prev, [field]: items }));
    }, []);

    const handleApplyFilters = useCallback((val) => {
        setFilterValue(val);
        setFiltersVisible(false);
    }, []);

    const resetFilters = useCallback(() => {
        setFilterValue(INITIAL_FILTER);
    }, []);

    const closeMenu = useCallback(() => {
        setFiltersVisible(false);
    }, []);

    const listKey = useMemo(() => `list-${numColumns}`, [numColumns]);

    return (
        <SafeAreaView style={styles.root}>
            <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
                {!filtersLoaded ? (
                    <ActivityIndicator size="large" color="#4a7c59" style={{ flex: 1, justifyContent: 'center' }} />
                ) : (
                    <>
                        {!isMobile && (
                            <View style={styles.sidebar}>
                                <MemoizedFiltersComponent
                                    filters={filters}
                                    filterValue={filterValue}
                                    onSelectedItemsChange={handleFilterChange}
                                    handleApplyFilters={setFilterValue}
                                    resetFilters={resetFilters}
                                    closeMenu={() => {}}
                                    isSuperuser={isSuperuser}
                                />
                            </View>
                        )}

                        <View style={styles.main}>
                            <MemoizedSearchAndFilterBar
                                search={search}
                                setSearch={setSearch}
                                onToggleFilters={() => setFiltersVisible(v => !v)}
                                isMobile={isMobile}
                            />

                            {status === 'loading' && (
                                // "скелетон" вместо просто индикатора
                                <View style={styles.skeletonList}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <View key={i} style={styles.skeletonItem} />
                                    ))}
                                </View>
                            )}

                            {status === 'error' && (
                                <Text style={styles.status}>Ошибка загрузки</Text>
                            )}

                            {travels?.data?.length ? (
                                <FlatList
                                    key={listKey}
                                    data={travels.data}
                                    keyExtractor={item => String(item.id)}
                                    renderItem={renderItem}
                                    numColumns={numColumns}
                                    contentContainerStyle={styles.listContent}
                                    columnWrapperStyle={numColumns > 1 ? styles.column : null}
                                    showsVerticalScrollIndicator={false}
                                    initialNumToRender={10}
                                    maxToRenderPerBatch={10}
                                    windowSize={11}
                                    removeClippedSubviews={true}
                                />
                            ) : status === 'success' ? (
                                <Text style={styles.status}>Нет данных</Text>
                            ) : null}

                            {travels?.total > itemsPerPage && (
                                <MemoizedPaginationComponent
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                                    totalItems={travels.total}
                                    isMobile={isMobile}
                                />
                            )}
                        </View>
                    </>
                )}
            </View>

            {isMobile && isFiltersVisible && filtersLoaded && (
                <MemoizedFiltersComponent
                    filters={filters}
                    filterValue={filterValue}
                    onSelectedItemsChange={handleFilterChange}
                    handleApplyFilters={handleApplyFilters}
                    resetFilters={resetFilters}
                    closeMenu={closeMenu}
                    isSuperuser={isSuperuser}
                />
            )}

            <ConfirmDialog
                visible={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Удаление"
                message="Удалить это путешествие?"
            />
        </SafeAreaView>
    );
};

export default memo(ListTravel);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    sidebar: { width: 280, borderRightWidth: 1, borderColor: '#eee' },
    main: { flex: 1, padding: 12 },
    status: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
    listContent: { gap: 16, paddingBottom: 32 },
    column: { justifyContent: 'space-between', gap: 16 },

    // скелетон
    skeletonList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
        paddingVertical: 20,
    },
    skeletonItem: {
        backgroundColor: '#eee',
        borderRadius: 8,
        height: 180,
        flexBasis: '48%',
        flexGrow: 1,
    },
});
