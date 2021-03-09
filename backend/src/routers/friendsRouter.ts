import { AnswerFriendRequest, GetFriendsResult } from "boop-core";
import express from "express";
import { deleteFriendRequestQueryString, getFriends, getIncomingFriendRequests } from "../queries/friendsQueries";
import { getPushByUUID } from "../queries/pushQueries";
import { authenticateUUID } from "../services/auth";
import { database } from "../services/database";
import { friendRequestNotification, friendAcceptNotification } from "../services/friendNotification";
import { sendNotificationToUser } from "../services/pushManager";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const friendsRouter = express.Router();

async function createFriendRequest(fromUUID: string, toUUID: string): Promise<void> {
  // verify that request can be sent
  if (fromUUID === toUUID) {
    throwBoopError("You cannot send a friend request to yourself.", 403);
  }
  if ((await getIncomingFriendRequests(toUUID)).some(profile => profile.uuid === fromUUID)) {
    throwBoopError("You already sent a friend request to that user.", 409);
  }
  if ((await getIncomingFriendRequests(fromUUID)).some(profile => profile.uuid === toUUID)) {
    throwBoopError("That user already sent a friend request to you.", 409);
  }
  if ((await getFriends(fromUUID)).some(profile => profile.uuid === toUUID)) {
    throwBoopError("You are already friends with that user.", 409);
  }
  // add friend request in database
  await database.query(
    `insert into friend_requests(from_user, to_user) values($1, $2);`,
    [fromUUID, toUUID]
  );
  // send notification to recipient of friend request
  const subs = await getPushByUUID(toUUID);
  sendNotificationToUser(subs, friendRequestNotification)
    .catch(err => { console.error(err); });
}

// send a friend request to a user specified by username
friendsRouter.post('/send_request', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);
  const friend_username: string = req.body;
  // find uuid associated with username
  const matchingUsers = await database.query<{user_uuid: string;}>(
    `select user_uuid from users where username = $1`,
    [friend_username]
  );
  const toUUID = (matchingUsers[0] ?? throwBoopError(`User not found: ${friend_username}`, 404)).user_uuid;

  await createFriendRequest(userUUID, toUUID);
  res.send();
}));

// send a friend request to a user specified by uuid
friendsRouter.post('/send_request_to_uuid', handleAsync(async (req, res) => {
  const fromUUID = await authenticateUUID(req);
  const toUUID: string = req.body;
  await createFriendRequest(fromUUID, toUUID);
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

    // Send notification to the sender of the request
    const subs = await getPushByUUID(body.friendUUID);
    sendNotificationToUser(subs, friendAcceptNotification)
      .catch(err => { console.error(err); });
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


