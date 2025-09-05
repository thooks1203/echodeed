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
      
      // Content filtering
      const contentValidation = contentFilter.isContentAppropriate(postData.content);
      if (!contentValidation.isValid) {
        return res.status(400).json({ message: contentValidation.reason });
      }
      
      // Create post
      const post = await storage.createKindnessPost(postData);
      
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

  return httpServer;
}
