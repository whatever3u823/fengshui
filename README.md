# Feng Shui AI

Upload a photo of a real room. Feng Shui AI analyzes the layout, identifies Feng Shui opportunities, and edits **your own photograph** to show the room rearranged. It then explains each change.

The guiding rule: the result should read as *"this is my exact room, intelligently rearranged"*, not *"a different room inspired by my photo."* Walls, windows, doors, flooring, fixtures and the camera angle are preserved.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: leave the keys empty for Demo Mode
npm run dev                  # http://localhost:3000
```

The app runs with **no API keys**. Without keys it starts in a clearly labeled **Demo Mode** ("Demo Mode — AI image generation is not configured"). Uploads are still fully validated, but results show a bundled sample room with a pre-written analysis. Nothing pretends a real generation happened.

Production: `npm run build && npm start`.

## Design and language

The visual direction is a calm courtyard: warm linen, deep pine and sage, sand and mist, with slow ambient light and water-ripple motifs (all motion respects `prefers-reduced-motion`). Color-blocked sections and small animated floor-plan diagrams keep it from feeling flat.

Results are written for people who have never studied Feng Shui, without flattening the tradition:

- **Glossary** (`src/lib/domain/glossary.ts`): every term (chi, command position, mouth of chi, yin and yang, the five elements, sha chi, the armchair configuration…) has three layers: its everyday meaning, how it looks in a room, and the classical idea behind it.
- **Inline definitions** (`src/components/learn/term.tsx`): `GlossaryText` finds these terms in AI-written text and makes them tappable (tap, hover or keyboard).
- **Primer** (`src/components/learn/principles.tsx`): "Feng Shui in plain words", five principles with diagrams, on the landing page and inside every result.
- **How the room feels** (`src/components/results/feeling-contrast.tsx`): right under the photos, the analysis's `contrast` field pairs the three issues that most affect how the room feels (clay, "Exposed", "Restless"…) with the three improvements that answer them (sage, "Settled", "Calm"…), each tied to what is visible. The overall assessment is a single sentence under the title, so nothing is said twice.
- **Plain framing in results**: each alignment principle is phrased as a question you can check yourself, ratings have a legend, and issues read "What we see / What we'd change / The Feng Shui idea".
- **Prompting**: the analysis prompt tells the model to lead with the practical reason, explain each term the first time it's used, name classical concepts precisely, and avoid compass/bagua claims that can't be made from one photo.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | For live analysis | Stage 1: vision analysis with Claude (`claude-opus-5-5`) |
| `OPENAI_API_KEY` | For the optimized image | Stage 2: photo edit with `gpt-image-2`. It can also run Stage 1 (`ANALYSIS_PROVIDER=openai`) |
| `ANALYSIS_TOKEN_SECRET` | Production, multi-instance | HMAC secret that binds an analysis to its photo (see Security) |
| `ANALYSIS_PROVIDER` | No | `anthropic` (default when that key is set) or `openai` |
| `ANTHROPIC_MODEL`, `OPENAI_ANALYSIS_MODEL`, `OPENAI_IMAGE_MODEL`, `OPENAI_IMAGE_QUALITY` | No | Model overrides |
| `DEMO_MODE` | No | `true` forces Demo Mode |
| `MAX_UPLOAD_MB`, `ANALYSIS_TIMEOUT_SECONDS`, `IMAGE_TIMEOUT_SECONDS`, `RATE_LIMIT_MAX_REQUESTS`, `RATE_LIMIT_WINDOW_SECONDS` | No | Limits |

Modes resolve automatically:

| Keys present | Mode |
|---|---|
| none | `demo` |
| Anthropic only | `analysis_only`: real analysis, with a notice that image generation isn't configured |
| OpenAI only, or both | `live` |

`GET /api/health` reports the active mode. It never reports keys.

## How the AI pipeline works

```
photo ──► validate & normalize ──► Stage 1: analysis (vision → structured JSON)
                                         │  streamed; progress = real sections completed
                                         ▼
                                  signed analysis ──► Stage 2: prompt built from analysis
                                                              ──► image edit ──► crop/resize to original
