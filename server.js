const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GAME_DURATION = 90; // seconds
const POWERUP_SPAWN_INTERVAL = 5000; // ms
const POWERUP_TYPES = ['bomb', 'shield', 'eraser', 'speed', 'freeze'];

// Player colors - vibrant and distinct
const PLAYER_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Salmon
  '#AA96DA', // Lavender
  '#FF9F43', // Orange
  '#26DE81', // Green
];

// Game rooms storage
const rooms = new Map();

// Generate a short room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Available themes
const THEMES = ['neon-night', 'ocean-depths', 'sunset-valley', 'forest-mist', 'cosmic-void', 'candy-land'];

// Create a new game room
function createRoom(hostId, hostName) {
  const roomCode = generateRoomCode();
  const room = {
    code: roomCode,
    hostId: hostId,
    players: new Map(),
    canvas: new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill(null),
    powerups: [],
    gameState: 'waiting', // waiting, countdown, playing, finished
    timeRemaining: GAME_DURATION,
    countdownValue: 3,
    powerupTimer: null,
    gameTimer: null,
    theme: 'neon-night', // Default theme
  };
  
  rooms.set(roomCode, room);
  return room;
}

// Add player to room
function addPlayerToRoom(room, playerId, playerName) {
  const colorIndex = room.players.size % PLAYER_COLORS.length;
  const player = {
    id: playerId,
    name: playerName,
    color: PLAYER_COLORS[colorIndex],
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    score: 0,
    brushSize: 15,
    speed: 1,
    hasShield: false,
    isFrozen: false,
    effects: [],
  };
  room.players.set(playerId, player);
  return player;
}

// Calculate scores
function calculateScores(room) {
  const scores = {};
  room.players.forEach((player, id) => {
    scores[id] = 0;
  });
  
  for (let i = 0; i < room.canvas.length; i++) {
    const pixelOwner = room.canvas[i];
    if (pixelOwner && scores.hasOwnProperty(pixelOwner)) {
      scores[pixelOwner]++;
    }
  }
  
  room.players.forEach((player, id) => {
    player.score = scores[id] || 0;
  });
  
  return scores;
}

// Spawn a powerup
function spawnPowerup(room) {
  if (room.gameState !== 'playing') return;
  
  const powerup = {
    id: uuidv4(),
    type: POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)],
    x: 50 + Math.random() * (CANVAS_WIDTH - 100),
    y: 50 + Math.random() * (CANVAS_HEIGHT - 100),
    radius: 20,
  };
  
  room.powerups.push(powerup);
  io.to(room.code).emit('powerupSpawned', powerup);
}

// Start the game
function startGame(room) {
  room.gameState = 'countdown';
  room.countdownValue = 3;
  room.canvas = new Array(CANVAS_WIDTH * CANVAS_HEIGHT).fill(null);
  room.powerups = [];
  
  // Reset players
  room.players.forEach((player) => {
    player.score = 0;
    player.brushSize = 15;
    player.speed = 1;
    player.hasShield = false;
    player.isFrozen = false;
    player.effects = [];
    player.x = Math.random() * CANVAS_WIDTH;
    player.y = Math.random() * CANVAS_HEIGHT;
  });
  
  io.to(room.code).emit('gameCountdown', room.countdownValue);
  
  const countdownInterval = setInterval(() => {
    room.countdownValue--;
    if (room.countdownValue > 0) {
      io.to(room.code).emit('gameCountdown', room.countdownValue);
    } else {
      clearInterval(countdownInterval);
      room.gameState = 'playing';
      room.timeRemaining = GAME_DURATION;
      io.to(room.code).emit('gameStarted', {
        timeRemaining: room.timeRemaining,
        players: Array.from(room.players.values()),
        theme: room.theme,
      });
      
      // Start game timer
      room.gameTimer = setInterval(() => {
        room.timeRemaining--;
        calculateScores(room);
        
        io.to(room.code).emit('timeUpdate', {
          timeRemaining: room.timeRemaining,
          scores: Array.from(room.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            color: p.color,
            score: p.score,
          })),
        });
        
        if (room.timeRemaining <= 0) {
          endGame(room);
        }
      }, 1000);
      
      // Start powerup spawning
      room.powerupTimer = setInterval(() => {
        spawnPowerup(room);
      }, POWERUP_SPAWN_INTERVAL);
    }
  }, 1000);
}

