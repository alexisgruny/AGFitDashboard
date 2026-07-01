"use client";

import { useEffect, useState } from "react";

interface Goal {
  id: number;
  type: string;
  targetValue: number;
  targetDate: string | null;
  currentValue: number;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  async function loadGoals() {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const body = await res.json();
      setGoals(body.goals);
    } catch {
      setError("Impossible de charger les objectifs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!type || !targetValue) {
      setError("Type et valeur cible sont requis.");
      return;
    }
    setError(null);

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        targetValue: Number(targetValue),
        targetDate: targetDate || null,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? "Erreur lors de la création.");
      return;
    }

    setType("");
    setTargetValue("");
    setTargetDate("");
    loadGoals();
  }

  async function handleUpdateProgress(goal: Goal, currentValue: number) {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue }),
    });
    loadGoals();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    loadGoals();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">Objectifs</h1>

      <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Type (ex: poids, distance, pas)"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Valeur cible"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
          Ajouter l&apos;objectif
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}

      <div className="space-y-4">
        {goals.map((goal) => {
          const progress = goal.targetValue > 0 ? Math.min(100, (goal.currentValue / goal.targetValue) * 100) : 0;
          return (
            <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{goal.type}</p>
                  {goal.targetDate && (
                    <p className="text-xs text-gray-500">Échéance : {goal.targetDate.slice(0, 10)}</p>
                  )}
                </div>
                <button onClick={() => handleDelete(goal.id)} className="text-red-600 text-sm">
                  Supprimer
                </button>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {goal.currentValue} / {goal.targetValue} ({progress.toFixed(0)}%)
                </span>
                <input
                  type="number"
                  defaultValue={goal.currentValue}
                  onBlur={(e) => handleUpdateProgress(goal, Number(e.target.value))}
                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm"
                />
              </div>
            </div>
          );
        })}
        {!loading && goals.length === 0 && (
          <p className="text-gray-400 text-sm">Aucun objectif pour le moment.</p>
        )}
      </div>
    </div>
  );
}
