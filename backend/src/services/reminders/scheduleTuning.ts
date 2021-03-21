
import { config } from "../../config";

// average person is selected around once per day, so gets on average between one and two pushes per day
const standardScheduleParameters = {
  // 8 hours, minimum time between pushes to the same user
  cooldown: 8 * 60 * 60 * 1000,
  // 10 minutes, time between iterations of scheduling (milliseconds)
  interval: 10 * 60 * 1000,

  // probabilities were chosen based on a stochastic simulation
  // aiming for around 1 friend and 0.2 friend-of-friend selections per user per day

  // probability of an eligible user being selected for a friend notification in one iteration
  friendProbability: 81 / 8192,
  // probability of an eligible user being selected for a friend-of-friend notification in one iteration
  metafriendProbability: 3 / 2048,
};

// substitute parameters that cause pushes to happen very frequently for testing purposes
const testScheduleParameters = {
  // 10 seconds
  cooldown: 10000,
  // 5 seconds
  interval: 5000,
  friendProbability: 0.5,
  metafriendProbability: 0.5,
};

export const scheduleParameters: typeof standardScheduleParameters =
  config.highFrequencyNotifications ? testScheduleParameters : standardScheduleParameters;


