"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SleepSessionDto } from "@/lib/types";

export default function SleepAreaChart({ data }: { data: SleepSessionDto[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="font-semibold mb-2">Sommeil par phase</h2>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="min" />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="deepMinutes" stackId="1" name="Profond" stroke="#1e3a8a" fill="#1e3a8a" />
          <Area type="monotone" dataKey="lightMinutes" stackId="1" name="Léger" stroke="#3b82f6" fill="#3b82f6" />
          <Area type="monotone" dataKey="remMinutes" stackId="1" name="Paradoxal" stroke="#a855f7" fill="#a855f7" />
          <Area type="monotone" dataKey="awakeMinutes" stackId="1" name="Éveil" stroke="#f59e0b" fill="#f59e0b" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
