import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SchemaUser } from "../shared/schema";

declare global {
  namespace Express {
    interface User extends SchemaUser {}
    
    interface Request {
      user?: SchemaUser;
    }
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'poker-time-tracking-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for username/password login
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        if (!user.isActive) {
          return done(null, false, { message: 'Account is inactive' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Serialization and deserialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if user exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const { password, ...userData } = req.body;
      
      // Create new user
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(password),
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SchemaUser, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}

// Middleware for checking authentication
export function isAuthenticated(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware for checking role
export function hasRole(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];
  
  return (req: Request, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
}

// Middleware to check if user has access to a club (either admin, club owner, or dealer belonging to the club)
export function hasClubAccess(req: Request, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const clubId = parseInt(req.params.clubId);
  const user = req.user!;
  
  // Admin has access to all clubs
  if (user.role === 'admin') {
    return next();
  }
  
  // For club owners, check if they own the club
  if (user.role === 'club_owner') {
    storage.getClubById(clubId).then(club => {
      if (!club || club.ownerId !== user.id) {
        return res.status(403).json({ message: "You don't have access to this club" });
      }
      next();
    }).catch(err => next(err));
    return;
  }
  
  // For dealers, check if they belong to the club owner
  if (user.role === 'dealer' && user.clubOwnerId) {
    storage.getClubById(clubId).then(club => {
      if (!club || club.ownerId !== user.clubOwnerId) {
        return res.status(403).json({ message: "You don't have access to this club" });
      }
      next();
    }).catch(err => next(err));
    return;
  }
  
  return res.status(403).json({ message: "Insufficient permissions" });
}