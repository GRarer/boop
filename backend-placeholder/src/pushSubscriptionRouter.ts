import express from "express";
import { SubscriptionRequest, testNotificationPayload } from "./pushManager";
import webpush from "web-push";

// TODO persist subscription info in a database and associate them with users


export const subscriptionRouter = express.Router();

let mostRecentSub: SubscriptionRequest | undefined = undefined;

subscriptionRouter.post('/subscribe', function(req, res){
    console.log("received push subscription information POST");
    console.log(req.body);
    mostRecentSub = req.body;
    res.send();
});

subscriptionRouter.post('/testBroadcast', function(req, res){
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
