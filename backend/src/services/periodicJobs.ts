import { sessionTimeoutDuration } from "./auth";
import { database } from "./database";
import { notificationIteration } from "./reminders/reminders";
import { scheduleParameters } from "./reminders/scheduleTuning";

// tasks that should be repeated at a regular interval

function clearExpiredSessions(): void {
  const oldestAllowedTime = Date.now() - sessionTimeoutDuration;
  database.query(`delete from sessions where time_last_touched < $1;`, [oldestAllowedTime])
    .catch(err => {
      console.error("failed to clear expired authentication sessions");
      console.error(err);
    });
}

function clearExpiredPushTokens(): void {
  database.query(`delete from push_identity_tokens where expiration_time < $1;`, [Date.now()])
    .catch(err => {
      console.error("failed to clear expired push identity tokens");
      console.error(err);
    });
}

export function startRepeatedJobs(): void {
  // start cleanup tasks once at startup
  clearExpiredSessions();
  clearExpiredPushTokens();

  // check for expired user sessions every hour
  setInterval(clearExpiredSessions, (60 * 60 * 1000));
  // check for expired push tokens every 12 hours
  setInterval(clearExpiredPushTokens, (12 * 60 * 60 * 1000));
  // schedule sending spontaneous notifications
  setInterval(() => {
    notificationIteration().catch(err => {
      console.error("Error while scheduling or sending notifications");
      console.error(err);
    });
  }, scheduleParameters.interval);
}
