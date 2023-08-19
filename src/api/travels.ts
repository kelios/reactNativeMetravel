import { Travel } from '@/src/types/types'
import queryString from 'query-string'
import { PROD_API_URL, LOCAL_API_URL, IS_LOCAL_API } from '@env'

let URLAPI = ''

if (IS_LOCAL_API === false) {
  URLAPI = LOCAL_API_URL
} else {
  URLAPI = PROD_API_URL
}
const GET_TRAVELS = `${URLAPI}/api/travels`
const GET_TRAVEL = `${URLAPI}/api/travel`

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
export const fetchTravels = async (page: number, itemsPerPage: number) => {
  try {
    const params = {
      page: page + 1,
      perPage: itemsPerPage,
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

export const fetchTravelsby = async (): Promise<Travel[]> => {
  try {
    const params = {
      page: 1,
      perPage: 20,
      where: JSON.stringify({ publish: 1, moderation: 1, countries: [3] }),
    }
    const urlTravel = queryString.stringifyUrl({
      url: GET_TRAVELS,
      query: params,
    })
    const res = await fetch(urlTravel)
    const resData = await res.json()
    return resData.data
  } catch (e) {
    console.log('Error fetching Travels: ')
    return []
  }
}

export const fetchTravel = async (id: number): Promise<Travel> => {
  try {
    if (IS_LOCAL_API === false) {
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
