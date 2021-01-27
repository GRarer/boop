import express from "express";
import { handleAsync } from "../util/handleAsync";

export const exampleRouter = express.Router();

exampleRouter.get('/:id', handleAsync(async (req, res) => {
  console.log("received GET");
  console.log(req.body);
  console.log(req.headers);
  res.send({
    message: "GET request received.",
    idPath: req.params.id
  });
}));
exampleRouter.post('/', handleAsync( async (req, res) => {
  console.log("received POST");
  console.log(req.body);
  console.log(req.headers);
  res.send({
    message: "POST request received.",
    payload: req.body
  });
}));
