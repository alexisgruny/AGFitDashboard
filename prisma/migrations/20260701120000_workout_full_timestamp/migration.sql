-- AlterTable
-- Workout.date now stores the full session timestamp (not just the calendar
-- day) so that multiple sessions of the same activity type on the same day
-- remain distinct under the (date, type) unique constraint.
ALTER TABLE "workouts" ALTER COLUMN "date" TYPE TIMESTAMP(3);
