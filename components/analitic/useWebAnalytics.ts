import { useEffect } from 'react';
import { Platform } from 'react-native';

const GA_MEASUREMENT_ID = process.env.EXPO_PUBLIC_GOOGLE_GA4;
const YM_COUNTER_ID = process.env.EXPO_PUBLIC_YANDEX_ID;
const isLocal = process.env.EXPO_PUBLIC_IS_LOCAL_API === 'true';

export const useWebAnalytics = () => {
    useEffect(() => {
        if (Platform.OS !== 'web' || isLocal ) return;

        // GA4
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(gaScript);

        gaScript.onload = () => {
            (window as any).dataLayer = (window as any).dataLayer || [];
            function gtag(...args: any[]) {
                (window as any).dataLayer.push(args);
            }
            gtag('js', new Date());
            gtag('config', GA_MEASUREMENT_ID);
        };

        // Yandex Metrika
        const ymScript = document.createElement('script');
        ymScript.async = true;
        ymScript.src = 'https://mc.yandex.ru/metrika/tag.js';
        document.head.appendChild(ymScript);

        (window as any).ym =
            (window as any).ym ||
            function (...args: any[]) {
                ((window as any).ym.a = (window as any).ym.a || []).push(args);
            };
        (window as any).ym.l = 1 * new Date();

        (window as any).ym(YM_COUNTER_ID, 'init', {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            ecommerce: 'dataLayer',
        });
    }, []);
};
