import express from "express";
import { exampleRouter } from "./exampleRouter";
import bodyParser from "body-parser";
import cors from "cors"
import { subscriptionRouter } from "./pushSubscriptionRouter";

const app = express();
const port = 3000;

//middleware
app.use((req, res, next) => { next(); }, cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// routers
app.use("/example", exampleRouter);
app.use("/push", subscriptionRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
