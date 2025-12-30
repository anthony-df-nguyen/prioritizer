import type { Config } from "drizzle-kit";

export default {
  schema: "./electron/db/schema/",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    // Drizzle-kit needs a path at generation time; we use a dev DB file.
    url: "./dev.db",
  },
} satisfies Config;