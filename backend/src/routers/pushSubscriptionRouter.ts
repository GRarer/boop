import express from "express";
import { testNotificationPayload } from "../services/pushManager";
import webpush from "web-push";
import { getUserUUID } from "../services/auth";
import { database } from "../services/database";



export const subscriptionRouter = express.Router();

subscriptionRouter.post('/addSubscription', function(req, res) {
  const subscription: PushSubscriptionJSON = req.body;
  const userUUID = getUserUUID(req);
  if (userUUID === undefined) {
    res.status(401).send("cannot add subscription when not logged in");
    return;
  }
  database.addPushSubscription(subscription, userUUID)
    .then(() => { res.send(); })
    .catch((reason) => {
      console.error(reason);
      res.sendStatus(500);
    });
});

// TODO remove notification example
let mostRecentSub: webpush.PushSubscription | undefined = undefined;

subscriptionRouter.post('/subscribe', function(req, res) {
  console.log("received push subscription information POST");
  console.log(req.body);
  mostRecentSub = req.body;
  res.send();
});

subscriptionRouter.post('/testBroadcast', function(req, res) {
  console.log("received broadcast instruction");
  if (mostRecentSub === undefined) {
    console.error("no subscriber");
    res.sendStatus(500);
    return;
  }
  console.log(mostRecentSub);
  webpush.sendNotification(mostRecentSub, JSON.stringify(testNotificationPayload))
    .then(() => {
      console.log("notification sent");
      res.send();
    })
    .catch(err => {
      console.error("Error sending notification, reason:");
      console.error(err);
      res.sendStatus(500);
    });
});
