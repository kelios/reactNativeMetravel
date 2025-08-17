import React from 'react';

const TravelPdfTemplate = ({ travel }: { travel: any }) => (
    <div style={{
        width: '794px',
        minHeight: '1123px',
        padding: '40px',
        backgroundColor: '#fff',
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        color: '#333',
        lineHeight: 1.6,
    }}>
        <style>
            {`
                @page { size: A4; margin: 0; }
                * { 
                    -webkit-print-color-adjust: exact; 
                    color-adjust: exact; 
                    print-color-adjust: exact; 
                }
            `}
        </style>

        <header style={{
            borderBottom: '2px solid #4a7c59',
            paddingBottom: '20px',
            marginBottom: '30px'
        }}>
            <h1 style={{
                fontSize: '28px',
                color: '#2c4e3a',
                margin: '0 0 10px 0'
            }}>
                {travel.name}
            </h1>
            <div style={{
                display: 'flex',
                gap: '15px',
                color: '#666',
                fontSize: '16px'
            }}>
                {travel.countryName && <span>{travel.countryName}</span>}
                {travel.year && <span>{travel.year}</span>}
                {travel.number_days && <span>{travel.number_days} дней</span>}
            </div>
        </header>

        <main style={{ margin: '20px 0' }}>
            {travel.description && (
                <section style={{ marginBottom: '30px' }}>
                    <div dangerouslySetInnerHTML={{ __html: travel.description }} />
                </section>
            )}

            {travel.gallery?.length > 0 && (
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '15px',
                    margin: '25px 0'
                }}>
                    {travel.gallery.slice(0, 4).map((img: any, i: number) => (
                        <img
                            key={i}
                            src={img.url}
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '5px'
                            }}
                            alt={`Фото ${i+1}`}
                        />
                    ))}
                </section>
            )}

            {(travel.plus || travel.minus) && (
                <section style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    margin: '30px 0'
                }}>
                    {travel.plus && (
                        <div style={{
                            backgroundColor: '#f5faf7',
                            padding: '15px',
                            borderRadius: '5px'
                        }}>
                            <h3 style={{
                                color: '#4a7c59',
                                marginTop: 0
                            }}>
                                Плюсы
                            </h3>
                            <div dangerouslySetInnerHTML={{ __html: travel.plus }} />
                        </div>
                    )}
                    {travel.minus && (
                        <div style={{
                            backgroundColor: '#faf5f5',
                            padding: '15px',
                            borderRadius: '5px'
                        }}>
                            <h3 style={{
                                color: '#a05050',
                                marginTop: 0
                            }}>
                                Минусы
                            </h3>
                            <div dangerouslySetInnerHTML={{ __html: travel.minus }} />
                        </div>
                    )}
                </section>
            )}

            {travel.recommendation && (
                <section style={{
                    backgroundColor: '#f5f5f7',
                    padding: '20px',
                    borderRadius: '5px',
                    margin: '20px 0'
                }}>
                    <h3 style={{
                        color: '#4a7c59',
                        marginTop: 0
                    }}>
                        Рекомендации
                    </h3>
                    <div dangerouslySetInnerHTML={{ __html: travel.recommendation }} />
                </section>
            )}
        </main>

        <footer style={{
            borderTop: '1px solid #eee',
            paddingTop: '15px',
            fontSize: '12px',
            color: '#999',
            textAlign: 'center'
        }}>
            <p>Создано в приложении MyTravels</p>
        </footer>
    </div>
);

export default TravelPdfTemplate;