import { RoutesType, Method, RoutesTypeWS } from '../types';
import callback from './callback';
import cities from './cities';

const crud: RoutesType[] = [
  {
    method: Method.GET,
    route: "/spotify/callback",
    controller: callback
  },
  {
    method: Method.GET,
    route: "/spotify/cities",
    controller: cities
  }
];

const websockets: RoutesTypeWS[] = [];

export default {
  crud,
  websockets
};