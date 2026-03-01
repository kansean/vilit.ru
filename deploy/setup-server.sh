#!/bin/bash
set -euo pipefail

# =============================================================================
# Скрипт первоначальной настройки VPS для vilit.ru
# Ubuntu 24.04, 1 ядро, 1 ГБ RAM
# Запуск: sudo bash setup-server.sh
# =============================================================================

APP_USER="vilit"
APP_DIR="/var/www/vilit.ru"
NODE_VERSION="22"
DOMAIN="vilit.ru"

echo "=== 1. Обновление системы ==="
apt update && apt upgrade -y

echo "=== 2. Установка базовых пакетов ==="
apt install -y curl wget git ufw nginx certbot python3-certbot-nginx

echo "=== 3. Установка Node.js $NODE_VERSION ==="
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt install -y nodejs
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"

echo "=== 4. Установка PM2 ==="
npm install -g pm2

echo "=== 5. Создание пользователя $APP_USER ==="
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$APP_USER"
    echo "Пользователь $APP_USER создан"
else
    echo "Пользователь $APP_USER уже существует"
fi

echo "=== 6. Создание директории приложения ==="
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

echo "=== 7. Настройка файрвола (UFW) ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status

echo "=== 8. Настройка Nginx ==="
# Удаляем дефолтный сайт
rm -f /etc/nginx/sites-enabled/default

# Копируем конфиг vilit.ru
cp "$APP_DIR/deploy/vilit.conf" /etc/nginx/sites-available/vilit.ru.conf
ln -sf /etc/nginx/sites-available/vilit.ru.conf /etc/nginx/sites-enabled/

# Увеличиваем лимит загрузки файлов
if ! grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    client_max_body_size 10M;' /etc/nginx/nginx.conf
fi

nginx -t && systemctl reload nginx
echo "Nginx настроен"

echo "=== 9. Настройка swap (для 1 ГБ RAM) ==="
if [ ! -f /swapfile ]; then
    fallocate -l 1G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "Swap 1 ГБ создан"
else
    echo "Swap уже настроен"
fi

echo "=== 10. Настройка PM2 для автозапуска ==="
pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER"

echo ""
echo "============================================="
echo "  Сервер готов!"
echo "============================================="
echo ""
echo "Следующие шаги:"
echo "1. Настройте DNS: A-запись $DOMAIN → IP этого сервера"
echo "2. Загрузите проект: rsync -avz --exclude node_modules --exclude .git ./ root@IP:$APP_DIR/"
echo "3. Установите зависимости: cd $APP_DIR && sudo -u $APP_USER npm ci --omit=dev"
echo "4. Соберите проект: sudo -u $APP_USER npm run build"
echo "5. Скопируйте .env: nano $APP_DIR/.env"
echo "6. Запустите: sudo -u $APP_USER pm2 start ecosystem.config.cjs"
echo "7. Сохраните PM2: sudo -u $APP_USER pm2 save"
echo "8. SSL: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
