import React from "react";

export default function BookTocPage({ travels }: { travels: any[] }) {
    return (
        <section className="pdf-page toc-page">
            <style>{`
                .toc-page { padding: 20mm; }
                .toc-title { 
                    font-size: 24pt; 
                    font-weight: 800; 
                    margin-bottom: 10mm;
                    text-align: center;
                }
                .toc-list { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr;
                    gap: 5mm;
                    font-size: 11pt;
                }
                .toc-item { 
                    break-inside: avoid;
                    margin-bottom: 3mm;
                }
                .toc-item-name { font-weight: 600; }
                .toc-item-meta { 
                    font-size: 10pt; 
                    color: #666;
                    margin-top: 1mm;
                }
            `}</style>

            <h2 className="toc-title">Оглавление</h2>
            <div className="toc-list">
                {travels.map((travel, index) => (
                    <div key={travel.id} className="toc-item">
                        <div className="toc-item-name">
                            {index + 1}. {travel.name}
                        </div>
                        <div className="toc-item-meta">
                            {travel.countryName || travel.country?.name} • {travel.year}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}