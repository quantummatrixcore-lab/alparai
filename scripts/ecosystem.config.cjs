module.exports = {
  apps : [{
    name: "alparai",
    script: "node_modules/next/dist/bin/next",
    args: "start -H 127.0.0.1",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
