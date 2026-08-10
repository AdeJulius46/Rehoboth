-- AlterTable
ALTER TABLE "Warehouse" ALTER COLUMN "manager" DROP NOT NULL,
ALTER COLUMN "capacity" SET DEFAULT 0,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "imageUrl" TEXT;

UPDATE "Warehouse" SET "code" = 'WH-' || substr(md5(random()::text), 1, 8) WHERE "code" IS NULL;

ALTER TABLE "Warehouse" ALTER COLUMN "code" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");
