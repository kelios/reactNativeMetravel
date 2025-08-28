import React, { useCallback, memo, useEffect, useRef, useState } from 'react';

interface Travel {
    address: string;
    coord: string; // "lat,lng"
    travelImageThumbUrl?: string;
    categoryName?: string;
    articleUrl?: string;
    urlTravel?: string; // роут на квест
}

interface PopupContentWebProps {
    travel: Travel;
}

const parseLatLng = (coord: string): { lat: number; lng: number } | null => {
    if (!coord) return null;
    const [latS, lngS] = coord.split(',').map(s => s.trim());
    const lat = Number(latS), lng = Number(lngS);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
};

const PopupContentWeb: React.FC<PopupContentWebProps> = memo(({ travel }) => {
    const { address, coord, travelImageThumbUrl, categoryName, articleUrl, urlTravel } = travel;
    const [copied, setCopied] = useState(false);
    const mounted = useRef(false);

    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

    const safeOpen = useCallback((url?: string) => {
        if (!url) return;
        if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, []);

    const openPrimary = useCallback(() => {
        // приоритет: квест -> статья
        safeOpen(urlTravel || articleUrl);
    }, [urlTravel, articleUrl, safeOpen]);

    const copyCoord = useCallback(async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(coord);
                if (mounted.current) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
            }
        } catch {/* no-op */}
    }, [coord]);

    const openMap = useCallback(() => {
        const p = parseLatLng(coord);
        if (!p) return;
        // гугл понимает "lat,lng"
        safeOpen(`https://maps.google.com/?q=${encodeURIComponent(`${p.lat},${p.lng}`)}`);
    }, [coord, safeOpen]);

    const shareTelegram = useCallback(() => {
        const base = urlTravel || `https://maps.google.com/?q=${encodeURIComponent(coord)}`;
        const text = `Координаты: ${coord}${address ? ` — ${address}` : ''}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(base)}&text=${encodeURIComponent(text)}`;
        safeOpen(url);
    }, [coord, address, urlTravel, safeOpen]);

    const handleAction = useCallback((e: React.MouseEvent, fn: () => void) => {
        e.stopPropagation();
        fn();
    }, []);

    const onKey = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPrimary();
        }
    }, [openPrimary]);

    return (
        <div
            className="popup-card"
            onClick={openPrimary}
            onKeyDown={onKey}
            tabIndex={0}
            role="button"
            aria-label={`Открыть: ${address}`}
            title="Открыть"
        >
            <div
                className="popup-image"
                style={{
                    backgroundImage: travelImageThumbUrl ? `url(${travelImageThumbUrl})` : 'none',
                    backgroundColor: travelImageThumbUrl ? undefined : '#ccc'
                }}
            >
                <div className="popup-icons-top">
                    {urlTravel || articleUrl ? (
                        <button onClick={(e) => handleAction(e, openPrimary)} title={urlTravel ? 'Открыть квест' : 'Открыть статью'}>
                            <LinkIcon />
                        </button>
                    ) : null}
                    <button onClick={(e) => handleAction(e, copyCoord)} title="Скопировать координаты">
                        <CopyIcon />
                    </button>
                    <button onClick={(e) => handleAction(e, shareTelegram)} title="Поделиться в Telegram">
                        <SendIcon />
                    </button>
                </div>

                <div className="popup-overlay">
                    <div className="popup-text">
                        <p className="popup-title" title={address}>{address}</p>

                        {coord && (
                            <div className="popup-coord">
                                <span>Координаты: </span>
                                <a onClick={(e) => handleAction(e, openMap)} title="Открыть в Google Maps">{coord}</a>
                                {copied && <em style={{ marginLeft: 8, opacity: 0.9 }}>скопировано</em>}
                            </div>
                        )}

                        {categoryName && <div className="popup-category">{categoryName}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
});

const IconBase: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 24 24" className="popup-svg" aria-hidden="true">{children}</svg>
);

const LinkIcon = () => (
    <IconBase><path d="M3.9,12A5.1,5.1,0,0,1,9,6.9h3v1.8H9A3.3,3.3,0,0,0,5.7,12,3.3,3.3,0,0,0,9,15.3h3v1.8H9A5.1,5.1,0,0,1,3.9,12Zm11.1-.9H9.9v1.8h5.1ZM15,6.9h-3v1.8h3A3.3,3.3,0,0,1,18.3,12,3.3,3.3,0,0,1,15,15.3h-3v1.8h3A5.1,5.1,0,0,0,20.1,12,5.1,5.1,0,0,0,15,6.9Z"/></IconBase>
);

const CopyIcon = () => (
    <IconBase><path d="M16,1H4A2,2,0,0,0,2,3V15H4V3H16ZM20,5H8A2,2,0,0,0,6,7V21a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V7A2,2,0,0,0,20,5Zm0,16H8V7H20Z"/></IconBase>
);

const SendIcon = () => (
    <IconBase><path d="M2.01,21L23,12,2.01,3,2,10l15,2-15,2Z"/></IconBase>
);

const styles = `
.popup-card {
  width: 260px;
  border-radius: 12px;
  overflow: hidden;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
  cursor: pointer;
  background: #f3f3f3;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s ease, opacity 0.2s ease;
  outline: none;
}
.popup-card:focus { box-shadow: 0 0 0 2px #0ea5e9; }
.popup-card:hover { transform: scale(1.02); }
.popup-image {
  position: relative;
  height: 220px;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.popup-icons-top {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 2;
}
.popup-icons-top button {
  background: rgba(0, 0, 0, 0.6);
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
}
.popup-icons-top button:hover { background: rgba(0, 0, 0, 0.8); }
.popup-overlay {
  width: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.2));
  padding: 6px 8px;
  box-sizing: border-box;
}
.popup-text { color: #fff; font-size: 13px; text-shadow: 0 1px 3px rgba(0,0,0,0.9); }
.popup-title {
  font-weight: 700; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 !important;
}
.popup-coord { font-size: 12px; margin-top: 2px; margin-bottom: 6px; }
.popup-coord span { color: #e5e7eb; }
.popup-coord a {
  color: #cceeff; font-weight: 600; text-decoration: underline; cursor: pointer; text-shadow: 0 1px 3px rgba(0,0,0,0.9); margin-left: 4px;
}
.popup-category {
  background: rgba(255,255,255,0.22);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
  color: #fff;
  text-shadow: 0 0 3px rgba(0,0,0,0.6);
  margin-top: 6px;
}
.popup-svg { width: 20px; height: 20px; fill: #fff; }
`;

if (typeof document !== 'undefined') {
    const id = 'popup-content-web-style';
    if (!document.getElementById(id)) {
        const styleTag = document.createElement('style');
        styleTag.id = id;
        styleTag.innerHTML = styles;
        document.head.appendChild(styleTag);
    }
}

export default PopupContentWeb;
