// components/MapPage/MapRoute.tsx
import React, { useEffect, useMemo, useRef } from 'react'
import { Platform } from 'react-native'
import { useMap } from 'react-leaflet'

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined'

// Нежно получаем L так, чтобы не упасть из-за ESM/CJS
function getLeaflet() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('leaflet')
    // @ts-ignore
    return mod.default || mod
}

type Point = {
    id: number
    coord: string
}

interface MapRouteProps {
    data?: Point[]
    /** driving | bike | foot */
    profile?: 'driving' | 'bike' | 'foot'
}

const getLatLng = (coord?: string): [number, number] | null => {
    if (!coord) return null
    const [lat, lng] = coord.split(',').map(Number)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.warn(`⚠ Некорректные координаты: ${coord}`)
        return null
    }
    return [lat, lng]
}

const getORSProfile = (p: 'driving' | 'bike' | 'foot') =>
    p === 'bike' ? 'cycling-regular' : p === 'foot' ? 'foot-walking' : 'driving-car'

const getOSRMProfile = (p: 'driving' | 'bike' | 'foot') =>
    p === 'bike' ? 'bike' : p === 'foot' ? 'foot' : 'driving'

export default function MapRoute({ data = [], profile = 'driving' }: MapRouteProps) {
    if (!isWeb) {
        console.warn('⚠ Компонент `MapRoute` работает только в браузере.')
        return null
    }

    const map = useMap()
    const polylineRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const abortRef = useRef<AbortController | null>(null)

    // подхватываем ключ ORS (если есть)
    const ORS_API_KEY: string | undefined = process.env.EXPO_PUBLIC_ROUTE_SERVICE

    // подключаем стили Leaflet один раз
    useEffect(() => {
        const href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = href
            document.head.appendChild(link)
        }
    }, [])

    // скрываем стандартные контролы, как у тебя в исходнике
    useEffect(() => {
        const style = document.createElement('style')
        style.innerHTML = `.leaflet-top, .leaflet-right { display: none !important; }`
        document.head.appendChild(style)
        return () => document.head.removeChild(style)
    }, [])

    // готовим точки
    const waypointsLatLng = useMemo(() => {
        const L = getLeaflet()
        return data
            .map(p => getLatLng(p.coord))
            .filter((x): x is [number, number] => x !== null)
            .map(([lat, lng]) => L.latLng(lat, lng))
    }, [data])

    // иконка MeTravel
    const meTravelIcon = useMemo(() => {
        try {
            const L = getLeaflet()
            return new L.Icon({
                iconUrl: require('@/assets/icons/logo_yellow.ico'),
                iconSize: [27, 30],
                iconAnchor: [13, 30],
                popupAnchor: [0, -30],
            })
        } catch (e) {
            console.error('❌ Ошибка загрузки иконки:', e)
            return null
        }
    }, [])

    useEffect(() => {
        const L = getLeaflet()
        if (!map || !map.getContainer()) return

        // очистка прошлой линии и маркеров
        const clearLayers = () => {
            if (polylineRef.current) {
                try { map.removeLayer(polylineRef.current) } catch {}
                polylineRef.current = null
            }
            markersRef.current.forEach(m => {
                try { map.removeLayer(m) } catch {}
            })
            markersRef.current = []
        }

        if (waypointsLatLng.length < 2) {
            clearLayers()
            return
        }

        // отменяем предыдущий запрос
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        const abort = new AbortController()
        abortRef.current = abort

        const fetchORS = async () => {
            const coordinates = waypointsLatLng.map((ll: any) => [ll.lng, ll.lat])
            const res = await fetch(
                `https://api.openrouteservice.org/v2/directions/${getORSProfile(profile)}/geojson`,
                {
                    method: 'POST',
                    headers: { Authorization: String(ORS_API_KEY), 'Content-Type': 'application/json' },
                    body: JSON.stringify({ coordinates }),
                    signal: abort.signal,
                }
            )
            if (!res.ok) throw new Error(`ORS ${res.status}`)
            const data = await res.json()
            const coords: [number, number][] = data.features?.[0]?.geometry?.coordinates ?? []
            if (!coords.length) throw new Error('ORS empty geometry')
            return coords.map(([lng, lat]) => L.latLng(lat, lng))
        }

        const fetchOSRM = async () => {
            const profileOSRM = getOSRMProfile(profile)
            const coordsStr = waypointsLatLng.map((ll: any) => `${ll.lng},${ll.lat}`).join(';')
            const url = `https://router.project-osrm.org/route/v1/${profileOSRM}/${coordsStr}?overview=full&geometries=geojson`
            const res = await fetch(url, { signal: abort.signal })
            if (!res.ok) throw new Error(`OSRM ${res.status}`)
            const data = await res.json()
            const coords: [number, number][] = data.routes?.[0]?.geometry?.coordinates ?? []
            if (!coords.length) throw new Error('OSRM empty geometry')
            return coords.map(([lng, lat]) => L.latLng(lat, lng))
        }

        const draw = async () => {
            try {
                clearLayers()

                // маркеры на точках
                if (meTravelIcon) {
                    markersRef.current = waypointsLatLng.map((ll: any, i: number) => {
                        const m = L.marker(ll, { icon: meTravelIcon })
                        if (i === 0) m.bindPopup('Старт')
                        else if (i === waypointsLatLng.length - 1) m.bindPopup('Финиш')
                        m.addTo(map)
                        return m
                    })
                }

                // пробуем ORS (если есть ключ), иначе OSRM
                const lineLatLngs =
                    ORS_API_KEY ? await fetchORS() : await fetchOSRM()

                const line = L.polyline(lineLatLngs, { color: '#3388ff', weight: 5, opacity: 0.85 })
                line.addTo(map)
                polylineRef.current = line

                // кадр на корректный размер
                requestAnimationFrame(() => {
                    try {
                        map.invalidateSize()
                        map.fitBounds(line.getBounds().pad(0.2))
                    } catch (e) {
                        console.warn('fitBounds error', e)
                    }
                })
            } catch (e) {
                if ((e as any)?.name !== 'AbortError') {
                    console.error('❌ Ошибка построения маршрута:', e)
                }
            }
        }

        draw()

        return () => {
            if (abortRef.current) {
                abortRef.current.abort()
                abortRef.current = null
            }
            clearLayers()
        }
    }, [map, waypointsLatLng, profile, ORS_API_KEY])

    return null
}
