-- CreateEnum
CREATE TYPE "IndexStatus" AS ENUM ('NOT_INDEXED', 'INDEXING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('QUEUED', 'ANALYZING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "repository"
ADD COLUMN "indexStatus" "IndexStatus" NOT NULL DEFAULT 'NOT_INDEXED',
ADD COLUMN "indexedAt" TIMESTAMP(3),
ADD COLUMN "indexedCommitSha" TEXT,
ADD COLUMN "indexError" TEXT;

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "githubPullRequestId" BIGINT NOT NULL,
    "pullRequestNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "url" TEXT NOT NULL,
    "headSha" TEXT NOT NULL,
    "baseSha" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'QUEUED',
    "riskLevel" "RiskLevel",
    "riskScore" INTEGER,
    "summary" TEXT,
    "reasons" JSONB,
    "error" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finding" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "category" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "line" INTEGER,
    "message" TEXT NOT NULL,
    "suggestion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "finding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "review_repositoryId_githubPullRequestId_headSha_key" ON "review"("repositoryId", "githubPullRequestId", "headSha");

-- CreateIndex
CREATE INDEX "review_repositoryId_createdAt_idx" ON "review"("repositoryId", "createdAt");

-- CreateIndex
CREATE INDEX "review_status_idx" ON "review"("status");

-- CreateIndex
CREATE INDEX "finding_reviewId_idx" ON "finding"("reviewId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finding" ADD CONSTRAINT "finding_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
