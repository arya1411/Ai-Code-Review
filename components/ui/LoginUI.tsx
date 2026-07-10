"use client"

import { signIn } from "@/lib/auth-client"
import { useState } from "react"

function GitHubMark() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.54 2.87 8.4 6.84 9.77.5.1.68-.22.68-.48v-1.73c-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.07-.63.07-.63 1.02.08 1.56 1.07 1.56 1.07.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.13.64-1.39-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.38-2.04 1.01-2.76-.1-.26-.44-1.31.1-2.73 0 0 .84-.28 2.75 1.05A9.24 9.24 0 0 1 12 6.8c.85 0 1.72.12 2.53.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.42.2 2.47.1 2.73.63.72 1.01 1.64 1.01 2.76 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9v2.83c0 .26.18.58.69.48C19.13 20.65 22 16.79 22 12.25 22 6.58 17.52 2 12 2Z" />
        </svg>
    )
}

const LoginUI = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGithubLogin = async () => {
        setIsLoading(true)

        try {
            await signIn.social({
                provider: "github",
            })
        } catch (error) {
            console.error("Login Error", error)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-6 py-6 lg:px-12">
                <header className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#f7d9b5]" />
                    <span className="text-[1.35rem] font-semibold tracking-[-0.03em] text-white">codeSentinal</span>
                </header>

                <main className="flex flex-1 items-center pb-8 pt-10 lg:pt-0">
                    <div className="grid w-full gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                        <section className="max-w-[760px]">
                            <h1 className="max-w-[700px] text-[clamp(3.5rem,4.9vw,5.8rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                                Cut Code Review
                                <br />
                                Time &amp; Bugs in Half.
                                <br />
                                Instantly.
                            </h1>

                            <p className="mt-8 max-w-[690px] text-[1.05rem] leading-[1.85rem] text-white/55 sm:text-[1.15rem]">
                                Supercharge your team to ship faster with the most advanced AI code reviews.
                            </p>
                        </section>

                        <section className="flex justify-start lg:justify-end">
                            <div className="w-full max-w-[440px] rounded-[24px] border border-white/12 bg-white/[0.03] px-8 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                                <div>
                                    <p className="text-[2.1rem] font-semibold tracking-[-0.04em] text-white">Welcome Back</p>
                                    <p className="mt-1 text-[1.05rem] font-medium text-white/38">
                                        Login using the following providers:
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGithubLogin}
                                    disabled={isLoading}
                                    className="mt-10 flex h-[54px] w-full items-center justify-center gap-4 rounded-[11px] bg-[#f5d8b8] text-[1.02rem] font-medium text-[#3a2b22] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-none disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    <GitHubMark />
                                    {isLoading ? "Connecting..." : "GitHub"}
                                </button>

                                <p className="mt-10 text-center text-[1.05rem] text-white/40">
                                    New to codeSentinal? <span className="font-semibold text-white/80">Sign Up</span>
                                </p>

                                <p className="mt-4 text-center text-[0.94rem] text-white/08">
                                    Self Hosted by codeSentinal
                                </p>

                                <div className="mt-10 flex items-center gap-5">
                                    <span className="h-px flex-1 bg-white/12" />
                                </div>

                                <div className="mt-7 flex items-center justify-center gap-6 text-sm text-white/28">
                                    <span>Terms of Use</span>
                                    <span>and</span>
                                    <span>Privacy Policy</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    )
}

export { LoginUI }
