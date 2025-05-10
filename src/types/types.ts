export type Travel = {
    id: number
    slug: string

    name: string
    travel_image_thumb_url: string
    travel_image_thumb_small_url: string
    url: string
    youtube_link: string
    userName: string
    description: string
    recommendation: string
    plus: string
    minus: string
    cityName: string
    countryName: string
    countUnicIpView: string
    gallery: String[]
    travelAddress: String[]
    userIds: string
    year: string
    monthName: string
    number_days: number
    companions: String[]
}

export type TravelCoords = {
    address?: string
    categoryName: string
    coord?: string
    lat: string
    lng: string
    travelImageThumbUrl: string
    urlTravel: string
    articleUrl?: string
}

export type TravelInfo = {
    name: string
    url: string
    publish: boolean
    moderation: boolean
    countryName: string
    travel_image_thumb_url: string
    travel_image_thumb_small_url: string
    slug: string
    id: number
}

export type TravelsMap = {
    [key: string]: TravelInfo
}

export type TravelsForMap = {
    [key: number]: TravelCoords
}

export type Travels = {
    data: {
        id: number
        slug: string

        name: string
        travel_image_thumb_url: string
        travel_image_thumb_small_url: string
        url: string

        userName: string
        description: string
        cityName: string
        countryName: string
        countUnicIpView: string
    }
    total: number
}

export type Articles = {
    data: {
        id?: number
        name: string
        description: string
        article_image_thumb_url: string
        article_image_thumb_small_url: string
        article_type: ArticleType
    }
    total: number
}

export type Article = {
    id?: number
    name: string
    description: string
    article_image_thumb_url: string
    article_image_thumb_small_url: string
    article_type: ArticleType
}

export type ArticleType = {
    id: number
    name: string
    status: number
    created_at: number
    updated_at: number
}

export type Filters = {
    countries: string[]
    categories: string[]
    categoryTravelAddress: string[]
    companions: string[]
    complexity: string[]
    month: string[]
    over_nights_stay: string[]
    transports: string[]
    year: string
    user_id?: number
}

export type FeedbackData = {
    name: string
    email: string
    message: string
}

export type FiltersContextType = {
    filters: Filters;
    updateFilters: (newFilters: Partial<Filters>) => void;
}

export interface FormValues {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface TravelFilters {
    countries: Array<{ country_id: string; title_ru: string }>;
    categories: Array<{ id: string; name: string }>;
    transports: Array<{ id: string; name: string }>;
    complexity: Array<{ id: string; name: string }>;
    month: Array<{ id: string; name: string }>;
}


export interface TravelFormData {
    id?: string | null;
    name?: string;
    countries: string[];
    cities: string[];
    over_nights_stay: string[];
    complexity: string[];
    companions: string[];
    description?: string | null;
    plus?: string | null;
    minus?: string | null;
    recommendation?: | null;
    youtube_link?: string | null;
    categories: string[];
    countryIds: string[];
    travelAddressIds: string[];
    travelAddressCity: string[];
    travelAddressCountry: string[];
    travelAddressAdress: string[];
    travelAddressCategory: string[];
    coordsMeTravel: string[];
    thumbs200ForCollectionArr: string[];
    travelImageThumbUrlArr: string[];
    travelImageAddress: string[];
    categoriesIds: string[];
    transports: string[];
    month: string[];
    year?: string;
    budget?: string;
    number_peoples?: string;
    number_days?: string;
    visa: boolean;
    publish: boolean;
    moderation?: boolean;

}

export interface MarkerData {
    id: number | null; // Добавляем поле id
    lat: number;
    lng: number;
    country: number | null;
    address: string;
    categories: number[];
    image: string;
}


