"use client";

import { useEffect, useState } from "react";
import StepsBarChart from "@/components/StepsBarChart";
import CaloriesLineChart from "@/components/CaloriesLineChart";
import SleepAreaChart from "@/components/SleepAreaChart";
import WorkoutsTable from "@/components/WorkoutsTable";
import type { MetricsResponse, RangeOption } from "@/lib/types";

const RANGE_LABELS: Record<RangeOption, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
};

export default function DashboardPage() {
  const [range, setRange] = useState<RangeOption>("30d");
  const [data, setData] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/metrics?range=${range}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? "Erreur inconnue");
        }
        return res.json();
      })
      .then((json: MetricsResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {(Object.keys(RANGE_LABELS) as RangeOption[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                range === r ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-500">Chargement...</p>}
      {error && <p className="text-red-600">Erreur: {error}</p>}

      {data && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StepsBarChart data={data.dailyMetrics} />
          <CaloriesLineChart data={data.dailyMetrics} />
          <SleepAreaChart data={data.sleepSessions} />
          <WorkoutsTable data={data.workouts} />
        </div>
      )}
    </div>
  );
}
