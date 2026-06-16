"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";

export default function BracketViewer({ matches, onSetWinner, isAdmin = false }: { matches: any[], onSetWinner?: (matchId: string, winnerId: string) => void, isAdmin?: boolean }) {
  // Group matches by round
  const rounds = useMemo(() => {
    const map = new Map<number, any[]>();
    matches.forEach(m => {
      if (!map.has(m.round)) map.set(m.round, []);
      map.get(m.round)!.push(m);
    });
    const sortedRounds = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedRounds.map(r => ({ round: r, matches: map.get(r)! }));
  }, [matches]);

  if (!matches || matches.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="flex gap-8 min-w-max px-2">
        {rounds.map((roundObj, rIdx) => (
          <div key={roundObj.round} className="flex flex-col gap-4">
            <h3 className="text-center text-sm font-bold text-brand-cyan mb-2">
              {rIdx === rounds.length - 1 ? "결승" : rIdx === rounds.length - 2 ? "준결승" : `${roundObj.matches.length * 2}강`}
            </h3>
            
            <div className="flex flex-col justify-around flex-1" style={{ gap: `${Math.pow(2, rIdx) * 1}rem` }}>
              {roundObj.matches.map((m: any) => (
                <div key={m.id} className="w-48 bg-ui-dark border border-ui-border rounded-lg overflow-hidden shrink-0">
                  <div className="text-[10px] text-text-muted text-center py-1 bg-dark/50 border-b border-ui-border">
                    Match {m.matchIndex + 1}
                  </div>
                  
                  {/* Player 1 */}
                  <button
                    disabled={!isAdmin || m.winnerId !== null || m.player1Name === "BYE" || m.player2Name === "BYE" || !m.player1Id || !m.player2Id}
                    onClick={() => onSetWinner && onSetWinner(m.id, m.player1Id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors
                      ${m.winnerId === m.player1Id ? "bg-brand-cyan/20 text-brand-cyan font-bold" : "text-text-main hover:bg-white/5"}
                      ${isAdmin && !m.winnerId && m.player1Id && m.player2Id && m.player1Name !== "BYE" && m.player2Name !== "BYE" ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <span className="truncate">{m.player1Name || "(미정)"}</span>
                    {m.winnerId === m.player1Id && <Check className="w-3 h-3 text-brand-cyan" />}
                  </button>
                  
                  <div className="h-px bg-ui-border w-full" />
                  
                  {/* Player 2 */}
                  <button
                    disabled={!isAdmin || m.winnerId !== null || m.player1Name === "BYE" || m.player2Name === "BYE" || !m.player1Id || !m.player2Id}
                    onClick={() => onSetWinner && onSetWinner(m.id, m.player2Id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors
                      ${m.winnerId === m.player2Id ? "bg-brand-cyan/20 text-brand-cyan font-bold" : "text-text-main hover:bg-white/5"}
                      ${isAdmin && !m.winnerId && m.player1Id && m.player2Id && m.player1Name !== "BYE" && m.player2Name !== "BYE" ? "cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <span className="truncate">{m.player2Name || "(미정)"}</span>
                    {m.winnerId === m.player2Id && <Check className="w-3 h-3 text-brand-cyan" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
