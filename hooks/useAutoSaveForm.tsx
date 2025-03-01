import { useEffect, useRef, useState } from 'react';

interface AutoSaveOptions {
    debounce?: number;
    onSave: (formData: any) => Promise<any>;
    onSuccess?: () => void;
    onError?: (error: unknown) => void;
}

export function useAutoSaveForm<T>(formData: T, options: AutoSaveOptions) {
    const { debounce = 5000, onSave, onSuccess, onError } = options;

    const [originalData, setOriginalData] = useState<T>(formData);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isDataChanged = (a: T, b: T) => {
        return JSON.stringify(a) !== JSON.stringify(b);
    };

    // Обновляем оригинальные данные после успешного сохранения
    const updateOriginalData = (newData: T) => {
        setOriginalData(newData);
    };

    // Автосохранение с дебаунсом
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            if (isDataChanged(formData, originalData)) {
                try {
                    const savedData = await onSave(formData);
                    updateOriginalData(savedData);

                    onSuccess?.();
                } catch (error) {
                    onError?.(error);
                }
            }
        }, debounce);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [formData, originalData, debounce, onSave, onSuccess, onError]);

    // Функция для сброса originalData вручную (например, после первой загрузки данных)
    const resetOriginalData = (data: T) => {
        setOriginalData(data);
    };

    return { resetOriginalData };
}
