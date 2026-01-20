# 🎨 Chromatic Clash

A real-time multiplayer territory painting battle game. Compete with friends to paint the most pixels on a shared canvas!

![Chromatic Clash](https://via.placeholder.com/800x400/1a1a2e/FF6B6B?text=Chromatic+Clash)

## 🎮 How to Play

1. **Create or Join a Room** - Enter your name and either create a new game room or join an existing one with a room code
2. **Paint Territory** - Move your cursor across the canvas to paint in your color
3. **Collect Power-ups** - Grab power-ups that spawn on the field for special abilities
4. **Win** - The player with the most painted pixels when time runs out wins!

## ⚡ Power-ups

| Power-up | Effect |
|----------|--------|
| 💣 **Bomb** | Instantly paints a large circular area |
| 🛡️ **Shield** | Protects your painted pixels from being overwritten for 8 seconds |
| 🧹 **Eraser** | Clears enemy pixels in an area around you |
| ⚡ **Speed** | Increases movement speed and brush size for 6 seconds |
| ❄️ **Freeze** | Freezes all other players for 3 seconds |

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed

### Installation

```bash
# Navigate to the game directory
cd chromatic-clash

# Install dependencies
npm install

# Start the server
npm start
```

### Playing

1. Open your browser to `http://localhost:3000`
2. Enter your name and click **Create Game**
3. Share the room code with friends
4. Once everyone joins, the host clicks **Start Game**
5. Paint and conquer! 🎨

## 🛠️ Development

```bash
# Run with auto-reload (Node 18+)
npm run dev
```

## 🎯 Game Features

- **Real-time Multiplayer** - Up to 8 players per room
- **Smooth Canvas Rendering** - 60fps gameplay
- **Power-up System** - 5 unique power-ups with strategic value
- **Mobile Support** - Touch controls for mobile devices
- **Beautiful UI** - Modern, vibrant design with animations

## 🏗️ Tech Stack

- **Backend**: Node.js + Express + Socket.IO
- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Styling**: CSS with custom properties and animations

## 📁 Project Structure

```
chromatic-clash/
├── server.js          # Express + Socket.IO server
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Game HTML structure
│   ├── styles.css     # Styling and animations
│   └── game.js        # Client-side game logic
└── README.md
```

## 🎨 Color Palette

Players are assigned vibrant, distinct colors:
- Coral Red `#FF6B6B`
- Teal `#4ECDC4`
- Yellow `#FFE66D`
- Mint `#95E1D3`
- Salmon `#F38181`
- Lavender `#AA96DA`
- Orange `#FF9F43`
- Green `#26DE81`

## 📝 License

MIT License - feel free to use this for your own projects!

---

Made with 🎨 for fun multiplayer gaming
# chromatic-clash
