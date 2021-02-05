import { AnswerFriendRequest, GetFriendsResult } from "boop-core";
import express from "express";
import { getAuthInfo } from "../queries/authQueries";
import { getFriends, getIncomingFriendRequests, removeFriendRequest } from "../queries/friendsQueries";
import { authenticateUUID } from "../services/auth";
import { database } from "../services/database";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const friendsRouter = express.Router();

friendsRouter.post('/send_request', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);

  const friend_username: unknown = req.body;
  if (typeof friend_username !== "string") {
    throwBoopError("Malformed username", 400);
  }
  const friendInfo = await getAuthInfo(friend_username); // TODO use a more specific query
  if (friendInfo === undefined) {
    throwBoopError("Specified username not found", 404);
  }
  if (userUUID === friendInfo.userUUID) {
    throwBoopError("You cannot send a friend request to yourself.", 403);
  }

  const alreadySentRequest: boolean = (await getIncomingFriendRequests(friendInfo.userUUID))
    .map(profile => profile.uuid).includes(userUUID);
  if (alreadySentRequest) {
    throwBoopError("You already sent a friend request to that user.", 409);
  }
  const reverseExists: boolean = (await getIncomingFriendRequests(userUUID))
    .map(profile => profile.uuid).includes(friendInfo.userUUID);
  if (reverseExists) {
    throwBoopError("That user already sent a friend request to you.", 409);
    return;
  }
  const alreadyFriends: boolean = (await getFriends(userUUID))
    .map(profile => profile.uuid).includes(friendInfo.userUUID);
  if (alreadyFriends) {
    throwBoopError("You are already friends with that user.", 409);
  }

  const query = `insert into friend_requests(from_user, to_user) values($1, $2);`;
  await database.query(query, [userUUID, friendInfo.userUUID]);

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
    const addFriendshipQuery = `INSERT INTO FRIENDS(user_a, user_b) values($1, $2)`;
    await database.doTransaction((async client => {
      await client.query(addFriendshipQuery, [userUUID, body.friendUUID]);
      await client.query(addFriendshipQuery, [body.friendUUID, userUUID]);
    }));
  }
  await removeFriendRequest(userUUID, body.friendUUID);

  res.send();
}));

friendsRouter.post('/unfriend', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);
  const friendUUID: string = req.body;

  const deleteFriendshipQuery = `delete from friends where (user_a = $1) and (user_b = $2)`;
  await database.doTransaction(async (client) => {
    await client.query(deleteFriendshipQuery, [userUUID, friendUUID]);
    await client.query(deleteFriendshipQuery, [friendUUID, userUUID]);
  });
  res.send();
}));


