import { describe, expect, it, vi } from "vitest";
import { DecodeError } from "../src/decode";
import { handleRequest, type Env } from "../src/index";
import { buildUserText } from "../src/prompt";
import { normalizeResult, type DecodeResult } from "../src/schema";

const env: Env = { ANTHROPIC_API_KEY: "test-key", APP_TOKEN: "secret" };

const sampleResult: DecodeResult = {
  is_conversation: true,
  interest_score: 72,
  verdict: "They're shy, not uninterested",
  vibe: "Lowkey invested",
  summary: "They reply fast and keep asking questions.",
  effort: { you: 45, them: 55 },
  red_flags: [],
  green_flags: [{ title: "Asks questions", detail: "They keep the convo going." }],
  translations: [{ quote: "haha maybe", meaning: "Yes, but ask again." }],
  replies: [{ tone: "chill", text: "ok so friday?" }],
  next_move: "Suggest a specific plan.",
  safety_note: "",
};

const validBody = {
  images: [{ media_type: "image/jpeg", data: "aGVsbG8=" }],
  relationship: "crush",
  user_side: "right",
};

function post(body: unknown, headers: Record<string, string> = { "x-decode-token": "secret" }) {
  return new Request("https://decode.test/v1/decode", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("handleRequest", () => {
  it("returns the decode result for a valid request", async () => {
    const decode = vi.fn().mockResolvedValue(sampleResult);
    const res = await handleRequest(post(validBody), env, { decode });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(sampleResult);
    expect(decode).toHaveBeenCalledWith(expect.objectContaining({ relationship: "crush" }));
  });

  it("rejects requests without the app token", async () => {
    const decode = vi.fn();
    const res = await handleRequest(post(validBody, {}), env, { decode });
    expect(res.status).toBe(401);
    expect(decode).not.toHaveBeenCalled();
  });

  it("rejects everything when APP_TOKEN is not configured", async () => {
    const res = await handleRequest(post(validBody, { "x-decode-token": "" }), { ...env, APP_TOKEN: "" }, {
      decode: vi.fn(),
    });
    expect(res.status).toBe(401);
  });

  it("rejects invalid bodies", async () => {
    const decode = vi.fn();
    expect((await handleRequest(post("not json"), env, { decode })).status).toBe(400);
    expect((await handleRequest(post({ ...validBody, images: [] }), env, { decode })).status).toBe(400);
    expect((await handleRequest(post({ ...validBody, relationship: "boss" }), env, { decode })).status).toBe(400);
    expect(decode).not.toHaveBeenCalled();
  });

  it("passes DecodeError messages through to the app", async () => {
    const decode = vi.fn().mockRejectedValue(new DecodeError("Try fewer screenshots.", 422));
    const res = await handleRequest(post(validBody), env, { decode });
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ error: "Try fewer screenshots." });
  });

  it("hides unexpected errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const decode = vi.fn().mockRejectedValue(new Error("boom"));
    const res = await handleRequest(post(validBody), env, { decode });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Something went wrong. Try again." });
  });

  it("serves health and 404s", async () => {
    const decode = vi.fn();
    expect((await handleRequest(new Request("https://decode.test/health"), env, { decode })).status).toBe(200);
    expect((await handleRequest(new Request("https://decode.test/nope"), env, { decode })).status).toBe(404);
    expect((await handleRequest(new Request("https://decode.test/v1/decode"), env, { decode })).status).toBe(405);
  });
});

describe("normalizeResult", () => {
  it("clamps scores and rebalances effort to 100", () => {
    const result = normalizeResult({
      ...sampleResult,
      interest_score: 140,
      effort: { you: 30, them: 30 },
      replies: Array(5).fill({ tone: "chill", text: "hey" }),
      safety_note: "  ",
    });
    expect(result.interest_score).toBe(100);
    expect(result.effort).toEqual({ you: 50, them: 50 });
    expect(result.replies).toHaveLength(3);
    expect(result.safety_note).toBe("");
  });

  it("handles zero effort", () => {
    expect(normalizeResult({ ...sampleResult, effort: { you: 0, them: 0 } }).effort).toEqual({ you: 50, them: 50 });
  });
});

describe("buildUserText", () => {
  it("describes the relationship, side and question", () => {
    const text = buildUserText({
      images: [
        { media_type: "image/png", data: "a" },
        { media_type: "image/png", data: "b" },
      ],
      relationship: "situationship",
      user_side: "left",
      question: "do they like me?",
    });
    expect(text).toContain("a situationship");
    expect(text).toContain("left side");
    expect(text).toContain("2 screenshots");
    expect(text).toContain("do they like me?");
  });
});
