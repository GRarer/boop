import { vapidKeys } from "boop-core";
import webpush from "web-push";

webpush.setVapidDetails(
  'mailto:gracerarer@gatech.edu',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

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



