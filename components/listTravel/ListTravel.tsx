// Начало переработанного компонента ListTravel
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

const INITIAL_FILTER = { showModerationPending: false, year: '' };

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

function ListTravel() {
    const { width, height } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const numColumns = isMobile ? 1 : isTablet ? 2 : 3;
    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();
    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search);
    const [filterValue, setFilterValue] = useState(INITIAL_FILTER);
    const [travels, setTravels] = useState(null);
    const [filters, setFilters] = useState({});
    const [status, setStatus] = useState('idle');
    const [userId, setUserId] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [isFiltersVisible, setFiltersVisible] = useState(false);
    const isMounted = useRef(true);

    useEffect(() => () => { isMounted.current = false }, []);

    useEffect(() => {
        AsyncStorage.multiGet(['userId', 'isSuperuser']).then((res) => {
            if (!isMounted.current) return;
            setUserId(res[0][1]);
            setIsSuperuser(res[1][1] === 'true');
        });
    }, []);

    useEffect(() => {
        Promise.all([fetchFilters(), fetchFiltersCountry()]).then(([f, c]) => {
            if (!isMounted.current) return;
            setFilters({ ...f, countries: c });
        });
    }, []);

    const queryParams = useMemo(() => {
        const params = Object.fromEntries(
            Object.entries(filterValue).filter(([_, v]) => Boolean(v?.length || v))
        );
        if (filterValue.showModerationPending) {
            Object.assign(params, { publish: 1, moderation: 0 });
        } else {
            if (isMeTravel) params.user_id = userId;
            else Object.assign(params, { publish: 1, moderation: 1 });
            if (user_id) params.user_id = user_id;
        }
        return params;
    }, [filterValue, userId, user_id, isMeTravel]);

    const loadTravels = useCallback(() => {
        setStatus('loading');
        fetchTravels(currentPage, itemsPerPage, debouncedSearch, queryParams)
            .then((data) => {
                if (!isMounted.current) return;
                setTravels(data);
                setStatus('success');
            })
            .catch(() => {
                if (!isMounted.current) return;
                setStatus('error');
            });
    }, [currentPage, itemsPerPage, debouncedSearch, queryParams]);

    useEffect(() => {
        if (isMeTravel && !userId) return;
        loadTravels();
    }, [loadTravels, isMeTravel, userId]);

    useEffect(() => setCurrentPage(0), [itemsPerPage, debouncedSearch, filterValue]);

    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        await deleteTravel(deleteId);
        setDeleteId(null);
        loadTravels();
    }, [deleteId, loadTravels]);

    const renderItem = useCallback(
        ({ item, index }) => (
            <RenderTravelItem
                item={item}
                isMobile={isMobile}
                isSuperuser={isSuperuser}
                isMetravel={isMeTravel}
                userId={userId}
                onEditPress={(id) => router.push(`/travel/${id}`)}
                onDeletePress={() => setDeleteId(item.id)}
                isFirst={index === 0}
            />
        ),
        [isMobile, isSuperuser, isMeTravel, userId]
    );

    return (
        <SafeAreaView style={styles.root}>
            <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
                {!isMobile && (
                    <View style={styles.sidebar}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            onSelectedItemsChange={(field, items) =>
                                setFilterValue((prev) => ({ ...prev, [field]: items }))
                            }
                            handleApplyFilters={setFilterValue}
                            resetFilters={() => setFilterValue(INITIAL_FILTER)}
                            closeMenu={() => {}}
                            isSuperuser={isSuperuser}
                        />
                    </View>
                )}
                <View style={styles.main}>
                    <SearchAndFilterBar
                        search={search}
                        setSearch={setSearch}
                        onToggleFilters={() => setFiltersVisible((v) => !v)}
                        isMobile={isMobile}
                    />
                    {status === 'loading' && <ActivityIndicator size="large" color="#4a7c59" />}
                    {status === 'error' && <Text style={styles.status}>Ошибка загрузки</Text>}
                    {travels?.data?.length ? (
                        <FlatList
                            key={`list-${numColumns}`}
                            data={travels.data}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={renderItem}
                            numColumns={numColumns}
                            contentContainerStyle={styles.listContent}
                            columnWrapperStyle={numColumns > 1 ? styles.column : null}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : status === 'success' ? (
                        <Text style={styles.status}>Нет данных</Text>
                    ) : null}

                    {travels?.total > itemsPerPage && (
                        <PaginationComponent
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                            itemsPerPageOptions={[10, 20, 30, 50]}
                            totalItems={travels.total}
                            isMobile={isMobile}
                        />
                    )}
                </View>
            </View>
            {isMobile && isFiltersVisible && (
                <FiltersComponent
                    filters={filters}
                    filterValue={filterValue}
                    onSelectedItemsChange={(field, items) =>
                        setFilterValue((prev) => ({ ...prev, [field]: items }))
                    }
                    handleApplyFilters={(val) => {
                        setFilterValue(val);
                        setFiltersVisible(false);
                    }}
                    resetFilters={() => setFilterValue(INITIAL_FILTER)}
                    closeMenu={() => setFiltersVisible(false)}
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
}

export default memo(ListTravel);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1 },
    sidebar: { width: 280, borderRightWidth: 1, borderColor: '#eee' },
    main: { flex: 1, padding: 12 },
    status: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#888' },
    listContent: { gap: 16, paddingBottom: 32 },
    column: { justifyContent: 'space-between', gap: 16 },
});
