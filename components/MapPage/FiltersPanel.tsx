// FiltersPanel.tsx
import React, {
    useMemo,
    useState,
    useRef,
    useCallback,
    useEffect,
} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import MultiSelectField from '../MultiSelectField';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RadiusSelect from '@/components/MapPage/RadiusSelect';

const DEBOUNCE_MS = 300;

const SEARCH_MODES = [
    { key: 'radius' as const, icon: 'my-location', label: 'По радиусу' },
    { key: 'route' as const, icon: 'alt-route', label: 'По маршруту' },
];

const TRANSPORT_MODES = [
    { key: 'car' as const, icon: 'directions-car', label: 'Авто' },
    { key: 'foot' as const, icon: 'directions-walk', label: 'Пешком' },
    { key: 'bike' as const, icon: 'directions-bike', label: 'Вело' },
];

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FiltersPanelProps {
    filters: {
        categories: { id: number; name: string }[];
        radius: { id: string; label: string }[];
        address: string;
    };
    filterValue: {
        categories: string[];
        radius: string;
        address: string;
    };
    onFilterChange: (field: string, value: any) => void;
    onTextFilterChange: (value: string) => void;
    resetFilters: () => void;
    travelsData: {
        categoryName?: string;
    }[];
    isMobile: boolean;
    closeMenu: () => void;
    mode: 'radius' | 'route';
    setMode: (m: 'radius' | 'route') => void;
    transportMode: 'car' | 'bike' | 'foot';
    setTransportMode: (m: 'car' | 'bike' | 'foot') => void;
    startAddress: string;
    endAddress: string;
    routeDistance: number | null;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
                                                       filters,
                                                       filterValue,
                                                       onFilterChange,
                                                       onTextFilterChange,
                                                       resetFilters,
                                                       travelsData,
                                                       isMobile,
                                                       closeMenu,
                                                       mode,
                                                       setMode,
                                                       transportMode,
                                                       setTransportMode,
                                                       startAddress,
                                                       endAddress,
                                                       routeDistance,
                                                   }) => {
    const styles = useMemo(() => getStyles(isMobile), [isMobile]);

    const travelCategoriesCount = useMemo(() => {
        const count: Record<string, number> = {};
        travelsData.forEach((t) =>
            t.categoryName
                ?.split(',')
                .map((s) => s.trim())
                .forEach((cat) => {
                    count[cat] = (count[cat] || 0) + 1;
                })
        );
        return count;
    }, [travelsData]);

    const categoriesWithCount = useMemo(
        () =>
            filters.categories
                .map((c) => {
                    const name = c.name.trim();
                    if (!travelCategoriesCount[name]) return null;
                    return {
                        ...c,
                        label: `${name} (${travelCategoriesCount[name]})`,
                        value: name,
                    };
                })
                .filter(Boolean) as { id: number; label: string; value: string }[],
        [filters.categories, travelCategoriesCount]
    );

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const handleAddressChange = useCallback(
        (val: string) => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(
                () => onTextFilterChange(val),
                DEBOUNCE_MS
            );
        },
        [onTextFilterChange]
    );

    useEffect(
        () => () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        },
        []
    );

    const handleSetMode = useCallback(
        (m: 'radius' | 'route') => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setMode(m);
        },
        [setMode]
    );

    return (
        <View style={styles.card}>
            <View style={styles.tabsWithReset}>
                <View style={styles.tabsContainer}>
                    {SEARCH_MODES.map(({ key, icon, label }) => (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.tabButton,
                                mode === key && styles.tabButtonActive,
                            ]}
                            onPress={() => handleSetMode(key)}
                            activeOpacity={0.7}
                        >
                            <Icon
                                name={icon}
                                size={20}
                                color={mode === key ? '#fff' : '#555'}
                                style={styles.tabIcon}
                            />
                            <Text
                                adjustsFontSizeToFit
                                style={[
                                    styles.tabText,
                                    mode === key && styles.tabTextActive,
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    title="Сбросить"
                    onPress={resetFilters}
                    buttonStyle={styles.smallResetButton}
                    titleStyle={styles.smallResetButtonText}
                    icon={<Icon name="refresh" size={16} color="#fff" />}
                    iconRight
                />
            </View>

            {mode === 'radius' ? (
                <View style={styles.filtersRow}>
                    {!!categoriesWithCount.length ? (
                        <View style={styles.filterField}>
                            <MultiSelectField
                                label="Категории"
                                items={categoriesWithCount}
                                value={filterValue.categories}
                                onChange={(v) => onFilterChange('categories', v)}
                                labelField="label"
                                valueField="value"
                                placeholder="Выберите категории"
                                compact
                                renderSelectedItem={() => <View />}
                            />
                            {!!filterValue.categories.length && (
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.chipsContainer}
                                >
                                    {filterValue.categories.map((cat) => (
                                        <View key={cat} style={styles.categoryChip}>
                                            <Text style={styles.categoryChipText}>{cat}</Text>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    onFilterChange(
                                                        'categories',
                                                        filterValue.categories.filter((c) => c !== cat)
                                                    )
                                                }
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Icon name="close" size={16} color="#4a8c8c" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    ) : (
                        <Text style={styles.emptyState}>Нет категорий для отображения</Text>
                    )}

                    {!!filters.radius.length && (
                        <View style={styles.filterField}>
                            <Text style={styles.label}>Радиус</Text>
                            <RadiusSelect
                                value={filterValue.radius}
                                options={filters.radius}
                                onChange={(v) => onFilterChange('radius', v)}
                            />
                        </View>
                    )}

                    <View style={styles.filterField}>
                        <Text style={styles.label}>Адрес</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите адрес"
                            placeholderTextColor="#aaa"
                            defaultValue={filterValue.address}
                            onChangeText={handleAddressChange}
                        />
                    </View>
                </View>
            ) : (
                <View style={styles.filtersRow}>
                    <View style={styles.filterField}>
                        <Text style={styles.label}>Транспорт</Text>
                        <View style={styles.transportTabs}>
                            {TRANSPORT_MODES.map(({ key, icon, label }) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.transportButton,
                                        transportMode === key && styles.transportButtonActive,
                                    ]}
                                    onPress={() => setTransportMode(key)}
                                    activeOpacity={0.7}
                                >
                                    <Icon
                                        name={icon}
                                        size={18}
                                        color={transportMode === key ? '#fff' : '#555'}
                                        style={styles.tabIcon}
                                    />
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            styles.transportButtonText,
                                            transportMode === key && styles.transportButtonTextActive,
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filterField}>
                        <Text style={styles.label}>Точка старта</Text>
                        <Text
                            style={startAddress ? styles.infoText : styles.infoPlaceholder}
                        >
                            {startAddress || 'Не выбрано'}
                        </Text>
                    </View>
                    <View style={styles.filterField}>
                        <Text style={styles.label}>Точка финиша</Text>
                        <Text
                            style={endAddress ? styles.infoText : styles.infoPlaceholder}
                        >
                            {endAddress || 'Не выбрано'}
                        </Text>
                    </View>
                    <View style={styles.filterField}>
                        <Text style={styles.label}>Дистанция</Text>
                        <Text
                            style={
                                routeDistance != null
                                    ? styles.infoText
                                    : styles.infoPlaceholder
                            }
                        >
                            {routeDistance != null
                                ? `${(routeDistance / 1000).toFixed(1)} км`
                                : '—'}
                        </Text>
                    </View>
                </View>
            )}

            {isMobile && (
                <View style={styles.actions}>
                    <Button
                        title="Закрыть"
                        onPress={closeMenu}
                        buttonStyle={styles.closeButton}
                        titleStyle={styles.closeButtonText}
                        icon={<Icon name="close" size={18} color="#fff" />}
                    />
                </View>
            )}
        </View>
    );
};

const getStyles = (isMobile: boolean) =>
    StyleSheet.create({
        card: {
            backgroundColor: '#ffffff',
            borderRadius: 20,
            padding: 16,
            marginBottom: 20,
            marginHorizontal: isMobile ? 12 : 0,
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 4,
        },
        tabsWithReset: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 24,
        },
        tabsContainer: {
            flexDirection: 'row',
            backgroundColor: '#f5f7fa',
            borderRadius: 12,
            overflow: 'hidden',
            flex: 1,
        },
        tabButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
        },
        tabButtonActive: {
            backgroundColor: '#4a8c8c',
        },
        tabText: {
            fontSize: 15,
            color: '#555',
            fontWeight: '600',
        },
        tabTextActive: {
            color: '#fff',
        },
        tabIcon: {
            marginRight: 6,
        },
        smallResetButton: {
            backgroundColor: '#ef5350',
            borderRadius: 12,
            height: 42,
            paddingHorizontal: 12,
        },
        smallResetButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        filtersRow: {
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: isMobile ? 16 : 24,
        },
        filterField: {
            flex: 1,
            minWidth: isMobile ? '100%' : 220,
        },
        label: {
            fontSize: 14,
            fontWeight: '700',
            marginBottom: 6,
            color: '#333',
        },
        input: {
            height: 46,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 12,
            paddingHorizontal: 14,
            fontSize: 15,
            backgroundColor: '#fff',
            color: '#333',
        },
        infoText: {
            fontSize: 15,
            fontWeight: '600',
            color: '#333',
            marginTop: 6,
        },
        infoPlaceholder: {
            fontSize: 15,
            color: '#bbb',
            marginTop: 6,
        },
        chipsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 10,
            maxHeight: 120,
        },
        categoryChip: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#e0f7f7',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
        },
        categoryChipText: {
            color: '#4a8c8c',
            marginRight: 6,
            fontSize: 13,
            fontWeight: '600',
        },
        transportTabs: {
            flexDirection: 'row',
            borderRadius: 12,
            backgroundColor: '#f0f0f0',
            overflow: 'hidden',
        },
        transportButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 46,
        },
        transportButtonActive: {
            backgroundColor: '#4a8c8c',
        },
        transportButtonText: {
            fontSize: 14,
            color: '#555',
            fontWeight: '600',
        },
        transportButtonTextActive: {
            color: '#fff',
        },
        emptyState: {
            fontSize: 15,
            color: '#999',
            marginVertical: 20,
            textAlign: 'center',
        },
        actions: {
            marginTop: 24,
        },
        closeButton: {
            backgroundColor: '#4a8c8c',
            borderRadius: 12,
            height: 50,
        },
        closeButtonText: {
            fontSize: 15,
            fontWeight: '700',
        },
    });

export default React.memo(FiltersPanel);
