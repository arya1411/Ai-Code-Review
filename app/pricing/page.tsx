import type { Metadata } from "next"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { Pricing } from "@/components/pricing"
import { getOptionalSession } from "@/module/auth/utils/auth-utils"
import { MarketingHeader } from "@/components/marketing/marketing-header"

export const metadata: Metadata = {
  title: "Pricing — codeSentinel",
  description: "Explore Free, Pro, and Max plans for codeSentinel. AI pull-request reviews, with straightforward pricing in Indian rupees.",
}

export default async function PricingPage() {
  const session = await getOptionalSession()

  if (!session) {
    return (
      <div className="marketing-shell min-h-screen bg-[#101010] text-white">
        <MarketingHeader isAuthenticated={false} />
        <main id="main-content" tabIndex={-1}>
          <Pricing isAuthenticated={false} />
        </main>
      </div>
    )
  }

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <Pricing />
      </DashboardShell>
    </AppBackground>
  )
}
