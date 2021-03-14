import parseArgs from "minimist";

// application configuration info using command line arguments and environment variables
// when both a command line argument and an environment variable can be used, the argument has higher precedence

// command line arguments passed to node
const args = parseArgs(process.argv.slice(2));
// environment variables
const env = process.env;

export const config = {
  // port used for Express server
  expressPort: env["PORT"] ?? 3000,
  // postgres database credentials
  databaseConnectionSettings: {
    user: args["pg-user"] ?? env["PGUSER"] ?? "postgres",
    // there are two different environment variable names for the database password
    // 'postgres_password' is included to remain compatible with setup instructions previously given to team members
    password: args["pg-password"] ?? env["PGPASSWORD"] ?? env["postgres_password"],
    host: env["PGHOST"] ?? "localhost",
    database: env["PGDATABASE"] ?? "boop",
    port: 5432,
  },
  // causes users to get boop notifications every few seconds instead of every few hours (for notification testing)
  highFrequencyNotifications: !!args["frequent-push"]
};
