import React, { Suspense } from 'react';

const UpsertTravel = React.lazy(() => import('@/components/travel/UpsertTravel'));

export default function NewTravelScreen() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UpsertTravel />
        </Suspense>
    );
}