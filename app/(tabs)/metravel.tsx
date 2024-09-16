import React, { Suspense} from 'react'
import ListTravel from "@/components/ListTravel";

export default function MeTravelScreen() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <ListTravel />
      </Suspense>
  );
}