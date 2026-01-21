# 🚀 Deploying Chromatic Clash to Render.com

This guide will walk you through deploying your multiplayer game to Render.com step by step.

## 📋 Prerequisites

- ✅ GitHub account
- ✅ Render.com account (free tier available)
- ✅ Your code pushed to a GitHub repository

---

## Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "feat: initial commit for Chromatic Clash"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/chromatic-clash.git
git branch -M main
git push -u origin main
```

**Important:** Make sure your `render.yaml` and all necessary files are committed!

---

## Step 2: Create a Render.com Account

1. Go to https://render.com
2. Click **"Get Started for Free"** or **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

---

## Step 3: Deploy Using render.yaml (Recommended)

Your project already has a `render.yaml` file configured! This makes deployment easier.

### Option A: Automatic Deployment from GitHub

1. **Go to Render Dashboard**
   - Navigate to https://dashboard.render.com
   - Click **"New +"** → **"Blueprint"**

2. **Connect Your Repository**
   - Click **"Connect account"** if you haven't connected GitHub
   - Authorize Render to access your repositories
   - Select your `chromatic-clash` repository
   - Click **"Connect"**

3. **Configure Blueprint**
   - Render will detect your `render.yaml` file automatically
   - Review the configuration:
     - **Name:** chromatic-clash
     - **Type:** Web Service
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - Click **"Apply"**

4. **Deploy**
   - Render will start building and deploying your app
   - Wait for the build to complete (usually 2-5 minutes)
   - Your app will be live at: `https://chromatic-clash.onrender.com`

### Option B: Manual Web Service Creation

If you prefer manual setup:

1. **Create New Web Service**
   - Go to https://dashboard.render.com
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Connect your GitHub account if needed
   - Select your `chromatic-clash` repository
   - Click **"Connect"**

3. **Configure Service**
   - **Name:** `chromatic-clash`
   - **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty (or `.` if needed)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Environment Variables**
   - Add if needed:
     - `NODE_ENV` = `production`
     - `PORT` = (Render sets this automatically, but you can override)

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment to complete

---

## Step 4: Verify Deployment

Once deployed:

1. **Check Build Logs**
   - Go to your service dashboard
   - Click **"Logs"** tab
   - Verify no errors during build

2. **Test Your Game**
   - Visit your Render URL: `https://chromatic-clash.onrender.com`
   - Test creating a room
   - Test joining with another browser/device
   - Verify multiplayer works

3. **Check Service Status**
   - Ensure service shows **"Live"** status
   - Monitor resource usage in dashboard

---

## Step 5: Configure Custom Domain (Optional)

If you want a custom domain:

1. Go to your service settings
2. Scroll to **"Custom Domains"**
3. Add your domain (e.g., `chromaticclash.com`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic, takes a few minutes)

---

## Step 6: Configure Auto-Deploy

Render automatically deploys when you push to your main branch, but verify:

1. Go to **Settings** → **Auto-Deploy**
2. Ensure **"Auto-Deploy"** is enabled
3. Set branch to `main` (or your default branch)

Now every `git push` will trigger a new deployment!

---

## 🎯 Render.com Free Tier Limitations

