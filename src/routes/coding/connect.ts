import {Request, NextFunction} from "express";
import * as ws from 'ws';
import Coding from './Coding';

export default async function connect(ws: ws, req: Request, next: NextFunction) {

  if (!Coding.isInit) {
    await Coding.init();
  }

  const id = Coding.addClient(ws);

  ws.on('message', (msg) => {
    const data = JSON.parse(msg as string);
    switch (data.type) {
      case 'addText':
        Coding.addText(data.data.pos, data.data.text);
        Coding.sendToClients(data, id);
        break;
      case 'delText':
        Coding.delText(data.data.startPos, data.data.endPos);
        Coding.sendToClients(data, id);
        break;
      case 'moveCursor':
        const pos = Coding.moveClient(data.data.pos, id);
        Coding.sendToClients({type: 'moveCursor', data: { id, pos }}, id);
        break;
      default:
        console.log('Message Type', data.type, 'is not handled');
    }
  });

  ws.on('close', () => {
    Coding.removeClient(id);
    Coding.sendToClients({type: 'removeClient', data: { id }});
  });

  ws.on('error', (err) => {
    console.log('[WS] Error', err);
    Coding.removeClient(id);
    Coding.sendToClients({type: 'removeClient', data: { id }});
  });

  ws.send(JSON.stringify({
    type: 'init',
    data: {
      text: Coding.text
    }
  }));
}