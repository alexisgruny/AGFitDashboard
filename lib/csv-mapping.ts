import Papa from "papaparse";

// Formats réels observés dans les exports Samsung Health (via Health Sync).
// Chaque export est un fichier CSV distinct par type de donnée, détecté par
// ses en-têtes (les noms de fichiers ne sont pas fiables à 100%).
//
// - Entraînement (1 ligne par séance) :
//   Application source,Type d'activité,Nom de l'activité,Date,Heure,Temps écoulé,Temps actif,Distance (km)
// - Pas (plusieurs points par jour, à sommer) :
//   Date,Heure,Pas
// - Sommeil (segments par phase, à regrouper en sessions puis sommer) :
//   Date,Heure,Durée en secondes,Phase de sommeil
//
// Fréquence cardiaque et poids (export binaire .FIT) ne sont pas supportés
// pour l'instant : aucun modèle de données ne les stocke.
//
// Aucun export Samsung Health/Health Sync ne fournit les calories brûlées
// (ni au global ni par séance) : elles sont donc estimées par formule MET,
// faute de vraie mesure. ASSUMED_BODY_WEIGHT_KG est une valeur déclarée par
// l'utilisateur, pas mesurée (voir aussi le fichier Poids, exclu du scope).
const ASSUMED_BODY_WEIGHT_KG = 85;

// MET (Metabolic Equivalent of Task) approximatifs par type d'activité.
// Source : compendium MET usuel. "3.5" = marche modérée, "6" = renfo/cardio.
const MET_BY_ACTIVITY_TYPE: Record<string, number> = {
  WALKING: 3.5,
  TRAINING: 6.0,
};
const DEFAULT_MET = 4.0;

// ~0.0005 kcal par pas et par kg de poids corporel (référence usuelle des
// calculateurs de calories pour la marche), soit ~350 kcal pour 10 000 pas
// à 82 kg.
const KCAL_PER_STEP_PER_KG = 0.0005;

function estimateWorkoutCalories(type: string, durationMinutes: number): number {
  const met = MET_BY_ACTIVITY_TYPE[type] ?? DEFAULT_MET;
  return Math.round(met * ASSUMED_BODY_WEIGHT_KG * (durationMinutes / 60));
}

function estimateDailyCalories(steps: number): number {
  return Math.round(steps * KCAL_PER_STEP_PER_KG * ASSUMED_BODY_WEIGHT_KG);
}

export interface DailyMetricEntry {
  date: Date;
  steps: number;
  caloriesBurned: number;
}

export interface SleepSessionEntry {
  date: Date;
  durationMinutes: number;
  deepMinutes: number;
  lightMinutes: number;
  remMinutes: number;
  awakeMinutes: number;
}

export interface WorkoutEntry {
  date: Date;
  type: string;
  durationMinutes: number;
  distanceKm: number | null;
  caloriesBurned: number;
}

export type ParsedImportFile =
  | { kind: "steps"; entries: DailyMetricEntry[] }
  | { kind: "sleep"; entries: SleepSessionEntry[] }
  | { kind: "workout"; entries: WorkoutEntry[] }
  | { kind: "unsupported" };

const SLEEP_SESSION_GAP_MS = 4 * 60 * 60 * 1000;

