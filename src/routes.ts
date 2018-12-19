import { Router } from "express";
import TwitterController from "./controllers/twitter.ctrl";

const TwitterRouter = Router();
TwitterRouter.get("/friends/:handler", TwitterController.getFriendsList);
export { TwitterRouter };
