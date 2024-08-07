import {Article, FeedbackData, Filters, FormValues, Travel, TravelsForMap, TravelsMap,} from '@/src/types/types'
import queryString from 'query-string'
import {IS_LOCAL_API, LOCAL_API_URL, PROD_API_URL} from '@env'
import {Alert} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let URLAPI = ''
let SEARCH_TRAVELS_FOR_MAP = ''
let LOGIN = ''
let GET_FILTER_FOR_MAP = ''
let REGISTER = ''
let LOGOUT = ''
//let SENDPASSWORD = ''
//let SETNEWPASSWORD = ''
let RESETPASSWORDLINK = ''
let GET_LIST_COUNTRIES = ''

if (IS_LOCAL_API == 'true') {
    URLAPI = LOCAL_API_URL
    SEARCH_TRAVELS_FOR_MAP = `${URLAPI}/api/travels/search_travels_for_map`
    GET_FILTER_FOR_MAP = `${URLAPI}/api/filterformap`

    LOGIN = `${URLAPI}/api/user/login/`
    LOGOUT = `${URLAPI}/api/user/logout/`
    REGISTER = `${URLAPI}/api/user/registration/`
    RESETPASSWORDLINK = `${URLAPI}/api/user/reset-password-link/`
   // SENDPASSWORD = `${URLAPI}/api/sendpassword`
   // SETNEWPASSWORD = `${URLAPI}/api/setpassword`
    GET_LIST_COUNTRIES = `${URLAPI}/location/countries`
} else {
    URLAPI = PROD_API_URL
    SEARCH_TRAVELS_FOR_MAP = `${URLAPI}/api/searchTravelsForMap`
    LOGIN = `${URLAPI}/api/user/login/`
    LOGOUT = `${URLAPI}/api/user/logout/`
    REGISTER = `${URLAPI}/api/registration/`
    GET_FILTER_FOR_MAP = `${URLAPI}/api/getFilterForMap`
    GET_LIST_COUNTRIES = `${URLAPI}/location/countries`
}

const GET_TRAVELS = `${URLAPI}/api/travels`
const GET_TRAVEL = `${URLAPI}/api/travel`
const GET_FILTERS_TRAVEL = `${URLAPI}/api/searchextended`
const GET_TRAVELS_NEAR = `${URLAPI}/api/travelsNear`
const GET_TRAVELS_POPULAR = `${URLAPI}/api/travelsPopular`

const GET_FILTERS = `${URLAPI}/api/getFiltersTravel`
const GET_FILTERS_COUNTRY = `${URLAPI}/api/countriesforsearch`
const SEND_FEEDBACK = `${URLAPI}/api/feedback`
const GET_ARTICLES = `${URLAPI}/api/articles`


const travelDef = {
    name: 'test',
    id: '498',
    travel_image_thumb_url:
        'https://metravelprod.s3.eu-north-1.amazonaws.com/6880/conversions/p9edKtQrl2wM0xC1yRrkzVJEi4B4qxkxWqSADDLM-webpTravelMainImage_400.webp',
    url: '',
    userName: '',
    slug: '',
}

export const loginApi = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await fetch(`${LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json = await response.json();

        if (json.token) {
            await AsyncStorage.setItem('userToken', json.token);
            await AsyncStorage.setItem('userName', json.name);
            return true;
        }

        return false;
    } catch (error) {
        console.error(error);
        Alert.alert("Ошибка", "Не удалось выполнить вход");
        return false;
    }
};

export const sendPasswordApi = async (
    email: string,
) => {
    try {
        const response = await fetch(`${SENDPASSWORD}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json = await response.json();

        if (json.success) {
            Alert.alert("Успех", "Инструкции по восстановлению пароля отправлены на ваш email");
            return true;
        }

        Alert.alert("Ошибка", json.message || "Не удалось отправить инструкции по восстановлению пароля");
        return false;
    } catch (error) {
        console.error(error);
        Alert.alert("Ошибка", "Не удалось отправить инструкции по восстановлению пароля");
        return false;
    }
};

