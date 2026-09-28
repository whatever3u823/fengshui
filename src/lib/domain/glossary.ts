/**
 * Plain-language glossary of the Feng Shui ideas the app refers to.
 *
 * Every entry gives three layers so newcomers are never lost and the subject
 * is never flattened: what it means in everyday words, how it shows up in a
 * room, and the classical idea behind it. `aliases` are matched (case-
 * insensitively, whole words) in AI-written text to attach definitions inline.
 */

export interface GlossaryEntry {
  id: string;
  term: string;
  /** Optional pronunciation or original name, shown beside the term. */
  aside?: string;
  plain: string;
  inRoom: string;
  tradition: string;
  aliases: string[];
}

export const GLOSSARY = {
  chi: {
    id: "chi",
    term: "Chi",
    aside: "also qi · pronounced “chee”",
    plain:
      "The traditional idea of energy moving through a space — often pictured as a gentle breeze or a slow stream rather than anything mystical.",
    inRoom:
      "It maps closely onto things you can feel: how easily you walk in, how air and daylight travel, and whether the room feels stuck or calm.",
    tradition:
      "Classical texts describe chi as ideally meandering: it should neither rush in a straight line nor pool and stagnate.",
    aliases: ["chi", "qi", "ch'i", "energy flow", "flow of energy"],
  },
  mouthOfChi: {
    id: "mouthOfChi",
    term: "Mouth of chi",
    plain: "The classical name for a home's or room's main door — where energy, like people, comes in.",
    inRoom: "A clear, open first step inside the door, with nothing blocking it or the way it swings.",
    tradition: "Because everything enters here, the entry is treated as one of the most important areas of any space.",
    aliases: ["mouth of chi", "mouth of qi"],
  },
  commandPosition: {
    id: "commandPosition",
    term: "Command position",
    plain:
      "Placing your bed, desk or main seat so you can see the door without being directly in line with it — usually diagonally across the room.",
    inRoom:
      "From bed or desk you can see who comes in, with a solid wall behind you rather than a window or walkway.",
    tradition:
      "Traditionally linked with feeling secure and in charge of your space. It is one of the most consistent rules across schools of Feng Shui.",
    aliases: ["command position", "commanding position", "command-position"],
  },
  armchair: {
    id: "armchair",
    term: "Armchair configuration",
    aside: "the four celestial animals",
    plain:
      "The ideal surroundings for a bed, seat or house: high support behind, gentle support on both sides, open space in front — like sitting in a high-backed armchair.",
    inRoom: "A solid headboard wall behind the bed, nightstands or furniture at either side, and open floor at the foot.",
    tradition:
      "Classically described with four animals: the Black Tortoise behind, the Green Dragon and White Tiger on either side, and the Red Phoenix in the open space ahead.",
    aliases: ["armchair configuration", "armchair position", "four celestial animals", "celestial animals", "black tortoise"],
  },
  yinYang: {
    id: "yinYang",
    term: "Yin and yang",
    plain:
      "Two complementary qualities. Yin is quiet, soft, dim and restful; yang is bright, active and energizing. Neither is good or bad — the aim is the right mix for the room.",
    inRoom:
      "Bedrooms lean yin (soft textiles, low warm light); kitchens and living rooms can hold more yang (brightness, activity, crisp surfaces).",
    tradition: "Rooted in classical Chinese philosophy: every space holds both, and imbalance in either direction feels uncomfortable.",
    aliases: ["yin and yang", "yin-yang", "yin/yang", "yin", "yang"],
  },
  fiveElements: {
    id: "fiveElements",
    term: "The five elements",
    aside: "wu xing",
    plain:
      "Wood, Fire, Earth, Metal and Water — a traditional way of balancing a room through its materials, colors and shapes.",
    inRoom:
      "Wood: plants, timber, tall shapes, greens. Fire: light, triangles, warm reds. Earth: ceramics, stone, squares, sandy tones. Metal: metal, round shapes, whites and greys. Water: glass, mirrors, wavy lines, deep blues.",
    tradition:
      "The elements feed and temper one another in cycles; a room dominated by one tends to feel off, while a considered mix feels grounded.",
    aliases: [
      "five elements",
      "wu xing",
      "wood element",
      "fire element",
      "earth element",
      "metal element",
      "water element",
      "element of wood",
      "element of fire",
      "element of earth",
      "element of metal",
      "element of water",
    ],
  },
  shaChi: {
    id: "shaChi",
    term: "Sha chi",
    aside: "“cutting” energy, or poison arrows",
    plain: "Harsh energy from sharp corners, exposed beams or long straight lines pointed at where you sit or sleep.",
    inRoom: "A table corner aimed at the bed, a beam above the desk, or a hallway that shoots straight at a chair.",
    tradition:
      "Considered unsettling in classical practice; softened with plants, fabric, rounded shapes or simply by moving the seat.",
    aliases: ["sha chi", "sha qi", "poison arrow", "poison arrows", "cutting chi", "cutting energy"],
  },
  stagnantChi: {
    id: "stagnantChi",
    term: "Stagnant chi",
    plain: "Energy that pools and stops, rather than moving gently through the room.",
    inRoom: "Clutter on the floor, crowded corners, blocked paths and dim, unused areas.",
    tradition: "Clearing clutter is usually the first step in any Feng Shui work, before anything is added.",
    aliases: ["stagnant chi", "stagnant energy", "stagnating energy", "stuck energy"],
  },
  balancedPairs: {
    id: "balancedPairs",
    term: "Balanced pairs",
    plain: "Matching items on either side of a central piece — two nightstands, two lamps, two chairs.",
    inRoom: "Symmetry around the bed or sofa that makes the arrangement feel settled.",
    tradition: "Traditionally associated with partnership and equilibrium, especially in bedrooms.",
    aliases: ["balanced pairs", "balanced pair", "matched pair", "matched pairs"],
  },
  formSchool: {
    id: "formSchool",
    term: "Form school",
    plain: "The oldest branch of Feng Shui, which reads the shapes you can actually see — landforms, rooms, furniture — rather than compass directions.",
    inRoom: "Where things are placed relative to doors, windows and walls; how the room is shaped and lit.",
    tradition:
      "Feng Shui AI works in this tradition because a single photo shows form but not compass orientation.",
    aliases: ["form school", "form-school"],
  },
  bagua: {
    id: "bagua",
    term: "Bagua",
    aside: "“eight areas”",
    plain: "A traditional map that divides a home into areas, each linked to a part of life such as career or family.",
    inRoom: "Applying it needs a floor plan and compass directions.",
    tradition:
      "Because one photo can't show orientation or the whole home, Feng Shui AI doesn't make bagua-based claims.",
    aliases: ["bagua", "ba gua", "pa kua"],
  },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryId = keyof typeof GLOSSARY;
export const GLOSSARY_ENTRIES: GlossaryEntry[] = Object.values(GLOSSARY);

/** Plain-language meaning of each alignment principle, shown beside its rating. */
export const ALIGNMENT_EXPLAINERS = {
  flow: {
    question: "Can you walk in and move around easily — and do light and air travel freely?",
    term: "chi" as GlossaryId,
  },
  commandPosition: {
    question: "Can you see the door from your bed, desk or main seat, without being directly in line with it?",
    term: "commandPosition" as GlossaryId,
  },
  balance: {
    question: "Do visual weight, light and dark, and soft and hard feel evenly spread?",
    term: "yinYang" as GlossaryId,
  },
  clutter: {
    question: "Is there anything on floors and surfaces that doesn't need to be there?",
    term: "stagnantChi" as GlossaryId,
  },
  naturalElements: {
    question: "Is there a considered mix of living plants, natural materials, colors and shapes?",
    term: "fiveElements" as GlossaryId,
  },
  lighting: {
    question: "Is there good daylight, and is artificial light warm and layered rather than harsh?",
    term: "yinYang" as GlossaryId,
  },
} as const;

export const RATING_EXPLAINERS = {
  strong: "Already working well",
  moderate: "Partly there",
  opportunity: "Where a change helps most",
  not_applicable: "Doesn't apply to this room",
} as const;

/** Which glossary idea sits behind each issue category, plus a plain label. */
export const ISSUE_PRINCIPLES: Record<string, { label: string; term: GlossaryId | null }> = {
  command_position: { label: "Command position", term: "commandPosition" },
  bed_position: { label: "Command position", term: "commandPosition" },
  desk_position: { label: "Command position", term: "commandPosition" },
  seating_position: { label: "Command position", term: "commandPosition" },
  door_visibility: { label: "Mouth of chi", term: "mouthOfChi" },
  pathway: { label: "Flow of chi", term: "chi" },
  obstruction: { label: "Flow of chi", term: "chi" },
  clutter: { label: "Stagnant chi", term: "stagnantChi" },
  visual_balance: { label: "Yin and yang", term: "yinYang" },
  symmetry: { label: "Balanced pairs", term: "balancedPairs" },
  harsh_lines: { label: "Sha chi", term: "shaChi" },
  lighting: { label: "Yin and yang", term: "yinYang" },
  natural_light: { label: "Yin and yang", term: "yinYang" },
  natural_elements: { label: "Five elements", term: "fiveElements" },
  materials: { label: "Five elements", term: "fiveElements" },
  other: { label: "Balance", term: null },
};
