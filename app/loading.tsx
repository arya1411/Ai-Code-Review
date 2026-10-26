import { LogoMark } from "@/components/brand/logo"

export default function Loading() {
  return (
    <div aria-busy="true" className="page-loader">
      <div className="page-loader-content">
        <div className="page-loader-emblem" aria-hidden="true">
          <span className="page-loader-orbit" />
          <span className="page-loader-orbit page-loader-orbit-inner" />
          <LogoMark className="page-loader-mark size-20" />
        </div>

        <p className="text-2xl font-semibold tracking-tight text-[#f5f1ea]">codeSentinel</p>
        <p className="mt-3 text-sm text-[#bcb3a9]">Preparing your next view</p>

        <div className="page-loader-preview" aria-hidden="true">
          <div className="flex items-center gap-1.5 border-b border-white/8 px-4 py-3">
            <span className="size-1.5 rounded-full bg-[#d7c2a4]/65" />
            <span className="size-1.5 rounded-full bg-white/15" />
            <span className="size-1.5 rounded-full bg-white/15" />
            <span className="ml-auto h-1 w-12 rounded-full bg-white/10" />
          </div>
          <div className="relative space-y-3 overflow-hidden px-5 py-5">
            <div className="flex gap-3"><span className="page-loader-line w-8 bg-[#d7c2a4]/35" /><span className="page-loader-line w-28 bg-white/15" /></div>
            <div className="flex gap-3 pl-4"><span className="page-loader-line w-16 bg-white/10" /><span className="page-loader-line w-20 bg-[#d7c2a4]/20" /></div>
            <div className="flex gap-3 pl-4"><span className="page-loader-line w-24 bg-white/15" /><span className="page-loader-line w-10 bg-white/10" /></div>
            <div className="flex gap-3"><span className="page-loader-line w-8 bg-[#d7c2a4]/35" /><span className="page-loader-line w-16 bg-white/10" /></div>
            <span className="page-loader-scan" />
          </div>
        </div>

        <p role="status" className="mt-7 flex items-center justify-center gap-3 text-xs font-medium tracking-wide text-[#bcb3a9]">
          Loading
          <span className="page-loader-dots" aria-hidden="true"><span /><span /><span /></span>
        </p>
      </div>
    </div>
  )
}
