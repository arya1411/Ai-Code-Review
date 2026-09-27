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
                    <CartesianGrid vertical={false} stroke="#292622" />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#797168", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#797168", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#0b0b0b",
                            border: "1px solid #3a3530",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#f5f1ea",
                        }}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    />
                    <Bar dataKey="contributions" name="Contributions" fill="#d7c2a4" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="prs" name="Pull Requests" fill="#45dca2" radius={[3, 3, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 justify-center">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="inline-block size-2 rounded-full bg-[#d7c2a4]" /> Contributions
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="inline-block size-2 rounded-full bg-[#45dca2]" /> Pull Requests
                </span>
            </div>
        </div>
    )
}
