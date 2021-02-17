import { vapidKeys } from "boop-core";
import webpush from "web-push";
import { getPushByUUID } from "../queries/pushQueries";

webpush.setVapidDetails(
  'mailto:gracerarer@gatech.edu', // TODO create an email address for boop
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// send a notification to all vapid endpoints associated with the given user
export async function sendNotificationToUser(userUUID: string, payloadObject: object): Promise<void> {
  const payloadString = JSON.stringify(payloadObject);
  for (const subscription of await getPushByUUID(userUUID)) {
    // send notification but don't wait for a response from VAPID server
    webpush.sendNotification(subscription, payloadString)
      .catch((reason: unknown) => {
        if (typeof reason === "object"
        && reason !== null
        && (typeof (reason as any).statusCode === "number")) {
          const statusCode = (reason as {statusCode: number;}).statusCode;

          if (statusCode === 410) {
            // if the endpoint is gone we can safely ignore it
            // TODO schedule removing dead notification subscription from the database
          } else {
            console.warn("unexpected webpush status code", statusCode);
          }
        } else {
          console.warn("unexpected error when sending notification");
          console.error(reason);
        }

      });
  }
}

export const testNotificationPayload = {
  "notification": {
    "title": "Boop!",
    "body": "Say hi to your friends.",
    "icon": "assets/icons/icon-72x72.png",
    "vibrate": [100, 50, 100],
    "data": {
      "dateOfArrival": Date.now(),
      "primaryKey": 1
    },
    "silent": false,
    "actions": [{
      "action": "show_app",
      "title": "Show the placeholder page"
    }]
  }
};



