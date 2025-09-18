import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeSampleData } from "./initData";
import { initializeSampleRewardData } from "./sampleRewardData";
import { initializeMentorBadges } from "./mentorBadgeData";
import { initializeMentorTraining } from "./mentorTrainingData";
import { storage } from "./storage";
import { emailService } from "./services/emailService";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 🔄 AUTOMATED CONSENT REMINDER SCHEDULER - Burlington Policy Implementation
async function processConsentReminders() {
  try {
    log('🔄 Starting automated consent reminder check...');
    
    // Get all schools to scan their pending consent requests
    const schools = await storage.getCorporateAccounts(); // Returns CorporateAccount[] directly
    
    if (!Array.isArray(schools)) {
      log('❌ Expected schools to be an array, got:', typeof schools);
      return;
    }
    
    log(`📊 Found ${schools.length} schools to check for consent reminders`);
    
    for (const school of schools) {
      try {
        log(`🏫 Checking consent requests for school: ${school.companyName} (${school.id})`);
        
        // Get pending consent requests that need reminders or expiry processing
        const pendingRequests = await storage.listPendingConsentBySchool(school.id, {
          limit: 100 // Process up to 100 requests per school per run
        });
        
        if (pendingRequests.length === 0) {
          log(`✓ No pending consent requests for ${school.companyName}`);
          continue;
        }
        
        log(`📋 Found ${pendingRequests.length} pending consent requests for ${school.companyName}`);
        
        let remindersSent = 0;
        let expiredCount = 0;
        
        for (const request of pendingRequests) {
          const daysSinceRequest = request.daysSinceRequest;
          const reminderCount = request.reminderCount || 0;
          
          try {
            // Check if request should be expired (14+ days)
            if (daysSinceRequest >= 14) {
              log(`⏰ Expiring consent request ${request.id} - ${daysSinceRequest} days old`);
              
              await storage.updateParentalConsentStatus(request.id, 'expired');
              expiredCount++;
              
              // Optionally send expiry notification email
              try {
                const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
                await emailService.sendConsentDenialConfirmation({
                  parentEmail: request.parentEmail,
                  parentName: request.parentName,
                  studentFirstName: request.studentFirstName,
                  schoolName: school.companyName || 'School',
                  deniedAt: new Date()
                });
                log(`📧 Sent expiry notification to ${request.parentEmail}`);
              } catch (emailError) {
                log(`❌ Failed to send expiry notification for request ${request.id}: ${emailError}`);
              }
              
              continue;
            }
            
            // Check for 7-day reminder (7+ days old, only 1 reminder sent)
            if (daysSinceRequest >= 7 && reminderCount === 1) {
              log(`📧 Sending 7-day reminder for request ${request.id} to ${request.parentEmail}`);
              
              const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
              const emailSent = await emailService.sendConsentReminderEmail({
                parentEmail: request.parentEmail,
                parentName: request.parentName,
                studentFirstName: request.studentFirstName,
                schoolName: school.companyName || 'School',
                verificationCode: request.verificationCode,
                baseUrl: baseUrl,
                reminderType: '7day',
                daysSinceRequest: daysSinceRequest,
                expiresInDays: 14 - daysSinceRequest
              });
              
              if (emailSent) {
                await storage.markReminderSent(request.id, 'day7');
                remindersSent++;
                log(`✓ 7-day reminder sent successfully for request ${request.id}`);
              } else {
                log(`❌ Failed to send 7-day reminder for request ${request.id}`);
              }
            }
            // Check for 3-day reminder (3+ days old, no reminders sent yet)
            else if (daysSinceRequest >= 3 && reminderCount === 0) {
              log(`📧 Sending 3-day reminder for request ${request.id} to ${request.parentEmail}`);
              
              const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
              const emailSent = await emailService.sendConsentReminderEmail({
                parentEmail: request.parentEmail,
                parentName: request.parentName,
                studentFirstName: request.studentFirstName,
                schoolName: school.companyName || 'School',
                verificationCode: request.verificationCode,
                baseUrl: baseUrl,
                reminderType: '3day',
                daysSinceRequest: daysSinceRequest,
                expiresInDays: 14 - daysSinceRequest
              });
              
              if (emailSent) {
                await storage.markReminderSent(request.id, 'day3');
                remindersSent++;
                log(`✓ 3-day reminder sent successfully for request ${request.id}`);
              } else {
                log(`❌ Failed to send 3-day reminder for request ${request.id}`);
              }
            }
            
            // Small delay between processing requests to avoid overwhelming the email service
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (requestError) {
            log(`❌ Error processing consent request ${request.id}: ${requestError}`);
          }
        }
        
        log(`✓ Completed processing for ${school.companyName}: ${remindersSent} reminders sent, ${expiredCount} requests expired`);
        
        // Small delay between schools to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (schoolError) {
        log(`❌ Error processing school ${school.id}: ${schoolError}`);
      }
    }
    
    log('✓ Automated consent reminder check completed successfully');
    
  } catch (error) {
    log(`❌ Fatal error in automated consent reminder processing: ${error}`);
    
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      log(`❌ Error details: ${error.message}`);
      log(`❌ Error stack: ${error.stack}`);
    }
    
    // Ensure the scheduler doesn't crash the application
    log('⚠ Scheduler will continue running despite this error');
  }
}

function startAutomatedConsentReminderScheduler() {
  // Run immediately on startup (with a small delay to ensure everything is initialized)
  setTimeout(async () => {
    try {
      log('🚀 Running initial consent reminder check...');
      await processConsentReminders();
    } catch (error) {
      log(`❌ Error in initial consent reminder check: ${error}`);
    }
  }, 5000); // 5 second delay
  
  // Then run every 30 minutes
  const intervalMinutes = 30;
  const intervalMs = intervalMinutes * 60 * 1000;
  
  setInterval(async () => {
    try {
      log(`🔄 Running scheduled consent reminder check (every ${intervalMinutes} minutes)...`);
      await processConsentReminders();
    } catch (error) {
      log(`❌ Error in scheduled consent reminder check: ${error}`);
    }
  }, intervalMs);
  
  log(`✓ Consent reminder scheduler configured to run every ${intervalMinutes} minutes`);
}

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
      await initializeSampleRewardData();
      await storage.initializeEducationSubscriptionPlans();
      await initializeMentorBadges();
      await initializeMentorTraining();
      
      // Initialize curriculum lessons
      const { initializeCurriculumLessons } = await import('./curriculumLessonData');
      await initializeCurriculumLessons(storage);
      
      log('✓ Sample data initialization completed');

      // Initialize Summer Challenge Program
      log('Initializing Summer Challenge Program...');
      const { summerChallengeEngine } = await import('./services/summerChallengeEngine');
      await summerChallengeEngine.initializeSummerProgram();
      log('✓ Summer Challenge Program initialized');

      // Initialize Family Challenge Program
      log('Initializing Family Challenge Program...');
      const { familyChallengeEngine } = await import('./services/familyChallengeEngine');
      await familyChallengeEngine.initializeFamilyProgram();
      log('✓ Family Challenge Program initialized');
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
      
      // 🔄 Initialize automated reminder scheduler for parental consent
      log('🔄 Initializing automated consent reminder scheduler...');
      startAutomatedConsentReminderScheduler();
      log('✓ Automated consent reminder scheduler started');
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