**Free Tier Includes:**
- ✅ 750 hours/month (enough for 24/7 if you're the only user)
- ✅ Automatic SSL certificates
- ✅ Custom domains
- ✅ Auto-deploy from GitHub

**Free Tier Limitations:**
- ⚠️ **Spins down after 15 minutes of inactivity**
- ⚠️ First request after spin-down takes 30-60 seconds (cold start)
- ⚠️ Shared resources (may be slower during peak times)
- ⚠️ Limited to 512MB RAM

**Solutions:**
- Use a **ping service** (like UptimeRobot) to keep it awake
- Upgrade to **Starter Plan** ($7/month) for always-on service
- Accept the cold start delay (fine for personal projects)

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Check:**
- ✅ All dependencies in `package.json`
- ✅ `render.yaml` syntax is correct
- ✅ Node version compatibility (Render uses Node 18+ by default)

**Fix:**
- Check build logs in Render dashboard
- Ensure `npm install` completes successfully
- Verify `npm start` command works locally

### Issue: App Crashes on Start

**Check:**
- ✅ Server listens on `process.env.PORT` (your code already does this ✅)
- ✅ No hardcoded ports
- ✅ Environment variables are set correctly

**Fix:**
- Check runtime logs in Render dashboard
- Test `npm start` locally first
- Verify PORT environment variable usage

### Issue: Socket.IO Connection Fails

**Check:**
- ✅ CORS settings allow your domain
- ✅ Socket.IO version compatibility
- ✅ WebSocket support enabled

**Fix:**
- Your `server.js` already has CORS configured for all origins ✅
- Ensure Render WebSocket support is enabled (it is by default)

### Issue: Cold Start Delay

**Problem:** First request takes 30-60 seconds after inactivity

**Solutions:**
1. **Use UptimeRobot** (free):
   - Sign up at https://uptimerobot.com
   - Add monitor for your Render URL
   - Set interval to 5 minutes
   - This keeps your app "warm"

2. **Upgrade to Starter Plan:**
   - $7/month for always-on service
   - No cold starts
   - Better performance

---

## 📊 Monitoring Your Deployment

### View Logs

1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time logs or historical logs

### Monitor Metrics

- **CPU Usage:** Check if you need more resources
- **Memory Usage:** Monitor RAM consumption
- **Request Count:** Track traffic
- **Response Time:** Monitor performance

### Set Up Alerts

1. Go to **Settings** → **Alerts**
2. Configure email alerts for:
   - Service crashes
   - High resource usage
   - Deployment failures

---

## 🔄 Updating Your Deployment

### Automatic Updates

If auto-deploy is enabled:
```bash
# Make changes locally
git add .
git commit -m "feat: add new feature"
git push origin main
# Render automatically deploys!
```

### Manual Deploy

1. Go to Render dashboard
2. Click **"Manual Deploy"**
3. Select branch/commit
4. Click **"Deploy"**

---

## 🎨 Your Current Configuration

Your `render.yaml` is already configured correctly:

```yaml
services:
  - type: web
    name: chromatic-clash
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

**This is perfect!** ✅

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Code is pushed to GitHub
- [ ] `render.yaml` is committed
- [ ] `package.json` has correct start script
- [ ] Server uses `process.env.PORT` (✅ already done)
- [ ] No hardcoded URLs or ports
- [ ] Dependencies are in `package.json`
- [ ] `.gitignore` excludes `node_modules` (✅ already done)

---

## 🚀 Quick Start Commands

```bash
# 1. Ensure everything is committed
git status

# 2. Push to GitHub
git push origin main

# 3. Go to Render.com and deploy (or it auto-deploys)
# 4. Wait for build to complete
# 5. Test your game!
```

---

## 📝 Next Steps After Deployment

1. **Test thoroughly:**
   - Create rooms
   - Join rooms
   - Test multiplayer
   - Test on mobile

2. **Set up monitoring:**
   - Configure UptimeRobot for free tier
   - Or upgrade to Starter plan

3. **Share your game:**
   - Share Render URL with friends
   - Publish on itch.io (using the guide we created earlier!)

4. **Monitor performance:**
   - Check Render dashboard regularly
   - Monitor logs for errors
   - Track resource usage

---

## 💡 Pro Tips

1. **Use Environment Variables:**
   - Store sensitive data in Render environment variables
   - Don't commit secrets to GitHub

2. **Optimize for Free Tier:**
   - Use UptimeRobot to prevent spin-downs
   - Monitor resource usage
   - Optimize code if needed

3. **Set Up Staging:**
   - Create a separate service for testing
   - Deploy to staging first, then production

4. **Backup:**
   - Keep your GitHub repo updated
   - Render can redeploy from GitHub anytime

---

## 🆘 Need Help?

- **Render Documentation:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Render Status:** https://status.render.com

---

**Your game is ready to deploy! 🎮**

Follow the steps above and your multiplayer game will be live in minutes!
