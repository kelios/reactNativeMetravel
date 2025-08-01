import {
    Article,
    FeedbackData,
    Filters,
    FormValues,
    Travel,
    TravelFormData,
    TravelsForMap,
    TravelsMap,
} from '@/src/types/types';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----- Константы URL (определяются в зависимости от окружения) -----
let URLAPI = '';
let SEARCH_TRAVELS_FOR_MAP = '';
let LOGIN = '';
let GET_FILTER_FOR_MAP = '';
let REGISTER = '';
let LOGOUT = '';
let CONFIRM_REGISTER = '';
let SETNEWPASSWORD = '';
let RESETPASSWORDLINK = '';
let GET_LIST_COUNTRIES = '';
let CREATE_TRAVEL = '';
let SAVE_TRAVEL = '';

    URLAPI = process.env.EXPO_PUBLIC_API_URL;
    SEARCH_TRAVELS_FOR_MAP = `${URLAPI}/api/travels/search_travels_for_map`;
    GET_FILTER_FOR_MAP = `${URLAPI}/api/filterformap`;

    LOGIN = `${URLAPI}/api/user/login/`;
    LOGOUT = `${URLAPI}/api/user/logout/`;
    REGISTER = `${URLAPI}/api/user/registration/`;
    RESETPASSWORDLINK = `${URLAPI}/api/user/reset-password-link/`;
    CONFIRM_REGISTER = `${URLAPI}/api/user/confirm-registration/`;
    SETNEWPASSWORD = `${URLAPI}/api/user/set-password-after-reset/`;
    GET_LIST_COUNTRIES = `${URLAPI}/location/countries`;
    SAVE_TRAVEL = `${URLAPI}/api/travels/upsert/`;
export const SEARCH_TRAVELS_NEAR_ROUTE = `${URLAPI}/api/travels/near-route/`;


// Экспортируем некоторые пути
const SEND_AI_QUESTION = `${URLAPI}/api/chat`;
export const UPLOAD_IMAGE = `${URLAPI}/api/upload`;
const GALLERY = `${URLAPI}/api/gallery`;
const GET_TRAVELS = `${URLAPI}/api/travels`;
const GET_TRAVELS_BY_SLUG = `${URLAPI}/api/travels/by-slug`;
const GET_TRAVEL = `${URLAPI}/api/travel`;
const GET_FILTERS_TRAVEL = `${URLAPI}/api/searchextended`;
const GET_TRAVELS_NEAR = `${URLAPI}/api/travelsNear`;
const GET_TRAVELS_POPULAR = `${URLAPI}/api/travelsPopular`;
const GET_FILTERS = `${URLAPI}/api/getFiltersTravel`;
const GET_FILTERS_COUNTRY = `${URLAPI}/api/countriesforsearch`;
const SEND_FEEDBACK = `${URLAPI}/api/feedback/`;
const GET_ARTICLES = `${URLAPI}/api/articles`;
const GET_ALL_COUNTRY = `${URLAPI}/api/countries/`;

// Заглушка travelDef для "пустого" результата
const travelDef: Travel = {
    name: 'test',
    id: '498',
    travel_image_thumb_url:
        'https://metravelprod.s3.eu-north-1.amazonaws.com/6880/conversions/p9edKtQrl2wM0xC1yRrkzVJEi4B4qxkxWqSADDLM-webpTravelMainImage_400.webp',
    url: '',
    userName: '',
    slug: '',
};

// ============ АВТОРИЗАЦИЯ ============

