import * as ws from 'ws';
import Switch from './switch';
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
]

const websockets: RoutesTypeWS[] = [
  {
    route: "/test/connect",
    controller: Switch.connect
  }
]

export default {
  crud,
  websockets,
};