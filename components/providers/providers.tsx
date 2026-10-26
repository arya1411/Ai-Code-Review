"use client"

import * as React from "react"
import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster theme="dark" richColors closeButton position="top-right" />
      </ThemeProvider>
    </QueryProvider>
  )
}
