import { Gender, PrivacyLevel } from "boop-core";
import { emailToGravatarURL } from "../services/avatars";
import { database } from "../services/database";
import { throwBoopError } from "../util/handleAsync";

export async function getProfileAndPrivacy(username: string): Promise<{
  uuid: string;
  fullName: string;
  avatarUrl: string;
  statusMessage: string;
  privacyLevel: PrivacyLevel;
  bio: string;
  // age or gender will be null if privacy settings say not to show them
  visibleBirthDate: string | null;
  visibleGender: Gender;
}> {
  type ResultRow = {
    user_uuid: string;
    full_name: string;
    gender: Gender;
    email: string;
    birth_date: string;
    status_message: string;
    profile_privacy_level: PrivacyLevel;
    profile_show_age: boolean;
    profile_show_gender: boolean;
    profile_bio: string;
  };

  const rows = await database.query<ResultRow>(
    `select user_uuid, full_name, gender, email, birth_date, status_message,
    profile_privacy_level, profile_show_age, profile_show_gender, profile_bio
    from users where username = $1`, [username]
  );

  const result = rows[0] ?? throwBoopError(`user not found: ${username}`, 404);
  return ({
    uuid: result.user_uuid,
    fullName: result.full_name,
    avatarUrl: emailToGravatarURL(result.email),
    statusMessage: result.status_message,
    bio: result.profile_bio,
    privacyLevel: result.profile_privacy_level,
    visibleGender: result.profile_show_gender ? result.gender : null,
    visibleBirthDate: result.profile_show_age ? result.birth_date : null
  });
}
