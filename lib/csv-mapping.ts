// TODO: format Samsung Health réel inconnu à ce stade. Ce mapping utilise un
// format CSV générique documenté ci-dessous. Une fois un vrai export Samsung
// Health obtenu, ajuster les noms de colonnes (CSV_COLUMNS) et au besoin la
// logique de parsing des dates/durées dans ce fichier uniquement.
//
// Format générique attendu (une ligne = un jour, colonnes optionnelles sauf `date`) :
// date, steps, calories_burned, distance_km,
// sleep_duration_minutes, sleep_deep_minutes, sleep_light_minutes, sleep_rem_minutes, sleep_awake_minutes,
// workout_type, workout_duration_minutes, workout_calories, workout_avg_heart_rate, workout_distance_km

export interface CsvRow {
  date: string;
  steps?: string;
  calories_burned?: string;
  distance_km?: string;
  sleep_duration_minutes?: string;
  sleep_deep_minutes?: string;
  sleep_light_minutes?: string;
  sleep_rem_minutes?: string;
  sleep_awake_minutes?: string;
  workout_type?: string;
  workout_duration_minutes?: string;
  workout_calories?: string;
  workout_avg_heart_rate?: string;
  workout_distance_km?: string;
}

export interface MappedData {
  date: Date;
  dailyMetric?: { steps: number; caloriesBurned: number; distanceKm: number };
  sleepSession?: {
    durationMinutes: number;
    deepMinutes: number;
    lightMinutes: number;
    remMinutes: number;
    awakeMinutes: number;
  };
  workout?: {
    type: string;
    durationMinutes: number;
    caloriesBurned: number;
    avgHeartRate: number | null;
    distanceKm: number | null;
  };
}

function toNumber(value: string | undefined): number {
  if (value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toNullableNumber(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function mapCsvRow(row: CsvRow): MappedData | null {
  if (!row.date) return null;
  const date = new Date(row.date);
  if (Number.isNaN(date.getTime())) return null;

  const hasDailyMetric =
    row.steps !== undefined || row.calories_burned !== undefined || row.distance_km !== undefined;
  const hasSleep =
    row.sleep_duration_minutes !== undefined ||
    row.sleep_deep_minutes !== undefined ||
    row.sleep_light_minutes !== undefined ||
    row.sleep_rem_minutes !== undefined ||
    row.sleep_awake_minutes !== undefined;
  const hasWorkout = !!row.workout_type;

  return {
    date,
    dailyMetric: hasDailyMetric
      ? {
          steps: Math.round(toNumber(row.steps)),
          caloriesBurned: toNumber(row.calories_burned),
          distanceKm: toNumber(row.distance_km),
        }
      : undefined,
    sleepSession: hasSleep
      ? {
          durationMinutes: Math.round(toNumber(row.sleep_duration_minutes)),
          deepMinutes: Math.round(toNumber(row.sleep_deep_minutes)),
          lightMinutes: Math.round(toNumber(row.sleep_light_minutes)),
          remMinutes: Math.round(toNumber(row.sleep_rem_minutes)),
          awakeMinutes: Math.round(toNumber(row.sleep_awake_minutes)),
        }
      : undefined,
    workout: hasWorkout
      ? {
          type: row.workout_type as string,
          durationMinutes: Math.round(toNumber(row.workout_duration_minutes)),
          caloriesBurned: toNumber(row.workout_calories),
          avgHeartRate: toNullableNumber(row.workout_avg_heart_rate),
          distanceKm: toNullableNumber(row.workout_distance_km),
        }
      : undefined,
  };
}
