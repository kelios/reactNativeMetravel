import React, { Suspense} from 'react'
import ListTravel from "@/components/listTravel/ListTravel";

export default function MeTravelScreen() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <ListTravel />
      </Suspense>
  );
}