export const loginApi = async (email: string, password: string): Promise<{
    token: string;
    name: string;
    email: string;
    id: string;
    is_superuser: boolean;
} | null> => {
    try {
        const response = await fetch(`${LOGIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Неверный email или пароль');
        }

        const json = await response.json();
        if (json.token) {
            return json; // Тут весь ответ возвращаем
        }
        return null;

    } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось выполнить вход');
        return null;
    }
};

export const logoutApi = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${LOGOUT}`, {
            method: 'POST',
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        await response.json(); // можно удалить, если бэк ничего не возвращает
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userId');

    } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось выполнить выход');
    }
};

// ============ ПАРОЛЬ ============

/*
  Обратите внимание: SENDPASSWORD не объявлен выше!
  Нужно объявить константу SENDPASSWORD = `${URLAPI}/api/user/sendpassword` или аналог.
*/
export const sendPasswordApi = async (email: string) => {
    try {
        const response = await fetch(`${SENDPASSWORD}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json = await response.json();
        if (json.success) {
            Alert.alert('Успех', 'Инструкции по восстановлению пароля отправлены на ваш email');
            return true;
        }
        Alert.alert('Ошибка', json.message || 'Не удалось отправить инструкции по восстановлению пароля');
        return false;

    } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось отправить инструкции по восстановлению пароля');
        return false;
    }
};

export const resetPasswordLinkApi = async (email: string) => {
    try {
        const response = await fetch(`${RESETPASSWORDLINK}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const json = await response.json();

        if (!response.ok) {
            // Обрабатываем ошибку валидации
            return json?.email?.[0] || json?.message || 'Ошибка';
        }

        // Возвращаем любое текстовое сообщение от сервера
        return json?.message || 'Инструкции по восстановлению отправлены.';
    } catch (error) {
        console.error(error);
        return 'Не удалось отправить инструкции по восстановлению пароля';
    }
};


export const setNewPasswordApi = async (password_reset_token: string, password: string) => {
    try {
        const response = await fetch(`${SETNEWPASSWORD}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password, password_reset_token }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json = await response.json();
        if (json.success) {
            Alert.alert('Успех', 'Пароль успешно изменен');
            return true;
        }
        Alert.alert('Ошибка', json.message || 'Не удалось изменить пароль');
        return false;

    } catch (error) {
        console.error(error);
        Alert.alert('Ошибка', 'Не удалось изменить пароль');
        return false;
    }
};

// ============ РЕГИСТРАЦИЯ ============

export const registration = async (values: FormValues): Promise<string> => {
    try {
        const response = await fetch(`${REGISTER}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        });

        const jsonResponse = await response.json();
        if (!response.ok) {
            throw new Error(jsonResponse.error || 'Ошибка регистрации');
        }

        if (jsonResponse.token) {
            await AsyncStorage.setItem('userToken', jsonResponse.token);
            await AsyncStorage.setItem('userName', jsonResponse.name);
        }
        return 'Пользователь успешно зарегистрирован. Проверьте почту для активации.';

    } catch (error: any) {
        console.error('Registration error:', error);
        return error.message || 'Произошла неизвестная ошибка.';
    }
};

// ============ TRAVEL API ============

export const fetchTravels = async (
    page: number,
    itemsPerPage: number,
    search: string,
    urlParams: Record<string, any>,
) => {
    try {
        // Формируем query-параметры с помощью URLSearchParams
        const whereObject = { ...urlParams };
        const params = new URLSearchParams({
            page: (page + 1).toString(),
            perPage: itemsPerPage.toString(),
            query: search,
            where: JSON.stringify(whereObject),
        }).toString();

        const urlTravel = `${GET_TRAVELS}?${params}`;
        const res = await fetch(urlTravel);
        return await res.json();

    } catch (e) {
        console.log('Error fetching Travels:', e);
        return [];
    }
};

export const fetchArticles = async (
    page: number,
    itemsPerPage: number,
    urlParams: Record<string, any>,
) => {
    try {
        const whereObject = { publish: 1, moderation: 1, ...urlParams };
        const params = new URLSearchParams({
            page: (page + 1).toString(),
            perPage: itemsPerPage.toString(),
            where: JSON.stringify(whereObject),
        }).toString();

        const urlArticles = `${GET_ARTICLES}?${params}`;
        const res = await fetch(urlArticles);
        return await res.json();

    } catch (e) {
        console.log('Error fetching Articles:', e);
        return [];
    }
};

export const fetchTravelsby = async (
    page: number,
    itemsPerPage: number,
    search: string,
    urlParams: Record<string, any>,
) => {
    try {
        const whereObject = {
            publish: 1,
            moderation: 1,
            countries: [3],
            ...urlParams,
        };
        const params = new URLSearchParams({
            page: (page + 1).toString(),
            perPage: itemsPerPage.toString(),
            where: JSON.stringify(whereObject),
        }).toString();

        const urlTravel = `${GET_TRAVELS}?${params}`;
        const res = await fetch(urlTravel);
        return await res.json();

    } catch (e) {
        console.log('Error fetching Travels:', e);
        return [];
    }
};

export const fetchTravel = async (id: number): Promise<Travel> => {
    try {
            const res = await fetch(`${GET_TRAVELS}/${id}`);
            return await res.json();

    } catch (e) {
        console.log('Error fetching Travel:', e);
        return travelDef;
    }
};

export const fetchTravelBySlug = async (slug: string): Promise<Travel> => {
    try {
             const res = await fetch(`${GET_TRAVELS_BY_SLUG}/${slug}`);
            return await res.json();
    } catch (e) {
        console.log('Error fetching Travel:', e);
        return travelDef;
    }
};

export const fetchArticle = async (id: number): Promise<Article> => {
    try {
        const res = await fetch(`${GET_ARTICLES}/${id}`);
        return await res.json();
    } catch (e) {
        console.log('Error fetching Article:', e);
        return travelDef as Article;
    }
};

export const fetchFilters = async (): Promise<Filters> => {
    try {
        const res = await fetch(`${GET_FILTERS}`);
        return await res.json();
    } catch (e) {
        console.log('Error fetching filters:', e);
        return [];
    }
};

export const fetchFiltersCountry = async () => {
    try {
        let resData = [];
            const res = await fetch(`${GET_FILTERS_COUNTRY}`);
            resData = await res.json();

        return resData;
    } catch (e) {
        console.log('Error fetching filters:', e);
        return [];
    }
};

export const fetchAllCountries = async () => {
    try {
        let resData = [];
        const res = await fetch(`${GET_ALL_COUNTRY}`);
        resData = await res.json();

        return resData;
    } catch (e) {
        console.log('Error fetching filters:', e);
        return [];
    }
};

export const fetchFiltersTravel = async (
    page: number,
    itemsPerPage: number,
    search: string,
    filter: Record<string, any>,
) => {
    try {
        const paramsObj = {
            page: (page + 1).toString(),
            perPage: itemsPerPage.toString(),
            query: search,
            where: JSON.stringify({
                publish: 1,
                moderation: 1,
                countries: filter?.countries,
                categories: filter?.categories,
                categoryTravelAddress: filter?.categoryTravelAddress,
                companions: filter?.companions,
                complexity: filter?.complexity,
                month: filter?.month,
                over_nights_stay: filter?.over_nights_stay,
                transports: filter?.transports,
                year: filter?.year,
            }),
        };
        const params = new URLSearchParams(paramsObj).toString();

        const urlTravel = `${GET_FILTERS_TRAVEL}?${params}`;
        const res = await fetch(urlTravel);
        return await res.json();

    } catch (e) {
        console.log('Error fetching filter travels:', e);
        return [];
    }
};

export const fetchTravelsNear = async (travel_id: number) => {
    try {
        const params = new URLSearchParams({ travel_id: travel_id.toString() }).toString();
            const urlTravel = `${GET_TRAVELS}/${travel_id}/near?${params}`;
            const res = await fetch(urlTravel);
            return await res.json();

    } catch (e) {
        console.log('Error fetching travels near:', e);
        return [];
    }
};

export const fetchTravelsPopular = async (): Promise<TravelsMap> => {
    try {
            const urlTravel = `${GET_TRAVELS}/popular`;
            const res = await fetch(urlTravel);
            return await res.json();

    } catch (e) {
        console.log('Error fetching fetchTravelsNear:', e);
        return {} as TravelsMap;
    }
};

export const fetchTravelsForMap = async (
    page: number,
    itemsPerPage: number,
    filter: Record<string, any>,
): Promise<TravelsForMap> => {
    try {
        const radius = parseInt(filter?.radius ?? '60', 10);
        const lat = filter?.lat ?? '53.9006';
        const lng = filter?.lng ?? '27.5590';

        const whereObject = {
            publish: 1,
            moderation: 1,
            lat,
            lng,
            radius,
        };

        const paramsObj = {
            page: (page + 1).toString(),
            perPage: itemsPerPage.toString(),
            where: JSON.stringify(whereObject),
        };
        const params = new URLSearchParams(paramsObj).toString();

        const urlTravel = `${SEARCH_TRAVELS_FOR_MAP}?${params}`;
        const res = await fetch(urlTravel);
        return await res.json();
    } catch (e) {
        console.log('Error fetching fetchTravelsForMap:', e);
        return [];
    }
};


export const fetchTravelsNearRoute = async (
    routeCoords: [number, number][], // массив [lng, lat]
    toleranceKm: number = 5, // радиус в километрах от маршрута
): Promise<TravelsForMap> => {
    try {
        const body = {
            route: {
                type: 'LineString',
                coordinates: routeCoords,
            },
            tolerance: toleranceKm,
        };

        const res = await fetch(SEARCH_TRAVELS_NEAR_ROUTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            console.log('Ошибка при загрузке маршрута:', await res.text());
            return [];
        }

        return await res.json();
    } catch (e) {
        console.log('Error fetching fetchTravelsNearRoute:', e);
        return [];
    }
};

export const fetchFiltersMap = async (): Promise<Filters> => {
    try {
        const res = await fetch(`${GET_FILTER_FOR_MAP}`);
        return await res.json();
    } catch (e) {
        console.log('Error fetching filters:', e);
        return [];
    }
};

export const fetchCounties = async (): Promise<Filters> => {
    try {
        const res = await fetch(`${GET_LIST_COUNTRIES}`);
        return await res.json();
    } catch (e) {
        console.log('Error fetching filters:', e);
        return [];
    }
};

export const sendFeedback = async (
    name: string,
    email: string,
    message: string
): Promise<string> => {
    try {
        const res = await fetch(SEND_FEEDBACK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message }),
        });

        const json = await res.json();

        if (!res.ok) {
            // Разбор поля с ошибками
            const firstError =
                json?.email?.[0] ||
                json?.name?.[0] ||
                json?.message?.[0] ||
                json?.detail ||
                'Ошибка при отправке.';
            throw new Error(firstError);
        }

        return typeof json === 'string'
            ? json
            : json?.message || 'Сообщение успешно отправлено';
    } catch (e: any) {
        console.error('Ошибка при отправке обратной связи:', e);
        throw new Error(e?.message || 'Не удалось отправить сообщение');
    }
};

