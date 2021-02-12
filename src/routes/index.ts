import * as ws from 'ws';
import Switch from './switch';
import Test from './test';
import Spotify from './spotify';
import {Request, Response, NextFunction} from "express";

export enum Method {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PUT = "put",
}

export interface RoutesType {
  method: Method,
  route: string,
  controller: (req: Request, res: Response, next: NextFunction) => Promise<any>,
}

export interface RoutesTypeWS {
  route: string,
  controller: (ws: ws, req: Request, next: NextFunction) => Promise<any>,
}

const crud: RoutesType[] = [
  {
    method: Method.GET,
    route: "/test",
    controller: Test.test
  },
  {
    method: Method.GET,
    route: "/spotify/auth",
    controller: Spotify.auth
  },
  {
    method: Method.GET,
    route: "/spotify/callback",
    controller: Spotify.callback
  },
  {
    method: Method.GET,
    route: "/spotify/cities",
    controller: Spotify.cities
  }
]

const websockets: RoutesTypeWS[] = [
  {
    route: "/switch/connect",
    controller: Switch.connect
  }
]

export default {
  crud,
  websockets,
};