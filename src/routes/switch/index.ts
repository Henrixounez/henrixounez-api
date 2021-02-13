import { RoutesType, RoutesTypeWS } from '../types';
import connect from './connect';

const crud: RoutesType[] = [];

const websockets: RoutesTypeWS[] = [
  {
    route: "/switch/connect",
    controller: connect
  }
];

export default {
  crud,
  websockets
};