import { BoopError, isBoopError } from "boop-core";
import Express from "express";

// safely wraps async functions to be used as express handlers, sends an error response if the handler throws an error
export function handleAsync(
  handlerFunction: (req: Express.Request, res: Express.Response) => Promise<void>
): (req: Express.Request, res: Express.Response) => void {
  return (request, response) => {
    handlerFunction(request, response).catch((reason: unknown) => {
      if (isBoopError(reason)) {
        response.status(reason.statusNumber).send(reason);
      } else {
        console.error("unexpected error in handler");
        console.error(reason);
        response.sendStatus(500);
      }
    });
  };
}

// throws an object that will be caught by handleAsync
export function throwBoopError(message: string, status: number, cause?: unknown): never {
  const err: BoopError = { errorMessage: message, statusNumber: status, cause };
  throw err;
}
