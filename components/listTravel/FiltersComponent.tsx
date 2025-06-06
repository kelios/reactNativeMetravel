import React, {
    useState,
    useMemo,
    useCallback,
    memo,
    useRef,
    useEffect,
} from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { debounce } from 'lodash';

const GroupBox = memo(({ label, field, items, valKey, labelKey, filterValue, handleCheckForField, open, toggle }) => {
    return (
        <View style={styles.groupBox}>
            <Pressable
                style={[styles.groupHeader, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() => toggle(field)}
            >
                <Text style={styles.groupLabel}>{label}</Text>
                <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
            </Pressable>
            {open && (
                <View style={styles.itemsBox}>
                    {items.map((it) => {
                        const id = it[valKey];
                        const title = it[labelKey];
                        const checked = (filterValue[field] ?? []).includes(id);
                        return (
                            <Pressable
                                key={id}
                                style={[styles.checkboxRow, Platform.OS === 'web' && { cursor: 'pointer' }]}
                                onPress={() => handleCheckForField(id)}
                            >
                                <Feather
                                    name={checked ? 'check-square' : 'square'}
                                    size={22}
                                    color="#4a7c59"
                                />
                                <Text style={styles.itemText}>{title}</Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
});

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
    const { name } = useRoute();
    const isMobile = width <= 768;
    const isTravelsByPage = name === 'travelsby';

    const isMobileFullScreenMode = isMobile && !isCompact;

    const [year, setYear] = useState(filterValue.year ?? '');
    const [open, setOpen] = useState(initialOpenState);
    const [yearOpen, setYearOpen] = useState(false);
    const [showModerationPending, setShowModerationPending] = useState(filterValue.showModerationPending ?? false);
    const [allExpanded, setAllExpanded] = useState(false);

    const scrollRef = useRef(null);
    const yearInputRef = useRef(null);

    useEffect(() => {
        if (isSuperuser && scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: true });
        }
    }, [isSuperuser]);

    const groups = useMemo(() => [
        { label: 'Страны', field: 'countries', items: filters.countries ?? [], valKey: 'country_id', labelKey: 'title_ru', hidden: isTravelsByPage },
        { label: 'Категории', field: 'categories', items: filters.categories ?? [], valKey: 'id', labelKey: 'name' },
        { label: 'Объекты', field: 'categoryTravelAddress', items: filters.categoryTravelAddress ?? [], valKey: 'id', labelKey: 'name' },
        { label: 'Транспорт', field: 'transports', items: filters.transports ?? [], valKey: 'id', labelKey: 'name' },
        { label: 'Спутники', field: 'companions', items: filters.companions ?? [], valKey: 'id', labelKey: 'name' },
        { label: 'Сложность', field: 'complexity', items: filters.complexity ?? [], valKey: 'id', labelKey: 'name' },
        { label: 'Месяц', field: 'month', items: filters.month ?? [], valKey: 'id', labelKey: 'name' },
        { label: 'Ночлег', field: 'over_nights_stay', items: filters.over_nights_stay ?? [], valKey: 'id', labelKey: 'name' },
    ], [filters, isTravelsByPage]);

    const toggle = useCallback((field) => {
        setOpen((prev) => ({ ...prev, [field]: !prev[field] }));
    }, []);

    const handleCheckForField = useCallback((field) =>
        (id) => {
            const selected = filterValue[field] ?? [];
            const next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
            onSelectedItemsChange(field, next);
        }, [filterValue, onSelectedItemsChange]);

    const handleYearChange = useCallback((text) => {
        const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
        setYear(cleaned);
        if (cleaned.length === 4) debouncedApply();
    }, []);

    const apply = useCallback(() => {
        Keyboard.dismiss();
        handleApplyFilters({
            ...filterValue,
            year: year || undefined,
            showModerationPending,
        });
        if (isMobile && !disableApplyOnMobileClose) closeMenu();
    }, [filterValue, year, showModerationPending, isMobile, disableApplyOnMobileClose]);

    const debouncedApply = useMemo(() => debounce(apply, 300), [apply]);

    useEffect(() => {
        return () => {
            debouncedApply.cancel();
        };
    }, [debouncedApply]);

    const handleReset = () => {
        setYear('');
        setShowModerationPending(false);
        resetFilters();
        if (isMobile && !disableApplyOnMobileClose) closeMenu();
    };

    const handleToggleAll = () => {
        const newState = {};
        groups.forEach(({ field, hidden }) => {
            if (!hidden) newState[field] = !allExpanded;
        });
        setOpen(newState);
        setAllExpanded(!allExpanded);
    };

    const stackFooter = isMobile && width <= 500;

    return (
        <View style={[styles.root, isMobileFullScreenMode && styles.fullScreenMobile]}>
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={Platform.OS !== 'web'}
            >
                <View style={styles.content}>
                    {isSuperuser && (
                        <View style={styles.groupBox}>
                            <Text style={styles.groupLabel}>Модерация</Text>
                            <View style={styles.itemsBox}>
                                <Pressable
                                    onPress={() => setShowModerationPending(!showModerationPending)}
                                    style={[styles.checkboxRow, Platform.OS === 'web' && { cursor: 'pointer' }]}
                                >
                                    <Feather name={showModerationPending ? 'check-square' : 'square'} size={22} color="#4a7c59" />
                                    <Text style={styles.itemText}>Показать статьи на модерации</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    <Pressable style={[styles.toggleAllBtn, Platform.OS === 'web' && { cursor: 'pointer' }]} onPress={handleToggleAll}>
                        <Text style={styles.toggleAllText}>
                            {allExpanded ? 'Свернуть все' : 'Развернуть все'}
                        </Text>
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

                    <View style={styles.groupBox}>
                        <Pressable
                            style={[styles.groupHeader, Platform.OS === 'web' && { cursor: 'pointer' }]}
                            onPress={() => {
                                setYearOpen((v) => !v);
                                setTimeout(() => yearInputRef.current?.focus(), 100);
                            }}
                        >
                            <Text style={styles.groupLabel}>Год</Text>
                            <Feather name={yearOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
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
                                    />{year.length > 0 && (
                                    <Pressable onPress={() => setYear('')} style={styles.clearIcon}>
                                        <Feather name="x" size={16} color="#999" />
                                    </Pressable>
                                )}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, {
                paddingBottom: Math.max(insets.bottom, 24),
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 8,
            }]}>
                {isMobile && (
                    <Pressable style={[styles.btn, styles.close]} onPress={closeMenu}>
                        <Text style={styles.btnTxt}>Закрыть</Text>
                    </Pressable>
                )}

                <Pressable style={[styles.btn, styles.reset]} onPress={handleReset}>
                    <Text style={[styles.btnTxt, styles.resetTxt]}>Сбросить</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.apply]} onPress={apply}>
                    <Text style={styles.btnTxt}>Применить</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default memo(FiltersComponent);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    fullScreenMobile: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: '#fff',
    },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 8, paddingBottom: 16 },
    content: { paddingHorizontal: 8 },
    groupBox: { marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    groupLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    itemsBox: { paddingHorizontal: 12, paddingBottom: 8 },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 10,
    },
    itemText: {
        fontSize: 14,
        color: '#333',
    },
    yearBox: { paddingHorizontal: 12, paddingBottom: 8 },
    yearInputWrapper: {
        position: 'relative',
    },
    yearInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
        color: '#333',
    },
    clearIcon: {
        position: 'absolute',
        right: 8,
        top: '50%',
        marginTop: -8,
        padding: 4,
    },
    toggleAllBtn: {
        alignSelf: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 12,
    },
    toggleAllText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4a7c59',
    },
    footer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: { elevation: 8 },
        }),
    },
    btn: {
        flex: 1,
        minWidth: '30%',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    close: { backgroundColor: '#999' },
    reset: { backgroundColor: '#e0e0e0' },
    resetTxt: { color: '#333' },
    apply: { backgroundColor: '#4a7c59' },
    btnTxt: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
