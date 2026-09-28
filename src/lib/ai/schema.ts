import { z } from "zod";
import {
  ALIGNMENT_RATINGS,
  FENG_SHUI_MODES,
  PRIORITIES,
  ROOM_TYPES,
} from "@/lib/domain/options";

/**
 * Structured contract between the analysis model and the rest of the app.
 *
 * `RoomAnalysisModelSchema` is sent to the model as the output format, so it
 * deliberately avoids length/size constraints (not every provider's structured
 * output mode supports them) and has no optional fields (OpenAI strict mode
 * requires every key). `RoomAnalysisSchema` then enforces sane bounds on
 * whatever comes back, and is also used to validate analysis JSON that the
 * client sends back to /api/optimize-room.
 *
 * Key order matters: the analysis stream is scanned for top-level keys to
 * report real progress, so observation keys come before recommendations.
 */

const RoomTypeSchema = z.enum(ROOM_TYPES);
const RatingSchema = z.enum(ALIGNMENT_RATINGS);

export const ISSUE_CATEGORIES = [
  "command_position",
  "bed_position",
  "desk_position",
  "seating_position",
  "door_visibility",
  "pathway",
  "obstruction",
  "clutter",
  "visual_balance",
  "symmetry",
  "harsh_lines",
  "lighting",
  "natural_light",
  "natural_elements",
  "materials",
  "other",
] as const;

export const CHANGE_TYPES = [
  "move_furniture",
  "reorient_furniture",
  "remove_clutter",
  "add_plant",
  "adjust_lighting",
  "add_lighting",
  "add_textile",
  "adjust_decor",
  "adjust_artwork",
  "add_natural_material",
  "improve_symmetry",
  "clear_pathway",
  "other",
] as const;

const AlignmentEntryModel = z.object({
  current: RatingSchema.describe("How the room as photographed aligns with this principle."),
  projected: RatingSchema.describe("Expected alignment after the recommended changes."),
  note: z.string().describe("One short sentence grounded in what is visible in the photo."),
});

const ObservedModel = z.object({
  cameraViewpoint: z
    .string()
    .describe("Where the photo appears to be taken from and what portion of the room is visible."),
  architecture: z
    .array(z.string())
    .describe(
      "Permanent features that are clearly visible: walls, ceiling, flooring, trim, built-ins, radiators, fixtures. Never invent features.",
    ),
  openings: z
    .array(
      z.object({
        kind: z.enum(["door", "doorway", "window", "closet", "other"]),
        location: z.string().describe("Position in the frame, e.g. 'right wall, near the back corner'."),
      }),
    )
    .describe("Doors, doorways and windows that are actually visible. Empty if none are visible."),
  furniture: z.array(
    z.object({
      item: z.string(),
      location: z.string(),
      movable: z.boolean().describe("False for built-ins and fixtures."),
    }),
  ),
  pathways: z.string().describe("How a person would walk through the visible space; note pinch points."),
  lighting: z.string().describe("Natural and artificial light as observed."),
  materialsAndPalette: z.string(),
  visualBalance: z.string().describe("Distribution of visual weight across the frame."),
  limitations: z
    .array(z.string())
    .describe("Things that cannot be determined from this single photo (e.g. door position out of frame)."),
});

const IssueModel = z.object({
  id: z.string().describe("Short stable id like 'issue-1'."),
  category: z.enum(ISSUE_CATEGORIES),
  severity: z.enum(["low", "medium", "high"]),
  title: z.string().describe("2-4 words, e.g. 'Bed Position'."),
  observation: z.string().describe("What is visible in the photo. Observed facts only."),
  recommendation: z.string().describe("What to change and why, in practical design terms."),
  traditionalContext: z
    .string()
    .describe(
      "The classical Feng Shui idea behind this, named precisely and explained in plain words for a newcomer, phrased as belief ('Traditional Feng Shui associates...'), never as a factual or guaranteed outcome.",
    ),
});

const ChangeModel = z.object({
  id: z.string(),
  type: z.enum(CHANGE_TYPES),
  object: z.string().describe("The object being changed, e.g. 'bed', 'floor lamp', 'stack of boxes'."),
  title: z.string().describe("2-4 word card title, e.g. 'Bed Position'."),
  summary: z
    .string()
    .describe("One or two sentences for the user describing what changed, past tense."),
  instruction: z
    .string()
    .describe(
      "Precise, spatially explicit edit instruction for an image-editing model, referencing positions in the frame.",
    ),
  rationale: z.string().describe("Why this helps, in design terms, with hedged Feng Shui framing."),
  relatedIssueIds: z.array(z.string()),
});

