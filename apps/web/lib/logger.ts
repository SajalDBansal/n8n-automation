type LogContext = Record<string, unknown>;
type LogLevel = "info" | "warn" | "error";

// Emits structured JSON to the console so a plain stdout capture in prod is
// machine-parseable, without depending on any third-party error-tracking
// service.
function write(level: LogLevel, message: string, context?: LogContext) {
    const line = {
        level,
        timestamp: new Date().toISOString(),
        message,
        ...(context ? { context } : {}),
    };

    const serialized = JSON.stringify(line);
    if (level === "error") console.error(serialized);
    else if (level === "warn") console.warn(serialized);
    else console.log(serialized);
}

export const logger = {
    info(message: string, context?: LogContext) {
        write("info", message, context);
    },

    warn(message: string, context?: LogContext) {
        write("warn", message, context);
    },

    // `error` accepts the actual Error/unknown thrown value separately from
    // free-form context so the serialized stack trace is preserved.
    error(message: string, error?: unknown, context?: LogContext) {
        write("error", message, { ...(context ?? {}), error: serializeError(error) });
    },
};

function serializeError(error: unknown): unknown {
    if (error instanceof Error) {
        return { name: error.name, message: error.message, stack: error.stack };
    }
    return error;
}
