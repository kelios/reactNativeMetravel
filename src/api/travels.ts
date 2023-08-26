import { Travel, Filters } from '@/src/types/types'
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

const GET_FILTERS = `${URLAPI}/api/getFiltersTravel`
const GET_FILTERS_COUNTRY = `${URLAPI}/api/countriesforsearch`

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
) => {
  try {
    const params = {
      page: page + 1,
      perPage: itemsPerPage,
      query: search,
      where: JSON.stringify({ publish: 1, moderation: 1 }),
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

export const fetchTravelsby = async (page: number, itemsPerPage: number) => {
  try {
    const params = {
      page: page + 1,
      perPage: itemsPerPage,
      where: JSON.stringify({ publish: 1, moderation: 1, countries: [3] }),
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

export const fetchFiltersCountry = async (): Promise<Filters> => {
  try {
    if (IS_LOCAL_API == 'true') {
      const res = await fetch(`${GET_FILTERS_COUNTRY}`)
      const resData = await res.json()
      return resData
    } else {
      const res = [{ country_id: '3', title_ru: 'Belarus' }]
      //const resData = await res.json()
    }
    // const res = await fetch(`${GET_FILTERS_COUNTRY}`)
    // const resData = await res.json()
    const res = [{ country_id: '3', title_ru: 'Belarus' }]
    //const resData = await res.json()
    return res
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
