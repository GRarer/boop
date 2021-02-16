import { HomeScreenInfoResponse } from "boop-core";
import express from "express";
import { authenticateUUID } from "../services/auth";
import { database, } from "../services/database";
import { handleAsync, throwBoopError } from "../util/handleAsync";
export const userInfoRouter = express.Router();

userInfoRouter.get('/home_info', handleAsync(async (req, res) => {
  const userUUID = await authenticateUUID(req);

  const query = `select friendly_name, status_message, do_not_disturb from users where user_uuid = $1`;
  type ResultRow = {friendly_name: string; status_message: string | null; do_not_disturb: boolean | null;};
  const results: ResultRow[] = (await database.query(query, [userUUID]));
  if (results.length === 0) {
    // user should always be found since we already checked that the session token matches a user uuid
    throwBoopError("Something went wrong when retrieving your information.", 500);
  }
  const result = results[0];
  const response: HomeScreenInfoResponse = {
    friendlyName: result.friendly_name,
    statusMessage: result.status_message ?? "",
    doNotDisturb: result.do_not_disturb ?? false
  };
  res.send(response);
}));

userInfoRouter.put('/update_status', handleAsync(async (req, res) => {
  const userUUID: string = await authenticateUUID(req);
  const message: string = req.body;
  await database.query(`UPDATE users SET status_message=$1 WHERE user_uuid=$2;`, [message, userUUID]);
  res.send();
}));


userInfoRouter.put('/update_do_not_disturb', handleAsync(async (req, res) => {
  const userUUID: string = await authenticateUUID(req);
  const do_not_disturb: boolean = req.body;
  await database.query(`UPDATE users SET do_not_disturb=$1 WHERE user_uuid=$2;`, [do_not_disturb, userUUID]);
  res.send();
}));
