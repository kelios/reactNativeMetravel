import React, { useMemo, useEffect, useRef } from "react";

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

const BookPageView: React.FC<{ travel: Travel; pageNumber: number }> = ({ travel, pageNumber }) => {
    const coverImage = useMemo(() => {
        return travel?.travel_image_url || travel?.gallery?.[0]?.url;
    }, [travel]);

    return (
        <div style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "15mm",
            backgroundColor: "#fff",
            margin: "0 auto",
            boxSizing: "border-box",
            position: "relative",
            breakInside: "avoid",
            pageBreakInside: "avoid",
            fontFamily: "'Segoe UI', Roboto, sans-serif"
        }}>
            {/* Заголовок и обложка */}
            {coverImage && (
                <div style={{
                    position: "relative",
                    height: "120mm",
                    marginBottom: "10mm",
                    overflow: "hidden"
                }}>
                    <img
                        src={coverImage}
                        alt={travel.name}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                    <div style={{
                        position: "absolute",
                        bottom: "10mm",
                        left: "10mm",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "5mm",
                        borderRadius: "2mm",
                        maxWidth: "80%"
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: "20pt",
                            fontWeight: "bold"
                        }}>
                            {travel.name}
                        </h1>
                    </div>
                </div>
            )}

            {/* Мета-информация */}
            <div style={{
                display: "flex",
                gap: "10mm",
                marginBottom: "10mm"
            }}>
                <div style={{ flex: 1 }}>
                    <p style={{ margin: "2mm 0" }}>
                        <strong>Страна:</strong> {travel.countryName || "—"}
                    </p>
                    <p style={{ margin: "2mm 0" }}>
                        <strong>Дата:</strong> {travel.year || "—"}
                    </p>
                    {travel.number_days && (
                        <p style={{ margin: "2mm 0" }}>
                            <strong>Дней:</strong> {travel.number_days}
                        </p>
                    )}
                </div>
                <div style={{
                    width: "60mm",
                    height: "40mm",
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "2mm"
                }}>
                    [Карта маршрута]
                </div>
            </div>

            {/* Основной контент */}
            {travel.description && (
                <div
                    style={{
                        columnCount: 2,
                        columnGap: "10mm",
                        marginBottom: "10mm",
                        lineHeight: 1.5
                    }}
                    dangerouslySetInnerHTML={{ __html: travel.description }}
                />
            )}

            {/* Плюсы/минусы */}
            {(travel.plus || travel.minus) && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10mm",
                    marginBottom: "10mm"
                }}>
                    {travel.plus && (
                        <div style={{
                            backgroundColor: "#f9f9f9",
                            padding: "5mm",
                            borderRadius: "2mm"
                        }}>
                            <h3 style={{
                                marginTop: 0,
                                color: "#2e7d32"
                            }}>
                                Плюсы
                            </h3>
                            <div dangerouslySetInnerHTML={{ __html: travel.plus }} />
                        </div>
                    )}
                    {travel.minus && (
                        <div style={{
                            backgroundColor: "#f9f9f9",
                            padding: "5mm",
                            borderRadius: "2mm"
                        }}>
                            <h3 style={{
                                marginTop: 0,
                                color: "#c62828"
                            }}>
                                Минусы
                            </h3>
                            <div dangerouslySetInnerHTML={{ __html: travel.minus }} />
                        </div>
                    )}
                </div>
            )}

            {/* Рекомендации */}
            {travel.recommendation && (
                <div style={{
                    backgroundColor: "#f5f5f5",
                    padding: "5mm",
                    borderRadius: "2mm",
                    marginBottom: "10mm"
                }}>
                    <h3 style={{ marginTop: 0 }}>Рекомендации</h3>
                    <div dangerouslySetInnerHTML={{ __html: travel.recommendation }} />
                </div>
            )}

            {/* Подвал страницы */}
            <div style={{
                position: "absolute",
                bottom: "10mm",
                left: "15mm",
                right: "15mm",
                borderTop: "1px solid #eee",
                paddingTop: "3mm",
                fontSize: "9pt",
                color: "#666",
                display: "flex",
                justifyContent: "space-between"
            }}>
                <span>Мои путешествия</span>
                <span>{pageNumber}</span>
            </div>
        </div>
    );
};

export default BookPageView;