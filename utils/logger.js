const path = require("path");
const fs = require("fs");

const configPath = path.join(__dirname, "..", "config.json");
let DEBUG = false;

try {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  DEBUG = config.DEBUG;
} catch (err) {
  console.error("⚠️ config.json load error, default DEBUG = false");
}

function log(...args) {
  if (DEBUG) console.log("[DEBUG]", ...args);
}

module.exports = { log };
