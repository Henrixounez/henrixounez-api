require('dotenv').config();
import * as express from "express";
import * as expressWs from "express-ws";
import {Request, Response, NextFunction} from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import routes from './routes';

const appBase = express();
appBase.use(cors());
appBase.use(bodyParser.json());
const { app } = expressWs(appBase);

routes.crud.forEach((route) => {
  app[route.method](
    route.route,
    (req: Request, res: Response, next: NextFunction) => {
      const result = route.controller(req, res, next);
      if (result instanceof Promise) {
        result.then((result) => (result !== null && result !== undefined ? res.send(result) : undefined));
      } else if (result !== null && result !== undefined) {
        res.json(result)
      }
    }
  )
});

routes.websockets.forEach((route) => {
  app.ws(
    route.route,
    route.controller,
  )
});


app.listen(process.env.PORT || 8080, () => {
  console.log(`[API] Listening to ${process.env.PORT || 8080}`);
})