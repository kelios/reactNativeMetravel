// src/components/listTravel/FiltersComponent.tsx
import React, {
    useState,
    useMemo,
    useCallback,
    memo,
    useRef,
    useEffect,
} from "react";
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    TextInput,
    ScrollView,
    useWindowDimensions,
    Keyboard,
    Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { debounce } from "lodash";

/* ===================== */
/*   Служебные элементы  */
/* ===================== */

const GroupBoxItem = memo(function GroupBoxItem({
                                                    id,
                                                    title,
                                                    checked,
                                                    onPress,
                                                }: {
    id: number | string;
    title: string;
    checked: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            style={[styles.checkboxRow, Platform.OS === "web" && { cursor: "pointer" }]}
            onPress={onPress}
            aria-pressed={checked}
            role="checkbox"
            accessibilityLabel={title}
            accessibilityState={{ checked }}
            hitSlop={8}
        >
            <Feather name={checked ? "check-square" : "square"} size={20} color="#4a7c59" />
            <Text style={styles.itemText}>{title}</Text>
        </Pressable>
    );
});

const GroupBox = memo(function GroupBox({
                                            label,
                                            field,
                                            items,
                                            valKey,
                                            labelKey,
                                            filterValue,
                                            handleCheckForField,
                                            open,
                                            toggle,
                                        }: any) {
    const selectedItems = filterValue[field] ?? [];

    return (
        <View style={styles.groupBox}>
            <Pressable
                style={[styles.groupHeader, Platform.OS === "web" && { cursor: "pointer" }]}
                onPress={() => toggle(field)}
                aria-expanded={open}
                accessibilityLabel={label}
                hitSlop={6}
            >
                <Text style={styles.groupLabel}>{label}</Text>
                <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color="#333" />
            </Pressable>

            {open && (
                <View style={styles.itemsBox}>
                    {items.map((it: any) => {
                        const id = it[valKey];
                        return (
                            <GroupBoxItem
                                key={id}
                                id={id}
                                title={it[labelKey]}
                                checked={selectedItems.includes(id)}
                                onPress={() => handleCheckForField(id)}
                            />
                        );
                    })}
                </View>
            )}
        </View>
    );
});

/* ===================== */
/*     Основной блок     */
/* ===================== */