export const confirmAccount = async (hash: string) => {
    try {
        const response = await fetch(CONFIRM_REGISTER, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hash }),
        });

        const jsonResponse = await response.json();
        if (jsonResponse.userToken) {
            await AsyncStorage.setItem('userToken', jsonResponse.userToken);
            await AsyncStorage.setItem('userName', jsonResponse.userName);
        }
        return jsonResponse;

    } catch (error: any) {
        throw new Error(error.message || 'Произошла ошибка при подтверждении учетной записи.');
    }
};

export const saveFormData = async (data: TravelFormData): Promise<TravelFormData> => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
            throw new Error('Пользователь не авторизован');
        }

        const response = await fetch(SAVE_TRAVEL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Ошибка при создании записи на сервере');
        }

        const responseData = await response.json();
        console.log('Данные успешно сохранены:', responseData);
        return responseData;

    } catch (error) {
        console.error('Ошибка при создании формы:', error);
        throw error;
    }
};

export const uploadImage = async (data: FormData): Promise<any> => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        throw new Error('Пользователь не авторизован');
    }

    const response = await fetch(UPLOAD_IMAGE, {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body: data,
    });

    if (response.status === 200) {
        const responseData = await response.json();
        return responseData;
    } else {
        return 'Upload failed.';
    }
};

export const deleteImage = async (imageId: string) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
        throw new Error('Пользователь не авторизован');
    }

    const response = await fetch(`${GALLERY}/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Token ${token}` },
    });

    if (response.status === 204) {
        return response;
    } else {
        throw new Error('Ошибка удаления изображения');
    }
};

export const deleteTravel = async (id: string) => {
    try {
        const response = await fetch(`${GET_TRAVELS}/${id}`, { method: 'DELETE' });
        if (response.status !== 204) {
            throw new Error('Ошибка при удалении путешествия');
        }
        return response;
    } catch (error) {
        console.error('Ошибка при удалении путешествия:', error);
        throw error;
    }
};

export const sendAIMessage = async (inputText: string) => {
    try {

        const response = await fetch(SEND_AI_QUESTION, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:  JSON.stringify({ message: inputText }),
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Ошибка:', error);
    }
};
