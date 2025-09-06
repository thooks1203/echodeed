import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertKindnessPostSchema, insertCorporateAccountSchema, insertCorporateTeamSchema, insertCorporateEmployeeSchema, insertCorporateChallengeSchema } from "@shared/schema";
import { contentFilter } from "./services/contentFilter";
import { aiAnalytics } from "./services/aiAnalytics";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth middleware - Set up before routes
  await setupAuth(app);

  // Auth routes - Get current user info
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast to all connected clients
  function broadcast(message: any) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Get kindness counter
  app.get("/api/counter", async (req, res) => {
    try {
      const counter = await storage.getCounter();
      res.json(counter);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get kindness posts with optional filters
  app.get("/api/posts", async (req, res) => {
    try {
      const { category, city, state, country } = req.query;
      const filters = {
        category: category as string,
        city: city as string, 
        state: state as string,
        country: country as string,
      };
      
      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (!filters[key as keyof typeof filters]) {
          delete filters[key as keyof typeof filters];
        }
      });
      
      const posts = await storage.getPosts(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new kindness post - Protected route
  app.post("/api/posts", isAuthenticated, async (req: any, res) => {
    try {
      const postData = insertKindnessPostSchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      // Content filtering
      const contentValidation = contentFilter.isContentAppropriate(postData.content);
      if (!contentValidation.isValid) {
        return res.status(400).json({ message: contentValidation.reason });
      }
      
      // Create post with user ID
      const post = await storage.createPost({ ...postData, userId });
      
      // Increment counter and award tokens
      const counter = await storage.incrementCounter();
      
      // Ensure user has tokens record and award posting tokens
      let userTokens = await storage.getUserTokens(userId);
      if (!userTokens) {
        userTokens = await storage.createUserTokens({ userId });
      }
      await storage.updateUserTokens(userId, { 
        echoBalance: userTokens.echoBalance + 5,
        totalEarned: userTokens.totalEarned + 5 
      });
      
      // Broadcast new post and counter to all WebSocket clients
      broadcast({
        type: 'NEW_POST',
        post: post,
      });
      
      broadcast({
        type: 'COUNTER_UPDATE',
        counter: counter,
      });
      
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add heart to post
  app.post('/api/posts/:postId/heart', isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const sessionId = req.headers['x-session-id'] as string;
      const userId = req.user.claims.sub;
      const updatedPost = await storage.addHeartToPost(postId, sessionId);
      
      // Award tokens for hearting a post (1 token)
      let userTokens = await storage.getUserTokens(userId);
      if (!userTokens) {
        userTokens = await storage.createUserTokens({ userId });
      }
      await storage.updateUserTokens(userId, { 
        echoBalance: userTokens.echoBalance + 1,
        totalEarned: userTokens.totalEarned + 1 
      });
      
      // Broadcast the update to all connected WebSocket clients
      broadcast({
        type: 'POST_UPDATE',
        post: updatedPost,
      });
      
      res.json(updatedPost);
    } catch (error: any) {
      if (error.message === 'Post not found') {
        res.status(404).json({ message: 'Post not found' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Add echo to post  
  app.post('/api/posts/:postId/echo', isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const sessionId = req.headers['x-session-id'] as string;
      const userId = req.user.claims.sub;
      const updatedPost = await storage.addEchoToPost(postId, sessionId);
      
      // Award tokens for echoing a post (2 tokens - higher reward for commitment)
      let userTokens = await storage.getUserTokens(userId);
      if (!userTokens) {
        userTokens = await storage.createUserTokens({ userId });
      }
      await storage.updateUserTokens(userId, { 
        echoBalance: userTokens.echoBalance + 2,
        totalEarned: userTokens.totalEarned + 2 
      });
      
      // Broadcast the update to all connected WebSocket clients
      broadcast({
        type: 'POST_UPDATE',
        post: updatedPost,
      });
      
      res.json(updatedPost);
    } catch (error: any) {
      if (error.message === 'Post not found') {
        res.status(404).json({ message: 'Post not found' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Get user tokens - Protected route  
  app.get('/api/tokens', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let userTokens = await storage.getUserTokens(userId);
      
      if (!userTokens) {
        userTokens = await storage.createUserTokens({ userId, echoBalance: 0, totalEarned: 0 });
      }
      
      res.json(userTokens);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Corporate Admin Routes - Protected
  app.get('/api/corporate/account', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const account = await storage.getCorporateAccount(employee.corporateAccountId);
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/api/corporate/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const teams = await storage.getCorporateTeams(employee.corporateAccountId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/api/corporate/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const { days } = req.query;
      const analytics = await storage.getCorporateAnalytics(
        employee.corporateAccountId, 
        days ? parseInt(days as string) : 30
      );
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get('/api/corporate/employee', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      res.json(employee || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wellness Analytics Routes - Protected
  app.get('/api/corporate/engagement-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const metrics = await storage.getEmployeeEngagementMetrics(employee.corporateAccountId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/corporate/team-metrics/:teamId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const { teamId } = req.params;
      const metrics = await storage.getTeamWellnessMetrics(teamId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/corporate/wellness-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const insights = await storage.generateWellnessInsights(employee.corporateAccountId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/corporate/employee-wellness/:employeeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      // Only allow access if user is admin or requesting their own data
      const { employeeId } = req.params;
      const isAdmin = employee.role === 'hr_admin' || employee.role === 'corporate_admin';
      
      if (!isAdmin && employeeId !== userId) {
        return res.status(403).json({ message: 'Forbidden: Cannot access other employee data' });
      }
      
      const wellnessScore = await storage.calculateEmployeeWellnessScore(employeeId);
      res.json({ employeeId, wellnessScore });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Company Insights Routes - Admin Only
  app.get('/api/corporate/company-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const isAdmin = employee.role === 'hr_admin' || employee.role === 'corporate_admin';
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      const { days } = req.query;
      const metrics = await storage.getCompanyKindnessMetrics(
        employee.corporateAccountId, 
        days ? parseInt(days as string) : 30
      );
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/corporate/departmental-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const isAdmin = employee.role === 'hr_admin' || employee.role === 'corporate_admin';
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      const insights = await storage.getDepartmentalInsights(employee.corporateAccountId);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/corporate/benchmarks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employee = await storage.getCorporateEmployee(userId);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found in corporate account' });
      }
      
      const isAdmin = employee.role === 'hr_admin' || employee.role === 'corporate_admin';
      if (!isAdmin) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
      }
      
      const benchmarks = await storage.getCompanyBenchmarks(employee.corporateAccountId);
      res.json(benchmarks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get brand challenges
  app.get('/api/challenges', async (req, res) => {
    try {
      const challenges = await storage.getChallenges({ isActive: true });
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Complete a brand challenge
  app.post('/api/challenges/:challengeId/complete', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }

      const result = await storage.completeChallenge(challengeId, sessionId);
      
      // Broadcast challenge completion
      broadcast({
        type: 'CHALLENGE_COMPLETED',
        challenge: result.challenge,
      });
      
      res.json(result);
    } catch (error: any) {
      if (error.message === 'Challenge not found') {
        res.status(404).json({ message: 'Challenge not found' });
      } else if (error.message === 'Challenge already completed') {
        res.status(400).json({ message: 'Challenge already completed' });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

  // Get user's completed challenges - Protected route
  app.get('/api/challenges/completed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const completedChallenges = await storage.getCompletedChallenges(userId);
      res.json(completedChallenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all achievements
  app.get('/api/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's unlocked achievements
  app.get('/api/achievements/user', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }
      
      const userAchievements = await storage.getUserAchievements(sessionId);
      res.json(userAchievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Check for new achievements (called when user performs actions)
  app.post('/api/achievements/check', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }
      
      const newAchievements = await storage.checkAndUnlockAchievements(sessionId);
      
      // Broadcast new achievements to WebSocket clients
      if (newAchievements.length > 0) {
        broadcast({
          type: 'ACHIEVEMENTS_UNLOCKED',
          achievements: newAchievements,
          sessionId
        });
      }
      
      res.json(newAchievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== B2B SaaS Corporate API Routes ====================

  // Corporate Account Management
  app.get('/api/corporate/accounts', async (req, res) => {
    try {
      const accounts = await storage.getCorporateAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/corporate/accounts', async (req, res) => {
    try {
      const accountData = insertCorporateAccountSchema.parse(req.body);
      const account = await storage.createCorporateAccount(accountData);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/corporate/accounts/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const account = await storage.getCorporateAccount(accountId);
      if (!account) {
        return res.status(404).json({ message: 'Corporate account not found' });
      }
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put('/api/corporate/accounts/:accountId', async (req, res) => {
    try {
      const { accountId } = req.params;
      const updates = req.body;
      const account = await storage.updateCorporateAccount(accountId, updates);
      res.json(account);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Corporate Team Management
  app.get('/api/corporate/accounts/:accountId/teams', async (req, res) => {
    try {
      const { accountId } = req.params;
      const teams = await storage.getCorporateTeams(accountId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/corporate/accounts/:accountId/teams', async (req, res) => {
    try {
      const { accountId } = req.params;
      const teamData = insertCorporateTeamSchema.parse({
        ...req.body,
        corporateAccountId: accountId
      });
      const team = await storage.createCorporateTeam(teamData);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put('/api/corporate/teams/:teamId', async (req, res) => {
    try {
      const { teamId } = req.params;
      const updates = req.body;
      const team = await storage.updateCorporateTeam(teamId, updates);
      res.json(team);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete('/api/corporate/teams/:teamId', async (req, res) => {
    try {
      const { teamId } = req.params;
      const deleted = await storage.deleteCorporateTeam(teamId);
      if (!deleted) {
        return res.status(404).json({ message: 'Team not found' });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Corporate Employee Management
  app.get('/api/corporate/accounts/:accountId/employees', async (req, res) => {
    try {
      const { accountId } = req.params;
      const employees = await storage.getCorporateEmployees(accountId);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/corporate/employees/enroll', async (req, res) => {
    try {
      const employeeData = insertCorporateEmployeeSchema.parse(req.body);
      const employee = await storage.enrollCorporateEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/corporate/employees/me', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }
      
      const employee = await storage.getCorporateEmployee(sessionId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      res.json(employee);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put('/api/corporate/employees/:employeeId', async (req, res) => {
    try {
      const { employeeId } = req.params;
      const updates = req.body;
      const employee = await storage.updateCorporateEmployee(employeeId, updates);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Corporate Challenge Management
  app.get('/api/corporate/accounts/:accountId/challenges', async (req, res) => {
    try {
      const { accountId } = req.params;
      const challenges = await storage.getCorporateChallenges(accountId);
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/corporate/accounts/:accountId/challenges', async (req, res) => {
    try {
      const { accountId } = req.params;
      const challengeData = insertCorporateChallengeSchema.parse({
        ...req.body,
        corporateAccountId: accountId
      });
      const challenge = await storage.createCorporateChallenge(challengeData);
      res.status(201).json(challenge);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/corporate/challenges/:challengeId/complete', async (req, res) => {
    try {
      const { challengeId } = req.params;
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }
      
      const result = await storage.completeCorporateChallenge(challengeId, sessionId);
      
      // Broadcast challenge completion
      broadcast({
        type: 'CORPORATE_CHALLENGE_COMPLETED',
        challenge: result.challenge,
        sessionId
      });
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Corporate Analytics & Reporting
  app.get('/api/corporate/accounts/:accountId/analytics', async (req, res) => {
    try {
      const { accountId } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      const analytics = await storage.getCorporateAnalytics(accountId, days);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export Corporate Analytics (CSV format)
  app.get('/api/corporate/accounts/:accountId/analytics/export', async (req, res) => {
    try {
      const { accountId } = req.params;
      const { format = 'csv', period = '30' } = req.query;
      const days = parseInt(period as string);
      
      // Get comprehensive export data
      const [account, analytics, teams, employees, challenges] = await Promise.all([
        storage.getCorporateAccount(accountId),
        storage.getCorporateAnalytics(accountId, days),
        storage.getCorporateTeams(accountId),
        storage.getCorporateEmployees(accountId),
        storage.getCorporateChallenges(accountId)
      ]);
      
      if (!account) {
        return res.status(404).json({ message: 'Corporate account not found' });
      }
      
      const exportData = {
        companyInfo: {
          companyName: account.companyName,
          domain: account.domain,
          industry: account.industry,
          subscriptionTier: account.subscriptionTier,
          exportDate: new Date().toISOString(),
          reportPeriod: `Last ${days} days`
        },
        summary: {
          totalEmployees: employees.length,
          activeTeams: teams.filter(t => t.isActive === 1).length,
          totalChallenges: challenges.length,
          activeChallenges: challenges.filter(c => c.isActive === 1).length,
          totalChallengeCompletions: challenges.reduce((sum, c) => sum + (c.completionCount || 0), 0)
        },
        analytics,
        teams: teams.map(team => ({
          teamName: team.teamName,
          department: team.department,
          currentSize: team.currentSize,
          targetSize: team.targetSize,
          monthlyKindnessGoal: team.monthlyKindnessGoal,
          goalProgress: team.targetSize ? ((team.currentSize || 0) / team.targetSize * 100).toFixed(1) + '%' : 'N/A'
        })),
        challenges: challenges.map(challenge => ({
          title: challenge.title,
          challengeType: challenge.challengeType,
          completionCount: challenge.completionCount,
          currentParticipation: challenge.currentParticipation,
          echoReward: challenge.echoReward,
          participationRate: employees.length > 0 ? ((challenge.currentParticipation || 0) / employees.length * 100).toFixed(1) + '%' : '0%'
        }))
      };
      
      if (format === 'csv') {
        // Generate CSV content
        let csvContent = `# ${account.companyName} Wellness Analytics Export\n`;
        csvContent += `# Generated: ${new Date().toLocaleString()}\n`;
        csvContent += `# Period: ${exportData.companyInfo.reportPeriod}\n\n`;
        
        // Company Summary
        csvContent += `## Company Summary\n`;
        csvContent += `Metric,Value\n`;
        csvContent += `Company Name,${exportData.companyInfo.companyName}\n`;
        csvContent += `Industry,${exportData.companyInfo.industry}\n`;
        csvContent += `Subscription Tier,${exportData.companyInfo.subscriptionTier}\n`;
        csvContent += `Total Employees,${exportData.summary.totalEmployees}\n`;
        csvContent += `Active Teams,${exportData.summary.activeTeams}\n`;
        csvContent += `Total Challenges,${exportData.summary.totalChallenges}\n`;
        csvContent += `Challenge Completions,${exportData.summary.totalChallengeCompletions}\n\n`;
        
        // Analytics Data
        if (analytics.length > 0) {
          csvContent += `## Daily Analytics\n`;
          csvContent += `Date,Active Employees,Kindness Posts,Challenges Completed,ECHO Tokens Earned,Engagement Score,Wellness Score\n`;
          analytics.forEach(day => {
            csvContent += `${day.analyticsDate},${day.activeEmployees},${day.totalKindnessPosts},${day.totalChallengesCompleted},${day.totalEchoTokensEarned},${day.averageEngagementScore}%,${day.wellnessImpactScore}%\n`;
          });
          csvContent += '\n';
        }
        
        // Team Performance
        if (exportData.teams.length > 0) {
          csvContent += `## Team Performance\n`;
          csvContent += `Team Name,Department,Current Size,Target Size,Goal Progress,Monthly Kindness Goal\n`;
          exportData.teams.forEach(team => {
            csvContent += `${team.teamName},${team.department || 'N/A'},${team.currentSize || 0},${team.targetSize || 0},${team.goalProgress},${team.monthlyKindnessGoal || 0}\n`;
          });
          csvContent += '\n';
        }
        
        // Challenge Performance
        if (exportData.challenges.length > 0) {
          csvContent += `## Challenge Performance\n`;
          csvContent += `Challenge Title,Type,Completions,Current Participation,Participation Rate,ECHO Reward\n`;
          exportData.challenges.forEach(challenge => {
            csvContent += `${challenge.title},${challenge.challengeType},${challenge.completionCount || 0},${challenge.currentParticipation || 0},${challenge.participationRate},${challenge.echoReward}\n`;
          });
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${account.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_wellness_report_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
      } else {
        // Return JSON format (for PDF generation on frontend)
        res.json(exportData);
      }
      
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/corporate/accounts/:accountId/analytics/generate', async (req, res) => {
    try {
      const { accountId } = req.params;
      const analytics = await storage.generateDailyCorporateAnalytics(accountId);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Corporate Dashboard Summary
  app.get('/api/corporate/accounts/:accountId/dashboard', async (req, res) => {
    try {
      const { accountId } = req.params;
      
      // Handle demo data
      if (accountId === 'demo') {
        // Initialize sample corporate data if needed
        await storage.initializeSampleCorporateData();
        
        // Get all accounts and find TechFlow Solutions
        const allAccounts = await storage.getCorporateAccounts();
        const demoAccount = allAccounts.find(acc => acc.domain === 'techflow.com');
        
        if (demoAccount) {
          const [teams, employees, challenges, analytics] = await Promise.all([
            storage.getCorporateTeams(demoAccount.id),
            storage.getCorporateEmployees(demoAccount.id),
            storage.getCorporateChallenges(demoAccount.id),
            storage.getCorporateAnalytics(demoAccount.id, 7)
          ]);
          
          const totalEmployees = employees.length;
          const activeTeams = teams.filter(t => t.isActive === 1).length;
          const activeChallenges = challenges.filter(c => c.isActive === 1).length;
          const totalChallengeCompletions = challenges.reduce((sum, c) => sum + (c.completionCount || 0), 0);
          
          const latestAnalytics = analytics[analytics.length - 1];
          const totalTokensEarned = latestAnalytics?.totalEchoTokensEarned || 12450;
          const engagementScore = latestAnalytics?.averageEngagementScore || 78;
          const wellnessScore = latestAnalytics?.wellnessImpactScore || 85;
          
          const dashboardData = {
            account: demoAccount,
            overview: {
              totalEmployees,
              activeTeams,
              activeChallenges,
              totalChallengeCompletions,
              totalTokensEarned,
              engagementScore,
              wellnessScore
            },
            teams,
            employees: employees.slice(0, 10),
            recentChallenges: challenges.slice(0, 5),
            analytics: analytics.slice(-7)
          };
          
          return res.json(dashboardData);
        }
      }
      
      // Fetch comprehensive dashboard data
      const [account, teams, employees, challenges, analytics] = await Promise.all([
        storage.getCorporateAccount(accountId),
        storage.getCorporateTeams(accountId),
        storage.getCorporateEmployees(accountId),
        storage.getCorporateChallenges(accountId),
        storage.getCorporateAnalytics(accountId, 7) // Last 7 days
      ]);
      
      if (!account) {
        return res.status(404).json({ message: 'Corporate account not found' });
      }
      
      // Calculate summary metrics
      const totalEmployees = employees.length;
      const activeTeams = teams.filter(t => t.isActive === 1).length;
      const activeChallenges = challenges.filter(c => c.isActive === 1).length;
      const totalChallengeCompletions = challenges.reduce((sum, c) => sum + (c.completionCount || 0), 0);
      
      // Get latest analytics
      const latestAnalytics = analytics[analytics.length - 1];
      const totalTokensEarned = latestAnalytics?.totalEchoTokensEarned || 0;
      const engagementScore = latestAnalytics?.averageEngagementScore || 0;
      const wellnessScore = latestAnalytics?.wellnessImpactScore || 0;
      
      const dashboardData = {
        account,
        overview: {
          totalEmployees,
          activeTeams,
          activeChallenges,
          totalChallengeCompletions,
          totalTokensEarned,
          engagementScore,
          wellnessScore
        },
        teams,
        employees: employees.slice(0, 10), // Top 10 employees
        recentChallenges: challenges.slice(0, 5), // 5 most recent
        analytics: analytics.slice(-7) // Last 7 days
      };
      
      res.json(dashboardData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Challenge Templates for Corporate Wellness Programs
  app.get('/api/corporate/challenge-templates', async (req, res) => {
    try {
      const templates = [
        {
          id: 'wellness-week',
          category: 'Health & Wellness',
          title: 'Wellness Week Challenge',
          description: 'Promote healthy habits across your organization',
          content: 'Share a photo or story of your healthy choice today - whether it\'s taking the stairs, eating a nutritious meal, taking a walk, or practicing mindfulness. Let\'s inspire each other to prioritize wellness!',
          challengeType: 'company_wide',
          suggestedDuration: 7,
          echoReward: 25,
          participationGoal: 75,
          icon: '💪',
          color: '#10B981'
        },
        {
          id: 'team-appreciation',
          category: 'Team Building',
          title: 'Team Appreciation Challenge',
          description: 'Foster gratitude and recognition within teams',
          content: 'Recognize a colleague today! Share how a team member helped you, inspired you, or made your day better. Tag them if comfortable. Building a culture of appreciation strengthens our entire organization.',
          challengeType: 'team_specific',
          suggestedDuration: 14,
          echoReward: 30,
          participationGoal: 85,
          icon: '🙏',
          color: '#8B5CF6'
        },
        {
          id: 'community-impact',
          category: 'Community Service',
          title: 'Community Impact Week',
          description: 'Make a difference in your local community',
          content: 'Volunteer, donate, or perform a kind act for someone in your community. Share your story to inspire others. Together, we can amplify our positive impact beyond our workplace.',
          challengeType: 'company_wide',
          suggestedDuration: 7,
          echoReward: 50,
          participationGoal: 60,
          icon: '🌍',
          color: '#06B6D4'
        },
        {
          id: 'mindful-monday',
          category: 'Mental Health',
          title: 'Mindful Monday',
          description: 'Start each week with intentional mindfulness',
          content: 'Begin your Monday with a mindful moment. Whether it\'s meditation, deep breathing, gratitude journaling, or simply enjoying your morning coffee mindfully. Share what grounds you each week.',
          challengeType: 'recurring_weekly',
          suggestedDuration: 4,
          echoReward: 20,
          participationGoal: 70,
          icon: '🧘',
          color: '#84CC16'
        },
        {
          id: 'innovation-friday',
          category: 'Innovation & Creativity',
          title: 'Innovation Friday',
          description: 'Share creative ideas and process improvements',
          content: 'Share one small innovation, creative idea, or process improvement you implemented this week. It could be a work hack, a new approach, or helping a colleague solve a problem creatively.',
          challengeType: 'department_wide',
          suggestedDuration: 4,
          echoReward: 35,
          participationGoal: 50,
          icon: '💡',
          color: '#F59E0B'
        },
        {
          id: 'sustainability-challenge',
          category: 'Environmental',
          title: 'Green Impact Challenge',
          description: 'Promote environmental consciousness',
          content: 'Share one eco-friendly action you took today - recycling, using public transport, reducing waste, or choosing sustainable options. Small actions create big environmental impact.',
          challengeType: 'company_wide',
          suggestedDuration: 10,
          echoReward: 25,
          participationGoal: 65,
          icon: '🌱',
          color: '#059669'
        },
        {
          id: 'learning-together',
          category: 'Professional Development',
          title: 'Learning & Growth Challenge',
          description: 'Foster continuous learning and knowledge sharing',
          content: 'Share something new you learned this week or teach others a skill/insight. Could be from a course, article, podcast, or experience. Knowledge shared is knowledge multiplied.',
          challengeType: 'company_wide',
          suggestedDuration: 14,
          echoReward: 40,
          participationGoal: 60,
          icon: '📚',
          color: '#7C3AED'
        },
        {
          id: 'random-acts',
          category: 'General Kindness',
          title: 'Random Acts of Kindness',
          description: 'Classic kindness challenge for everyday acts',
          content: 'Perform and share a random act of kindness. It could be helping a stranger, supporting a colleague, or brightening someone\'s day. Every act of kindness creates ripples of positivity.',
          challengeType: 'company_wide',
          suggestedDuration: 7,
          echoReward: 20,
          participationGoal: 80,
          icon: '❤️',
          color: '#EF4444'
        }
      ];
      
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create challenge from template
  app.post('/api/corporate/accounts/:accountId/challenges/from-template', async (req, res) => {
    try {
      const { accountId } = req.params;
      const { templateId, customizations } = req.body;
      
      // Get the template (simplified - in real app would validate template exists)
      const templates = [
        // Template data would be stored in database, but for demo using inline data
        {
          id: 'wellness-week',
          title: 'Wellness Week Challenge',
          content: 'Share a photo or story of your healthy choice today - whether it\'s taking the stairs, eating a nutritious meal, taking a walk, or practicing mindfulness. Let\'s inspire each other to prioritize wellness!',
          challengeType: 'company_wide',
          echoReward: 25
        }
        // ... other templates
      ];
      
      const template = templates.find(t => t.id === templateId) || templates[0];
      
      // Create challenge with template data + customizations
      const challengeData = {
        title: customizations?.title || template.title,
        content: customizations?.content || template.content,
        challengeType: customizations?.challengeType || template.challengeType,
        echoReward: customizations?.echoReward || template.echoReward,
        participationGoal: customizations?.participationGoal || null,
        startsAt: customizations?.startsAt ? new Date(customizations.startsAt) : new Date(),
        expiresAt: customizations?.expiresAt ? new Date(customizations.expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
      
      const challenge = await storage.createCorporateChallenge({
        ...challengeData,
        corporateAccountId: accountId,
        isInternal: 1,
        isActive: 1
      });
      
      res.status(201).json({
        challenge,
        message: `Challenge "${challenge.title}" created successfully from template`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // AI Analytics Endpoints
  app.get('/api/ai/wellness-insights', async (req, res) => {
    try {
      const insights = await storage.getCommunityWellnessInsights();
      res.json(insights);
    } catch (error: any) {
      console.error('Error getting wellness insights:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Predictive Wellness Endpoints
  app.get('/api/ai/wellness-alerts', async (req, res) => {
    try {
      // Mock predictive wellness alerts for demonstration
      const mockAlerts = [
        {
          id: '1',
          type: 'risk_detected',
          severity: 'high',
          employeeId: 'emp_001',
          title: 'Wellness Risk Detected: Employee Support Needed',
          description: 'AI analysis indicates an employee may experience a decline in wellness. Current score: 65, predicted: 45.',
          recommendations: [
            'Schedule wellness check-in',
            'Assign wellness buddy', 
            'Reduce workload temporarily',
            'Offer mental health resources'
          ],
          predictedOutcome: 'Prevent potential burnout',
          confidence: 87,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'intervention_needed',
          severity: 'medium',
          teamId: 'team_eng',
          title: 'Team Wellness Declining: Engineering Team',
          description: 'The Engineering team shows a 15% decline in predicted wellness. 4 employees may need support.',
          recommendations: [
            'Schedule team building activities',
            'Implement peer recognition program',
            'Consider workload redistribution', 
            'Launch team-specific kindness challenges'
          ],
          predictedOutcome: 'Improved team cohesion and individual wellness',
          confidence: 78,
          createdAt: new Date().toISOString()
        }
      ];
      
      res.json(mockAlerts);
    } catch (error: any) {
      console.error('Error getting wellness alerts:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/ai/kindness-prescription', async (req, res) => {
    try {
      // Mock personalized kindness prescription
      const mockPrescription = {
        employeeId: 'current_user',
        prescriptionType: 'individual',
        suggestedActions: [
          { action: 'Send appreciation messages to 3 colleagues', impact: 25, effort: 'low', timeframe: 'This week' },
          { action: 'Practice daily gratitude journaling', impact: 15, effort: 'low', timeframe: 'Daily for 2 weeks' },
          { action: 'Share a kindness story in team meeting', impact: 20, effort: 'low', timeframe: 'Next meeting' }
        ],
        personalizedMessage: 'Based on your wellness patterns, here are some personalized kindness activities that could boost your well-being by 15% over the next week.',
        expectedOutcome: 'Gradual wellness improvement expected (20% boost in well-being)'
      };
      
      res.json(mockPrescription);
    } catch (error: any) {
      console.error('Error getting kindness prescription:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/ai/posts', async (req, res) => {
    try {
      const posts = await storage.getPostsWithAIAnalysis();
      res.json(posts);
    } catch (error: any) {
      console.error('Error getting AI-analyzed posts:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Manually trigger AI analysis for a specific post
  app.post('/api/ai/analyze/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const posts = await storage.getKindnessPosts();
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      const analysis = await aiAnalytics.analyzeKindnessPost(post.content);
      const updatedPost = await storage.updatePostWithAIAnalysis(postId, analysis);
      
      // Broadcast the analyzed post
      broadcast({
        type: 'POST_ANALYZED',
        post: updatedPost,
      });
      
      res.json(updatedPost);
    } catch (error: any) {
      console.error('Error analyzing post:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rewards System API Endpoints
  
  // Reward Partners
  app.get('/api/rewards/partners', async (req, res) => {
    try {
      const { isActive, partnerType } = req.query;
      const partners = await storage.getRewardPartners({
        isActive: isActive ? (isActive === 'true') : undefined,
        partnerType: partnerType as string
      });
      res.json(partners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/rewards/partners', isAuthenticated, async (req, res) => {
    try {
      const partner = await storage.createRewardPartner(req.body);
      res.status(201).json(partner);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reward Offers
  app.get('/api/rewards/offers', async (req, res) => {
    try {
      const { partnerId, isActive, offerType, badgeRequirement } = req.query;
      const offers = await storage.getRewardOffers({
        partnerId: partnerId as string,
        isActive: isActive ? (isActive === 'true') : undefined,
        offerType: offerType as string,
        badgeRequirement: badgeRequirement as string
      });
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/rewards/offers', isAuthenticated, async (req, res) => {
    try {
      const offer = await storage.createRewardOffer(req.body);
      res.status(201).json(offer);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reward Redemptions
  app.post('/api/rewards/redeem', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { offerId, partnerId, echoSpent } = req.body;

      // Check if user has enough tokens
      const userTokens = await storage.getUserTokens(userId);
      if (!userTokens || userTokens.echoTokens < echoSpent) {
        return res.status(400).json({ message: 'Insufficient $ECHO tokens' });
      }

      // Deduct tokens from user
      await storage.updateUserTokens(userId, {
        echoTokens: userTokens.echoTokens - echoSpent
      });

      // Create redemption
      const redemption = await storage.redeemReward({
        userId,
        offerId,
        partnerId,
        echoSpent,
        status: 'pending',
        verificationRequired: req.body.verificationRequired || 0,
        verificationStatus: req.body.verificationRequired ? 'pending' : 'none',
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined
      });

      // Generate discount code (simplified - in real app would integrate with partner API)
      const discountCode = `ECHO${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await storage.updateRedemptionStatus(redemption.id, 'active', discountCode);

      res.status(201).json({
        ...redemption,
        redemptionCode: discountCode,
        status: 'active'
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/rewards/my-redemptions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const redemptions = await storage.getUserRedemptions(userId);
      res.json(redemptions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/rewards/redemptions/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, code } = req.body;
      
      const updatedRedemption = await storage.updateRedemptionStatus(id, status, code);
      if (!updatedRedemption) {
        return res.status(404).json({ message: 'Redemption not found' });
      }
      
      res.json(updatedRedemption);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Kindness Verification System
  app.post('/api/verification/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const verification = await storage.submitKindnessVerification({
        ...req.body,
        userId,
        status: 'pending'
      });
      
      res.status(201).json(verification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/verification/my-submissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const verifications = await storage.getKindnessVerifications({ userId });
      res.json(verifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/verification/pending', isAuthenticated, async (req, res) => {
    try {
      // In production, would check if user has admin permissions
      const verifications = await storage.getKindnessVerifications({ status: 'pending' });
      res.json(verifications);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/verification/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { bonusEcho } = req.body;
      const reviewerId = req.user.claims.sub;
      
      const verification = await storage.approveKindnessVerification(id, reviewerId, bonusEcho);
      if (!verification) {
        return res.status(404).json({ message: 'Verification not found' });
      }
      
      res.json(verification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch('/api/verification/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const reviewerId = req.user.claims.sub;
      
      const verification = await storage.rejectKindnessVerification(id, reviewerId, notes);
      if (!verification) {
        return res.status(404).json({ message: 'Verification not found' });
      }
      
      res.json(verification);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Badge Rewards
  app.get('/api/rewards/badge-rewards', async (req, res) => {
    try {
      const rewards = await storage.getBadgeRewards();
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/rewards/badge-rewards', isAuthenticated, async (req, res) => {
    try {
      const reward = await storage.createBadgeReward(req.body);
      res.status(201).json(reward);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Sample Data Population (Development Only)
  app.post('/api/rewards/populate-sample-data', async (req, res) => {
    try {
      // Create sample partners
      const partners = await Promise.all([
        storage.createRewardPartner({
          partnerName: "Starbucks",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png",
          partnerType: "food",
          websiteUrl: "https://starbucks.com",
          description: "America's favorite coffee destination with premium beverages and food",
          isActive: 1,
          isFeatured: 1,
          minRedemptionAmount: 100,
          maxRedemptionAmount: 2000,
          contactEmail: "partners@starbucks.com"
        }),
        storage.createRewardPartner({
          partnerName: "Amazon",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1200px-Amazon_logo.svg.png",
          partnerType: "retail",
          websiteUrl: "https://amazon.com",
          description: "Everything you need, delivered fast with exclusive EchoDeed™ member discounts",
          isActive: 1,
          isFeatured: 1,
          minRedemptionAmount: 200,
          maxRedemptionAmount: 5000,
          contactEmail: "corporate@amazon.com"
        }),
        storage.createRewardPartner({
          partnerName: "Nike",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Logo_NIKE.svg/1200px-Logo_NIKE.svg.png",
          partnerType: "wellness",
          websiteUrl: "https://nike.com",
          description: "Premium athletic gear and wellness products to support your active lifestyle",
          isActive: 1,
          isFeatured: 1,
          minRedemptionAmount: 300,
          maxRedemptionAmount: 3000,
          contactEmail: "corporate@nike.com"
        }),
        storage.createRewardPartner({
          partnerName: "Spotify",
          partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/1200px-Spotify_logo_without_text.svg.png",
          partnerType: "tech",
          websiteUrl: "https://spotify.com",
          description: "Premium music streaming with exclusive wellness playlists for EchoDeed™ members",
          isActive: 1,
          isFeatured: 0,
          minRedemptionAmount: 150,
          maxRedemptionAmount: 1500,
          contactEmail: "partnerships@spotify.com"
        })
      ]);

      // Create sample offers for each partner
      const offers = [];
      
      // Starbucks offers
      offers.push(await storage.createRewardOffer({
        partnerId: partners[0].id,
        offerType: "discount",
        title: "$5 Off Your Order",
        description: "Get $5 off any Starbucks order over $10. Perfect for your daily coffee motivation!",
        offerValue: "$5 off",
        echoCost: 250,
        isActive: 1,
        isFeatured: 1,
        maxRedemptions: 1000,
        termsAndConditions: "Valid for 30 days. Cannot be combined with other offers. Minimum $10 purchase required.",
        imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400"
      }));

      offers.push(await storage.createRewardOffer({
        partnerId: partners[0].id,
        offerType: "freebie",
        title: "Free Grande Coffee",
        description: "Complimentary grande coffee of your choice. Spread kindness, get caffeinated!",
        offerValue: "Free Grande",
        echoCost: 400,
        badgeRequirement: "coffee_lover",
        isActive: 1,
        isFeatured: 0,
        maxRedemptions: 500,
        termsAndConditions: "Badge required: Coffee Lover. Valid for 30 days.",
        imageUrl: "https://images.unsplash.com/photo-1459755486867-b55449bb39ff?w=400"
      }));

      // Amazon offers
      offers.push(await storage.createRewardOffer({
        partnerId: partners[1].id,
        offerType: "discount",
        title: "15% Off Wellness Products",
        description: "Exclusive 15% discount on all health, wellness, and fitness products on Amazon",
        offerValue: "15% off",
        echoCost: 500,
        isActive: 1,
        isFeatured: 1,
        maxRedemptions: 2000,
        termsAndConditions: "Valid on health & wellness category only. Maximum discount $50. Valid for 60 days.",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
      }));

      offers.push(await storage.createRewardOffer({
        partnerId: partners[1].id,
        offerType: "cashback",
        title: "$25 Amazon Gift Card",
        description: "Get a $25 Amazon gift card to spend on anything you love",
        offerValue: "$25 Gift Card",
        echoCost: 1200,
        isActive: 1,
        isFeatured: 1,
        maxRedemptions: 300,
        requiresVerification: 1,
        termsAndConditions: "Requires kindness verification. Gift card delivered electronically within 48 hours.",
        imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400"
      }));

      // Nike offers
      offers.push(await storage.createRewardOffer({
        partnerId: partners[2].id,
        offerType: "discount",
        title: "20% Off Athletic Wear",
        description: "Get 20% off on Nike athletic wear to fuel your fitness journey",
        offerValue: "20% off",
        echoCost: 600,
        isActive: 1,
        isFeatured: 1,
        maxRedemptions: 800,
        termsAndConditions: "Valid on athletic wear only. Cannot be combined with other offers. Valid for 45 days.",
        imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400"
      }));

      // Spotify offers
      offers.push(await storage.createRewardOffer({
        partnerId: partners[3].id,
        offerType: "freebie",
        title: "3 Months Spotify Premium",
        description: "Enjoy 3 months of ad-free music with curated wellness and motivation playlists",
        offerValue: "3 Months Free",
        echoCost: 800,
        badgeRequirement: "kindness_streaker",
        isActive: 1,
        isFeatured: 0,
        maxRedemptions: 200,
        requiresVerification: 1,
        termsAndConditions: "Badge required: Kindness Streaker. Must verify recent acts of kindness.",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400"
      }));

      // Create sample badge rewards
      const badgeRewards = await Promise.all([
        storage.createBadgeReward({
          badgeId: "kindness_streaker",
          rewardType: "echo_multiplier", 
          rewardValue: "2x",
          description: "Double $ECHO tokens for all verified acts of kindness",
          isActive: 1
        }),
        storage.createBadgeReward({
          badgeId: "coffee_lover",
          rewardType: "exclusive_offers",
          rewardValue: "starbucks_exclusive",
          description: "Access to exclusive Starbucks offers and early access to limited deals",
          isActive: 1
        }),
        storage.createBadgeReward({
          badgeId: "wellness_champion", 
          rewardType: "priority_access",
          rewardValue: "early_access",
          description: "Priority access to wellness-related rewards and challenges",
          isActive: 1
        })
      ]);

      res.status(201).json({
        message: "Sample data created successfully",
        stats: {
          partners: partners.length,
          offers: offers.length,
          badgeRewards: badgeRewards.length
        },
        data: { partners, offers, badgeRewards }
      });
      
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Weekly Prizes
  app.get('/api/prizes/weekly', async (req, res) => {
    try {
      const { status } = req.query;
      const prizes = await storage.getWeeklyPrizes({
        status: status as string
      });
      res.json(prizes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/prizes/weekly', isAuthenticated, async (req, res) => {
    try {
      const prize = await storage.createWeeklyPrize(req.body);
      res.status(201).json(prize);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/prizes/:id/draw', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const winners = await storage.drawWeeklyPrizeWinners(id);
      res.json({ winners, message: `Drew ${winners.length} winners for prize` });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get('/api/prizes/:id/winners', async (req, res) => {
    try {
      const { id } = req.params;
      const winners = await storage.getPrizeWinners(id);
      res.json(winners);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Marketing & Viral Growth API Endpoints
  app.get('/api/marketing/metrics', isAuthenticated, async (req, res) => {
    try {
      // Return quick marketing metrics
      const metrics = {
        totalReferrals: 12,
        totalShares: 34,
        conversionRate: 65,
        viralCoefficient: 1.8,
        monthlyGrowth: 23,
        engagementRate: 78
      };
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/referrals/stats', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      // Generate referral code if user doesn't have one
      const referralCode = `EC${userId.slice(-6).toUpperCase()}`;
      
      const stats = {
        referralCode,
        totalReferrals: 3,
        referralEarnings: 150,
        pendingRewards: 50,
        conversionRate: 67,
        currentRank: 5,
        totalRanked: 24
      };
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/referrals/leaderboard', isAuthenticated, async (req, res) => {
    try {
      const topReferrers = [
        { rank: 1, displayName: 'Sarah M.', totalReferrals: 15, earnings: 750, badge: '🏆 Viral Champion' },
        { rank: 2, displayName: 'Mike T.', totalReferrals: 12, earnings: 600, badge: '🥈 Growth Leader' },
        { rank: 3, displayName: 'Lisa K.', totalReferrals: 9, earnings: 450, badge: '🥉 Kindness Advocate' },
        { rank: 4, displayName: 'James R.', totalReferrals: 7, earnings: 350, badge: '⭐ Community Builder' },
        { rank: 5, displayName: 'You', totalReferrals: 3, earnings: 150, badge: '🌟 Rising Star' }
      ];
      res.json(topReferrers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/sharing/content', isAuthenticated, async (req, res) => {
    try {
      const shareableContent = [
        {
          id: 'achievement-streak',
          type: 'milestone',
          title: '7-Day Kindness Streak!',
          description: 'Spreading positivity every day this week',
          visualData: {
            primaryStat: '7 Days',
            secondaryStat: '+15%',
            icon: '🔥',
            color: '#F59E0B',
            bgGradient: '#F97316'
          },
          shareText: 'Just hit a 7-day kindness streak on EchoDeed™! Small acts, big impact. 🔥',
          hashtags: ['KindnessStreak', 'PositiveImpact', 'EchoDeed', 'CorporateWellness']
        },
        {
          id: 'wellness-improvement',
          type: 'wellness_impact',
          title: 'Wellness Score Boost',
          description: 'AI detected significant mood improvement',
          visualData: {
            primaryStat: '+23%',
            icon: '💚',
            color: '#10B981',
            bgGradient: '#059669'
          },
          shareText: 'EchoDeed™ AI shows my wellness score improved 23% through daily kindness! 💚',
          hashtags: ['WellnessWins', 'AIInsights', 'MentalHealth', 'EchoDeed']
        }
      ];
      res.json(shareableContent);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/sharing/company-culture', isAuthenticated, async (req, res) => {
    try {
      const cultureStats = {
        companyName: 'TechCorp Inc.',
        kindnessScore: 87,
        wellnessImprovement: 34,
        employeeEngagement: 92,
        anonymousParticipation: 78
      };
      res.json(cultureStats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
