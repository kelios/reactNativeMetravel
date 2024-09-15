import React, { Suspense } from 'react';

const UpsertTravel = React.lazy(() => import('@/components/UpsertTravel'));

export default function EditTravelScreen() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <UpsertTravel />
      </Suspense>
  );
}