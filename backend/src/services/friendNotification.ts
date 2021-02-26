export const friendRequestNotification = {
  "notification": {
    "title": "Boop Friend Request!",
    "body": "You got a friend request on Boop",
    // TODO add an icon that works even when the app is closed
    "silent": false,
    "actions": [{
      "action": "show_friends_page",
      "title": "View friend request"
    }]
  }
};