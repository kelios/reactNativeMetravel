import React, { useState, useEffect, useMemo } from 'react';
import {
    SafeAreaView,
    View,
    FlatList,
    Text,
    ActivityIndicator,
    useWindowDimensions,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

import FiltersComponent from './FiltersComponent';
import PaginationComponent from '../PaginationComponent';
import TravelListItem from './TravelListItem';
import ConfirmDialog from '../ConfirmDialog';
import SearchAndFilterBar from './SearchAndFilterBar';

import {
    fetchTravels,
    fetchFilters,
    fetchFiltersCountry,
    deleteTravel,
} from '@/src/api/travels';

export default function ListTravel() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState({ showModerationPending: false });
    const [travels, setTravels] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isSuperuser, setIsSuperuser] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [currentDeleteId, setCurrentDeleteId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [isFiltersVisible, setIsFiltersVisible] = useState(false);

    const isMobile = useMemo(() => width < 768, [width]);
    const isTablet = useMemo(() => width >= 768 && width < 1024, [width]);
    const isMediumScreen = useMemo(() => width >= 1024 && width < 1740, [width]);
    const isLargeScreen = useMemo(() => width >= 1740, [width]);

    const numColumns = useMemo(() => {
        if (isMobile || isTablet) return 1;
        if (isMediumScreen) return 2;
        if (isLargeScreen) return 3;
        return 2;
    }, [isMobile, isTablet, isMediumScreen, isLargeScreen]);

    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

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
        const [filtersData, countries] = await Promise.all([
            fetchFilters(),
            fetchFiltersCountry(),
        ]);
        setFilters({ ...filtersData, countries });
    };

    const cleanFilters = (filtersObject) => {
        return Object.fromEntries(
            Object.entries(filtersObject).filter(([_, v]) => v && v.length)
        );
    };

    const fetchMore = async () => {
        setIsLoading(true);
        const params = { ...cleanFilters(filterValue) };
        const isModerationPending = filterValue?.showModerationPending ?? false;

        if (isModerationPending) {
            params.publish = 1;
            params.moderation = 0;
        } else {
            if (isMeTravel) params.user_id = userId;
            else if (isTravelBy) {
                Object.assign(params, { countries: [3], publish: 1, moderation: 1 });
            } else {
                Object.assign(params, { publish: 1, moderation: 1 });
            }
            if (user_id) params.user_id = user_id;
        }

        try {
            const data = await fetchTravels(currentPage, itemsPerPage, search, params);
            setTravels(data);
        } catch (e) {
            console.warn('Ошибка загрузки путешествий', e);
        } finally {
            setIsLoading(false);
            setIsFirstLoad(false);
            setIsDataLoaded(true);
        }
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

    const renderContent = () => {
        if (!isDataLoaded || isFirstLoad) {
            return (
                <View style={styles.loaderFull}>
                    <ActivityIndicator size="large" color="#ff7f50" />
                </View>
            );
        }

        if (!travels?.data?.length) {
            return <Text>Путешествий не найдено</Text>;
        }

        return (
            <>
                <FlatList
                    key={`columns-${numColumns}`}
                    numColumns={numColumns}
                    data={travels.data}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.flatList}
                    initialNumToRender={4}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    removeClippedSubviews={true}
                    renderItem={({ item, index }) => (
                        <View style={[styles.itemWrapper, isMobile && styles.mobileCard]}>
                            <TravelListItem
                                travel={item}
                                currentUserId={userId ?? ''}
                                isSuperuser={isSuperuser}
                                isMetravel={isMeTravel}
                                isMobile={isMobile}
                                index={index}
                                onEditPress={() => router.push(`/travel/${item.id}`)}
                                onDeletePress={() => openDeleteDialog(String(item.id))}
                            />
                        </View>
                    )}
                />
                {isLoading && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#ff7f50" />
                    </View>
                )}
            </>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.row}>
                {!isMobile && isDataLoaded && (
                    <View style={styles.sidebar}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            onSelectedItemsChange={(field, items) =>
                                setFilterValue({ ...filterValue, [field]: items })
                            }
                            handleTextFilterChange={(year) =>
                                setFilterValue({ ...filterValue, year })
                            }
                            handleApplyFilters={setFilterValue}
                            resetFilters={() =>
                                setFilterValue({ showModerationPending: false, year: '' })
                            }
                            closeMenu={() => {}}
                            isSuperuser={isSuperuser}
                        />
                    </View>
                )}

                <View style={styles.content}>
                    {isDataLoaded && (
                        <SearchAndFilterBar
                            search={search}
                            setSearch={setSearch}
                            onToggleFilters={() => setIsFiltersVisible((prev) => !prev)}
                        />
                    )}

                    {renderContent()}

                    <PaginationComponent
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                        itemsPerPageOptions={[10, 20, 30, 50, 100]}
                        totalItems={travels?.total}
                    />
                </View>
            </View>

            {isMobile && isFiltersVisible && isDataLoaded && (
                <View style={styles.mobileFilters}>
                    <FiltersComponent
                        filters={filters}
                        filterValue={filterValue}
                        onSelectedItemsChange={(field, items) =>
                            setFilterValue({ ...filterValue, [field]: items })
                        }
                        handleTextFilterChange={(year) =>
                            setFilterValue({ ...filterValue, year })
                        }
                        handleApplyFilters={setFilterValue}
                        resetFilters={() =>
                            setFilterValue({ showModerationPending: false, year: '' })
                        }
                        closeMenu={() => setIsFiltersVisible(false)}
                        isSuperuser={isSuperuser}
                    />
                </View>
            )}

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
    container: { flex: 1, backgroundColor: '#fff' },
    row: { flexDirection: 'row', flex: 1 },
    sidebar: {
        width: 280,
        borderRightWidth: 1,
        borderRightColor: '#ddd',
        padding: 8,
        backgroundColor: '#f9f9f9',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    flatList: {
        gap: 10,
    },
    itemWrapper: {
        flex: 1,
        padding: 8,
    },
    mobileCard: {
        maxHeight: 360,
    },
    loaderOverlay: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    loaderFull: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mobileFilters: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        zIndex: 999,
    },
});
