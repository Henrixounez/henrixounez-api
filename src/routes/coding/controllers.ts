import {Request, Response} from "express";
import { v4 as uuidv4 } from 'uuid';

import { CodingSession, sessions } from "./Coding";

export async function createSession(req: Request, res: Response) {
  const sessionId = uuidv4();
  const session = new CodingSession();
  await session.init(sessionId);
  sessions[sessionId] = session;
  res.status(200).send({
    sessionId
  })
}