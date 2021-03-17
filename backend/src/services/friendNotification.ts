
import { database } from "../services/database";
import { throwBoopError } from "../util/handleAsync";


async function queryFullName(fromUUID: string): Promise<string> {
  const rows = await database.query<{full_name: string;}>(
    `select full_name from users where user_uuid = $1`, [fromUUID]
  );
  if (rows.length === 0) {
    throwBoopError("User not found", 404);
  }
  return rows[0].full_name;
}

export async function friendRequestNotification(fromUUID: string): Promise<{notification: Object;}> {
  const senderUsername: string = await queryFullName(fromUUID);
  return {
    "notification": {
      "title": "Boop Friend Request!",
      "body": `You got a friend request on Boop from ${senderUsername}`,
      "silent": false,
      "actions": [{
        "action": "show_friends_page",
        "title": "View friend request"
      }]
    }
  };
}

export async function friendAcceptNotification(toUUID: string): Promise<{notification: Object;}> {
  const friendUsername: string = await queryFullName(toUUID);
  return {
    "notification": {
      "title": "Boop Friend Request!",
      "body": `${friendUsername} accepted your friend request`,
      "silent": false,
      "actions": [{
        "action": "show_friends_page",
        "title": "View Friends"
      }]
    }
  };
}