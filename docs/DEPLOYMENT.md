# Deployment — Wite AI

## Требования

- **Node.js** 18+
- **npm** 8+
- **Nginx** (production reverse proxy)
- **PM2** (менеджер процессов)

---

## Быстрый старт (production)

### 1. Сборка

```bash
npm install
npm run build
```

### 2. Создание архива

```powershell
# PowerShell
Compress-Archive -Path dist, server, package.json, package-lock.json -DestinationPath deploy.zip
```
```bash
# Linux/macOS
zip -r deploy.zip dist/ server/ package.json package-lock.json
```

### 3. На сервере

```bash
unzip deploy.zip -d /var/www/gemini/
cd /var/www/gemini
npm install --production
pm2 start server/index.js --name gemini-api
```

---

## Nginx конфигурация

Node.js сервер работает на порту `3001`. Nginx проксирует API запросы и отдаёт статику:

```nginx
server {
    listen 80;
    server_name gemini.example.com;

    root /var/www/gemini/dist;
    index index.html;

    # Статические файлы (фронтенд)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API → Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        client_max_body_size 50M;
    }

    # Кэширование статики
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### С SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d gemini.example.com
```

---

## PM2

```bash
# Запуск
pm2 start server/index.js --name gemini-api

# Автозапуск при перезагрузке
pm2 startup
pm2 save

# Мониторинг
pm2 status
pm2 logs gemini-api
pm2 monit

# Перезапуск
pm2 restart gemini-api
```

---

## Docker (альтернатива)

```bash
npm run build
docker-compose up --build -d
```

`docker-compose.yml` поднимает контейнер с Node.js + статикой.

---

## Переменные окружения

| Переменная | По умолчанию | Описание |
|-----------|-------------|----------|
| `PORT` | `3001` | Порт Node.js сервера |
| `DATA_DIR` | `./data` | Директория данных |
| `NODE_ENV` | — | `production` для прод |
| `KEY_ENCRYPTION_SECRET` | авто из файла | Ключ шифрования API ключей |

---

## Обновление

```bash
# 1. Пересобрать на локальной машине
npm run build
# Создать deploy.zip (dist/, server/, package.json, package-lock.json)

# 2. На сервере
cd /var/www/gemini
# Бекап данных
cp -r data data_backup_$(date +%Y%m%d)
# Развернуть новую версию
unzip -o deploy.zip
npm install --production
pm2 restart gemini-api
```

---

## Бекапы

```bash
# Резервная копия данных
tar -czf backup_$(date +%Y%m%d).tar.gz data/

# Восстановление
tar -xzf backup_20260303.tar.gz
pm2 restart gemini-api
```

Данные хранятся в `data/` — JSON файлы + PNG изображения. Резервируйте регулярно.

---

## Troubleshooting

### API возвращает 502 Bad Gateway
- Проверьте, что Node.js запущен: `pm2 status`
- Проверьте логи: `pm2 logs gemini-api`

### Изображения не загружаются
- Проверьте права: `chmod -R 755 /var/www/gemini/data`
- Nginx location для `/api/files/` должен проксировать к Node.js

### CORS ошибки
- В production CORS отключён (same-origin через Nginx)
- Для внешней галереи CORS включен автоматически

### Медленная загрузка
- Увеличьте `client_max_body_size` в Nginx
- Увеличьте `proxy_read_timeout` для долгих генераций
