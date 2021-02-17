import { createNotificationTokens, selectPairs } from "../../queries/reminderQueries";
import { sendNotificationToUser } from "../pushManager";
import { friendNotificationMessage, metafriendNotificationMessage } from "./reminderNotificationMessages";

export type Pairing = {
  userA: string;
  userB: string;
  friends: true;
} | {
  userA: string;
  userB: string;
  friends: false;
  mutualFriend: string;
};

function boopNotificationPayload(message: string, token: string): {} {
  return {
    "notification": {
      "title": "Boop!",
      "body": message,
      // TODO add an icon that works even when the app is closed
      "data": {
        "pushIdentityToken": token
      },
      "silent": false,
      "actions": [{
        "action": "show_start_chat",
        "title": "Start Chat"
      }]
    }
  };
}

async function sendReminders(pair: Pairing): Promise<void> {
  const messageToA = pair.friends
    ? await friendNotificationMessage(pair.userB)
    : await metafriendNotificationMessage(pair.userB, pair.mutualFriend);
  const messageToB = pair.friends
    ? await friendNotificationMessage(pair.userA)
    : await metafriendNotificationMessage(pair.userA, pair.mutualFriend);
  const tokens = await createNotificationTokens(pair);

  await Promise.all([
    sendNotificationToUser(pair.userA, boopNotificationPayload(messageToA, tokens.tokenToA)),
    sendNotificationToUser(pair.userB, boopNotificationPayload(messageToB, tokens.tokenToB))
  ]);
}

export async function notificationIteration(): Promise<void> {
  const pairs = await selectPairs();
  for (const pair of pairs) {
    // start sending notification, but don't wait for them to finish
    console.log("send notification", pair);
    sendReminders(pair).catch(err => {
      console.error("unhandled exception while sending reminder notifications");
      console.log(pair);
      console.error(err);
    });
  }
}
