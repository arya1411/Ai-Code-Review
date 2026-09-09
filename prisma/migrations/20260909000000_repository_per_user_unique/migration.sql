-- Allow multiple users to connect the same GitHub repository while preventing
-- duplicate connections for a single user.
DROP INDEX "repository_githubId_key";

CREATE UNIQUE INDEX "repository_userId_githubId_key"
ON "repository"("userId", "githubId");
