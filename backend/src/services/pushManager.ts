import webpush from "web-push";
import { config } from "../config";

webpush.setVapidDetails(
  'mailto:boopsocialapp@gmail.com',
  config.vapidKeys.publicKey,
  config.vapidKeys.privateKey
);

// send a notification to all vapid endpoints associated with the given user
export async function sendNotificationToUser(
  subs: webpush.PushSubscription[],
  payloadObject: {notification: Object;}
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

