import { config } from "@workspace/eslint-config/base"

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // Prisma-generated client — not our code, not worth linting.
    ignores: ["generated/**", "prisma/migrations/**"],
  },
]
