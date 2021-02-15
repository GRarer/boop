import { LoginRequest, LoginResponse, sessionTokenHeaderName } from 'boop-core';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import { Request } from "express";
import { getAuthInfoByUsername, getSessionUserUUID, setSession } from '../queries/authQueries';
import { throwBoopError } from '../util/handleAsync';
import { database } from './database';

// 30 days expressed in milliseconds; user sessions will be closed if left inactive for this time
export const sessionTimeoutDuration: number = 30 * 24 * 60 * 60 * 1000;

// validate password and create log-in session
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const userInfo = await getAuthInfoByUsername(credentials.username);
  if (userInfo === undefined) {
    throwBoopError("User not found", 404);
  }
  // validating password with a bcrypt hash is an asynchronous operation because it is *very* slow
  if (await bcrypt.compare(credentials.password, userInfo.hash)) {
    // a prefix is included in session tokens to prevent confusing them with user UUIDs
    const token: string = `session-${uuidv4()}`;
    await setSession(token, userInfo.userUUID);
    return { userUUID: userInfo.userUUID, sessionToken: token };
  } else {
    throwBoopError("Incorrect password", 403);
  }
}

function sessionTokenFromReq(req: Request): string {
  const token: string | undefined = req.header(sessionTokenHeaderName);
  if (typeof token !== "string") {
    throwBoopError("Missing Authentication Token", 401);
  }
  return token;
}

// gets the user UUID associated with a session token, or undefined if the token does not match any active session
// in most cases you should use authenticateUUID instead
export async function userUuidFromReq(req: Request): Promise<string | undefined> {
  const token = sessionTokenFromReq(req);
  return await getSessionUserUUID(token);
}

// returns user UUID matching request's session token header, or throws an error if it cannot authenticate
export async function authenticateUUID(req: Request): Promise<string> {
  const uuid = await userUuidFromReq(req);
  if (uuid === undefined) {
    throwBoopError("Not logged in.", 401);
  }
  return uuid;
}

// throws an error if the request does not come from a logged-in admin user
export async function authenticateAdmin(req: Request): Promise<void> {
  const token = sessionTokenFromReq(req);
  const rows = await database.query<{admin_user_uuid: string;}>(
    `select admin_user_uuid from administrators join sessions on admin_user_uuid = user_uuid where token = $1`,
    [token]
  );
  const isAdmin = rows.length > 0;
  if (!isAdmin) {
    throwBoopError("Not authenticated as admin user.", 403);
  }
}

export async function hashPassword(password: string): Promise<string> {
  // incrementing salt rounds number by 1 doubles the time needed to calculate a hash
  const saltRounds: number = 9;
  return await bcrypt.hash(password, saltRounds);
}
