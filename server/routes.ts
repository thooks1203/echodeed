import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertKindnessPostSchema, insertCorporateAccountSchema, insertCorporateTeamSchema, insertCorporateEmployeeSchema, insertCorporateChallengeSchema } from "@shared/schema";
import { contentFilter } from "./services/contentFilter";
import { aiAnalytics } from "./services/aiAnalytics";

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

  return httpServer;
}
