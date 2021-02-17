import { sessionTimeoutDuration } from "./auth";
import { database } from "./database";
import { notificationIteration } from "./reminders";
import { scheduleParameters } from "./scheduleTuning";

// tasks that should be repeated at a regular interval

function clearExpiredSessions(): void {
  const oldestAllowedTime = Date.now() - sessionTimeoutDuration;
  database.query(`delete from sessions where time_last_touched < $1;`, [oldestAllowedTime])
    .catch(err => {
      console.error("failed to clear expired authentication sessions");
      console.error(err);
    });
}

export function startRepeatedJobs(): void {
  // check for expired user sessions every 30 minutes
  setInterval(clearExpiredSessions, (30 * 60 * 1000));
  setInterval(() => {
    notificationIteration().catch(err => {
      console.error("Error while scheduling or sending notifications");
      console.error(err);
    });
  }, scheduleParameters.interval);
}
