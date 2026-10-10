import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { config } from "./config";
import type { Screenshot } from "./store";
import type { DecodeResult, Relationship, UserSide } from "./types";

/** Claude's vision model works at up to 1568px on the long edge; anything bigger is wasted upload. */
const MAX_DIMENSION = 1568;

export class DecodeError extends Error {}

async function prepare(screenshot: Screenshot) {
  const longest = Math.max(screenshot.width, screenshot.height);
  const context = ImageManipulator.manipulate(screenshot.uri);
  if (longest > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / longest;
    context.resize({ width: Math.round(screenshot.width * scale) });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!saved.base64) throw new DecodeError("One of those screenshots couldn't be read. Try picking it again.");
  // Some platforms return a full data URI; the server wants bare base64.
  return saved.base64.replace(/^data:image\/\w+;base64,/, "");
}

export async function decodeConversation(input: {
  screenshots: Screenshot[];
  relationship: Relationship;
  userSide: UserSide;
  question: string;
}): Promise<DecodeResult> {
  const images = await Promise.all(
    input.screenshots.map(async (s) => ({ media_type: "image/jpeg", data: await prepare(s) })),
  );
  const question = input.question.trim().slice(0, 300);

  let response: Response;
  try {
    response = await fetch(`${config.serverUrl}/v1/decode`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-decode-token": config.appToken },
      body: JSON.stringify({
        images,
        relationship: input.relationship,
        user_side: input.userSide,
        ...(question ? { question } : {}),
      }),
    });
  } catch {
    throw new DecodeError("Couldn't reach Decode. Check your connection and try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body.error === "string" ? body.error : "Something went wrong. Try again.";
    throw new DecodeError(message);
  }
  return body as DecodeResult;
}
