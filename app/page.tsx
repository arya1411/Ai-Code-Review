import { getOptionalSession } from "@/module/auth/utils/auth-utils"
import { Homepage } from "@/components/marketing/homepage"

export default async function Home() {
  const session = await getOptionalSession()

  return <Homepage isAuthenticated={!!session} />
}
