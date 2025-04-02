const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GOOGLE_GA4; // Замени на свой GA4 ID
const API_SECRET = process.env.EXPO_PUBLIC_GOOGLE_API_SECRET; // Вставь свой API Secret

export const sendAnalyticsEvent = async (eventName, eventParams = {}) => {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

    const body = {
        client_id: 'expo_client_' + Math.random().toString(36).substring(2, 15), // Генерируем случайный ID
        events: [{ name: eventName, params: eventParams }],
    };

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        console.log(`📊 GA Event: ${eventName}`, eventParams);
    } catch (error) {
        console.error('GA4 Error:', error);
    }
};