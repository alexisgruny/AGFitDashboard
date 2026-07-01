"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyMetricDto } from "@/lib/types";

export default function CaloriesLineChart({ data }: { data: DailyMetricDto[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="font-semibold mb-2">
        Calories brûlées <span className="text-xs font-normal text-gray-400">(estimation)</span>
      </h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="caloriesBurned" stroke="#dc2626" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
