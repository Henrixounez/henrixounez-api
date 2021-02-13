import {Request, NextFunction} from "express";
import * as ws from 'ws';
import Switch from './Switch';

export default async function connect(ws: ws, req: Request, next: NextFunction) {
  const id = Switch.addClient(ws);

  ws.on('message', (msg) => {
    Switch.changeValue(msg === "true");
  });

  ws.on('close', () => {
    Switch.removeClient(id);
  });

  ws.on('error', (err) => {
    console.log('[WS] Error', err);
  });

  ws.send(JSON.stringify({value: Switch.value}));
}