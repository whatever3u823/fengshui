/**
 * User-facing option catalogs shared by the client and the server.
 * Keep this file free of secrets and server-only imports.
 */

export const ROOM_TYPES = [
  "bedroom",
  "living_room",
  "office",
  "dining_room",
  "kitchen",
  "bathroom",
  "entryway",
  "other",
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

/** What the user picks in the UI. "auto" defers the decision to the analysis model. */
export type RoomTypeSelection = RoomType | "auto";

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  bedroom: "Bedroom",
  living_room: "Living Room",
  office: "Office",
  dining_room: "Dining Room",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  entryway: "Entryway",
  other: "Other",
};

export const PRIORITIES = [
  "relaxation",
  "sleep",
  "focus",
  "productivity",
  "relationships",
  "social",
  "organization",
  "spaciousness",
  "balance",
] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  relaxation: "Better relaxation",
  sleep: "Better sleep",
  focus: "Better focus",
  productivity: "Better productivity",
  relationships: "Better relationships",
  social: "Better social atmosphere",
  organization: "Better organization",
  spaciousness: "Better sense of spaciousness",
  balance: "General balance",
};

export const FENG_SHUI_MODES = ["traditional", "modern", "minimalist"] as const;
export type FengShuiMode = (typeof FENG_SHUI_MODES)[number];

export const FENG_SHUI_MODE_LABELS: Record<FengShuiMode, { label: string; description: string }> = {
  traditional: {
    label: "Traditional / Classical",
    description:
      "Grounded in classical form-school ideas: command position, balanced pairs, the five elements.",
  },
  modern: {
    label: "Modern Feng Shui",
    description:
      "Applies the core principles with a contemporary, practical lens suited to everyday homes.",
  },
  minimalist: {
    label: "Minimalist interpretation",
    description: "Favors subtraction: fewer objects, open space, calm surfaces, quiet materials.",
  },
};

export const ALIGNMENT_CATEGORIES = [
  "flow",
  "commandPosition",
  "balance",
  "clutter",
  "naturalElements",
  "lighting",
] as const;
export type AlignmentCategory = (typeof ALIGNMENT_CATEGORIES)[number];

export const ALIGNMENT_LABELS: Record<AlignmentCategory, string> = {
  flow: "Flow",
  commandPosition: "Command Position",
  balance: "Balance",
  clutter: "Clutter",
  naturalElements: "Natural Elements",
  lighting: "Lighting",
};

export const ALIGNMENT_RATINGS = ["strong", "moderate", "opportunity", "not_applicable"] as const;
export type AlignmentRating = (typeof ALIGNMENT_RATINGS)[number];

export const ALIGNMENT_RATING_LABELS: Record<AlignmentRating, string> = {
  strong: "Strong",
  moderate: "Moderate",
  opportunity: "Opportunity",
  not_applicable: "Not applicable",
};

/** Upload constraints. The server re-validates everything; these only drive client UX. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
export const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
