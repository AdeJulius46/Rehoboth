-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "number" TEXT;

UPDATE "Expense" SET "number" = 'EXP-' || substr(md5(random()::text), 1, 8) WHERE "number" IS NULL;

ALTER TABLE "Expense" ALTER COLUMN "number" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_number_key" ON "Expense"("number");
