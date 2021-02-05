import pg, { Pool } from "pg";
import parseArgs from "minimist";
import { Gender } from 'boop-core';

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

  // performs a single query
  async query<Row>(queryString: string, params: unknown[]): Promise<Row[]> {
    return (await this.pool.query(queryString, params)).rows;
  }

  // performs a transaction, automatically rolling back if any of the steps fail
  async doTransaction<Result>(transaction: (client: pg.PoolClient) => Promise<Result>): Promise<Result> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await transaction(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // this should be called when the server exits, and at no other time
  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async getPasswordHash(uuid: string): Promise<{hash: string;} | undefined> {
    const query = 'SELECT "bcrypt_hash" from users where user_uuid=$1';
    type resultRow = { bcrypt_hash: string; };
    const rows: resultRow[] = (await this.pool.query(query, [uuid])).rows;
    if (rows.length === 0) {
      return undefined;
    }
    return { hash: rows[0].bcrypt_hash };
  }

  async updatePasswordHash(uuid: string, hash: string): Promise<void> {
    const query = 'UPDATE users SET bcrypt_hash=$1 WHERE user_uuid=$2;';
    await this.pool.query(query, [hash, uuid]);
  }

  async updateAccount(values: {
    username: string;
    fullName: string;
    friendlyName: string;
    emailAddress: string;
    birthDate: string;
    gender: Gender;
    uuid: string;
  }): Promise<void> {
    const query =
    `UPDATE users SET username=$1, full_name=$2, friendly_name=$3, gender=$4, email=$5, birth_date=$6
    WHERE user_uuid=$7;`;
    await this.pool.query(query, [values.username, values.fullName,
      values.friendlyName, values.gender, values.emailAddress, values.birthDate, values.uuid]);
  }

  async getUserAccount(uuid: string): Promise<{ username: string; fullName: string; friendlyName: string;
    emailAddress: string; birthDate: string; gender: Gender; } | undefined> {
    const query = `SELECT "username", "full_name", "friendly_name", "email", "birth_date", "gender"
     FROM users WHERE user_uuid=$1`;
    type userRow = {
      username: string;
      full_name: string;
      friendly_name: string;
      email: string;
      birth_date: string;
      gender: Gender;
    };

    const rows: userRow[] = (await this.pool.query(query, [uuid])).rows;

    if (rows.length > 0) {
      const result = rows[0];
      return {
        username: result.username,
        fullName: result.full_name,
        friendlyName: result.friendly_name,
        emailAddress: result.email,
        birthDate: result.birth_date,
        gender: result.gender
      };
    }

    return undefined;
  }
}

// we export a single instance of database since we should not have more than one connection pool
export const database: Database = new Database();

// immediately throw an exception if the database is not connected or cannot authenticate
database.query(`select 1;`, [])
  .catch((reason: unknown) => {
    console.error(reason);
    database.disconnect().finally(() => { process.exit(); });
  });
