/*
  Warnings:

  - You are about to drop the column `createAt` on the `Credential` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Execution` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Execution` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Node` table. All the data in the column will be lost.
  - You are about to alter the column `positionX` on the `Node` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `positionY` on the `Node` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `createAt` on the `PendingUser` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `Workflow` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `webhook` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Credential" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Execution" DROP COLUMN "createAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Node" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "positionX" SET DATA TYPE INTEGER,
ALTER COLUMN "positionY" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "PendingUser" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Workflow" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "webhook" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
