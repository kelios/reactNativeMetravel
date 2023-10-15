import { Travel, Filters, TravelsMap, TravelsForMap } from '@/src/types/types'
import queryString from 'query-string'
import { PROD_API_URL, LOCAL_API_URL, IS_LOCAL_API } from '@env'

let URLAPI = ''

if (IS_LOCAL_API == 'true') {
  URLAPI = LOCAL_API_URL
} else {
  URLAPI = PROD_API_URL
}
const GET_TRAVELS = `${URLAPI}/api/travels`
const GET_TRAVEL = `${URLAPI}/api/travel`
const GET_FILTERS_TRAVEL = `${URLAPI}/api/searchextended`
const GET_TRAVELS_NEAR = `${URLAPI}/api/travelsNear`
const GET_TRAVELS_POPULAR = `${URLAPI}/api/travelsPopular`

const GET_FILTERS = `${URLAPI}/api/getFiltersTravel`
const GET_FILTERS_COUNTRY = `${URLAPI}/api/countriesforsearch`

const GET_FILTER_FOR_MAP = `${URLAPI}/api/getFilterForMap`
const SEARCH_TRAVELS_FOR_MAP = `${URLAPI}/api/searchTravelsForMap`

const travelDef = {
  name: 'test',
  id: '498',
  travel_image_thumb_url:
    'https://metravelprod.s3.eu-north-1.amazonaws.com/6880/conversions/p9edKtQrl2wM0xC1yRrkzVJEi4B4qxkxWqSADDLM-webpTravelMainImage_400.webp',
  url: '',
  userName: '',
  slug: '',
}

/*
type TravelListItemProps = {
  travel: Travel
}

const travelDef = {
  name: 'test',
  id: '498',
  travel_image_thumb_url:
    'https://metravelprod.s3.eu-north-1.amazonaws.com/6880/conversions/p9edKtQrl2wM0xC1yRrkzVJEi4B4qxkxWqSADDLM-webpTravelMainImage_400.webp',
  url: '',
  userName: '',
  slug: '',
}

const TravelApi = ({
  travel,
}: TravelListItemProps) => {
  const {
    name,
    url,
    slug,
    travel_image_thumb_url,
    id,
    cityName,
    countryName,
    userName,
    countUnicIpView,
  } = travel
}
*/

export const fetchTravels = async (
  page: number,
  itemsPerPage: number,
  search: string,
  urlParams: Record<string, any>,
) => {
  try {
    const whereObject = { publish: 1, moderation: 1, ...urlParams }
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
      resData = [{ country_id: '3', title_ru: 'Belarus' }]
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
      radius: { id: radius, name: radius },
      categories: [],
      address: null,
    }
    console.log(radius)
    if (filter?.categories?.length > 0) {
      filter?.categories.forEach((category, index) => {
        whereObject.categories[index] = { id: category, name: category }
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
