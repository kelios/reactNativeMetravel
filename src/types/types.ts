export type Travel = {
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
  gallery: String[]
  travelAddress: String[]
  userIds: string
  year: string
  monthName: string
  number_days: number
}

export type TravelCoords = {
  address: string
  categoryName: string
  coord: string
  lat: string
  lng: string
  travelImageThumbUrl: string
  urlTravel: string
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

export type Filters = {
  categories: string[]
  categoryTravelAddress: string[]
  companion: string[]
  complexity: string[]
  month: string[]
  overNightStay: string[]
  transports: string[]
}
