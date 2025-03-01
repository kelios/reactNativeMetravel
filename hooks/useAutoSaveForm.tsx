import { useEffect, useRef } from 'react';
import _isEqual from 'lodash/isEqual';

interface Options<T> {
    debounce?: number;
    onSave: (data: T) => Promise<T>;
    onSuccess?: (savedData: T) => void;
    onError?: (error: any) => void;
}

export function useAutoSaveForm<T>(formData: T, options: Options<T>) {
    const { debounce = 5000, onSave, onSuccess, onError } = options;

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const originalDataRef = useRef<T>(formData); // Тут храним исходник

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(async () => {
            if (!deepEqual(formData, originalDataRef.current)) {
                try {
                    const savedData = await onSave(formData);
                    originalDataRef.current = savedData; // Обновили эталон
                    onSuccess?.(savedData);
                } catch (err) {
                    onError?.(err);
                }
            }
        }, debounce);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [formData]);

    const resetOriginalData = (newData: T) => {
        originalDataRef.current = newData;
    };

    return { resetOriginalData };
}

function deepEqual(a: any, b: any): boolean {
    return _isEqual(a, b); // lodash умеет сравнивать глубоко (вложенные объекты и массивы)
}
