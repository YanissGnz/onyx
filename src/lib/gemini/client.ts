/**
 * Google Gemini client initialization.
 *
 * Creates a singleton GoogleGenAI instance using the API key from environment
 * variables. The key is stored server-side only per NFR-6.
 *
 * @see Architecture: AI Integration (_bmad-output/planning-artifacts/architecture.md#AI-Integration)
 * @see PRD: FR-23
 */

import { GoogleGenAI } from "@google/genai"

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Gemini API key — server-side only, never exposed to the client. */
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error(
    "GEMINI_API_KEY is not set. Set it in .env.local or the server environment.",
  )
}

/** Gemini model identifier — cost-efficient flash-lite for v1. */
const GEMINI_MODEL = "gemini-2.5-flash-lite"

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let _genai: GoogleGenAI | null = null

/**
 * Returns a singleton GoogleGenAI client instance.
 *
 * Cached in-process to avoid re-creating the client on every request.
 */
export function getGenAI(): GoogleGenAI {
  if (!_genai) {
    _genai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  }
  return _genai
}

/**
 * Returns the model identifier to use for generation.
 */
export function getGeminiModel(): string {
  return GEMINI_MODEL
}