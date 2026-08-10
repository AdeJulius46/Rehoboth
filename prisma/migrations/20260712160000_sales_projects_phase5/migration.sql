-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "warehouseId" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "discount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "code" TEXT,
ADD COLUMN     "agentId" TEXT;

UPDATE "Project" SET "code" = 'PRJ-' || substr(md5(random()::text), 1, 8) WHERE "code" IS NULL;

ALTER TABLE "Project" ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Project_code_key" ON "Project"("code");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
