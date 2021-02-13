import * as ws from 'ws';

class WsServer {
  private _clients: {id: number, client: ws}[] = [];
  private _currId: number = 0;

  addClient(c: ws) {
    this._clients.push({id: this._currId, client: c});
    return this._currId++;
  }

  sendToClients(data: any, sender?: number) {
    this._clients.forEach((c) => {
      try {
        if (sender === undefined || c.id !== sender) {
          c.client.send(JSON.stringify(data));
        }
      } catch (e) {}
    });
  }

  removeClient(id: number) {
    this._clients = this._clients.filter((e) => e.id !== id);
  }
}

export default WsServer;