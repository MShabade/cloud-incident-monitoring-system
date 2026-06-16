module.exports = {
  apps: [{
    name: 'cloudops',
    cwd: './server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    env: { NODE_ENV: 'production' }
  }]
};
