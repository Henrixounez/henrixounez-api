import {Request, Response, NextFunction} from "express";
import axios from 'axios';
const querystring = require('querystring');

const redirect_uri = process.env.LOCAL_URL + '/spotify/callback';

export default async function callback(req: Request, res: Response, next: NextFunction) {
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