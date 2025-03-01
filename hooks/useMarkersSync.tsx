import { useEffect } from 'react';
import { MarkerData, TravelFormData } from '@/src/types/types';

interface UseMarkersSyncOptions {
    formData: TravelFormData;
    setMarkers: (markers: MarkerData[]) => void;
}

/**
 * Хук для синхронизации markers с formData.coordsMeTravel.
 * Каждый раз, когда formData обновляется (например, после сохранения или загрузки данных),
 * markers тоже автоматически обновляются, чтобы всегда быть в актуальном состоянии.
 */
export const useMarkersSync = ({ formData, setMarkers }: UseMarkersSyncOptions) => {
    useEffect(() => {
        if (formData?.coordsMeTravel) {
            setMarkers(formData.coordsMeTravel);
        }
    }, [formData.coordsMeTravel, setMarkers]);
};
