# Техническая документация

Инструкции по развёртыванию и разработке сайта [shebzukho.com](https://shebzukho.com).

---

## 💻 Локальный запуск

```bash
npm start
```

Откройте [http://localhost:3000](http://localhost:3000).

> Из-за `fetch()` для загрузки JSON сайт не работает как обычный HTML-файл — нужен локальный сервер.

---

## 📁 Структура проекта

```
shebzukho/
├── public/                       ← всё, что отдаётся браузеру
│   ├── index.html                ← единственная HTML-страница (оболочка)
│   ├── assets/
│   │   ├── photo.jpg             ← фото на главной
│   │   ├── tamga.png             ← логотип (тамга)
│   │   └── favicon.svg           ← иконка вкладки браузера
│   ├── data/
│   │   └── content.json          ← ВСЕ ТЕКСТЫ САЙТА
│   └── src/
│       ├── css/
│       │   ├── style.css         ← основные стили
│       │   └── theme.css         ← цветовые палитры и тёмная тема
│       └── js/
│           ├── render.js         ← читает JSON, строит DOM
│           ├── main.js           ← анимации, меню, прокрутка
│           └── theme-config.js   ← переключение тем (без мигания)
├── docs/
│   └── DEPLOY.md                 ← этот файл
├── .github/workflows/
│   └── release.yml               ← автоматические GitHub Releases при теге
├── render.yml                    ← настройки хостинга Render.com
└── package.json                  ← локальный сервер (npm start)
```

---

## 🏗️ Архитектура

Сайт — **SPA без фреймворков**:

1. `index.html` — пустая оболочка, подключает скрипты
2. `render.js` — асинхронно загружает `content.json`, строит весь DOM
3. `main.js` — инициализирует UI после рендера (меню, анимации, тема)
4. Языки: `LANGS = ['ru', 'en', 'ady', 'tr']`, функция `t(obj)` выбирает нужный язык
5. Форматирование текста: `parseLinks()` обрабатывает `**bold**`, `*italic*`, `!!badge!!`, `[text](url)`

---

## 🚀 Деплой на Render.com

1. Зарегистрируйтесь на [render.com](https://render.com)
2. **New → Static Site** → подключите репозиторий с GitHub
3. Render найдёт `render.yml` и настроит всё автоматически
4. При каждом `git push` в ветку `main` сайт деплоится автоматически

### render.yml — что настроено

- `staticPublishPath: public` — раздаёт папку `public/`
- Заголовки безопасности: `X-Frame-Options`, `HSTS`, `X-Content-Type-Options`
- Кеш: CSS/JS — `no-cache` (всегда свежие), `/data/*` — 5 минут, HTML — 1 час

---

## 🌐 Подключение домена

### Render.com

1. Settings → Custom Domains → Add Domain
2. Добавьте `shebzukho.com` и `www.shebzukho.com`

### DNS у регистратора (GoDaddy)

| Тип    | Имя   | Значение                   |
|--------|-------|----------------------------|
| `A`    | `@`   | `216.24.57.1`              |
| `CNAME`| `www` | `shebzukho.onrender.com`   |

Изменения DNS применяются до 24 часов, обычно — быстрее.

---

## 📦 Версии (GitHub Releases)

Чтобы зафиксировать версию сайта:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions автоматически создаст Release с ZIP-архивом папки `public/`.

---

## 🔑 Переменные окружения

Сайт полностью статический — переменные окружения не используются.
