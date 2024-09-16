import React, { Suspense} from 'react';
import ListTravel from "@/components/ListTravel";

export default function TravelScreen() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <ListTravel />
      </Suspense>
  );
}
