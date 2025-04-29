// --- RoutingMachine.tsx ---

import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface RoutingMachineProps {
    routePoints: [number, number][];
    transportMode: 'car' | 'bike' | 'foot';
    setRoutingLoading: (loading: boolean) => void;
    setErrors: (errors: any) => void;
    setRouteDistance: (distance: number) => void;
    setFullRouteCoords: (coords: [number, number][]) => void; // ✅ добавлено
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
    const isMounted = useRef(true);


    const CustomRouter = useMemo(() => ({
        route: async (waypoints, callback, context, options) => {
            try {
                setRoutingLoading(true);

                let coordinates = waypoints.map((wp) => [wp.latLng.lng, wp.latLng.lat]);
                coordinates = coordinates.filter((coord, index, arr) =>
                    index === 0 || coord[0] !== arr[index - 1][0] || coord[1] !== arr[index - 1][1]
                );

                if (coordinates.length < 2) return callback?.call(context, new Error('Not enough points for route'), []);

                const response = await fetch(`https://api.openrouteservice.org/v2/directions/${getORSProfile(transportMode)}/geojson`, {
                    method: 'POST',
                    headers: {
                        Authorization: ORS_API_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ coordinates }),
                });

                if (!response.ok) return callback?.call(context, new Error('Route request error'), []);

                const data = await response.json();
                const geometry = data.features?.[0]?.geometry;
                const properties = data.features?.[0]?.properties || {};

                if (!geometry?.coordinates?.length) return callback?.call(context, new Error('Route data error'), []);

                setFullRouteCoords(geometry.coordinates);

                const latlngs = geometry.coordinates.map(([lng, lat]) => (window as any).L.latLng(lat, lng));

                const route = {
                    name: 'Route',
                    coordinates: latlngs,
                    summary: {
                        totalDistance: properties.summary?.distance || 0,
                        totalTime: properties.summary?.duration || 0,
                        // Add other required summary properties
                    },
                    instructions: [], // Add empty instructions array
                    waypoints,
                    inputWaypoints: waypoints,
                    properties: { isSimplified: false },
                };

                callback?.call(context, null, [route]);
            } catch (error) {
                callback?.call(context, error, []);
            } finally {
                setRoutingLoading(false);
            }
        }
    }), [ORS_API_KEY, transportMode]);

    useEffect(() => {
        if (!map || !(window as any).L?.Routing?.control || !ORS_API_KEY) return;

        const L = (window as any).L;

        // Cleanup previous routing control more safely
        const cleanupPreviousControl = () => {
            if (routingControl.current && map && isMounted.current) {
                try {
                    map.removeControl(routingControl.current);
                    routingControl.current = null;
                } catch (error) {
                    console.warn('Error during routing control cleanup:', error);
                }
            }
        };

        cleanupPreviousControl();

        if (routePoints.length < 2) return;

        try {
            routingControl.current = L.Routing.control({
                router: CustomRouter,
                waypoints: routePoints.map(p => L.latLng(p[1], p[0])),
                addWaypoints: false,
                draggableWaypoints: false,
                createMarker: (i, wp) => {
                    const icon = new L.Icon({
                        iconUrl: require('@/assets/icons/start.ico'),
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        popupAnchor: [0, -40],
                    });
                    return L.marker(wp.latLng, { icon }).bindPopup(i === 0 ? 'Start' : 'Finish');
                },
                lineOptions: { color: '#3388ff', weight: 5, opacity: 0.7 },
                fitSelectedRoutes: true,
                show: false,
            });

            routingControl.current.on('routesfound', (e: any) => {
                const route = e.routes?.[0];
                if (route?.summary?.totalDistance) setRouteDistance(route.summary.totalDistance);
                if (!(window as any).disableFitBounds && route?.coordinates) {
                    map.fitBounds(L.latLngBounds(route.coordinates).pad(0.2));
                }
                (window as any).disableFitBounds = false;
            });

            routingControl.current.on('routingerror', e => {
                if (isMounted.current) {
                    setErrors((prev: any) => ({ ...prev, routing: e.error || true }));
                }
            });

            routingControl.current.addTo(map);
        } catch (error) {
            console.error('Error initializing routing control:', error);
            if (isMounted.current) {
                setErrors((prev: any) => ({ ...prev, routing: error.message || true }));
            }
        }

        return () => {
            isMounted.current = false;
            cleanupPreviousControl();
        };
    }, [map, routePoints, CustomRouter, ORS_API_KEY]);

    return null;
};

export default RoutingMachine;

