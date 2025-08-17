import React from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchTravel } from "@/src/api/travels";
import BookPageView from "./BookPageView";

export default function BookPageData({ id }: { id: number }) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["travel", String(id)],
        queryFn: () => fetchTravel(id),
        staleTime: 10 * 60_000,
        placeholderData: keepPreviousData,
    });

    if (isLoading) {
        return (
            <div className="book-page">
                <div className="hero skeleton" />
                <div className="metaRow">
                    <div className="metaCol">
                        <div className="metaItem skeleton-line" />
                        <div className="metaItem skeleton-line" />
                        <div className="metaItem skeleton-line short" />
                    </div>
                    <div className="miniMap">
                        <div className="miniMapStub skeleton" />
                    </div>
                </div>
                <div className="section">
                    <div className="skeleton-paragraph" />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="book-page">
                <div style={{ padding: 16, color: "#a00" }}>
                    Не удалось загрузить путешествие #{id}
                </div>
            </div>
        );
    }

    return <BookPageView travel={data} />;
}
