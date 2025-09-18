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

// 🔄 ANNUAL CONSENT RENEWAL SCHEDULER - Burlington Policy Implementation  
async function processConsentRenewals() {
  try {
    log('🔄 Starting automated consent renewal processing...');
    
    // Get all schools for renewal processing
    const schools = await storage.getCorporateAccounts();
    
    if (!Array.isArray(schools)) {
      log('❌ Expected schools to be an array for renewal processing, got:', typeof schools);
      return;
    }
    
    log(`📊 Found ${schools.length} schools to check for consent renewals`);
    
    // Burlington specific: Focus on middle schools (grades 6-8)
    const burlingtonGrades = ['6', '7', '8'];
    
    // Calculate key dates for Burlington school year (Aug 1 - Jul 31)
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // School year end (Jul 31)
    let schoolYearEnd = new Date(currentYear, 6, 31); // Jul 31 current year
    if (now > schoolYearEnd) {
      schoolYearEnd = new Date(currentYear + 1, 6, 31); // Jul 31 next year
    }
    
    // Key renewal dates
    const renewalStart75Days = new Date(schoolYearEnd);
    renewalStart75Days.setDate(schoolYearEnd.getDate() - 75); // May 18
    
    const renewalReminder45Days = new Date(schoolYearEnd);
    renewalReminder45Days.setDate(schoolYearEnd.getDate() - 45);
    
    const renewalReminder14Days = new Date(schoolYearEnd);
    renewalReminder14Days.setDate(schoolYearEnd.getDate() - 14);
    
    const renewalReminder7Days = new Date(schoolYearEnd);
    renewalReminder7Days.setDate(schoolYearEnd.getDate() - 7);
    
    const renewalReminder1Day = new Date(schoolYearEnd);
    renewalReminder1Day.setDate(schoolYearEnd.getDate() - 1);
    
    let totalRenewalsCreated = 0;
    let totalRemindersDebt = 0;
    let totalExpiredProcessed = 0;
    
    for (const school of schools) {
      try {
        log(`🏫 Processing consent renewals for school: ${school.companyName} (${school.id})`);
        
        // 1️⃣ CREATE NEW RENEWAL REQUESTS (75 days before expiry)
        if (now >= renewalStart75Days && now < schoolYearEnd) {
          log(`📅 Creating renewal requests for ${school.companyName} (renewal window open)`);
          
          // Find approved consents expiring at end of school year for grades 6-8
          const expiringConsents = await storage.listExpiringConsentsBySchool(
            school.id,
            schoolYearEnd,
            schoolYearEnd,
            burlingtonGrades
          );
          
          log(`📋 Found ${expiringConsents.length} consents expiring for renewal`);
          
          for (const consent of expiringConsents) {
            try {
              // Check if renewal already exists
              const existingRenewal = await storage.getConsentRecordsForSchool(school.id, {
                status: 'pending'
              });
              
              const hasExistingRenewal = existingRenewal.some(r => 
                r.supersedesConsentId === consent.id && r.renewalStatus
              );
              
              if (!hasExistingRenewal) {
                const { nanoid } = await import('nanoid');
                const renewalCode = nanoid(32);
                
                // Create parent contact snapshot
                const parentSnapshot = {
                  parentName: consent.parentName,
                  parentEmail: consent.parentEmail,
                  capturedAt: new Date().toISOString(),
                  schoolYear: `${currentYear}-${currentYear + 1}`,
                  originalConsentId: consent.id
                };
                
                // Create renewal request
                const renewalRequest = await storage.createRenewalRequestFromConsent(
                  consent.id,
                  parentSnapshot,
                  renewalCode
                );
                
                // Send initial renewal email
                try {
                  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
                  const emailSent = await emailService.sendConsentRenewalEmail({
                    parentEmail: consent.parentEmail,
                    parentName: consent.parentName,
                    studentFirstName: consent.studentFirstName,
                    schoolName: school.companyName || 'School',
                    verificationCode: renewalCode,
                    baseUrl: baseUrl,
                    renewalYear: `${currentYear + 1}-${currentYear + 2}`,
                    expiryDate: schoolYearEnd
                  });
                  
                  if (emailSent) {
                    log(`📧 Sent renewal email to ${consent.parentEmail} for student ${consent.studentFirstName}`);
                    totalRenewalsCreated++;
                  }
                } catch (emailError) {
                  log(`❌ Failed to send renewal email for consent ${consent.id}: ${emailError}`);
                }
              }
            } catch (renewalError) {
              log(`❌ Error creating renewal for consent ${consent.id}: ${renewalError}`);
            }
          }
        }
        
        // 2️⃣ SEND RENEWAL REMINDERS with 24h cooldown
        const pendingRenewals = await storage.listRenewalsDashboard(school.id, {
          status: 'pending'
        });
        
        log(`📋 Found ${pendingRenewals.renewals.length} pending renewals for reminder processing`);
        
        for (const renewal of pendingRenewals.renewals) {
          try {
            const daysUntilExpiry = renewal.daysUntilExpiry;
            
            // Check reminder metadata for 24h cooldown
            const lastReminderData = renewal.signatureMetadata || {};
            const lastReminderTime = lastReminderData.last_reminder_sent;
            const lastReminderDate = lastReminderTime ? new Date(lastReminderTime) : null;
            
            // 24h cooldown check
            const canSendReminder = !lastReminderDate || 
              (new Date().getTime() - lastReminderDate.getTime()) > (24 * 60 * 60 * 1000);
            
            if (!canSendReminder) {
              continue; // Skip if within 24h cooldown
            }
            
            let shouldSendReminder = false;
            let reminderType = '';
            
            // Burlington reminder cadence: D-45, D-14, D-7, D-1
            if (daysUntilExpiry <= 45 && daysUntilExpiry > 14 && !lastReminderData.reminder_45_sent) {
              shouldSendReminder = true;
              reminderType = '45day';
            } else if (daysUntilExpiry <= 14 && daysUntilExpiry > 7 && !lastReminderData.reminder_14_sent) {
              shouldSendReminder = true;
              reminderType = '14day';
            } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 1 && !lastReminderData.reminder_7_sent) {
              shouldSendReminder = true;
              reminderType = '7day';
            } else if (daysUntilExpiry <= 1 && daysUntilExpiry >= 0 && !lastReminderData.reminder_1_sent) {
              shouldSendReminder = true;
              reminderType = '1day';
            }
            
            if (shouldSendReminder) {
              const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
              const emailSent = await emailService.sendRenewalReminderEmail({
                parentEmail: renewal.parentEmail,
                parentName: renewal.parentName,
                studentFirstName: renewal.studentFirstName,
                schoolName: school.companyName || 'School',
                verificationCode: renewal.renewalVerificationCode,
                baseUrl: baseUrl,
                reminderType: reminderType,
                daysUntilExpiry: daysUntilExpiry,
                expiryDate: schoolYearEnd
              });
              
              if (emailSent) {
                await storage.markRenewalReminderSent(renewal.id, reminderType);
                totalRemindersDebt++;
                log(`📧 Sent ${reminderType} renewal reminder to ${renewal.parentEmail}`);
              }
            }
            
          } catch (reminderError) {
            log(`❌ Error processing renewal reminder for ${renewal.id}: ${reminderError}`);
          }
        }
        
        // 3️⃣ HANDLE EXPIRED RENEWALS & AUTO-RESTRICT ACCOUNTS
        if (now >= schoolYearEnd) {
          // Aug 1 - process overdue renewals
          const overdueRenewals = await storage.listRenewalsDashboard(school.id, {
            status: 'pending'
          });
          
          for (const overdue of overdueRenewals.renewals) {
            if (overdue.daysUntilExpiry < 0) { // Past expiry
              try {
                // Mark as overdue
                await storage.setRenewalStatus(overdue.id, 'overdue');
                
                // Restrict student account features
                const studentAccount = await storage.getStudentAccount(overdue.studentAccountId);
                if (studentAccount) {
                  await storage.updateStudentParentalConsent(overdue.studentAccountId, {
                    status: 'limited',
                    method: 'auto_restriction',
                    parentEmail: overdue.parentEmail,
                    ipAddress: 'system'
                  });
                  
                  log(`🔒 Restricted student account ${overdue.studentAccountId} due to expired consent`);
                  totalExpiredProcessed++;
                }
              } catch (restrictError) {
                log(`❌ Error restricting account for overdue renewal ${overdue.id}: ${restrictError}`);
              }
            }
          }
        }
        
        log(`✓ Completed renewal processing for ${school.companyName}`);
        
        // Small delay between schools
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (schoolError) {
        log(`❌ Error processing renewals for school ${school.id}: ${schoolError}`);
      }
    }
    
    log(`✓ Consent renewal processing completed: ${totalRenewalsCreated} renewals created, ${totalRemindersDebt} reminders sent, ${totalExpiredProcessed} accounts restricted`);
    
  } catch (error) {
    log(`❌ Fatal error in consent renewal processing: ${error}`);
    
    if (error instanceof Error) {
      log(`❌ Renewal error details: ${error.message}`);
      log(`❌ Renewal error stack: ${error.stack}`);
    }
    
    log('⚠ Renewal scheduler will continue running despite this error');
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

function startAutomatedConsentRenewalScheduler() {
  // Run immediately on startup with longer delay for complex processing
  setTimeout(async () => {
    try {
      log('🚀 Running initial consent renewal processing...');
      await processConsentRenewals();
    } catch (error) {
      log(`❌ Error in initial consent renewal processing: ${error}`);
    }
  }, 10000); // 10 second delay for renewal processing
  
  // Run daily at 6 AM for renewal processing
  const dailyIntervalMs = 24 * 60 * 60 * 1000; // 24 hours
  
  setInterval(async () => {
    try {
      log('🔄 Running daily consent renewal processing...');
      await processConsentRenewals();
    } catch (error) {
      log(`❌ Error in daily consent renewal processing: ${error}`);
    }
  }, dailyIntervalMs);
  
  log('✓ Consent renewal scheduler configured to run daily');
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
      
      // 🛡️ PRODUCTION SAFETY: Initialize BCA demo consent data only in demo/dev mode
      const isProduction = process.env.NODE_ENV === 'production';
      const isDemoModeEnabled = process.env.DEMO_MODE === 'true';
      
      if (!isProduction || isDemoModeEnabled) {
        log('Initializing BCA demo consent data...');
        const demoResult = await storage.initializeBCADemoData();
        if (demoResult.success) {
          log(`✓ BCA demo data: ${demoResult.message}`);
        } else {
          log(`⚠ BCA demo data initialization: ${demoResult.message}`);
        }
      } else {
        log('🚫 Skipping BCA demo data initialization in production mode (set DEMO_MODE=true to enable)');
      }
      
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
      
      // 🔄 Initialize automated renewal scheduler for Burlington policy
      log('🔄 Initializing automated consent renewal scheduler...');
      startAutomatedConsentRenewalScheduler();
      log('✓ Automated consent renewal scheduler started');
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
