import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RANGE_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range") ?? "30d";
  const days = RANGE_DAYS[range];

  if (!days) {
    return NextResponse.json(
      { error: "Paramètre range invalide. Valeurs acceptées: 7d, 30d, 90d." },
      { status: 400 }
    );
  }

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const [dailyMetrics, sleepSessions, workouts] = await Promise.all([
    prisma.dailyMetric.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.sleepSession.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.workout.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "desc" },
    }),
  ]);

  return NextResponse.json({
    range,
    dailyMetrics: dailyMetrics.map((m) => ({
      date: m.date.toISOString().slice(0, 10),
      steps: m.steps,
      caloriesBurned: m.caloriesBurned,
      distanceKm: m.distanceKm,
    })),
    sleepSessions: sleepSessions.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      durationMinutes: s.durationMinutes,
      deepMinutes: s.deepMinutes,
      lightMinutes: s.lightMinutes,
      remMinutes: s.remMinutes,
      awakeMinutes: s.awakeMinutes,
    })),
    workouts: workouts.map((w) => ({
      id: w.id,
      date: w.date.toISOString().slice(0, 10),
      type: w.type,
      durationMinutes: w.durationMinutes,
      caloriesBurned: w.caloriesBurned,
      avgHeartRate: w.avgHeartRate,
      distanceKm: w.distanceKm,
    })),
  });
}
