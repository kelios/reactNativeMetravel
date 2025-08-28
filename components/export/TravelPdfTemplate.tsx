import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchTravel } from '@/src/api/travels';

interface Travel {
    id: number;
    name: string;
    countryName?: string;
    countryCode?: string;
    year?: string;
    number_days?: number;
    description?: string;
    plus?: string;
    minus?: string;
    recommendation?: string;
    youtube_link?: string;
    gallery?: Array<{
        id: number;
        url: string;
        updated_at?: string;
    }>;
    travelAddress?: Array<{
        id: number;
        name: string;
        description?: string;
        coords?: string;
    }>;
    coordsMeTravel?: Array<{
        lat: number;
        lng: number;
    }>;
    user?: {
        name: string;
        avatar?: string;
    };
    created_at?: string;
    updated_at?: string;
}

interface TravelPdfTemplateProps {
    travelId?: number;
}

const TravelPdfTemplate: React.FC<TravelPdfTemplateProps> = ({ travelId }) => {
    const { data: travel, isLoading, isError } = useQuery<Travel>({
        queryKey: ['travelDetails', travelId],
        queryFn: () => {
            if (!travelId) {
                throw new Error('Travel ID is required');
            }
            return fetchTravel(travelId);
        },
        staleTime: 600_000,
        enabled: !!travelId, // Запрос выполняется только если travelId существует
    });

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return '';
        }
    };

    const renderHtmlContent = (html?: string) => {
        if (!html) return null;

        return (
            <div
                style={styles.htmlContent}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <p>Загрузка данных о путешествии...</p>
            </div>
        );
    }

    if (isError || !travel) {
        return (
            <div style={styles.errorContainer}>
                <p>Ошибка загрузки данных о путешествии</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>
                {`
                    @page { 
                        size: A4; 
                        margin: 10mm;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Helvetica Neue', Arial, sans-serif;
                    }
                    img {
                        max-width: 100%;
                        height: auto;
                    }
                    ul, ol {
                        padding-left: 20px;
                    }
                `}
            </style>

            <header style={styles.header}>
                <h1 style={styles.title}>{travel.name}</h1>

                <div style={styles.metaContainer}>
                    {travel.countryName && (
                        <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Страна:</span>
                            <span style={styles.metaValue}>{travel.countryName}</span>
                        </div>
                    )}
                    {travel.year && (
                        <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Год:</span>
                            <span style={styles.metaValue}>{travel.year}</span>
                        </div>
                    )}
                    {travel.number_days && (
                        <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Длительность:</span>
                            <span style={styles.metaValue}>{travel.number_days} дней</span>
                        </div>
                    )}
                    {travel.user?.name && (
                        <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Автор:</span>
                            <span style={styles.metaValue}>{travel.user.name}</span>
                        </div>
                    )}
                    {travel.created_at && (
                        <div style={styles.metaItem}>
                            <span style={styles.metaLabel}>Опубликовано:</span>
                            <span style={styles.metaValue}>{formatDate(travel.created_at)}</span>
                        </div>
                    )}
                </div>
            </header>

            <main style={styles.mainContent}>
                {travel.description && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Описание путешествия</h2>
                        {renderHtmlContent(travel.description)}
                    </section>
                )}

                {travel.gallery?.length > 0 && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Фотографии из путешествия</h2>
                        <div style={styles.galleryGrid}>
                            {travel.gallery.map((img, i) => (
                                <div key={`${img.id}-${i}`} style={styles.galleryItem}>
                                    <img
                                        src={img.url}
                                        style={styles.galleryImage}
                                        alt={`Фото ${i + 1} из путешествия`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                    {img.updated_at && (
                                        <div style={styles.imageDate}>
                                            {formatDate(img.updated_at)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {(travel.plus || travel.minus) && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Плюсы и минусы</h2>
                        <div style={styles.prosConsContainer}>
                            {travel.plus && (
                                <div style={styles.prosBox}>
                                    <h3 style={styles.prosTitle}>Что понравилось</h3>
                                    {renderHtmlContent(travel.plus)}
                                </div>
                            )}
                            {travel.minus && (
                                <div style={styles.consBox}>
                                    <h3 style={styles.consTitle}>Что не понравилось</h3>
                                    {renderHtmlContent(travel.minus)}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {travel.recommendation && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Рекомендации и советы</h2>
                        {renderHtmlContent(travel.recommendation)}
                    </section>
                )}

                {travel.travelAddress?.length > 0 && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Посещенные места</h2>
                        <ul style={styles.placesList}>
                            {travel.travelAddress.map(place => (
                                <li key={place.id} style={styles.placeItem}>
                                    <h3 style={styles.placeName}>{place.name}</h3>
                                    {place.description && renderHtmlContent(place.description)}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {travel.youtube_link && (
                    <section style={styles.section}>
                        <h2 style={styles.sectionTitle}>Видео из путешествия</h2>
                        <div style={styles.videoContainer}>
                            <p style={styles.videoLink}>
                                Ссылка на видео: {travel.youtube_link}
                            </p>
                        </div>
                    </section>
                )}
            </main>

            <footer style={styles.footer}>
                <div style={styles.footerContent}>
                    <p style={styles.footerText}>
                        Документ сгенерирован в приложении MyTravels
                    </p>
                    <p style={styles.footerText}>
                        {new Date().toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </footer>
        </div>
    );
};

const styles = {
    container: {
        width: '794px',
        minHeight: '1123px',
        padding: '40px',
        backgroundColor: '#fff',
        color: '#333',
        lineHeight: 1.6,
        boxSizing: 'border-box',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
    } as React.CSSProperties,

    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
    } as React.CSSProperties,

    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#d32f2f',
    } as React.CSSProperties,

    header: {
        borderBottom: '2px solid #4a7c59',
        paddingBottom: '20px',
        marginBottom: '30px',
    } as React.CSSProperties,

    title: {
        fontSize: '28px',
        color: '#2c4e3a',
        margin: '0 0 10px 0',
        fontWeight: 600,
        lineHeight: 1.3,
    } as React.CSSProperties,

    metaContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        fontSize: '14px',
        color: '#555',
    } as React.CSSProperties,

    metaItem: {
        display: 'flex',
        gap: '5px',
    } as React.CSSProperties,

    metaLabel: {
        fontWeight: 600,
    } as React.CSSProperties,

    metaValue: {
        color: '#444',
    } as React.CSSProperties,

    mainContent: {
        margin: '20px 0',
    } as React.CSSProperties,

    section: {
        marginBottom: '30px',
        pageBreakInside: 'avoid',
    } as React.CSSProperties,

    sectionTitle: {
        fontSize: '20px',
        color: '#3a5c4e',
        margin: '0 0 15px 0',
        fontWeight: 600,
        paddingBottom: '5px',
        borderBottom: '1px solid #eee',
    } as React.CSSProperties,

    htmlContent: {
        lineHeight: 1.6,
        fontSize: '14px',
        color: '#444',
    } as React.CSSProperties,

    galleryGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        margin: '15px 0',
    } as React.CSSProperties,

    galleryItem: {
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
    } as React.CSSProperties,

    galleryImage: {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        display: 'block',
    } as React.CSSProperties,

    imageDate: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: '#fff',
        padding: '5px 10px',
        fontSize: '12px',
        textAlign: 'center',
    } as React.CSSProperties,

    prosConsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        margin: '15px 0',
    } as React.CSSProperties,

    prosBox: {
        backgroundColor: '#f5faf7',
        padding: '15px',
        borderRadius: '8px',
        borderLeft: '4px solid #4a7c59',
    } as React.CSSProperties,

    consBox: {
        backgroundColor: '#faf5f5',
        padding: '15px',
        borderRadius: '8px',
        borderLeft: '4px solid #a05050',
    } as React.CSSProperties,

    prosTitle: {
        color: '#4a7c59',
        margin: '0 0 10px 0',
        fontSize: '16px',
    } as React.CSSProperties,

    consTitle: {
        color: '#a05050',
        margin: '0 0 10px 0',
        fontSize: '16px',
    } as React.CSSProperties,

    placesList: {
        listStyle: 'none',
        margin: '15px 0',
    } as React.CSSProperties,

    placeItem: {
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '1px dashed #eee',
    } as React.CSSProperties,

    placeName: {
        fontSize: '16px',
        color: '#4a7c59',
        margin: '0 0 5px 0',
    } as React.CSSProperties,

    videoContainer: {
        margin: '15px 0',
        padding: '15px',
        backgroundColor: '#f5f5f7',
        borderRadius: '8px',
    } as React.CSSProperties,

    videoLink: {
        wordBreak: 'break-all',
        fontSize: '14px',
    } as React.CSSProperties,

    footer: {
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #eee',
        fontSize: '12px',
        color: '#999',
    } as React.CSSProperties,

    footerContent: {
        display: 'flex',
        justifyContent: 'space-between',
    } as React.CSSProperties,

    footerText: {
        margin: 0,
    } as React.CSSProperties,
};

export default TravelPdfTemplate;