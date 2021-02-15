// database queries related to login and authorization

import { database, } from "../services/database";
import { throwBoopError } from "../util/handleAsync";

// information needed authenticate and log in a user
export async function getAuthInfoByUsername(username: string):
Promise<{userUUID: string; hash: string; } | undefined> {
  const query = 'SELECT "user_uuid", "bcrypt_hash" from users where username = $1;';
  type ResultRow = { user_uuid: string; bcrypt_hash: string; };
  const rows = (await database.query<ResultRow>(query, [username]));

  if (rows.length === 1) {
    const result = rows[0];
    return { userUUID: result.user_uuid, hash: result.bcrypt_hash };
  } else if (rows.length === 0) {
    return undefined;
  } else {
    throwBoopError("Multiple accounts with same username", 500); // sql uniqueness constraint should prevent this
  }
}

export async function getPasswordHashByUuid(uuid: string): Promise<string> {
  const query = 'SELECT "bcrypt_hash" from users where user_uuid=$1';
  const rows: { bcrypt_hash: string; }[] = (await database.query(query, [uuid]));
  if (rows.length === 0) {
    throwBoopError("Account not found", 404);
  }
  return rows[0].bcrypt_hash;
}

// get the session matching a given session token
// time_last_touched is updated every time this is used
export async function getSessionUserUUID(token: string): Promise<string | undefined> {
  // update time last touched
  await database.query(`update sessions set time_last_touched = $1 where token = $2;`, [Date.now(), token]);

  const rows = (await database.query<{user_uuid: string;}>(
    `select user_uuid from sessions where token = $1;`, [token]
  ));
  if (rows.length === 0) {
    return undefined;
  }
  return rows[0].user_uuid;
}

// insert a new session into the database
export async function setSession(token: string, userUUID: string): Promise<void> {
  const addSessionQuery = `INSERT INTO sessions(token, user_uuid, time_last_touched) VALUES ($1, $2, $3);`;
  await database.query(addSessionQuery, [token, userUUID, Date.now()]);
}

export async function removeSession(token: string): Promise<void> {
  await database.query(`delete from sessions where token = $1;`, [token]);
}
