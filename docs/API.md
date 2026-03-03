# API Reference — Wite AI

## Обзор

REST API сервер на Node.js + Express 5. Работает на порту `3001` (по умолчанию), в production за Nginx reverse proxy.

**Аутентификация:** все защищённые маршруты требуют заголовок `Authorization: Bearer <token>`.  
Токен получается через `POST /api/login`.

---

## Публичные эндпоинты

### `POST /api/login`
Аутентификация пользователя.

```json
// Request
{ "userId": "admin", "password": "secret" }

// Response 200
{ "token": "abc123...", "userId": "admin", "isAdmin": true }
```

### `GET /api/system-settings`
Системные настройки (тема, язык, API провайдер).

### `GET /api/files/:userId/*`
Отдача файлов (изображения, миниатюры). Поддерживает CORS для внешней галереи.

### `GET /api/external_gallery?key=<API_KEY>`
Внешняя галерея — отдаёт публичные изображения по API ключу.

Параметры:
| Параметр | Описание |
|----------|----------|
| `key` | API ключ внешней галереи (обязательный) |
| `page` | Номер страницы (опционально) |
| `limit` | Изображений на страницу (по умолчанию 50) |

---

## Авторизованные эндпоинты (Bearer token)

### История генераций

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/save` | Сохранить генерацию (изображение + метаданные) |
| `GET` | `/api/history/:userId` | История пользователя (все даты) |
| `GET` | `/api/history/:userId?date=YYYY-MM-DD` | История за конкретную дату |
| `DELETE` | `/api/history/:userId/:id` | Удалить запись |

**POST /api/save — пример:**
```json
{
  "userId": "admin",
  "type": "single",
  "model": "gemini-3.1-flash-image-preview",
  "prompt": "котёнок в космосе",
  "image": "data:image/png;base64,...",
  "text": "Result text",
  "aspectRatio": "16:9",
  "resolution": "1K",
  "timestamp": 1709424000
}
```

### Настройки

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/settings/:userId` | Настройки пользователя |
| `POST` | `/api/settings/:userId` | Сохранить настройки |
| `GET` | `/api/user-preferences/:userId` | Предпочтения (тема, язык) |
| `POST` | `/api/user-preferences/:userId` | Сохранить предпочтения |

### Пресеты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/presets` | Список пресетов |
| `POST` | `/api/presets` | Создать пресет |
| `DELETE` | `/api/presets/:name` | Удалить пресет |

### Cloud Batch

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/cloud-jobs/:userId` | Cloud Batch задания |
| `POST` | `/api/cloud-jobs/:userId` | Сохранить задания |

---

## Только для администратора

### Пользователи

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/users` | Список пользователей |
| `POST` | `/api/users` | Создать / обновить пользователя |
| `DELETE` | `/api/users/:userId` | Удалить пользователя |

### Серверные API ключи

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/server-keys` | Список ключей (зашифрованные) |
| `POST` | `/api/server-keys` | Добавить ключ |
| `DELETE` | `/api/server-keys/:id` | Удалить ключ |
| `POST` | `/api/server-keys/:id/toggle` | Вкл/выкл ключ |

### Прочее

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/admin/stats` | Статистика использования (по дням, моделям) |
| `GET` | `/api/key` | API ключ внешней галереи |
| `POST` | `/api/system-settings` | Обновить системные настройки |

---

## Формат данных

### Структура директории пользователя
```
data/
├── users.json                 # Учётные записи (PBKDF2 хеши)
├── system_settings.json       # Глобальные настройки
├── sessions.json              # Активные сессии
├── .encryption_key            # Ключ шифрования API ключей
└── {userId}/
    ├── images/{YYYY-MM-DD}/   # PNG изображения
    │   ├── {timestamp}_{id}.png
    │   └── {timestamp}_{id}_thumb.png  # Миниатюры (300px)
    ├── logs/{YYYY-MM-DD}/     # JSON логи генераций
    │   └── {timestamp}_{id}.json
    ├── cloud_jobs.json        # Cloud Batch задания
    └── settings.json          # Настройки пользователя
```

### Формат лога генерации
```json
{
  "id": "abc1234",
  "timestamp": 1709424000,
  "dateStr": "2026-03-03",
  "userId": "admin",
  "type": "single",
  "model": "gemini-3.1-flash-image-preview",
  "prompt": "котёнок в космосе",
  "imageRelativePath": "images/2026-03-03/1709424000_abc1234.png",
  "resultText": "...",
  "aspectRatio": "16:9",
  "resolution": "1K",
  "cost": 0.067,
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 1120,
    "totalTokenCount": 1135
  }
}
```

---

## Rate Limiting

| Лимит | Значение |
|-------|----------|
| Общий | 200 запросов / мин |
| Логин | 15 попыток / 15 мин |

## Коды ошибок

| Код | Описание |
|-----|----------|
| `401` | Не авторизован / невалидный токен |
| `403` | Нет прав (не админ) |
| `404` | Ресурс не найден |
| `429` | Превышен лимит запросов |
| `500` | Внутренняя ошибка сервера |
