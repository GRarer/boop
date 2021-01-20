import express from "express";
import { getUserUUID, isAdminSession } from "../services/auth";

// endpoints for triggering special administrative commands
// these endpoints should return error 403 unless the client provides a session token that matches an admin account
// it also serves as a demonstration of session-token-based authentication
export const adminRouter = express.Router();

// example endpoint that verifies that the current user is an admin, returns error 403 otherwise
adminRouter.post('/check', (req, res) => {
  if (isAdminSession(req)) {
    console.log(`test action by admin user ${getUserUUID(req)}`);
    res.send();
  } else {
    res.sendStatus(403);
  }
});
