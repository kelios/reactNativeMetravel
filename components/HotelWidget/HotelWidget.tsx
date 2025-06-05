import React, { useEffect, useRef } from 'react';
import { Platform, Text, View } from 'react-native';

type Props = {
    points: {
        id: string;
        address: string;
        coord: string;
        travelImageThumbUrl?: string;
        updated_at?: string;
        description?: string;
        categoryName?: string;
    }[];
};

export default function HotelWidget({ points }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    // Определение первого города из адреса (до первой запятой)
    const firstAddress = points?.[0]?.address || '';
    const firstCity = firstAddress.split(',')[0]?.trim();
    const validCity = firstCity && /^[a-zA-Zа-яА-Я\s\-]+$/.test(firstCity) ? firstCity : null;

    useEffect(() => {
        if (Platform.OS !== 'web' || !validCity || !ref.current) return;

        ref.current.innerHTML = '';
        document.getElementById('hotellook-widget-script')?.remove();

        const script = document.createElement('script');
        script.id = 'hotellook-widget-script';
        script.async = true;
        script.charset = 'utf-8';

        const params = new URLSearchParams({
            currency: 'usd',
            trs: '423278',
            shmarker: '637690',
            type: 'compact',
            host: 'search.hotellook.com',
            locale: 'ru',
            limit: '5',
            powered_by: 'true',
            nobooking: '',
            promo_id: '4026',
            campaign_id: '101',
            primary: '#ff8e00',
            special: '#e0e0e0',
            destination: validCity,
        });

        script.src = `https://tpwgt.com/content?${params.toString()}`;
        ref.current.appendChild(script);
    }, [validCity]);

    if (Platform.OS !== 'web' || !validCity) return null;

    return (
        <View style={{ width: '100%', marginBottom: 32 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 8 }}>
                Отели рядом
            </Text>
            <Text style={{ marginBottom: 12 }}>
                Смотри предложения отелей рядом с {validCity}.
            </Text>
            <View style={{ width: '100%', minHeight: 300 }}>
                <div ref={ref} />
            </View>
        </View>
    );
}
