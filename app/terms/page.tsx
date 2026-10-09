import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowUp, FileText, Scale } from "lucide-react"
import { Logo } from "@/components/brand/logo"

export const metadata: Metadata = {
  title: "Terms and Conditions — codeSentinel",
  description: "The terms that govern access to and use of codeSentinel.",
}

const sections = [
  { id: "acceptance", number: "01", title: "Acceptance of these terms" },
  { id: "eligibility", number: "02", title: "Eligibility and accounts" },
  { id: "github-access", number: "03", title: "GitHub access" },
  { id: "repository-content", number: "04", title: "Repository content" },
  { id: "ai-output", number: "05", title: "AI-generated output" },
  { id: "acceptable-use", number: "06", title: "Acceptable use" },
  { id: "third-parties", number: "07", title: "Third-party services" },
  { id: "beta", number: "08", title: "Beta features" },
  { id: "ownership", number: "09", title: "Ownership and feedback" },
  { id: "availability", number: "10", title: "Availability and changes" },
  { id: "termination", number: "11", title: "Suspension and termination" },
  { id: "disclaimers", number: "12", title: "Disclaimers" },
  { id: "liability", number: "13", title: "Limitation of liability" },
  { id: "indemnity", number: "14", title: "Indemnity" },
  { id: "general", number: "15", title: "General terms" },
  { id: "contact", number: "16", title: "Contact" },
] as const

