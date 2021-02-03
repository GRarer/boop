import express from "express";
import { userUuidFromReq, isAdminSessionFromReq } from "../services/auth";
import webpush from "web-push";
import { testNotificationPayload } from "../services/pushManager";
import { handleAsync } from "../util/handleAsync";
import { getPushByUsername } from "../queries/pushQueries";

// endpoints for triggering special administrative commands
// these endpoints should return error 403 unless the client provides a session token that matches an admin account
// it also serves as a demonstration of session-token-based authentication
export const adminRouter = express.Router();

// example endpoint that verifies that the current user is an admin, returns error 403 otherwise
adminRouter.post('/check', handleAsync(async (req, res) => {
  if (await isAdminSessionFromReq(req)) {
    console.log(`test action by admin user ${await userUuidFromReq(req)}`);
    res.send();
  } else {
    res.sendStatus(403);
  }
}));

// triggers a push notification to the given username
adminRouter.post('/push', handleAsync(async (req, res) => {
  if (! (await isAdminSessionFromReq(req))) {
    res.sendStatus(403);
    return;
  }
  const username = req.body;
  if (typeof username !== "string") {
    res.sendStatus(400);
    return;
  }

  const subscriptions: PushSubscriptionJSON[] = await getPushByUsername(username);
  for (const sub of subscriptions) {
    try {
      const subscription: webpush.PushSubscription = {
        endpoint: sub.endpoint!,
        keys: {
          p256dh: sub.keys!['p256dh'],
          auth: sub.keys!['auth']
        }
      };
      webpush.sendNotification(subscription, JSON.stringify(testNotificationPayload))
        .catch((reason: unknown) => {
          console.log("failed to send push notification");
          console.log(reason);
        });
    } catch (reason: unknown) {
      console.log("failed to send push notification");
      console.log(reason);
    }
  }
}));