```

1. **Upload validation** (`src/lib/image/process.ts`): the server sniffs magic bytes and ignores the client's MIME type and filename. It decodes with sharp, rejects animated, tiny, panoramic or oversized files, auto-orients, resizes to 1536px, and re-encodes as JPEG. Re-encoding strips EXIF, including GPS location.
2. **Stage 1: analysis** (`POST /api/analyze-room`). A vision model gets the photo plus the user's room type, priorities and approach. It returns JSON constrained by a Zod schema (`src/lib/ai/schema.ts`) through the provider's structured-output mode. The server then re-validates the output against a bounded schema. The schema separates **observed** facts (openings, furniture, pathways, light, balance, what isn't visible) from **recommended** changes, and adds qualitative alignment ratings (Strong / Moderate / Opportunity, never a number). The response streams as NDJSON. Because the schema orders observations before recommendations, the processing screen advances only when the model actually reaches each section.
3. **Stage 2: image edit** (`POST /api/optimize-room`). `buildImageEditPrompt` in `src/lib/ai/prompts.ts` turns the analysis into an explicit edit brief. The brief has these parts:
   - what must be preserved: camera, architecture, the model's `preserve` list, and fixed furniture
   - the numbered spatial instructions for each change
   - the do-not list
   - the photographic style
   
   `gpt-image-2` is asked for the photo's exact aspect ratio. Fixed-size models get the photo centered on a blurred canvas, which is cropped away afterwards. The output is always resized to the original's pixel dimensions, so the before/after slider lines up exactly.

### Providers and swapping them

The routes depend only on two interfaces:

- `src/lib/ai/room-analyzer.ts`: `RoomAnalyzer`, implemented by `providers/anthropic-analyzer.ts`, `providers/openai-analyzer.ts` and `providers/demo.ts`
- `src/lib/ai/image-editor.ts`: `ImageEditor`, implemented by `providers/openai-image-editor.ts` and `providers/demo.ts`

To add a provider (for example Gemini or Flux Kontext), implement the interface and add a `case` to `getRoomAnalyzer` / `getImageEditor`. Nothing else changes.

The Anthropic analyzer uses adaptive thinking at `medium` effort and streaming. It also opts into server-side refusal fallbacks (`fallbacks: "default"`), so a classifier decline is retried on Anthropic's recommended fallback model. A final refusal is shown to the user as a content-policy message.

## API

`POST /api/analyze-room` takes `multipart/form-data` with these fields:
- `image`
- `roomType`: `bedroom|living_room|office|dining_room|kitchen|bathroom|entryway|other|auto`
- `priorities`: repeated
- `fengShuiMode`: `traditional|modern|minimalist`

It returns `AnalyzeRoomResult` (`analysis`, `analysisToken`, `meta`, the normalized `image`). With `Accept: application/x-ndjson` it streams `{type:"stage"}` events and then `{type:"result"}`.

`POST /api/optimize-room` takes `multipart/form-data` with these fields:
- `image`: the normalized image from analyze
- `analysis`
- `analysisToken`
- `fengShuiMode`: optional
- `variant`: optional, 1–4, reserved for "try another arrangement"

It returns `OptimizeRoomResult` (`optimizedImage`, `meta` including the exact prompt used).

Errors always have the shape `{ error: { code, message, retryable } }`, with a human-readable message. The codes cover:
- invalid, oversized or unsupported files
- not-a-room photos
- a missing API key
- provider auth failures and outages
- rate limits and timeouts
- invalid AI responses
- moderation blocks
- generation failures
- expired or tampered analyses

Raw provider errors go to server logs only.

## Security

- API keys are read only in `server-only` modules (`src/lib/config.ts` and the providers). Importing them from client code fails the build.
- Uploads are validated server-side by content, not by client metadata. MIME types are restricted to JPEG, PNG and WEBP, and size is capped. EXIF/GPS is stripped before anything reaches a provider.
- The server is stateless between the two stages. The analysis travels through the client, carrying an HMAC over the photo hash and the analysis. `/api/optimize-room` verifies that HMAC, so a client can't inject its own image prompt or pair an analysis with another photo.
- There is per-IP, in-memory rate limiting on both AI endpoints. Replace it with Redis once you run several instances.

## Project structure

```
src/app/                 landing (/), /optimize flow, /example, API routes
src/components/compare/  before/after slider (pointer, touch, keyboard)
src/components/flow/     upload → details → processing state machine
src/components/results/  results page, change cards, alignment, observations
src/components/ui/       shadcn/ui-style primitives (Button, Badge, ToggleGroup)
src/lib/ai/              schema, prompts, analyzer + editor interfaces, providers, demo fixture
src/lib/domain/          shared option catalogs and data types (RoomProject etc.)
src/lib/image/           upload validation + normalization
src/lib/security/        analysis token signing, rate limiting
scripts/sample-room/     three.js scene used to render the illustrative sample room
```

The shadcn/ui components follow the standard pattern (Radix + CVA + `cn`), and `components.json` is configured, so `npx shadcn add <component>` works when the registry is reachable.

## Extending the MVP

`RoomProject` (`src/lib/domain/types.ts`) already has the persistence-ready fields: `roomId`, `userId`, `createdAt`, `originalImage`, `optimizedImage`, `roomType`, `analysis` and the generation metadata. The session builds exactly this record in client memory. Future work maps onto the current code like this:

- **Accounts, saved rooms, history, share pages:** persist `RoomProject` and move images from data URLs to blob-storage URLs (the `StoredImage.src` field).
- **Variations / "try another arrangement":** `/api/optimize-room` already accepts `variant`.
- **Styles:** extend `FENG_SHUI_MODES` and the prompt tables.
- **Credits / paywall:** gate the two routes where the rate limiter sits today.
- **Conversational designer, shopping, floor plans, multi-room:** these consume the structured `RoomAnalysis` rather than free text.

## Regenerating the sample room

The sample before/after images in `public/samples/` are 3D renders of one scene with two furniture arrangements (`scripts/sample-room/scene.html`). To regenerate them, install `three` and `playwright` in that folder and run `node render.mjs`.
