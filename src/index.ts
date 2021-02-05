require('dotenv').config();
import * as express from "express";
import * as enableWs from "express-ws";
import {Request, Response, NextFunction} from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import routes from './routes';

const app = express();
app.use(cors());
app.use(bodyParser.json());
enableWs(app);

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
  app[route.method](
    route.route,
    route.controller,
  )
});


app.listen(process.env.PORT || 8080, () => {
  console.log(`[API] Listening to ${process.env.PORT || 8080}`);
})