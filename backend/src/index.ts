import express from "express";
import { exampleRouter } from "./routers/exampleRouter";
import bodyParser from "body-parser";
import cors from "cors";
import { subscriptionRouter } from "./routers/pushSubscriptionRouter";
import { database } from "./services/database";
import { databaseExampleRouter } from "./routers/databaseExampleRouter";
import { accountsRouter } from "./routers/accountsRouter";
import { promisify } from "util";
import { adminRouter } from "./routers/adminRouter";
import { startRepeatedJobs } from "./services/periodicJobs";
import { userInfoRouter } from "./routers/userInfoRouter";
import { friendsRouter } from "./routers/friendsRouter";

const app = express();
const port = 3000;

// middleware
app.use((req, res, next) => { next(); }, cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

// routers
app.use("/example", exampleRouter);
app.use("/push", subscriptionRouter);
app.use("/db_example", databaseExampleRouter);
app.use("/account", accountsRouter);
app.use("/admin", adminRouter);
app.use("/user_info", userInfoRouter);
app.use("/friends", friendsRouter);


// start ExpressJS server
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// schedule repeated tasks
startRepeatedJobs();

// handler to shut down cleanly and free resources
async function cleanShutdown(): Promise<void> {
  // the express server close() function uses callback style, so we have to convert it into a promise
  await promisify((callback?: ((err?: Error | undefined) => void)) => { server.close(callback); });
  await database.disconnect();
}

// attach signal/event handlers to run before exiting
["SIGINT", "SIGTERM", "SIGHUP"].forEach(signal => {
  process.on(signal, function() {
    console.log("shutting down...");
    cleanShutdown().then(() => {
      console.log("shutdown complete");
    }).catch(reason => {
      console.error("failed to shut down cleanly");
      console.log(reason);
    }).finally(() => {
      process.exit();
    });
  });
});