export const resetPasswordLinkApi = async (
    email: string,
) => {
    try {
        const response = await fetch(`${RESETPASSWORDLINK}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            }),
        });
        const json = await response.json();
        console.log(response.ok);
        if (!response.ok) {
            return json?.email[0];
        }

        if (json.success) {
            return 'Инструкции по восстановлению пароля отправлены на ваш email';
        }

        return false;
    } catch (error) {
        console.error(error);
        return 'Не удалось отправить инструкции по восстановлению пароля';
    }
};

export const setNewPasswordApi = async (
    token: string,
    email: string,
) => {
    try {
        const response = await fetch(`${SETNEWPASSWORD}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                token: token
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json = await response.json();

        if (json.success) {
            Alert.alert("Успех", "Пароль успешно изменен");
            return true;
        }

        Alert.alert("Ошибка", json.message || "Не удалось изменить пароль");
        return false;
    } catch (error) {
        console.error(error);
        Alert.alert("Ошибка", "Не удалось изменить пароль");
        return false;
    }
};

export const logoutApi = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch(`${LOGOUT}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Token ' + token,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json = await response.json();
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userToken');
   } catch (error) {
        console.error(error);
        Alert.alert("Ошибка", "Не удалось выполнить выход");
    }
};

export const registration = async (
    values: FormValues,
) => {
    try {
        const response = await fetch(`${REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });
        const json = await response.json();
        if (json.token) {
            // Сохраняем токен в AsyncStorage
            await AsyncStorage.setItem('userToken', json.token);
            await AsyncStorage.setItem('userName', json.name);
        }
    } catch (error) {
        console.error(error);
    }
};


export const fetchTravels = async (
    page: number,
    itemsPerPage: number,
    search: string,
    urlParams: Record<string, any>,
) => {
    try {
        const whereObject = {publish: 1, moderation: 1, ...urlParams}
        const params = {
            page: page + 1,
            perPage: itemsPerPage,
            query: search,
            where: JSON.stringify(whereObject),
        }
        const urlTravel = queryString.stringifyUrl({
            url: GET_TRAVELS,
            query: params,
        })
        const res = await fetch(urlTravel)
        const resData = await res.json()
        return resData
        // return resData.data+resData.total
    } catch (e) {
        console.log('Error fetching Travels: ' + e)
        return []
    }
}

export const fetchArticles = async (
    page: number,
    itemsPerPage: number,
    urlParams: Record<string, any>,
) => {
    try {
        const whereObject = {publish: 1, moderation: 1, ...urlParams}
        const params = {
            page: page + 1,
            perPage: itemsPerPage,
            where: JSON.stringify(whereObject),
        }
        const urlTravel = queryString.stringifyUrl({
            url: GET_ARTICLES,
            query: params,
        })
        const res = await fetch(urlTravel)
        const resData = await res.json()
        return resData
        // return resData.data+resData.total
    } catch (e) {
        console.log('Error fetching Travels: ' + e)
        return []
    }
}

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
        }
        const params = {
            page: page + 1,
            perPage: itemsPerPage,
            where: JSON.stringify(whereObject),
        }
        const urlTravel = queryString.stringifyUrl({
            url: GET_TRAVELS,
            query: params,
        })
        const res = await fetch(urlTravel)
        const resData = await res.json()
        return resData
    } catch (e) {
        console.log('Error fetching Travels: ')
        return []
    }
}

export const fetchTravel = async (id: number): Promise<Travel> => {
    try {
        if (IS_LOCAL_API == 'true') {
            const res = await fetch(`${GET_TRAVELS}/${id}`)
            const resData = await res.json()
            return resData
        } else {
            const res = await fetch(`${GET_TRAVEL}?id=${id}`)
            const resData = await res.json()
            return resData
        }
    } catch (e) {
        console.log('Error fetching Travel: ' + e)
        return travelDef
    }
}

export const fetchArticle = async (id: number): Promise<Article> => {
    try {
        const res = await fetch(`${GET_ARTICLES}/${id}`)
        const resData = await res.json()
        return resData
    } catch (e) {
        console.log('Error fetching Article: ' + e)
        return travelDef
    }
}

export const fetchFilters = async (): Promise<Filters> => {
    try {
        const res = await fetch(`${GET_FILTERS}`)
        const resData = await res.json()
        return resData
    } catch (e) {
        console.log('Error fetching filters: ' + e)
        return []
    }
}

export const fetchFiltersCountry = async () => {
    try {
        let resData = []
        if (IS_LOCAL_API == 'true') {
            const res = await fetch(`${GET_FILTERS_COUNTRY}`)
            resData = await res.json()
            return resData
        } else {
            resData = [{country_id: '3', title_ru: 'Belarus'}]
            return resData
        }
    } catch (e) {
        console.log('Error fetching filters: ' + e)
        return []
    }
}

export const fetchFiltersTravel = async (
    page: number,
    itemsPerPage: number,
    search: string,
    filter: {},
) => {
    try {
        const params = {
            page: page + 1,
            perPage: itemsPerPage,
            query: search,
            where: JSON.stringify({
                publish: 1,
                moderation: 1,
                countries: filter?.countries,
                categories: filter?.categories,
                categoryTravelAddress: filter?.categoryTravelAddress,
                companion: filter?.companion,
                complexity: filter?.complexity,
                month: filter?.month,
                overNightStay: filter?.overNightStay,
                transports: filter?.transports,
                year: filter?.year,
            }),
        }
        const urlTravel = queryString.stringifyUrl({
            url: GET_FILTERS_TRAVEL,
            query: params,
        })
        const res = await fetch(urlTravel)
        const resData = await res.json()

        return resData
    } catch (e) {
        console.log('Error fetching Travels: ')
        return []
    }
}

