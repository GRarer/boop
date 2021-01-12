import pg, { Pool } from "pg";
import parseArgs from "minimist";

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

    this.pool = new Pool({
      user: 'postgres',
      database: 'boop',
      password: passwordArgument ?? passwordEnvironmentVariable,
      port: 5432,
    });
  }

  // this should be called when the server exits, and at no other time
  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  // queries for database example demonstration
  async addExampleValue(value: string): Promise<void> {
    const timestamp: number = Date.now();
    await this.pool.query(
      `INSERT INTO example_data(id_number, contents) VALUES($1, $2) RETURNING *`,
      [timestamp, value]
    );
  }

  async getExampleValues(): Promise<string[]> {
    const rows: { contents: string; }[] = (await this.pool.query('SELECT contents from example_data')).rows;
    const result = rows.map(x => x.contents);
    return result;
  }
}

// we export a single instance of database since we should not have more than one connection pool
export const database: Database = new Database();
