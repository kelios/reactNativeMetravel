import React from "react";

export default function BookCoverPage({ count }: { count: number }) {
    return (
        <section className="pdf-page cover-page">
            <style>{`
                .cover-page { 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    text-align: center;
                    background: linear-gradient(135deg, #4a7c59 0%, #2c4e3a 100%);
                    color: white;
                }
                .cover-title {
                    font-size: 36pt;
                    font-weight: 800;
                    margin-bottom: 20mm;
                }
                .cover-subtitle {
                    font-size: 18pt;
                    margin-bottom: 30mm;
                }
                .cover-count {
                    font-size: 14pt;
                    margin-top: auto;
                }
            `}</style>

            <h1 className="cover-title">Мои путешествия</h1>
            <p className="cover-subtitle">Сборник впечатлений и воспоминаний</p>
            <p className="cover-count">{count} путешествий</p>
        </section>
    );
}