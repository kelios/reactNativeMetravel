import React, { useState, useCallback, useMemo, memo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    TextInput,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

function FiltersComponent({
                              filters = {},
                              filterValue = {},
                              onSelectedItemsChange,
                              handleApplyFilters,
                              resetFilters,
                              closeMenu,
                              isSuperuser,
                          }) {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isMobile = width <= 768;
    const { name } = useRoute();
    const isTravelsByPage = name === 'travelsby';

    /* -------------------------------- groups ------------------------------- */
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

    /* ------------------------------ local state ---------------------------- */
    const [open, setOpen] = useState(() => groups.reduce((acc, g) => ({ ...acc, [g.field]: false }), {}));
    const [yearOpen, setYearOpen] = useState(false);
    const [year, setYear] = useState(filterValue.year ?? '');

    /* ------------------------------ handlers ------------------------------- */
    const toggle = useCallback((f) => setOpen((p) => ({ ...p, [f]: !p[f] })), []);

    const handleCheck = useCallback((field, id) => {
        const selected = filterValue[field] ?? [];
        const nextArr = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
        onSelectedItemsChange(field, nextArr);
    }, [filterValue, onSelectedItemsChange]);

    const handleYearChange = useCallback((txt) => {
        const val = txt.replace(/[^0-9]/g, '').slice(0, 4);
        setYear(val);
    }, []);

    const applyYear = useCallback(() => handleApplyFilters({ ...filterValue, year: year || undefined }), [handleApplyFilters, filterValue, year]);

    const handleReset = useCallback(() => {
        setYear('');
        resetFilters();
        if (isMobile) closeMenu();
    }, [resetFilters, isMobile, closeMenu]);

    /* -------------------------------- render ------------------------------- */
    return (
        <View style={styles.root}>
            {/* scrollable content to fit mobile height */}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
                {groups.map(({ label, field, items, valKey, labelKey, hidden }) => hidden ? null : (
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
                                        <CheckBox
                                            key={id}
                                            title={title}
                                            checked={checked}
                                            onPress={() => handleCheck(field, id)}
                                            containerStyle={styles.itemCheckbox}
                                            textStyle={styles.itemText}
                                            checkedColor="#4a7c59"
                                            uncheckedColor="#4a7c59"
                                        />
                                    );
                                })}
                            </View>
                        )}
                    </View>
                ))}

                {/* Year picker */}
                <View style={styles.groupBox}>
                    <Pressable style={styles.groupHeader} onPress={() => setYearOpen((v) => !v)}>
                        <Text style={styles.groupLabel}>Год</Text>
                        <Feather name={yearOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
                    </Pressable>
                    {yearOpen && (
                        <View style={styles.yearBox}>
                            <TextInput
                                style={styles.yearInput}
                                value={year}
                                onChangeText={handleYearChange}
                                placeholder="2023"
                                keyboardType="numeric"
                                maxLength={4}
                                returnKeyType="done"
                                onSubmitEditing={applyYear}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* footer buttons */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }] }>
                <Pressable style={[styles.btn, styles.reset]} onPress={handleReset}><Text style={styles.btnTxt}>Сбросить</Text></Pressable>
                <Pressable style={[styles.btn, styles.apply]} onPress={() => handleApplyFilters({ ...filterValue, year: year || undefined })}><Text style={styles.btnTxt}>Применить</Text></Pressable>
            </View>
        </View>
    );
}

export default memo(FiltersComponent);

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 },
    groupBox: { marginBottom: 6 },
    groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    groupLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
    itemsBox: { paddingLeft: 4, paddingBottom: 4 },
    itemCheckbox: { backgroundColor: 'transparent', borderWidth: 0, paddingVertical: 2, margin: 0 },
    itemText: { fontSize: 14, color: '#333' },
    yearBox: { paddingLeft: 4, paddingBottom: 4 },
    yearInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6, width: 100, fontSize: 15, color: '#333' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
    btn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8, justifyContent: 'center' },
    reset: { backgroundColor: '#e0e0e0', marginRight: 8 },
    apply: { backgroundColor: '#4a7c59' },
    btnTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
