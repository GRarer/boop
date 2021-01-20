// returns true if the given date was on or before a certain number of years before now
export function minYearsAgo(date: Date, years: number): boolean {
  const datePlus: Date = new Date(date.getTime());
  datePlus.setUTCFullYear(datePlus.getUTCFullYear() + years);
  return datePlus.getTime() <= Date.now();
}

// username format validation: returns a string if the username does not met a requirement
export function failsUsernameRequirement(s: string): string | undefined {
  // string.length returns the number of UTF-16 codepoints, which can be different from the number of characters
  const characterCount = [...s].length;
  if (characterCount < 3) {
    return "Username must be at least 3 characters";
  }
  if (characterCount > 32) {
    return "Username must not be longer than 32 characters";
  }
  for (const forbidden of ["@", " ", "\u00A0", "#", "/", "\\", "'", '"', "\n", "\t"]) {
    if (s.includes(forbidden)) {
      return (`Username contains forbidden character "${forbidden}"`);
    }
  }
  return undefined;
}

// password format validation: returns a string if the password does not met a requirement
export function failsPasswordRequirement(s: string): string | undefined {
  // string.length returns the number of UTF-16 codepoints, which can be different from the number of characters
  const characterCount = [...s].length;
  if (characterCount < 6) {
    return "Password must be at least 6 characters";
  }
  if (characterCount > 128) {
    return "Password must not be longer than 128 characters";
  }
  return undefined;
}
