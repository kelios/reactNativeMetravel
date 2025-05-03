// Полный обновлённый компонент ListTravel с адаптацией отступов и текста

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

const initialFilterValue = { showModerationPending: false, year: '' };

export default function ListTravel() {
    const { width } = useWindowDimensions();
    const router = useRouter();
    const route = useRoute();
    const { user_id } = useLocalSearchParams();

    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});
    const [filterValue, setFilterValue] = useState(initialFilterValue);
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
    const isDesktop = useMemo(() => width >= 1024, [width]);

    const numColumns = useMemo(() => (isMobile ? 1 : isTablet ? 2 : 3), [isMobile, isTablet]);

    const cardStyles = useMemo(() => {
        const baseStyle = {
            maxHeight: isMobile ? 400 : 480,
           // aspectRatio: 0.75,
        };
        if (isMobile) return { ...baseStyle, maxWidth: '100%' };
        if (isTablet) return { ...baseStyle, maxWidth: '48%' };
        return { ...baseStyle, maxWidth: '32%' };
    }, [isMobile, isTablet]);

    const isMeTravel = route.name === 'metravel';
    const isTravelBy = route.name === 'travelsby';

    const queryParams = useMemo(() => {
        const params = { ...Object.fromEntries(Object.entries(filterValue).filter(([_, v]) => v && v.length)) };

        if (filterValue.showModerationPending) {
            params.publish = 1;
            params.moderation = 0;
        } else {
            if (isMeTravel) params.user_id = userId;
            else if (isTravelBy) Object.assign(params, { countries: [3], publish: 1, moderation: 1 });
            else Object.assign(params, { publish: 1, moderation: 1 });
            if (user_id) params.user_id = user_id;
        }

        return params;
    }, [filterValue, isMeTravel, isTravelBy, userId, user_id]);

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

    useEffect(() => setCurrentPage(0), [itemsPerPage, search, filterValue, userId]);

    useEffect(() => {
        if (isMeTravel && !userId) return;
        fetchMore();
    }, [currentPage, itemsPerPage, search, queryParams]);

    const loadFilters = async () => {
        const [filtersData, countries] = await Promise.all([fetchFilters(), fetchFiltersCountry()]);
        setFilters({ ...filtersData, countries });
    };

    const fetchMore = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTravels(currentPage, itemsPerPage, search, queryParams);
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

    const renderTravelItem = (item) => (
        <TravelListItem
            travel={item}
            currentUserId={userId ?? ''}
            isSuperuser={isSuperuser}
            isMetravel={isMeTravel}
            isMobile={isMobile}
            onEditPress={() => router.push(`/travel/${item.id}`)}
            onDeletePress={() => openDeleteDialog(String(item.id))}
        />
    );

    const renderContent = () => {
        if (!isDataLoaded || isFirstLoad) {
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
            return <View style={styles.singleItemContainer}>{renderTravelItem(items[0])}</View>;
        }

        return (
            <>
                <FlatList
                    key={`columns-${numColumns}`}
                    numColumns={numColumns}
                    data={items}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={[
                        styles.listContainer,
                        { paddingBottom: isMobile ? 80 : 32 },
                    ]}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                    initialNumToRender={4}
                    windowSize={5}
                    maxToRenderPerBatch={5}
                    removeClippedSubviews
                    renderItem={({ item }) => (
                        <View style={[styles.cardContainer, cardStyles]}>
                            {renderTravelItem(item)}
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
            <View style={styles.mainLayout}>
                {!isMobile && isDataLoaded && (
                    <View style={styles.filtersPanel}>
                        <FiltersComponent
                            filters={filters}
                            filterValue={filterValue}
                            onSelectedItemsChange={(field, items) =>
                                setFilterValue((prev) => ({ ...prev, [field]: items }))
                            }
                            handleTextFilterChange={(year) =>
                                setFilterValue((prev) => ({ ...prev, year }))
                            }
                            handleApplyFilters={setFilterValue}
                            resetFilters={() => setFilterValue(initialFilterValue)}
                            closeMenu={() => {}}
                            isSuperuser={isSuperuser}
                        />
                    </View>
                )}

                <View style={styles.contentArea}>
                    {isDataLoaded && (
                        <SearchAndFilterBar
                            search={search}
                            setSearch={setSearch}
                            onToggleFilters={() => setIsFiltersVisible((prev) => !prev)}
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

            {isMobile && isFiltersVisible && isDataLoaded && (
                <View style={styles.mobileFiltersPanel}>
                    <FiltersComponent
                        filters={filters}
                        filterValue={filterValue}
                        onSelectedItemsChange={(field, items) =>
                            setFilterValue((prev) => ({ ...prev, [field]: items }))
                        }
                        handleTextFilterChange={(year) =>
                            setFilterValue((prev) => ({ ...prev, year }))
                        }
                        handleApplyFilters={(value) => {
                            setFilterValue(value);
                            setIsFiltersVisible(false);
                        }}
                        resetFilters={() => setFilterValue(initialFilterValue)}
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
    cardContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    singleItemContainer: {
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 10,
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
