import { AnswerFriendRequest, GetFriendsResult } from "boop-core";
import express from "express";
import { userUuidFromReq } from "../services/auth";
import { database, DatabaseError } from "../services/database";
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
  const friendInfo = await database.getAuthInfo(friend_username);
  if (friendInfo === DatabaseError.UserNotFound) {
    res.sendStatus(404);
    return;
  }
  if (userUUID === friendInfo.userUUID) {
    res.sendStatus(403);
    return;
  }

  const alreadySentRequest: boolean = (await database.getIncomingFriendRequests(friendInfo.userUUID))
    .map(profile => profile.uuid).includes(userUUID);
  if (alreadySentRequest) {
    res.sendStatus(409);
    return;
  }
  const reverseExists: boolean = (await database.getIncomingFriendRequests(userUUID))
    .map(profile => profile.uuid).includes(friendInfo.userUUID);
  if (reverseExists) {
    res.sendStatus(409);
    return;
  }
  const alreadyFriends: boolean = (await database.getFriends(userUUID))
    .map(profile => profile.uuid).includes(friendInfo.userUUID);
  if (alreadyFriends) {
    res.sendStatus(409);
    return;
  }

  await database.addFriendRequest(userUUID, friendInfo.userUUID);
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
    currentFriends: (await database.getFriends(userUUID)),
    pendingFriendRequestsToUser: (await database.getIncomingFriendRequests(userUUID))
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
  const pendingRequests = await database.getIncomingFriendRequests(userUUID);
  if (!pendingRequests.map(profile => profile.uuid).includes(body.friendUUID)) {
    res.sendStatus(404);
    return;
  }

  if (body.accept) {
    await database.addFriendship(userUUID, body.friendUUID);
  }
  await database.removeFriendRequest(body.friendUUID, userUUID);

  res.send();
}));

friendsRouter.post('/unfriend', handleAsync(async (req, res) => {
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }
  const friendUUID: string = req.body;
  await database.removeFriendship(userUUID, friendUUID);
  res.send();
}));


