const MEASUREMENT_ID = process.env.EXPO_PUBLIC_GOOGLE_GA4;
const API_SECRET = process.env.EXPO_PUBLIC_GOOGLE_API_SECRET;

const generateClientId = () => `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;

export const sendAnalyticsEvent = async (eventName, eventParams = {}) => {
    if (!MEASUREMENT_ID || !API_SECRET) {
        console.warn('GA4: Missing MEASUREMENT_ID or API_SECRET');
        return;
    }

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;
    const body = {
        client_id: generateClientId(),
        events: [
            {
                name: eventName,
                params: eventParams,
            },
        ],
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.error(`GA4 Error [${res.status}]:`, await res.text());
        } else {
            console.log(`📊 GA Event: ${eventName}`, eventParams);
        }
    } catch (error) {
        console.error('GA4 Fetch Error:', error);
    }
};
