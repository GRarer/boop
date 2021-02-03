import express from "express";
import { addPushSubscription } from "../queries/pushQueries";
import { userUuidFromReq } from "../services/auth";
import { handleAsync } from "../util/handleAsync";

export const subscriptionRouter = express.Router();

subscriptionRouter.post('/addSubscription', handleAsync(async (req, res) => {
  const subscription: PushSubscriptionJSON = req.body;
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.status(401).send("cannot add subscription when not logged in");
    return;
  }
  await addPushSubscription(subscription, userUUID);
  res.send();
}));
