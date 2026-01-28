# EchoDeed Migration Guide: Replit → GitHub + Railway

This guide walks you through migrating EchoDeed to a GitHub repository with automatic deployment to Railway.

---

## Part 1: Create GitHub Repository

### Step 1: Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **+** icon in the top right → **New repository**
3. Fill in:
   - **Repository name**: `echodeed` (or `EchoDeed`)
   - **Description**: "Anonymous kindness platform for K-8 schools"
   - **Visibility**: Private (recommended for now)
   - **DO NOT** initialize with README, .gitignore, or license (we have these already)
4. Click **Create repository**
5. **Copy the repository URL** (looks like: `https://github.com/YOUR_USERNAME/echodeed.git`)

### Step 2: Connect Replit to GitHub

1. In Replit, click the **Git** icon in the left sidebar (branch icon)
2. Click **Connect to GitHub**
3. Authorize Replit to access your GitHub account
4. Select your new `echodeed` repository
5. Push the existing code to GitHub

**Alternative: Manual Push from Replit Shell**
```bash
# In Replit Shell, run these commands:
git remote add github https://github.com/YOUR_USERNAME/echodeed.git
git push -u github main
```

---

## Part 2: Create Railway Account & Project

### Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click **Login** → **Login with GitHub** (easiest option)
3. Authorize Railway to access your GitHub

### Step 2: Create New Project

1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Find and select your `echodeed` repository
4. Railway will automatically detect it's a Node.js project

### Step 3: Configure Environment Variables

In Railway, go to your project → **Variables** tab and add:

```
NODE_ENV=production
DEMO_MODE=true
SESSION_SECRET=your-secure-random-string-here
OPENAI_API_KEY=your-openai-key
DATABASE_URL=your-railway-postgres-url
```

### Step 4: Add PostgreSQL Database

1. In your Railway project, click **+ New**
2. Select **Database** → **PostgreSQL**
3. Railway will automatically set `DATABASE_URL` for you
4. **Important**: You'll need to migrate your existing data from Replit's database

---

## Part 3: Configure Automatic Deployments

Railway automatically sets up CI/CD when you connect a GitHub repo:

1. **Every push to `main`** triggers a new deployment
2. Railway builds and deploys automatically
3. No additional configuration needed!

### Verify CI/CD is Working

1. Make a small change in your code
2. Commit and push to GitHub `main` branch
3. Watch Railway dashboard - you should see a new deployment start

---

## Part 4: Railway Configuration Files

Create these files in your project root:

### `railway.json` (Already created for you)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `Procfile` (Already created for you)
```
web: npm run start
```

---

## Part 5: Database Migration

### Option A: Fresh Start (Recommended for Pilot)
If starting fresh for EGMS pilot, Railway's new database will be empty and your app will seed demo data automatically.

### Option B: Migrate Existing Data
If you need to preserve data:

1. Export from Replit's database:
```bash
pg_dump $DATABASE_URL > echodeed_backup.sql
```

2. Import to Railway's database:
```bash
psql $RAILWAY_DATABASE_URL < echodeed_backup.sql
```

---

## Part 6: Custom Domain (Optional)

1. In Railway, go to **Settings** → **Domains**
2. Click **Generate Domain** for a free `*.railway.app` URL
3. Or add your own custom domain (e.g., `app.echodeed.com`)

---

## Quick Reference: Environment Variables Needed

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection | Railway auto-provides |
| `OPENAI_API_KEY` | AI features | OpenAI dashboard |
| `SESSION_SECRET` | Auth security | Generate random string |
| `DEMO_MODE` | Enable demo data | Set to `true` |
| `NODE_ENV` | Environment | Set to `production` |

---

## Deployment Workflow After Setup

1. **Develop** on Replit (or locally)
2. **Commit** changes to GitHub
3. **Push** to `main` branch
4. **Railway** automatically deploys (takes ~2-3 minutes)
5. **Live** at your Railway URL

---

## Support

- Railway Docs: https://docs.railway.app
- GitHub Docs: https://docs.github.com
- Need help? Contact EchoDeed support

---

*Last Updated: January 2026*
