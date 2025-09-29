// src/components/listTravel/ListTravel.tsx
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
    Platform,
    Pressable,
    RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import Head from "expo-router/head";

import FiltersComponent from "./FiltersComponent";
import RenderTravelItem from "./RenderTravelItem";
import PaginationComponent from "../PaginationComponent";
import SearchAndFilterBar from "./SearchAndFilterBar";
import ConfirmDialog from "../ConfirmDialog";
import {
    deleteTravel,
    fetchFilters,
    fetchFiltersCountry,
    fetchTravels,
} from "@/src/api/travels";
import { renderPreviewToBlobURL, saveContainerAsPDF } from "@/src/utils/pdfWeb";
import TravelPdfTemplate from "@/components/export/TravelPdfTemplate";

const INITIAL_FILTER = { year: "", showModerationPending: false };
const BELARUS_ID = 3;
const PER_PAGE_OPTS = [9, 18, 30, 60];
const ITEM_HEIGHT = 320;
// Константы для бесконечного скролла
const INITIAL_PAGE = 0;
const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 30;

function useDebounce<T>(val: T, delay = 400) {
    const [debouncedVal, setDebouncedVal] = useState(val);
    useEffect(() => {
        const id = setTimeout(() => setDebouncedVal(val), delay);
        return () => clearTimeout(id);
    }, [val, delay]);
    return debouncedVal;
}

const MemoizedFilters = memo(FiltersComponent);
const MemoizedSearchBar = memo(SearchAndFilterBar);
const MemoizedTravelItem = memo(RenderTravelItem);

