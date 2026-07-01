export interface DailyMetricDto {
  date: string;
  steps: number;
  caloriesBurned: number;
  distanceKm: number;
}

export interface SleepSessionDto {
  date: string;
  durationMinutes: number;
  deepMinutes: number;
  lightMinutes: number;
  remMinutes: number;
  awakeMinutes: number;
}

export interface WorkoutDto {
  id: number;
  date: string;
  type: string;
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate: number | null;
  distanceKm: number | null;
}

export interface MetricsResponse {
  range: string;
  dailyMetrics: DailyMetricDto[];
  sleepSessions: SleepSessionDto[];
  workouts: WorkoutDto[];
}

export type RangeOption = "7d" | "30d" | "90d";
