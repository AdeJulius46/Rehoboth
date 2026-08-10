-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "employeeId" TEXT,
ADD COLUMN     "systemRole" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "address" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- Backfill a unique placeholder before enforcing NOT NULL + UNIQUE (table is expected to be empty in dev, but be safe).
UPDATE "Staff" SET "employeeId" = 'STAFF-' || substr(md5(random()::text), 1, 8) WHERE "employeeId" IS NULL;

ALTER TABLE "Staff" ALTER COLUMN "employeeId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");
