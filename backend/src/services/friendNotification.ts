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

export const friendAcceptNotification = {
  "notification": {
    "title": "Boop Friend Request!",
    "body": "Someone accepted your friend request, check out who that was",
    // TODO add an icon that works even when the app is closed
    "silent": false,
    "actions": [{
      "action": "show_friends_page",
      "title": "View Friends"
    }]
  }
};