/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Credential_id_idx";

-- DropIndex
DROP INDEX "Edge_id_idx";

-- DropIndex
DROP INDEX "Execution_id_idx";

-- DropIndex
DROP INDEX "Node_id_idx";

-- DropIndex
DROP INDEX "PendingUser_email_idx";

-- DropIndex
DROP INDEX "PendingUser_id_idx";

-- DropIndex
DROP INDEX "Project_id_idx";

-- DropIndex
DROP INDEX "Project_id_userId_idx";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_id_idx";

-- DropIndex
DROP INDEX "Workflow_id_idx";

-- DropIndex
DROP INDEX "webhook_id_idx";

-- CreateIndex
CREATE INDEX "Execution_workflowId_createdAt_idx" ON "Execution"("workflowId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_url_key" ON "webhook"("url");

-- CreateIndex
CREATE INDEX "webhook_workflowId_idx" ON "webhook"("workflowId");
