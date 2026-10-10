/** Mirrors `DecodeResultSchema` in server/src/schema.ts. */
export interface DecodeResult {
  is_conversation: boolean;
  interest_score: number;
  verdict: string;
  vibe: string;
  summary: string;
  effort: { you: number; them: number };
  red_flags: Flag[];
  green_flags: Flag[];
  translations: { quote: string; meaning: string }[];
  replies: Reply[];
  next_move: string;
  safety_note: string;
}

export interface Flag {
  title: string;
  detail: string;
}

export type Tone = "chill" | "flirty" | "bold" | "funny" | "honest";

export interface Reply {
  tone: Tone;
  text: string;
}

export type Relationship =
  | "crush"
  | "talking_stage"
  | "situationship"
  | "partner"
  | "ex"
  | "friend"
  | "group_chat"
  | "other";

export type UserSide = "right" | "left";

export interface SavedDecode {
  id: string;
  createdAt: number;
  relationship: Relationship;
  result: DecodeResult;
}

export const RELATIONSHIPS: { value: Relationship; label: string; emoji: string }[] = [
  { value: "crush", label: "Crush", emoji: "🥺" },
  { value: "talking_stage", label: "Talking stage", emoji: "👀" },
  { value: "situationship", label: "Situationship", emoji: "🌀" },
  { value: "partner", label: "Partner", emoji: "💞" },
  { value: "ex", label: "Ex", emoji: "💀" },
  { value: "friend", label: "Friend", emoji: "🫂" },
  { value: "group_chat", label: "Group chat", emoji: "💬" },
  { value: "other", label: "Other", emoji: "🤔" },
];

export function relationshipInfo(value: Relationship) {
  return RELATIONSHIPS.find((r) => r.value === value) ?? RELATIONSHIPS[RELATIONSHIPS.length - 1]!;
}

export const TONE_EMOJI: Record<Tone, string> = {
  chill: "😌",
  flirty: "😏",
  bold: "🔥",
  funny: "😂",
  honest: "🫶",
};
