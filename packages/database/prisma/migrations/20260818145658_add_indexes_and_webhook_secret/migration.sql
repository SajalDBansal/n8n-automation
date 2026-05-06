-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "secret" TEXT;

-- CreateIndex
CREATE INDEX "Edge_source_idx" ON "Edge"("source");

-- CreateIndex
CREATE INDEX "Edge_target_idx" ON "Edge"("target");

-- CreateIndex
CREATE INDEX "Node_credentialId_idx" ON "Node"("credentialId");
