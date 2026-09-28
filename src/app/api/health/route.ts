import { getPublicConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

/** GET /api/health — liveness plus the non-secret mode, for deploy checks. */
export function GET() {
  const { mode, analysisProvider, imageProvider } = getPublicConfig();
  return Response.json({ status: "ok", mode, analysisProvider, imageProvider });
}
