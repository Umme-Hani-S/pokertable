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
  console.log('comparePasswords - Supplied password length:', supplied.length);
  console.log('comparePasswords - Stored hash:', stored.substring(0, 15) + '...');
  
  // Check if stored password is valid hash format
  if (!stored || !stored.includes('.')) {
    console.error('comparePasswords - Invalid stored password format');
    return false;
  }
  
  try {
    const [hashed, salt] = stored.split(".");
    console.log('comparePasswords - Parsed salt:', salt);
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    const result = timingSafeEqual(hashedBuf, suppliedBuf);
    console.log('comparePasswords - Result:', result);
    return result;
  } catch (error) {
    console.error('comparePasswords - Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'poker-club-manager-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport authentication strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt: username=${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`User not found: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        
        console.log(`User found: ${user.username}, now checking password`);
        const isValid = await comparePasswords(password, user.password);
        console.log(`Password validation result: ${isValid}`);
        
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create user with hashed password
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log(`Login API called with body:`, req.body);
    passport.authenticate("local", (err: Error, user: SchemaUser, info: any) => {
      if (err) {
        console.error('Authentication error:', err);
        return next(err);
      }
      if (!user) {
        console.log(`Authentication failed: ${info?.message}`);
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      
      console.log(`Authentication successful for user: ${user.username}`);
      req.login(user, (err) => {
        if (err) {
          console.error('Session login error:', err);
          return next(err);
        }
        console.log(`User session created successfully`);
        // Don't send the password in the response
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

// Middleware to check if user has required role
export function hasRole(role: string | string[]) {
  const roles = Array.isArray(role) ? role : [role];
  
  return (req: Request, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    next();
  };
}

// Middleware to check if user has access to a club (admin, club owner, or dealer assigned to the club)
export function hasClubAccess(req: Request, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = req.user;
  const clubId = parseInt(req.params.clubId || req.params.id);
  
  if (!user) {
    return res.status(403).json({ message: "Access denied" });
  }
  
  // Admin has access to everything
  if (user.role === 'admin') {
    return next();
  }
  
  // Club owner - check if they own the club
  if (user.role === 'club_owner') {
    // This would need to be implemented to check if the user owns the club
    // For now, allow club owners to access all clubs
    return next();
  }
  
  // Dealer - check if they're assigned to the club
  if (user.role === 'dealer') {
    // This would need to be implemented to check if the dealer is assigned to the club
    // For now, allow dealers to access all clubs
    return next();
  }
  
  res.status(403).json({ message: "Access denied" });
}