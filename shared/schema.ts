import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  position: jsonb("position").notNull(),
  currentPlayer: text("current_player").notNull(),
  gameMode: text("game_mode").notNull(),
  evaluation: integer("evaluation"),
  bestMove: text("best_move"),
});

export const insertGameSchema = createInsertSchema(games).pick({
  position: true,
  currentPlayer: true,
  gameMode: true,
  evaluation: true,
  bestMove: true,
});

export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Checkers-specific types
export type PieceType = 'red' | 'black' | 'red-king' | 'black-king' | null;

export type BoardPosition = {
  [key: string]: PieceType;
};

export type Move = {
  from: string;
  to: string;
  captures?: string[];
  promotion?: boolean;
};

export type GameState = {
  position: BoardPosition;
  currentPlayer: 'red' | 'black';
  mode: 'setup' | 'play';
  evaluation: number;
  bestMove: string | null;
  moveHistory: string[];
  legalMoves: Move[];
  rules: {
    forceTake: boolean;
    forceMultipleTakes: boolean;
  };
};

export type AnalysisResult = {
  evaluation: number;
  bestMove: Move | null;
  legalMoves: Move[];
  explanation: string;
  analysisTime?: number;
  nodesEvaluated?: number;
};
