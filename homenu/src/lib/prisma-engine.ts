import path from "path";
import fs from "fs";

/**
 * Resolves the Prisma query engine library path dynamically.
 *
 * Checks two candidate locations relative to `process.cwd()`:
 *  1. <cwd>/generated/prisma/...   (when Next.js runs from homenu/)
 *  2. <cwd>/../generated/prisma/.. (when cwd is a subdirectory)
 *
 * If neither is found the env var is left unset and Prisma falls back
 * to its own built-in resolution — which is correct for production
 * deployments where the engine is installed via npm postinstall.
 *
 * IMPORTANT: Never hardcode an absolute path here.  Hardcoded paths
 * are machine-specific and break when the project is moved or run by
 * a different user.
 */
const ENGINE_FILENAME =
  "libquery_engine-debian-openssl-3.0.x.so.node";

const candidates = [
  path.join(process.cwd(), "generated", "prisma", ENGINE_FILENAME),
  path.join(process.cwd(), "..", "generated", "prisma", ENGINE_FILENAME),
];

const resolvedEnginePath = candidates.find((p) => fs.existsSync(p));

if (resolvedEnginePath) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = resolvedEnginePath;
}
