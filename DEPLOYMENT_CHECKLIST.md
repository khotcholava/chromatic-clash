# ✅ Pre-Deployment Checklist

Use this checklist before deploying to Render.com:

## 📦 Code Preparation

- [x] `render.yaml` exists and is configured correctly
- [x] `package.json` has correct `start` script (`npm start`)
- [x] Server uses `process.env.PORT` (not hardcoded port)
- [x] Server binds to `0.0.0.0` (for Render compatibility)
- [x] All dependencies listed in `package.json`
- [x] `.gitignore` excludes `node_modules`
- [x] No sensitive data in code (use environment variables)

## 🔍 Local Testing

- [ ] Game runs locally with `npm install && npm start`
- [ ] Can create rooms locally
- [ ] Can join rooms locally
- [ ] Multiplayer works with multiple browser tabs
- [ ] No console errors in browser
- [ ] No errors in server logs

## 📤 Git & GitHub

- [ ] All changes committed: `git status` shows clean
- [ ] Code pushed to GitHub: `git push origin main`
- [ ] Repository is public (or Render account has access)
- [ ] `render.yaml` is in the repository root

## 🚀 Render.com Setup

- [ ] Render.com account created
- [ ] GitHub connected to Render account
- [ ] Repository selected in Render dashboard
- [ ] Service created (via Blueprint or manually)
- [ ] Build completes successfully
- [ ] Service shows "Live" status

## 🧪 Post-Deployment Testing

- [ ] Game loads at Render URL
- [ ] Can create a room
- [ ] Room code displays correctly
- [ ] Can join room from another device/browser
- [ ] Multiplayer works between devices
- [ ] Power-ups spawn and work
- [ ] Game timer works
- [ ] Scores calculate correctly
- [ ] Game ends properly
- [ ] "Play Again" works

## 📊 Monitoring Setup

- [ ] Check Render logs for errors
- [ ] Monitor CPU/Memory usage
- [ ] Set up UptimeRobot (for free tier) or upgrade plan
- [ ] Configure email alerts (optional)

## 🎯 Ready to Deploy!

Once all items are checked, you're ready to deploy!

**Quick Deploy Steps:**
1. `git push origin main`
2. Go to Render.com dashboard
3. Create new Web Service (or use Blueprint)
4. Select your repository
5. Deploy!
6. Test your game

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails | Check `package.json` dependencies |
| App crashes | Check logs, verify PORT usage |
| Socket.IO fails | Verify CORS settings (already configured ✅) |
| Cold starts | Use UptimeRobot or upgrade plan |
| Timeout errors | Check Render service logs |

---

**Need help?** Check `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions!
