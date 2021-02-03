// database queries related to login and authorization

import { Session, } from "../services/auth";
import { database, } from "../services/database";

// information needed authenticate and log in a user
export async function getAuthInfo(username: string):
Promise<{userUUID: string; hash: string; isAdmin: boolean;} | undefined> {
  const query = 'SELECT "user_uuid", "bcrypt_hash", "is_admin" from users where username = $1;';
  type ResultRow = { user_uuid: string; bcrypt_hash: string; is_admin: boolean; };
  const rows = (await database.query<ResultRow>(query, [username]));

  if (rows.length === 1) {
    const result = rows[0];
    return { userUUID: result.user_uuid, hash: result.bcrypt_hash, isAdmin: result.is_admin };
  } else if (rows.length === 0) {
    return undefined;
  } else {
    throw Error("Multiple accounts with same username"); // sql uniqueness constraint should prevent this
  }
}

// get the session matching a given session token
// time_last_touched is updated every time this is used
export async function getSession(token: string): Promise<Session | undefined> {
  const updateTimeQuery = `update sessions set time_last_touched = $1 where token = $2;`;
  await database.query(updateTimeQuery, [Date.now(), token]);

  const getSessionQuery =
    `select user_uuid, is_admin from users join sessions using (user_uuid) where token = $1;`;
  type ResultRow= {user_uuid: string; is_admin: boolean;};
  const rows = (await database.query<ResultRow>(getSessionQuery, [token]));
  if (rows.length === 0) {
    return undefined;
  }
  const session = rows[0];
  return { userUUID: session.user_uuid, isAdmin: session.is_admin };
}

// insert a new session into the database
export async function setSession(token: string, userUUID: string): Promise<void> {
  const addSessionQuery = `INSERT INTO sessions(token, user_uuid, time_last_touched) VALUES ($1, $2, $3);`;
  await database.query(addSessionQuery, [token, userUUID, Date.now()]);
}

export async function removeSession(token: string): Promise<void> {
  await database.query(`delete from sessions where token = $1;`, [token]);
}
