import { HomeScreenInfoResponse } from "boop-core";
import express from "express";
import { userUuidFromReq } from "../services/auth";
import { database, DatabaseError } from "../services/database";
import { handleAsync } from "../util/handleAsync";
export const userInfoRouter = express.Router();

userInfoRouter.get('/home_info', handleAsync(async (req, res) => {
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }
  const friendlyName = await database.getFriendlyName(userUUID);
  if (friendlyName === DatabaseError.UserNotFound) {
    res.sendStatus(500); // user should be found since we already checked that the session token matches a user uuid
    return;
  }
  const response: HomeScreenInfoResponse = { friendlyName };
  res.send(response);
}));
