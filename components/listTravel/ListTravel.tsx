// components/ListTravel.tsx
import React, {
    memo, useCallback, useEffect, useMemo, useState,
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
import { useQuery } from '@tanstack/react-query';

import FiltersComponent     from './FiltersComponent';
import RenderTravelItem     from './RenderTravelItem';
import PaginationComponent  from '../PaginationComponent';
import SearchAndFilterBar   from './SearchAndFilterBar';
import ConfirmDialog        from '../ConfirmDialog';
import {
    deleteTravel,
    fetchFilters,
    fetchFiltersCountry,
    fetchTravels,
} from '@/src/api/travels';

const INITIAL_FILTER = { year: '', showModerationPending: false };
const BELARUS_ID     = 3;
const PER_PAGE_OPTS  = [10, 20, 30, 50];

function useDebounce<T>(val: T, delay = 400) {
    const [d, setD] = useState(val);
    useEffect(() => {
        const id = setTimeout(() => setD(val), delay);
        return () => clearTimeout(id);
    }, [val, delay]);
    return d;
}

function ListTravel() {
    /* ---------- break-points ---------- */
    const { width }  = useWindowDimensions();
    const isMobile   = width < 768;
    const isTablet   = width >= 768 && width < 1024;
    const columns    = isMobile ? 1 : isTablet ? 2 : 3;
    const listKey    = useMemo(() => `grid-${columns}`, [columns]);

    /* ---------- navigation ---------- */
    const route  = useRoute();
    const router = useRouter();
    const { user_id } = useLocalSearchParams();
    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    /* ---------- auth ---------- */
    const [userId, setUserId] = useState<string | null>(null);
    const [isSuper, setSuper] = useState(false);
    useEffect(() => {
        AsyncStorage.multiGet(['userId', 'isSuperuser']).then(([[, id], [, su]]) => {
            setUserId(id); setSuper(su === 'true');
        });
    }, []);

    /* ---------- UI state ---------- */
    const [search, setSearch]   = useState('');
    const debSearch             = useDebounce(search);
    const [filter, setFilter]   = useState(INITIAL_FILTER);
    const [page, setPage]       = useState(0);
    const [perPage, setPerPage] = useState(30);
    const [deleteId, setDelete] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    /* ---------- filter options ---------- */
    const [options, setOptions] = useState<Record<string, any>>({});
    useEffect(() => {
        (async () => {
            const base = await fetchFilters();
            const countries = await fetchFiltersCountry();
            setOptions({ ...base, countries });
        })();
    }, []);

    /* ---------- query params ---------- */
    const queryParams = useMemo(() => {
        const p: any = {};
        Object.entries(filter).forEach(([k, v]) => {
            if (k === 'showModerationPending') return;
            if (Array.isArray(v) ? v.length : v) p[k] = v;
        });

        if (!isMeTravel) {
            p.publish    = filter.showModerationPending ? undefined : 1;
            p.moderation = filter.showModerationPending ? 0 : 1;
        }
        if (isMeTravel) p.user_id = userId;
        else if (user_id) p.user_id = user_id;
        if (isTravelBy) p.countries = [BELARUS_ID];
        return p;
    }, [filter, isMeTravel, isTravelBy, userId, user_id]);

    /* ---------- data fetch ---------- */
    const { data, status, refetch } = useQuery({
        queryKey: ['travels', page, perPage, debSearch, queryParams],
        queryFn : () => fetchTravels(page, perPage, debSearch, queryParams),
        enabled : !isMeTravel || !!userId,
        keepPreviousData: true,
    });

    /* ---------- delete ---------- */
    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        await deleteTravel(deleteId);
        setDelete(null);
        refetch();
    }, [deleteId, refetch]);

    /* ---------- helpers ---------- */
    const resetFilters = () => { setFilter(INITIAL_FILTER); setPage(0); };
    const onSelect     = (field: string, v: any) => { setFilter(p => ({ ...p, [field]: v })); setPage(0); };
    const applyFilter  = (v: any) => { setFilter(v); setPage(0); };

    /* ---------- render item ---------- */
    const renderItem = useCallback(
        ({ item, index }: any) => (
            <RenderTravelItem
                item={item}
                isMobile={isMobile}
                isSuperuser={isSuper}
                isMetravel={isMeTravel}
                onDeletePress={setDelete}
                onEditPress={router.push}
                isFirst={index === 0}
            />
        ),
        [isMobile, isSuper, isMeTravel, router.push],
    );

    /* ---------- JSX ---------- */
    return (
        <SafeAreaView style={styles.root}>
            <View style={[styles.container, { flexDirection: isMobile ? 'column' : 'row' }]}>
                {/* sidebar */}
                {!isMobile && (
                    <View style={styles.sidebar}>
                        <FiltersComponent
                            filtersLoadedKey={listKey}
                            filters={options}
                            filterValue={filter}
                            onSelectedItemsChange={onSelect}
                            handleApplyFilters={applyFilter}
                            resetFilters={resetFilters}
                            isSuperuser={isSuper}
                            closeMenu={() => {}}
                        />
                    </View>
                )}

                {/* main */}
                <View style={styles.main}>
                    <SearchAndFilterBar
                        search={search}
                        setSearch={setSearch}
                        isMobile={isMobile}
                        onToggleFilters={() => setShowFilters(v => !v)}
                    />

                    {status === 'pending' && (
                        <View style={styles.loader}><ActivityIndicator size="large" color="#4a7c59" /></View>
                    )}
                    {status === 'error' && <Text style={styles.status}>Ошибка загрузки</Text>}
                    {status === 'success' && !data?.data?.length && <Text style={styles.status}>Нет данных</Text>}

                    {status === 'success' && !!data?.data?.length && (
                        <FlatList
                            key={listKey}              /* ← новый ключ при изменении columns */
                            data={data.data}
                            keyExtractor={it => String(it.id)}
                            renderItem={renderItem}
                            numColumns={columns}
                            columnWrapperStyle={columns > 1 ? { gap: 16 } : undefined}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews
                        />
                    )}

                    {data?.total > perPage && (
                        <PaginationComponent
                            currentPage={page}
                            itemsPerPage={perPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={setPerPage}
                            itemsPerPageOptions={PER_PAGE_OPTS}
                            totalItems={data.total}
                            isMobile={isMobile}
                        />
                    )}
                </View>
            </View>

            {/* modal filters */}
            {isMobile && showFilters && (
                <FiltersComponent
                    modal
                    filtersLoadedKey={listKey}
                    filters={options}
                    filterValue={filter}
                    onSelectedItemsChange={onSelect}
                    handleApplyFilters={applyFilter}
                    resetFilters={resetFilters}
                    isSuperuser={isSuper}
                    closeMenu={() => setShowFilters(false)}
                />
            )}

            {/* confirm delete */}
            <ConfirmDialog
                visible={!!deleteId}
                onClose={() => setDelete(null)}
                onConfirm={handleDelete}
                title="Удаление"
                message="Удалить это путешествие?"
            />
        </SafeAreaView>
    );
}

export default memo(ListTravel);

/* ---------- styles ---------- */
const styles = StyleSheet.create({
    root:{ flex:1, backgroundColor:'#fff' },
    container:{ flex:1 },
    sidebar:{ width:280, borderRightWidth:1, borderColor:'#eee' },
    main:{ flex:1, padding:12 },
    loader:{ flex:1, justifyContent:'center', alignItems:'center', paddingVertical:40 },
    status:{ marginTop:40, textAlign:'center', fontSize:16, color:'#888' },
    list:{ gap:16, paddingBottom:32 },
});
