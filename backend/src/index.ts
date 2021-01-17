import express from "express";
import { exampleRouter } from "./routers/exampleRouter";
import bodyParser from "body-parser";
import cors from "cors";
import { subscriptionRouter } from "./routers/pushSubscriptionRouter";
import { database } from "./services/database";
import { databaseExampleRouter } from "./routers/databaseExampleRouter";
import { accountsRouter } from "./routers/accountsRouter";

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

// start ExpressJS server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// set a cleanup callback that will execute when the server is quit
process.on('quit', () => {
  console.log('cleaning up connection');
  void database.disconnect();
});
