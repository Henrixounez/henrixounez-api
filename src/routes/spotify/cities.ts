import {Request, Response, NextFunction} from "express";
import axios from 'axios';

async function getArtistCities(id: string) {
  const res = await axios.get(`https://open.spotify.com/artist/${id}/about`);
  const data = res.data.match(/(Spotify\.Entity = )(.*?);\n/);
  const json_data = JSON.parse(data[2]);
  return json_data.insights.cities.map((e: any) => ({city: e.city, country: e.country, listeners: e.listeners}));
}

async function getUserArtists(token: string) {
  const res = await axios.get(
    'https://api.spotify.com/v1/me/top/artists',
    {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }
  );
  return res.data.items.map((e: any) => ({
    name: e.name,
    id: e.id
  }));
}

export default async function cities(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.query.token as string;
    const artists = await getUserArtists(token);
    let cities_ranking: any[] = [];
    const total_artists = artists.length;
    const data = await Promise.all(
      artists.map(async (e: any) => ({
          ...e,
          cities: await getArtistCities(e.id)
        })
      )
    );
    data.map((artist: any, i: number) => {
      const cities_len = artist.cities.length;
      artist.cities.map((city: any, u: number) => {
        const city_rank = cities_len - u + total_artists - i;
        const index = cities_ranking.findIndex((e) => e.name === city.city);
        if (index !== -1) {
          cities_ranking[index].score += city_rank;
        } else {
          cities_ranking.push({
            score: city_rank,
            name: city.city,
            country: city.country
          });
        }
      })
    })
    return cities_ranking.sort((a, b) => b.score - a.score);
  } catch (err) {
    res.status(401);
  }
}