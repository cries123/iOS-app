import { z } from "zod";

export const MAX_IMAGES = 6;
// ~1.5 MB of base64 per screenshot; the app compresses to JPEG well under this.
export const MAX_IMAGE_BASE64_LENGTH = 2_000_000;

export const RELATIONSHIPS = [
  "crush",
  "talking_stage",
  "situationship",
  "partner",
  "ex",
  "friend",
  "group_chat",
  "other",
] as const;

export const DecodeRequestSchema = z.object({
  images: z
    .array(
      z.object({
        media_type: z.enum(["image/jpeg", "image/png"]),
        data: z.string().min(1).max(MAX_IMAGE_BASE64_LENGTH),
      }),
    )
    .min(1)
    .max(MAX_IMAGES),
  relationship: z.enum(RELATIONSHIPS),
  // Which side of the chat the user's own bubbles are on.
  user_side: z.enum(["right", "left"]).default("right"),
  // Optional question the user wants answered ("do they actually like me?").
  question: z.string().trim().max(300).optional(),
});

export type DecodeRequest = z.infer<typeof DecodeRequestSchema>;

// What the model returns, and what the app receives.
export const DecodeResultSchema = z.object({
  is_conversation: z.boolean(),
  interest_score: z.number(),
  verdict: z.string(),
  vibe: z.string(),
  summary: z.string(),
  effort: z.object({ you: z.number(), them: z.number() }),
  red_flags: z.array(z.object({ title: z.string(), detail: z.string() })),
  green_flags: z.array(z.object({ title: z.string(), detail: z.string() })),
  translations: z.array(z.object({ quote: z.string(), meaning: z.string() })),
  replies: z.array(
    z.object({
      tone: z.enum(["chill", "flirty", "bold", "funny", "honest"]),
      text: z.string(),
    }),
  ),
  next_move: z.string(),
  safety_note: z.string(),
});

export type DecodeResult = z.infer<typeof DecodeResultSchema>;

const flag = {
  type: "object",
  properties: { title: { type: "string" }, detail: { type: "string" } },
  required: ["title", "detail"],
  additionalProperties: false,
} as const;

// JSON Schema handed to the API's structured outputs (output_config.format).
export const DECODE_RESULT_JSON_SCHEMA = {
  type: "object",
  properties: {
    is_conversation: {
      type: "boolean",
      description: "False if the screenshots are not a readable text conversation.",
    },
    interest_score: {
      type: "integer",
      description: "0-100: how interested the other person seems in the user.",
    },
    verdict: {
      type: "string",
      description: "One punchy headline, max ~8 words.",
    },
    vibe: {
      type: "string",
      description: "2-4 word label for their texting energy, e.g. 'Lowkey invested'.",
    },
    summary: { type: "string", description: "2-3 sentence read of the conversation." },
    effort: {
      type: "object",
      description: "Share of conversational effort, as percentages that sum to 100.",
      properties: { you: { type: "integer" }, them: { type: "integer" } },
      required: ["you", "them"],
      additionalProperties: false,
    },
    red_flags: { type: "array", items: flag },
    green_flags: { type: "array", items: flag },
    translations: {
      type: "array",
      description: "Their most telling messages, quoted, with what they likely meant.",
      items: {
        type: "object",
        properties: { quote: { type: "string" }, meaning: { type: "string" } },
        required: ["quote", "meaning"],
        additionalProperties: false,
      },
    },
    replies: {
      type: "array",
      description: "3 suggested next messages for the user to send, in different tones.",
      items: {
        type: "object",
        properties: {
          tone: { type: "string", enum: ["chill", "flirty", "bold", "funny", "honest"] },
          text: { type: "string" },
        },
        required: ["tone", "text"],
        additionalProperties: false,
      },
    },
    next_move: { type: "string", description: "One concrete piece of advice." },
    safety_note: {
      type: "string",
      description: "Empty string unless there is a genuine safety concern (see instructions).",
    },
  },
  required: [
    "is_conversation",
    "interest_score",
    "verdict",
    "vibe",
    "summary",
    "effort",
    "red_flags",
    "green_flags",
    "translations",
    "replies",
    "next_move",
    "safety_note",
  ],
  additionalProperties: false,
} as const;

const clampPercent = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/** Clamp numbers into range and trim lists so the app can render without surprises. */
export function normalizeResult(raw: DecodeResult): DecodeResult {
  const you = clampPercent(raw.effort.you);
  const them = clampPercent(raw.effort.them);
  const total = you + them;
  const youShare = total === 0 ? 50 : Math.round((you / total) * 100);

  return {
    ...raw,
    interest_score: clampPercent(raw.interest_score),
    effort: { you: youShare, them: 100 - youShare },
    red_flags: raw.red_flags.slice(0, 5),
    green_flags: raw.green_flags.slice(0, 5),
    translations: raw.translations.slice(0, 5),
    replies: raw.replies.slice(0, 3),
    safety_note: raw.safety_note.trim(),
  };
}
