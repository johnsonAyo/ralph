module.exports = {
  apps: [
    {
      name: 'ralph-api',
      script: 'pnpm',
      args: 'run start',
      cwd: './apps/api',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'ralph-web',
      script: 'pnpm',
      args: 'run start',
      cwd: './apps/web',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
