import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertKindnessPostSchema, insertCorporateAccountSchema, insertCorporateTeamSchema, insertCorporateEmployeeSchema, insertCorporateChallengeSchema } from "@shared/schema";
import { contentFilter } from "./services/contentFilter";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
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
      const counter = await storage.getKindnessCounter();
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
      
      const posts = await storage.getKindnessPosts(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create new kindness post
  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertKindnessPostSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string;
      
      // Content filtering
      const contentValidation = contentFilter.isContentAppropriate(postData.content);
      if (!contentValidation.isValid) {
        return res.status(400).json({ message: contentValidation.reason });
      }
      
      // Create post (awards tokens automatically)
      const post = await storage.createKindnessPost(postData, sessionId);
      
      // Increment counter
      const counter = await storage.incrementKindnessCounter();
      
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
  app.post('/api/posts/:postId/heart', async (req, res) => {
    try {
      const { postId } = req.params;
      const sessionId = req.headers['x-session-id'] as string;
      const updatedPost = await storage.addHeartToPost(postId, sessionId);
      
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
  app.post('/api/posts/:postId/echo', async (req, res) => {
    try {
      const { postId } = req.params;
      const sessionId = req.headers['x-session-id'] as string;
      const updatedPost = await storage.addEchoToPost(postId, sessionId);
      
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

  // Get user tokens
  app.get('/api/tokens', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }
      
      const tokens = await storage.getUserTokens(sessionId);
      res.json(tokens);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get brand challenges
  app.get('/api/challenges', async (req, res) => {
    try {
      const challenges = await storage.getBrandChallenges();
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

  // Get user's completed challenges
  app.get('/api/challenges/completed', async (req, res) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required' });
      }
      
      const completedChallenges = await storage.getChallengeCompletions(sessionId);
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
        // Create demo corporate account if it doesn't exist
        const existingDemoAccount = await storage.getCorporateAccount('techflow-solutions');
        if (!existingDemoAccount) {
          await storage.initializeSampleCorporateData();
        }
        
        // Use TechFlow Solutions as demo account
        const demoAccount = await storage.getCorporateAccount('techflow-solutions');
        if (demoAccount) {
          const [teams, employees, challenges, analytics] = await Promise.all([
            storage.getCorporateTeams('techflow-solutions'),
            storage.getCorporateEmployees('techflow-solutions'),
            storage.getCorporateChallenges('techflow-solutions'),
            storage.getCorporateAnalytics('techflow-solutions', 7)
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

  return httpServer;
}
