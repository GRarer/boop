import { LoginRequest, LoginResponse, sessionTokenHeaderName } from 'boop-core';
import { v4 as uuidv4 } from 'uuid';
import { database } from './database';
import bcrypt from "bcrypt";
import { Request } from "express";

/* a user session token is a UUID that is given to the client when it logs in
 * the token is sent as a header in all requests made to the back-end in order to verify the client's identity
 */
type Session = {
  userUUID: string; // the permanent UUID for this user account, not the same as the username
  isAdmin: boolean;
};

// map from auth tokens to sessions
const activeSessions: Map<string, Session> = new Map();

// a prefix is included in session tokens to distinguish them from permanent user UUIDs
function generateSessionToken(): string {
  return `session-${uuidv4()}`;
}

// validate password and create log-in session
export async function login(credentials: LoginRequest): Promise<LoginResponse | "User Not Found" | "Wrong Password"> {
  const userInfo = await database.getAuthInfo(credentials.username);
  if (userInfo === "Account Not Found") {
    return "User Not Found";
  }
  // validating password with a bcrypt hash is an asynchronous operation because it is *very* slow
  if (await bcrypt.compare(credentials.password, userInfo.hash)) {
    const session: Session = {
      userUUID: userInfo.userUUID,
      isAdmin: userInfo.isAdmin,
    };
    const token: string = generateSessionToken();
    activeSessions.set(token, session);
    return { userUUID: session.userUUID, sessionToken: token };
  } else {
    return "Wrong Password";
  }
}

function sessionFromReq(req: Request): Session | undefined {
  const token: string | undefined = req.header(sessionTokenHeaderName);
  if (typeof token === "string") {
    return activeSessions.get(token);
  } else {
    return undefined;
  }

}

// gets the user UUID associated with a session token, or undefined if the token does not match any active session
export function getUserUUID(req: Request): string | undefined {
  return sessionFromReq(req)?.userUUID;
}

// returns true if the session token belongs to an "admin" user
export function isAdminSession(req: Request): boolean {
  return sessionFromReq(req)?.isAdmin ?? false;
}


export async function hashPassword(password: string): Promise<string> {
  // incrementing salt rounds number by 1 doubles the time needed to calculate a hash
  const saltRounds: number = 9;
  return await bcrypt.hash(password, saltRounds);
}
