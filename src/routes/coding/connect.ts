import {Request, NextFunction} from "express";
import * as ws from 'ws';
import Coding from './Coding';

export default async function connect(ws: ws, req: Request, next: NextFunction) {

  console.log('1');
  if (!Coding.isInit) {

    ws.send(JSON.stringify({
      type: 'init',
      data: {
        text: ''
      }
    }));

    console.log('2');
    await Coding.init();
    console.log('3');
  }

  console.log('4');
  const id = Coding.addClient(ws);
  console.log('5');

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
  console.log('6');
  console.log(Coding.text);

  ws.send(JSON.stringify({
    type: 'init',
    data: {
      text: Coding.text
    }
  }));
}