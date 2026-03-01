// PM2 конфигурация для vilit.ru
// Запуск: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'vilit',
      script: './dist/server/entry.mjs',
      cwd: '/var/www/vilit.ru',
      env: {
        HOST: '127.0.0.1',
        PORT: 4321,
        NODE_ENV: 'production',
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: '/var/www/vilit.ru/logs/error.log',
      out_file: '/var/www/vilit.ru/logs/out.log',
      merge_logs: true,
    },
  ],
};
