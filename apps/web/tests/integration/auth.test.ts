import { describe, it, expect, afterAll } from "bun:test";
import prisma from "@workspace/database";
import { auth } from "@/lib/auth";
import { uniqueEmail } from "./helpers";

// Calls Better Auth's own `auth.api.*` methods directly instead of going
// through the Next.js route handlers. The route handlers all call
// `headers()` from `next/headers`, which needs Next's request-scoped
// AsyncLocalStorage context and doesn't work when a handler is imported and
// invoked outside a real request — `auth.api.*` is Better Auth's
// framework-agnostic core, happy to take a plain `Headers` object, so no
// server is needed for any of this.
describe("auth flow", () => {
    const password = "TestPass123!";
    const email = uniqueEmail("auth");
    const createdUserIds: string[] = [];

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    });

    it("sign-up creates a real user", async () => {
        const result = await auth.api.signUpEmail({
            body: { email, password, name: "Auth Test" },
        });

        expect(result.user.email).toBe(email);
        createdUserIds.push(result.user.id);

        const row = await prisma.user.findUnique({ where: { id: result.user.id } });
        expect(row).not.toBeNull();
        expect(row?.isArchived).toBe(false);
    });

    it("rejects sign-up with an already-registered email", async () => {
        await expect(
            auth.api.signUpEmail({ body: { email, password, name: "Duplicate" } })
        ).rejects.toBeTruthy();
    });

    it("rejects sign-in with the wrong password", async () => {
        await expect(
            auth.api.signInEmail({ body: { email, password: "wrong-password" } })
        ).rejects.toBeTruthy();
    });

    it("accepts sign-in with the correct password and issues a working session", async () => {
        const response = await auth.api.signInEmail({
            body: { email, password },
            asResponse: true,
        });

        expect(response.status).toBe(200);

        const setCookie = response.headers.get("set-cookie");
        expect(setCookie).toBeTruthy();

        const headers = new Headers();
        headers.set("cookie", setCookie!.split(";")[0]!);
        const session = await auth.api.getSession({ headers });

        expect(session?.user.email).toBe(email);
    });

    it("blocks a new session for an archived account", async () => {
        const archivedEmail = uniqueEmail("archived");
        const signUp = await auth.api.signUpEmail({
            body: { email: archivedEmail, password, name: "Archived Test" },
        });
        createdUserIds.push(signUp.user.id);

        await prisma.user.update({
            where: { id: signUp.user.id },
            data: { isArchived: true },
        });

        // databaseHooks.session.create.before (apps/web/lib/auth.ts) should
        // refuse to create a session for an archived user.
        const response = await auth.api.signInEmail({
            body: { email: archivedEmail, password },
            asResponse: true,
        });

        expect(response.status).not.toBe(200);
        expect(response.headers.get("set-cookie")).toBeNull();
    });
});
