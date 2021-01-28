import express from "express";
import { testNotificationPayload } from "../services/pushManager";
import webpush from "web-push";
import { getUserUUID } from "../services/auth";
import { database } from "../services/database";
import { handleAsync } from "../util/handleAsync";



export const subscriptionRouter = express.Router();

subscriptionRouter.post('/addSubscription', handleAsync(async (req, res) => {
  const subscription: PushSubscriptionJSON = req.body;
  const userUUID = await getUserUUID(req);
  if (userUUID === undefined) {
    res.status(401).send("cannot add subscription when not logged in");
    return;
  }
  await database.addPushSubscription(subscription, userUUID);
  res.send();
}));

// TODO remove notification example
let mostRecentSub: webpush.PushSubscription | undefined = undefined;

subscriptionRouter.post('/subscribe', handleAsync( async (req, res) => {
  console.log("received push subscription information POST");
  console.log(req.body);
  mostRecentSub = req.body;
  res.send();
}));

subscriptionRouter.post('/testBroadcast', handleAsync( async (req, res) => {
  console.log("received broadcast instruction");
  if (mostRecentSub === undefined) {
    console.error("no subscriber");
    res.sendStatus(500);
    return;
  }
  console.log(mostRecentSub);
  try {
    await webpush.sendNotification(mostRecentSub, JSON.stringify(testNotificationPayload));
  } catch (err: unknown) {
    console.error("Error sending notification, reason:");
    console.error(err);
    res.sendStatus(500);
    return;
  }
  console.log("notification sent");
  res.send();
}));
