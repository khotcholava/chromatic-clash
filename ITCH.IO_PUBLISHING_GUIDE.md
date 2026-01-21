# 🎮 Publishing Chromatic Clash on itch.io

This guide covers how to publish your multiplayer game on itch.io. Since your game uses a Node.js server with Socket.IO, there are several approaches you can take.

## 📋 Table of Contents
1. [Understanding itch.io Requirements](#understanding-itchio-requirements)
2. [Option 1: Embed External Server (Recommended)](#option-1-embed-external-server-recommended)
3. [Option 2: Convert to Client-Only Multiplayer](#option-2-convert-to-client-only-multiplayer)
4. [Option 3: Single-Player/Local Multiplayer Version](#option-3-single-playerlocal-multiplayer-version)
5. [Step-by-Step Publishing Process](#step-by-step-publishing-process)
6. [Post-Publishing Checklist](#post-publishing-checklist)

---

## Understanding itch.io Requirements

**itch.io supports:**
- ✅ HTML5 games (self-contained)
- ✅ WebGL games
- ✅ Embedded iframes (external URLs)
- ✅ ZIP files with HTML/CSS/JS

**itch.io limitations:**
- ❌ Cannot host Node.js servers
- ❌ Cannot run server-side code
- ⚠️ External server URLs must be HTTPS

---

## Option 1: Embed External Server (Recommended)

**Best for:** Keeping full multiplayer functionality

Since your game is already deployed on Render.com (`https://chromatic-clash.onrender.com/`), you can embed it directly in itch.io.

### Steps:

1. **Ensure your Render.com deployment is stable**
   - Make sure it's always running
   - Consider upgrading to a paid plan if free tier has cold starts

2. **Create itch.io project page**
   - Go to https://itch.io/game/new
   - Choose "HTML" as the project type

3. **Embed your game**
   - In the "Embed" section, use:
   ```html
   <iframe src="https://chromatic-clash.onrender.com/" 
           width="800" 
           height="700" 
           frameborder="0" 
           allowfullscreen>
   </iframe>
   ```

4. **Alternative: Direct Link**
   - Set "Kind of project" to "HTML"
   - Upload a simple `index.html` that redirects:
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta http-equiv="refresh" content="0; url=https://chromatic-clash.onrender.com/">
   </head>
   <body>
     <p>Redirecting to game...</p>
   </body>
   </html>
   ```

### Pros:
- ✅ Full multiplayer functionality preserved
- ✅ No code changes needed
- ✅ Easy to update (just update Render.com)

### Cons:
- ⚠️ Requires external server (Render.com)
- ⚠️ Free tier may have cold starts
- ⚠️ Players see external URL

---

## Option 2: Convert to Client-Only Multiplayer

**Best for:** True itch.io integration without external dependencies

Convert to use WebRTC or a client-side multiplayer solution.

### Technologies to Consider:

1. **PeerJS** - WebRTC peer-to-peer connections
2. **Gun.js** - Decentralized real-time database
3. **Colyseus** - But still requires a server
4. **LocalStorage + Shared Workers** - Limited to same browser

### Implementation Example (PeerJS):

```javascript
// Replace Socket.IO with PeerJS
import Peer from 'peerjs';

class PeerManager {
  constructor() {
    this.peer = null;
    this.connections = [];
  }
  
  createRoom(roomCode) {
    this.peer = new Peer(roomCode);
    // Handle connections...
  }
  
  joinRoom(roomCode) {
    this.peer = new Peer();
    const conn = this.peer.connect(roomCode);
    // Handle connection...
  }
}
```

### Pros:
- ✅ Fully self-contained
- ✅ No external server needed
- ✅ True itch.io integration

### Cons:
- ❌ Requires significant code refactoring
- ❌ WebRTC has NAT traversal issues
- ❌ More complex to implement

---

## Option 3: Single-Player/Local Multiplayer Version

**Best for:** Quick itch.io upload with minimal changes

Create a version that works offline with AI opponents or local multiplayer.

### Quick Implementation:

1. **Remove Socket.IO dependency**
2. **Add local game state management**
3. **Add AI opponents** (optional)
4. **Use localStorage for persistence**

### Pros:
- ✅ Fully offline
- ✅ No server needed
- ✅ Easy to package as ZIP

### Cons:
- ❌ Loses real multiplayer
- ❌ Requires code changes

---

## Step-by-Step Publishing Process

### 1. Prepare Your Game Assets

Create a `itch-io` folder with:

```
itch-io/
├── index.html (embed or redirect)
├── thumbnail.png (630x500px recommended)
├── screenshots/
│   ├── screenshot1.png
│   ├── screenshot2.png
│   └── screenshot3.png
└── README.txt (optional)
```

### 2. Create Game Page on itch.io

1. Go to https://itch.io/game/new
2. Fill in basic information:
   - **Title:** Chromatic Clash
   - **Short description:** Real-time multiplayer territory painting battle game
   - **Classification:** Game → Multiplayer → Real-time
   - **Tags:** multiplayer, canvas, real-time, painting, territory, battle

### 3. Upload Files

**For Option 1 (Embed):**
- Upload a simple `index.html` with iframe embed
- Or set "Kind of project" to "HTML" and use external URL

**For Option 3 (Standalone):**
- Zip all files: `public/` folder contents
- Upload as ZIP file
- Set "Kind of project" to "HTML"

### 4. Configure Settings

- **Visibility:** Public (or Draft for testing)
- **Monetization:** Free, Pay what you want, or Fixed price
- **Embedding:** Allow embedding if using iframe
- **Analytics:** Enable if you want stats

### 5. Add Media

- **Cover image:** 630x500px (main thumbnail)
- **Screenshots:** At least 3-5 images
- **Video:** Optional but recommended (YouTube/Vimeo embed)

### 6. Write Description

Use markdown to format:

```markdown
# 🎨 Chromatic Clash

A real-time multiplayer territory painting battle game. Compete with friends to paint the most pixels on a shared canvas!

## 🎮 How to Play

1. **Create or Join a Room** - Enter your name and either create a new game room or join an existing one with a room code
2. **Paint Territory** - Move your cursor across the canvas to paint in your color
3. **Collect Power-ups** - Grab power-ups that spawn on the field for special abilities
4. **Win** - The player with the most painted pixels when time runs out wins!

## ⚡ Power-ups

- 💣 **Bomb** - Instantly paints a large circular area
- 🛡️ **Shield** - Protects your painted pixels from being overwritten
- 🧹 **Eraser** - Clears enemy pixels in an area around you
- ⚡ **Speed** - Increases movement speed and brush size
- ❄️ **Freeze** - Freezes all other players for 3 seconds

## 🎯 Features

- Real-time multiplayer (up to 8 players)
- Smooth 60fps gameplay
- 6 beautiful map themes
- Strategic power-up system
- Mobile-friendly controls

Made with 🎨 for fun multiplayer gaming
```

### 7. Set Pricing (Optional)

- **Free:** $0.00
- **Pay what you want:** Set minimum (e.g., $0) and suggested price
- **Fixed price:** Set a specific amount

### 8. Publish

Click "Save & view page" to publish!

---

## Post-Publishing Checklist

- [ ] Test the game page on itch.io
- [ ] Verify multiplayer works (if using Option 1)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Share on social media
- [ ] Add to itch.io collections
- [ ] Monitor analytics (if enabled)
- [ ] Respond to player feedback
- [ ] Update game based on feedback

---

## Recommended Approach

**For your current setup, I recommend Option 1 (Embed External Server):**

1. ✅ No code changes needed
2. ✅ Full multiplayer preserved
3. ✅ Easy to maintain
4. ✅ Can always add standalone version later

**Quick Implementation:**

Create `itch-io/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chromatic Clash - Play Now!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #1a1a2e;
      font-family: Arial, sans-serif;
    }
    .container {
      width: 100%;
      max-width: 1200px;
      height: 100vh;
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <iframe 
      src="https://chromatic-clash.onrender.com/" 
      allowfullscreen
      allow="autoplay; microphone; camera">
    </iframe>
  </div>
</body>
</html>
```

Then upload this as a ZIP file to itch.io!

---

## Need Help?

- [itch.io Documentation](https://itch.io/docs)
- [itch.io Community](https://itch.io/community)
- [HTML5 Game Publishing Guide](https://itch.io/docs/creators/html5)

---

**Good luck with your launch! 🚀**
