"use client"

import { useQuery } from "@tanstack/react-query"
import { getMonthlyActivity } from "@/module/github/lib/github"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Loader2 } from "lucide-react"

export default function MonthlyActivityChart() {
    const { data, isLoading } = useQuery({
        queryKey: ["monthly-activity"],
        queryFn: () => getMonthlyActivity(),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-neutral-500" />
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center py-12 text-sm text-neutral-500">
                No activity data available.
            </div>
        )
    }

    return (
        <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barGap={4}>
                    <CartesianGrid vertical={false} stroke="#1f1f1f" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#737373", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#737373", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0a0a0a",
                            border: "1px solid #262626",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#fff",
                        }}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="commits" name="Commits" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="prs" name="Pull Requests" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="reviews" name="Reviews" fill="#10b981" radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="size-2 rounded-full bg-blue-500 inline-block" /> Commits
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="size-2 rounded-full bg-violet-500 inline-block" /> Pull Requests
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" /> Reviews
                </span>
            </div>
        </div>
    )
}
