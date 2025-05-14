import { Express, Request, Response, NextFunction } from "express";
import { Server, createServer } from "http";
import { setupAuth, isAuthenticated, hasRole, hasClubAccess, hashPassword } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema, insertClubSchema, insertTableSchema, insertPlayerSchema } from "../shared/schema";

// Define seat status enum directly here to avoid import issues
const SeatStatus = {
  Open: 'Open',
  Playing: 'Playing',
  Break: 'Break',
  Blocked: 'Blocked',
  Closed: 'Closed'
} as const;

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up authentication routes
  setupAuth(app);

  // Common error handler
  const handleError = (res: Response, error: any) => {
    console.error("API Error:", error);
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";
    res.status(statusCode).json({ error: message });
  };

  // ======= USER ROUTES =======
  
  // Get all users (admin only)
  app.get("/api/users", hasRole("admin"), async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json(usersWithoutPasswords);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get user by ID (admin or self)
  app.get("/api/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Allow users to access their own data, or admins to access any user data
      if (req.user!.id !== userId && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Admin create dealer for club owner
  app.post("/api/users/dealer", hasRole(["admin", "club_owner"]), async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Club owner can only create dealers for their own clubs
      if (req.user!.role === "club_owner") {
        userData.role = "dealer";
        userData.clubOwnerId = req.user!.id;
      }
      
      const createUserSchema = insertUserSchema.extend({
        confirmPassword: z.string(),
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
      
      const validData = createUserSchema.parse(userData);
      const { confirmPassword, ...userDataToSave } = validData;
      
      const existingUser = await storage.getUserByUsername(userDataToSave.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const user = await storage.createUser(userDataToSave);
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // ======= CLUB ROUTES =======
  
  // Get all clubs (admin only)
  app.get("/api/clubs", hasRole("admin"), async (req: Request, res: Response) => {
    try {
      const clubs = await storage.getClubs();
      res.json(clubs);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get clubs for logged in user (club owner or dealer)
  app.get("/api/my-clubs", isAuthenticated, async (req: Request, res: Response) => {
    try {
      let clubs = [];
      
      if (req.user!.role === "admin") {
        clubs = await storage.getClubs();
      } else if (req.user!.role === "club_owner") {
        clubs = await storage.getClubsByOwnerId(req.user!.id);
      } else if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
        const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
        if (clubOwner) {
          clubs = await storage.getClubsByOwnerId(clubOwner.id);
        }
      }
      
      res.json(clubs);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get club by ID
  app.get("/api/clubs/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.id);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Check if user has access to this club
      if (req.user!.role !== "admin") {
        if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      res.json(club);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create a new club (club owner or admin)
  app.post("/api/clubs", hasRole(["admin", "club_owner"]), async (req: Request, res: Response) => {
    try {
      const clubData = insertClubSchema.parse(req.body);
      
      // If club owner is creating, set owner ID to their ID
      if (req.user!.role === "club_owner") {
        clubData.ownerId = req.user!.id;
        
        // Check license limit
        const userClubs = await storage.getClubsByOwnerId(req.user!.id);
        if (userClubs.length >= 5) { // Assuming 5 is the limit for now
          return res.status(403).json({ error: "License limit reached. Cannot create more clubs." });
        }
      }
      
      const club = await storage.createClub(clubData);
      res.status(201).json(club);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Update a club (club owner or admin)
  app.put("/api/clubs/:id", hasRole(["admin", "club_owner"]), async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.id);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Club owners can only update their own clubs
      if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const clubData = insertClubSchema.partial().parse(req.body);
      
      // Club owner cannot change ownership
      if (req.user!.role === "club_owner") {
        delete clubData.ownerId;
      }
      
      const updatedClub = await storage.updateClub(clubId, clubData);
      res.json(updatedClub);
    } catch (error) {
      handleError(res, error);
    }
  });

  // ======= TABLE ROUTES =======
  
  // Get tables for a club
  app.get("/api/clubs/:clubId/tables", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      const tables = await storage.getTablesByClubId(clubId);
      res.json(tables);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create a table for a club
  app.post("/api/clubs/:clubId/tables", hasRole(["admin", "club_owner"]), async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Club owners can only add tables to their own clubs
      if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const tableData = insertTableSchema.parse({
        ...req.body,
        clubId
      });
      
      const table = await storage.createTable(tableData);
      
      // Create seats for the table based on maxSeats
      const seatPromises = [];
      for (let i = 1; i <= table.maxSeats; i++) {
        seatPromises.push(storage.createSeat({
          tableId: table.id,
          position: i,
          status: "Closed" as any, // Start with closed seats
          playerId: null,
          sessionId: null
        }));
      }
      await Promise.all(seatPromises);
      
      res.status(201).json(table);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get a specific table
  app.get("/api/tables/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const tableId = parseInt(req.params.id);
      const table = await storage.getTableById(tableId);
      
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        const club = await storage.getClubById(table.clubId);
        
        if (req.user!.role === "club_owner" && club?.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club?.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      res.json(table);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Update a table
  app.put("/api/tables/:id", hasRole(["admin", "club_owner"]), async (req: Request, res: Response) => {
    try {
      const tableId = parseInt(req.params.id);
      const table = await storage.getTableById(tableId);
      
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      // Club owners can only update tables in their clubs
      if (req.user!.role === "club_owner") {
        const club = await storage.getClubById(table.clubId);
        if (club?.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }
      
      const tableData = insertTableSchema.partial().parse(req.body);
      
      // Don't allow changing clubId
      delete tableData.clubId;
      
      const updatedTable = await storage.updateTable(tableId, tableData);
      res.json(updatedTable);
    } catch (error) {
      handleError(res, error);
    }
  });

  // ======= PLAYER ROUTES =======
  
  // Get players for a club
  app.get("/api/clubs/:clubId/players", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      const players = await storage.getPlayersByClubId(clubId);
      res.json(players);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create a player for a club
  app.post("/api/clubs/:clubId/players", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      const club = await storage.getClubById(clubId);
      
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      const playerData = insertPlayerSchema.parse({
        ...req.body,
        clubId
      });
      
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Get a specific player
  app.get("/api/players/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.id);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        const club = await storage.getClubById(player.clubId);
        
        if (req.user!.role === "club_owner" && club?.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club?.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      res.json(player);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Update a player
  app.put("/api/players/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const playerId = parseInt(req.params.id);
      const player = await storage.getPlayer(playerId);
      
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        const club = await storage.getClubById(player.clubId);
        
        if (req.user!.role === "club_owner" && club?.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club?.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      const playerData = insertPlayerSchema.partial().parse(req.body);
      
      // Don't allow changing clubId
      delete playerData.clubId;
      
      const updatedPlayer = await storage.updatePlayer(playerId, playerData);
      res.json(updatedPlayer);
    } catch (error) {
      handleError(res, error);
    }
  });

  // ======= TABLE SEAT ROUTES =======
  
  // Get seats for a table
  app.get("/api/tables/:tableId/seats", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const tableId = parseInt(req.params.tableId);
      const table = await storage.getTableById(tableId);
      
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        const club = await storage.getClubById(table.clubId);
        
        if (req.user!.role === "club_owner" && club?.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club?.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      const seats = await storage.getSeatsByTableId(tableId);
      res.json(seats);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Update a seat status
  app.patch("/api/seats/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const seatId = parseInt(req.params.id);
      const seat = await storage.getSeat(seatId);
      
      if (!seat) {
        return res.status(404).json({ error: "Seat not found" });
      }
      
      // Check if user has access
      if (req.user!.role !== "admin") {
        const table = await storage.getTableById(seat.tableId);
        if (!table) {
          return res.status(404).json({ error: "Table not found" });
        }
        
        const club = await storage.getClubById(table.clubId);
        
        if (req.user!.role === "club_owner" && club?.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club?.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      const { status, playerId, sessionId } = req.body;
      
      // Validate status
      if (!Object.values(SeatStatus).includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const updatedSeat = await storage.updateSeatStatus(
        seatId, 
        status, 
        playerId !== undefined ? playerId : undefined,
        sessionId !== undefined ? sessionId : undefined
      );
      
      res.json(updatedSeat);
    } catch (error) {
      handleError(res, error);
    }
  });

  // ======= CLUB USER MANAGEMENT ROUTES =======
  
  // Get users for a specific club
  app.get("/api/clubs/:clubId/users", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      // Get the club to check if user has access
      const club = await storage.getClubById(clubId);
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Admin can see all users, club owners can see users in their clubs
      if (req.user!.role !== "admin") {
        if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Access denied" });
        }
        
        if (req.user!.role === "dealer" && req.user!.clubOwnerId) {
          const clubOwner = await storage.getUserById(req.user!.clubOwnerId);
          if (!clubOwner || clubOwner.id !== club.ownerId) {
            return res.status(403).json({ error: "Access denied" });
          }
        }
      }
      
      // Get all users associated with this club
      // - Club owner
      // - Dealers with clubOwnerId set to the club owner
      const clubUsers = [];
      
      // Add club owner
      const clubOwner = await storage.getUserById(club.ownerId);
      if (clubOwner) {
        const { password, ...ownerWithoutPassword } = clubOwner;
        clubUsers.push(ownerWithoutPassword);
      }
      
      // Add dealers
      const allUsers = await storage.getUsers();
      const clubDealers = allUsers.filter(user => 
        user.role === "dealer" && user.clubOwnerId === club.ownerId
      );
      
      clubDealers.forEach(dealer => {
        const { password, ...dealerWithoutPassword } = dealer;
        clubUsers.push(dealerWithoutPassword);
      });
      
      res.json(clubUsers);
    } catch (error) {
      handleError(res, error);
    }
  });
  
  // Create a new user for a club
  app.post("/api/clubs/:clubId/users", hasRole(["admin", "club_owner"]), async (req: Request, res: Response) => {
    try {
      const clubId = parseInt(req.params.clubId);
      
      // Get the club to check if user has access
      const club = await storage.getClubById(clubId);
      if (!club) {
        return res.status(404).json({ error: "Club not found" });
      }
      
      // Club owners can only add users to their own clubs
      if (req.user!.role === "club_owner" && club.ownerId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { username, email, password, fullName, role } = req.body;
      
      // Validate inputs
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Username, email, and password are required" });
      }
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create the user
      const userData = {
        username,
        email,
        password: hashedPassword,
        fullName: fullName || "",
        role: role || "dealer",
        // If club owner is creating, set clubOwnerId to the club owner
        clubOwnerId: req.user!.role === "club_owner" ? req.user!.id : club.ownerId
      };
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      handleError(res, error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}