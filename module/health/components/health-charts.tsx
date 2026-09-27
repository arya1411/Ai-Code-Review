"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const tooltipStyle = {
  backgroundColor: "#0b0b0b",
  border: "1px solid #3a3530",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#f5f1ea",
}

export function RiskTrendChart({ data }: { data: { month: string; reviews: number; highRisk: number; averageRisk: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d7c2a4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#d7c2a4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#292622" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#797168", fontSize: 11 }} />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#797168", fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#5d5750" }} />
          <Area type="monotone" dataKey="averageRisk" name="Average risk" stroke="#d7c2a4" strokeWidth={2} fill="url(#riskFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FindingCategoryChart({ data }: { data: { category: string; count: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-64 items-center justify-center text-xs text-neutral-600">No findings recorded yet.</div>
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 6, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#292622" />
          <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#797168", fontSize: 11 }} />
          <YAxis type="category" dataKey="category" width={92} axisLine={false} tickLine={false} tick={{ fill: "#bcb3a9", fontSize: 10 }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="count" name="Findings" fill="#d7c2a4" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