function ListTravel() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const columns = isMobile ? 1 : isTablet ? 2 : 3;
    const listKey = useMemo(() => `grid-${columns}-${width}`, [columns, width]);

    const route = useRoute();
    const router = useRouter();
    const { user_id } = useLocalSearchParams();
    const isMeTravel = (route as any).name === "metravel";
    const isTravelBy = (route as any).name === "travelsby";
    const isExport = (route as any).name === "export";

    const [userId, setUserId] = useState<string | null>(null);
    const [isSuper, setSuper] = useState(false);
    useEffect(() => {
        AsyncStorage.multiGet(["userId", "isSuperuser"]).then(([[, id], [, su]]) => {
            setUserId(id);
            setSuper(su === "true");
        });
    }, []);

    const [search, setSearch] = useState("");
    const debSearch = useDebounce(search);
    const [filter, setFilter] = useState(INITIAL_FILTER);

    // Состояния для пагинации и бесконечного скролла
    const [page, setPage] = useState(INITIAL_PAGE);
    const [perPage, setPerPage] = useState(isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    const [allData, setAllData] = useState<any[]>([]); // Все загруженные данные
    const [hasMore, setHasMore] = useState(true);

    const [deleteId, setDelete] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Сброс данных при изменении фильтров или поиска
    useEffect(() => {
        setPage(INITIAL_PAGE);
        setAllData([]);
        setHasMore(true);
    }, [debSearch, filter, isMeTravel, isExport, userId, user_id]);

    // Обновление perPage при изменении размера экрана
    useEffect(() => {
        setPerPage(isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    }, [isMobile]);

    const [options, setOptions] = useState<Record<string, any>>({});
    useEffect(() => {
        (async () => {
            const [base, countries] = await Promise.all([fetchFilters(), fetchFiltersCountry()]);
            setOptions({ ...base, countries });
        })();
    }, []);

    const queryParams = useMemo(() => {
        const p: any = {};
        Object.entries(filter).forEach(([k, v]) => {
            if (k === "showModerationPending") return;
            if (Array.isArray(v) ? v.length : v) p[k] = v;
        });

        if (!isMeTravel || !isExport) {
            p.publish = filter.showModerationPending ? undefined : 1;
            p.moderation = filter.showModerationPending ? 0 : 1;
        }
        if (isMeTravel || isExport) p.user_id = userId;
        else if (user_id) p.user_id = user_id;
        if (isTravelBy) p.countries = [BELARUS_ID];
        if (isMeTravel) {
            p.publish = undefined;
            p.moderation = undefined;
        }
        return p;
    }, [filter, isMeTravel, isExport, isTravelBy, userId, user_id]);

    // Запрос для загрузки данных с пагинацией
    const { data, status, refetch, isFetching, isFetchingNextPage } = useQuery({
        queryKey: ["travels", page, perPage, debSearch, queryParams],
        queryFn: () => fetchTravels(page, perPage, debSearch, queryParams),
        enabled: (!(isMeTravel || isExport) || !!userId) && Object.keys(options).length > 0 && hasMore,
        keepPreviousData: true,
        staleTime: 60 * 1000,
        cacheTime: 5 * 60 * 1000,
    });

    // Обновление всех данных при получении новой страницы
    useEffect(() => {
        if (data?.data) {
            if (page === INITIAL_PAGE) {
                // Первая загрузка
                setAllData(data.data);
            } else {
                // Добавление новых данных
                setAllData(prev => {
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = data.data.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            }

            // Проверка, есть ли еще данные
            setHasMore(data.data.length === perPage);
        }
    }, [data, page, perPage]);

    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        await deleteTravel(deleteId);
        setDelete(null);
        // Полный сброс и перезагрузка
        setPage(INITIAL_PAGE);
        setAllData([]);
        setHasMore(true);
        refetch();
    }, [deleteId, refetch]);

    const resetFilters = useCallback(() => {
        setFilter(INITIAL_FILTER);
        setPage(INITIAL_PAGE);
        setAllData([]);
        setHasMore(true);
    }, []);

    const onSelect = useCallback((field: string, v: any) => {
        setFilter((p) => ({ ...p, [field]: v }));
        setPage(INITIAL_PAGE);
        setAllData([]);
        setHasMore(true);
    }, []);

    const applyFilter = useCallback((v: any) => {
        setFilter(v);
        setPage(INITIAL_PAGE);
        setAllData([]);
        setHasMore(true);
    }, []);

    // Функция для загрузки следующей страницы
    const loadMore = useCallback(() => {
        if (!isFetching && hasMore && !isFetchingNextPage) {
            setPage(prev => prev + 1);
        }
    }, [isFetching, hasMore, isFetchingNextPage]);

    // Функция для pull-to-refresh
    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setPage(INITIAL_PAGE);
        setAllData([]);
        setHasMore(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
        }),
        []
    );

    const [selected, setSelected] = useState<any[]>([]);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const flatListRef = useRef<FlatList>(null);

    // Сброс выбора при изменении данных
    useEffect(() => {
        setSelected([]);
    }, [allData]);

    const toggleSelect = useCallback((t: any) => {
        setSelected((prev) =>
            prev.find((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t]
        );
    }, []);

    const selectAll = useCallback(() => {
        if (!allData.length) return;
        setSelected((prev) => (prev.length === allData.length ? [] : allData));
    }, [allData]);

    const makePreview = async () => {
        if (!printRef.current || !selected.length) return;

        let statusEl: HTMLDivElement | null = document.createElement("div");
        let iframe: HTMLIFrameElement | null = null;
        let closeBtn: HTMLButtonElement | null = null;

        try {
            statusEl.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0;
        padding: 20px; background: #4a7c59; color: white;
        text-align: center; z-index: 9999;`;
            statusEl.textContent = "Генерируем PDF, подождите...";
            document.body.appendChild(statusEl);

            const url = await renderPreviewToBlobURL(printRef.current, { filename: "metravel.pdf" });

            if (url) {
                iframe = document.createElement("iframe");
                iframe.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          border: none; z-index: 9998;`;
                iframe.src = url;

                closeBtn = document.createElement("button");
                closeBtn.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 9999;
          padding: 10px 20px; background: white; color: #4a7c59;
          border: none; border-radius: 4px; cursor: pointer;`;
                closeBtn.textContent = "Закрыть";
                closeBtn.onclick = () => {
                    if (iframe && document.body.contains(iframe)) document.body.removeChild(iframe);
                    if (closeBtn && document.body.contains(closeBtn)) document.body.removeChild(closeBtn);
                    if (statusEl && document.body.contains(statusEl)) document.body.removeChild(statusEl);
                    URL.revokeObjectURL(url);
                };

                document.body.appendChild(iframe);
                document.body.appendChild(closeBtn);
                if (statusEl && document.body.contains(statusEl)) document.body.removeChild(statusEl);
                statusEl = null;
            }
        } catch (e) {
            console.error("[PDFExport] preview error:", e);
            if (statusEl) {
                statusEl.textContent = "Ошибка при создании превью";
                statusEl.style.background = "#a00";
                setTimeout(() => {
                    if (statusEl && statusEl.parentNode) document.body.removeChild(statusEl);
                }, 3000);
            }
            if (iframe && document.body.contains(iframe)) document.body.removeChild(iframe);
            if (closeBtn && document.body.contains(closeBtn)) document.body.removeChild(closeBtn);
        }
    };

    const savePdf = async () => {
        if (!printRef.current || !selected.length) {
            alert("Пожалуйста, выберите хотя бы одно путешествие");
            return;
        }

        let loadingEl: HTMLDivElement | null = document.createElement("div");
        loadingEl.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; padding: 20px;
      background: #4a7c59; color: white; text-align: center; z-index: 9999;`;
        loadingEl.textContent = "Создание PDF...";
        document.body.appendChild(loadingEl);

        try {
            await saveContainerAsPDF(printRef.current, "my-travels.pdf", {
                margin: [10, 10],
                image: { type: "jpeg", quality: 0.95 },
            });
        } catch (error) {
            console.error("PDF generation error:", error);
            alert("Ошибка при создании PDF");
        } finally {
            if (loadingEl && loadingEl.parentNode) document.body.removeChild(loadingEl);
            loadingEl = null;
        }
    };

    useEffect(
        () => () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        },
        [pdfUrl]
    );

    const renderItem = useCallback(
        ({ item, index }: any) => (
            <MemoizedTravelItem
                item={item}
                isMobile={isMobile}
                isSuperuser={isSuper}
                isMetravel={isMeTravel}
                isExport={isExport}
                onDeletePress={setDelete}
                onEditPress={router.push}
                isFirst={index === 0}
                selectable={isExport}
                isSelected={!!selected.find((s) => s.id === item.id)}
                onToggle={() => toggleSelect(item)}
            />
        ),
        [
            isMobile,
            isSuper,
            isMeTravel,
            isExport,
            router.push,
            selected,
            toggleSelect,
        ]
    );

    const keyExtractor = useCallback((item: any) => String(item.id), []);

    // Компонент для индикатора загрузки следующей страницы
    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#4a7c59" />
                <Text style={styles.footerText}>Загрузка...</Text>
            </View>
        );
    }, [isFetchingNextPage]);

    // Компонент для пустого состояния
    const renderEmpty = useCallback(() => {
        if (status === "pending" || isFetching) return null;

        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                    {data?.total === 0 ? "Нет данных" : "Не удалось загрузить данные"}
                </Text>
            </View>
        );
    }, [status, isFetching, data?.total]);

    const showInitialLoading = status === "pending" && page === INITIAL_PAGE;

    return (
        <SafeAreaView style={styles.root}>
            <View style={[styles.container, { flexDirection: isMobile ? "column" : "row" }]}>
                {!isMobile && (
                    <View style={styles.sidebar} aria-label="Фильтры">
                        <MemoizedFilters
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

                <View style={styles.main}>
                    <MemoizedSearchBar
                        search={search}
                        setSearch={setSearch}
                        isMobile={isMobile}
                        onToggleFilters={() => setShowFilters((v) => !v)}
                    />

                    {showInitialLoading && (
                        <View style={styles.loader} accessibilityRole="alert" aria-live="polite">
                            <ActivityIndicator size="large" color="#4a7c59" />
                        </View>
                    )}

                    {status === "error" && page === INITIAL_PAGE && (
                        <Text style={styles.status}>Ошибка загрузки</Text>
                    )}

                    {!showInitialLoading && (
                        <FlatList
                            ref={flatListRef}
                            key={listKey}
                            data={allData}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                            numColumns={columns}
                            columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
                            contentContainerStyle={[
                                styles.list,
                                {
                                    minHeight: "100vh" as any,
                                    paddingBottom: isExport ? 76 : 32,
                                    flexGrow: 1,
                                },
                            ]}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={Platform.OS === "android"}
                            initialNumToRender={isMobile ? MOBILE_PAGE_SIZE : 8}
                            maxToRenderPerBatch={isMobile ? MOBILE_PAGE_SIZE : 8}
                            windowSize={isMobile ? 5 : 9}
                            updateCellsBatchingPeriod={isMobile ? 50 : 0}
                            extraData={selected}
                            getItemLayout={getItemLayout}
                            accessibilityRole="list"
                            // Бесконечный скролл для мобильных
                            onEndReached={isMobile ? loadMore : undefined}
                            onEndReachedThreshold={isMobile ? 0.5 : undefined}
                            ListFooterComponent={isMobile ? renderFooter : undefined}
                            ListEmptyComponent={renderEmpty}
                            refreshControl={
                                isMobile ? (
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={onRefresh}
                                        colors={["#4a7c59"]}
                                        tintColor="#4a7c59"
                                    />
                                ) : undefined
                            }
                        />
                    )}

                    {/* Пагинация для десктопа */}
                    {!isMobile && data?.total > perPage && (
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

            {isMobile && showFilters && (
                <MemoizedFilters
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

            <ConfirmDialog
                visible={!!deleteId}
                onClose={() => setDelete(null)}
                onConfirm={handleDelete}
                title="Удаление"
                message="Удалить это путешествие?"
            />

            {isExport && (
                <View style={styles.exportBar}>
                    {!isMobile && (
                        <Pressable style={styles.btn} onPress={selectAll}>
                            <Text style={styles.btnTxt}>
                                {selected.length === allData.length ? "Снять выделение" : "Выбрать все"}
                            </Text>
                        </Pressable>
                    )}
                    <Pressable
                        style={[styles.btn, !selected.length && styles.btnDisabled]}
                        disabled={!selected.length}
                        onPress={makePreview}
                    >
                        <Text style={styles.btnTxt}>
                            {isMobile ? `Превью (${selected.length})` : `Превью (${selected.length})`}
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.btn, !selected.length && styles.btnDisabled]}
                        disabled={!selected.length}
                        onPress={savePdf}
                    >
                        <Text style={styles.btnTxt}>{isMobile ? "PDF" : "Сохранить PDF"}</Text>
                    </Pressable>

                    <div
                        ref={printRef}
                        style={{
                            position: "fixed",
                            left: 0,
                            top: 0,
                            width: "794px",
                            background: "#fff",
                            pointerEvents: "none",
                            opacity: 0,
                            zIndex: 0,
                        }}
                    >
                        {selected.map((travel) => (
                            <TravelPdfTemplate key={travel.id} travelId={travel.id} />
                        ))}
                    </div>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },
    container: {
        flex: 1,
        ...(Platform.OS === "web" && { alignItems: "stretch" }),
    },
    sidebar: {
        width: 280,
        borderRightWidth: 1,
        borderColor: "#eee",
    },
    main: {
        flex: 1,
        padding: 12,
        ...(Platform.OS === "web" && {
            maxWidth: 1440,
            marginHorizontal: "auto" as any,
            width: "100%",
        }),
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    status: {
        marginTop: 40,
        textAlign: "center",
        fontSize: 16,
        color: "#888"
    },
    list: {
        gap: 16,
        paddingBottom: 32
    },
    columnWrapper: {
        gap: 16,
        justifyContent: "space-between"
    },
    exportBar: {
        flexDirection: "row",
        gap: 8,
        padding: 8,
        borderTopWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fafafa",
    },
    btn: {
        flex: 1,
        backgroundColor: "#4a7c59",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: "center",
    },
    btnDisabled: {
        backgroundColor: "#aaa"
    },
    btnTxt: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14
    },
    footerLoader: {
        padding: 20,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },
    footerText: {
        fontSize: 14,
        color: "#666",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
    },
});

export default memo(ListTravel);