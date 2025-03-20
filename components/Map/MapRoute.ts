import React, { useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

let useMap: any, L: any, Icon: any;

if (isWeb) {
    try {
        const { useMap: leafletUseMap } = require('react-leaflet');
        useMap = leafletUseMap;
        L = require('leaflet');
        Icon = require('leaflet').Icon;
        require('leaflet-routing-machine');
        require('leaflet/dist/leaflet.css');
        require('leaflet-routing-machine/dist/leaflet-routing-machine.css');
    } catch (error) {
        console.error("❌ Ошибка загрузки Leaflet:", error);
    }
}

type Point = {
    id: number;
    coord: string;
};

interface MapRouteProps {
    data?: Point[];
    profile?: string;
}

const getLatLng = (coord?: string): [number, number] | null => {
    if (!coord) return null;
    const [lat, lng] = coord.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) {
        console.warn(`⚠ Некорректные координаты: ${coord}`);
        return null;
    }
    return [lat, lng];
};

export default function MapRoute({ data = [], profile = 'driving' }: MapRouteProps) {
    if (!isWeb) {
        console.warn("⚠ Компонент `MapRoute` работает только в браузере.");
        return null;
    }

    const map = useMap();
    const routeControlRef = useRef<L.Routing.Control | null>(null);
    const fitBoundsCalled = useRef(false);

    const waypoints = useMemo(() => {
        console.log("📌 Исходные точки маршрута:", data);

        const points = data
            .map((p) => getLatLng(p.coord))
            .filter((point): point is [number, number] => point !== null)
            .map(([lat, lng]) => L.latLng(lat, lng));

        if (points.length < 2) {
            console.warn("⚠ Недостаточно точек для маршрута.");
        } else {
            console.log("🗺 Генерируем маршрут с точками:", points);
        }

        return points;
    }, [data]);

    const meTravelIcon = useMemo(() => {
        try {
            return new Icon({
                iconUrl: require('@/assets/icons/logo_yellow.ico'),
                iconSize: [27, 30],
                iconAnchor: [13, 30],
                popupAnchor: [0, -30],
            });
        } catch (error) {
            console.error("❌ Ошибка загрузки иконки:", error);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!map || !map._leaflet_id) {
            console.warn("⚠ Карта не инициализирована.");
            return;
        }
        if (waypoints.length < 2) {
            console.warn("⚠ Недостаточно точек для маршрута.");
            return;
        }
        if (!meTravelIcon) {
            console.warn("⚠ Иконка маршрута не загружена.");
            return;
        }

        console.log("🚀 Создание маршрута...");

        let routeControl: L.Routing.Control | null = null;

        try {
            routeControl = L.Routing.control({
                waypoints,
                addWaypoints: false,
                draggableWaypoints: false,
                routeWhileDragging: false,
                showAlternatives: false,
                itinerary: { show: false },
                showRouteName: false,
                createMarker: (_i, wp) => L.marker(wp.latLng, { draggable: false, icon: meTravelIcon }),
            });

            if (routeControl && map) {
                routeControl.addTo(map);
                routeControlRef.current = routeControl;
                console.log("✅ Маршрут успешно создан.");

                // ✅ Проверяем, можно ли вызвать `fitBounds()`
                if (map.getContainer() && map._leaflet_id && waypoints.length > 0 && !fitBoundsCalled.current) {
                    console.log("📌 Автоматическое приближение на маршрут...");
                    fitBoundsCalled.current = true;

                    // Use requestAnimationFrame for better timing
                    requestAnimationFrame(() => {
                        if (map && map.getContainer() && map._leaflet_id) {
                            try {
                                // Ensure the map is fully initialized
                                map.invalidateSize();
                                map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50] }); // Add padding for better UX
                                console.log("✅ fitBounds() выполнен успешно.");
                            } catch (error) {
                                console.error("❌ Ошибка при выполнении fitBounds():", error);
                            }
                        } else {
                            console.warn("⚠ Карта была удалена до fitBounds().");
                        }
                    });
                } else {
                    console.warn("⚠ Невозможно выполнить fitBounds(), карта не готова.");
                }
            } else {
                console.error("❌ Не удалось добавить маршрут в карту.");
            }
        } catch (error) {
            console.error("❌ Ошибка при создании маршрута:", error);
        }

        return () => {
            if (routeControlRef.current) {
                try {
                    console.log("🗑 Попытка удаления маршрута...");
                    routeControlRef.current.getPlan()?.setWaypoints([]); // Очистка маршрута
                    routeControlRef.current.remove();
                    routeControlRef.current = null;
                    console.log("✅ Маршрут успешно удалён.");
                } catch (error) {
                    console.warn("⚠ Ошибка при удалении маршрута:", error);
                }
            }
            fitBoundsCalled.current = false; // Сбрасываем флаг
        };
    }, [map, waypoints, meTravelIcon]);

    return null;
}