const FiltersComponent = ({
                              filters = {},
                              filterValue = {},
                              onSelectedItemsChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                              isSuperuser,
                              isCompact = false,
                              disableApplyOnMobileClose = false,
                              initialOpenState = {},
                          }) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { name } = useRoute() as any;

    const isMobile = useMemo(() => width <= 768, [width]);
    const isMobileFullScreenMode = useMemo(() => isMobile && !isCompact, [isMobile, isCompact]);
    const isTravelsByPage = useMemo(() => name === "travelsby", [name]);

    const [year, setYear] = useState(filterValue.year ?? "");
    const [open, setOpen] = useState<Record<string, boolean>>(initialOpenState);
    const [yearOpen, setYearOpen] = useState(false);
    const [allExpanded, setAllExpanded] = useState(false);

    const scrollRef = useRef<ScrollView>(null);
    const yearInputRef = useRef<TextInput>(null);

    const groups = useMemo(
        () => [
            { label: "Страны", field: "countries", items: filters.countries ?? [], valKey: "country_id", labelKey: "title_ru", hidden: isTravelsByPage },
            { label: "Категории", field: "categories", items: filters.categories ?? [], valKey: "id", labelKey: "name" },
            { label: "Объекты", field: "categoryTravelAddress", items: filters.categoryTravelAddress ?? [], valKey: "id", labelKey: "name" },
            { label: "Транспорт", field: "transports", items: filters.transports ?? [], valKey: "id", labelKey: "name" },
            { label: "Спутники", field: "companions", items: filters.companions ?? [], valKey: "id", labelKey: "name" },
            { label: "Сложность", field: "complexity", items: filters.complexity ?? [], valKey: "id", labelKey: "name" },
            { label: "Месяц", field: "month", items: filters.month ?? [], valKey: "id", labelKey: "name" },
            { label: "Ночлег", field: "over_nights_stay", items: filters.over_nights_stay ?? [], valKey: "id", labelKey: "name" },
        ],
        [filters, isTravelsByPage]
    );

    const apply = useCallback(() => {
        Keyboard.dismiss();

        const cleanedFilterValue = Object.fromEntries(
            Object.entries(filterValue).map(([key, value]) => {
                if (Array.isArray(value) && value.length === 0) return [key, undefined];
                return [key, value];
            })
        );

        handleApplyFilters({
            ...cleanedFilterValue,
            year: year || undefined,
        });

        // на мобиле обычно хотим автоприменение и просто закрыть окно
        if (isMobile && !disableApplyOnMobileClose) closeMenu();
    }, [filterValue, year, isMobile, disableApplyOnMobileClose, handleApplyFilters, closeMenu]);

    // единый дебаунс для авто-применения (мобила)
    const debouncedApply = useMemo(() => debounce(apply, 300), [apply]);

    useEffect(() => () => debouncedApply.cancel(), [debouncedApply]);

    const toggle = useCallback((field: string) => {
        setOpen((prev) => ({ ...prev, [field]: !prev[field] }));
    }, []);

    // чекбоксы: обновляем и авто-применяем на мобиле (ненавязчиво)
    const handleCheckForField = useCallback(
        (field: string) => (id: any) => {
            const selected = filterValue[field] ?? [];
            const next = selected.includes(id) ? selected.filter((v: any) => v !== id) : [...selected, id];
            onSelectedItemsChange(field, next);

            if (isMobile) debouncedApply();
        },
        [filterValue, onSelectedItemsChange, debouncedApply, isMobile]
    );

    const handleYearChange = useCallback(
        (text: string) => {
            const cleaned = text.replace(/[^0-9]/g, "").slice(0, 4);
            setYear(cleaned);
            if (isMobile) {
                // авто-применение чуть позже (или сразу при 4 цифрах)
                if (cleaned.length === 4) debouncedApply();
            }
        },
        [debouncedApply, isMobile]
    );

    const handleReset = useCallback(() => {
        setYear("");
        resetFilters();
        if (isMobile && !disableApplyOnMobileClose) closeMenu();
    }, [isMobile, disableApplyOnMobileClose, resetFilters, closeMenu]);

    const handleToggleAll = useCallback(() => {
        const newState: Record<string, boolean> = {};
        groups.forEach(({ field, hidden }) => {
            if (!hidden) newState[field] = !allExpanded;
        });
        setOpen(newState);
        setAllExpanded(!allExpanded);
    }, [groups, allExpanded]);

    /* ======= Модерация ======= */
    const renderModerationCheckbox = useMemo(
        () =>
            isSuperuser && (
                <View style={styles.groupBox}>
                    <Text style={styles.groupLabel}>Модерация</Text>
                    <View style={styles.itemsBox}>
                        <Pressable
                            onPress={() =>
                                onSelectedItemsChange("showModerationPending", !filterValue.showModerationPending)
                            }
                            style={[styles.checkboxRow, Platform.OS === "web" && { cursor: "pointer" }]}
                            aria-pressed={filterValue.showModerationPending}
                            role="checkbox"
                            accessibilityLabel="Показать статьи на модерации"
                            accessibilityState={{ checked: filterValue.showModerationPending }}
                            hitSlop={8}
                        >
                            <Feather
                                name={filterValue.showModerationPending ? "check-square" : "square"}
                                size={20}
                                color="#4a7c59"
                            />
                            <Text style={styles.itemText}>Показать статьи на модерации</Text>
                        </Pressable>
                    </View>
                </View>
            ),
        [isSuperuser, filterValue, onSelectedItemsChange]
    );

    /* ======= Ввод Года ======= */
    const renderYearInput = useMemo(
        () => (
            <View style={styles.groupBox}>
                <Pressable
                    style={[styles.groupHeader, Platform.OS === "web" && { cursor: "pointer" }]}
                    onPress={() => {
                        setYearOpen((v) => !v);
                        setTimeout(() => yearInputRef.current?.focus(), 100);
                    }}
                    aria-expanded={yearOpen}
                    accessibilityLabel="Фильтр по году"
                    hitSlop={6}
                >
                    <Text style={styles.groupLabel}>Год</Text>
                    <Feather name={yearOpen ? "chevron-up" : "chevron-down"} size={18} color="#333" />
                </Pressable>

                {yearOpen && (
                    <View style={styles.yearBox}>
                        <View style={styles.yearInputWrapper}>
                            <TextInput
                                ref={yearInputRef}
                                value={year}
                                onChangeText={handleYearChange}
                                placeholder="2023"
                                keyboardType="numeric"
                                maxLength={4}
                                style={styles.yearInput}
                                returnKeyType="done"
                                onSubmitEditing={apply}
                                accessibilityLabel="Введите год"
                            />
                            {year.length > 0 && (
                                <Pressable onPress={() => setYear("")} style={styles.clearIcon} accessibilityLabel="Очистить год" hitSlop={8}>
                                    <Feather name="x" size={16} color="#999" />
                                </Pressable>
                            )}
                        </View>
                    </View>
                )}
            </View>
        ),
        [yearOpen, year, handleYearChange, apply]
    );

    /* ======= Футер кнопок ======= */
    const renderFooter = useMemo(
        () => (
            <View
                style={[
                    styles.footer,
                    {
                        paddingBottom: Math.max(insets.bottom, 18),
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 8,
                    },
                ]}
            >
                {isMobile && (
                    <Pressable
                        style={[styles.btn, { flex: 1 }, styles.close]}
                        onPress={closeMenu}
                        accessibilityLabel="Закрыть фильтры"
                        hitSlop={8}
                    >
                        <Text style={styles.btnTxt}>Закрыть</Text>
                    </Pressable>
                )}
                <Pressable
                    style={[styles.btn, { flex: 1 }, styles.reset]}
                    onPress={handleReset}
                    accessibilityLabel="Сбросить фильтры"
                    hitSlop={8}
                >
                    <Text style={[styles.btnTxt, styles.resetTxt]}>Сбросить</Text>
                </Pressable>
                <Pressable
                    style={[styles.btn, { flex: 1 }, styles.apply]}
                    onPress={apply}
                    accessibilityLabel="Применить фильтры"
                    hitSlop={8}
                >
                    <Text style={styles.btnTxt}>Применить</Text>
                </Pressable>
            </View>
        ),
        [isMobile, insets.bottom, closeMenu, handleReset, apply]
    );

    return (
        <View style={[styles.root, isMobileFullScreenMode && styles.fullScreenMobile]}>
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={Platform.OS !== "web"}
            >
                <View style={styles.content}>
                    {renderModerationCheckbox}

                    <Pressable
                        style={[styles.toggleAllBtn, Platform.OS === "web" && { cursor: "pointer" }]}
                        onPress={handleToggleAll}
                        accessibilityLabel={allExpanded ? "Свернуть все фильтры" : "Развернуть все фильтры"}
                        hitSlop={8}
                    >
                        <Text style={styles.toggleAllText}>{allExpanded ? "Свернуть все" : "Развернуть все"}</Text>
                    </Pressable>

                    {groups.map(({ label, field, items, valKey, labelKey, hidden }) =>
                        hidden ? null : (
                            <GroupBox
                                key={field}
                                label={label}
                                field={field}
                                items={items}
                                valKey={valKey}
                                labelKey={labelKey}
                                filterValue={filterValue}
                                handleCheckForField={handleCheckForField(field)}
                                open={open[field]}
                                toggle={toggle}
                            />
                        )
                    )}

                    {renderYearInput}
                </View>
            </ScrollView>

            {renderFooter}
        </View>
    );
};

