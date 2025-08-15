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

const GroupBoxItem = memo(({ id, title, checked, onPress }) => (
    <Pressable
        style={[styles.checkboxRow, Platform.OS === 'web' && { cursor: 'pointer' }]}
        onPress={onPress}
        aria-pressed={checked}
        role="checkbox"
        accessibilityLabel={title}
        accessibilityState={{ checked }}
    >
        <Feather
            name={checked ? 'check-square' : 'square'}
            size={22}
            color="#4a7c59"
        />
        <Text style={styles.itemText}>{title}</Text>
    </Pressable>
));

const GroupBox = memo(({ label, field, items, valKey, labelKey, filterValue, handleCheckForField, open, toggle }) => {
    const selectedItems = filterValue[field] ?? [];

    return (
        <View style={styles.groupBox}>
            <Pressable
                style={[styles.groupHeader, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() => toggle(field)}
                aria-expanded={open}
                accessibilityLabel={label}
            >
                <Text style={styles.groupLabel}>{label}</Text>
                <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
            </Pressable>
            {open && (
                <View style={styles.itemsBox}>
                    {items.map((it) => {
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

    const isMobile = useMemo(() => width <= 768, [width]);
    const isMobileFullScreenMode = useMemo(() => isMobile && !isCompact, [isMobile, isCompact]);
    const isTravelsByPage = useMemo(() => name === 'travelsby', [name]);
    const stackFooter = useMemo(() => isMobile && width <= 500, [isMobile, width]);

    const [year, setYear] = useState(filterValue.year ?? '');
    const [open, setOpen] = useState(initialOpenState);
    const [yearOpen, setYearOpen] = useState(false);
    const [allExpanded, setAllExpanded] = useState(false);

    const scrollRef = useRef(null);
    const yearInputRef = useRef(null);

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
        setOpen(prev => ({ ...prev, [field]: !prev[field] }));
    }, []);

    const handleCheckForField = useCallback((field) => (id) => {
        const selected = filterValue[field] ?? [];
        const next = selected.includes(id)
            ? selected.filter(v => v !== id)
            : [...selected, id];
        onSelectedItemsChange(field, next);
    }, [filterValue, onSelectedItemsChange]);

    const apply = useCallback(() => {
        Keyboard.dismiss();

        const cleanedFilterValue = Object.fromEntries(
            Object.entries(filterValue).map(([key, value]) => {
                if (Array.isArray(value) && value.length === 0) {
                    return [key, undefined];
                }
                return [key, value];
            })
        );

        handleApplyFilters({
            ...cleanedFilterValue,
            year: year || undefined,
        });

        if (isMobile && !disableApplyOnMobileClose) closeMenu();
    }, [filterValue, year, isMobile, disableApplyOnMobileClose, handleApplyFilters, closeMenu]);

    const debouncedApply = useMemo(() => debounce(apply, 300), [apply]);

    const handleYearChange = useCallback((text) => {
        const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
        setYear(cleaned);
        if (cleaned.length === 4) debouncedApply();
    }, [debouncedApply]);

    const handleReset = useCallback(() => {
        setYear('');
        resetFilters();
        if (isMobile && !disableApplyOnMobileClose) closeMenu();
    }, [isMobile, disableApplyOnMobileClose, resetFilters, closeMenu]);

    const handleToggleAll = useCallback(() => {
        const newState = {};
        groups.forEach(({ field, hidden }) => {
            if (!hidden) newState[field] = !allExpanded;
        });
        setOpen(newState);
        setAllExpanded(!allExpanded);
    }, [groups, allExpanded]);

    useEffect(() => {
        return () => debouncedApply.cancel();
    }, [debouncedApply]);

    const renderModerationCheckbox = useMemo(() => (
        isSuperuser && (
            <View style={styles.groupBox}>
                <Text style={styles.groupLabel}>Модерация</Text>
                <View style={styles.itemsBox}>
                    <Pressable
                        onPress={() => onSelectedItemsChange('showModerationPending', !filterValue.showModerationPending)}
                        style={[styles.checkboxRow, Platform.OS === 'web' && { cursor: 'pointer' }]}
                        aria-pressed={filterValue.showModerationPending}
                        role="checkbox"
                        accessibilityLabel="Показать статьи на модерации"
                        accessibilityState={{ checked: filterValue.showModerationPending }}
                    >
                        <Feather name={filterValue.showModerationPending ? 'check-square' : 'square'} size={22} color="#4a7c59" />
                        <Text style={styles.itemText}>Показать статьи на модерации</Text>
                    </Pressable>
                </View>
            </View>
        )
    ), [isSuperuser, filterValue, onSelectedItemsChange]);

    const renderFooter = useMemo(() => (
        <View style={[styles.footer, {
            paddingBottom: Math.max(insets.bottom, 24),
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 8,
        }]}>
            {isMobile && (
                <Pressable
                    style={[styles.btn, { flex: 1 }, styles.close]}
                    onPress={closeMenu}
                    accessibilityLabel="Закрыть фильтры"
                >
                    <Text style={styles.btnTxt}>Закрыть</Text>
                </Pressable>
            )}
            <Pressable
                style={[styles.btn, { flex: 1 }, styles.reset]}
                onPress={handleReset}
                accessibilityLabel="Сбросить фильтры"
            >
                <Text style={[styles.btnTxt, styles.resetTxt]}>Сбросить</Text>
            </Pressable>
            <Pressable
                style={[styles.btn, { flex: 1 }, styles.apply]}
                onPress={apply}
                accessibilityLabel="Применить фильтры"
            >
                <Text style={styles.btnTxt}>Применить</Text>
            </Pressable>
        </View>
    ), [isMobile, insets.bottom, closeMenu, handleReset, apply]);

    const renderYearInput = useMemo(() => (
        <View style={styles.groupBox}>
            <Pressable
                style={[styles.groupHeader, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() => {
                    setYearOpen(v => !v);
                    setTimeout(() => yearInputRef.current?.focus(), 100);
                }}
                aria-expanded={yearOpen}
                accessibilityLabel="Фильтр по году"
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
                            accessibilityLabel="Введите год"
                        />
                        {year.length > 0 && (
                            <Pressable onPress={() => setYear('')} style={styles.clearIcon} accessibilityLabel="Очистить год">
                                <Feather name="x" size={16} color="#999" />
                            </Pressable>
                        )}
                    </View>
                </View>
            )}
        </View>
    ), [yearOpen, year, handleYearChange, apply]);

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
                    {renderModerationCheckbox}

                    <Pressable
                        style={[styles.toggleAllBtn, Platform.OS === 'web' && { cursor: 'pointer' }]}
                        onPress={handleToggleAll}
                        accessibilityLabel={allExpanded ? 'Свернуть все фильтры' : 'Развернуть все фильтры'}
                    >
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

                    {renderYearInput}
                </View>
            </ScrollView>

            {renderFooter}
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
