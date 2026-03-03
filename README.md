<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Wite AI — Gemini Image Studio

**Генерация изображений и текста через Google Gemini API**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ✨ Возможности

### 🖼️ Генерация изображений
- **Модели:** Gemini 3.1 Pro Image, 3.1 Flash Image, 2.5 Flash Image
- **Разрешение:** 512px → 4K (4096×4096)
- **15 пропорций:** от 1:1 до 8:1, включая нестандартные
- **Image Only режим** — принудительная генерация изображения без текста
- **Оценка стоимости** — мгновенный локальный подсчёт + точный через API

### ⚡ Пакетная обработка
- **Local Batch** — массовая генерация с очередью и повторами
- **Cloud Batch** — отправка заданий в Google Batch API (50% скидка)
- **Мульти-промпт** — несколько промптов через `;` разделитель
- **Предварительная оценка стоимости** батча перед запуском

### 💬 Чат
- Мультимодальный диалог с AI (текст + изображения)
- История чата с пагинацией

### 🖼️ Галерея
- Хронология генераций с миниатюрами
- Сравнение «до/после» (input vs output)
- **Внешняя галерея** — публичный API для показа изображений

### 🛡️ Безопасность
- PBKDF2 хеширование паролей (100K итераций)
- AES-256 шифрование серверных API ключей
- Bearer-токены, rate limiting, защита от path traversal

### 🎨 Интерфейс
- Тёмная тема с 3 цветовыми схемами
- Двуязычный (EN / RU)
- Slide-out панель настроек
- Адаптивный дизайн

---

## 🚀 Быстрый старт

```bash
npm install
npm run dev
# → http://localhost:3000
```

### Production

```bash
npm run build
# Загрузить dist/ + server/ + package.json на сервер
pm2 start server/index.js --name gemini-api
```

---

## 🏗️ Архитектура

| Слой | Технологии |
|------|-----------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS + Vite |
| **Backend** | Node.js + Express 5 (REST API) |
| **Storage** | Файловая система (JSON + PNG + миниатюры через sharp) |
| **Auth** | PBKDF2 + Bearer-токены + AES-256 |

---

## 📖 Документация

| Документ | Описание |
|----------|----------|
| [API Reference](docs/API.md) | Все эндпоинты, форматы запросов/ответов |
| [Deployment](docs/DEPLOYMENT.md) | Nginx, PM2, Docker, SSL, бекапы |
| [Configuration](docs/CONFIGURATION.md) | Модели, провайдеры, настройки генерации, структура проекта |
| [Security](docs/SECURITY.md) | Пароли, шифрование, CORS, rate limiting |
| [Changelog](FAQ/changelog/CHANGELOG.md) | История изменений |

---

## 📋 Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер (Node.js + Vite HMR) |
| `npm run build` | Сборка для production |
| `npm run preview` | Предпросмотр сборки |

---

<div align="center">

**MIT License** · Made with Gemini API

</div>
