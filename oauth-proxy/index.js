// Decap CMS — GitHub OAuth provider
// Минимальный сервис авторизации для админки сайта.
// Деплоится как отдельный Web Service на Render (см. docs/DEPLOY.md).
//
// Требуется Node 18+ (используется встроенный global fetch).

const express = require('express');

const app = express();

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REDIRECT_URI, // напр. https://shebzukho-cms.onrender.com/callback
} = process.env;

const PORT = process.env.PORT || 10000;

if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
  console.warn('⚠️  Не заданы OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET');
}

// Проверка живости
app.get('/', (_req, res) => {
  res.send('Decap CMS GitHub OAuth provider is running.');
});

// Шаг 1 — CMS открывает /auth, мы перенаправляем на GitHub
app.get('/auth', (req, res) => {
  const redirectUri =
    OAUTH_REDIRECT_URI || `${req.protocol}://${req.get('host')}/callback`;

  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo',
    state: Math.random().toString(36).slice(2),
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// Шаг 2 — GitHub возвращает code, меняем его на access_token
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing "code" parameter.');

  try {
    const tokenRes = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: OAUTH_CLIENT_ID,
          client_secret: OAUTH_CLIENT_SECRET,
          code,
        }),
      },
    );

    const body = await tokenRes.json();
    const status = body.access_token ? 'success' : 'error';
    const content = body.access_token
      ? { token: body.access_token, provider: 'github' }
      : body;
    const payload = JSON.stringify(content);

    // Шаг 3 — отдаём окну-родителю (админке) токен через postMessage
    res.set('Content-Type', 'text/html');
    res.send(`<!doctype html>
<html>
  <body>
    <script>
      (function () {
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:${status}:${payload}',
            e.origin
          );
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:github', '*');
      })();
    </script>
  </body>
</html>`);
  } catch (err) {
    res.status(500).send('OAuth error: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`OAuth provider listening on :${PORT}`);
});
