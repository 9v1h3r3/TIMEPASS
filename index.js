const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const login = require('priyanshu-fca');

const APPSTATE_FILE = './appstate.json';
const PREFIX_FILE = './prefix.txt';
const ADMIN_FILE = './admin_id.txt';

let commands = new Map();
let botApi = null;

// === Load prefix/admin ===
global.PREFIX = fs.existsSync(PREFIX_FILE) ? fs.readFileSync(PREFIX_FILE, 'utf8').trim() : '.';
global.ADMIN_UID = fs.existsSync(ADMIN_FILE) ? fs.readFileSync(ADMIN_FILE, 'utf8').trim() : '';

// === Commands Loader ===
function loadCommands() {
  commands.clear();
  const commandFiles = fs.existsSync('./commands')
    ? fs.readdirSync('./commands').filter(f => f.endsWith('.js'))
    : [];
  for (const file of commandFiles) {
    try {
      const filePath = path.join(__dirname, 'commands', file);
      delete require.cache[require.resolve(filePath)];
      const cmd = require(filePath);
      if (cmd?.name && typeof cmd.run === 'function') commands.set(cmd.name, cmd);
    } catch (err) {
      console.error(`❌ Failed to load ${file}:`, err);
    }
  }
  console.log(`📂 Commands loaded: ${commands.size}`);
}
loadCommands();

// Hot reload single command
chokidar.watch('./commands').on('change', file => {
  if (file.endsWith('.js')) {
    try {
      const filePath = path.resolve(file);
      delete require.cache[require.resolve(filePath)];
      const cmd = require(filePath);
      if (cmd?.name && typeof cmd.run === 'function') {
        commands.set(cmd.name, cmd);
        console.log(`♻ Reloaded command: ${cmd.name}`);
      }
    } catch (err) {
      console.error(`❌ Failed to reload ${file}:`, err);
    }
  }
});

// === Event Handler ===
async function handleEvent(api, event) {
  if (!event) return;
  if ((event.type === 'message' || event.type === 'message_reply') && event.body && event.body.startsWith(global.PREFIX)) {
    const args = event.body.slice(global.PREFIX.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    if (commands.has(cmdName)) {
      try {
        await commands.get(cmdName).run({ api, event, args, PREFIX: global.PREFIX, ADMIN_UID: global.ADMIN_UID, commands });
      } catch (e) {
        console.error(`❌ Command ${cmdName} error:`, e);
      }
    }
  }
}

// === Run Bot ===
function runBot() {
  if (!fs.existsSync(APPSTATE_FILE)) return console.error('❌ appstate.json missing!');
  let appState;
  try {
    appState = JSON.parse(fs.readFileSync(APPSTATE_FILE, 'utf-8'));
  } catch {
    return console.error('❌ Invalid appstate.json!');
  }

  login({ appState }, (err, api) => {
    if (err) return console.error('❌ Login failed:', err);

    botApi = api;
    api.setOptions({ listenEvents: true });
    api.listenMqtt(async (err, event) => {
      if (!err) await handleEvent(api, event);
    });

    // Keep-alive ping
    setInterval(() => {
      api.getUserInfo(api.getCurrentUserID(), () => console.log('💓 Keep-alive ping sent.'));
    }, 25 * 60 * 1000);

    console.log('✅ Bot started successfully!');
  });
}

runBot();
