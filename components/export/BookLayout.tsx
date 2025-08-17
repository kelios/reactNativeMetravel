import React, { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchTravel } from "@/src/api/travels";
import BookPageData from "./BookPageData";

type Minimal = { id: number } & Record<string, any>;

export default function BookLayout({ travels }: { travels: Minimal[] }) {
    const queryClient = useQueryClient();

    const ids = useMemo(
        () => travels.map((t) => Number(t.id)).filter((n) => Number.isFinite(n)),
        [travels]
    );

    useEffect(() => {
        ids.forEach((id) => {
            queryClient.prefetchQuery({
                queryKey: ["travel", String(id)],
                queryFn: () => fetchTravel(id),
                staleTime: 10 * 60_000,
            });
        });
    }, [ids, queryClient]);

    return (
        <div className="bookRoot">
            {ids.map((id) => (
                <div key={id} className="bookSheet">
                    <BookPageData id={id} />
                </div>
            ))}
        </div>
    );
}
