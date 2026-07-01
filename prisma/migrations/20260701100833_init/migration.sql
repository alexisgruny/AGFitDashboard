-- CreateTable
CREATE TABLE "daily_metrics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "steps" INTEGER NOT NULL DEFAULT 0,
    "calories_burned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "distance_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sleep_sessions" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "deep_minutes" INTEGER NOT NULL DEFAULT 0,
    "light_minutes" INTEGER NOT NULL DEFAULT 0,
    "rem_minutes" INTEGER NOT NULL DEFAULT 0,
    "awake_minutes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sleep_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "calories_burned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_heart_rate" INTEGER,
    "distance_km" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION NOT NULL,
    "target_date" DATE,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_metrics_date_key" ON "daily_metrics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "sleep_sessions_date_key" ON "sleep_sessions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "workouts_date_type_key" ON "workouts"("date", "type");

