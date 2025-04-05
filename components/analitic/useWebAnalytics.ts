import { useEffect } from 'react';
import { Platform } from 'react-native';

export const useWebAnalytics = () => {
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const YM_COUNTER_ID = process.env.EXPO_PUBLIC_YANDEX_ID;
        const isLocal = process.env.EXPO_PUBLIC_IS_LOCAL_API === 'true';

        if (isLocal) return;

        // --- Yandex Metrica ---
        if (!(window as any).ym) {
            const ymScript = document.createElement('script');
            ymScript.src = 'https://mc.yandex.ru/metrika/tag.js';
            ymScript.async = true;
            document.head.appendChild(ymScript);

            (window as any).ym = function (...args: any[]) {
                ((window as any).ym.a = (window as any).ym.a || []).push(args);
            };
            (window as any).ym.l = 1 * new Date();

            (window as any).ym(YM_COUNTER_ID, 'init', {
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: true,
                ecommerce: 'dataLayer',
            });
        }
    }, []);
};
