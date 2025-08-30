const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const express = require('express');
const bodyParser = require('body-parser');
const chokidar = require('chokidar');
const login = require('priyanshu-fca'); // default export

const PORT = process.env.PORT || 3000;
const APPSTATE_FILE = './appstate.json';
const PREFIX_FILE = './prefix.txt';
const ADMIN_FILE = './admin_id.txt';

let commands = new Map();
let botApi = null;

// === Commands Loader ===
function loadCommands() {
  commands.clear();
  const commandFiles = fs.existsSync('./commands') ? fs.readdirSync('./commands').filter(f => f.endsWith('.js')) : [];
  for (const file of commandFiles) {
    try {
      const filePath = path.join(__dirname, 'commands', file);
      delete require.cache[require.resolve(filePath)];
      const cmd = require(filePath);
      if (cmd?.name && typeof cmd.run === 'function') commands.set(cmd.name, cmd);
    } catch (err) { console.error(`❌ Failed to load ${file}:`, err); }
  }
  console.log(`📂 Commands loaded: ${commands.size}`);
}
loadCommands();
chokidar.watch('./commands').on('change', file => {
  if (file.endsWith('.js')) {
    console.log(`♻ Reloading command: ${path.basename(file)}`);
    loadCommands();
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
      } catch (e) { console.error(`❌ Command ${cmdName} error:`, e); }
    }
  }
}

// === Run Bot ===
function runBot() {
  if (!fs.existsSync(APPSTATE_FILE)) return console.error('❌ appstate.json missing!');
  const appState = require(APPSTATE_FILE);

  login({ appState }, (err, api) => {
    if (err) return console.error('❌ Login failed:', err);

    botApi = api;
    api.setOptions({ listenEvents: true });
    api.listenMqtt(async (err, event) => { if (!err) await handleEvent(api, event); });

    // Keep-alive ping
    setInterval(() => {
      api.getUserInfo(api.getCurrentUserID(), () => console.log('💓 Keep-alive ping sent.'));
    }, 25 * 60 * 1000);

    console.log('✅ Bot started successfully!');
  });
}

// === Express Web Panel ===
const web = express();
web.use(bodyParser.urlencoded({ extended: true }));
web.use(bodyParser.json());

// Health check
web.get('/healthz', (req, res) => res.send('OK'));

// Web Panel
web.get('/', (req, res) => {
  res.send(`
    <h2>Jerry Bot Web Panel</h2>
    <form method="POST" action="/start">
      <textarea name="appstate" placeholder="Paste appstate JSON here" rows="10" cols="50"></textarea><br><br>
      <input type="text" name="prefix" placeholder="Bot Prefix" value="." /><br><br>
      <input type="text" name="admin" placeholder="Admin UID" /><br><br>
      <button type="submit">Start Bot</button>
    </form>
  `);
});

web.post('/start', (req, res) => {
  const { appstate, prefix, admin } = req.body;
  if (!appstate) return res.send('❌ Appstate required');

  try {
    const parsed = JSON.parse(appstate);
    fs.writeFileSync(APPSTATE_FILE, JSON.stringify(parsed, null, 2));
    fs.writeFileSync(PREFIX_FILE, prefix || '.');
    fs.writeFileSync(ADMIN_FILE, admin || '');
    global.PREFIX = prefix || '.';
    global.ADMIN_UID = admin || '';
    runBot();
    res.send('✅ Bot started successfully!');
  } catch (e) {
    res.send('❌ Invalid appstate JSON');
  }
});

web.listen(PORT, () => console.log(`🌐 Web panel running on port ${PORT}`));
