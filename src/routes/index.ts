import * as ws from 'ws';
import Switch from './switch';
import {Request, Response, NextFunction} from "express";

export enum Method {
  GET = "get",
  POST = "post",
  DELETE = "delete",
  PUT = "put",
  WS = "ws",
}

export interface RoutesType {
  method: Method,
  route: string,
  controller: (req: Request, res: Response, next: NextFunction) => Promise<any>,
}

export interface RoutesTypeWS {
  method: Method,
  route: string,
  controller: (ws: ws, req: Request, next: NextFunction) => Promise<any>,
}

const crud: RoutesType[] = [
]

const websockets: RoutesTypeWS[] = [
  {
    method: Method.WS,
    route: "/test/connect",
    controller: Switch.connect
  }
]

export default {
  crud,
  websockets,
};