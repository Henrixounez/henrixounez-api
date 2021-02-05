import {Request, Response, NextFunction} from "express";

async function test(req: Request, res: Response, next: NextFunction) {
  return "Hello World";
}

export default {
  test
};