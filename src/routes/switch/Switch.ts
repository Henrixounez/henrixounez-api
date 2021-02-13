import WsServer from '../WsServer';

class SwitchMemory extends WsServer {
  private _value: boolean = false;

  changeValue(newValue: boolean) {
    this._value = newValue;
    this.sendToClients({value: this._value});
  }

  get value() {
    return this._value;
  }
}

const Switch = new SwitchMemory();

export default Switch;