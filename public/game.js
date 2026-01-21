// ========================================
// CHROMATIC CLASH - Client Game Logic
// ========================================

// ========================================
// Sound Manager - Procedural Audio
// ========================================

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Play a tone with envelope
  playTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.enabled || !this.initialized) return;
    this.resume();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Countdown beep (3, 2, 1)
  countdown(number) {
    if (!this.enabled) return;
    this.init();
    const freq = number === 1 ? 880 : 440;
    this.playTone(freq, 0.2, 'sine', 0.6);
  }

  // Game start fanfare
  gameStart() {
    if (!this.enabled) return;
    this.init();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'square', 0.4), i * 80);
    });
  }

  // Power-up collect
  powerupCollect(type) {
    if (!this.enabled) return;
    this.init();
    
    switch (type) {
      case 'bomb':
        this.playTone(200, 0.1, 'sawtooth', 0.5);
        setTimeout(() => this.playTone(150, 0.3, 'sawtooth', 0.6), 100);
        break;
      case 'shield':
        this.playTone(600, 0.1, 'sine', 0.4);
        this.playTone(800, 0.2, 'sine', 0.4);
        break;
      case 'speed':
        [800, 1000, 1200].forEach((f, i) => {
          setTimeout(() => this.playTone(f, 0.1, 'square', 0.3), i * 50);
        });
        break;
      case 'freeze':
        this.playTone(1200, 0.3, 'sine', 0.4);
        this.playTone(800, 0.4, 'sine', 0.3);
        break;
      case 'eraser':
        this.playTone(300, 0.2, 'triangle', 0.5);
        break;
      default:
        this.playTone(660, 0.15, 'sine', 0.5);
    }
  }

  // Bomb explosion
  bombExplode() {
    if (!this.enabled) return;
    this.init();
    
    // Create noise for explosion
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  // Freeze sound
  freeze() {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  // Paint sound (subtle)
  paint() {
    if (!this.enabled || !this.initialized) return;
    // Very subtle paint sound - only play occasionally
    if (Math.random() > 0.9) {
      this.playTone(200 + Math.random() * 100, 0.05, 'sine', 0.1);
    }
  }

  // Timer warning (last 10 seconds)
  timerWarning() {
    if (!this.enabled) return;
    this.init();
    this.playTone(440, 0.1, 'square', 0.3);
  }

  // Game over
  gameOver(isWinner) {
    if (!this.enabled) return;
    this.init();
    
    if (isWinner) {
      // Victory fanfare
      const notes = [523, 659, 784, 880, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.2, 'square', 0.4), i * 120);
      });
    } else {
      // Loss sound
      const notes = [400, 350, 300, 250];
      notes.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.25, 'sawtooth', 0.3), i * 150);
      });
    }
  }

  // Button click
  click() {
    if (!this.enabled) return;
    this.init();
    this.playTone(800, 0.05, 'sine', 0.2);
  }

  // Player joined
  playerJoined() {
    if (!this.enabled) return;
    this.init();
    this.playTone(600, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(800, 0.1, 'sine', 0.3), 100);
  }

  // Player left
  playerLeft() {
    if (!this.enabled) return;
    this.init();
    this.playTone(400, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(300, 0.2, 'sine', 0.3), 100);
  }
}

// Global sound manager
const soundManager = new SoundManager();

// ========================================
// Main Game Class
// ========================================

class ChromaticClash {
  constructor() {
    // Socket connection
    this.socket = io();
    
    // Game state
    this.roomCode = null;
    this.player = null;
    this.players = new Map();
    this.isHost = false;
    this.gameState = 'menu'; // menu, lobby, countdown, playing, finished
    this.currentTheme = 'neon-night'; // Default theme
    
    // Canvas
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasRect = null;
    this.canvasWidth = this.canvas.width; // 800
    this.canvasHeight = this.canvas.height; // 600
    
    // Off-screen canvas for territory
    this.territoryCanvas = document.createElement('canvas');
    this.territoryCanvas.width = this.canvas.width;
    this.territoryCanvas.height = this.canvas.height;
    this.territoryCtx = this.territoryCanvas.getContext('2d');
    
    // Game data
    this.powerups = [];
    this.effects = [];
    this.timeRemaining = 90;
    this.totalTime = 90;
    
    // Input
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseOnCanvas = false;
    
    // Throttling for mobile performance
    this.lastMoveTime = 0;
    this.moveThrottle = 16; // ~60fps max (16ms between moves)
    this.pendingMove = null;
    this.rafPending = false;
    
    // Optimistic rendering (client-side painting)
    this.optimisticPixels = new Map(); // Track locally painted pixels
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Animation
    this.animationId = null;
    this.lastTime = 0;
    
    // Initialize
    this.setupDOM();
    this.setupSocketListeners();
    this.setupInputListeners();
  }

