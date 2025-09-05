import { type KindnessPost, type InsertKindnessPost, type KindnessCounter, type UserTokens, type InsertUserTokens } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createKindnessPost(post: InsertKindnessPost, sessionId?: string): Promise<KindnessPost>;
  getKindnessPosts(filters?: { category?: string; city?: string; state?: string; country?: string }): Promise<KindnessPost[]>;
  getKindnessCounter(): Promise<KindnessCounter>;
  incrementKindnessCounter(): Promise<KindnessCounter>;
  addHeartToPost(postId: string, sessionId?: string): Promise<KindnessPost>;
  addEchoToPost(postId: string, sessionId?: string): Promise<KindnessPost>;
  getUserTokens(sessionId: string): Promise<UserTokens>;
  createOrUpdateUserTokens(sessionId: string): Promise<UserTokens>;
  awardTokens(sessionId: string, amount: number, reason: string): Promise<UserTokens>;
}

export class MemStorage implements IStorage {
  private posts: Map<string, KindnessPost>;
  private counter: KindnessCounter;
  private userTokens: Map<string, UserTokens>;

  constructor() {
    this.posts = new Map();
    this.userTokens = new Map();
    this.counter = {
      id: "global",
      count: 247891, // Starting count from design
      updatedAt: new Date(),
    };

    // Add some initial posts for demonstration
    this.seedInitialPosts();
  }

  private seedInitialPosts() {
    const initialPosts = [
      {
        content: "Helped an elderly woman carry her groceries up three flights of stairs today. Her smile made my whole week brighter. Sometimes the smallest gestures create the biggest ripples.",
        category: "Helping Others",
        location: "Downtown, San Francisco",
        city: "San Francisco",
        state: "California",
        country: "United States",
        heartsCount: Math.floor(Math.random() * 50) + 10,
        echoesCount: Math.floor(Math.random() * 25) + 5,
      },
      {
        content: "Left encouraging sticky notes on random cars in the parking lot. Simple words like 'You're amazing!' and 'Someone believes in you!' Hope it brightens someone's day.",
        category: "Spreading Positivity", 
        location: "Austin, Texas",
        city: "Austin",
        state: "Texas",
        country: "United States",
        heartsCount: Math.floor(Math.random() * 50) + 10,
        echoesCount: Math.floor(Math.random() * 25) + 5,
      },
      {
        content: "Organized a neighborhood cleanup this morning. 15 people showed up! We collected 8 bags of trash and planted 12 flowers. Our community looks so much better now.",
        category: "Community Action",
        location: "Portland, Oregon",
        city: "Portland",
        state: "Oregon", 
        country: "United States",
        heartsCount: Math.floor(Math.random() * 50) + 10,
        echoesCount: Math.floor(Math.random() * 25) + 5,
      },
    ];

    initialPosts.forEach(postData => {
      const id = randomUUID();
      const post: KindnessPost = {
        ...postData,
        id,
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
      };
      this.posts.set(id, post);
    });
  }

  async createKindnessPost(insertPost: InsertKindnessPost, sessionId?: string): Promise<KindnessPost> {
    const id = randomUUID();
    const post: KindnessPost = {
      ...insertPost,
      id,
      createdAt: new Date(),
      heartsCount: 0,
      echoesCount: 0,
    };
    this.posts.set(id, post);
    
    // Award tokens for posting (5 $ECHO per post)
    if (sessionId) {
      await this.awardTokens(sessionId, 5, 'kindness_post');
    }
    
    return post;
  }

  async getKindnessPosts(filters?: { category?: string; city?: string; state?: string; country?: string }): Promise<KindnessPost[]> {
    let posts = Array.from(this.posts.values());
    
    if (filters?.category) {
      posts = posts.filter(post => post.category === filters.category);
    }
    
    if (filters?.city) {
      posts = posts.filter(post => post.city === filters.city);
    }
    
    if (filters?.state) {
      posts = posts.filter(post => post.state === filters.state);
    }
    
    if (filters?.country) {
      posts = posts.filter(post => post.country === filters.country);
    }
    
    // Sort by creation date, newest first
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getKindnessCounter(): Promise<KindnessCounter> {
    return this.counter;
  }

  async incrementKindnessCounter(): Promise<KindnessCounter> {
    this.counter = {
      ...this.counter,
      count: this.counter.count + 1,
      updatedAt: new Date(),
    };
    return this.counter;
  }

  async addHeartToPost(postId: string, sessionId?: string): Promise<KindnessPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    const updatedPost = {
      ...post,
      heartsCount: post.heartsCount + 1,
    };
    
    this.posts.set(postId, updatedPost);
    
    // Award tokens for giving hearts (1 $ECHO per heart)
    if (sessionId) {
      await this.awardTokens(sessionId, 1, 'heart_given');
    }
    
    return updatedPost;
  }

  async addEchoToPost(postId: string, sessionId?: string): Promise<KindnessPost> {
    const post = this.posts.get(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    
    const updatedPost = {
      ...post,
      echoesCount: post.echoesCount + 1,
    };
    
    this.posts.set(postId, updatedPost);
    
    // Award tokens for echoing (2 $ECHO per echo - commitment to duplicate)
    if (sessionId) {
      await this.awardTokens(sessionId, 2, 'echo_given');
    }
    
    return updatedPost;
  }

  async getUserTokens(sessionId: string): Promise<UserTokens> {
    const tokens = this.userTokens.get(sessionId);
    if (!tokens) {
      return await this.createOrUpdateUserTokens(sessionId);
    }
    return tokens;
  }

  async createOrUpdateUserTokens(sessionId: string): Promise<UserTokens> {
    const existing = this.userTokens.get(sessionId);
    if (existing) {
      // Update last active
      const updated = {
        ...existing,
        lastActive: new Date(),
      };
      this.userTokens.set(sessionId, updated);
      return updated;
    }

    // Create new user tokens
    const tokens: UserTokens = {
      id: randomUUID(),
      sessionId,
      echoBalance: 0,
      totalEarned: 0,
      createdAt: new Date(),
      lastActive: new Date(),
    };
    
    this.userTokens.set(sessionId, tokens);
    return tokens;
  }

  async awardTokens(sessionId: string, amount: number, reason: string): Promise<UserTokens> {
    const tokens = await this.getUserTokens(sessionId);
    
    const updatedTokens = {
      ...tokens,
      echoBalance: tokens.echoBalance + amount,
      totalEarned: tokens.totalEarned + amount,
      lastActive: new Date(),
    };
    
    this.userTokens.set(sessionId, updatedTokens);
    console.log(`Awarded ${amount} $ECHO to ${sessionId} for ${reason}. New balance: ${updatedTokens.echoBalance}`);
    
    return updatedTokens;
  }
}

export const storage = new MemStorage();
