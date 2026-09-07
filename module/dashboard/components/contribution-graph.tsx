"use client"
import { ActivityCalendar } from "react-activity-calendar"
import React from 'react'
import { useTheme } from 'next-themes';
import { useQuery } from "@tanstack/react-query";
import { getContributionStats } from "..";

const githubTheme = {
  light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
};

const ContributionGraph = () => {
  const { resolvedTheme } = useTheme();
  const colorScheme = resolvedTheme === "light" ? "light" : "dark";

  const { data, isLoading } = useQuery({
    queryKey: ['contribution-graph'],
    queryFn: async () => await getContributionStats(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="animate-pulse text-neutral-500 text-xs">Loading Contribution Data...</div>
      </div>
    )
  }

  if (!data || !data.contribution.length) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-8">
        <div className="text-neutral-500 text-xs">No Contribution Data Available</div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-[11px] text-neutral-500 font-medium">
        Contribution in {new Date().getFullYear()}
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex justify-center min-w-max px-2">
          <ActivityCalendar
            data={data.contribution}
            colorScheme={colorScheme}
            theme={githubTheme}
            blockSize={11}
            blockMargin={4}
            fontSize={12}
            showWeekdayLabels={true}
          />
        </div>
      </div>
    </div>
  )
}

export default ContributionGraph