import { HomeScreenInfoResponse } from "boop-core";
import express from "express";
import { authenticateUUID } from "../services/auth";
import { database, } from "../services/database";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const userInfoRouter = express.Router();

userInfoRouter.get('/home_info', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);

  const query = `select friendly_name from users where user_uuid = $1`;
  type ResultRow = {friendly_name: string;};
  const results: ResultRow[] = (await database.query(query, [userUUID]));
  if (results.length === 0) {
    // user should always be found since we already checked that the session token matches a user uuid
    throwBoopError("Something went wrong when retrieving your information.", 500);
  }
  const result = results[0];
  const response: HomeScreenInfoResponse = { friendlyName: result.friendly_name };
  res.send(response);
}));
