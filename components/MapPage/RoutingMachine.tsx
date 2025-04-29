import { useEffect, useMemo, useRef } from 'react';
import { useMap } from 'react-leaflet';

interface RoutingMachineProps {
    routePoints: [number, number][];
    transportMode: 'car' | 'bike' | 'foot';
    setRoutingLoading: (loading: boolean) => void;
    setErrors: (errors: any) => void;
    setRouteDistance: (distance: number) => void;
    ORS_API_KEY: string;
}

const getORSProfile = (mode: 'car' | 'bike' | 'foot') => {
    switch (mode) {
        case 'bike':
            return 'cycling-regular';
        case 'foot':
            return 'foot-walking';
        default:
            return 'driving-car';
    }
};

const RoutingMachine: React.FC<RoutingMachineProps> = ({
                                                           routePoints,
                                                           transportMode,
                                                           setRoutingLoading,
                                                           setErrors,
                                                           setRouteDistance,
                                                           ORS_API_KEY,
                                                       }) => {
    const map = useMap();
    const routingControl = useRef<any>(null);

    const CustomRouter = useMemo(() => {
        return {
            route: async (waypoints: any[], callback: any, context: any, options: any) => {
                try {
                    setRoutingLoading(true);

                    let coordinates = waypoints.map((wp) => [wp.latLng.lng, wp.latLng.lat]);

                    coordinates = coordinates.filter((coord, index, arr) => {
                        if (index === 0) return true;
                        const [prevLng, prevLat] = arr[index - 1];
                        return coord[0] !== prevLng || coord[1] !== prevLat;
                    });

                    if (coordinates.length < 2) {
                        console.error('Not enough unique points for route:', coordinates);
                        if (typeof callback === 'function') callback.call(context, new Error('Not enough points for route'), []);
                        return;
                    }

                    const response = await fetch(
                        `https://api.openrouteservice.org/v2/directions/${getORSProfile(transportMode)}/geojson`,
                        {
                            method: 'POST',
                            headers: {
                                Authorization: ORS_API_KEY,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ coordinates }),
                        }
                    );

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Route error:', errorText);
                        if (typeof callback === 'function') callback.call(context, new Error('Route request error'), []);
                        return;
                    }

                    const data = await response.json();
                    const geometry = data.features?.[0]?.geometry;

                    if (!geometry || !geometry.coordinates?.length) {
                        console.error('No valid route geometry:', data);
                        if (typeof callback === 'function') callback.call(context, new Error('Route data error'), []);
                        return;
                    }

                    const latlngs = geometry.coordinates.map(([lng, lat]: [number, number]) =>
                        (window as any).L.latLng(lat, lng)
                    );

                    if (!latlngs.length) {
                        console.error('Empty route coordinates.');
                        if (typeof callback === 'function') callback.call(context, new Error('Empty route coordinates'), []);
                        return;
                    }

                    const route = {
                        name: 'Route',
                        coordinates: latlngs,
                        instructions: [],
                        summary: {
                            totalDistance: data.features[0].properties.summary.distance,
                            totalTime: data.features[0].properties.summary.duration,
                        },
                        waypoints: waypoints,
                        inputWaypoints: waypoints,
                        properties: {
                            isSimplified: false
                        }
                    };

                    if (typeof callback === 'function' && context) {
                        callback.call(context, null, [route]);
                    }
                } catch (error) {
                    console.error('Route building error:', error);
                    if (typeof callback === 'function') callback.call(context, error, []);
                } finally {
                    setRoutingLoading(false);
                }
            }
        };
    }, [ORS_API_KEY, transportMode, setRoutingLoading]);


    useEffect(() => {
        if (!map || !(window as any).L?.Routing?.control || !ORS_API_KEY) return;

        const L = (window as any).L;

        const initializeRouting = async () => {
            if (routingControl.current) {
                map.removeControl(routingControl.current);
                routingControl.current = null;
            }

            if (routePoints.length < 2) return;

            try {
                const startIcon = new L.Icon({
                    iconUrl: require('@/assets/icons/start.ico'),
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    popupAnchor: [0, -40],
                });

                const endIcon = new L.Icon({
                    iconUrl: require('@/assets/icons/start.ico'),
                    iconSize: [30, 40],
                    iconAnchor: [15, 40],
                    popupAnchor: [0, -40],
                });

                routingControl.current = L.Routing.control({
                    router: CustomRouter,
                    waypoints: routePoints.map((p) => L.latLng(p[1], p[0])),
                    addWaypoints: false,
                    draggableWaypoints: false,
                    createMarker: (i: number, wp: any) => {
                        const icon = i === 0 ? startIcon : endIcon;
                        return L.marker(wp.latLng, { icon }).bindPopup(i === 0 ? 'Start' : 'Finish');
                    },
                    lineOptions: {
                        color: '#3388ff',
                        weight: 5,
                        opacity: 0.7,
                        addWaypoints: false
                    },
                    fitSelectedRoutes: true,
                    show: false,
                });

                routingControl.current.on('routesfound', (e: any) => {
                    const route = e.routes?.[0];
                    if (route?.summary?.totalDistance != null) {
                        setRouteDistance(route.summary.totalDistance);
                    }

                    if ((window as any).disableFitBounds) return; // 👈 прочитать глобальную переменную
                    const bounds = L.latLngBounds(
                        route.coordinates.map((latlng: any) => L.latLng(latlng.lat, latlng.lng))
                    );
                    (window as any).disableFitBounds = false;
                    map.fitBounds(bounds.pad(0.2));
                });

                routingControl.current.on('routingerror', (e: any) => {
                    setErrors((prev: any) => ({ ...prev, routing: e.error || true }));
                });

                routingControl.current.addTo(map);
            } catch (error) {
                console.error('Error initializing routing control:', error);
                setErrors((prev: any) => ({ ...prev, routing: true }));
            }
        };

        initializeRouting();

        return () => {
            if (routingControl.current) {
                map.removeControl(routingControl.current);
                routingControl.current = null;
            }
        };
    }, [map, routePoints, CustomRouter, ORS_API_KEY, setErrors, setRouteDistance]);

    return null;
};

export default RoutingMachine;