export const fetchTravelsNear = async (travel_id: number) => {
    try {
        const params = {
            travel_id: travel_id,
        }
        if (IS_LOCAL_API == 'true') {
            //${URLAPI}/api/travels/${travel_id}/near/
            const urlTravel = queryString.stringifyUrl({
                url: GET_TRAVELS + '/' + travel_id + '/near',
                query: params,
            })
            const res = await fetch(urlTravel)
            const resData = await res.json()
            return resData
        } else {
            const urlTravel = queryString.stringifyUrl({
                url: GET_TRAVELS_NEAR,
                query: params,
            })
            const res = await fetch(urlTravel)
            const resData = await res.json()
            return resData
        }
    } catch (e) {
        console.log('Error fetching fetchTravelsNear: ')
        return []
    }
}

export const fetchTravelsPopular = async (): Promise<TravelsMap> => {
    try {
        if (IS_LOCAL_API == 'true') {
            //${URLAPI}/api/travels/${travel_id}/near/
            const urlTravel = queryString.stringifyUrl({
                url: GET_TRAVELS + '/popular',
            })
            const res = await fetch(urlTravel)
            const resData = await res.json()
            return resData
        } else {
            const urlTravel = queryString.stringifyUrl({
                url: GET_TRAVELS_POPULAR,
            })
            const res = await fetch(urlTravel)
            const resData = await res.json()
            return resData
        }
    } catch (e) {
        console.log('Error fetching fetchTravelsNear: ')
    }
}

/*filter: {},
) => {
  try {
    const params = {
      page: page + 1,
      perPage: itemsPerPage,
      query: search,
      where: JSON.stringify({
        publish: 1,
        moderation: 1,
        countries: filter?.countries,
        categories: filter?.categories,
        categoryTravelAddress: filter?.categoryTravelAddress,
        companion: filter?.companion,
        complexity: filter?.complexity,
        month: filter?.month,
        overNightStay: filter?.overNightStay,
        transports: filter?.transports,
        year: filter?.year,
      }),
    }
    const urlTravel = queryString.stringifyUrl({
      url: GET_FILTERS_TRAVEL,
      query: params,
    }) */

export const fetchTravelsForMap = async (
    page: number,
    itemsPerPage: number,
    filter: {},
): Promise<TravelsForMap> => {
    try {
        console.log(filter)
        const radius = filter?.radius[0] ?? 60
        const whereObject = {
            publish: 1,
            moderation: 1,
            lat: 50.0170649,
            lng: 19.8933367,
            radius: {id: radius, name: radius},
            categories: [],
            address: null,
        }
        console.log(radius)
        if (filter?.categories?.length > 0) {
            filter?.categories.forEach((category, index) => {
                whereObject.categories[index] = {id: category, name: category}
            })
        }

        if (filter?.address.length) {
            whereObject.address = filter?.address
        }

        // {"lat":50.0170649,"lng":19.8933367,"radius":{"id":60,"name":60}}
        const params = {
            page: page + 1,
            perPage: itemsPerPage,
            query: filter,
            where: JSON.stringify(whereObject),
        }
        const urlTravel = queryString.stringifyUrl({
            url: SEARCH_TRAVELS_FOR_MAP,
            query: params,
        })
        const res = await fetch(urlTravel)
        const resData = await res.json()
        return resData
    } catch (e) {
        console.log('Error fetching fetchTravelsNear: ')
        return []
    }
}

export const fetchFiltersMap = async (): Promise<Filters> => {
    try {
        const res = await fetch(`${GET_FILTER_FOR_MAP}`)
        const resData = await res.json()
        return resData
    } catch (e) {
        console.log('Error fetching filters: ' + e)
        return []
    }
}

export const fetchCounties = async (): Promise<Filters> => {
    try {
        const res = await fetch(`${GET_LIST_COUNTRIES}`)
        const resData = await res.json()
        return resData
    } catch (e) {
        console.log('Error fetching filters: ' + e)
        return []
    }
}

export const sendFeedback = async (
    name: string,
    email: string,
    message: string,
) => {
    try {
        const res = await fetch(SEND_FEEDBACK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({name, email, message} as FeedbackData),
        })
        if (!res.ok) {
            throw new Error(`Server responded with status: ${res.status}`)
        }
    } catch (e) {
        console.log('Error fetching filters: ' + e)
    }
}
