import {Request, Response, NextFunction} from "express";
import * as ws from 'ws';

class SwitchMemory {
  private _clients: ws[] = [];
  private _value: boolean = false;

  addToArray(c: ws) {
    this._clients.push(c);
  }

  changeValue(newValue: boolean) {
    this._value = newValue;
    this._clients.forEach((c) => {
      try {
        c.send(JSON.stringify({value: this._value}));
      } catch (e) {}
    });
  }

  removeClient(c: ws) {
    this._clients = this._clients.filter((e) => e === c);
  }

  get value() {
    return this._value;
  }
}

const Switch = new SwitchMemory();

async function connect(ws: ws, req: Request, next: NextFunction) {
  ws.on('message', (msg) => {
    Switch.changeValue(msg === "true");
  });

  ws.on('close', () => {
    Switch.removeClient(ws);
  });

  ws.on('error', (err) => {
    console.log('[WS] Error', err);
  });

  Switch.addToArray(ws);
  ws.send(JSON.stringify({value: Switch.value}));
}

export default {
  connect
};