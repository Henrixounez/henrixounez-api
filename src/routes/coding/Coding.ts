import * as ws from 'ws';
import WsServer from '../WsServer';
import { getRepository, Repository } from 'typeorm';
import { File } from '../../entities/coding/File';

interface Client {
  id: number,
  name: string,
  pos: {x: number, y: number},
}

class CodingSession extends WsServer {
  private _codingClients: {[key: number]: Client} = [];
  private _text: string = "";
  private _fileRepository: Repository<File>;

  public isInit: boolean = false;

  constructor() {
    super();
  }

  async init() {
    this._fileRepository = getRepository(File);
    const file = await this._fileRepository.findOne();
    if (!file) {
      const newFile = new File();
      newFile.text = "/* Hello World */";
      this._text = newFile.text;
      await this._fileRepository.save(newFile);
    } else {
      this._text = file.text;
    }
    this.isInit = true;
  }

  async setText(newText: string) {
    this._text = newText;

    const file = await this._fileRepository.findOne();
    if (file) {
      file.text = this._text;
      await this._fileRepository.save(file);
    }
  }

  addClient(c: ws) {
    const id = WsServer.prototype.addClient.call(this, c);
    const newClient: Client = {
      id: id,
      name: "#" + id,
      pos: {
        x: 0,
        y: 0
      }
    };
    this._codingClients[id] = newClient;
    return id;
  }

  removeClient(id: number) {
    WsServer.prototype.removeClient.call(this, id);
    delete this._codingClients[id];
  }

  getClient(requester: number) {
    return this._codingClients[requester];
  }
  getClients(requester: number) {
    return Object.keys(this._codingClients)
      .map((e) => this._codingClients[Number(e)])
      .filter((e: Client & {id: number}) => e.id !== requester);
  }
  addText(startPos: number, endPos: number, textAdd: string) {
    this.setText(this._text.substr(0, startPos) + textAdd + this._text.substr(endPos));
  }
  delText(posStart: number, posEnd: number) {
    this.setText(this._text.substr(0, posStart) + this._text.substr(posEnd));
  }
  moveClient(pos: number, id: number) {
    let x = 0;
    let y = 0;

    for (let i = 0; i < pos; i++) {
      if (this._text[i] === '\n') {
        y++;
        x = 0;
      } else {
        x++;
      }
    }
    this._codingClients[id].pos = { x, y };
    return this._codingClients[id];
  }

  get text() {
    return this._text;
  }
}

export default new CodingSession()