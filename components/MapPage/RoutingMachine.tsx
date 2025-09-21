// components/MapPage/RoutingMachine.tsx
import { useEffect, useMemo, useRef } from 'react'
import { useMap } from 'react-leaflet'

interface RoutingMachineProps {
    routePoints: [number, number][]
    transportMode: 'car' | 'bike' | 'foot'
    setRoutingLoading: (loading: boolean) => void
    setErrors: (errors: any) => void
    setRouteDistance: (distance: number) => void
    setFullRouteCoords: (coords: [number, number][]) => void
    ORS_API_KEY: string | undefined
}

const getORSProfile = (mode: 'car' | 'bike' | 'foot') => {
    switch (mode) {
        case 'bike': return 'cycling-regular'
        case 'foot': return 'foot-walking'
        default: return 'driving-car'
    }
}

const getOSRMProfile = (mode: 'car' | 'bike' | 'foot') => {
    switch (mode) {
        case 'bike': return 'bike'
        case 'foot': return 'foot'
        default: return 'driving'
    }
}

/**
 * Роутинг без leaflet-routing-machine:
 * 1) Если есть ключ ORS — используем OpenRouteService.
 * 2) Если ключа нет — фоллбэк на публичный OSRM (без ключа).
 */
const RoutingMachine: React.FC<RoutingMachineProps> = ({
                                                           routePoints,
                                                           transportMode,
                                                           setRoutingLoading,
                                                           setErrors,
                                                           setRouteDistance,
                                                           setFullRouteCoords,
                                                           ORS_API_KEY,
                                                       }) => {
    const map = useMap()
    const polylineRef = useRef<any>(null)
    const abortRef = useRef<AbortController | null>(null)

    const hasTwoPoints = Array.isArray(routePoints) && routePoints.length >= 2

    useEffect(() => {
        const L = (window as any).L
        if (!map || !L) return

        // если точек недостаточно — убираем линию и выходим
        if (!hasTwoPoints) {
            if (polylineRef.current) {
                try { map.removeLayer(polylineRef.current) } catch {}
                polylineRef.current = null
            }
            setErrors((prev: any) => ({ ...prev, routing: false }))
            setRouteDistance(0)
            return
        }

        // отменяем предыдущий запрос, если был
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        const abort = new AbortController()
        abortRef.current = abort

        const fetchORS = async () => {
            const res = await fetch(
                `https://api.openrouteservice.org/v2/directions/${getORSProfile(transportMode)}/geojson`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: String(ORS_API_KEY),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ coordinates: routePoints }),
                    signal: abort.signal,
                }
            )
            if (!res.ok) throw new Error(`ORS error: ${res.status}`)
            const data = await res.json()
            const feature = data.features?.[0]
            const geometry = feature?.geometry
            const summary = feature?.properties?.summary
            if (!geometry?.coordinates?.length) throw new Error('Empty route from ORS')
            const coordsLngLat: [number, number][] = geometry.coordinates
            const distance = summary?.distance as number | undefined
            return { coordsLngLat, distance }
        }

        const fetchOSRM = async () => {
            const profile = getOSRMProfile(transportMode)
            const coordsStr = routePoints.map(([lng, lat]) => `${lng},${lat}`).join(';')
            const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsStr}?overview=full&geometries=geojson`
            const res = await fetch(url, { signal: abort.signal })
            if (!res.ok) throw new Error(`OSRM error: ${res.status}`)
            const data = await res.json()
            const route = data.routes?.[0]
            if (!route?.geometry?.coordinates?.length) throw new Error('Empty route from OSRM')
            const coordsLngLat: [number, number][] = route.geometry.coordinates
            const distance = route.distance as number | undefined
            return { coordsLngLat, distance }
        }

        const run = async () => {
            try {
                setRoutingLoading(true)
                setErrors((prev: any) => ({ ...prev, routing: false }))

                // 1) пробуем ORS, если есть ключ; иначе — OSRM
                const result = ORS_API_KEY ? await fetchORS() : await fetchOSRM()

                // обновляем состояния
                setFullRouteCoords(result.coordsLngLat)

                const latlngs = result.coordsLngLat.map(([lng, lat]) => L.latLng(lat, lng))

                if (polylineRef.current) {
                    try { map.removeLayer(polylineRef.current) } catch {}
                    polylineRef.current = null
                }
                const line = L.polyline(latlngs, { color: '#3388ff', weight: 5, opacity: 0.85 })
                line.addTo(map)
                polylineRef.current = line

                // расстояние
                if (typeof result.distance === 'number') {
                    setRouteDistance(result.distance)
                } else {
                    const dist = latlngs.reduce((acc: number, cur: any, i: number, arr: any[]) => {
                        if (i === 0) return 0
                        return acc + arr[i - 1].distanceTo(cur)
                    }, 0)
                    setRouteDistance(dist)
                }

                if (!(window as any).disableFitBounds) {
                    map.fitBounds(line.getBounds().pad(0.2))
                }
                ;(window as any).disableFitBounds = false
            } catch (e: any) {
                if (e?.name === 'AbortError') return
                setErrors((prev: any) => ({ ...prev, routing: e?.message || true }))
                // если ORS с ключом упал — пробуем OSRM разово
                if (ORS_API_KEY) {
                    try {
                        const result = await fetchOSRM()
                        setFullRouteCoords(result.coordsLngLat)
                        const latlngs = result.coordsLngLat.map(([lng, lat]) => L.latLng(lat, lng))
                        if (polylineRef.current) {
                            try { map.removeLayer(polylineRef.current) } catch {}
                            polylineRef.current = null
                        }
                        const line = L.polyline(latlngs, { color: '#3388ff', weight: 5, opacity: 0.85 })
                        line.addTo(map)
                        polylineRef.current = line
                        if (typeof result.distance === 'number') setRouteDistance(result.distance)
                        else setRouteDistance(0)
                        if (!(window as any).disableFitBounds) map.fitBounds(line.getBounds().pad(0.2))
                        ;(window as any).disableFitBounds = false
                        setErrors((prev: any) => ({ ...prev, routing: false }))
                    } catch {}
                }
            } finally {
                setRoutingLoading(false)
            }
        }

        run()

        return () => {
            if (abortRef.current) {
                abortRef.current.abort()
                abortRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, transportMode, ORS_API_KEY, JSON.stringify(routePoints)])

    // cleanup полилинии при размонтировании
    useEffect(() => {
        const L = (window as any).L
        return () => {
            if (!map || !L) return
            if (polylineRef.current) {
                try { map.removeLayer(polylineRef.current) } catch {}
                polylineRef.current = null
            }
        }
    }, [map])

    return null
}

export default RoutingMachine
