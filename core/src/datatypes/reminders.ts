import { ContactMethod } from "./contacts";
import { ProfileSummary } from "./profile";

export type ReminderPayload = {
  identity: ProfileSummary,
  contactMethods: ContactMethod[],
  // mutual friend is set if this reminder is about a friend-of-a-friend rather than a friend
  mutualFriend: ProfileSummary | null
}
