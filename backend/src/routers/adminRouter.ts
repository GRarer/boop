import express from "express";
import { authenticateAdmin, userUuidFromReq, } from "../services/auth";
import webpush from "web-push";
import { handleAsync, throwBoopError } from "../util/handleAsync";
import { getPushByUsername } from "../queries/pushQueries";
import { sendNotificationToUser } from "../services/pushManager";

// endpoints for triggering special administrative commands
// these endpoints should return error 403 unless the client provides a session token that matches an admin account
// it also serves as a demonstration of session-token-based authentication
export const adminRouter = express.Router();

// example endpoint that verifies that the current user is an admin, returns error 403 otherwise
adminRouter.post('/check', handleAsync(async (req, res) => {
  await authenticateAdmin(req);
  console.log(`test action by admin user ${await userUuidFromReq(req)}`);
  res.send();
}));

// triggers a push notification to the given username
adminRouter.post('/push', handleAsync(async (req, res) => {
  await authenticateAdmin(req);
  const username = req.body;
  if (typeof username !== "string") {
    throwBoopError("Malformed username body", 400);
  }

  const testNotificationPayload = {
    "notification": {
      "title": "Boop!",
      "body": "This is an example notification",
      "data": {},
      "silent": false,
      "actions": [{
        "action": "show_app",
        "title": "Show the placeholder page"
      }]
    }
  };

  const subscriptions: webpush.PushSubscription[] = await getPushByUsername(username);
  await sendNotificationToUser(subscriptions, testNotificationPayload);
  res.send();
}));

