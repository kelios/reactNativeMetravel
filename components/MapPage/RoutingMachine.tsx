import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface RoutingMachineProps {
    routePoints: [number, number][];
    transportMode: 'car' | 'bike' | 'foot';
    setRoutingLoading: (loading: boolean) => void;
    setErrors: (errors: any) => void;
    setRouteDistance: (distance: number) => void;
    setFullRouteCoords: (coords: [number, number][]) => void;
    ORS_API_KEY: string;
}

const getORSProfile = (mode: 'car' | 'bike' | 'foot') => {
    switch (mode) {
        case 'bike': return 'cycling-regular';
        case 'foot': return 'foot-walking';
        default: return 'driving-car';
    }
};

const RoutingMachine: React.FC<RoutingMachineProps> = ({
                                                           routePoints,
                                                           transportMode,
                                                           setRoutingLoading,
                                                           setErrors,
                                                           setRouteDistance,
                                                           setFullRouteCoords,
                                                           ORS_API_KEY,
                                                       }) => {
    const map = useMap();
    const routingControl = useRef<any>(null);

    const CustomRouter = useMemo(() => ({
        route: async (waypoints, callback, context) => {
            try {
                setRoutingLoading(true);

                const coordinates = waypoints.map((wp: any) => [wp.latLng.lng, wp.latLng.lat]);
                if (coordinates.length < 2) {
                    if (context && typeof callback === 'function') {
                        callback.call(context, new Error('Недостаточно точек для маршрута'), []);
                    }
                    return;
                }

                const response = await fetch(`https://api.openrouteservice.org/v2/directions/${getORSProfile(transportMode)}/geojson`, {
                    method: 'POST',
                    headers: {
                        Authorization: ORS_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ coordinates }),
                });

                if (!response.ok) {
                    if (context && typeof callback === 'function') {
                        callback.call(context, new Error('Ошибка маршрута (ORS)'), []);
                    }
                    return;
                }

                const data = await response.json();
                const geometry = data.features?.[0]?.geometry;
                const summary = data.features?.[0]?.properties?.summary;

                if (!geometry?.coordinates?.length) {
                    if (context && typeof callback === 'function') {
                        callback.call(context, new Error('Пустой маршрут'), []);
                    }
                    return;
                }

                setFullRouteCoords(geometry.coordinates);

                const latlngs = geometry.coordinates.map(([lng, lat]) => (window as any).L.latLng(lat, lng));

                const route = {
                    name: 'Маршрут',
                    coordinates: latlngs,
                    summary: {
                        totalDistance: summary?.distance || 0,
                        totalTime: summary?.duration || 0,
                    },
                    instructions: [],
                    waypoints,
                    inputWaypoints: waypoints,
                    properties: { isSimplified: false },
                };

                if (context && typeof callback === 'function') {
                    callback.call(context, null, [route]);
                }
            } catch (error) {
                if (context && typeof callback === 'function') {
                    try {
                        callback.call(context, error, []);
                    } catch (cbError) {
                        console.warn('Ошибка внутри callback после маршрута:', cbError);
                    }
                }
            } finally {
                setRoutingLoading(false);
            }
        }
    }), [ORS_API_KEY, transportMode]);

    useEffect(() => {
        const L = (window as any).L;
        if (!map || !L?.Routing?.control || !ORS_API_KEY) return;

        // 🧼 Очистка маршрута
        if (routingControl.current) {
            try {
                map.removeControl(routingControl.current);
            } catch (e) {
                console.warn('Ошибка при удалении маршрута:', e);
            }
            routingControl.current = null;
        }

        // ❌ Нет точек — очищаем ошибку и выходим
        if (routePoints.length < 2) {
            setErrors(prev => ({ ...prev, routing: false }));
            return;
        }

        try {
            routingControl.current = L.Routing.control({
                router: CustomRouter,
                waypoints: routePoints.map(([lng, lat]) => L.latLng(lat, lng)),
                addWaypoints: false,
                draggableWaypoints: false,
                createMarker: (i, wp) => {
                    const icon = new L.Icon({
                        iconUrl: require('@/assets/icons/start.ico'),
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        popupAnchor: [0, -40],
                    });
                    return L.marker(wp.latLng, { icon }).bindPopup(i === 0 ? 'Старт' : 'Финиш');
                },
                lineOptions: { color: '#3388ff', weight: 5, opacity: 0.8 },
                fitSelectedRoutes: true,
                show: false,
            });

            routingControl.current.on('routesfound', (e: any) => {
                const route = e.routes?.[0];
                if (route?.summary?.totalDistance) {
                    setRouteDistance(route.summary.totalDistance);
                }

                // ✅ Сброс ошибки при успехе
                setErrors(prev => ({ ...prev, routing: false }));

                if (!(window as any).disableFitBounds && route?.coordinates) {
                    map.fitBounds(L.latLngBounds(route.coordinates).pad(0.2));
                }

                (window as any).disableFitBounds = false;
            });

            routingControl.current.on('routingerror', e => {
                setErrors(prev => ({ ...prev, routing: e.error || true }));
            });

            routingControl.current.addTo(map);
        } catch (error) {
            console.error('Ошибка инициализации маршрута:', error);
            setErrors(prev => ({ ...prev, routing: error.message || true }));
        }

        return () => {
            if (routingControl.current && map) {
                try {
                    map.removeControl(routingControl.current);
                } catch (e) {
                    console.warn('Ошибка при удалении маршрута:', e);
                }
                routingControl.current = null;
            }
        };
    }, [map, routePoints, CustomRouter, ORS_API_KEY]);

    return null;
};

export default RoutingMachine;
