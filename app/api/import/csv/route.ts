import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { prisma } from "@/lib/prisma";
import { mapCsvRow, type CsvRow } from "@/lib/csv-mapping";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }

  const text = await file.text();
  if (!text.trim()) {
    return NextResponse.json({ error: "Le fichier CSV est vide." }, { status: 400 });
  }

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      { error: `Format CSV invalide: ${parsed.errors[0].message}` },
      { status: 400 }
    );
  }

  let dailyMetricsImported = 0;
  let sleepSessionsImported = 0;
  let workoutsImported = 0;
  let skippedRows = 0;

  for (const row of parsed.data) {
    const mapped = mapCsvRow(row);
    if (!mapped) {
      skippedRows += 1;
      continue;
    }

    if (mapped.dailyMetric) {
      await prisma.dailyMetric.upsert({
        where: { date: mapped.date },
        update: mapped.dailyMetric,
        create: { date: mapped.date, ...mapped.dailyMetric },
      });
      dailyMetricsImported += 1;
    }

    if (mapped.sleepSession) {
      await prisma.sleepSession.upsert({
        where: { date: mapped.date },
        update: mapped.sleepSession,
        create: { date: mapped.date, ...mapped.sleepSession },
      });
      sleepSessionsImported += 1;
    }

    if (mapped.workout) {
      await prisma.workout.upsert({
        where: {
          date_type_unique: { date: mapped.date, type: mapped.workout.type },
        },
        update: mapped.workout,
        create: { date: mapped.date, ...mapped.workout },
      });
      workoutsImported += 1;
    }
  }

  return NextResponse.json({
    success: true,
    rowsProcessed: parsed.data.length,
    dailyMetricsImported,
    sleepSessionsImported,
    workoutsImported,
    skippedRows,
  });
}
