import pg, { Pool } from "pg";
import { config } from "../config";

// manages our connection to PostgreSQL database
class Database {

  private pool: pg.Pool; // a pool of connection clients allows us to make concurrent queries

  constructor() {
    this.pool = new Pool(config.databaseConnectionSettings);
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
