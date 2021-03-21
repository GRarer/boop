
import { database } from "../services/database";
import { throwBoopError } from "../util/handleAsync";


async function queryFullName(userUUID: string): Promise<string> {
  const rows = await database.query<{full_name: string;}>(
    `select full_name from users where user_uuid = $1`, [userUUID]
  );
  if (rows.length === 0) {
    throwBoopError("User not found", 404);
  }
  return rows[0].full_name;
}

export async function friendRequestNotification(userUUID: string): Promise<{notification: Object;}> {
  const senderFullName: string = await queryFullName(userUUID);
  return {
    "notification": {
      "title": "Boop Friend Request!",
      "body": `You got a friend request on Boop from ${senderFullName}`,
      "icon": "https://boopboop.app/assets/icons/icon-96x96.png",
      "badge": "https://boopboop.app/assets/icons/icon-white-96x96.png",
      "silent": false,
      "data": {
        "defaultAction": "show_friends_page"
      },
      "actions": [{
        "action": "show_friends_page",
        "title": "View friend request"
      }]
    }
  };
}

export async function friendAcceptNotification(userUUID: string): Promise<{notification: Object;}> {
  const friendFullName: string = await queryFullName(userUUID);
  return {
    "notification": {
      "title": "Boop Friend Request!",
      "body": `${friendFullName} accepted your friend request`,
      "icon": "https://boopboop.app/assets/icons/icon-96x96.png",
      "badge": "https://boopboop.app/assets/icons/icon-white-96x96.png",
      "silent": false,
      "data": {
        "defaultAction": "show_friends_page"
      },
      "actions": [{
        "action": "show_friends_page",
        "title": "View Friends"
      }]
    }
  };
}
