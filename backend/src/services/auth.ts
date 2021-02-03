import { LoginRequest, LoginResponse, sessionTokenHeaderName } from 'boop-core';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import { Request } from "express";
import { getAuthInfo, getSession, setSession } from '../queries/authQueries';

export type Session = {userUUID: string; isAdmin: boolean;};

// 30 days expressed in milliseconds; user sessions will be closed if left inactive for this time
export const sessionTimeoutDuration: number = 30 * 24 * 60 * 60 * 1000;

export enum LoginError {
  UserNotFound,
  WrongPassword
}

// validate password and create log-in session
export async function login(credentials: LoginRequest): Promise<LoginResponse | LoginError> {
  const userInfo = await getAuthInfo(credentials.username);
  if (userInfo === undefined) {
    return LoginError.UserNotFound;
  }
  // validating password with a bcrypt hash is an asynchronous operation because it is *very* slow
  if (await bcrypt.compare(credentials.password, userInfo.hash)) {
    // a prefix is included in session tokens to prevent confusing them with user UUIDs
    const token: string = `session-${uuidv4()}`;
    await setSession(token, userInfo.userUUID);
    return { userUUID: userInfo.userUUID, sessionToken: token };
  } else {
    return LoginError.WrongPassword;
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

// returns true if the session token belongs to an "admin" user
export async function isAdminSessionFromReq(req: Request): Promise<boolean> {
  return (await sessionFromReq(req))?.isAdmin ?? false;
}

export async function hashPassword(password: string): Promise<string> {
  // incrementing salt rounds number by 1 doubles the time needed to calculate a hash
  const saltRounds: number = 9;
  return await bcrypt.hash(password, saltRounds);
}
