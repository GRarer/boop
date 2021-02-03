import express from "express";
import { addPushSubscription } from "../queries/pushQueries";
import { authenticateUUID, } from "../services/auth";
import { handleAsync } from "../util/handleAsync";

export const subscriptionRouter = express.Router();

subscriptionRouter.post('/addSubscription', handleAsync(async (req, res) => {
  const subscription: PushSubscriptionJSON = req.body;
  const userUUID = await authenticateUUID(req);
  await addPushSubscription(subscription, userUUID);
  res.send();
}));
