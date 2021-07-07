import {Request, NextFunction} from "express";
import * as ws from 'ws';
import { getRepository } from 'typeorm';

import { File } from '../../entities/coding/File';
import { CodingSession, sessions } from "./Coding";

async function findSession(sessionId: string) {
  if (sessions[sessionId])
    return { sessionId, session: sessions[sessionId] };
  const _fileRepository = getRepository(File);
  const file = await _fileRepository.findOne({ sessionId });
  if (file)
    return { sessionId, session: new CodingSession() };
  return { sessionId: null, session: null };
}

export default async function connect(ws: ws, req: Request, next: NextFunction) {

  const querySessionId: string | null = (req.query?.sessionId as string) || null;

  const { sessionId, session } = await findSession(querySessionId === null ? "default" : querySessionId);

  if (session === null || sessionId === null) {
    ws.send(JSON.stringify({
      type: 'error',
      data: {
        text: "SessionId is incorrect",
      }
    }));
    ws.close();
    return;
  } else if (!session.isInit) {
    ws.send(JSON.stringify({
      type: 'ping',
      data: {}
    }));
    await session.init(sessionId);
    sessions[session.sessionId] = session;
  }

  const { id, uuid } = session.addCodingClient(ws);

  ws.on('message', (msg) => {
    const { type, data } = JSON.parse(msg as string);
    switch (type) {
      case 'change':
        session.changeText(data);
        session.sendToClients({ type, data }, id);
        break;
      case 'cursorMove':
        const cursorMoveClientData = session.moveClient(uuid, data);
        session.sendToClients({ type, data: cursorMoveClientData }, id);
        break;
      case 'nameChange':
        const nameChangeClientData = session.changeNameClient(uuid, data);
        session.sendToClients({ type, data: nameChangeClientData }, id);
        break;
      default:
        console.error("Unknown message type", type);
    }
  });

  ws.on('close', () => {
    console.log('Closing', id);
    const wasConnected = session.removeCodingClient(uuid);
    session.sendToClients({type: 'removeClient', data: { id }});
    if (wasConnected && session.clientAmount() <= 0 && session.sessionId !== "default") {
      console.log('No more clients on', session.sessionId);
      delete sessions[session.sessionId];
    }
  });

  ws.on('error', (err) => {
    console.log('[WS] Error', err);
    const wasConnected = session.removeCodingClient(uuid);
    session.sendToClients({type: 'removeClient', data: { id }});
    if (wasConnected && session.clientAmount() <= 0 && session.sessionId !== "default") {
      console.log('No more clients on', session.sessionId);
      delete sessions[session.sessionId];
    }
  });

  if (ws.readyState === ws.OPEN) {
    try {
      ws.send(JSON.stringify({
        type: 'init',
        data: {
          sessionId: session.sessionId,
          text: await session.getText(),
          me: session.getClient(uuid),
          clients: session.getClients(uuid),
        }
      }));
    } catch (e) {}
  }
}