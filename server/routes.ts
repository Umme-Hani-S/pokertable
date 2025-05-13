import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertPlayerSchema, insertTableSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all players
  app.get("/api/players", async (req: Request, res: Response) => {
    try {
      const players = await storage.getPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });
  
  // Get players by status
  app.get("/api/players/status/:status", async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      const players = await storage.getPlayersByStatus(status);
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players by status" });
    }
  });
  
  // Create a new player
  app.post("/api/players", async (req: Request, res: Response) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid player data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create player" });
      }
    }
  });
  
  // Update a player
  app.patch("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const playerData = req.body;
      const player = await storage.updatePlayer(Number(id), playerData);
      
      if (!player) {
        res.status(404).json({ message: "Player not found" });
        return;
      }
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to update player" });
    }
  });
  
  // Delete a player
  app.delete("/api/players/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePlayer(Number(id));
      
      if (!success) {
        res.status(404).json({ message: "Player not found" });
        return;
      }
      
      res.json({ message: "Player deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete player" });
    }
  });
  
  // Get all table seats
  app.get("/api/seats", async (req: Request, res: Response) => {
    try {
      const seats = await storage.getSeats();
      res.json(seats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seats" });
    }
  });
  
  // Assign player to seat
  app.post("/api/seats/:seatId/assign/:playerId", async (req: Request, res: Response) => {
    try {
      const { seatId, playerId } = req.params;
      const success = await storage.assignPlayerToSeat(Number(playerId), Number(seatId));
      
      if (!success) {
        res.status(400).json({ message: "Failed to assign player to seat" });
        return;
      }
      
      res.json({ message: "Player assigned to seat successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign player to seat" });
    }
  });
  
  // Remove player from seat
  app.post("/api/seats/:seatId/remove", async (req: Request, res: Response) => {
    try {
      const { seatId } = req.params;
      const success = await storage.removePlayerFromSeat(Number(seatId));
      
      if (!success) {
        res.status(400).json({ message: "No player assigned to this seat" });
        return;
      }
      
      res.json({ message: "Player removed from seat successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove player from seat" });
    }
  });
  
  // Get current table session
  app.get("/api/sessions/current", async (req: Request, res: Response) => {
    try {
      const session = await storage.getCurrentSession();
      
      if (!session) {
        res.status(404).json({ message: "No active session found" });
        return;
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch current session" });
    }
  });
  
  // Create a new table session
  app.post("/api/sessions", async (req: Request, res: Response) => {
    try {
      const sessionData = insertTableSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });
  
  // End the current session
  app.post("/api/sessions/current/end", async (req: Request, res: Response) => {
    try {
      const currentSession = await storage.getCurrentSession();
      
      if (!currentSession) {
        res.status(404).json({ message: "No active session found" });
        return;
      }
      
      const session = await storage.endSession(currentSession.id);
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to end session" });
    }
  });
  
  // Update player time elapsed
  app.post("/api/players/:id/time", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { timeElapsed } = req.body;
      
      if (typeof timeElapsed !== 'number') {
        res.status(400).json({ message: "Invalid time elapsed value" });
        return;
      }
      
      const player = await storage.updatePlayer(Number(id), { timeElapsed });
      
      if (!player) {
        res.status(404).json({ message: "Player not found" });
        return;
      }
      
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to update player time" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
