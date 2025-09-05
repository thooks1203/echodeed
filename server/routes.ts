import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertKindnessPostSchema } from "@shared/schema";
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

  return httpServer;
}
