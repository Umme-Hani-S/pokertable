import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SeatStatus } from "../shared/types";

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
  
  // Create a new player
  app.post("/api/players", async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: "Valid player name is required" });
      }
      const player = await storage.createPlayer(name);
      res.status(201).json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to create player" });
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
  
  // Update seat status
  app.patch("/api/seats/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, playerId } = req.body;
      
      // Validate status
      if (!status || !['Open', 'Playing', 'Break', 'Blocked', 'Closed'].includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status. Must be one of: Open, Playing, Break, Blocked, Closed" 
        });
      }
      
      // For 'Playing' status, a playerId is required
      if (status === 'Playing' && !playerId) {
        return res.status(400).json({ message: "Player ID is required for 'Playing' status" });
      }
      
      const seat = await storage.updateSeatStatus(
        Number(id), 
        status as SeatStatus, 
        playerId ? Number(playerId) : undefined
      );
      
      if (!seat) {
        return res.status(404).json({ message: "Seat not found" });
      }
      
      res.json(seat);
    } catch (error) {
      res.status(500).json({ message: "Failed to update seat" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}