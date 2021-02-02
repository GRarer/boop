import pg, { Pool } from "pg";
import parseArgs from "minimist";
import { Gender, ProfileSummary } from "boop-core";
import { Session, sessionTimeoutDuration } from "./auth";

// value-level signals indicating when certain database queries could not succeed
export enum DatabaseError {
  UserNotFound
}

// manages our connection to PostgreSQL database
class Database {

  private pool: pg.Pool; // a pool of connection clients allows us to make concurrent queries

  constructor() {

    /* To connect to the database, we need to have the computer's postgres superuser password
    * The first place we look is the --password command-line argument. If that argument is not included,
    * we next look for an environment variable called "postgres_password".
    */
    const passwordArgument: string | undefined = parseArgs(process.argv.slice(2))["password"];
    const passwordEnvironmentVariable: string | undefined = process.env["postgres_password"];

    const usernameArgument: string | undefined = parseArgs(process.argv.slice(2))["sqlUser"];

    this.pool = new Pool({
      user: usernameArgument ?? 'postgres',
      database: 'boop',
      password: passwordArgument ?? passwordEnvironmentVariable,
      port: 5432,
    });
  }

  // throws an exception if the database is not connected or cannot authenticate.
  async checkConnection(): Promise<void> {
    {
      await this.pool.query('SELECT * from users limit 1;');
      return;
    }
  }

  // this should be called when the server exits, and at no other time
  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  // queries for database example demonstration
  async addExampleValue(value: string): Promise<void> {
    const timestamp: number = Date.now();
    await this.pool.query(
      `INSERT INTO example_data(id_number, contents) VALUES($1, $2) RETURNING *;`,
      [timestamp, value]
    );
  }

  async getExampleValues(): Promise<string[]> {
    const rows: { contents: string; }[] = (await this.pool.query('SELECT contents from example_data;')).rows;
    const result = rows.map(x => x.contents);
    return result;
  }

  // information needed authenticate and log in a user
  async getAuthInfo(username: string):
  Promise<{userUUID: string; hash: string; isAdmin: boolean;} | DatabaseError.UserNotFound> {
    const query = 'SELECT "user_uuid", "bcrypt_hash", "is_admin" from users where username = $1;';
    type resultRow = { user_uuid: string; bcrypt_hash: string; is_admin: boolean; };
    const rows: resultRow[] = (await this.pool.query(query, [username])).rows;
    if (rows.length === 0) {
      return DatabaseError.UserNotFound;
    } else if (rows.length === 1) {
      const result = rows[0];
      return { userUUID: result.user_uuid, hash: result.bcrypt_hash, isAdmin: result.is_admin };
    } else {
      throw Error("Multiple accounts with same username"); // sql uniqueness constraint should prevent this
    }
  }

  async getSession(token: string): Promise<Session | undefined> {
    const updateTimeQuery = `update sessions set time_last_touched = $1 where token = $2;`;
    await this.pool.query(updateTimeQuery, [Date.now(), token]);

    const getSessionQuery =
      `select user_uuid, is_admin
      from users join sessions using (user_uuid) where token = $1;`;
      type resultRow= {user_uuid: string; is_admin: boolean;};
      const rows: resultRow[] = (await this.pool.query(getSessionQuery, [token])).rows;
      if (rows.length === 0) {
        return undefined;
      }
      const session = rows[0];
      return { userUUID: session.user_uuid, isAdmin: session.is_admin };
  }

  async setSession(token: string, userUUID: string): Promise<void> {
    const addSessionQuery = `INSERT INTO sessions(token, user_uuid, time_last_touched) VALUES ($1, $2, $3);`;
    await this.pool.query(addSessionQuery, [token, userUUID, Date.now()]);
  }

  async removeExpiredSessions(): Promise<void> {
    const oldestAllowedTime = Date.now() - sessionTimeoutDuration;
    const query = `delete from sessions where time_last_touched < $1;`;
    await this.pool.query(query, [oldestAllowedTime]);
  }

  async removeSession(token: string): Promise<void> {
    await this.pool.query(`delete from sessions where token = $1;`, [token]);
  }

