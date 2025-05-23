import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import FiltersComponent from './FiltersComponent';
import PaginationComponent from '../PaginationComponent';
import RenderTravelItem from '@/components/listTravel/RenderTravelItem';
import ConfirmDialog from '../ConfirmDialog';
import SearchAndFilterBar from './SearchAndFilterBar';

import {
    deleteTravel,
    fetchFilters,
    fetchFiltersCountry,
    fetchTravels,
} from '@/src/api/travels';

const INITIAL_FILTER = { showModerationPending: false, year: '' };
const MOBILE_CARD_HEIGHT = 400;
const DESKTOP_CARD_HEIGHT = 480;

/* ----------------------------- debounce hook ------------------------------ */
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

/* ----------------------------- list component ----------------------------- */
function ListTravel() {
    /* --------------------------------- layout -------------------------------- */
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const numColumns = isMobile ? 1 : isTablet ? 2 : 3;
    const CARD_HEIGHT = isMobile ? MOBILE_CARD_HEIGHT : DESKTOP_CARD_HEIGHT;

    /* ------------------------------ navigation ids --------------------------- */
    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();
    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    /* ---------------------------------- state -------------------------------- */
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search);
    const [filterValue, setFilterValue] = useState(INITIAL_FILTER);
    const [travels, setTravels] = useState(null); // null ➜ not fetched, [] ➜ no data
    const [filters, setFilters] = useState({});
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [userId, setUserId] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [isFiltersVisible, setFiltersVisible] = useState(false);

    // keep track of mounted state to avoid setState after unmount
    const isMounted = useRef(true);
    useEffect(() => () => {
        isMounted.current = false;
    }, []);

    /* --------------------------------- helpers ------------------------------- */
    const cardStyles = useMemo(() => {
        const base = { maxHeight: CARD_HEIGHT };
        if (isMobile) return { ...base, maxWidth: '100%' };
        if (isTablet) return { ...base, maxWidth: '48%' };
        return { ...base, maxWidth: '32%' };
    }, [isMobile, isTablet, CARD_HEIGHT]);

    const queryParams = useMemo(() => {
        const params = Object.fromEntries(
            Object.entries(filterValue).filter(([_, v]) => Boolean(v && v.length)),
        );

        if (filterValue.showModerationPending) {
            Object.assign(params, { publish: 1, moderation: 0 });
        } else {
            if (isMeTravel) params.user_id = userId;
            else if (isTravelBy) Object.assign(params, { countries: [3], publish: 1, moderation: 1 });
            else Object.assign(params, { publish: 1, moderation: 1 });
            if (user_id) params.user_id = user_id;
        }
        return params;
    }, [filterValue, isMeTravel, isTravelBy, userId, user_id]);

    /* -------------------------------- fetchers ------------------------------- */
    const loadUser = useCallback(async () => {
        try {
            const [ [ , storedUserId ], [ , superFlag ] ] = await AsyncStorage.multiGet([
                'userId',
                'isSuperuser',
            ]);
            if (!isMounted.current) return;
            setUserId(storedUserId);
            setIsSuperuser(superFlag === 'true');
        } catch (err) {
            console.warn('Failed to load user info', err);
        }
    }, []);

    const loadFilters = useCallback(async () => {
        try {
            const [rawFilters, countries] = await Promise.all([fetchFilters(), fetchFiltersCountry()]);
            if (!isMounted.current) return;
            setFilters({ ...rawFilters, countries });
        } catch (err) {
            console.warn('Failed to load filters', err);
        }
    }, []);

    const loadTravels = useCallback(async () => {
        setStatus('loading');
        try {
            const data = await fetchTravels(currentPage, itemsPerPage, debouncedSearch, queryParams);
            if (!isMounted.current) return;
            setTravels(data);
            setStatus('success');
        } catch (err) {
            console.warn('Failed to fetch travels', err);
            if (!isMounted.current) return;
            setStatus('error');
        }
    }, [currentPage, itemsPerPage, debouncedSearch, queryParams]);

    /* -------------------------------- effects -------------------------------- */
    useEffect(() => {
        loadUser();
        loadFilters();
    }, [loadUser, loadFilters]);

    // reset to first page when dependencies change
    useEffect(() => setCurrentPage(0), [itemsPerPage, debouncedSearch, filterValue, userId]);

    // fetch travels when page or query changes
    useEffect(() => {
        if (isMeTravel && !userId) return; // wait userId
        loadTravels();
    }, [loadTravels, isMeTravel, userId]);

    /* ------------------------------ actions & ui ----------------------------- */
    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        await deleteTravel(deleteId);
        setDeleteId(null);
        loadTravels();
    }, [deleteId, loadTravels]);

    const handleEditPress = useCallback((id) => router.push(`/travel/${id}`), [router]);
    const openDeleteDialog = useCallback((id) => setDeleteId(id), []);

    const renderItem = useCallback(
        ({ item, index }) => (
            <RenderTravelItem
                item={item}
                isMobile={isMobile}
                isSuperuser={isSuperuser}
                isMetravel={isMeTravel}
                userId={userId ?? ''}
                onEditPress={handleEditPress}
                onDeletePress={openDeleteDialog}
                cardStyles={cardStyles}
                isFirst={index === 0}
            />
        ),
        [isMobile, isSuperuser, isMeTravel, userId, handleEditPress, openDeleteDialog, cardStyles],
    );

    const listKey = useMemo(() => `columns-${numColumns}`, [numColumns]);

    const renderContent = () => {
        if (status === 'loading' || travels === null) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#ff7f50" />
                </View>
            );
        }

        if (!travels?.data?.length) {
            return (
                <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>Путешествий не найдено</Text>
                </View>
            );
        }

        const items = travels.data;

        if (items.length === 1) {
            return <View style={styles.singleItem}>{renderItem({ item: items[0] })}</View>;
        }

        return (
            <FlatList
                key={listKey}
                numColumns={numColumns}
                data={items}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={[styles.listContainer, { paddingBottom: isMobile ? 80 : 32 }]}
                columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                initialNumToRender={6}
                windowSize={15}
                maxToRenderPerBatch={20}
                updateCellsBatchingPeriod={25}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                renderItem={renderItem}
                getItemLayout={(data, index) => ({
                    length: CARD_HEIGHT,
                    offset: CARD_HEIGHT * index,
                    index,
                })}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainLayout}>
                {!isMobile && travels && (
                    <View style={styles.filtersPanel}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            onSelectedItemsChange={(field, items) =>
                                setFilterValue((prev) => ({ ...prev, [field]: items }))
                            }
                            handleTextFilterChange={(year) => setFilterValue((prev) => ({ ...prev, year }))}
                            handleApplyFilters={setFilterValue}
                            resetFilters={() => setFilterValue(INITIAL_FILTER)}
                            closeMenu={() => {}}
                            isSuperuser={isSuperuser}
                        />
                    </View>
                )}

                <View style={styles.contentArea}>
                    {travels && (
                        <SearchAndFilterBar
                            search={search}
                            setSearch={setSearch}
                            onToggleFilters={() => setFiltersVisible((v) => !v)}
                        />
                    )}

                    {renderContent()}

                    {travels?.total > itemsPerPage && (
                        <PaginationComponent
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                            itemsPerPageOptions={[10, 20, 30, 50, 100]}
                            totalItems={travels.total}
                        />
                    )}
                </View>
            </View>

            {isMobile && isFiltersVisible && travels && (
                <View style={styles.mobileFiltersPanel}>
                    <FiltersComponent
                        filters={filters}
                        filterValue={filterValue}
                        onSelectedItemsChange={(field, items) =>
                            setFilterValue((prev) => ({ ...prev, [field]: items }))
                        }
                        handleTextFilterChange={(year) => setFilterValue((prev) => ({ ...prev, year }))}
                        handleApplyFilters={(v) => {
                            setFilterValue(v);
                            setFiltersVisible(false);
                        }}
                        resetFilters={() => setFilterValue(INITIAL_FILTER)}
                        closeMenu={() => setFiltersVisible(false)}
                        isSuperuser={isSuperuser}
                    />
                </View>
            )}

            <ConfirmDialog
                visible={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Удаление"
                message="Удалить это путешествие?"
            />
        </SafeAreaView>
    );
}

export default memo(ListTravel);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainLayout: {
        flexDirection: 'row',
        flex: 1,
    },
    filtersPanel: {
        width: 280,
        borderRightWidth: 1,
        borderRightColor: '#eee',
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    contentArea: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    listContainer: {
        gap: 16,
        paddingTop: 8,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 16,
    },
    singleItem: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mobileFiltersPanel: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        zIndex: 1000,
        padding: 16,
    },
    noResults: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noResultsText: {
        fontSize: 18,
        color: '#666',
    },
});
