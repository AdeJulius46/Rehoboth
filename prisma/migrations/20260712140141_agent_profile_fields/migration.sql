-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('SALES', 'COLLECTION');

-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "accountName" TEXT,
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "agentType" "AgentType" NOT NULL DEFAULT 'SALES',
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "imageUrl" TEXT;
