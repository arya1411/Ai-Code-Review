"use client"

import { useEffect, useLayoutEffect, type RefObject } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// useLayoutEffect on the client (runs before paint, so first-frame states are
// applied without a flash) and a no-op useEffect on the server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

/**
 * Drives the homepage as a shell session: the hero terminal "prints" its
 * output line by line on load, spinners resolve to checks, the risk score
 * counts up, and each section's prompt + output reveal on scroll.
 *
 * Everything is scoped with gsap.context and gated behind a no-preference
 * matchMedia block, so reduced-motion visitors get the fully printed page.
 */
export function useHomepageMotion(root: RefObject<HTMLElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const el = root.current
    if (!el) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const ease = "power3.out"

        const countUp = (node: Element) => {
          const target = Number(node.getAttribute("data-count") ?? "0")
          const proxy = { v: 0 }
          gsap.to(proxy, {
            v: target,
            duration: 1,
            ease: "power2.out",
            onUpdate: () => {
              node.textContent = Math.round(proxy.v).toString()
            },
          })
        }

        /* ---- Spinner glyphs cycle while the hero "works" ------------- */
        const spinners = gsap.utils.toArray<HTMLElement>("[data-terminal] .term-spin")
        spinners.forEach((s) => {
          s.classList.remove("t-green")
          s.classList.add("t-amber")
          s.textContent = SPINNER[0]
        })
        const spin = { i: 0 }
        const spinTween = gsap.to(spin, {
          i: SPINNER.length - 1,
          duration: 0.6,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            const frame = SPINNER[Math.round(spin.i) % SPINNER.length]
            spinners.forEach((s) => (s.textContent = frame))
          },
        })

        /* ---- Above-the-terminal pitch, then the printed session ----- */
        const intro = gsap.timeline({
          defaults: { ease, duration: 0.7 },
          onComplete: () => {
            spinTween.kill()
            spinners.forEach((s) => {
              s.textContent = "✓"
              s.classList.remove("t-amber")
              s.classList.add("t-green")
            })
          },
        })

        intro
          .from("[data-hero] .reveal-up", {
            autoAlpha: 0,
            y: 16,
            stagger: 0.09,
          })
          .from(
            "[data-terminal]",
            { autoAlpha: 0, y: 24, duration: 0.6 },
            "-=0.3",
          )
          .from(
            "[data-terminal] .term-line",
            {
              autoAlpha: 0,
              y: 6,
              duration: 0.18,
              stagger: 0.11,
              ease: "none",
            },
            "-=0.1",
          )
          .add(() => {
            const score = el.querySelector(".risk-score")
            if (score) countUp(score)
          }, "-=0.9")
          .from(".term-cursor", { autoAlpha: 0, duration: 0.2 }, ">-0.1")

        /* ---- Section prompts + output reveal on scroll -------------- */
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((section) => {
          const children = section.querySelectorAll("[data-reveal-child]")
          const targets = children.length ? children : [section]
          gsap.from(targets, {
            autoAlpha: 0,
            y: 22,
            duration: 0.6,
            ease,
            stagger: 0.07,
            scrollTrigger: { trigger: section, start: "top 82%", once: true },
          })
        })

        /* ---- Stat figures count up when the strip enters view ------- */
        const statStrip = el.querySelector("[data-stats]")
        if (statStrip) {
          ScrollTrigger.create({
            trigger: statStrip,
            start: "top 85%",
            once: true,
            onEnter: () =>
              statStrip
                .querySelectorAll<HTMLElement>(".stat-value[data-count]")
                .forEach((n) => countUp(n)),
          })
        }

        /* ---- Header condenses once you leave the hero --------------- */
        const header = document.querySelector("[data-site-header]")
        if (header) {
          ScrollTrigger.create({
            start: "top -80",
            end: 99999,
            onUpdate: (self) =>
              header.classList.toggle("is-scrolled", self.scroll() > 80),
          })
        }
      })
    }, el)

    return () => ctx.revert()
  }, [root])
}