  async addAccount(values: {
    uuid: string;
    username: string;
    fullName: string;
    passwordHash: string;
    friendlyName: string;
    emailAddress: string;
    birthDate: string; // ISO format date string (e.g. 2020-01-16)
    gender: Gender;
  }): Promise<void> {
    // TODO handle already-reserved usernames
    const query =
    `INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name", "friendly_name", "gender", "email", "birth_date", "is_admin")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`;
    await this.pool.query(query, [values.uuid, values.username, values.passwordHash, values.fullName,
      values.friendlyName, values.gender, values.emailAddress, values.birthDate, false]);
  }

  // queries for database example demonstration
  async addPushSubscription(subscription: PushSubscriptionJSON, userUUID: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO subscriptions(endpoint, sub_json, user_uuid) VALUES($1, $2, $3)
      ON CONFLICT (endpoint, user_uuid) DO UPDATE SET endpoint=$1, sub_json=$2;`,
      [subscription.endpoint, subscription, userUUID]
    );
  }

  async getPushByUsername(username: string): Promise<PushSubscriptionJSON[]> {
    const query = `select sub_json from users join subscriptions using (user_uuid) where username = $1`;
    type resultRow = {sub_json: PushSubscriptionJSON;};
    const result: resultRow[] = (await this.pool.query(query, [username])).rows;
    return result.map(r => r.sub_json);
  }

  // TODO this will probably be redundant with a different query introduced by the account settings feature
  async getFriendlyName(userUUID: string): Promise<string | DatabaseError.UserNotFound> {
    const query = `select friendly_name from users where user_uuid = $1`;
    type resultRow = {friendly_name: string;};
    const result: resultRow[] = (await this.pool.query(query, [userUUID])).rows;
    if (result.length === 0) {
      return DatabaseError.UserNotFound;
    } else {
      return result[0].friendly_name;
    }
  }

  async addFriendRequest(fromUUID: string, toUUID: string): Promise<void> {
    const query = `insert into friend_requests(from_user, to_user) values($1, $2);`;
    await this.pool.query(query, [fromUUID, toUUID]);
  }

  async removeFriendRequest(fromUUID: string, toUUID: string): Promise<void> {
    const query = `delete from friend_requests where (from_user = $1) and (to_user = $2)`;
    await this.pool.query(query, [fromUUID, toUUID]);
  }

  async getIncomingFriendRequests(uuid: string): Promise<ProfileSummary[]> {
    const query =
      `select distinct user_uuid, username, full_name from users join friend_requests
      on user_uuid = from_user where to_user = $1;`;
    type ResultRow = {user_uuid: string; username: string; full_name: string;};
    const results: ResultRow[] = (await this.pool.query(query, [uuid])).rows;
    return results.map(r => ({ uuid: r.user_uuid, username: r.username, fullName: r.full_name }));
  }

  async getFriends(uuid: string): Promise<ProfileSummary[]> {
    const query =
      `select distinct user_uuid, username, full_name from friends join users on user_a = user_uuid where user_b = $1;`;
    type ResultRow = {user_uuid: string; username: string; full_name: string;};
    const results: ResultRow[] = (await this.pool.query(query, [uuid])).rows;
    return results.map(r => ({ uuid: r.user_uuid, username: r.username, fullName: r.full_name }));
  }

  async addFriendship(userUUID: string, friendUUID: string): Promise<void> {
    // insert both directions of friendship as a transaction
    const client = await this.pool.connect();
    try {
      const query = `INSERT INTO FRIENDS(user_a, user_b) values($1, $2)`;
      await client.query('BEGIN');
      await client.query(query, [userUUID, friendUUID]);
      await client.query(query, [friendUUID, userUUID]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async removeFriendship(userUUID: string, friendUUID: string): Promise<void> {
    // remove both directions of friendship
    const client = await this.pool.connect();
    try {
      const query = `delete from friends where (user_a = $1) and (user_b = $2)`;
      await client.query('BEGIN');
      await client.query(query, [userUUID, friendUUID]);
      await client.query(query, [friendUUID, userUUID]);
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

// we export a single instance of database since we should not have more than one connection pool
export const database: Database = new Database();

// check connection and quit if database authentication fails (e.g. wrong postgres password)
database.checkConnection()
  .catch((reason: unknown) => {
    console.error(reason);
    database.disconnect().finally(() => { process.exit(); });
  });
