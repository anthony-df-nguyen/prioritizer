"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIpcHandler = createIpcHandler;
/**
 * Wrap an IPC handler with:
 * - optional Zod validation
 * - consistent ok/error responses
 * - centralized logging
 */
function createIpcHandler(opts) {
    return async (event, inputUnknown) => {
        try {
            let input = inputUnknown;
            if (opts.schema) {
                const parsed = opts.schema.safeParse(inputUnknown);
                if (!parsed.success) {
                    return {
                        ok: false,
                        error: {
                            code: "VALIDATION_ERROR",
                            message: "Invalid request payload",
                            details: parsed.error.flatten(),
                        },
                    };
                }
                input = parsed.data;
            }
            const data = await opts.handler(event, input);
            return { ok: true, data };
        }
        catch (err) {
            // Centralized logging (keep it simple for now)
            console.error("[IPC] Handler error:", err);
            return {
                ok: false,
                error: {
                    code: "INTERNAL_ERROR",
                    message: "Something went wrong",
                },
            };
        }
    };
}
