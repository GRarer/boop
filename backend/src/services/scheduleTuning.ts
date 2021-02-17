
import parseArgs from "minimist";

// average person is selected around once per day, so gets on average between one and two pushes per day
const standardScheduleParameters = {
  // 4 hours, minimum time between pushes to the same user
  cooldown: 28800000,
  // 10 minutes, time between iterations of scheduling (milliseconds)
  interval: 600000,
  // probability of an eligible user being selected for a friend notification in one iteration
  friendProbability: 0.166,
  // probability of an eligible user being selected for a friend-of-friend notification in one iteration
  metafriendProbability: 0.024,
};

// substitute parameters that cause pushes to happen very frequently for testing purposes
const testScheduleParameters = {
  cooldown: 0,
  interval: 10000,
  friendProbability: 0.5,
  metafriendProbability: 0.5,
};

export const scheduleParameters: typeof standardScheduleParameters =
  parseArgs(process.argv.slice(2))["frequentPush"]
    ? testScheduleParameters
    : standardScheduleParameters;


