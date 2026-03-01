# Деплой vilit.ru на VPS (Ubuntu 24.04)

## Требования

- VPS: Ubuntu 24.04, минимум 1 ядро, 1 ГБ RAM
- Домен vilit.ru с доступом к DNS

---

## Шаг 1. Настройка DNS

В панели управления доменом (reg.ru) создайте A-записи:

| Тип | Имя      | Значение         |
|-----|----------|------------------|
| A   | @        | IP_ВАШЕГО_VPS    |
| A   | www      | IP_ВАШЕГО_VPS    |

DNS обновляется от 5 минут до 48 часов. Проверка:
```bash
ping vilit.ru
```

---

## Шаг 2. Подключение к серверу

```bash
ssh root@IP_ВАШЕГО_VPS
```

---

## Шаг 3. Настройка сервера (один раз)

Загрузите файлы проекта на сервер (с локального компьютера):

```bash
rsync -avz --exclude node_modules --exclude .git --exclude data \
  ./ root@IP_ВАШЕГО_VPS:/var/www/vilit.ru/
```

Затем на сервере запустите скрипт настройки:

```bash
cd /var/www/vilit.ru
sudo bash deploy/setup-server.sh
```

Скрипт автоматически:
- Обновит систему
- Установит Node.js 22, Nginx, PM2, Certbot
- Создаст пользователя `vilit`
- Настроит файрвол (UFW)
- Создаст swap 1 ГБ (для сервера с 1 ГБ RAM)
- Настроит Nginx как reverse proxy

---

## Шаг 4. Установка зависимостей и сборка

```bash
cd /var/www/vilit.ru
sudo -u vilit npm ci --omit=dev
sudo -u vilit npm run build
```

---

## Шаг 5. Создание .env

```bash
nano /var/www/vilit.ru/.env
```

Вставьте содержимое (подставьте реальные значения):

```env
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=ваш_chat_id
ADMIN_USERNAME=admin002
ADMIN_PASSWORD=ваш_пароль
API_KEY=ваш_ключ
SESSION_SECRET=ваш_секрет
```

Установите права:
```bash
chown vilit:vilit /var/www/vilit.ru/.env
chmod 600 /var/www/vilit.ru/.env
```

---

## Шаг 6. Запуск приложения

```bash
# Создать директорию для логов
mkdir -p /var/www/vilit.ru/logs
chown vilit:vilit /var/www/vilit.ru/logs

# Запустить через PM2
sudo -u vilit pm2 start /var/www/vilit.ru/ecosystem.config.cjs

# Проверить статус
sudo -u vilit pm2 status

# Сохранить для автозапуска
sudo -u vilit pm2 save
```

Проверка — сайт должен работать на порту 4321:
```bash
curl -s http://127.0.0.1:4321 | head -20
```

---

## Шаг 7. SSL-сертификат (Let's Encrypt)

Убедитесь, что DNS уже указывает на сервер, затем:

```bash
sudo certbot --nginx -d vilit.ru -d www.vilit.ru
```

Certbot автоматически:
- Получит сертификат
- Настроит HTTPS в Nginx
- Добавит редирект HTTP → HTTPS
- Настроит автообновление

Проверка автообновления:
```bash
sudo certbot renew --dry-run
```

---

## Обновление сайта

### Вариант 1: Скрипт (с локального компьютера)

```bash
bash deploy/deploy.sh root@IP_ВАШЕГО_VPS
```

### Вариант 2: Вручную

```bash
# 1. Загрузить обновлённые файлы
rsync -avz --delete \
  --exclude node_modules --exclude .git --exclude .env \
  --exclude "data/*.db" --exclude "data/*.db-wal" --exclude "data/*.db-shm" \
  --exclude logs --exclude uploads \
  ./ root@IP_ВАШЕГО_VPS:/var/www/vilit.ru/

# 2. На сервере
ssh root@IP_ВАШЕГО_VPS
cd /var/www/vilit.ru
chown -R vilit:vilit .
sudo -u vilit npm ci --omit=dev
sudo -u vilit npm run build
sudo -u vilit pm2 restart vilit
```

---

## Полезные команды

```bash
# Логи приложения
sudo -u vilit pm2 logs vilit

# Статус PM2
sudo -u vilit pm2 status

# Перезапуск
sudo -u vilit pm2 restart vilit

# Логи Nginx
tail -f /var/log/nginx/error.log

# Проверка конфига Nginx
nginx -t

# Перезагрузка Nginx
systemctl reload nginx

# Место на диске
df -h

# Использование RAM
free -h
```

---

## Структура на сервере

```
/var/www/vilit.ru/
├── dist/                 # Сборка Astro (серверная + клиентская)
│   ├── server/entry.mjs  # SSR-сервер (запускается PM2)
│   └── client/           # Статика (обслуживается Nginx)
├── data/
│   └── app.db            # SQLite база данных
├── logs/                 # Логи PM2
├── deploy/               # Скрипты деплоя
├── ecosystem.config.cjs  # Конфиг PM2
├── .env                  # Секреты (не в git!)
├── package.json
└── node_modules/
```

---

## Бэкап базы данных

База SQLite — один файл. Для бэкапа:

```bash
# На сервере
cp /var/www/vilit.ru/data/app.db /root/backups/app-$(date +%Y%m%d).db

# Или скачать на локальный компьютер
scp root@IP:/var/www/vilit.ru/data/app.db ./backup-app.db
```

Автоматический ежедневный бэкап (cron):
```bash
crontab -e
# Добавить строку:
0 3 * * * cp /var/www/vilit.ru/data/app.db /root/backups/app-$(date +\%Y\%m\%d).db
```
