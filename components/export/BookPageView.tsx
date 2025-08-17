// src/components/export/BookPageView.tsx
import React, { useMemo } from "react";

type Travel = {
    id: number | string;
    name: string;
    countryName?: string;
    countries?: Array<{ name?: string }>;
    country?: { name?: string };
    monthName?: string;
    month?: number;
    year?: number | string;
    number_days?: number;
    travel_image_thumb_url?: string;
    travel_image_thumb_small_url?: string;
    travel_image_url?: string;
    gallery?: Array<{ id?: number | string; url: string; updated_at?: string }>;
    description?: string | null;
    plus?: string | null;
    minus?: string | null;
    recommendation?: string | null;
};

const monthNamesRu = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
];

function safeHTML(html?: string | null) {
    if (!html) return undefined as any;
    return { __html: html };
}

function tidyHtml(html?: string | null) {
    if (!html) return undefined as any;
    const cleaned = html
        .replace(/<p>\s*(<br\s*\/?>)*\s*<\/p>/gi, "")
        .replace(/<h1>\s*<\/h1>/gi, "");
    return { __html: cleaned };
}

export default function BookPageView({ travel }: { travel: Travel }) {
    const cover = useMemo(() => {
        const g = travel?.gallery?.[0]?.url;
        return (
            g ||
            travel?.travel_image_url ||
            travel?.travel_image_thumb_url ||
            travel?.travel_image_thumb_small_url ||
            undefined
        );
    }, [travel]);

    const country = useMemo(() => {
        if (travel?.countryName) return travel.countryName;
        if (Array.isArray(travel?.countries) && travel.countries.length) {
            return travel.countries.map((c) => c?.name).filter(Boolean).join(", ");
        }
        if (travel?.country?.name) return travel.country.name;
        return "—";
    }, [travel]);

    const whenText = useMemo(() => {
        const hasMonthName =
            typeof travel?.monthName === "string" && travel.monthName.trim().length > 0;
        if (hasMonthName && travel?.year) return `${travel!.monthName} ${travel!.year}`;
        const m =
            travel?.month && travel.month >= 1 && travel.month <= 12
                ? monthNamesRu[Number(travel.month) - 1]
                : null;
        if (m && travel?.year) return `${m} ${travel.year}`;
        if (travel?.year) return `${travel.year}`;
        return "—";
    }, [travel]);

    const galleryTail = useMemo(() => {
        const arr = Array.isArray(travel?.gallery) ? travel!.gallery.slice(1, 7) : [];
        return arr.filter((g) => g?.url);
    }, [travel]);

    return (
        <>
            <style>{`
        @page { size: A4; margin: 0; }
        html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        * { box-sizing: border-box; }

        .pdf-page { width: 210mm; height: 297mm; padding: 12mm; page-break-after: always; background: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #1f1f1f; }
        .title { font-weight: 800; font-size: 18pt; margin: 0 0 6mm 0; }

        .hero { margin: 0 0 6mm 0; position: relative; }
        .hero img { width: 100%; height: 85mm; object-fit: cover; border-radius: 4mm; display: block; }
        .heroTitle {
          position: absolute; left: 6mm; bottom: 6mm;
          background: rgba(0,0,0,.55); color: #fff;
          padding: 3mm 5mm; border-radius: 3mm; font-weight: 700; font-size: 14pt;
        }

        .metaRow { display: flex; gap: 6mm; margin: 3mm 0 5mm 0; }
        .metaCol { flex: 1; display: grid; gap: 2mm; font-size: 10.5pt; }
        .metaItem b { font-weight: 700; }
        .miniMap { width: 48mm; }
        .miniMapStub {
          height: 30mm; background: #f1f1f1; border-radius: 3mm;
          display:flex; align-items:center; justify-content:center; color:#999; font-size:10pt;
        }

        .rich h1, .rich h2, .rich h3 { break-after: avoid; margin: 6mm 0 2mm; }
        .rich p, .rich ul, .rich ol, .rich figure { break-inside: avoid; margin: 0 0 3mm; }
        .rich img { max-width: 100%; height: auto; display: block; }

        .twoCols { column-count: 2; column-gap: 8mm; font-size: 10.5pt; line-height: 1.5; }

        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 5mm; }
        .box { background: #fff; border: 1px solid #ececec; border-radius: 3mm; padding: 4mm; font-size: 10.5pt; }
        .boxTitle { font-weight: 700; margin-bottom: 2mm; }

        .gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-top: 5mm; }
        .galItem img { width: 100%; height: 40mm; object-fit: cover; border-radius: 2mm; display: block; }

        .avoid-break { break-inside: avoid; page-break-inside: avoid; }
      `}</style>

            <section className="pdf-page">
                {cover && (
                    <figure className="hero avoid-break">
                        <img src={cover} alt={travel.name} loading="eager" />
                        <figcaption className="heroTitle">{travel.name}</figcaption>
                    </figure>
                )}

                <div className="metaRow avoid-break">
                    <div className="metaCol">
                        <div className="metaItem">
                            <b>Страна:</b> {country}
                        </div>
                        <div className="metaItem">
                            <b>Когда:</b> {whenText}
                        </div>
                        {travel?.number_days ? (
                            <div className="metaItem">
                                <b>Дней:</b> {travel.number_days}
                            </div>
                        ) : null}
                    </div>
                    <div className="miniMap">
                        <div className="miniMapStub">Маршрут</div>
                    </div>
                </div>

                {travel?.description && (
                    <div className="rich twoCols" dangerouslySetInnerHTML={tidyHtml(travel.description)} />
                )}

                {(travel?.plus || travel?.minus) && (
                    <div className="grid2 avoid-break">
                        {travel?.plus && (
                            <div className="box">
                                <div className="boxTitle">Плюсы</div>
                                <div className="rich" dangerouslySetInnerHTML={safeHTML(travel.plus)} />
                            </div>
                        )}
                        {travel?.minus && (
                            <div className="box">
                                <div className="boxTitle">Минусы</div>
                                <div className="rich" dangerouslySetInnerHTML={safeHTML(travel.minus)} />
                            </div>
                        )}
                    </div>
                )}

                {travel?.recommendation && (
                    <div className="box avoid-break" style={{ marginTop: "5mm" }}>
                        <div className="boxTitle">Рекомендации</div>
                        <div className="rich" dangerouslySetInnerHTML={safeHTML(travel.recommendation)} />
                    </div>
                )}

                {galleryTail.length > 0 && (
                    <div className="gallery avoid-break">
                        {galleryTail.map((g) => (
                            <figure key={(g.id as any) ?? g.url} className="galItem">
                                <img src={g.url} loading="lazy" />
                            </figure>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
