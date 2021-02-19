import { pronouns } from "boop-core";
import { chooseRandom } from "../../util/random";
import { NotificationIdentity } from "./reminders";

const friendTemplates: ((friend: NotificationIdentity) => string)[] = [
  (friend) => `Say hi to ${friend.friendlyName}`,
  (friend) => `Catch up with ${friend.fullName}`,
  (friend) => `Would you like to chat with ${friend.friendlyName} today?`,
  (friend) => `How is ${friend.friendlyName} doing today? Check in on ${pronouns(friend.gender).object} and find out!`
];

const metafriendTemplates: ((metafriend: NotificationIdentity, mutualFriend: NotificationIdentity) => string)[] = [
  (metafriend, mutualFriend) =>
    `Say hello to someone in your circles. You and ${metafriend.fullName} are both friends with ${
      mutualFriend.friendlyName}. Would you like to chat with ${pronouns(metafriend.gender).object}?`,
  (metafriend, mutualFriend) => `You and ${metafriend.fullName} are both friends with ${
    mutualFriend.friendlyName}. Would you like to say "hi" to ${pronouns(metafriend.gender).object}?`,
];

export async function friendNotificationMessage(friend: NotificationIdentity): Promise<string> {
  return chooseRandom(friendTemplates)(friend);
}

export async function metafriendNotificationMessage(
  metafriend: NotificationIdentity,
  mutualFriend: NotificationIdentity
): Promise<string> {
  return chooseRandom(metafriendTemplates)(metafriend, mutualFriend);
}
