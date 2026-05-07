import type { NodeOutputDataType } from "@workspace/types";

export class UnresolvedExpressionError extends Error { }

export class ExpressionResolver {
    private nodeOutputs: NodeOutputDataType;

    constructor(nodeOutputs: NodeOutputDataType) {
        this.nodeOutputs = nodeOutputs;
    }

    resolve(value: unknown): unknown {
        if (typeof value === "string") {
            return this.resolveString(value);
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.resolve(item));
        }

        if (value && typeof value === "object") {
            const resolvedObject: Record<string, unknown> = {};
            for (const [key, val] of Object.entries(value)) {
                resolvedObject[key] = this.resolve(val);
            }
            return resolvedObject;
        }

        return value;
    }

    private resolveString(str: string): unknown {
        const expressionRegex = /\{\{\s*([^}]+)\s*\}\}/g;
        const singleExpressionMatch = str.match(/^\{\{\s*([^}]+)\s*\}\}$/);

        if (singleExpressionMatch && singleExpressionMatch[1]) {
            return this.resolveExpression(singleExpressionMatch[1]);
        }

        return str.replace(expressionRegex, (match, expression) => {
            const resolved = this.resolveExpression(expression.trim());
            // Preserve type for a whole-string expression (handled above);
            // an object/array embedded in a larger template is serialized
            // rather than stringified as "[object Object]".
            if (resolved !== null && typeof resolved === "object") {
                return JSON.stringify(resolved);
            }
            return String(resolved ?? "")
        });
    }

    // Throws rather than silently resolving to null — an unresolved
    // reference (typo'd node id, missing field) used to become an empty
    // string with no error, which is how a typo'd Resend `to` field ended
    // up silently mailing nothing. The caller turns this into a per-node
    // VALIDATION error, matching how other node-level validation failures
    // are handled — it fails only that node's branch, not the whole run.
    private resolveExpression(expression: string): unknown {
        const parts = expression.split(".");

        if (parts.length < 2) {
            throw new UnresolvedExpressionError(`Invalid expression format: ${expression}`);
        }

        const nodeId = parts[0] ?? "";
        const path = parts.slice(1);
        const nodeData = nodeId ? this.nodeOutputs[nodeId] : undefined;

        if (!nodeData) {
            throw new UnresolvedExpressionError(`Node data not found for: ${nodeId}`);
        }

        let current: any = nodeData;
        for (const key of path) {
            if (key.startsWith("[") && key.endsWith("]")) {
                const index = parseInt(key.slice(1, -1));
                if (Array.isArray(current) && !isNaN(index)) {
                    current = current[index];
                } else {
                    throw new UnresolvedExpressionError(`Invalid array access: ${expression}`);
                }
            } else if (current && typeof current === "object" && key in current) {
                current = current[key];
            } else {
                throw new UnresolvedExpressionError(`Path not found: ${expression}`);
            }
        }

        return current;
    }

    resolveParameters(
        parameters: Record<string, unknown>
    ): Record<string, unknown> {
        return this.resolve(parameters) as Record<string, unknown>;
    }
}