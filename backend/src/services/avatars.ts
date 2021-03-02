import gravatar from 'gravatar';

export function emailToGravatarURL(email: string): string {
  return gravatar.url(
    email,
    {
      // scale images to 256x256 pixels
      s: "256",
      // if user doesn't have a gravatar, use a placeholder icon chosen based on their email hash
      d: 'identicon',
      // ignore uploaded profile images marked as containing nudity, violence, etc
      rating: 'pg',
    },
  // use https
  true
  );
}
