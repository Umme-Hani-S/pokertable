import { Express, Request, Response } from "express";
import { Server, createServer } from "http";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up authentication routes
  setupAuth(app);

  // Just a test route for now
  app.get("/api/test", (req, res) => {
    res.json({ message: "API working" });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}