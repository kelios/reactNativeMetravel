export const MANUAL_IDS: Record<string, string> = {
    'москва': '1702',
    'moscow': '1702',
    'санкт-петербург': '12196',
    'saint petersburg': '12196',
    'париж': '15542',
    'paris': '15542',
    'рим': '13559',
    'rome': '13559',
    'roma': '13559',
    'барселона': '1397',
    'barcelona': '1397',
    'берлин': '1398',
    'berlin': '1398',
    'лондон': '1399',
    'london': '1399',
    'прага': '1400',
    'prague': '1400',
    'амстердам': '1401',
    'amsterdam': '1401',
    'вена': '1295',
    'vienna': '1295',
    'будапешт': '1403',
    'budapest': '1403',
    'вильнюс': '8732',
    'vilnius': '8732',
    'таллин': '1405',
    'tallinn': '1405',
    'рига': '1406',
    'riga': '1406',
    'варшава': '2200',
    'warsaw': '2200',
    'warszawa': '2200',
    'минск': '6202',
    'витебск': '6203',
    'гомель': '6200',
    'гродно': '6201',
    'могилев': '1416560',
    'брест': '6199',
    'влёра': '6304',
    'vlora': '6304',
    'vlorë': '6304',
    'авлона': '6304',
    'краков': '2118',
    'kraków': '2118',
    'krakow': '2118',
    'закопане':'2211',
    'cандомир':'1420434',
    'sandomierz':'1420434',
    'santo domingo': '4026',
    'калангут':'23802'
};

export const TRIPSTER_CITY_NAMES: Record<string, string> = {
    'москва': 'moscow',
    'moscow': 'moscow',
    'санкт-петербург': 'saint-petersburg',
    'saint petersburg': 'saint-petersburg',
    'париж': 'paris',
    'paris': 'paris',
    'рим': 'rome',
    'rome': 'rome',
    'roma': 'rome',
    'барселона': 'barcelona',
    'barcelona': 'barcelona',
    'берлин': 'berlin',
    'berlin': 'berlin',
    'лондон': 'london',
    'london': 'london',
    'прага': 'prague',
    'prague': 'prague',
    'амстердам': 'amsterdam',
    'amsterdam': 'amsterdam',
    'вена': 'vienna',
    'vienna': 'vienna',
    'будапешт': 'budapest',
    'budapest': 'budapest',
    'вильнюс': 'vilnius',
    'vilnius': 'vilnius',
    'таллин': 'tallinn',
    'tallinn': 'tallinn',
    'рига': 'riga',
    'riga': 'riga',
    'варшава': 'warsaw',
    'warsaw': 'warsaw',
    'warszawa': 'warsaw',
    'краков': 'krakow',
    'krakow': 'krakow',
    'kraków': 'krakow',

    'минск': 'minsk',
    'витебск': 'vitebsk',
    'гомель': 'gomel',
    'гродно': 'grodno',
    'могилев': 'mogilev',
    'брест': 'brest',
};

export const CITY_ALIASES: Record<string, string[]> = {
    'влёра': ['vlora', 'vlorë', 'авлона'],
    'варшава': ['warszawa', 'warsaw'],
    'вена': ['vienna', 'wien'],
    'краков': ['kraków', 'krakow'],
};

export const CITY_CACHE = new Map<string, string | null>();

export const normalize = (str: string): string =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const transliterate = (text: string): string => {
    const ru: Record<string, string> = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    return text.split('').map(char => ru[char.toLowerCase()] || char).join('');
};

export function findCityName(term: string): string | null {
    const cleanTerm = term.replace(/\s*\(.*?\)\s*/g, '').trim();
    const lowerTerm = cleanTerm.toLowerCase();
    const normalized = normalize(lowerTerm);
    const transliterated = transliterate(lowerTerm);
    const formsToTry = [lowerTerm, normalized, transliterated.toLowerCase()];

    for (const form of formsToTry) {
        if (MANUAL_IDS[form]) {
            return MANUAL_IDS[form];
        }
    }

    for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
        if ([city, ...aliases].some(alias => formsToTry.includes(alias.toLowerCase()))) {
            const id = MANUAL_IDS[city];
            if (id) {
                return id;
            }
        }
    }

    return null;
}

export function findTripsterCitySlug(term: string): string | null {
    const cleanTerm = term.replace(/\s*\(.*?\)\s*/g, '').trim();
    const lowerTerm = cleanTerm.toLowerCase();
    const normalized = normalize(lowerTerm);
    const transliterated = transliterate(lowerTerm);
    const formsToTry = [lowerTerm, normalized, transliterated.toLowerCase()];

    for (const form of formsToTry) {
        if (TRIPSTER_CITY_NAMES[form]) {
            return TRIPSTER_CITY_NAMES[form];
        }
    }

    for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
        if ([city, ...aliases].some(alias => formsToTry.includes(alias.toLowerCase()))) {
            const slug = TRIPSTER_CITY_NAMES[city];
            if (slug) {
                return slug;
            }
        }
    }

    return null;
}

export async function findCityId(term: string): Promise<string | null> {
    const cleanTerm = term.replace(/\s*\(.*?\)\s*/g, '').trim();
    const lowerTerm = cleanTerm.toLowerCase();
    const normalized = normalize(lowerTerm);
    const transliterated = transliterate(lowerTerm);
    const formsToTry = [lowerTerm, normalized, transliterated.toLowerCase()];

    for (const form of formsToTry) {
        if (CITY_CACHE.has(form)) return CITY_CACHE.get(form)!;
        if (MANUAL_IDS[form]) {
            CITY_CACHE.set(form, MANUAL_IDS[form]);
            return MANUAL_IDS[form];
        }
    }

    for (const [city, aliases] of Object.entries(CITY_ALIASES)) {
        if ([city, ...aliases].some(alias => formsToTry.includes(alias.toLowerCase()))) {
            const id = MANUAL_IDS[city];
            if (id) {
                CITY_CACHE.set(lowerTerm, id);
                return id;
            }
        }
    }

    for (const lang of ['ru', 'en', 'de', 'it']) {
        try {
            const url = `https://engine.hotellook.com/api/v2/lookup.json?query=${encodeURIComponent(cleanTerm)}&lang=${lang}&lookFor=city&limit=5`;
            const response = await fetch(url);
            const data = await response.json();

            if (data?.results?.cities?.length) {
                const cities = data.results.cities;
                const exact = cities.find((c: any) =>
                    formsToTry.includes(c.name?.toLowerCase()) ||
                    formsToTry.includes(c.name_translit?.toLowerCase())
                );
                const found = exact || cities[0];
                if (found?.id && found.name) {
                    const cityId = String(found.id);
                    const key = normalize(found.name.toLowerCase());
                    MANUAL_IDS[key] = cityId;
                    CITY_CACHE.set(key, cityId);
                    return cityId;
                }
            }
        } catch {}
    }

    CITY_CACHE.set(lowerTerm, null);
    return null;
}

export async function findCityByCoords(lat: number, lon: number): Promise<string | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`;
        const response = await fetch(url);
        const data = await response.json();

        const cityName =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county;

        if (cityName) return await findCityId(cityName);
    } catch {}
    return null;
}