function parseSamsungDate(value: string): Date {
  const [datePart, timePart] = value.trim().split(" ");
  const [year, month, day] = datePart.split(".").map(Number);
  const [hours, minutes, seconds] = (timePart ?? "00:00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes, seconds ?? 0);
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseWorkoutRows(rows: Record<string, string>[]): WorkoutEntry[] {
  const entries: WorkoutEntry[] = [];
  for (const row of rows) {
    const type = row["Type d'activité"];
    const dateValue = row["Date"];
    if (!type || !dateValue) continue;

    const date = parseSamsungDate(dateValue);
    if (Number.isNaN(date.getTime())) continue;

    const activeSeconds = Number(row["Temps actif"]) || 0;
    const durationMinutes = Math.round(activeSeconds / 60);
    const distanceValue = row["Distance (km)"];
    const distanceKm = distanceValue !== undefined && distanceValue !== "" ? Number(distanceValue) : null;

    entries.push({
      date,
      type,
      durationMinutes,
      distanceKm: distanceKm !== null && Number.isFinite(distanceKm) ? distanceKm : null,
      caloriesBurned: estimateWorkoutCalories(type, durationMinutes),
    });
  }
  return entries;
}

function parseStepsRows(rows: Record<string, string>[]): DailyMetricEntry[] {
  const totalsByDay = new Map<string, { date: Date; steps: number }>();

  for (const row of rows) {
    const dateValue = row["Date"];
    if (!dateValue) continue;
    const date = parseSamsungDate(dateValue);
    if (Number.isNaN(date.getTime())) continue;

    const steps = Number(row["Pas"]) || 0;
    const key = dayKey(date);
    const existing = totalsByDay.get(key);
    if (existing) {
      existing.steps += steps;
    } else {
      totalsByDay.set(key, { date: startOfDay(date), steps });
    }
  }

  return Array.from(totalsByDay.values()).map(({ date, steps }) => ({
    date,
    steps,
    caloriesBurned: estimateDailyCalories(steps),
  }));
}

interface SleepSegment {
  start: Date;
  durationSeconds: number;
  phase: string;
}

function parseSleepRows(rows: Record<string, string>[]): SleepSessionEntry[] {
  const segments: SleepSegment[] = [];

  for (const row of rows) {
    const dateValue = row["Date"];
    const phase = row["Phase de sommeil"];
    if (!dateValue || !phase) continue;
    const start = parseSamsungDate(dateValue);
    if (Number.isNaN(start.getTime())) continue;

    segments.push({
      start,
      durationSeconds: Number(row["Durée en secondes"]) || 0,
      phase: phase.trim().toLowerCase(),
    });
  }

  segments.sort((a, b) => a.start.getTime() - b.start.getTime());

  const sessions: SleepSegment[][] = [];
  for (const segment of segments) {
    const currentSession = sessions[sessions.length - 1];
    const previousSegment = currentSession?.[currentSession.length - 1];
    const previousEnd = previousSegment
      ? previousSegment.start.getTime() + previousSegment.durationSeconds * 1000
      : null;

    if (previousEnd !== null && segment.start.getTime() - previousEnd <= SLEEP_SESSION_GAP_MS) {
      currentSession.push(segment);
    } else {
      sessions.push([segment]);
    }
  }

  return sessions.map((sessionSegments) => {
    const totals = { durationMinutes: 0, deepMinutes: 0, lightMinutes: 0, remMinutes: 0, awakeMinutes: 0 };
    for (const segment of sessionSegments) {
      const minutes = segment.durationSeconds / 60;
      totals.durationMinutes += minutes;
      if (segment.phase === "deep") totals.deepMinutes += minutes;
      else if (segment.phase === "light") totals.lightMinutes += minutes;
      else if (segment.phase === "rem") totals.remMinutes += minutes;
      else if (segment.phase === "awake") totals.awakeMinutes += minutes;
    }

    // La session est rattachée au jour du réveil (dernier segment), convention
    // usuelle des trackers de sommeil pour une nuit à cheval sur deux jours.
    const wakeDate = sessionSegments[sessionSegments.length - 1].start;

    return {
      date: startOfDay(wakeDate),
      durationMinutes: Math.round(totals.durationMinutes),
      deepMinutes: Math.round(totals.deepMinutes),
      lightMinutes: Math.round(totals.lightMinutes),
      remMinutes: Math.round(totals.remMinutes),
      awakeMinutes: Math.round(totals.awakeMinutes),
    };
  });
}

export function parseImportFile(text: string): ParsedImportFile {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const fields = parsed.meta.fields ?? [];

  if (fields.includes("Type d'activité") && fields.includes("Temps actif")) {
    return { kind: "workout", entries: parseWorkoutRows(parsed.data) };
  }

  if (fields.includes("Phase de sommeil")) {
    return { kind: "sleep", entries: parseSleepRows(parsed.data) };
  }

  if (fields.includes("Pas") && !fields.includes("Fréquence cardiaque")) {
    return { kind: "steps", entries: parseStepsRows(parsed.data) };
  }

  return { kind: "unsupported" };
}