// End the game
function endGame(room) {
  room.gameState = 'finished';
  
  if (room.gameTimer) clearInterval(room.gameTimer);
  if (room.powerupTimer) clearInterval(room.powerupTimer);
  
  calculateScores(room);
  
  const results = Array.from(room.players.values())
    .map(p => ({ id: p.id, name: p.name, color: p.color, score: p.score }))
    .sort((a, b) => b.score - a.score);
  
  io.to(room.code).emit('gameEnded', { results });
}

// Paint on canvas
function paint(room, playerId, x, y, brushSize) {
  const player = room.players.get(playerId);
  if (!player || player.isFrozen) return;
  
  const halfBrush = Math.floor(brushSize / 2);
  const changedPixels = [];
  
  for (let dy = -halfBrush; dy <= halfBrush; dy++) {
    for (let dx = -halfBrush; dx <= halfBrush; dx++) {
      // Circular brush
      if (dx * dx + dy * dy <= halfBrush * halfBrush) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        
        if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
          const idx = py * CANVAS_WIDTH + px;
          const currentOwner = room.canvas[idx];
          
          // Check if target has shield
          if (currentOwner && currentOwner !== playerId) {
            const targetPlayer = room.players.get(currentOwner);
            if (targetPlayer && targetPlayer.hasShield) {
              continue; // Shield protects their pixels
            }
          }
          
          room.canvas[idx] = playerId;
          changedPixels.push({ x: px, y: py, color: player.color });
        }
      }
    }
  }
  
  return changedPixels;
}

