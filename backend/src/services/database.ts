import pg, { Pool } from "pg";
import parseArgs from "minimist";

// TODO replace with a uniform error handling system
// value-level signals indicating when certain database queries could not succeed
export enum DatabaseError {
  UserNotFound,
  Conflict,
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
}

// we export a single instance of database since we should not have more than one connection pool
export const database: Database = new Database();

// immediately throw an exception if the database is not connected or cannot authenticate
database.query(`select 1;`, [])
  .catch((reason: unknown) => {
    console.error(reason);
    database.disconnect().finally(() => { process.exit(); });
  });
