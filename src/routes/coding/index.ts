import { Method, RoutesType, RoutesTypeWS } from '../types';
import connect from './connect';
import { createSession } from './controllers';

const crud: RoutesType[] = [
  {
    method: Method.POST,
    route: '/coding/create',
    controller: createSession,
  }
];

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