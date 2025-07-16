import { games, type Game, type InsertGame } from "@shared/schema";

export interface IStorage {
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined>;
}

export class MemStorage implements IStorage {
  private games: Map<number, Game>;
  currentId: number;

  constructor() {
    this.games = new Map();
    this.currentId = 1;
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentId++;
    const game: Game = { 
      ...insertGame, 
      id,
      evaluation: insertGame.evaluation ?? null,
      bestMove: insertGame.bestMove ?? null
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updates: Partial<InsertGame>): Promise<Game | undefined> {
    const existingGame = this.games.get(id);
    if (!existingGame) return undefined;
    
    const updatedGame = { ...existingGame, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }
}

export const storage = new MemStorage();
