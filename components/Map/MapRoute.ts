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
        console.error('❌ Ошибка загрузки Leaflet:', error);
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
        console.warn('⚠ Компонент `MapRoute` работает только в браузере.');
        return null;
    }

    const map = useMap();
    const routeControlRef = useRef<L.Routing.Control | null>(null);

    const waypoints = useMemo(() => {
        const points = data
            .map((p) => getLatLng(p.coord))
            .filter((point): point is [number, number] => point !== null)
            .map(([lat, lng]) => L.latLng(lat, lng));
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
            console.error('❌ Ошибка загрузки иконки:', error);
            return null;
        }
    }, []);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      .leaflet-top, .leaflet-right {
        display: none !important;
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        if (!map || !map._leaflet_id || !map.getContainer()) return;
        if (waypoints.length < 2) return;
        if (!meTravelIcon) return;

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

                requestAnimationFrame(() => {
                    if (map && map.getContainer() && map._leaflet_id) {
                        try {
                            map.invalidateSize();
                            map.fitBounds(L.latLngBounds(waypoints), { padding: [50, 50] });
                        } catch (error) {
                            console.error('❌ Ошибка при выполнении fitBounds():', error);
                        }
                    }
                });
            }
        } catch (error) {
            console.error('❌ Ошибка при создании маршрута:', error);
        }

        return () => {
            if (routeControlRef.current) {
                try {
                    routeControlRef.current.getPlan()?.setWaypoints([]);
                    routeControlRef.current.remove();
                    routeControlRef.current = null;
                } catch (error) {
                    console.warn('⚠ Ошибка при удалении маршрута:', error);
                }
            }
        };
    }, [map, waypoints, meTravelIcon]);

    return null;
}
