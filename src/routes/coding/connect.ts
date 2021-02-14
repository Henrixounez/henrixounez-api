import {Request, NextFunction} from "express";
import * as ws from 'ws';
import Coding from './Coding';

export default async function connect(ws: ws, req: Request, next: NextFunction) {

  if (!Coding.isInit) {

    ws.send(JSON.stringify({
      type: 'ping',
      data: {}
    }));

    await Coding.init();
  }

  const id = Coding.addClient(ws);

  ws.on('message', (msg) => {
    const data = JSON.parse(msg as string);
    switch (data.type) {
      case 'addText':
        Coding.addText(data.data.pos, data.data.endPos, data.data.text);
        Coding.sendToClients(data, id);
        break;
      case 'delText':
        Coding.delText(data.data.startPos, data.data.endPos);
        Coding.sendToClients(data, id);
        break;
      case 'moveCursor':
        const clientData = Coding.moveClient(data.data.pos, id);
        Coding.sendToClients({type: 'moveCursor', data: clientData}, id);
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
      text: Coding.text,
      clients: Coding.getClients(id),
      owner: Coding.getClient(id),
    }
  }));
}