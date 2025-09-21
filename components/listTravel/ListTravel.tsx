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
    const [page, setPage] = useState(0);
    const [perPage, setPerPage] = useState(30);
    const [deleteId, setDelete] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (isMobile) setPerPage(10);
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

    const { data, status, refetch } = useQuery({
        queryKey: ["travels", page, perPage, debSearch, queryParams],
        queryFn: () => fetchTravels(page, perPage, debSearch, queryParams),
        enabled: !(isMeTravel || isExport) || !!userId,
        keepPreviousData: true,
        staleTime: 60 * 1000,
        cacheTime: 5 * 60 * 1000,
    });

    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        await deleteTravel(deleteId);
        setDelete(null);
        refetch();
    }, [deleteId, refetch]);

    const resetFilters = useCallback(() => {
        setFilter(INITIAL_FILTER);
        setPage(0);
    }, []);

    const onSelect = useCallback((field: string, v: any) => {
        setFilter((p) => ({ ...p, [field]: v }));
        setPage(0);
    }, []);

    const applyFilter = useCallback((v: any) => {
        setFilter(v);
        setPage(0);
    }, []);

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

    const toggleSelect = useCallback((t: any) => {
        setSelected((prev) =>
            prev.find((x) => x.id === t.id) ? prev.filter((x) => x.id !== t.id) : [...prev, t]
        );
    }, []);

    const selectAll = useCallback(() => {
        if (!data?.data) return;
        setSelected((prev) => (prev.length === data.data.length ? [] : data.data));
    }, [data]);

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
            (router as any).push,
            selected,
            toggleSelect,
        ]
    );

    const keyExtractor = useCallback((item: any) => String(item.id), []);


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

                    {status === "pending" && (
                        <View style={styles.loader} accessibilityRole="alert" aria-live="polite">
                            <ActivityIndicator size="large" color="#4a7c59" />
                        </View>
                    )}
                    {status === "error" && <Text style={styles.status}>Ошибка загрузки</Text>}
                    {status === "success" && !data?.data?.length && (
                        <Text style={styles.status}>Нет данных</Text>
                    )}

                    {status === "success" && !!data?.data?.length && (
                        <FlatList
                            key={listKey}
                            data={data.data}
                            keyExtractor={keyExtractor}
                            renderItem={renderItem}
                            numColumns={columns}
                            columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
                            contentContainerStyle={[
                                styles.list,
                                { minHeight: "100vh" as any, paddingBottom: isExport ? 76 : 32 },
                            ]}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={Platform.OS === "android"}
                            initialNumToRender={isMobile ? 4 : 8}
                            maxToRenderPerBatch={isMobile ? 4 : 8}
                            windowSize={isMobile ? 7 : 9}
                            updateCellsBatchingPeriod={isMobile ? 50 : 0}
                            extraData={selected}
                            getItemLayout={getItemLayout}
                            accessibilityRole="list"
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
                                {selected.length === data?.data?.length ? "Снять выделение" : "Выбрать все"}
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
    status: { marginTop: 40, textAlign: "center", fontSize: 16, color: "#888" },
    list: { gap: 16, paddingBottom: 32 },
    columnWrapper: { gap: 16, justifyContent: "space-between" },
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
    btnDisabled: { backgroundColor: "#aaa" },
    btnTxt: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

export default memo(ListTravel);