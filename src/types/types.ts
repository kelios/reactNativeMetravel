export type Travel = {
  id: number
  slug: string

  name: string
  travel_image_thumb_url: string
  url: string

  userName: string
  description: string
  cityName: string
  countryName: string
  countUnicIpView: string
  gallery: String[]
  travelAddress: String[]
}

export type Travels = {
  data: {
    id: number
    slug: string

    name: string
    travel_image_thumb_url: string
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
