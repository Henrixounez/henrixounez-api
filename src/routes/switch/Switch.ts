import * as ws from 'ws';

class SwitchMemory {
  private _clients: {id: number, client: ws}[] = [];
  private _value: boolean = false;
  private _currId: number = 0;

  addToArray(c: ws) {
    this._clients.push({id: this._currId, client: c});
    return this._currId++;
  }

  changeValue(newValue: boolean) {
    this._value = newValue;
    this._clients.forEach((c) => {
      try {
        c.client.send(JSON.stringify({value: this._value}));
      } catch (e) {}
    });
  }

  removeClient(id: number) {
    this._clients = this._clients.filter((e) => e.id === id);
  }

  get value() {
    return this._value;
  }
}

const Switch = new SwitchMemory();

export default Switch;