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
│   ├── admin/                    ← CMS-админка (Decap)
│   │   ├── index.html            ← загрузчик админки → /admin
│   │   └── config.yml            ← описание форм редактора
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
├── oauth-proxy/                  ← сервис входа в админку через GitHub
│   ├── index.js                  ← OAuth-провайдер (Express)
│   └── package.json
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

## � CMS / Админка (редактирование без кода)

Админка на **[Decap CMS](https://decapcms.org)** даёт владельцу сайта формы
для правки текста на 4 языках — без работы с JSON. Файлы уже в репозитории:

- [`public/admin/index.html`](../public/admin/index.html) — загрузчик Decap CMS
- [`public/admin/config.yml`](../public/admin/config.yml) — описание форм (вся структура `content.json`)
- [`oauth-proxy/`](../oauth-proxy/) — отдельный сервис авторизации через GitHub

Decap сохраняет правки коммитом в GitHub. Render не Netlify, поэтому
нужен собственный OAuth-прокси. Настройка — **один раз**, по шагам ниже.

### Шаг 1. Задеплоить OAuth-прокси на Render

1. **New → Web Service** → тот же репозиторий `kabartay/shebzukho`
2. **Root Directory:** `oauth-proxy`
3. **Build Command:** `npm install` · **Start Command:** `npm start`
4. **Instance Type:** Free
5. Создайте сервис и запомните его URL, например `https://shebzukho-cms.onrender.com`

### Шаг 2. Создать GitHub OAuth App

1. [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**
2. **Application name:** `Shebzukho CMS`
3. **Homepage URL:** `https://shebzukho.com`
4. **Authorization callback URL:** `https://shebzukho-cms.onrender.com/callback`
   (URL прокси из шага 1 + `/callback`)
5. **Register** → скопируйте **Client ID**, затем **Generate a new client secret** → скопируйте секрет

### Шаг 3. Прописать переменные окружения у прокси

В Render, на сервисе прокси → **Environment** добавьте:

| Ключ                  | Значение                                  |
|-----------------------|-------------------------------------------|
| `OAUTH_CLIENT_ID`     | Client ID из шага 2                       |
| `OAUTH_CLIENT_SECRET` | Client secret из шага 2                   |
| `OAUTH_REDIRECT_URI`  | `https://shebzukho-cms.onrender.com/callback` |

Сохраните — Render перезапустит сервис.

### Шаг 4. Указать прокси в config.yml

В [`public/admin/config.yml`](../public/admin/config.yml) замените `base_url`
на URL вашего прокси и запушьте:

```yaml
backend:
  name: github
  repo: kabartay/shebzukho
  branch: main
  base_url: https://shebzukho-cms.onrender.com   # ← ваш URL
```

```bash
git add public/admin/config.yml && git commit -m "chore: set CMS oauth base_url" && git push
```

### Шаг 5. Проверить

Откройте **[shebzukho.com/admin](https://shebzukho.com/admin)** → **Login with GitHub** →
отредактируйте любое поле → **Save** → **Publish**. Через 1–2 минуты правка на сайте.

> 💤 На бесплатном тарифе Render прокси «засыпает» после простоя — **первый**
> вход может занять ~30 секунд, пока сервис просыпается. Это нормально.

> 🔒 Доступ к админке имеет только тот, у кого есть права на запись в репозиторий
> `kabartay/shebzukho`. Чтобы пустить Астемира — добавьте его в коллабораторы репозитория.

---

## �📦 Версии (GitHub Releases)

Чтобы зафиксировать версию сайта:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions автоматически создаст Release с ZIP-архивом папки `public/`.

> ⚠️ **Создавайте релизы только через консоль** (команды выше).
> Если создавать релиз вручную на сайте GitHub (кнопка «Draft a new release»),
> workflow не срабатывает, и легко случайно поставить галочку «Set as a pre-release».
>
> Если релиз всё же оказался pre-release — исправьте одной командой:
>
> ```bash
> gh release edit v1.0.0 --prerelease=false --latest
> ```

---

## 🔑 Переменные окружения

**Сам сайт** статический — переменных окружения не требует.

**OAuth-прокси админки** (отдельный Web Service) использует три:

| Ключ                  | Назначение                          |
|-----------------------|-------------------------------------|
| `OAUTH_CLIENT_ID`     | Client ID GitHub OAuth App          |
| `OAUTH_CLIENT_SECRET` | Client secret GitHub OAuth App      |
| `OAUTH_REDIRECT_URI`  | `https://<прокси>/callback`         |

Подробнее — раздел [CMS / Админка](#-cms--админка-редактирование-без-кода).
