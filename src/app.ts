import * as express from "express";
import * as cors from "cors";
import * as compression from "compression"; // compresses requests
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as expressValidator from "express-validator";
import { TwitterRouter } from "./routes";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env" || ".env.example" });
const corsOptions: cors.CorsOptions = process.env.DEV
  ? {
      origin: "*",
      optionsSuccessStatus: 200
    }
  : {};
// Create Express server
const app = express();
app.use(cors(corsOptions));
// Express configuration
app.set("port", process.env.PORT || 8080);
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use(function(req, res, next) {
  const tokenHeader = req.headers.Authorization || req.headers.authorization;
  if (tokenHeader && (tokenHeader as string).split(" ")[0] === "Bearer") {
    const [, apiKeys] = (tokenHeader as string).split(" ");
    const decodedAPIKeys = new Buffer(apiKeys, "base64").toString();
    const [sessionId, sessionSecret] = decodedAPIKeys.split(":");

    res.locals.sessionId = sessionId;
    res.locals.sessionSecret = sessionSecret;
  }
  next();
});
app.use("/twitter", TwitterRouter);

app.use((req: express.Request, resp: express.Response) => {
  resp.status(404).send({
    msg: "Not Found!"
  });
});

module.exports = app;
