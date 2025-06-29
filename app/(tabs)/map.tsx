import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    useWindowDimensions,
    ActivityIndicator,
} from 'react-native';
import {Button, Icon} from 'react-native-elements';
import * as Location from 'expo-location';
import Head from "expo-router/head";

import FiltersPanel from '@/components/MapPage/FiltersPanel';
import MapPanel from '@/components/MapPage/MapPanel';
import TravelListPanel from '@/components/MapPage/TravelListPanel';
import {fetchFiltersMap, fetchTravelsForMap, fetchTravelsNearRoute} from '@/src/api/travels';

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface FilterValues {
    categories: string[];
    radius: string;
    address: string;
}

interface Filters {
    categories: { id: string; name: string }[];
    radius: { id: string; name: string }[];
    address: string;
}

const DEFAULT_COORDINATES = {latitude: 53.9006, longitude: 27.5590};

export default function MapScreen() {
    const {width} = useWindowDimensions();
    const isMobile = width <= 768;
    const styles = useMemo(() => getStyles(isMobile), [isMobile]);

    const [mode, setMode] = useState<'radius' | 'route'>('radius');
    const [filters, setFilters] = useState<Filters>({categories: [], radius: [], address: ''});
    const [filterValue, setFilterValue] = useState<FilterValues>({categories: [], radius: '', address: ''});
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

    // Request location permission and set coordinates
    useEffect(() => {
        let isMounted = true;

        const getLocation = async () => {
            try {
                const {status} = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    if (isMounted) setCoordinates(loc.coords);
                } else {
                    if (isMounted) setCoordinates(DEFAULT_COORDINATES);
                }
            } catch {
                if (isMounted) setCoordinates(DEFAULT_COORDINATES);
            }
        };

        getLocation();
        return () => {
            isMounted = false;
        };
    }, []);

    // Fetch filters data
    useEffect(() => {
        let isMounted = true;

        const fetchFiltersData = async () => {
            try {
                const newData = await fetchFiltersMap();
                if (isMounted && newData) {
                    setFilters({
                        categories: newData.categories || [],
                        radius: newData.radius || [],
                        address: ''
                    });
                }
            } catch (error) {
                console.error('Ошибка загрузки фильтров:', error);
            }
        };

        fetchFiltersData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Set default radius when filters are loaded
    useEffect(() => {
        if (filters.radius.length > 0 && !filterValue.radius) {
            setFilterValue(prev => ({...prev, radius: filters.radius[0].id}));
        }
    }, [filters.radius, filterValue.radius]);

    // Generate cache key based on current mode and parameters
    const getCacheKey = useCallback(() => {
        if (!coordinates) return '';
        return mode === 'route'
            ? `route:${JSON.stringify(fullRouteCoords)}`
            : `radius:${filterValue.radius}:${coordinates.latitude}:${coordinates.longitude}`;
    }, [mode, fullRouteCoords, filterValue.radius, coordinates]);

    // Fetch travels data based on current mode and filters
    useEffect(() => {
        if (!coordinates || (mode === 'radius' && !filterValue.radius)) return;

        let isMounted = true;
        const key = getCacheKey();

        const fetchData = async () => {
            try {
                // Return cached data if available
                if (dataCache.current[key]) {
                    if (isMounted) {
                        mode === 'route'
                            ? setPlacesAlongRoute(dataCache.current[key])
                            : setRawTravelsData(dataCache.current[key]);
                    }
                    return;
                }

                // Fetch new data based on mode
                let data = [];
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
            } catch (error) {
                console.error('Ошибка загрузки travels:', error);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [filterValue.radius, currentPage, itemsPerPage, fullRouteCoords, coordinates, mode, getCacheKey]);

    // Filter travels data based on selected categories and address
    useEffect(() => {
        const normalize = (str: string) => str.trim().toLowerCase();
        const selectedCategories = filterValue.categories.map(normalize);

        const filtered = (mode === 'route' ? placesAlongRoute : rawTravelsData).filter(travel => {
            const travelCategories = travel.categoryName?.split(',').map(normalize) || [];
            const categoryMatch = selectedCategories.length === 0 ||
                travelCategories.some(cat => selectedCategories.includes(cat));
            const addressMatch = !filterValue.address ||
                (travel.address && travel.address.toLowerCase().includes(filterValue.address.toLowerCase()));
            return categoryMatch && addressMatch;
        });

        setTravelsData(filtered);
    }, [filterValue.categories, filterValue.address, rawTravelsData, placesAlongRoute, mode]);

    const onFilterChange = useCallback((field: keyof FilterValues, value: any) => {
        setFilterValue(prev => ({...prev, [field]: value}));
    }, []);

    const onTextFilterChange = useCallback((value: string) => {
        setFilterValue(prev => ({...prev, address: value}));
    }, []);

    const resetFilters = useCallback(() => {
        dataCache.current = {};
        setFilterValue({
            radius: filters.radius[0]?.id || '',
            categories: [],
            address: ''
        });
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
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
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
            setRoutePoints(prev => [...prev, [lng, lat]]);
        }
    }, [routePoints.length, getAddressFromCoords]);

    const buildRouteTo = useCallback(async (dest: any) => {
        if (!coordinates) return;

        const [lat, lng] = dest.coord.split(',').map(Number);
        const destAddr = await getAddressFromCoords(lat, lng);

        (window as any).disableFitBounds = false;
        setRoutePoints([
            [coordinates.longitude, coordinates.latitude],
            [lng, lat],
        ]);
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
            <SafeAreaView style={styles.safeContainer}>
                <ActivityIndicator size="large" style={{marginTop: 50}}/>
                <Text style={{textAlign: 'center', marginTop: 16}}>Определяем ваше местоположение…</Text>
            </SafeAreaView>
        );
    }

    return (
        <>
            <Head>
                <title>Карта маршрутов | Metravel</title>
                <meta name="description"
                      content="Найдите интересные маршруты и места рядом с вами. Постройте маршрут или исследуйте локации поблизости на карте Metravel."/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta property="og:title" content="Карта маршрутов | Metravel"/>
                <meta property="og:description" content="Найдите интересные маршруты и места рядом с вами."/>
                <meta property="og:image" content="https://metravel.by/og-preview.jpg"/>
                <meta property="og:url" content="https://metravel.by/map"/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content="Карта маршрутов | Metravel"/>
                <meta name="twitter:description" content="Постройте маршрут или исследуйте точки поблизости."/>
                <meta name="twitter:image" content="https://metravel.by/og-preview.jpg"/>
            </Head>
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
                            <Button
                                icon={<Icon name="tune" type="material" color="#fff"/>}
                                onPress={() => setFiltersVisible(true)}
                                buttonStyle={styles.iconButton}
                            />
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
                                {routePoints.length > 1 && (
                                    <Button
                                        title="Очистить маршрут"
                                        onPress={clearRoute}
                                        buttonStyle={styles.iconButton}
                                    />
                                )}
                            </View>
                        )}

                        <View style={isMobile ? styles.mobileFloatingButton : styles.desktopFloatingButton}>
                            <Button
                                icon={
                                    <Icon
                                        name={infoVisible ? 'expand-more' : 'expand-less'}
                                        type="material"
                                        color="#fff"
                                    />
                                }
                                onPress={() => setInfoVisible(prev => !prev)}
                                buttonStyle={styles.iconButton}
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
        safeContainer: {flex: 1, backgroundColor: '#f2f4f7'},
        container: {flex: 1, padding: isMobile ? 8 : 16},
        mainContent: {flex: 1, flexDirection: isMobile ? 'column' : 'row', position: 'relative'},
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
        floatingTopLeftButton: {
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 999,
        },
        desktopFloatingButton: {
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 999,
        },
        mobileFloatingButton: {
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 999,
        },
        iconButton: {
            backgroundColor: 'rgba(75, 163, 163, 0.85)',
            borderRadius: 30,
            width: 52,
            height: 52,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.15,
            shadowRadius: 5,
            elevation: 4,
        },
    });