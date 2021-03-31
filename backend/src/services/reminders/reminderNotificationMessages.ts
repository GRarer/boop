import { pronouns } from "boop-core";
import { chooseRandom } from "../../util/random";
import { NotificationIdentity } from "./reminders";

const friendTemplates: ((friend: NotificationIdentity) => string)[] = [
  (friend) => `Say hi to ${friend.friendlyName}`,
  (friend) => `Catch up with ${friend.fullName}`,
  (friend) => `Would you like to chat with ${friend.friendlyName} today?`,
  (friend) => `How is ${friend.friendlyName} doing today? Check in on ${pronouns(friend.gender).object} and find out!`,
  (friend) => `Don't be a stranger! Check in on ${friend.friendlyName} and see how ${
    pronouns(friend.gender).subject}'${pronouns(friend.gender).grammaticallyPlural ? 've' : 's'} been.`,
  (friend) => `Have you gotten a chance to catch up with ${friend.friendlyName} today?`,
];

const metafriendTemplates: ((metafriend: NotificationIdentity, mutualFriend: NotificationIdentity) => string)[] = [
  (metafriend, mutualFriend) =>
    `Say hello to someone in your circles. You and ${metafriend.fullName} are both friends with ${
      mutualFriend.friendlyName}. Would you like to chat with ${pronouns(metafriend.gender).object}?`,
  (metafriend, mutualFriend) => `You and ${metafriend.fullName} are both friends with ${
    mutualFriend.friendlyName}. Would you like to say "hi" to ${pronouns(metafriend.gender).object}?`,
  (metafriend, mutualFriend) => `Have you met ${metafriend.friendlyName}? You are both friends with ${
    mutualFriend.friendlyName}. Be outgoing! Start a conversation with ${pronouns(metafriend.gender).object}.`,
  (metafriend, mutualFriend) => `Do you know ${mutualFriend.friendlyName}'s friend, ${
    metafriend.friendlyName}? Would you like to chat with ${pronouns(metafriend.gender).object} today?`,
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
