import Anthropic from "@anthropic-ai/sdk";
import { buildUserText, SYSTEM_PROMPT } from "./prompt";
import {
  DECODE_RESULT_JSON_SCHEMA,
  DecodeResultSchema,
  normalizeResult,
  type DecodeRequest,
  type DecodeResult,
} from "./schema";

export const MODEL = "claude-opus-5-5";

/** The model declined or returned something unusable; safe to show `message` to the user. */
export class DecodeError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function decodeConversation(
  client: Anthropic,
  req: DecodeRequest,
): Promise<DecodeResult> {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [
    ...req.images.map(
      (image): Anthropic.Beta.BetaImageBlockParam => ({
        type: "image",
        source: { type: "base64", media_type: image.media_type, data: image.data },
      }),
    ),
    { type: "text", text: buildUserText(req) },
  ];

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content }],
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: DECODE_RESULT_JSON_SCHEMA },
    },
    // If a safety classifier declines, retry server-side on Anthropic's recommended model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  if (response.stop_reason === "refusal") {
    throw new DecodeError("We couldn't decode this one. Try different screenshots.", 422);
  }
  if (response.stop_reason === "max_tokens") {
    throw new DecodeError("That conversation was too long to decode. Try fewer screenshots.", 422);
  }

  const text = response.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new DecodeError("Something went wrong reading the results. Try again.", 502);
  }

  const result = DecodeResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new DecodeError("Something went wrong reading the results. Try again.", 502);
  }
  return normalizeResult(result.data);
}
