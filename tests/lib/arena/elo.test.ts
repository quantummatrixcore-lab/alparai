import { describe, expect, it } from "vitest";
import { emptyEntry, expectedScore, rankBoard, settleBout } from "@/lib/arena/elo";

describe("Arena Elo engine", () => {
  it("starts every model at 1500", () => {
    expect(emptyEntry("gpt-x").rating).toBe(1500);
  });
  it("favorite gains less than underdog would", () => {
    const fav = { ...emptyEntry("a"), rating: 1800 };
    const dog = { ...emptyEntry("b"), rating: 1400 };
    const r1 = settleBout(fav, dog);
    const r2 = settleBout(dog, fav);
    expect(r1.winner.rating - 1800).toBeLessThan(r2.winner.rating - 1400);
  });
  it("loser never gains rating on loss", () => {
    const a = emptyEntry("a");
    const b = emptyEntry("b");
    const r = settleBout(a, b);
    expect(r.loser.rating).toBeLessThanOrEqual(1500);
    expect(r.winner.rating).toBeGreaterThanOrEqual(1500);
  });
  it("ranks by rating desc", () => {
    const board = rankBoard([
      { ...emptyEntry("low"), rating: 1400 },
      { ...emptyEntry("high"), rating: 1700 },
    ]);
    expect(board[0]?.model_slug).toBe("high");
  });
  it("expected score favors higher rating", () => {
    expect(expectedScore(1600, 1400)).toBeGreaterThan(0.5);
  });
});
