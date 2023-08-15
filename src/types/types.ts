export type Travel = {
  id: string
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

export type Travels = {
  data: {
    id: string
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
