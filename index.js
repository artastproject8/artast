const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Устанавливаем webhook
bot.telegram.setWebhook(process.env.WEBHOOK_URL);
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Главная страница мини-приложения
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ArtAst Mini App</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; background-color: #181818; color: white; }
          .container { margin-top: 50px; }
          button { display: block; margin: 10px auto; padding: 10px 20px; font-size: 18px; border: none; cursor: pointer; background-color: #f4a261; color: white; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Добро пожаловать в ArtAst</h1>
          <button onclick="window.location.href='/people'">Люди</button>
          <button onclick="window.location.href='/spaces'">Пространства</button>
          <button onclick="window.location.href='/events'">События</button>
          <button onclick="window.location.href='/apply'">Подать заявку</button>
        </div>
      </body>
    </html>
  `);
});

// Страницы разделов
app.get("/people", (req, res) => res.send("<h1>Раздел: Люди</h1><p>Список творческих людей...</p>"));
app.get("/spaces", (req, res) => res.send("<h1>Раздел: Пространства</h1><p>Список пространств...</p>"));
app.get("/events", (req, res) => res.send("<h1>Раздел: События</h1><p>Афиши и мероприятия...</p>"));
app.get("/apply", (req, res) => res.send("<h1>Подать заявку</h1><p>Форма для подачи заявки...</p>"));

// Запускаем сервер
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});

module.exports = app;
