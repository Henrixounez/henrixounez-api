import * as ws from 'ws';
import WsServer from '../WsServer';
import { getRepository, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { File } from '../../entities/coding/File';

interface TextChanges {
  toAdd: string;
  start: number;
  end: number;
}
interface Client {
  id: number,
  uuid: string,
  name: string,
  pos: any,
}

export class CodingSession extends WsServer {
  private _codingClients: Record<string, Client> = {};
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

  addCodingClient(c: ws) {
    const id = super.addClient(c);
    const uuid = uuidv4();
    const newClient: Client = {
      id,
      uuid,
      name: "#" + uuid,
      pos: {
        line: 0,
        ch: 0,
        sticky: "after"
      }
    };
    this._codingClients[uuid] = newClient;
    return { uuid, id };
  }

  clientAmount() {
    return Object.keys(this._codingClients).length;
  }
  removeCodingClient(uuid: string) {
    if (!this._codingClients[uuid])
      return false;
    super.removeClient(this._codingClients[uuid].id);
    delete this._codingClients[uuid];
    return true;
  }
  getClient(requester: string) {
    return this._codingClients[requester]
  }
  getClients(requester: string) {
    return Object.keys(this._codingClients)
      .map((e) => this._codingClients[e])
      .filter((e: Client) => e.uuid !== requester);
  }
  moveClient(uuid: string, data: any) {
    this._codingClients[uuid].pos = data;
    return this._codingClients[uuid];
  }
  changeNameClient(uuid: string, name: string) {
    this._codingClients[uuid].name = name;
    return this._codingClients[uuid];
  }
}

export const sessions: Record<string, CodingSession> = {
  "default": new CodingSession(),
}