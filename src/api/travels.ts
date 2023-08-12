import {Travel} from '@/types';
const API_KEY = ''

const BASE_URL = 'https://metravel.by/api/travels?page=1&perPage=20&where=%7B%22publish%22:1,%22moderation%22:1%7D&query=';
const BASE_URL2 = 'https://metravel.by/api/travel'
const BASE_URLby = 'https://metravel.by/api/travels?page=1&perPage=20&where=%7B%22publish%22:1,%22countries%22:[3],%22moderation%22:1%7D&query=';

const travelDef = {
  name: 'test',
  id:'498',
  travel_image_thumb_url: "https://metravelprod.s3.eu-north-1.amazonaws.com/6880/conversions/p9edKtQrl2wM0xC1yRrkzVJEi4B4qxkxWqSADDLM-webpTravelMainImage_400.webp",
  url: '',
  userName: '',
  slug: ''

}


export const fetchTravels = async (): Promise<Travel[]> => {
    try {
      const res = await fetch(
        `${BASE_URL}`
      );
      const resData = await res.json();
      return resData.data;
    } catch (e) {
      console.log("Error fetching Travels: ");
      return [];
    }
  };

  export const fetchTravelsby = async (): Promise<Travel[]> => {
    try {
      const res = await fetch(
        `${BASE_URLby}`
      );
      const resData = await res.json();
      return resData.data;
    } catch (e) {
      console.log("Error fetching Travels: ");
      return [];
    }
  };
  
  export const fetchTravel = async (id: string[]): Promise<Travel> => {
    try {
      const res = await fetch(`${BASE_URL2}?id=${id}`);
      return await res.json();
    } catch (e) {
      console.log('Error fetching Travel: ');
      return travelDef;
    }
  };