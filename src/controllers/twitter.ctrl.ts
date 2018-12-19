import { Request, Response } from "express";
import fetch from "node-fetch";
import { TwitterFriendsList } from "twitter";

class TwitterController {
  constructor() {
    this.getFriendsList = this.getFriendsList.bind(this);
  }

  private async getBearerToken(): Promise<string> {
    const b64Credentials = new Buffer(
      `${process.env.TWITTER_CONSUMER_KEY}:${
        process.env.TWITTER_CONSUMER_SECRET
      }`
    ).toString("base64");
    try {
      const res = await fetch("https://api.twitter.com/oauth2/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${b64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      }).then(r => r.json());

      const { access_token } = res;
      return access_token;
    } catch (error) {
      throw Error(`Unable to authenticate: ${error}`);
    }
  }

  async getFriendsList(req: Request, resp: Response) {
    try {
      const { handler } = req.params;
      const accessToken = await this.getBearerToken();

      const res = (await fetch(
        `https://api.twitter.com/1.1/friends/ids.json?screen_name=${handler}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      ).then(r => r.json())) as TwitterFriendsList;

      const response = await fetch("<some_url_here>", {
        method: "POST",
        headers: {
          "Session-Id": resp.locals.sessionId,
          "Session-Secret": resp.locals.sessionSecret
        },
        body: JSON.stringify({
          accountIds: res.ids
        })
      }).then(r => r.json());
      resp.type("json");
      resp.status(200).send(response);
    } catch (error) {
      console.error(`Error: ${error}`);
      resp.send({
        msg: "Not found",
        status: 404
      });
    }
  }
}

export default new TwitterController();
