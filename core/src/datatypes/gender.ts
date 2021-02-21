// user gender options. an undefined value corresponds to "prefer not to say"
export type Gender = "Female" | "Male" | "Nonbinary" | null;

export const genderValues: Gender[] = ["Female", "Male", "Nonbinary"];

export function isGender(x: unknown): x is Gender {
  return (x === null) || (genderValues as unknown[]).includes(x);
}

type PronounSet = {
  subject: string;
  object: string;
  possessiveDeterminer: string; // e.g. "I read *her* comment"
  possessivePronoun: string; // e.g. "This comment is *hers*"
  reflexive: string;
  grammaticallyPlural: boolean;
};

export function pronouns(gender: Gender): PronounSet {
  // default to neutral pronouns if gender is unspecified
  switch ((gender ?? "Nonbinary")) {
  case "Female": return {
    subject: "she",
    object: "her",
    possessiveDeterminer: "her",
    possessivePronoun: "hers",
    reflexive: "herself",
    grammaticallyPlural: false,
  };
  case "Male": return {
    subject: "he",
    object: "him",
    possessiveDeterminer: "his",
    possessivePronoun: "his",
    reflexive: "himself",
    grammaticallyPlural: false,
  };
  case "Nonbinary": return {
    subject: "they",
    object: "them",
    possessiveDeterminer: "their",
    possessivePronoun: "theirs",
    reflexive: "themselves",
    grammaticallyPlural: true,
  };
  }
}
