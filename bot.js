const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');

// Încarcă setările din fișierul JSON
const configPath = path.resolve(__dirname, 'settings.json');
console.debug('[DEBUG] Loading config from:', configPath);

let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (err) {
  console.error('[ERROR] Failed to load settings.json! Error:', err);
  process.exit(1);
}

function createBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version || false,
  });

  bot.on('login', () => {
    console.log('[INFO] Bot logged in!');
  });

  bot.on('end', () => {
    console.warn('[WARN] Bot disconnected.');
    setTimeout(createBot, config.reconnectDelay || 5000);
  });

  bot.on('error', err => {
    console.error('[ERROR]', err);
  });

  // Anti-AFK – mișcare din 15 în 15 secunde
  setInterval(() => {
    if (bot.entity) {
      bot.setControlState('jump', true);
      setTimeout(() => bot.setControlState('jump', false), 500);
    }
  }, 15000);

  // Chat bot (opțional)
  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    if (message === '!ping') {
      bot.chat('pong');
    }
  });
}

createBot();