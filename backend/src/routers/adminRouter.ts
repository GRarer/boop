import express from "express";
import { authenticateAdmin, userUuidFromReq, } from "../services/auth";
import webpush from "web-push";
import { handleAsync, throwBoopError } from "../util/handleAsync";
import { getPushByUsername } from "../queries/pushQueries";
import { sendNotificationToUser } from "../services/pushManager";
import { NotificationIdentity, Pairing, sendReminders } from "../services/reminders/reminders";
import { Gender } from "boop-core";
import { database } from "../services/database";

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


async function getNotificationIdentityByUsername(username: string):
Promise<NotificationIdentity & {uuid: string; vapidSubs: webpush.PushSubscription[];}> {
    type Row = {full_name: string; friendly_name: string; gender: Gender; vapid_subs: webpush.PushSubscription[];
      user_uuid: string;};
    const rows = await database.query<Row>(
      `select full_name, friendly_name, gender, vapid_subs, user_uuid from users where username = $1;`, [username]
    );
    const result = rows[0] ?? throwBoopError(`user ${username} not found`, 404);
    return {
      uuid: result.user_uuid,
      fullName: result.full_name,
      friendlyName: result.friendly_name,
      gender: result.gender,
      vapidSubs: result.vapid_subs
    };
}

adminRouter.post('/pair', handleAsync(async (req, res) => {
  await authenticateAdmin(req);
  const body: {a: string; b: string; mutual?: string;} = req.body;
  const a = await getNotificationIdentityByUsername(body.a);
  const b = await getNotificationIdentityByUsername(body.b);
  const c = body.mutual ? await getNotificationIdentityByUsername(body.mutual) : undefined;

  const pairing: Pairing = c ? {
    friends: false,
    userA: a,
    userB: b,
    mutualFriend: c
  } : {
    friends: true,
    userA: a,
    userB: b
  };

  await sendReminders(pairing);
  res.send();
}));
