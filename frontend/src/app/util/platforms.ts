// information about popular chat platforms
type PlatformInfo = {
  iconUrl: string;
  contactIdHint: string; // hints shown in the "edit contact methods" page when this platform is selected
};

export const commonPlatforms: {[platformName: string]: PlatformInfo | undefined;} = {
  "Phone": {
    iconUrl: "assets/platform_icons/material_icon_phone.png",
    contactIdHint: "The phone number that you use for text messages"
  },
  "WhatsApp": {
    iconUrl: "assets/platform_icons/whatsapp.png",
    contactIdHint:
      "Your WhatsApp phone number",
  },
  "Messenger": {
    iconUrl: "assets/platform_icons/messenger.png",
    contactIdHint: "Use your Messenger username"
  },
  "Instagram": {
    iconUrl: "assets/platform_icons/instagram.png",
    contactIdHint: "Use your Instagram username"
  },
  "Snapchat": {
    iconUrl: "assets/platform_icons/snapchat_ghost_light.png",
    contactIdHint: "Your Snapchat username",
  },
  "Discord": {
    iconUrl: "assets/platform_icons/discord.png",
    contactIdHint: "Your Discord username, including your tag number",
  },
  "Skype": {
    iconUrl: "assets/platform_icons/skype.png",
    contactIdHint: "Your Skype username",
  },
  "Telegram": {
    iconUrl: "assets/platform_icons/telegram.png",
    contactIdHint: "Your Telegram username",
  },
  "Google Hangouts": {
    iconUrl: "assets/platform_icons/google_hangouts.png",
    contactIdHint: "Your Google Hangouts username"
  },
  "Signal": {
    iconUrl: "assets/platform_icons/signal.png",
    contactIdHint: "Your Signal phone number"
  },
  "WeChat": {
    iconUrl: "assets/platform_icons/wechat.png",
    contactIdHint: "Your WeChat ID",
  },
  "Line": {
    iconUrl: "assets/platform_icons/line.png",
    contactIdHint: "Your Line user ID",
  },
  "Kakao Talk": {
    iconUrl: "assets/platform_icons/kakao_talk.png",
    contactIdHint: "Your Kakao Talk phone number",
  },
};
