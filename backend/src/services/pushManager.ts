import webpush from "web-push";

// TODO keep private key secret
// for now the prototype has the vapid keys directly in source code, but we should eventually store it securely
// and then generate a new pair of keys that are not checked into version control
const vapidKeys = {
  "publicKey": "BHFciY9_wuokC43Tkd7g4bPYctnTFlqc1rHzKgShdTxE2_AJFAvSJz1q3QXf4OQKDp0CcrDM4CK8mIPfG17iv78",
  "privateKey": "HDlJaMhdqp3W8NjwLy34Gi_163wWRPCeZAwYk5Z-ml4"
};

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



