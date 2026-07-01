import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseImportFile } from "@/lib/csv-mapping";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof Blob);

  if (files.length === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  let dailyMetricsImported = 0;
  let sleepSessionsImported = 0;
  let workoutsImported = 0;
  const unsupportedFiles: string[] = [];

  for (const file of files) {
    const text = await file.text();
    if (!text.trim()) {
      unsupportedFiles.push(file.name);
      continue;
    }

    const parsed = parseImportFile(text);

    if (parsed.kind === "unsupported") {
      unsupportedFiles.push(file.name);
      continue;
    }

    if (parsed.kind === "steps") {
      for (const entry of parsed.entries) {
        const data = { steps: entry.steps, caloriesBurned: entry.caloriesBurned };
        await prisma.dailyMetric.upsert({
          where: { date: entry.date },
          update: data,
          create: { date: entry.date, ...data },
        });
        dailyMetricsImported += 1;
      }
    }

    if (parsed.kind === "sleep") {
      for (const entry of parsed.entries) {
        const data = {
          durationMinutes: entry.durationMinutes,
          deepMinutes: entry.deepMinutes,
          lightMinutes: entry.lightMinutes,
          remMinutes: entry.remMinutes,
          awakeMinutes: entry.awakeMinutes,
        };
        await prisma.sleepSession.upsert({
          where: { date: entry.date },
          update: data,
          create: { date: entry.date, ...data },
        });
        sleepSessionsImported += 1;
      }
    }

    if (parsed.kind === "workout") {
      for (const entry of parsed.entries) {
        const data = {
          durationMinutes: entry.durationMinutes,
          distanceKm: entry.distanceKm,
          caloriesBurned: entry.caloriesBurned,
        };
        await prisma.workout.upsert({
          where: { date_type_unique: { date: entry.date, type: entry.type } },
          update: data,
          create: { date: entry.date, type: entry.type, ...data },
        });
        workoutsImported += 1;
      }
    }
  }

  return NextResponse.json({
    success: true,
    filesProcessed: files.length,
    dailyMetricsImported,
    sleepSessionsImported,
    workoutsImported,
    unsupportedFiles,
  });
}
