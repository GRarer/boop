import webpush from "web-push";
import { config } from "../config";
import { removePushSubscription } from "../queries/pushQueries";

webpush.setVapidDetails(
  'mailto:boopsocialapp@gmail.com',
  config.vapidKeys.publicKey,
  config.vapidKeys.privateKey
);

// send a notification to all vapid endpoints associated with the given user
export async function sendNotificationToUser(
  subs: webpush.PushSubscription[],
  payloadObject: {notification: Object;},
  userUUID: string, // used to allow removing invalid/deactivated subscription from the user when we get a 410 response
): Promise<void> {
  const payloadString = JSON.stringify(payloadObject);
  for (const subscription of subs) {
    // send notification but don't wait for a response from VAPID server
    webpush.sendNotification(subscription, payloadString)
      .catch((reason: unknown) => {
        if (typeof reason === "object"
        && reason !== null
        && (typeof (reason as any).statusCode === "number")) {
          const statusCode = (reason as {statusCode: number;}).statusCode;
          if (statusCode === 410) {
            // 410 is the expected status code from a web push server when the subscription has been deactivated
            removePushSubscription(subscription, userUUID).catch(err => {
              console.warn("unexpected error when trying to clean up invalid vapid subscription");
              console.error(err);
            });
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

export function isWebpushSubscription(x: unknown): x is webpush.PushSubscription {
  if (typeof x !== "object" || x === null) {
    return false;
  }
  const obj = x as {endpoint?: unknown; keys?: unknown;};
  // const keys: unknown = obj.keys;
  if (typeof obj.endpoint !== "string" || typeof obj.keys !== "object" || obj.keys === null ) {
    return false;
  }
  for (const key of ['p256dh', 'auth']) {
    if (typeof (obj.keys as any)[key] !== "string") {
      return false;
    }
  }
  return true;
}

