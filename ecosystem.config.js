module.exports = {
  apps: [
    {
      name: "timepass-bot",
      script: "index.js",
      watch: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}