function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-white/10 py-10 first:border-t-0 first:pt-0 sm:py-12">
      <div className="grid gap-5 sm:grid-cols-[64px_1fr] sm:gap-8">
        <span className="font-mono text-[10px] tracking-[0.12em] text-[#d7c2a4]">/{number}</span>
        <div>
          <h2 className="text-2xl font-medium tracking-[-0.03em] text-white sm:text-3xl">{title}</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-white/58 sm:text-lg sm:leading-9">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div id="top" className="min-h-screen bg-[#101010] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#101010]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 lg:px-8">
          <Logo href="/" size="md" />
          <Link
            href="/"
            className="group flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-white/45 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" />
            BACK HOME
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-white/10">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-24">
            <div>
              <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.16em] text-[#d7c2a4]">
                <FileText className="size-4" strokeWidth={1.5} />
                LEGAL / TERMS
              </div>
              <h1 className="mt-8 max-w-3xl text-5xl font-medium leading-[0.96] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Terms and
                <span className="block text-[#d7c2a4]">Conditions.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-white/58 sm:text-xl sm:leading-9">
                These terms explain the rules for accessing codeSentinel, connecting repositories, and using AI-assisted code reviews and repository chat.
              </p>
            </div>

            <div className="self-end border border-white/10 bg-[#0b0b0b] p-6">
              <div className="flex items-center gap-3 text-white/65">
                <Scale className="size-4 text-[#d7c2a4]" strokeWidth={1.5} />
                <span className="font-mono text-xs tracking-[0.12em]">DOCUMENT STATUS</span>
              </div>
              <dl className="mt-6 space-y-4 border-t border-white/10 pt-5 font-mono text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-white/30">EFFECTIVE</dt>
                  <dd className="text-white/65">OCT 07, 2026</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/30">VERSION</dt>
                  <dd className="text-white/65">1.0</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[260px_1fr] lg:px-8 lg:py-20">
          <aside className="hidden lg:sticky lg:top-28 lg:block lg:h-fit">
            <p className="font-mono text-xs tracking-[0.16em] text-white/35">ON THIS PAGE</p>
            <nav aria-label="Terms sections" className="mt-6 border-l border-white/10">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block border-l border-transparent py-2 pl-4 text-sm text-white/42 transition-colors hover:border-[#d7c2a4] hover:text-white"
                >
                  {section.number} / {section.title}
                </a>
              ))}
            </nav>
            <p className="mt-7 max-w-[240px] text-sm leading-6 text-white/38">
              Please read these terms carefully before connecting a repository or using the service.
            </p>
          </aside>

          <article className="min-w-0">
            <div className="mb-12 border border-[#d7c2a4]/25 bg-[#d7c2a4]/5 p-5 text-base leading-7 text-white/65 sm:p-6 sm:text-lg sm:leading-8">
              By creating an account, connecting a repository, or otherwise using codeSentinel, you agree to these Terms and Conditions. If you do not agree, do not use the service.
            </div>

            <LegalSection id="acceptance" number="01" title="Acceptance of these terms">
              <p>
                These Terms and Conditions form an agreement between you and the operator of codeSentinel. They apply to the website, dashboard, GitHub integration, AI review features, repository chat, and related services collectively referred to as the “Service.”
              </p>
              <p>
                If you use the Service for a company, school, team, or other organization, you represent that you have authority to accept these terms on its behalf.
              </p>
            </LegalSection>

            <LegalSection id="eligibility" number="02" title="Eligibility and accounts">
              <p>You must be legally able to enter into this agreement and comply with the laws that apply to you. If you are under the age of legal majority where you live, you may use the Service only with permission from a parent or legal guardian.</p>
              <p>You are responsible for activity performed through your account and for maintaining the security of your GitHub account and active sessions. Information you provide must be accurate and kept up to date.</p>
            </LegalSection>

            <LegalSection id="github-access" number="03" title="GitHub access">
              <p>
                The Service uses GitHub for authentication and repository access. When you authorize codeSentinel, you grant the permissions displayed by GitHub. You then choose which available repositories to connect inside the Service.
              </p>
              <p>
                Depending on the features you enable, codeSentinel may read repository contents, pull-request metadata, diffs, commit information, and issue comments; install or remove webhooks; and create or update code-review comments. You must have authority to grant this access.
              </p>
              <p>You may revoke GitHub authorization through GitHub and may disconnect a repository through codeSentinel. Revocation can prevent some features from operating or completing work already queued.</p>
            </LegalSection>

            <LegalSection id="repository-content" number="04" title="Repository content">
              <p>You retain ownership of source code, repository data, prompts, and other material you provide to the Service (“Your Content”).</p>
              <p>
                You grant codeSentinel a limited, non-exclusive license to access, copy, process, transmit, and temporarily store Your Content only as needed to operate, secure, maintain, and improve the Service. This can include dividing source files into chunks, generating vector representations, retrieving relevant context, and sending limited content to configured AI providers.
              </p>
              <p>You represent that you have the rights and permissions required to connect each repository and process its contents through the Service. Do not connect content whose terms prohibit this processing.</p>
            </LegalSection>

            <LegalSection id="ai-output" number="05" title="AI-generated output">
              <p>
                Reviews, risk scores, summaries, findings, suggested changes, and chat responses are generated with artificial intelligence. They can be incomplete, inaccurate, outdated, or unsuitable for your specific project.
              </p>
              <p>
                AI output is provided as assistance, not as a substitute for human code review, security testing, legal advice, or professional judgment. You are responsible for verifying output before merging code, applying a suggestion, or relying on a result.
              </p>
              <p>codeSentinel does not guarantee that the Service will identify every defect, vulnerability, licensing issue, or harmful change.</p>
            </LegalSection>

            <LegalSection id="acceptable-use" number="06" title="Acceptable use">
              <p>You may not use the Service to:</p>
              <ul className="list-disc space-y-2 pl-5 marker:text-[#d7c2a4]">
                <li>access or process repositories without authorization;</li>
                <li>violate law, intellectual-property rights, privacy rights, or contractual duties;</li>
                <li>upload malware, secrets intended for misuse, or content designed to compromise the Service or its providers;</li>
                <li>probe, disrupt, overload, reverse engineer, or bypass security, usage, or access controls;</li>
                <li>use automated means to abuse quotas or create accounts deceptively;</li>
                <li>use output to facilitate unlawful, harmful, or fraudulent activity; or</li>
                <li>misrepresent AI-generated output as a guaranteed security assessment.</li>
              </ul>
            </LegalSection>

            <LegalSection id="third-parties" number="07" title="Third-party services">
              <p>
                The Service relies on third parties, including GitHub, hosting and database providers, background-job infrastructure, and AI model providers. Their own terms, privacy policies, availability, and usage limits may apply.
              </p>
              <p>codeSentinel is not responsible for third-party outages, changes, suspensions, data practices, or acts outside its reasonable control.</p>
            </LegalSection>

            <LegalSection id="beta" number="08" title="Beta features">
              <p>
                Features identified as alpha, beta, preview, experimental, or early access are still being evaluated. They may have stricter limits, reduced reliability, incomplete functionality, or material changes before general release.
              </p>
              <p>Beta features are provided “as is” and may be modified or withdrawn without notice. You should not rely on them for critical production decisions without independent verification.</p>
            </LegalSection>

            <LegalSection id="ownership" number="09" title="Ownership and feedback">
              <p>codeSentinel and its licensors retain all rights in the Service, including its software, interface, branding, documentation, and underlying technology. These terms do not transfer ownership of the Service or Your Content.</p>
              <p>If you voluntarily provide feedback or suggestions, you permit codeSentinel to use them without restriction or compensation, provided that doing so does not identify or disclose Your Content.</p>
            </LegalSection>

            <LegalSection id="availability" number="10" title="Availability and changes">
              <p>The Service may impose limits on repository size, indexed files, pull-request changes, prompts, model usage, storage, or request frequency. Limits can differ by feature, account, or plan.</p>
              <p>Features, integrations, limits, and pricing may change as the Service develops. Reasonable notice will be provided when a material change requires action from you, where practicable.</p>
            </LegalSection>

            <LegalSection id="termination" number="11" title="Suspension and termination">
              <p>You may stop using the Service at any time and disconnect your repositories. You may also revoke access through GitHub.</p>
              <p>Access may be limited, suspended, or terminated when reasonably necessary to protect the Service or others, comply with law, investigate misuse, address non-payment, or enforce these terms. Provisions that by their nature should survive termination will remain effective.</p>
            </LegalSection>

            <LegalSection id="disclaimers" number="12" title="Disclaimers">
              <p className="uppercase tracking-[0.02em] text-white/50">
                To the fullest extent permitted by law, the Service is provided “as is” and “as available,” without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, or uninterrupted availability.
              </p>
              <p>Nothing in these terms excludes warranties or rights that cannot legally be excluded.</p>
            </LegalSection>

            <LegalSection id="liability" number="13" title="Limitation of liability">
              <p className="uppercase tracking-[0.02em] text-white/50">
                To the fullest extent permitted by law, codeSentinel and its operator will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenue, data, goodwill, business opportunities, or security incidents arising from use of or inability to use the Service.
              </p>
              <p>
                To the fullest extent permitted by law, total liability arising from the Service will not exceed the greater of the amount you paid for the Service during the three months before the event giving rise to the claim or the minimum amount required by applicable law.
              </p>
            </LegalSection>

            <LegalSection id="indemnity" number="14" title="Indemnity">
              <p>To the extent permitted by law, you agree to defend and indemnify codeSentinel and its operator from third-party claims arising from Your Content, repositories you connect without authorization, your violation of these terms, or your unlawful use of the Service.</p>
            </LegalSection>

            <LegalSection id="general" number="15" title="General terms">
              <p>If a provision of these terms is unenforceable, the remaining provisions remain in effect. Failure to enforce a provision is not a waiver. You may not transfer this agreement without consent, but the operator may transfer it as part of a merger, acquisition, reorganization, or sale of the Service.</p>
              <p>These terms and any policies expressly incorporated into them form the entire agreement regarding the Service. Applicable law governs these terms without regard to conflict-of-law principles, subject to any mandatory consumer protections available where you live.</p>
              <p>Material updates will be reflected by changing the effective date. Continued use after updated terms take effect constitutes acceptance where permitted by law.</p>
            </LegalSection>

            <LegalSection id="contact" number="16" title="Contact">
              <p>If you have questions about these terms, use the support or contact channel identified within codeSentinel. Legal notices should clearly identify the sender, account, and nature of the request.</p>
              <p className="text-white/38">Before public launch, the operator’s legal name, jurisdiction, physical or registered address, and dedicated contact email should be added to this section.</p>
            </LegalSection>

            <div className="mt-4 flex justify-end">
              <a href="#top" className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-white/45 transition-colors hover:text-white">
                BACK TO TOP <ArrowUp className="size-3" />
              </a>
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#0b0b0b]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-6 py-8 font-mono text-xs text-white/40 sm:flex-row sm:items-center lg:px-8">
          <span>© {new Date().getFullYear()} CODESENTINEL</span>
          <div className="flex gap-6">
            <Link href="/docs" className="transition-colors hover:text-white">DOCS</Link>
            <Link href="/login" className="transition-colors hover:text-white">SIGN IN</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
