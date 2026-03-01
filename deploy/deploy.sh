#!/bin/bash
set -euo pipefail

# =============================================================================
# Скрипт обновления vilit.ru на сервере
# Запускается на ЛОКАЛЬНОМ компьютере
# Использование: bash deploy/deploy.sh user@IP
# =============================================================================

if [ -z "${1:-}" ]; then
    echo "Использование: bash deploy/deploy.sh user@SERVER_IP"
    echo "Пример:        bash deploy/deploy.sh root@123.45.67.89"
    exit 1
fi

SERVER="$1"
APP_DIR="/var/www/vilit.ru"
APP_USER="vilit"

echo "=== Деплой vilit.ru на $SERVER ==="

echo "--- 1. Загрузка файлов ---"
rsync -avz --delete \
    --exclude node_modules \
    --exclude .git \
    --exclude .env \
    --exclude "data/*.db" \
    --exclude "data/*.db-wal" \
    --exclude "data/*.db-shm" \
    --exclude logs \
    --exclude uploads \
    ./ "$SERVER:$APP_DIR/"

echo "--- 2. Установка зависимостей и сборка ---"
ssh "$SERVER" bash -c "'
    cd $APP_DIR
    chown -R $APP_USER:$APP_USER $APP_DIR
    sudo -u $APP_USER npm ci --omit=dev
    sudo -u $APP_USER npm run build
'"

echo "--- 3. Создание директории логов ---"
ssh "$SERVER" "mkdir -p $APP_DIR/logs && chown $APP_USER:$APP_USER $APP_DIR/logs"

echo "--- 4. Перезапуск приложения ---"
ssh "$SERVER" "sudo -u $APP_USER pm2 restart vilit || sudo -u $APP_USER pm2 start $APP_DIR/ecosystem.config.cjs"

echo "--- 5. Обновление Nginx (если изменился конфиг) ---"
ssh "$SERVER" bash -c "'
    cp $APP_DIR/deploy/vilit.conf /etc/nginx/sites-available/vilit.ru.conf
    nginx -t && systemctl reload nginx
'"

echo ""
echo "=== Деплой завершён! ==="
echo "Проверьте сайт: https://vilit.ru"
