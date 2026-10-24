import "dotenv/config"
import { validateDeploymentEnv } from "../lib/deployment-env"

try {
  validateDeploymentEnv(process.env)
  console.log("Production environment checks passed. Verify migration status and the live OAuth/webhook flow before launch.")
} catch (error) {
  console.error(error instanceof Error ? error.message : "Deployment configuration check failed")
  process.exitCode = 1
}
