import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { DEMO_USER_STUDENT } from "@shared/demoConfig";

// Platform-agnostic domain detection (works on Replit, Railway, or any platform)
function getDomains(): string[] {
  // Replit provides REPLIT_DOMAINS
  if (process.env.REPLIT_DOMAINS) {
    return process.env.REPLIT_DOMAINS.split(",");
  }
  // Railway provides RAILWAY_PUBLIC_DOMAIN
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    return [process.env.RAILWAY_PUBLIC_DOMAIN];
  }
  // Fallback for local development or custom deployments
  if (process.env.APP_DOMAIN) {
    return [process.env.APP_DOMAIN];
  }
  // Default localhost for development
  return ["localhost"];
}

// Check if we're running on Replit (has OIDC support)
const isReplitEnvironment = !!process.env.REPLIT_DOMAINS && !!process.env.REPL_ID;

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only set up Replit OIDC if we're on Replit
  if (isReplitEnvironment) {
    const config = await getOidcConfig();

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    };

    const domains = getDomains();
    for (const domain of domains) {
      const strategy = new Strategy(
        {
          name: `replitauth:${domain}`,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
    }

    app.get("/api/login", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID!,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    });
  } else {
    // Non-Replit environment: Use demo mode or redirect to demo login
    console.log('Running in non-Replit environment - using demo authentication mode');
    
    app.get("/api/login", (req, res) => {
      res.redirect("/demo-login");
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Demo mode: Allow access with session ID header in development OR when DEMO_MODE is enabled
  const sessionId = req.headers['x-session-id'] || req.headers['X-Session-ID'];
  const isDemoModeEnabled = process.env.NODE_ENV === 'development' || process.env.DEMO_MODE === 'true';
  
  if (isDemoModeEnabled && sessionId) {
    
    // Get demo role from query params, headers, or User-Agent to determine role
    const demoRole = req.query.demo_role || req.headers['x-demo-role'] || 
                     (req.headers['user-agent']?.includes('Teacher') ? 'teacher' : 'student');
    
    let demoUser;
    if (demoRole === 'teacher') {
      demoUser = {
        id: 'teacher-001',
        name: 'Ms. Sarah Wilson', 
        email: 'sarah.wilson@school.edu',
        role: 'teacher',
        schoolRole: 'teacher',
        schoolId: 'bc016cad-fa89-44fb-aab0-76f82c574f78'
      };
    } else {
      // Default to Sofia Rodriguez for student or any other role
      demoUser = DEMO_USER_STUDENT;
    }
    
    // Create mock user for smooth demo experience
    const nameParts = demoUser.name.split(' ');
    const firstName = nameParts.slice(0, -1).join(' '); // "Ms. Sarah" 
    const lastName = nameParts[nameParts.length - 1]; // "Wilson"
    
    req.user = {
      claims: { 
        sub: demoUser.id,
        email: demoUser.email,
        first_name: firstName,
        last_name: lastName,
        role: demoUser.role,
        schoolRole: demoUser.schoolRole,
        schoolId: demoUser.schoolId,
        grade: demoUser.grade
      },
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
    };
    
    // Ensure demo user exists in database
    try {
      await storage.upsertUser({
        id: demoUser.id,
        email: demoUser.email,
        firstName: firstName,
        lastName: lastName,
        schoolRole: demoUser.schoolRole,
        schoolId: demoUser.schoolId
      });
    } catch (error) {
      console.error('Failed to create demo user:', error);
    }
    
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};