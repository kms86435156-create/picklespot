"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import TournamentForm from "@/components/admin/TournamentForm";

export default function EditTournamentPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/tournaments/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("대회를 찾을 수 없습니다."));
  }, [id]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-white/5 rounded" />
        <div className="h-96 bg-white/5 rounded-lg" />
      </div>
    );
  }

  return <TournamentForm initialData={data} tournamentId={id} />;
}
