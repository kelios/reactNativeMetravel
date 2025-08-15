// components/belkraj/BelkrajWidget.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface TravelAddress {
    id: number;
    address: string;
    coord?: string;
    lat?: number;
    lng?: number;
}

type Props = {
    points: TravelAddress[];
    countryCode?: string;
    collapsedHeight?: number; // высота по умолчанию
    expandedHeight?: number;  // высота при развороте
    className?: string;
};

export default function BelkrajWidget({
                                          points,
                                          countryCode = 'BY',
                                          collapsedHeight = 520,
                                          expandedHeight = 1200,
                                          className,
                                      }: Props) {
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const firstCoord = useMemo(() => {
        const p = points?.[0];
        if (!p) return null;
        if (typeof p.lat === 'number' && typeof p.lng === 'number') return { lat: p.lat, lng: p.lng };
        if (p.coord) {
            const [a, b] = p.coord.split(',').map(s => s.trim());
            const lat = Number(a), lng = Number(b);
            if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
        }
        return null;
    }, [points]);

    // Текущая целевая высота iframe
    const targetHeight = expanded ? expandedHeight : collapsedHeight;

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !firstCoord) return;

        // чистим перед монтированием/сменой
        el.innerHTML = '';

        const mo = new MutationObserver(() => {
            const ifr = el.querySelector('iframe') as HTMLIFrameElement | null;
            if (ifr) {
                ifr.style.width = '100%';
                ifr.style.height = `${targetHeight}px`; // ключевой момент: задаём высоту самому iframe
                ifr.style.display = 'block';
                ifr.setAttribute('scrolling', 'yes');   // на всякий случай для старых движков
            }
        });
        mo.observe(el, { childList: true, subtree: true });

        const ctry = (countryCode || 'BY').toUpperCase();
        const { lat, lng } = firstCoord;

        const script = document.createElement('script');
        script.async = true;
        script.src =
            `https://belkraj.by/sites/all/modules/_custom/modules/affiliate/js/widget.js` +
            `?country=${encodeURIComponent(ctry)}` +
            `&lat=${lat}&lng=${lng}` +
            `&term=place&theme=cards&partner=u180793&size=6&debug=1`;

        el.appendChild(script);

        return () => {
            mo.disconnect();
            el.innerHTML = '';
        };
    }, [firstCoord, countryCode, targetHeight]);

    if (!firstCoord) return null;

    return (
        <div className={className ?? 'belkraj-slot'}>
            {/* сам контейнер без overflow — скролл будет внутри iframe */}
            <div ref={containerRef} style={{ width: '100%' }} />
        </div>
    );
}
