import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-xl mx-auto text-center space-y-4">
      <h1 className="text-2xl font-bold">AGFitDashboard</h1>
      <p className="text-gray-600">
        Dashboard fitness personnel alimenté par export CSV Samsung Health.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Voir le dashboard
        </Link>
        <Link href="/import" className="px-4 py-2 bg-gray-200 rounded-md">
          Importer des données
        </Link>
      </div>
    </div>
  );
}
