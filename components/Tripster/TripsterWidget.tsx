import React, { useEffect, useRef } from 'react';
import { Platform, Text, View } from 'react-native';

type Props = {
    points: {
        id: string;
        address: string;
    }[];
};

export default function TripsterWidget({ points }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const firstAddress = points?.[0]?.address || '';
    const firstCity = firstAddress.split(',')[0]?.trim();
    const validCity = firstCity && /^[a-zA-Zа-яА-Я\s\-]+$/.test(firstCity) ? firstCity : null;

    useEffect(() => {
        if (Platform.OS !== 'web' || !validCity || !ref.current) return;

        ref.current.innerHTML = '';
        document.getElementById('tripster-widget-script')?.remove();

        const script = document.createElement('script');
        script.id = 'tripster-widget-script';
        script.async = true;
        script.src = `https://experience.tripster.ru/partner/widget.js?` +
            `city=${encodeURIComponent(validCity)}` +
            `&view=experience&template=horizontal&mobile=list&order=top` +
            `&width=100%25&num=3&version=2&partner=metravel&features=logo` +
            `&script_id=tripster-widget-script`;

        ref.current.appendChild(script);
    }, [validCity]);

    if (Platform.OS !== 'web' || !validCity) return null;

    return (
        <View style={{ width: '100%', marginBottom: 32 }}>
            <View style={{ width: '100%', minHeight: 300 }}>
                <div ref={ref} />
            </View>
        </View>
    );
}
