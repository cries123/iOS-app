import Anthropic from "@anthropic-ai/sdk";
import { DecodeError, decodeConversation } from "./decode";
import { DecodeRequestSchema, type DecodeRequest, type DecodeResult } from "./schema";

export interface Env {
  ANTHROPIC_API_KEY: string;
  APP_TOKEN: string;
}

export interface Deps {
  decode: (req: DecodeRequest) => Promise<DecodeResult>;
}

// 6 screenshots at the per-image cap plus JSON overhead.
const MAX_BODY_BYTES = 13_000_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const errorResponse = (message: string, status: number) => json({ error: message }, status);

export async function handleRequest(request: Request, env: Env, deps: Deps): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/health") {
    return json({ ok: true });
  }
  if (url.pathname !== "/v1/decode") {
    return errorResponse("Not found", 404);
  }
  if (request.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }
  if (!env.APP_TOKEN || request.headers.get("x-decode-token") !== env.APP_TOKEN) {
    return errorResponse("Unauthorized", 401);
  }

  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > MAX_BODY_BYTES) {
    return errorResponse("Screenshots are too large.", 413);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const parsed = DecodeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid request", 400);
  }

  try {
    return json(await deps.decode(parsed.data));
  } catch (error) {
    if (error instanceof DecodeError) {
      return errorResponse(error.message, error.status);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return errorResponse("Decode is busy right now. Try again in a minute.", 503);
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}: ${error.message}`);
      return errorResponse("Something went wrong. Try again.", 502);
    }
    console.error(error);
    return errorResponse("Something went wrong. Try again.", 500);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    return handleRequest(request, env, {
      decode: (req) => decodeConversation(client, req),
    });
  },
} satisfies ExportedHandler<Env>;