export const RoomAnalysisModelSchema = z.object({
  isInteriorRoom: z
    .boolean()
    .describe("False if the image is not a photograph of an interior room."),
  roomType: RoomTypeSchema,
  roomTypeConfidence: z.enum(["high", "medium", "low"]),
  overallAssessment: z.string().describe("Two to three sentences, calm and specific."),
  observed: ObservedModel,
  issues: z.array(IssueModel),
  changes: z.array(ChangeModel),
  alignment: z.object({
    flow: AlignmentEntryModel,
    commandPosition: AlignmentEntryModel,
    balance: AlignmentEntryModel,
    clutter: AlignmentEntryModel,
    naturalElements: AlignmentEntryModel,
    lighting: AlignmentEntryModel,
  }),
  preserve: z
    .array(z.string())
    .describe("Specific visible elements the image edit must keep unchanged."),
  imageEditPrompt: z
    .string()
    .describe("A concise edit brief summarizing the target arrangement for the image model."),
});

// ---------------------------------------------------------------------------
// Bounded schema used for validation of anything we did not produce ourselves.
// ---------------------------------------------------------------------------

/** Trims and truncates instead of rejecting, so a verbose model does not fail the request. */
const text = (max: number) =>
  z
    .string()
    .trim()
    .transform((s) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s));
/** Like `text`, but must be non-empty (titles, instructions). */
const requiredText = (max: number) => z.string().trim().min(1).pipe(text(max));
const list = <T extends z.ZodType>(item: T, max: number) =>
  z.array(item).transform((items) => items.slice(0, max));

const shortText = text(160);
const bodyText = text(900);

const AlignmentEntry = z.object({
  current: RatingSchema,
  projected: RatingSchema,
  note: bodyText,
});

export const RoomAnalysisSchema = z.object({
  isInteriorRoom: z.boolean(),
  roomType: RoomTypeSchema,
  roomTypeConfidence: z.enum(["high", "medium", "low"]),
  overallAssessment: requiredText(1200),
  observed: z.object({
    cameraViewpoint: bodyText,
    architecture: list(shortText, 20),
    openings: list(
      z.object({ kind: z.enum(["door", "doorway", "window", "closet", "other"]), location: shortText }),
      12,
    ),
    furniture: list(z.object({ item: requiredText(120), location: shortText, movable: z.boolean() }), 30),
    pathways: bodyText,
    lighting: bodyText,
    materialsAndPalette: bodyText,
    visualBalance: bodyText,
    limitations: list(text(300), 10),
  }),
  issues: list(
    z.object({
      id: requiredText(40),
      category: z.enum(ISSUE_CATEGORIES),
      severity: z.enum(["low", "medium", "high"]),
      title: requiredText(60),
      observation: bodyText,
      recommendation: bodyText,
      traditionalContext: bodyText,
    }),
    12,
  ),
  changes: z
    .array(
      z.object({
        id: requiredText(40),
        type: z.enum(CHANGE_TYPES),
        object: requiredText(120),
        title: requiredText(60),
        summary: requiredText(900),
        instruction: requiredText(900),
        rationale: bodyText,
        relatedIssueIds: list(text(40), 12),
      }),
    )
    .min(1)
    .transform((items) => items.slice(0, 10)),
  alignment: z.object({
    flow: AlignmentEntry,
    commandPosition: AlignmentEntry,
    balance: AlignmentEntry,
    clutter: AlignmentEntry,
    naturalElements: AlignmentEntry,
    lighting: AlignmentEntry,
  }),
  preserve: list(shortText, 20),
  imageEditPrompt: text(2500),
});

export type RoomAnalysis = z.infer<typeof RoomAnalysisSchema>;
export type AnalysisIssue = RoomAnalysis["issues"][number];
export type AnalysisChange = RoomAnalysis["changes"][number];

/** Preferences sent by the client with the photo. */
export const AnalysisPreferencesSchema = z.object({
  roomType: z.union([RoomTypeSchema, z.literal("auto")]),
  priorities: z.array(z.enum(PRIORITIES)).max(PRIORITIES.length),
  fengShuiMode: z.enum(FENG_SHUI_MODES),
});
export type AnalysisPreferences = z.infer<typeof AnalysisPreferencesSchema>;
