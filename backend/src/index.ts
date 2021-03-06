import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { subscriptionRouter } from "./routers/pushSubscriptionRouter";
import { database } from "./services/database";
import { accountsRouter } from "./routers/accountsRouter";
import { promisify } from "util";
import { adminRouter } from "./routers/adminRouter";
import { startRepeatedJobs } from "./services/periodicJobs";
import { userInfoRouter } from "./routers/userInfoRouter";
import { friendsRouter } from "./routers/friendsRouter";
import { contactRouter } from "./routers/contactRouter";
import { profileRouter } from "./routers/profileRouter";
import { config } from "./config";

const app = express();
const port = config.expressPort;

// middleware
app.use((req, res, next) => { next(); }, cors());
// intellisense might warn that bodyParser is deprecated, even though the way we are using it is not deprecated
// this is a bug causes by Express having a deprecated function with the same name as a non-deprecated namespace.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());

// routers
app.use("/push", subscriptionRouter);
app.use("/account", accountsRouter);
app.use("/admin", adminRouter);
app.use("/user_info", userInfoRouter);
app.use("/friends", friendsRouter);
app.use("/contact", contactRouter);
app.use("/profile", profileRouter);

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
