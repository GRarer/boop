import parseArgs from "minimist";
import dotenv from "dotenv";

dotenv.config(); // if a .env file is present, dotenv configures process.env with values from that file

// application configuration info using command line arguments and environment variables
// when both a command line argument and an environment variable can be used, the argument has higher precedence

// command line arguments passed to node
const args = parseArgs(process.argv.slice(2));
// environment variables
const env = process.env;
console.log(env);

// show a message and halt startup if vapid keys are not provided
function missingKeyWarning(): never {
  console.error(
    "Fatal Error: VAPID key pair not found!"
    + "\nMake sure that the environment variables BOOP_VAPID_PUBLIC_KEY and BOOP_VAPID_PRIVATE_KEY are both set."
  );
  process.exit();
}

type BoopConfiguration = {
  // port used for Express server
  expressPort: string | number;
  // postgres database credentials
  databaseConnectionSettings: {
    user: string;
    password: string;
    host: string;
    database: string;
    port: number;
  };
  // authentication keys for web-push protocol
  vapidKeys: {
    publicKey: string;
    privateKey: string;
  };
  // notification testing mode: causes users to get boop notifications every few seconds instead of every few hours
  highFrequencyNotifications: boolean;
};

export const config: BoopConfiguration = {
  expressPort: env["PORT"] ?? 3000,
  databaseConnectionSettings: {
    user: args["pg-user"] ?? env["PGUSER"] ?? "postgres",
    // 'postgres_password' is included to remain compatible with setup instructions previously given to team members
    password: args["pg-password"] ?? env["PGPASSWORD"] ?? env["postgres_password"],
    host: env["PGHOST"] ?? "localhost",
    database: env["PGDATABASE"] ?? "boop",
    port: 5432,
  },
  vapidKeys: {
    publicKey: env["BOOP_VAPID_PUBLIC_KEY"] ?? missingKeyWarning(),
    privateKey: env["BOOP_VAPID_PRIVATE_KEY"] ?? missingKeyWarning(),
  },
  highFrequencyNotifications: !!args["frequent-push"]
};
