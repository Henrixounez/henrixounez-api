import * as ws from 'ws';
import WsServer from '../WsServer';
import { getRepository, Repository } from 'typeorm';
import { File } from '../../entities/coding/File';

interface TextChanges {
  toAdd: string;
  start: number;
  end: number;
}
interface Client {
  id: number,
  name: string,
  pos: any,
}

export class CodingSession extends WsServer {
  private _codingClients: {[key: number]: Client} = [];
  private _text: string = "";
  private _fileRepository: Repository<File>;

  public sessionId: string;
  public isInit: boolean = false;

  constructor() {
    super();
  }

  async init(sessionId: string) {
    this._fileRepository = getRepository(File);
    this.sessionId = sessionId;
    const file = await this._fileRepository.findOne({ sessionId });
    if (!file) {
      const newFile = new File();
      newFile.text = "// Hello World";
      newFile.sessionId = this.sessionId;
      this._text = newFile.text;
      await this._fileRepository.save(newFile);
    } else {
      this._text = file.text;
    }
    this.isInit = true;
  }

  async getText() {
    return this._text;
  }

  applyChanges(lastText: string, changes: TextChanges) {
    const startText = lastText.substring(0, changes.start);
    const endText = lastText.substring(changes.end);
    const updatedText = startText + changes.toAdd + endText;
    return updatedText;
  }
  
  async changeText(changes: TextChanges) {
    this._text = this.applyChanges(this._text, changes);

    const file = await this._fileRepository.findOne({ sessionId: this.sessionId });    
    if (file) {
      file.text = this._text;
      await this._fileRepository.save(file);
    }
  }

  addClient(c: ws) {
    const id = super.addClient(c);
    const newClient: Client = {
      id: id,
      name: "#" + id,
      pos: {
        line: 0,
        ch: 0,
        sticky: "after"
      }
    };
    this._codingClients[id] = newClient;
    return id;
  }

  clientAmount() {
    return Object.keys(this._codingClients).length;
  }
  removeClient(id: number) {
    super.removeClient(id);
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
  moveClient(id: number, data: any) {
    this._codingClients[id].pos = data;
    return this._codingClients[id];
  }
  changeNameClient(id: number, name: string) {
    this._codingClients[id].name = name;
    return this._codingClients[id];
  }
}

export const sessions: Record<string, CodingSession> = {
  "default": new CodingSession(),
}