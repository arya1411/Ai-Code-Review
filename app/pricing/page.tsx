import type { Metadata } from "next"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { AppBackground } from "@/components/layout/app-background"
import { Pricing } from "@/components/pricing"
import { requireAuth } from "@/module/auth/utils/auth-utils"

export const metadata: Metadata = {
  title: "Pricing — codeSentinel",
  description: "Explore Free, Pro, and Max plans for codeSentinel. AI pull-request reviews, with straightforward pricing in Indian rupees.",
}

export default async function PricingPage() {
  const session = await requireAuth()

  return (
    <AppBackground>
      <DashboardShell user={session.user}>
        <Pricing />
      </DashboardShell>
    </AppBackground>
  )
}
