import { useEffect } from 'react';
import { Platform } from 'react-native';

const GA_MEASUREMENT_ID = process.env.EXPO_PUBLIC_GOOGLE_GA4;
const YM_COUNTER_ID = process.env.EXPO_PUBLIC_YANDEX_ID;
const isLocal = process.env.EXPO_PUBLIC_IS_LOCAL_API === 'true';

export const useWebAnalytics = () => {
    useEffect(() => {

        if (Platform.OS !== 'web' || isLocal) return;
        console.log('useWebAnalytics');
        // --- Google Analytics ---
        if (!(window as any).gtag) {
            // Важно: dataLayer должен быть определён ДО подключения скрипта
            (window as any).dataLayer = (window as any).dataLayer || [];
            function gtag(...args: any[]) {
                (window as any).dataLayer.push(args);
            }
            (window as any).gtag = gtag;

            const script = document.createElement('script');
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
            script.async = true;
            document.head.appendChild(script);

            // Инициализация
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID);
        }

        // --- Яндекс Метрика ---
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
