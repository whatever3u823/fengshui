import type { RoomAnalysis } from "@/lib/ai/schema";

/**
 * Hand-written analysis of the bundled sample room (public/samples/bedroom-before.jpg).
 * Used by Demo Mode and the landing-page example. It describes the sample image only
 * and is never presented as an analysis of a user's upload.
 */
export const SAMPLE_BEDROOM_ANALYSIS: RoomAnalysis = {
  isInteriorRoom: true,
  roomType: "bedroom",
  roomTypeConfidence: "high",
  overallAssessment:
    "A bright, well-proportioned bedroom with good daylight and a clean architectural shell. The current arrangement works against it: the bed is pushed into the corner beneath the window, the desk sits in the path from the door, and loose boxes and clothing crowd the middle of the floor.",
  observed: {
    cameraViewpoint:
      "Taken at standing height from the front-right corner, looking toward the back-left. The back wall, most of the left wall and part of the right wall are visible.",
    architecture: [
      "White-painted walls and flat white ceiling",
      "Light oak plank flooring",
      "White baseboards",
      "White radiator beneath the window",
      "Round flush-mount ceiling light",
    ],
    openings: [
      { kind: "door", location: "Left wall, foreground; white panel door" },
      { kind: "window", location: "Back wall, left of center; white divided-light window" },
    ],
    furniture: [
      { item: "Queen bed with grey upholstered headboard", location: "Back-left corner, headboard beneath the window", movable: true },
      { item: "Oak nightstand", location: "Right of the bed against the back wall", movable: true },
      { item: "Oak desk with black legs", location: "Left side of the room, in front of the door", movable: true },
      { item: "Black upholstered chair", location: "Between the desk and the center of the room", movable: true },
      { item: "Stacked cardboard boxes", location: "Foreground, center-right", movable: true },
      { item: "Pile of clothing", location: "Floor near the foot of the bed", movable: true },
      { item: "Small grey rug", location: "Foreground, off-center", movable: true },
    ],
    pathways:
      "The route from the door into the room runs straight into the desk and chair. The boxes and clothing narrow the central floor, and the bed can only be reached from its right side because its left side is against the wall.",
    lighting:
      "Soft daylight from the single back-wall window. The main artificial source is a bright, cool-toned ceiling fixture; there is no lighting at the bed.",
    materialsAndPalette:
      "Light oak floor and bed frame against white walls, with cool grey-blue bedding. Few soft or natural textures; the palette reads cool and sparse.",
    visualBalance:
      "Visual weight is concentrated on the left half of the frame (bed in the corner, desk by the door) while the right half of the back wall is empty. The boxes add heavy mass in the foreground.",
    limitations: [
      "The front-right portion of the room is out of frame.",
      "Compass orientation cannot be determined from the photo.",
    ],
  },
  issues: [
    {
      id: "issue-1",
      category: "bed_position",
      severity: "high",
      title: "Bed Position",
      observation:
        "The headboard sits directly beneath the window and the bed is pushed into the corner, with one side against the wall.",
      recommendation:
        "Move the bed to the solid section of the back wall to the right of the window, where it has a wall behind it and a diagonal view of the door.",
      traditionalContext:
        "Traditional Feng Shui associates a solid wall behind the headboard with a sense of support, and a clear diagonal view of the entry with the 'command position'.",
    },
    {
      id: "issue-2",
      category: "pathway",
      severity: "high",
      title: "Entry Path",
      observation: "The desk and chair stand in the first steps from the door into the room.",
      recommendation: "Relocate the desk to the left wall between the window corner and the door so the entry opens into clear floor.",
      traditionalContext:
        "In classical practice, the entry is often called the 'mouth of chi'; an open path from the door is associated with energy moving freely through the room.",
    },
    {
      id: "issue-3",
      category: "clutter",
      severity: "medium",
      title: "Floor Clutter",
      observation: "Cardboard boxes and a pile of clothing occupy the middle of the floor; papers and books are stacked on the desk and nightstand.",
      recommendation: "Clear the floor completely and reduce surfaces to a few intentional objects.",
      traditionalContext: "Traditional Feng Shui associates accumulated clutter with stagnant energy, particularly in a room meant for rest.",
    },
    {
      id: "issue-4",
      category: "visual_balance",
      severity: "medium",
      title: "Visual Balance",
      observation: "A single nightstand and the corner placement leave the bed lopsided, and the right half of the back wall is bare.",
      recommendation: "Center the bed on its wall with a matched pair of nightstands and lamps, and anchor the wall above it with artwork.",
      traditionalContext: "Balanced pairs on either side of the bed are traditionally associated with partnership and equilibrium.",
    },
    {
      id: "issue-5",
      category: "lighting",
      severity: "medium",
      title: "Harsh Light",
      observation: "The only artificial light is a bright, cool overhead fixture.",
      recommendation: "Add warm, low bedside lamps and use the ceiling light more softly in the evening.",
      traditionalContext: "Softer, layered light is commonly recommended in Feng Shui for bedrooms, which are considered restful, yin spaces.",
    },
    {
      id: "issue-6",
      category: "natural_elements",
      severity: "low",
      title: "Natural Elements",
      observation: "Aside from the oak floor and bed frame, there are no plants or natural textures.",
      recommendation: "Introduce a tall plant by the window, a natural-fiber rug and linen bedding.",
      traditionalContext: "Plants and natural materials are traditionally used to bring the Wood element and a sense of growth into a space.",
    },
  ],
  changes: [
    {
      id: "change-1",
      type: "move_furniture",
      object: "bed",
      title: "Bed Position",
      summary:
        "Moved the bed onto the solid wall to the right of the window, giving it a stable backing and a clear diagonal view of the door.",
      instruction:
        "Move the bed from the back-left corner to the solid section of the back wall right of the window, headboard centered on that section, foot toward the camera. Keep the oak bed frame; neatly make it with light linen bedding.",
      rationale:
        "A wall behind the headboard and a view of the entry create a more settled resting spot, and both sides of the bed become reachable.",
      relatedIssueIds: ["issue-1"],
    },
    {
      id: "change-2",
      type: "improve_symmetry",
      object: "nightstands and lamps",
      title: "Balanced Bedside",
      summary: "Flanked the bed with a matched pair of oak nightstands and warm ceramic lamps.",
      instruction:
        "Place matching oak nightstands on both sides of the relocated bed, each with a small ceramic table lamp with a warm white shade, switched on.",
      rationale: "Symmetry around the bed quiets the composition and gives each side its own surface and light.",
      relatedIssueIds: ["issue-4", "issue-5"],
    },
    {
      id: "change-3",
      type: "clear_pathway",
      object: "desk and chair",
      title: "Clear Entry Path",
      summary: "Moved the desk and chair to the left wall so the door opens onto open floor.",
      instruction:
        "Move the oak desk and black chair out of the entry path to the left wall, between the back corner and the door, desk against the wall. Keep the door fully clear.",
      rationale: "An unobstructed first step into the room makes it feel larger and easier to move through.",
      relatedIssueIds: ["issue-2"],
    },
    {
      id: "change-4",
      type: "remove_clutter",
      object: "boxes, clothing, papers",
      title: "Clutter-Free Floor",
      summary: "Removed the boxes and clothing from the floor and cleared the stacked papers and books.",
      instruction:
        "Remove the cardboard boxes and the pile of clothing from the floor, and remove the stacks of papers and books from the desk and nightstand.",
      rationale: "Open floor and clear surfaces let the room read as calm and intentional.",
      relatedIssueIds: ["issue-3"],
    },
    {
      id: "change-5",
      type: "add_plant",
      object: "floor plant",
      title: "Living Greenery",
      summary: "Added a tall leafy plant in a ceramic pot beside the window.",
      instruction: "Add a tall leafy plant in a white ceramic pot in the back-left corner beside the window, not blocking the glass.",
      rationale: "Greenery softens the corner and connects the room to the view outside.",
      relatedIssueIds: ["issue-6"],
    },
    {
      id: "change-6",
      type: "add_textile",
      object: "rug and artwork",
      title: "Grounding Textures",
      summary: "Anchored the bed with a large natural-fiber rug and hung a calm landscape print above it.",
      instruction:
        "Add a large light natural-fiber rug under the lower two-thirds of the bed and hang a framed, muted landscape print centered above the headboard.",
      rationale: "The rug defines the sleeping zone and the artwork gives the wall a quiet focal point.",
      relatedIssueIds: ["issue-4", "issue-6"],
    },
    {
      id: "change-7",
      type: "adjust_lighting",
      object: "lighting",
      title: "Warm, Layered Light",
      summary: "Softened the overhead light and let warm bedside lamps set the mood.",
      instruction: "Keep the same ceiling fixture but render it softer and warmer; the bedside lamps provide warm pools of light.",
      rationale: "Layered, warmer light feels more restful than a single bright overhead source.",
      relatedIssueIds: ["issue-5"],
    },
  ],
  alignment: {
    flow: { current: "opportunity", projected: "strong", note: "The entry path is blocked by the desk and the floor is crowded." },
    commandPosition: {
      current: "opportunity",
      projected: "strong",
      note: "The bed sits under the window without a solid wall behind it.",
    },
    balance: { current: "opportunity", projected: "strong", note: "Weight is concentrated on the left; the bed has a single nightstand." },
    clutter: { current: "opportunity", projected: "strong", note: "Boxes and clothing occupy the central floor." },
    naturalElements: { current: "moderate", projected: "strong", note: "Oak floor and furniture help, but there are no plants or soft natural textures." },
    lighting: { current: "moderate", projected: "strong", note: "Good daylight, but evening light comes from one cool overhead fixture." },
  },
  preserve: [
    "White panel door on the left wall",
    "White divided-light window on the back wall",
    "White radiator beneath the window",
    "Light oak plank flooring",
    "Round flush-mount ceiling light",
    "Oak desk with black legs and black chair",
    "Oak bed frame",
  ],
  imageEditPrompt:
    "Rearrange this bedroom: bed centered on the solid back wall right of the window with matched nightstands and warm lamps, desk moved to the left wall clear of the door, floor cleared of boxes and clothing, a tall plant beside the window, a large natural rug under the bed and a calm landscape print above it. Warm, soft light.",
};

export const SAMPLE_IMAGES = {
  before: "/samples/bedroom-before.jpg",
  after: "/samples/bedroom-after.jpg",
  width: 1536,
  height: 1024,
} as const;
