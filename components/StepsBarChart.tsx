"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyMetricDto } from "@/lib/types";

export default function StepsBarChart({ data }: { data: DailyMetricDto[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="font-semibold mb-2">Pas quotidiens</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="steps" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
