import { AnswerFriendRequest, GetFriendsResult } from "boop-core";
import express from "express";
import { getAuthInfoByUsername } from "../queries/authQueries";
import { deleteFriendRequestQueryString, getFriends, getIncomingFriendRequests } from "../queries/friendsQueries";
import { getPushByUUID } from "../queries/pushQueries";
import { authenticateUUID } from "../services/auth";
import { database } from "../services/database";
import { friendRequestNotification } from "../services/friendNotification";
import { sendNotificationToUser } from "../services/pushManager";
import { friendAcceptNotification } from "../services/userNotification";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const friendsRouter = express.Router();

friendsRouter.post('/send_request', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);

  const friend_username: unknown = req.body;
  if (typeof friend_username !== "string") {
    throwBoopError("Malformed username", 400);
  }
  const friendInfo = await getAuthInfoByUsername(friend_username); // TODO use a more specific query
  if (friendInfo === undefined) {
    throwBoopError("Specified username not found", 404);
  }
  if (userUUID === friendInfo.userUUID) {
    throwBoopError("You cannot send a friend request to yourself.", 403);
  }

  const alreadySentRequest: boolean = (await getIncomingFriendRequests(friendInfo.userUUID))
    .some(profile => profile.uuid === userUUID);
  if (alreadySentRequest) {
    throwBoopError("You already sent a friend request to that user.", 409);
  }
  const reverseExists: boolean = (await getIncomingFriendRequests(userUUID))
    .some(profile => profile.uuid === friendInfo.userUUID);
  if (reverseExists) {
    throwBoopError("That user already sent a friend request to you.", 409);
    return;
  }
  const alreadyFriends: boolean = (await getFriends(userUUID))
    .some(profile => profile.uuid === friendInfo.userUUID);
  if (alreadyFriends) {
    throwBoopError("You are already friends with that user.", 409);
  }

  await database.query(
    `insert into friend_requests(from_user, to_user) values($1, $2);`,
    [userUUID, friendInfo.userUUID]
  );

  const subs = await getPushByUUID(friendInfo.userUUID);
  sendNotificationToUser(subs, friendRequestNotification)
    .catch(err => { console.error(err); });  

  // TODO send a notification to the person who received the friend request
  res.send();
}));

friendsRouter.get('/my_friends', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);
  const result: GetFriendsResult = ({
    currentFriends: (await getFriends(userUUID)),
    pendingFriendRequestsToUser: (await getIncomingFriendRequests(userUUID))
  });
  res.send(result);
}));

friendsRouter.post('/answer_request', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);

  const body: AnswerFriendRequest = req.body;
  const pendingRequests = await getIncomingFriendRequests(userUUID);
  if (!pendingRequests.map(profile => profile.uuid).includes(body.friendUUID)) {
    throwBoopError("Friend request not found", 404);
  }

  if (body.accept) {
    await database.doTransaction((async client => {
      // remove friend request
      await client.query(deleteFriendRequestQueryString, [userUUID, body.friendUUID]);
      // insert both directions of friendship
      await client.query(
        `INSERT INTO FRIENDS(user_a, user_b) values ($1, $2), ($2, $1);`, [userUUID, body.friendUUID]);
    }));

    // Send notification back to user
    const subs = await getPushByUUID(userUUID);
    sendNotificationToUser(subs, friendAcceptNotification)
      .catch(err => { console.error(err); });
    // 


  } else {
    // just remove friend request
    await database.query(deleteFriendRequestQueryString, [userUUID, body.friendUUID]);
  }
  res.send();
}));

friendsRouter.post('/unfriend', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);
  const friendUUID: string = req.body;
  await database.query(
    `delete from friends
    where (((user_a = $1) and (user_b = $2)) or ((user_a = $2) and (user_b = $1)))`,
    [userUUID, friendUUID]
  );
  res.send();
}));


