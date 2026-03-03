# Configuration — Wite AI

## API провайдеры

Приложение поддерживает два провайдера:

| Провайдер | Описание | Модели |
|-----------|----------|--------|
| **Google Gemini** | Прямое подключение к Google API | Gemini 3 Pro, 3.1 Pro Image, 3.1 Flash Image, 2.5 Flash Image и др. |
| **NeuroAPI** | OpenAI-совместимый API (neuroapi.host) | GPT-5, GPT-4o, Claude 3.5, DALL-E 3, GPT Image-1 |

### Переключение провайдера

**Admin Panel** → **System UI Configuration** → выпадающий список.  
Настройка сохраняется на сервере и синхронизируется между устройствами.

---

## API ключи

### Пользовательские ключи (localStorage)

Каждый пользователь вводит свой ключ в панели настроек (⚙️):

- **Google:** хранится в `localStorage.gemini_api_key`
- **NeuroAPI:** хранится в `localStorage.neuroapi_api_key`

> API ключи **не покидают браузер** — используются для прямых запросов к API.

### Серверные ключи (Admin Panel)

Администратор может добавить общие API ключи через **Admin Panel** → **API Keys Management**:
- Ключи шифруются AES-256-CBC и хранятся на сервере
- Можно назначить ключ конкретным пользователям или всем
- Можно включать/отключать ключи без удаления

---

## Модели

### Google Gemini

| Модель | Тип | Разрешения | Пропорции |
|--------|-----|-----------|-----------|
| Gemini 3.1 Pro Image | Изображения | 1K, 2K, 4K | Стандартные (11 вариантов) |
| Gemini 3.1 Flash Image | Изображения | 512, 1K, 2K, 4K | Все (15 вариантов, вкл. 1:8) |
| Gemini 2.5 Flash Image | Изображения | 1K | Стандартные |
| Gemini 3 Pro | Текст | — | — |
| Gemini 3 Flash | Текст | — | — |

### Стоимость (Google)

| Модель | Input (за 1M токенов) | Output | Изображение |
|--------|----------------------|--------|-------------|
| 3.1 Flash Image | $0.15 | $0.60 | $0.045–$0.151 (по разрешению) |
| 3.1 Pro Image | $2.50 | $15.00 | $0.134–$0.24 |
| 2.5 Flash Image | $0.15 | $0.60 | $0.067 |

---

## Настройки генерации

### Разрешение (imageSize)

Значение, передаваемое в API:

| Значение | Размер | Доступность |
|----------|--------|-------------|
| `512` | 512×512 | Только 3.1 Flash Image |
| `1K` | 1024×1024 | Все image-модели |
| `2K` | 2048×2048 | Pro Image, 3.1 Flash |
| `4K` | 4096×4096 | Pro Image, 3.1 Flash |

### Пропорции (aspectRatio)

| Значение | Описание | Доступность |
|----------|----------|-------------|
| `Auto` | Авто | Все |
| `1:1`–`21:9` | Стандартные (11 шт.) | Все image-модели |
| `1:4`, `4:1`, `1:8`, `8:1` | Экстремальные | Только 3.1 Flash Image |

### Image Only

Переключатель **Image Only** — принудительно возвращать только изображение без текста.

- **ON:** `responseModalities: ['IMAGE']` — модель всегда вернёт картинку
- **OFF:** `responseModalities: ['TEXT', 'IMAGE']` — текст + картинка (по умолчанию)

### Температура (temperature)

`0.0`–`2.0`. По умолчанию `1.0`.  
Чем ниже — тем точнее, чем выше — тем креативнее.

### Grounding

- **Image Search** — поиск по изображениям Google (только Flash 3.1)
- **Google Search** — поиск по вебу для контекста (все модели)

---

## Системные настройки (Admin Panel)

| Настройка | Описание |
|-----------|----------|
| Creativity slider | Показывать/скрывать ползунок температуры |
| Repeat count | Показывать/скрывать повтор генераций |
| Image Search | Показывать/скрывать кнопку Image Search |
| Google Search | Показывать/скрывать кнопку Google Search |
| Theme | Тема оформления (default / raspberry / green) |
| Language | Язык интерфейса (EN / RU) |
| New Year Mode | Снежинки (1 ноября – 28 февраля) |
| Safety Settings | Фильтры безопасности для API |
| Media Resolution | Качество обработки входных изображений |
| API Provider | Google Gemini / NeuroAPI |

---

## Структура проекта

```
.
├── server/                    # Node.js бэкенд (Express 5)
│   ├── index.js              # Точка входа
│   ├── middleware/
│   │   ├── auth.js           # Сессии, PBKDF2, Bearer-токены
│   │   └── rateLimit.js      # Rate limiting
│   ├── routes/               # Маршруты API
│   │   ├── files.js          # Отдача изображений
│   │   ├── gallery.js        # Внешняя галерея
│   │   ├── history.js        # CRUD истории + thumbnails
│   │   ├── users.js          # Пользователи
│   │   ├── settings.js       # Системные настройки
│   │   ├── serverKeys.js     # API ключи (AES-256)
│   │   ├── presets.js        # Пресеты
│   │   └── cloudJobs.js      # Cloud Batch
│   └── utils/
│       ├── encryption.js     # AES-256-CBC
│       ├── thumbnail.js      # Миниатюры (sharp)
│       ├── validation.js     # Валидация
│       └── logger.js         # Структурированное логирование
├── views/                     # React страницы
│   ├── SingleGenerator.tsx   # Генерация одного изображения
│   ├── BatchProcessor.tsx    # Локальная пакетная обработка
│   ├── CloudBatchProcessor.tsx # Cloud Batch API
│   ├── GalleryView.tsx       # Галерея с пагинацией
│   ├── ChatInterface.tsx     # Чат с AI
│   ├── AdminPanel.tsx        # Панель администратора
│   └── LoginView.tsx         # Логин
├── services/                  # Фронтенд-сервисы
│   ├── geminiService.ts      # Google Gemini API + роутинг провайдеров
│   ├── neuroApiService.ts    # NeuroAPI (OpenAI SDK)
│   ├── authService.ts        # Аутентификация
│   ├── historyService.ts     # История генераций
│   └── settingsService.ts    # Настройки
├── components/                # UI компоненты
├── contexts/                  # React контексты (язык, тема)
├── hooks/                     # React хуки
├── data/                      # Пользовательские данные (не в git)
├── docs/                      # Документация
└── FAQ/                       # Справочные материалы
```
