import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeSampleData } from "./initData";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log(`Starting EchoDeed application in ${process.env.NODE_ENV || 'development'} mode...`);
    
    // Verify required environment variables for production
    if (process.env.NODE_ENV === 'production') {
      log('Checking required environment variables for production...');
      const requiredEnvVars = ['DATABASE_URL'];
      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      
      if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
      }
      log('✓ All required environment variables are present');
    }

    log('Registering routes and setting up server...');
    const server = await registerRoutes(app);
    log('✓ Routes registered successfully');
    
    // Initialize sample data if needed - with proper error handling
    log('Initializing sample data...');
    try {
      await initializeSampleData();
      log('✓ Sample data initialization completed');
    } catch (error) {
      log(`✗ Sample data initialization failed: ${error}`);
      // In production, sample data failure shouldn't crash the app
      if (process.env.NODE_ENV === 'production') {
        log('⚠ Continuing startup despite sample data failure in production mode');
      } else {
        throw error; // In development, we want to know about this
      }
    }

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log(`Error handling request: ${status} - ${message}`);
      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    log('Setting up static file serving...');
    if (app.get("env") === "development") {
      await setupVite(app, server);
      log('✓ Vite development server configured');
    } else {
      serveStatic(app);
      log('✓ Static file serving configured for production');
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    log(`Starting server on 0.0.0.0:${port}...`);
    
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`✓ EchoDeed application successfully started and serving on port ${port}`);
      log(`✓ Server is accessible at http://0.0.0.0:${port}`);
      log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      log(`✗ Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        log(`✗ Port ${port} is already in use. Please check if another instance is running.`);
      }
      process.exit(1);
    });

  } catch (error: any) {
    log(`✗ Fatal error during application startup: ${error.message}`);
    log('✗ Application failed to initialize. Exiting...');
    console.error('Startup error details:', error);
    process.exit(1);
  }
})();