  // ========================================
  // DOM Setup
  // ========================================
  
  setupDOM() {
    // Screens
    this.screens = {
      menu: document.getElementById('menu-screen'),
      lobby: document.getElementById('lobby-screen'),
      game: document.getElementById('game-screen'),
      results: document.getElementById('results-screen'),
    };
    
    // Menu elements
    this.playerNameInput = document.getElementById('player-name');
    this.createRoomBtn = document.getElementById('create-room-btn');
    this.joinRoomBtn = document.getElementById('join-room-btn');
    this.joinInputContainer = document.getElementById('join-input-container');
    this.roomCodeInput = document.getElementById('room-code');
    this.confirmJoinBtn = document.getElementById('confirm-join-btn');
    
    // Lobby elements
    this.displayRoomCode = document.getElementById('display-room-code');
    this.copyCodeBtn = document.getElementById('copy-code-btn');
    this.playersGrid = document.getElementById('players-grid');
    this.startGameBtn = document.getElementById('start-game-btn');
    this.leaveRoomBtn = document.getElementById('leave-room-btn');
    this.waitingText = document.getElementById('waiting-text');
    
    // Theme elements
    this.themeSelector = document.getElementById('theme-selector');
    this.themeDisplay = document.getElementById('theme-display');
    this.currentThemeName = document.getElementById('current-theme-name');
    this.themeOptions = document.querySelectorAll('.theme-option');
    
    // Game elements
    this.timerDisplay = document.getElementById('timer-display');
    this.timerProgress = document.getElementById('timer-progress');
    this.scoreboard = document.getElementById('scoreboard');
    this.countdownOverlay = document.getElementById('countdown-overlay');
    this.countdownNumber = document.getElementById('countdown-number');
    
    // Results elements
    this.winnerShowcase = document.getElementById('winner-showcase');
    this.winnerName = document.getElementById('winner-name');
    this.winnerScore = document.getElementById('winner-score');
    this.finalStandings = document.getElementById('final-standings');
    this.playAgainBtn = document.getElementById('play-again-btn');
    this.backToMenuBtn = document.getElementById('back-to-menu-btn');
    
    // Notification
    this.notification = document.getElementById('notification');
    this.notificationText = document.getElementById('notification-text');
    
    // Button listeners with sound
    this.createRoomBtn.addEventListener('click', () => { soundManager.click(); this.createRoom(); });
    this.joinRoomBtn.addEventListener('click', () => { soundManager.click(); this.toggleJoinInput(); });
    this.confirmJoinBtn.addEventListener('click', () => { soundManager.click(); this.joinRoom(); });
    this.copyCodeBtn.addEventListener('click', () => { soundManager.click(); this.copyRoomCode(); });
    this.startGameBtn.addEventListener('click', () => { soundManager.click(); this.startGame(); });
    this.leaveRoomBtn.addEventListener('click', () => { soundManager.click(); this.leaveRoom(); });
    this.playAgainBtn.addEventListener('click', () => { soundManager.click(); this.playAgain(); });
    this.backToMenuBtn.addEventListener('click', () => { soundManager.click(); this.backToMenu(); });
    
    // Enter key listeners
    this.playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.createRoom();
    });
    this.roomCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.joinRoom();
    });
    
    // Theme selection listeners
    this.themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        if (!this.isHost) return;
        soundManager.click();
        const theme = option.dataset.theme;
        this.selectTheme(theme);
        this.socket.emit('changeTheme', { roomCode: this.roomCode, theme });
      });
    });
    
    // Add timer gradient SVG
    this.addTimerGradient();
    
    // Sound toggle
    this.setupSoundToggle();
  }
  
  addTimerGradient() {
    const svg = document.querySelector('.timer-ring svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#FF6B6B"/>
        <stop offset="100%" style="stop-color:#FF9F43"/>
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    this.timerProgress.style.stroke = 'url(#timerGradient)';
  }
  
  setupSoundToggle() {
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.getElementById('sound-icon');
    
    soundToggle.addEventListener('click', () => {
      const enabled = soundManager.toggle();
      soundIcon.textContent = enabled ? '🔊' : '🔇';
      soundToggle.classList.toggle('muted', !enabled);
      if (enabled) {
        soundManager.click();
      }
    });
  }

  // ========================================
  // Socket Listeners
  // ========================================
  
  setupSocketListeners() {
    // Room created
    this.socket.on('roomCreated', (data) => {
      this.roomCode = data.roomCode;
      this.player = data.player;
      this.isHost = data.isHost;
      this.currentTheme = data.theme || 'neon-night';
      this.players.set(data.player.id, data.player);
      this.showScreen('lobby');
      this.updateLobby();
      this.updateThemeUI();
    });
    
    // Room joined
    this.socket.on('roomJoined', (data) => {
      this.roomCode = data.roomCode;
      this.player = data.player;
      this.isHost = data.isHost;
      this.currentTheme = data.theme || 'neon-night';
      data.players.forEach(p => this.players.set(p.id, p));
      this.showScreen('lobby');
      this.updateLobby();
      this.updateThemeUI();
    });
    
    // Player joined
    this.socket.on('playerJoined', (player) => {
      this.players.set(player.id, player);
      this.updateLobby();
      this.showNotification(`${player.name} joined the game!`);
      soundManager.playerJoined();
    });
    
    // Player left
    this.socket.on('playerLeft', (data) => {
      const player = this.players.get(data.playerId);
      console.log('playerLeft', player);
      if (player) {
        this.showNotification(`${player.name} left the game`);
        this.players.delete(data.playerId);
        this.updateLobby();
        soundManager.playerLeft();
      }
    });
    
    // Host changed
    this.socket.on('hostChanged', (data) => {
      this.isHost = data.newHostId === this.socket.id;
      this.updateLobby();
    });
    
    // Game countdown
    this.socket.on('gameCountdown', (count) => {
      this.gameState = 'countdown';
      this.showScreen('game');
      this.countdownOverlay.classList.remove('hidden');
      this.countdownNumber.textContent = count;
      this.countdownNumber.style.animation = 'none';
      this.countdownNumber.offsetHeight; // Trigger reflow
      this.countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
      soundManager.countdown(count);
    });
    
    // Game started
    this.socket.on('gameStarted', (data) => {
      this.gameState = 'playing';
      this.timeRemaining = data.timeRemaining;
      this.totalTime = data.timeRemaining;
      this.currentTheme = data.theme || this.currentTheme;
      data.players.forEach(p => this.players.set(p.id, p));
      this.countdownOverlay.classList.add('hidden');
      this.territoryCtx.clearRect(0, 0, this.territoryCanvas.width, this.territoryCanvas.height);
      this.optimisticPixels.clear(); // Clear optimistic pixels on new game
      this.powerups = [];
      this.effects = [];
      this.updateScoreboard();
      this.startGameLoop();
      soundManager.gameStart();
    });
    
    // Time update
    this.socket.on('timeUpdate', (data) => {
      this.timeRemaining = data.timeRemaining;
      data.scores.forEach(s => {
        const player = this.players.get(s.id);
        if (player) player.score = s.score;
      });
      this.updateTimer();
      this.updateScoreboard();
      // Warning beep for last 10 seconds
      if (data.timeRemaining <= 10 && data.timeRemaining > 0) {
        soundManager.timerWarning();
      }
    });
    
    // Canvas update from server
    this.socket.on('canvasUpdate', (pixels) => {
      pixels.forEach(pixel => {
        const pixelKey = `${pixel.x},${pixel.y}`;
        
        // Remove from optimistic pixels (server confirmed)
        this.optimisticPixels.delete(pixelKey);
        
        if (pixel.color === null) {
          this.territoryCtx.clearRect(pixel.x, pixel.y, 1, 1);
        } else {
          this.territoryCtx.fillStyle = pixel.color;
          this.territoryCtx.fillRect(pixel.x, pixel.y, 1, 1);
        }
      });
    });
    
    // Player moved
    this.socket.on('playerMoved', (data) => {
      const player = this.players.get(data.id);
      if (player) {
        player.x = data.x;
        player.y = data.y;
        player.brushSize = data.brushSize;
        player.speed = data.speed;
        player.hasShield = data.hasShield;
        player.isFrozen = data.isFrozen;
      }
    });
    
    // Player update
    this.socket.on('playerUpdate', (data) => {
      const player = this.players.get(data.id);
      if (player) {
        Object.assign(player, data);
      }
    });
    
    // Powerup spawned
    this.socket.on('powerupSpawned', (powerup) => {
      this.powerups.push(powerup);
    });
    
    // Powerup collected
    this.socket.on('powerupCollected', (data) => {
      this.powerups = this.powerups.filter(p => p.id !== data.powerupId);
      const collector = this.players.get(data.playerId);
      if (collector) {
        this.showNotification(`${collector.name} got ${this.getPowerupEmoji(data.type)} ${data.type}!`);
      }
      soundManager.powerupCollect(data.type);
    });
    
    // Bomb exploded
    this.socket.on('bombExploded', (data) => {
      this.effects.push({
        type: 'bomb',
        x: data.x,
        y: data.y,
        color: data.color,
        startTime: performance.now(),
        duration: 500,
      });
      soundManager.bombExplode();
    });
    
    // Eraser used
    this.socket.on('eraserUsed', (data) => {
      this.effects.push({
        type: 'eraser',
        x: data.x,
        y: data.y,
        startTime: performance.now(),
        duration: 400,
      });
    });
    
    // Freeze activated
    this.socket.on('freezeActivated', (data) => {
      this.effects.push({
        type: 'freeze',
        startTime: performance.now(),
        duration: 500,
      });
      soundManager.freeze();
      const freezer = this.players.get(data.byPlayerId);
      if (freezer && freezer.id !== this.socket.id) {
        this.showNotification(`${freezer.name} froze everyone! ❄️`);
      }
    });
    
    // Game ended
    this.socket.on('gameEnded', (data) => {
      this.gameState = 'finished';
      this.stopGameLoop();
      this.showResults(data.results);
      // Play victory or defeat sound
      const isWinner = data.results[0]?.id === this.socket.id;
      soundManager.gameOver(isWinner);
    });
    
    // Back to lobby
    this.socket.on('backToLobby', (data) => {
      this.gameState = 'lobby';
      data.players.forEach(p => this.players.set(p.id, p));
      this.showScreen('lobby');
      this.updateLobby();
    });
    
    // Theme changed
    this.socket.on('themeChanged', (data) => {
      this.currentTheme = data.theme;
      this.selectTheme(data.theme);
      this.showNotification(`Map theme changed to ${this.getThemeDisplayName(data.theme)}`);
    });
    
    // Error
    this.socket.on('error', (data) => {
      this.showNotification(data.message, 'error');
    });
  }

  // ========================================
  // Input Listeners
  // ========================================
  
  setupInputListeners() {
    // Mouse move on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.gameState !== 'playing') return;
      const coords = this.getCanvasCoordinates(e.clientX, e.clientY);
      if (!coords) return;
      
      this.mouseX = coords.x;
      this.mouseY = coords.y;
      this.isMouseOnCanvas = true;
      
      // Send movement to server (throttled)
      this.sendMoveToServer(this.mouseX, this.mouseY);
    });
    
    this.canvas.addEventListener('mouseenter', () => {
      this.isMouseOnCanvas = true;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseOnCanvas = false;
    });
    
    // Touch support - improved for mobile with throttling
    this.canvas.addEventListener('touchmove', (e) => {
      if (this.gameState !== 'playing') return;
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
      if (!coords) return;
      
      this.mouseX = coords.x;
      this.mouseY = coords.y;
      this.isMouseOnCanvas = true;
      
      // Optimistic rendering for immediate feedback
      this.paintOptimistically(this.mouseX, this.mouseY);
      
      // Send movement to server (throttled)
      this.sendMoveToServer(this.mouseX, this.mouseY);
    }, { passive: false });
    
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.gameState !== 'playing') return;
      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      const coords = this.getCanvasCoordinates(touch.clientX, touch.clientY);
      if (!coords) return;
      
      this.mouseX = coords.x;
      this.mouseY = coords.y;
      this.isMouseOnCanvas = true;
      
      // Optimistic rendering for immediate feedback
      this.paintOptimistically(this.mouseX, this.mouseY);
      
      // Send movement to server immediately on touch start
      this.socket.emit('move', {
        roomCode: this.roomCode,
        x: this.mouseX,
        y: this.mouseY,
      });
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isMouseOnCanvas = false;
    }, { passive: false });
    
    // Prevent scrolling and zooming on touch
    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.isMouseOnCanvas = false;
    }, { passive: false });
  }
  
  // Throttled server communication
  sendMoveToServer(x, y) {
    const now = performance.now();
    
    // Throttle to ~60fps (16ms between sends)
    if (now - this.lastMoveTime < this.moveThrottle) {
      this.pendingMove = { x, y };
      if (!this.rafPending) {
        this.rafPending = true;
        requestAnimationFrame(() => {
          if (this.pendingMove) {
            this.socket.emit('move', {
              roomCode: this.roomCode,
              x: this.pendingMove.x,
              y: this.pendingMove.y,
            });
            this.lastMoveTime = performance.now();
            this.pendingMove = null;
          }
          this.rafPending = false;
        });
      }
      return;
    }
    
    // Send immediately if enough time has passed
    this.socket.emit('move', {
      roomCode: this.roomCode,
      x: x,
      y: y,
    });
    this.lastMoveTime = now;
    this.pendingMove = null;
  }
  
  // Optimistic client-side painting for immediate feedback
  paintOptimistically(x, y) {
    if (!this.player) return;
    
    const currentPlayer = this.players.get(this.socket.id);
    if (!currentPlayer) return;
    
    const brushSize = currentPlayer.brushSize || 15;
    const halfBrush = Math.floor(brushSize / 2);
    const color = currentPlayer.color;
    
    // Paint pixels locally immediately
    for (let dy = -halfBrush; dy <= halfBrush; dy++) {
      for (let dx = -halfBrush; dx <= halfBrush; dx++) {
        if (dx * dx + dy * dy <= halfBrush * halfBrush) {
          const px = Math.floor(x + dx);
          const py = Math.floor(y + dy);
          
          if (px >= 0 && px < this.canvasWidth && py >= 0 && py < this.canvasHeight) {
            const pixelKey = `${px},${py}`;
            
            // Only paint if not already painted optimistically
            if (!this.optimisticPixels.has(pixelKey)) {
              this.territoryCtx.fillStyle = color;
              this.territoryCtx.fillRect(px, py, 1, 1);
              this.optimisticPixels.set(pixelKey, color);
            }
          }
        }
      }
    }
  }
  
  // Get canvas coordinates accounting for scaling
  getCanvasCoordinates(clientX, clientY) {
    this.updateCanvasRect();
    
    // Calculate scale factor between displayed size and actual canvas size
    const scaleX = this.canvasWidth / this.canvasRect.width;
    const scaleY = this.canvasHeight / this.canvasRect.height;
    
    // Get relative position within the displayed canvas
    const relativeX = clientX - this.canvasRect.left;
    const relativeY = clientY - this.canvasRect.top;
    
    // Scale to actual canvas coordinates
    const canvasX = relativeX * scaleX;
    const canvasY = relativeY * scaleY;
    
    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(this.canvasWidth - 1, canvasX));
    const clampedY = Math.max(0, Math.min(this.canvasHeight - 1, canvasY));
    
    // Check if coordinates are within canvas bounds
    if (relativeX < 0 || relativeX > this.canvasRect.width ||
        relativeY < 0 || relativeY > this.canvasRect.height) {
      return null;
    }
    
    return { x: clampedX, y: clampedY };
  }
  
  updateCanvasRect() {
    this.canvasRect = this.canvas.getBoundingClientRect();
  }

  // ========================================
  // Room Management
  // ========================================
  
  createRoom() {
    const name = this.playerNameInput.value.trim();
    if (!name) {
      this.showNotification('Please enter your name', 'error');
      this.playerNameInput.focus();
      return;
    }
    this.socket.emit('createRoom', { playerName: name });
  }
  
  toggleJoinInput() {
    this.joinInputContainer.classList.toggle('hidden');
    if (!this.joinInputContainer.classList.contains('hidden')) {
      this.roomCodeInput.focus();
    }
  }
  
  joinRoom() {
    const name = this.playerNameInput.value.trim();
    const code = this.roomCodeInput.value.trim().toUpperCase();
    
    if (!name) {
      this.showNotification('Please enter your name', 'error');
      this.playerNameInput.focus();
      return;
    }
    if (!code || code.length !== 5) {
      this.showNotification('Please enter a valid room code', 'error');
      this.roomCodeInput.focus();
      return;
    }
    
    this.socket.emit('joinRoom', { roomCode: code, playerName: name });
  }
  
  copyRoomCode() {
    navigator.clipboard.writeText(this.roomCode).then(() => {
      this.showNotification('Room code copied!');
    });
  }
  
  leaveRoom() {
    window.location.reload();
  }
  
  startGame() {
    if (!this.isHost) return;
    this.socket.emit('startGame', { roomCode: this.roomCode });
  }
  
  playAgain() {
    if (this.isHost) {
      this.socket.emit('playAgain', { roomCode: this.roomCode });
    }
  }
  
  backToMenu() {
    window.location.reload();
  }

  // ========================================
  // UI Updates
  // ========================================
  
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
    
    if (screenName === 'game') {
      this.updateCanvasRect();
    }
  }
  
  updateLobby() {
    // Update room code display
    this.displayRoomCode.textContent = this.roomCode;
    
    // Update players grid
    this.playersGrid.innerHTML = '';
    const playerArray = Array.from(this.players.values());
    
    // Show up to 8 player slots
    for (let i = 0; i < 8; i++) {
      const player = playerArray[i];
      const card = document.createElement('div');
      
      if (player) {
        const isCurrentHost = i === 0 || player.id === Array.from(this.players.keys())[0];
        card.className = `player-card${isCurrentHost ? ' host' : ''}`;
        card.style.setProperty('--player-color', player.color);
        card.innerHTML = `
          <div class="player-avatar" style="background: ${player.color}">
            ${player.name.charAt(0)}
          </div>
          <div class="player-name">${player.name}</div>
        `;
      } else {
        card.className = 'player-card empty';
        card.innerHTML = `
          <div class="player-avatar">?</div>
          <div class="player-name">Waiting...</div>
        `;
      }
      
      this.playersGrid.appendChild(card);
    }
    
    // Update start button visibility
    if (this.isHost && this.players.size >= 2) {
      this.startGameBtn.classList.remove('hidden');
      this.waitingText.textContent = 'Ready to start!';
    } else if (this.isHost) {
      this.startGameBtn.classList.add('hidden');
      this.waitingText.textContent = 'Waiting for more players...';
    } else {
      this.startGameBtn.classList.add('hidden');
      this.waitingText.textContent = 'Waiting for host to start...';
    }
  }
  
  // Theme methods
  selectTheme(theme) {
    this.currentTheme = theme;
    
    // Update UI selection
    this.themeOptions.forEach(option => {
      option.classList.toggle('selected', option.dataset.theme === theme);
    });
    
    // Update display name for non-hosts
    if (this.currentThemeName) {
      this.currentThemeName.textContent = this.getThemeDisplayName(theme);
    }
  }
  
  updateThemeUI() {
    // Show theme selector for host, theme display for others
    if (this.isHost) {
      this.themeSelector.classList.remove('hidden');
      this.themeDisplay.classList.add('hidden');
    } else {
      this.themeSelector.classList.add('hidden');
      this.themeDisplay.classList.remove('hidden');
    }
    
    // Update current selection
    this.selectTheme(this.currentTheme);
  }
  
  getThemeDisplayName(theme) {
    const names = {
      'neon-night': 'Neon Night',
      'ocean-depths': 'Ocean Depths',
      'sunset-valley': 'Sunset Valley',
      'forest-mist': 'Forest Mist',
      'cosmic-void': 'Cosmic Void',
      'candy-land': 'Candy Land',
    };
    return names[theme] || 'Unknown';
  }
  
  getThemeColors() {
    const themes = {
      'neon-night': {
        bg1: '#1a1a2e',
        bg2: '#16213e',
        gridColor: 'rgba(255, 107, 107, 0.08)',
        gridSize: 40,
      },
      'ocean-depths': {
        bg1: '#0077b6',
        bg2: '#001845',
        gridColor: 'rgba(255, 255, 255, 0.05)',
        gridSize: 30,
        waves: true,
      },
      'sunset-valley': {
        bg1: '#ff6b6b',
        bg2: '#6bcb77',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        gridSize: 50,
        gradient: true,
      },
      'forest-mist': {
        bg1: '#1d3c34',
        bg2: '#40916c',
        gridColor: 'rgba(255, 255, 255, 0.05)',
        gridSize: 35,
        mist: true,
      },
      'cosmic-void': {
        bg1: '#0a0a0a',
        bg2: '#1a1a2e',
        gridColor: 'rgba(255, 255, 255, 0.03)',
        gridSize: 60,
        stars: true,
      },
      'candy-land': {
        bg1: '#ff9a9e',
        bg2: '#a18cd1',
        gridColor: 'rgba(255, 255, 255, 0.15)',
        gridSize: 45,
        bubbles: true,
      },
    };
    return themes[this.currentTheme] || themes['neon-night'];
  }
  
  drawThemedBackground(ctx, width, height, theme) {
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += theme.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += theme.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Theme-specific effects
    if (theme.stars) {
      this.drawStars(ctx, width, height);
    }
    if (theme.waves) {
      this.drawWaves(ctx, width, height);
    }
    if (theme.mist) {
      this.drawMist(ctx, width, height);
    }
    if (theme.bubbles) {
      this.drawBubbles(ctx, width, height);
    }
  }
  
  drawStars(ctx, width, height) {
    // Use seeded random for consistent star positions
    const starCount = 50;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < starCount; i++) {
      const x = (Math.sin(i * 12.9898) * 43758.5453) % 1 * width;
      const y = (Math.sin(i * 78.233) * 43758.5453) % 1 * height;
      const size = ((i % 3) + 1) * 0.8;
      const twinkle = Math.sin(performance.now() / 500 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle;
      ctx.beginPath();
      ctx.arc(Math.abs(x), Math.abs(y), size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  
  drawWaves(ctx, width, height) {
    const time = performance.now() / 1000;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const yOffset = height * 0.2 + i * (height * 0.15);
      for (let x = 0; x <= width; x += 5) {
        const y = yOffset + Math.sin(x * 0.02 + time + i) * 15;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }
  }
  
  drawMist(ctx, width, height) {
    const time = performance.now() / 3000;
    
    // Draw soft circular mist patches
    for (let i = 0; i < 3; i++) {
      const x = (Math.sin(time + i * 2) * 0.3 + 0.5) * width;
      const y = (Math.cos(time * 0.7 + i * 2) * 0.3 + 0.5) * height;
      const radius = 150 + i * 50;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  drawBubbles(ctx, width, height) {
    const time = performance.now() / 1000;
    const bubbleCount = 15;
    
    for (let i = 0; i < bubbleCount; i++) {
      const baseX = ((i * 53) % width);
      const speed = 0.5 + (i % 3) * 0.3;
      const y = ((time * speed * 50 + i * 40) % (height + 40)) - 20;
      const x = baseX + Math.sin(time + i) * 20;
      const radius = 5 + (i % 4) * 3;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, height - y, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Bubble highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(x - radius * 0.3, height - y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  updateTimer() {
    this.timerDisplay.textContent = this.timeRemaining;
    
    // Update circular progress
    const circumference = 2 * Math.PI * 45; // r = 45
    const progress = (this.totalTime - this.timeRemaining) / this.totalTime;
    const offset = circumference * progress;
    this.timerProgress.style.strokeDashoffset = offset;
    
    // Color change when low
    if (this.timeRemaining <= 10) {
      this.timerProgress.style.stroke = '#FF6B6B';
    } else if (this.timeRemaining <= 30) {
      this.timerProgress.style.stroke = '#FF9F43';
    }
  }
  
  updateScoreboard() {
    const sortedPlayers = Array.from(this.players.values())
      .sort((a, b) => b.score - a.score);
    
    this.scoreboard.innerHTML = sortedPlayers.map(player => `
      <div class="score-item" style="--player-color: ${player.color}">
        <div class="score-color" style="background: ${player.color}"></div>
        <span class="score-name">${player.name}</span>
        <span class="score-value">${this.formatScore(player.score)}</span>
      </div>
    `).join('');
  }
  
  formatScore(score) {
    if (score >= 1000) {
      return (score / 1000).toFixed(1) + 'k';
    }
    return score.toString();
  }
  
  showResults(results) {
    this.showScreen('results');
    
    // Winner showcase
    const winner = results[0];
    this.winnerShowcase.style.setProperty('--player-color', winner.color);
    this.winnerName.textContent = winner.name;
    this.winnerName.style.color = winner.color;
    this.winnerScore.textContent = `${winner.score.toLocaleString()} pixels`;
    
    // Final standings
    this.finalStandings.innerHTML = results.map((player, index) => {
      const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
      return `
        <div class="standing-item">
          <span class="standing-rank ${rankClass}">#${index + 1}</span>
          <div class="standing-color" style="background: ${player.color}"></div>
          <span class="standing-name">${player.name}</span>
          <span class="standing-score">${player.score.toLocaleString()}</span>
        </div>
      `;
    }).join('');
    
    // Show/hide play again button based on host status
    this.playAgainBtn.style.display = this.isHost ? 'block' : 'none';
  }
  
  showNotification(message, type = 'info') {
    this.notificationText.textContent = message;
    this.notification.classList.add('show');
    this.notification.classList.remove('hidden');
    
    setTimeout(() => {
      this.notification.classList.remove('show');
    }, 3000);
  }
  
  getPowerupEmoji(type) {
    const emojis = {
      bomb: '💣',
      shield: '🛡️',
      eraser: '🧹',
      speed: '⚡',
      freeze: '❄️',
    };
    return emojis[type] || '✨';
  }

  // ========================================
  // Game Loop
  // ========================================
  
  startGameLoop() {
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  stopGameLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  gameLoop() {
    const now = performance.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    
    this.render(deltaTime);
    
    if (this.gameState === 'playing') {
      this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
  }
  
  render(deltaTime) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const theme = this.getThemeColors();
    
    // Draw themed background
    this.drawThemedBackground(ctx, width, height, theme);
    
    // Draw territory
    ctx.drawImage(this.territoryCanvas, 0, 0);
    
    // Draw powerups
    this.powerups.forEach(powerup => {
      this.drawPowerup(ctx, powerup);
    });
    
    // Draw effects
    this.effects = this.effects.filter(effect => {
      const elapsed = performance.now() - effect.startTime;
      if (elapsed >= effect.duration) return false;
      
      const progress = elapsed / effect.duration;
      this.drawEffect(ctx, effect, progress);
      return true;
    });
    
    // Draw other players
    this.players.forEach((player, id) => {
      if (id !== this.socket.id) {
        this.drawPlayer(ctx, player);
      }
    });
    
    // Draw current player cursor
    if (this.isMouseOnCanvas && this.player) {
      const currentPlayer = this.players.get(this.socket.id);
      if (currentPlayer) {
        this.drawCursor(ctx, this.mouseX, this.mouseY, currentPlayer);
      }
    }
  }
  
  drawPowerup(ctx, powerup) {
    const pulse = Math.sin(performance.now() / 200) * 0.2 + 1;
    const radius = powerup.radius * pulse;
    
    // Glow
    const gradient = ctx.createRadialGradient(
      powerup.x, powerup.y, 0,
      powerup.x, powerup.y, radius * 2
    );
    gradient.addColorStop(0, this.getPowerupColor(powerup.type, 0.4));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(powerup.x, powerup.y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Background circle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(powerup.x, powerup.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = this.getPowerupColor(powerup.type, 1);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Emoji
    ctx.font = `${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.getPowerupEmoji(powerup.type), powerup.x, powerup.y);
  }
  
  getPowerupColor(type, alpha) {
    const colors = {
      bomb: `rgba(255, 107, 107, ${alpha})`,
      shield: `rgba(255, 215, 0, ${alpha})`,
      eraser: `rgba(170, 150, 218, ${alpha})`,
      speed: `rgba(255, 159, 67, ${alpha})`,
      freeze: `rgba(135, 206, 250, ${alpha})`,
    };
    return colors[type] || `rgba(255, 255, 255, ${alpha})`;
  }
  
  drawPlayer(ctx, player) {
    if (!player.x || !player.y) return;
    
    const brushSize = player.brushSize || 15;
    
    // Draw trail/brush indicator
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(player.x, player.y, brushSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Shield effect
    if (player.hasShield) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(player.x, player.y, brushSize / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Frozen effect
    if (player.isFrozen) {
      ctx.fillStyle = 'rgba(135, 206, 250, 0.3)';
      ctx.beginPath();
      ctx.arc(player.x, player.y, brushSize / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Player name label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(player.x - 30, player.y - brushSize / 2 - 25, 60, 18);
    ctx.fillStyle = player.color;
    ctx.font = '12px Outfit';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.name.substring(0, 8), player.x, player.y - brushSize / 2 - 16);
  }
  
  drawCursor(ctx, x, y, player) {
    const brushSize = player.brushSize || 15;
    
    // Inner filled circle (semi-transparent)
    ctx.fillStyle = player.color + '40';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer ring
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // Crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - brushSize / 2 - 5, y);
    ctx.lineTo(x - brushSize / 2 + 2, y);
    ctx.moveTo(x + brushSize / 2 - 2, y);
    ctx.lineTo(x + brushSize / 2 + 5, y);
    ctx.moveTo(x, y - brushSize / 2 - 5);
    ctx.lineTo(x, y - brushSize / 2 + 2);
    ctx.moveTo(x, y + brushSize / 2 - 2);
    ctx.lineTo(x, y + brushSize / 2 + 5);
    ctx.stroke();
    
    // Shield indicator
    if (player.hasShield) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Frozen indicator
    if (player.isFrozen) {
      ctx.fillStyle = 'rgba(135, 206, 250, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2 + 5, 0, Math.PI * 2);
      ctx.fill();
      
      // Frozen text
      ctx.fillStyle = '#87CEEB';
      ctx.font = 'bold 14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('FROZEN', x, y - brushSize / 2 - 20);
    }
  }
  
  drawEffect(ctx, effect, progress) {
    switch (effect.type) {
      case 'bomb':
        const bombRadius = 50 + 50 * progress;
        const opacity = 1 - progress;
        ctx.strokeStyle = `rgba(255, 107, 107, ${opacity})`;
        ctx.lineWidth = 5 * (1 - progress);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, bombRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner flash
        ctx.fillStyle = `rgba(255, 200, 100, ${opacity * 0.5})`;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, bombRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
        
      case 'eraser':
        const eraserRadius = 40 * (1 + progress);
        const eraserOpacity = 1 - progress;
        ctx.strokeStyle = `rgba(170, 150, 218, ${eraserOpacity})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, eraserRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
        
      case 'freeze':
        const freezeOpacity = 1 - progress;
        ctx.fillStyle = `rgba(135, 206, 250, ${freezeOpacity * 0.3})`;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
    }
  }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.game = new ChromaticClash();
});
