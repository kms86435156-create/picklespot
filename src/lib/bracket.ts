export function generateBracket(tournamentId: string, participants: any[]) {
  // 1. Shuffle participants randomly
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  const n = shuffled.length;
  if (n === 0) return [];

  // 2. Next power of 2
  const p = Math.pow(2, Math.ceil(Math.log2(n)));
  const byes = p - n;

  // 3. Create a padded array. To distribute byes, we can just insert them at specific intervals or just at the end.
  // For a true MVP, just put BYEs at the end, or alternate.
  // We want to avoid two BYEs playing each other. Since byes < p/2, we can put one BYE in the second slot of the first 'byes' matches.
  
  const padded: any[] = new Array(p).fill(null);
  let playerIdx = 0;
  
  for (let i = 0; i < p / 2; i++) {
    // Every match gets at least one player
    padded[i * 2] = shuffled[playerIdx++];
    // If we still need to assign BYEs, we leave the second slot null. Otherwise, assign a player.
    if (i < byes) {
      padded[i * 2 + 1] = null; // BYE
    } else {
      padded[i * 2 + 1] = shuffled[playerIdx++];
    }
  }

  const matches: any[] = [];
  let totalRounds = Math.log2(p);
  if (totalRounds === 0) totalRounds = 1; // if 1 player

  let matchIdCounter = 1;
  let previousRoundMatches: any[] = [];

  // Create matches round by round
  for (let round = 1; round <= totalRounds; round++) {
    const numMatches = p / Math.pow(2, round);
    const currentRoundMatches = [];

    for (let i = 0; i < numMatches; i++) {
      const matchId = `match_${Date.now()}_${matchIdCounter++}`;
      
      let p1: { id: string | null; name: string } | null = null;
      let p2: { id: string | null; name: string } | null = null;
      let winnerId: string | null = null;

      if (round === 1) {
        const player1 = padded[i * 2];
        const player2 = padded[i * 2 + 1];
        p1 = { id: player1?.userId || player1?.id || null, name: player1?.userName || player1?.name || "BYE" };
        p2 = { id: player2?.userId || player2?.id || null, name: player2?.userName || player2?.name || "BYE" };
        
        // Auto-advance if there's a BYE
        if (!p1.id) winnerId = p2.id;
        else if (!p2.id) winnerId = p1.id;
      }

      const match = {
        id: matchId,
        tournament_id: tournamentId,
        round,
        match_index: i,
        player1_id: p1?.id || null,
        player1_name: p1?.name || null,
        player2_id: p2?.id || null,
        player2_name: p2?.name || null,
        winner_id: winnerId,
        next_match_id: null, // Will be set in the next iteration
      };

      currentRoundMatches.push(match);
      matches.push(match);
    }

    // Link previous round's next_match_id to current round matches
    if (round > 1) {
      for (let j = 0; j < previousRoundMatches.length; j++) {
        const prevMatch = previousRoundMatches[j];
        const nextMatch = currentRoundMatches[Math.floor(j / 2)];
        prevMatch.next_match_id = nextMatch.id;
        
        // If the previous match was automatically won (BYE), propagate the winner to this match
        if (prevMatch.winner_id) {
          const isPlayer1 = j % 2 === 0;
          const winnerName = prevMatch.winner_id === prevMatch.player1_id ? prevMatch.player1_name : prevMatch.player2_name;
          if (isPlayer1) {
            nextMatch.player1_id = prevMatch.winner_id;
            nextMatch.player1_name = winnerName;
          } else {
            nextMatch.player2_id = prevMatch.winner_id;
            nextMatch.player2_name = winnerName;
          }
          
          // Check auto-advance again if this match also happens to be resolved
          if (nextMatch.player1_id && nextMatch.player2_name === "BYE") nextMatch.winner_id = nextMatch.player1_id;
          if (nextMatch.player2_id && nextMatch.player1_name === "BYE") nextMatch.winner_id = nextMatch.player2_id;
        }
      }
    }

    previousRoundMatches = currentRoundMatches;
  }

  return matches;
}
