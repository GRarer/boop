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
  }
  // TODO reject if user already has pending friend request to the specified user or if they are already friends
  await database.addFriendRequest(userUUID, friendInfo.userUUID);
  // TODO send a notification to the person who received the friend request
  res.send();
}));
