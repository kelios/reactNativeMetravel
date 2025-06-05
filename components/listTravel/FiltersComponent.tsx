import React, { useState, useMemo, useCallback, memo, useRef, useEffect } from 'react';
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

const FiltersComponent = ({
                              filters = {},
                              filterValue = {},
                              onSelectedItemsChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                              isSuperuser,
                          }) => {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { name } = useRoute();
    const isMobile = width <= 768;
    const isTravelsByPage = name === 'travelsby';

    const [year, setYear] = useState(filterValue.year ?? '');
    const [open, setOpen] = useState({});
    const [yearOpen, setYearOpen] = useState(false);
    const [showModerationPending, setShowModerationPending] = useState(filterValue.showModerationPending ?? false);

    const scrollRef = useRef(null);

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

    const handleCheck = useCallback((field, id) => {
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
        if (isMobile) closeMenu();
    }, [filterValue, year, showModerationPending, isMobile]);

    const debouncedApply = useMemo(() => debounce(apply, 300), [apply]);

    const handleReset = () => {
        setYear('');
        setShowModerationPending(false);
        resetFilters();
        if (isMobile) closeMenu();
    };

    return (
        <View style={styles.root}>
            <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 8 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {isSuperuser && (
                        <View style={styles.groupBox}>
                            <Text style={styles.groupLabel}>Модерация</Text>
                            <View style={styles.itemsBox}>
                                <Pressable onPress={() => setShowModerationPending(!showModerationPending)} style={styles.checkboxRow}>
                                    <Feather name={showModerationPending ? 'check-square' : 'square'} size={20} color="#4a7c59" />
                                    <Text style={styles.itemText}>Показать статьи на модерации</Text>
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {groups.map(({ label, field, items, valKey, labelKey, hidden }) =>
                        hidden ? null : (
                            <View key={field} style={styles.groupBox}>
                                <Pressable style={styles.groupHeader} onPress={() => toggle(field)}>
                                    <Text style={styles.groupLabel}>{label}</Text>
                                    <Feather name={open[field] ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
                                </Pressable>
                                {open[field] && (
                                    <View style={styles.itemsBox}>
                                        {items.map((it) => {
                                            const id = it[valKey];
                                            const title = it[labelKey];
                                            const checked = (filterValue[field] ?? []).includes(id);
                                            return (
                                                <Pressable
                                                    key={id}
                                                    style={styles.checkboxRow}
                                                    onPress={() => handleCheck(field, id)}
                                                >
                                                    <Feather
                                                        name={checked ? 'check-square' : 'square'}
                                                        size={20}
                                                        color="#4a7c59"
                                                    />
                                                    <Text style={styles.itemText}>{title}</Text>
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        )
                    )}

                    <View style={styles.groupBox}>
                        <Pressable style={styles.groupHeader} onPress={() => setYearOpen((v) => !v)}>
                            <Text style={styles.groupLabel}>Год</Text>
                            <Feather name={yearOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
                        </Pressable>
                        {yearOpen && (
                            <View style={styles.yearBox}>
                                <TextInput
                                    value={year}
                                    onChangeText={handleYearChange}
                                    placeholder="2023"
                                    keyboardType="numeric"
                                    maxLength={4}
                                    style={styles.yearInput}
                                    returnKeyType="done"
                                    onSubmitEditing={apply}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, {
                paddingBottom: Math.max(insets.bottom, 24),
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 10,
            }]}>
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
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 8, paddingBottom: 16 },
    content: { paddingHorizontal: 8 },
    groupBox: { marginBottom: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
    groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
    groupLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemsBox: { paddingHorizontal: 10, paddingBottom: 8 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
    itemText: { fontSize: 13, color: '#333' },
    yearBox: { paddingHorizontal: 10, paddingBottom: 8 },
    yearInput: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        fontSize: 14,
        color: '#333',
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
        minWidth: '48%',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reset: { backgroundColor: '#e0e0e0' },
    resetTxt: { color: '#333' },
    apply: { backgroundColor: '#4a7c59' },
    btnTxt: { fontSize: 14, fontWeight: '600', color: '#fff' },
});