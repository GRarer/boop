import express from "express";
import { config } from "../config";
import { addPushSubscription } from "../queries/pushQueries";
import { authenticateUUID, } from "../services/auth";
import { isWebpushSubscription } from "../services/pushManager";
import { handleAsync, throwBoopError } from "../util/handleAsync";

export const subscriptionRouter = express.Router();

subscriptionRouter.post('/addSubscription', handleAsync(async (req, res) => {
  // angular gives us a pushSubscriptionJSON object, but this could theoretically not be a valid webpushPushSubscription
  // because on pushSubscriptionJSON the endpoint and keys are optional
  if (!isWebpushSubscription(req.body)) {
    throwBoopError("Error: Your browser did not provide the expected push keys", 400);
  }

  const userUUID = await authenticateUUID(req);
  await addPushSubscription(req.body, userUUID);
  res.send();
}));

subscriptionRouter.get('/vapid_public_key', handleAsync(async (req, res) => {
  res.send(config.vapidKeys.publicKey);
}));
