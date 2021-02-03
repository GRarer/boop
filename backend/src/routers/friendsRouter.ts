import { AnswerFriendRequest, GetFriendsResult } from "boop-core";
import express from "express";
import { getAuthInfo } from "../queries/authQueries";
import { getFriends, getIncomingFriendRequests, removeFriendRequest } from "../queries/friendsQueries";
import { userUuidFromReq } from "../services/auth";
import { database } from "../services/database";
import { handleAsync } from "../util/handleAsync";
export const friendsRouter = express.Router();

friendsRouter.post('/send_request', handleAsync(async (req, res) => {
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }
  const friend_username: unknown = req.body;
  if (typeof friend_username !== "string") {
    res.sendStatus(400);
    return;
  }
  const friendInfo = await getAuthInfo(friend_username); // TODO use a more specific query
  if (friendInfo === undefined) {
    res.sendStatus(404);
    return;
  }
  if (userUUID === friendInfo.userUUID) {
    res.sendStatus(403);
    return;
  }

  const alreadySentRequest: boolean = (await getIncomingFriendRequests(friendInfo.userUUID))
    .map(profile => profile.uuid).includes(userUUID);
  if (alreadySentRequest) {
    res.sendStatus(409);
    return;
  }
  const reverseExists: boolean = (await getIncomingFriendRequests(userUUID))
    .map(profile => profile.uuid).includes(friendInfo.userUUID);
  if (reverseExists) {
    res.sendStatus(409);
    return;
  }
  const alreadyFriends: boolean = (await getFriends(userUUID))
    .map(profile => profile.uuid).includes(friendInfo.userUUID);
  if (alreadyFriends) {
    res.sendStatus(409);
    return;
  }

  const query = `insert into friend_requests(from_user, to_user) values($1, $2);`;
  await database.query(query, [userUUID, friendInfo.userUUID]);

  // TODO send a notification to the person who received the friend request
  res.send();
}));

friendsRouter.get('/my_friends', handleAsync(async (req, res) => {
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }

  const result: GetFriendsResult = ({
    currentFriends: (await getFriends(userUUID)),
    pendingFriendRequestsToUser: (await getIncomingFriendRequests(userUUID))
  });
  res.send(result);
}));

friendsRouter.post('/answer_request', handleAsync(async (req, res) => {
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }

  const body: AnswerFriendRequest = req.body;
  const pendingRequests = await getIncomingFriendRequests(userUUID);
  if (!pendingRequests.map(profile => profile.uuid).includes(body.friendUUID)) {
    res.sendStatus(404);
    return;
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
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }
  const friendUUID: string = req.body;

  const deleteFriendshipQuery = `delete from friends where (user_a = $1) and (user_b = $2)`;
  await database.doTransaction(async (client) => {
    await client.query(deleteFriendshipQuery, [userUUID, friendUUID]);
    await client.query(deleteFriendshipQuery, [friendUUID, userUUID]);
  });
  res.send();
}));


