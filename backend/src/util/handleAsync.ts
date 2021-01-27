import Express from "express";

// safely wraps async functions to be used as express handlers, responds with 500 if the async function throws an error
export function handleAsync(
  handlerFunction: (req: Express.Request, res: Express.Response) => Promise<void>
): (req: Express.Request, res: Express.Response) => void {
  return (request, response) => {
    handlerFunction(request, response).catch((reason: unknown) => {
      console.error("unhandled error in async handler");
      console.error(reason);
      response.sendStatus(500);
    });
  };
}
