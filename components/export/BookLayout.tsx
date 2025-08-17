import React, { useEffect } from "react";
import BookPageView from "./BookPageView";
import BookCoverPage from "./BookCoverPage";
import BookTocPage from "./BookTocPage";

interface BookLayoutProps {
    travels: Array<{
        id: number | string;
        name: string;
        countryName?: string;
        year?: number | string;
        [key: string]: any;
    }>;
}

const BookLayout: React.FC<BookLayoutProps> = ({ travels }) => {
    return (
        <div style={{
            width: "100%",
            backgroundColor: "#f5f5f5"
        }}>
            {/* Титульная страница */}
            <BookCoverPage count={travels.length} />

            {/* Оглавление */}
            <BookTocPage travels={travels} />

            {/* Страницы с путешествиями */}
            {travels.map((travel, index) => (
                <BookPageView
                    key={travel.id}
                    travel={travel}
                    pageNumber={index + 1}
                />
            ))}
        </div>
    );
};

export default BookLayout;