module.exports = {
  apps: [
    {
      name: 'yodda-bot',
      script: 'bot.py',
      interpreter: 'venv/bin/python3',
      cwd: '/var/www/yodda-bot',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
    {
      name: 'yodda-preview',
      script: 'npm',
      args: 'run preview',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/preview-err.log',
      out_file: './logs/preview-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    }
  ]
};

