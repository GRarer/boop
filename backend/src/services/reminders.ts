import { selectPairs } from "../queries/reminderQueries";

export type Pairing = {
  userA: string;
  userB: string;
  friends: true;
} | {
  userA: string;
  userB: string;
  friends: false;
  mutualFriend: string;
};

export async function notificationIteration(): Promise<void> {
  const pairs = await selectPairs();
  for (const pair of pairs) {
    console.log("select pair", pair);
  }
}