// Apply powerup effects
function applyPowerup(room, playerId, powerup) {
  const player = room.players.get(playerId);
  if (!player) return;
  
  switch (powerup.type) {
    case 'bomb':
      // Paint large area
      const bombRadius = 50;
      const changedPixels = [];
      for (let dy = -bombRadius; dy <= bombRadius; dy++) {
        for (let dx = -bombRadius; dx <= bombRadius; dx++) {
          if (dx * dx + dy * dy <= bombRadius * bombRadius) {
            const px = Math.floor(powerup.x + dx);
            const py = Math.floor(powerup.y + dy);
            if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
              const idx = py * CANVAS_WIDTH + px;
              room.canvas[idx] = playerId;
              changedPixels.push({ x: px, y: py, color: player.color });
            }
          }
        }
      }
      io.to(room.code).emit('canvasUpdate', changedPixels);
      io.to(room.code).emit('bombExploded', { x: powerup.x, y: powerup.y, color: player.color });
      break;
      
    case 'shield':
      player.hasShield = true;
      player.effects.push({ type: 'shield', endsAt: Date.now() + 8000 });
      setTimeout(() => {
        player.hasShield = false;
        player.effects = player.effects.filter(e => e.type !== 'shield');
        io.to(room.code).emit('playerUpdate', { id: playerId, hasShield: false });
      }, 8000);
      break;
      
    case 'eraser':
      // Clear area around powerup
      const eraserRadius = 40;
      const clearedPixels = [];
      for (let dy = -eraserRadius; dy <= eraserRadius; dy++) {
        for (let dx = -eraserRadius; dx <= eraserRadius; dx++) {
          if (dx * dx + dy * dy <= eraserRadius * eraserRadius) {
            const px = Math.floor(player.x + dx);
            const py = Math.floor(player.y + dy);
            if (px >= 0 && px < CANVAS_WIDTH && py >= 0 && py < CANVAS_HEIGHT) {
              const idx = py * CANVAS_WIDTH + px;
              if (room.canvas[idx] !== playerId) {
                room.canvas[idx] = null;
                clearedPixels.push({ x: px, y: py, color: null });
              }
            }
          }
        }
      }
      io.to(room.code).emit('canvasUpdate', clearedPixels);
      io.to(room.code).emit('eraserUsed', { x: player.x, y: player.y });
      break;
      
    case 'speed':
      player.speed = 2;
      player.brushSize = 25;
      player.effects.push({ type: 'speed', endsAt: Date.now() + 6000 });
      setTimeout(() => {
        player.speed = 1;
        player.brushSize = 15;
        player.effects = player.effects.filter(e => e.type !== 'speed');
        io.to(room.code).emit('playerUpdate', { id: playerId, speed: 1, brushSize: 15 });
      }, 6000);
      break;
      
    case 'freeze':
      // Freeze all other players
      room.players.forEach((p, id) => {
        if (id !== playerId) {
          p.isFrozen = true;
          p.effects.push({ type: 'frozen', endsAt: Date.now() + 3000 });
          setTimeout(() => {
            p.isFrozen = false;
            p.effects = p.effects.filter(e => e.type !== 'frozen');
            io.to(room.code).emit('playerUpdate', { id, isFrozen: false });
          }, 3000);
        }
      });
      io.to(room.code).emit('freezeActivated', { byPlayerId: playerId });
      break;
  }
  
  io.to(room.code).emit('powerupCollected', { 
    powerupId: powerup.id, 
    playerId, 
    type: powerup.type 
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Create a new room
  socket.on('createRoom', ({ playerName }) => {
    const room = createRoom(socket.id, playerName);
    const player = addPlayerToRoom(room, socket.id, playerName);
    socket.join(room.code);
    
    socket.emit('roomCreated', {
      roomCode: room.code,
      player,
      isHost: true,
      theme: room.theme,
    });
    
    console.log(`Room ${room.code} created by ${playerName}`);
  });
  
  // Join an existing room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = rooms.get(roomCode.toUpperCase());
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    if (room.gameState !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    if (room.players.size >= 8) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    const player = addPlayerToRoom(room, socket.id, playerName);
    socket.join(room.code);
    
    socket.emit('roomJoined', {
      roomCode: room.code,
      player,
      isHost: false,
      players: Array.from(room.players.values()),
      theme: room.theme,
    });
    
    // Notify others
    socket.to(room.code).emit('playerJoined', player);
    
    console.log(`${playerName} joined room ${room.code}`);
  });
  
  // Change theme (host only)
  socket.on('changeTheme', ({ roomCode, theme }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (!THEMES.includes(theme)) return;
    
    room.theme = theme;
    io.to(roomCode).emit('themeChanged', { theme });
    console.log(`Theme changed to ${theme} in room ${roomCode}`);
  });
  
  // Start game (host only)
  socket.on('startGame', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    if (room.players.size < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }
    
    startGame(room);
  });
  
  // Player movement and painting
  socket.on('move', ({ roomCode, x, y }) => {
    const room = rooms.get(roomCode);
    if (!room || room.gameState !== 'playing') return;
    
    const player = room.players.get(socket.id);
    if (!player || player.isFrozen) return;
    
    player.x = x;
    player.y = y;
    
    // Paint as player moves
    const changedPixels = paint(room, socket.id, x, y, player.brushSize);
    
    // Check for powerup collection
    const collectedPowerups = [];
    room.powerups = room.powerups.filter(powerup => {
      const dist = Math.sqrt((x - powerup.x) ** 2 + (y - powerup.y) ** 2);
      if (dist < powerup.radius + player.brushSize / 2) {
        collectedPowerups.push(powerup);
        return false;
      }
      return true;
    });
    
    collectedPowerups.forEach(powerup => {
      applyPowerup(room, socket.id, powerup);
    });
    
    // Broadcast movement and paint
    socket.to(room.code).emit('playerMoved', { 
      id: socket.id, 
      x, 
      y,
      brushSize: player.brushSize,
      speed: player.speed,
      hasShield: player.hasShield,
      isFrozen: player.isFrozen,
    });
    
    if (changedPixels && changedPixels.length > 0) {
      io.to(room.code).emit('canvasUpdate', changedPixels);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
const isHost = rooms.get(socket.id)?.hostId === socket.id;
if (isHost) {
  rooms.delete(socket.id);
  console.log(`Room ${socket.id} deleted (host disconnected)`);
}
    
    // Find and clean up rooms
    rooms.forEach((room, roomCode) => {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        
        if (room.players.size === 0) {
          // Clean up empty room
          if (room.gameTimer) clearInterval(room.gameTimer);
          if (room.powerupTimer) clearInterval(room.powerupTimer);
          rooms.delete(roomCode);
          console.log(`Room ${roomCode} deleted (empty)`);
        } else {
          // Notify remaining players
          io.to(roomCode).emit('playerLeft', { playerId: socket.id });
          
          // Transfer host if needed
          if (room.hostId === socket.id) {
            room.hostId = room.players.keys().next().value;
            io.to(roomCode).emit('hostChanged', { newHostId: room.hostId });
          }
        }
      }
    });
  });
  
  // Play again
  socket.on('playAgain', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || room.hostId !== socket.id) return;
    
    room.gameState = 'waiting';
    io.to(roomCode).emit('backToLobby', {
      players: Array.from(room.players.values()),
    });
  });
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Bind to all network interfaces for LAN play

httpServer.listen(PORT, HOST, () => {
  console.log(`🎨 Chromatic Clash server running!`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.0.106:${PORT}`);
  console.log(`\n📱 Share the Network URL with friends on the same WiFi!`);
});
