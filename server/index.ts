import express, { Request, Response, NextFunction } from "express";
import { log, setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./simple-routes";

// Create Express app
const app = express();
app.use(express.json());

// Handle all errors
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  log(`Error: ${err.message}`);
  console.error(err);
  res.status(statusCode).json({
    error: { message: err.message, stack: process.env.NODE_ENV === "development" ? err.stack : undefined }
  });
});

// Utility to run the server
async function runServer() {
  try {
    // Register API routes
    const server = await registerRoutes(app);
    
    // Setup Vite if in development
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      // Serve static files in production
      serveStatic(app);
    }

    // Start the server
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Initialize database and start server
try {
  runServer();
} catch (error) {
  console.error("Server initialization error:", error);
  process.exit(1);
}