// app/map/index.tsx
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    useWindowDimensions,
    ActivityIndicator,
    Pressable,
    Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as Location from 'expo-location';
import { usePathname } from 'expo-router';

import FiltersPanel from '@/components/MapPage/FiltersPanel';
import MapPanel from '@/components/MapPage/MapPanel';
import TravelListPanel from '@/components/MapPage/TravelListPanel';
import { fetchFiltersMap, fetchTravelsForMap, fetchTravelsNearRoute } from '@/src/api/travels';
import InstantSEO from '@/components/seo/InstantSEO';
import {useIsFocused} from "@react-navigation/native/src";

interface Coordinates { latitude: number; longitude: number }
interface FilterValues { categories: string[]; radius: string; address: string }
interface Filters {
    categories: { id: string; name: string }[];
    radius: { id: string; name: string }[];
    address: string;
}

const DEFAULT_COORDINATES = { latitude: 53.9006, longitude: 27.5590 };

/** ui buttons без HTML <button> */
const stylesBase = StyleSheet.create({
    iconButton: {
        backgroundColor: 'rgba(75, 163, 163, 0.85)',
        borderRadius: 30,
        width: 52,
        height: 52,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
    },
    pressed: { opacity: 0.85 },
    textButton: {
        backgroundColor: 'rgba(75, 163, 163, 0.85)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textButtonPressed: { opacity: 0.9 },
    textButtonLabel: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

const IconFab = ({ name, onPress, style }: { name: string; onPress: () => void; style?: any }) => (
    <Pressable onPress={onPress} accessibilityRole="button"
               style={({ pressed }) => [stylesBase.iconButton, style, pressed && stylesBase.pressed]}>
        <Icon name={name} type="material" color="#fff" />
    </Pressable>
);

const TextButton = ({ title, onPress }: { title: string; onPress: () => void }) => (
    <Pressable onPress={onPress} accessibilityRole="button"
               style={({ pressed }) => [stylesBase.textButton, pressed && stylesBase.textButtonPressed]}>
        <Text style={stylesBase.textButtonLabel}>{title}</Text>
    </Pressable>
);

export default function MapScreen() {
    const pathname = usePathname();
    const isFocused = useIsFocused();
    const SITE = process.env.EXPO_PUBLIC_SITE_URL || 'https://metravel.by';

    // memo чтобы не мигал canonical
    const canonical = useMemo(() => `${SITE}${pathname || '/map'}`, [SITE, pathname]);

    const { width } = useWindowDimensions();
    const isMobile = width <= 768;
    const styles = useMemo(() => getStyles(isMobile), [isMobile]);

    const [mode, setMode] = useState<'radius' | 'route'>('radius');
    const [filters, setFilters] = useState<Filters>({ categories: [], radius: [], address: '' });
    const [filterValue, setFilterValue] = useState<FilterValues>({ categories: [], radius: '', address: '' });
    const [rawTravelsData, setRawTravelsData] = useState<any[]>([]);
    const [travelsData, setTravelsData] = useState<any[]>([]);
    const [placesAlongRoute, setPlacesAlongRoute] = useState<any[]>([]);
    const [fullRouteCoords, setFullRouteCoords] = useState<[number, number][]>([]);

    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
    const [routeDistance, setRouteDistance] = useState<number | null>(null);
    const [startAddress, setStartAddress] = useState('');
    const [endAddress, setEndAddress] = useState('');
    const [transportMode, setTransportMode] = useState<'car' | 'bike' | 'foot'>('car');

    const [filtersVisible, setFiltersVisible] = useState(!isMobile);
    const [infoVisible, setInfoVisible] = useState(!isMobile);

    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(30);

    const dataCache = useRef<Record<string, any[]>>({});

    // геолокация
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    if (isMounted) setCoordinates(loc.coords);
                } else {
                    if (isMounted) setCoordinates(DEFAULT_COORDINATES);
                }
            } catch {
                if (isMounted) setCoordinates(DEFAULT_COORDINATES);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    // фильтры
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const newData = await fetchFiltersMap();
                if (isMounted && newData) {
                    setFilters({
                        categories: newData.categories || [],
                        radius: newData.radius || [],
                        address: '',
                    });
                }
            } catch (e) {
                console.error('Ошибка загрузки фильтров:', e);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (filters.radius.length > 0 && !filterValue.radius) {
            setFilterValue((prev) => ({ ...prev, radius: filters.radius[0].id }));
        }
    }, [filters.radius, filterValue.radius]);

    const getCacheKey = useCallback(() => {
        if (!coordinates) return '';
        return mode === 'route'
            ? `route:${JSON.stringify(fullRouteCoords)}`
            : `radius:${filterValue.radius}:${coordinates.latitude}:${coordinates.longitude}`;
    }, [mode, fullRouteCoords, filterValue.radius, coordinates]);

    // данные
    useEffect(() => {
        if (!coordinates || (mode === 'radius' && !filterValue.radius)) return;
        let isMounted = true;
        const key = getCacheKey();

        (async () => {
            try {
                if (dataCache.current[key]) {
                    if (isMounted) {
                        mode === 'route'
                            ? setPlacesAlongRoute(dataCache.current[key])
                            : setRawTravelsData(dataCache.current[key]);
                    }
                    return;
                }
                let data: any[] = [];
                if (mode === 'route' && fullRouteCoords.length >= 2) {
                    data = await fetchTravelsNearRoute(fullRouteCoords, 20000);
                } else {
                    data = await fetchTravelsForMap(currentPage, itemsPerPage, {
                        radius: filterValue.radius,
                        lat: coordinates.latitude,
                        lng: coordinates.longitude,
                    });
                }
                if (isMounted) {
                    if (mode === 'route') {
                        setPlacesAlongRoute(data);
                        setRawTravelsData([]);
                    } else {
                        setRawTravelsData(data);
                        setPlacesAlongRoute([]);
                    }
                    dataCache.current[key] = data;
                }
            } catch (e) {
                console.error('Ошибка загрузки travels:', e);
            }
        })();

        return () => { isMounted = false; };
    }, [filterValue.radius, currentPage, itemsPerPage, fullRouteCoords, coordinates, mode, getCacheKey]);

    // фильтрация
    useEffect(() => {
        const normalize = (s: string) => s.trim().toLowerCase();
        const selected = filterValue.categories.map(normalize);

        const source = mode === 'route' ? placesAlongRoute : rawTravelsData;
        const filtered = source.filter((t: any) => {
            const cats = (t.categoryName || '').split(',').map(normalize);
            const matchCat = selected.length === 0 || cats.some((c: string) => selected.includes(c));
            const matchAddr = !filterValue.address || (t.address && t.address.toLowerCase().includes(filterValue.address.toLowerCase()));
            return matchCat && matchAddr;
        });

        setTravelsData(filtered);
    }, [filterValue.categories, filterValue.address, rawTravelsData, placesAlongRoute, mode]);

    const onFilterChange = useCallback((field: keyof FilterValues, value: any) => {
        setFilterValue((p) => ({ ...p, [field]: value }));
    }, []);
    const onTextFilterChange = useCallback((value: string) => {
        setFilterValue((p) => ({ ...p, address: value }));
    }, []);

    const resetFilters = useCallback(() => {
        dataCache.current = {};
        setFilterValue({ radius: filters.radius[0]?.id || '', categories: [], address: '' });
        setStartAddress('');
        setEndAddress('');
        setRoutePoints([]);
        setPlacesAlongRoute([]);
        setRouteDistance(null);
        setFullRouteCoords([]);
        setTravelsData([]);
    }, [filters.radius]);

    const getAddressFromCoords = useCallback(async (lat: number, lng: number) => {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const d = await r.json();
            return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        }
    }, []);

    const handleMapClick = useCallback(async (lng: number, lat: number) => {
        const addr = await getAddressFromCoords(lat, lng);
        if (routePoints.length >= 2) {
            setStartAddress(addr);
            setEndAddress('');
            setRoutePoints([[lng, lat]]);
        } else if (routePoints.length === 0) {
            setStartAddress(addr);
            setRoutePoints([[lng, lat]]);
        } else {
            setEndAddress(addr);
            setRoutePoints((prev) => [...prev, [lng, lat]]);
        }
    }, [routePoints.length, getAddressFromCoords]);

    const buildRouteTo = useCallback(async (dest: any) => {
        if (!coordinates) return;
        const [lat, lng] = dest.coord.split(',').map(Number);
        const destAddr = await getAddressFromCoords(lat, lng);
        (window as any).disableFitBounds = false;
        setRoutePoints([[coordinates.longitude, coordinates.latitude], [lng, lat]]);
        setStartAddress('Моё местоположение');
        setEndAddress(destAddr);
        setMode('route');
    }, [coordinates, getAddressFromCoords]);

    const clearRoute = useCallback(() => {
        setRoutePoints([]);
        setPlacesAlongRoute([]);
        setMode('radius');
        setStartAddress('');
        setEndAddress('');
        setRouteDistance(null);
        setFullRouteCoords([]);
    }, []);

    if (!coordinates) {
        return (
            <>
                {isFocused && (
                <InstantSEO
                    headKey="map"
                    title="Карта маршрутов | Metravel"
                    description="Найдите интересные маршруты и места рядом с вами. Постройте маршрут или исследуйте локации поблизости на карте Metravel."
                    canonical={canonical}
                    image={`${SITE}/og-preview.jpg`}
                    ogType="website"
                />
                )}
                <SafeAreaView style={styles.safeContainer}>
                    <ActivityIndicator size="large" style={{ marginTop: 50 }} />
                    <Text style={{ textAlign: 'center', marginTop: 16 }}>Определяем ваше местоположение…</Text>
                </SafeAreaView>
            </>
        );
    }

    return (
        <>
            {isFocused && (
            <InstantSEO
                headKey="map"
                title="Карта маршрутов | Metravel"
                description="Найдите интересные маршруты и места рядом с вами. Постройте маршрут или исследуйте локации поблизости на карте Metravel."
                canonical={canonical}
                image={`${SITE}/og-preview.jpg`}
                ogType="website"
            />
            )}
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.container}>
                    {filtersVisible ? (
                        <FiltersPanel
                            filters={filters}
                            filterValue={filterValue}
                            onFilterChange={onFilterChange}
                            onTextFilterChange={onTextFilterChange}
                            resetFilters={resetFilters}
                            travelsData={rawTravelsData}
                            isMobile={isMobile}
                            closeMenu={() => setFiltersVisible(false)}
                            startAddress={startAddress}
                            endAddress={endAddress}
                            transportMode={transportMode}
                            setTransportMode={setTransportMode}
                            mode={mode}
                            setMode={setMode}
                            routeDistance={routeDistance}
                        />
                    ) : (
                        <View style={styles.floatingTopLeftButton}>
                            <IconFab name="tune" onPress={() => setFiltersVisible(true)} />
                        </View>
                    )}

                    <View style={styles.mainContent}>
                        <MapPanel
                            travelsData={mode === 'route' ? placesAlongRoute : travelsData}
                            coordinates={coordinates}
                            routePoints={routePoints}
                            placesAlongRoute={placesAlongRoute}
                            mode={mode}
                            setRoutePoints={setRoutePoints}
                            onMapClick={handleMapClick}
                            transportMode={transportMode}
                            setRouteDistance={setRouteDistance}
                            setFullRouteCoords={setFullRouteCoords}
                        />

                        {infoVisible && (
                            <View style={isMobile ? styles.mobileInfoPanel : styles.desktopInfoPanel}>
                                <TravelListPanel
                                    travelsData={mode === 'route' ? placesAlongRoute : travelsData}
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    itemsPerPageOptions={[10, 20, 30, 50, 100]}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    buildRouteTo={buildRouteTo}
                                />
                                {routePoints.length > 1 && <TextButton title="Очистить маршрут" onPress={clearRoute} />}
                            </View>
                        )}

                        <View style={isMobile ? styles.mobileFloatingButton : styles.desktopFloatingButton}>
                            <IconFab
                                name={infoVisible ? 'expand-more' : 'expand-less'}
                                onPress={() => setInfoVisible((p) => !p)}
                            />
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
}

const getStyles = (isMobile: boolean) =>
    StyleSheet.create({
        safeContainer: { flex: 1, backgroundColor: '#f2f4f7' },
        container: { flex: 1, padding: isMobile ? 8 : 16 },
        mainContent: { flex: 1, flexDirection: isMobile ? 'column' : 'row', position: 'relative' },
        desktopInfoPanel: {
            width: 380,
            marginLeft: 12,
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 12,
            elevation: 3,
        },
        mobileInfoPanel: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '60%',
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 12,
        },
        floatingTopLeftButton: { position: 'absolute', top: 20, right: 20, zIndex: 999 },
        desktopFloatingButton: { position: 'absolute', top: 20, right: 20, zIndex: 999 },
        mobileFloatingButton: { position: 'absolute', bottom: 20, right: 20, zIndex: 999 },
    });