export default memo(FiltersComponent);

/* ===================== */
/*         Стили         */
/* ===================== */

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#fff" },

    fullScreenMobile: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: "#fff",
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 8, paddingBottom: 12 },
    content: { paddingHorizontal: 6 },

    groupBox: { marginBottom: 8, backgroundColor: "#f9f9f9", borderRadius: 8 },

    groupHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    groupLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#333",
    },

    itemsBox: { paddingHorizontal: 12, paddingBottom: 6 },

    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        gap: 8,
    },
    itemText: {
        fontSize: 14,
        color: "#333",
    },

    yearBox: { paddingHorizontal: 12, paddingBottom: 8 },
    yearInputWrapper: {
        position: "relative",
    },
    yearInput: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
        color: "#333",
    },
    clearIcon: {
        position: "absolute",
        right: 8,
        top: "50%",
        marginTop: -8,
        padding: 4,
    },

    toggleAllBtn: {
        alignSelf: "flex-end",
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
    },
    toggleAllText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4a7c59",
    },

    footer: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
            },
            android: { elevation: 4 },
            web: { position: "sticky" as any, bottom: 0, zIndex: 100 },
        }),
    },

    btn: {
        flex: 1,
        minWidth: "30%",
        paddingVertical: 11,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    close: { backgroundColor: "#999" },
    reset: { backgroundColor: "#e0e0e0" },
    resetTxt: { color: "#333" },
    apply: { backgroundColor: "#4a7c59" },
    btnTxt: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
