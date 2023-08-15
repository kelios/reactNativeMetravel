import { Travel } from '@/src/types/types'
import queryString from 'query-string'
import { useEffect, useState } from 'react'

const API_KEY = ''

const BASE_URL = 'https://metravel.by/api/travels'
const BASE_URL2 = 'https://metravel.by/api/travel'

const travelDef = {
  name: 'test',
  id: '498',
  travel_image_thumb_url:
    'https://metravelprod.s3.eu-north-1.amazonaws.com/6880/conversions/p9edKtQrl2wM0xC1yRrkzVJEi4B4qxkxWqSADDLM-webpTravelMainImage_400.webp',
  url: '',
  userName: '',
  slug: '',
}

export const fetchTravels = async (page: number, itemsPerPage: number) => {
  try {
    const params = {
      page: page,
      perPage: itemsPerPage,
      where: JSON.stringify({ publish: 1, moderation: 1 }),
    }
    const urlTravel = queryString.stringifyUrl({
      url: BASE_URL,
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
      url: BASE_URL,
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

export const fetchTravel = async (id: string[]): Promise<Travel> => {
  try {
    console.log(id)
    const res = await fetch(`${BASE_URL2}?id=${id}`)
    return await res.json()
  } catch (e) {
    console.log('Error fetching Travel: ')
    return travelDef
  }
}
