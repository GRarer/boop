import { Gender } from "boop-core";
import { createNotificationTokens, selectPairs } from "../../queries/reminderQueries";
import { sendNotificationToUser } from "../pushManager";
import { friendNotificationMessage, metafriendNotificationMessage } from "./reminderNotificationMessages";
import webpush from "web-push";

// personal info used to create notification messages
export type NotificationIdentity = {fullName: string; friendlyName: string; gender: Gender;};

export type Pairing = {
  userA: NotificationIdentity & {uuid: string; vapidSubs: webpush.PushSubscription[];};
  userB: NotificationIdentity & {uuid: string; vapidSubs: webpush.PushSubscription[];};
  friends: true;
} | {
  userA: NotificationIdentity & {uuid: string; vapidSubs: webpush.PushSubscription[];};
  userB: NotificationIdentity & {uuid: string; vapidSubs: webpush.PushSubscription[];};
  friends: false;
  mutualFriend: NotificationIdentity;
};

function boopNotificationPayload(message: string, token: string): {notification: Object;} {
  return {
    "notification": {
      "title": "Boop!",
      "body": message,
      "icon": "https://boopboop.app/assets/icons/icon-96x96.png",
      "badge": "https://boopboop.app/assets/icons/icon-white-96x96.png",
      "data": {
        "pushIdentityToken": token,
        "defaultAction": "show_start_chat"
      },
      "silent": false,
      "actions": [{
        "action": "show_start_chat",
        "title": "Start Chat"
      }]
    }
  };
}

export async function sendReminders(pair: Pairing): Promise<void> {
  const messageToA = pair.friends
    ? await friendNotificationMessage(pair.userB)
    : await metafriendNotificationMessage(pair.userB, pair.mutualFriend);
  const messageToB = pair.friends
    ? await friendNotificationMessage(pair.userA)
    : await metafriendNotificationMessage(pair.userA, pair.mutualFriend);
  const tokens = await createNotificationTokens(pair);

  await Promise.all([
    sendNotificationToUser(pair.userA.vapidSubs, boopNotificationPayload(messageToA, tokens.tokenToA), pair.userA.uuid),
    sendNotificationToUser(pair.userB.vapidSubs, boopNotificationPayload(messageToB, tokens.tokenToB), pair.userB.uuid)
  ]);
}

export async function notificationIteration(): Promise<void> {
  const pairs = await selectPairs();
  for (const pair of pairs) {
    // start sending notification, but don't wait for them to finish
    console.log("send notification", pair);
    sendReminders(pair).catch(err => {
      console.error("unhandled exception while sending reminder notifications");
      console.log(pair.friends
        ? `pair ${pair.userA.fullName} with ${pair.userB.fullName}`
        : `pair ${pair.userA.fullName} with ${pair.userB.fullName} (mutual friend: ${pair.mutualFriend.fullName})`
      );
      console.error(err);
    });
  }
}
