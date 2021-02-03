import { LoginRequest, LoginResponse, sessionTokenHeaderName } from 'boop-core';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import { Request } from "express";
import { getAuthInfo, getSession, setSession } from '../queries/authQueries';
import { throwBoopError } from '../util/handleAsync';

export type Session = {userUUID: string; isAdmin: boolean;};

// 30 days expressed in milliseconds; user sessions will be closed if left inactive for this time
export const sessionTimeoutDuration: number = 30 * 24 * 60 * 60 * 1000;

// validate password and create log-in session
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const userInfo = await getAuthInfo(credentials.username);
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

async function sessionFromReq(req: Request): Promise<Session | undefined> {
  const token: string | undefined = req.header(sessionTokenHeaderName);
  if (typeof token !== "string") {
    return undefined;
  }
  return await getSession(token);
}

// gets the user UUID associated with a session token, or undefined if the token does not match any active session
export async function userUuidFromReq(req: Request): Promise<string | undefined> {
  return (await sessionFromReq(req))?.userUUID;
}

// returns user UUID matching request's session token header, or throws an error if it cannot authenticate
export async function authenticateUUID(req: Request): Promise<string> {
  const uuid = (await sessionFromReq(req))?.userUUID;
  if (uuid === undefined) {
    throwBoopError("Not logged in.", 401);
  }
  return uuid;
}

// throws an error if the request does not come from a logged-in admin user
export async function authenticateAdmin(req: Request): Promise<void> {
  const isAdmin = (await sessionFromReq(req))?.isAdmin ?? false;
  if (!isAdmin) {
    throwBoopError("Not authenticated as admin user.", 403);
  }
}

export async function hashPassword(password: string): Promise<string> {
  // incrementing salt rounds number by 1 doubles the time needed to calculate a hash
  const saltRounds: number = 9;
  return await bcrypt.hash(password, saltRounds);
}
