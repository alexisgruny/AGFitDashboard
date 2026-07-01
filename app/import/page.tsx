"use client";

import { useState } from "react";

interface ImportResult {
  filesProcessed: number;
  dailyMetricsImported: number;
  sleepSessionsImported: number;
  workoutsImported: number;
  unsupportedFiles: string[];
}

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError("Sélectionnez au moins un fichier CSV.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);
    setResult(null);

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    try {
      const res = await fetch("/api/import/csv", { method: "POST", body: formData });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error ?? "Erreur lors de l'import.");
      }

      setResult(body);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold">Importer un export Samsung Health</h1>
      <p className="text-sm text-gray-500">
        Sélectionne les fichiers CSV exportés (pas, sommeil, entraînements). Chaque fichier est
        reconnu automatiquement par ses colonnes. Fréquence cardiaque et poids ne sont pas encore
        supportés.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-4">
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
        >
          {status === "loading" ? "Import en cours..." : "Importer"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 text-sm space-y-1">
          <p className="font-semibold">Import réussi.</p>
          <p>Fichiers traités : {result.filesProcessed}</p>
          <p>Métriques quotidiennes : {result.dailyMetricsImported}</p>
          <p>Sessions de sommeil : {result.sleepSessionsImported}</p>
          <p>Entraînements : {result.workoutsImported}</p>
          {result.unsupportedFiles.length > 0 && (
            <p>Fichiers ignorés (format non supporté) : {result.unsupportedFiles.join(", ")}</p>
          )}
        </div>
      )}

      {status === "error" && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">{error}</div>
      )}
    </div>
  );
}
