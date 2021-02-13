import { RoutesType, RoutesTypeWS } from './types';
import Switch from './switch';
import Test from './test';
import Spotify from './spotify';

const modules = [
  Test,
  Switch,
  Spotify,
];

const crud: RoutesType[] = modules.flatMap((e) => e.crud);
const websockets: RoutesTypeWS[] = modules.flatMap((e) => e.websockets);

export default {
  crud,
  websockets,
};