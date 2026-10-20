import "server-only";

// IN6 — Kırmızı Takım Ligi: Elo tabanlı güvenlik ligi motoru.
// Her model 1500 puanla başlar; jailbreak/yanıltma test sonucu kazananın
// puanı artar, kaybedenin düşer. K=32 standart satranç sabiti.

export const ARENA_BASE_RATING = 1500;
export const ARENA_K_FACTOR = 32;

export interface ArenaEntry {
  model_slug: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  bouts: number;
}

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function settleBout(
  winner: ArenaEntry,
  loser: ArenaEntry,
  draw = false,
): { winner: ArenaEntry; loser: ArenaEntry } {
  const expW = expectedScore(winner.rating, loser.rating);
  const expL = expectedScore(loser.rating, winner.rating);
  const scoreW = draw ? 0.5 : 1;
  const scoreL = draw ? 0.5 : 0;
  return {
    winner: {
      ...winner,
      rating: Math.round(winner.rating + ARENA_K_FACTOR * (scoreW - expW)),
      wins: winner.wins + (draw ? 0 : 1),
      draws: winner.draws + (draw ? 1 : 0),
      bouts: winner.bouts + 1,
    },
    loser: {
      ...loser,
      rating: Math.round(loser.rating + ARENA_K_FACTOR * (scoreL - expL)),
      losses: loser.losses + (draw ? 0 : 1),
      draws: loser.draws + (draw ? 1 : 0),
      bouts: loser.bouts + 1,
    },
  };
}

export function rankBoard(entries: ArenaEntry[]): ArenaEntry[] {
  return [...entries].sort((a, b) => b.rating - a.rating || b.wins - a.wins);
}

export function emptyEntry(model_slug: string): ArenaEntry {
  return { model_slug, rating: ARENA_BASE_RATING, wins: 0, losses: 0, draws: 0, bouts: 0 };
}
