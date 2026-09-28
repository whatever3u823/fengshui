import type { AnalysisStage } from "@/lib/domain/types";

/**
 * Turns the analysis model's streamed JSON into real progress events.
 *
 * The output schema lists observations in a fixed order (openings → furniture
 * → pathways → lighting/balance → issues → changes), so the appearance of each
 * top-level key means the model has finished the previous section. The UI only
 * advances when the model actually gets there.
 */

const MARKERS: Array<{ key: string; completes: AnalysisStage; next: AnalysisStage }> = [
  { key: "furniture", completes: "layout", next: "furniture" },
  { key: "pathways", completes: "furniture", next: "pathways" },
  { key: "lighting", completes: "pathways", next: "balance" },
  { key: "issues", completes: "balance", next: "opportunities" },
  { key: "changes", completes: "opportunities", next: "design" },
];

export type StageEmitter = (stage: AnalysisStage, status: "active" | "done") => void;

export function createStageTracker(emit: StageEmitter): (textSoFar: string) => void {
  let index = 0;
  const patterns = MARKERS.map((m) => new RegExp(`"${m.key}"\\s*:`));
  return (textSoFar: string) => {
    while (index < MARKERS.length && patterns[index].test(textSoFar)) {
      emit(MARKERS[index].completes, "done");
      emit(MARKERS[index].next, "active");
      index += 1;
    }
  };
}
