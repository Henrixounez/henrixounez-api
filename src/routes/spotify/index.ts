import {Request, Response, NextFunction} from "express";
import axios from 'axios';
const querystring = require('querystring');

const redirect_uri = process.env.LOCAL_URL + '/spotify/callback';

async function auth(req: Request, res: Response, next: NextFunction) {
  const scopes = 'user-top-read';
  res.redirect(
    'https://accounts.spotify.com/authorize'+
    '?response_type=code' +
    '&client_id=' + process.env.SPOTIFY_CLIENTID +
    '&scope=' + encodeURIComponent(scopes) +
    '&redirect_uri=' + encodeURIComponent(redirect_uri) +
    '&state=' + req.headers.referer
  );
}

async function callback(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.query.error) {
      return res.status(401).send("Error");
    }
    const code = req.query.code as string;
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri
      }),
      {
        headers: {
          Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENTID + ':' + process.env.SPOTIFY_CLIENTSECRET).toString('base64'),
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.redirect(req.query.state + '?code=' + response.data.access_token);
  } catch (e) {
    return e;
  }
}

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

async function cities(req: Request, res: Response, next: NextFunction) {
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

export default {
  auth,
  callback,
  cities
};