import { RoutesType, RoutesTypeWS } from '../types';
import connect from './connect';

const crud: RoutesType[] = [];

const websockets: RoutesTypeWS[] = [
  {
    route: "/coding/connect",
    controller: connect
  }
];

export default {
  crud,
  websockets
};