import { HomeScreenInfoResponse } from "boop-core";
import express from "express";
import { userUuidFromReq } from "../services/auth";
import { database, } from "../services/database";
import { handleAsync } from "../util/handleAsync";
export const userInfoRouter = express.Router();

userInfoRouter.get('/home_info', handleAsync(async (req, res) => {
  const userUUID = await userUuidFromReq(req);
  if (userUUID === undefined) {
    res.sendStatus(401);
    return;
  }


  const query = `select friendly_name from users where user_uuid = $1`;
  type ResultRow = {friendly_name: string;};
  const results: ResultRow[] = (await database.query(query, [userUUID]));
  if (results.length === 0) {
    res.sendStatus(500); // user should be found since we already checked that the session token matches a user uuid
    return;
  }
  const result = results[0];

  const response: HomeScreenInfoResponse = { friendlyName: result.friendly_name };
  res.send(response);
}));
