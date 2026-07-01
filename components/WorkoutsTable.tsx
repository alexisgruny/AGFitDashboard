import type { WorkoutDto } from "@/lib/types";

export default function WorkoutsTable({ data }: { data: WorkoutDto[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="font-semibold mb-2">Historique des entraînements</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b border-gray-200">
            <tr>
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Durée (min)</th>
              <th className="py-2 pr-4">Calories</th>
              <th className="py-2 pr-4">FC moy.</th>
              <th className="py-2 pr-4">Distance (km)</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-400">
                  Aucun entraînement sur cette période.
                </td>
              </tr>
            )}
            {data.map((w) => (
              <tr key={w.id} className="border-b border-gray-100">
                <td className="py-2 pr-4">{w.date}</td>
                <td className="py-2 pr-4">{w.type}</td>
                <td className="py-2 pr-4">{w.durationMinutes}</td>
                <td className="py-2 pr-4">{w.caloriesBurned}</td>
                <td className="py-2 pr-4">{w.avgHeartRate ?? "-"}</td>
                <td className="py-2 pr-4">{w.distanceKm ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
