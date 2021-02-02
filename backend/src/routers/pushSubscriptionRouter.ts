import express from "express";
import { userUuidFromReq } from "../services/auth";
import { database } from "../services/database";
import { handleAsync } from "../util/handleAsync";

export const subscriptionRouter = express.Router();

subscriptionRouter.post('/addSubscription', handleAsync(async (req, res) => {
  const subscription: PushSubscriptionJSON = req.body;
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.status(401).send("cannot add subscription when not logged in");
    return;
  }
  await database.addPushSubscription(subscription, userUUID);
  res.send();
}));
