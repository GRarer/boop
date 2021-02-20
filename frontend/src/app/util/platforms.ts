// information about popular chat platforms
type PlatformInfo = {
  iconUrl: string;
  contactIdHint: string; // hints shown in the "edit contact methods" page when this platform is selected
} & (
  {
    // for some common platforms we can link directly to users based on username
    linkType: "profileLinkTemplate";
    linkTemplate: (contactID: string) => string;
  } | {
    // for some others we can link to the platform's web client or homepage but not to specific users
    linkType: "homepageLink";
    homepage: string;
  } | {
    // for some platforms without a web client we cannot link to them at all
    linkType: "none";
  }
);

export const commonPlatforms: {[platformName: string]: PlatformInfo | undefined;} = {
  "WhatsApp": {
    iconUrl: "assets/platform_icons/whatsapp.png",
    contactIdHint:
      "Your WhatsApp phone number",
    linkType: "homepageLink",
    homepage: "web.whatsapp.com"
  },
  "Messenger": {
    iconUrl: "assets/platform_icons/messenger.png",
    linkType: "profileLinkTemplate",
    linkTemplate: (name) => `https://m.me/${name}`,
    contactIdHint: "Use your Messenger username, not your full name"
  },
  "Snapchat": {
    iconUrl: "assets/platform_icons/snapchat_ghost_light.png",
    linkType: "profileLinkTemplate",
    contactIdHint: "Your Snapchat username",
    linkTemplate: (name) => `https://snapchat.com/add/${name}`,
  },
  "Discord": {
    iconUrl: "assets/platform_icons/discord.png",
    contactIdHint: "Your Discord username, including your tag number",
    linkType: "homepageLink",
    homepage: "https://discord.com/app/"
  },
  "Telegram": {
    iconUrl: "assets/platform_icons/telegram.png",
    linkType: "profileLinkTemplate",
    contactIdHint: "Your Telegram username",
    linkTemplate: (name) => `t.me/${name}`,
  },
  "Signal": {
    iconUrl: "assets/platform_icons/signal.png",
    linkType: "none",
    contactIdHint: "Your Signal phone number"
  },
  "WeChat": {
    iconUrl: "assets/platform_icons/wechat.png",
    linkType: "homepageLink",
    contactIdHint: "Your WeChat ID",
    homepage: "https://web.wechat.com/",
  },
  "Line": {
    iconUrl: "assets/platform_icons/line.png",
    contactIdHint: "Your Line user ID",
    linkType: "none",
  },
  "Kakao Talk": {
    iconUrl: "assets/platform_icons/kakao_talk.png",
    contactIdHint: "Your Kakao Talk phone number",
    linkType: "none",
  },
  "Phone": {
    iconUrl: "assets/platform_icons/material_icon_phone.png",
    linkType: "none",
    contactIdHint: "The phone number that you use for text messages"
  }
};
