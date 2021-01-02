import express from "express";

export const exampleRouter = express.Router();

exampleRouter.get('/:id', function(req, res) {
  console.log("received GET");
  console.log(req.body);
  console.log(req.headers);
  res.send({
    message: "GET request received.",
    idPath: req.params.id
  });
});
exampleRouter.post('/', function(req, res) {
  console.log("received POST");
  console.log(req.body);
  console.log(req.headers);
  res.send({
    message: "POST request received.",
    payload: req.body
  });
});
