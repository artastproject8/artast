const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Настройка Webhook
bot.telegram.setWebhook(process.env.WEBHOOK_URL);
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Команда /start
bot.start((ctx) => {
  ctx.reply(
    "Добро пожаловать в ArtAst! Выберите действие:",
    Markup.inlineKeyboard([
      [Markup.button.webApp("👥 Люди", process.env.WEBAPP_URL)],
      [Markup.button.webApp("🏛 Пространства", process.env.WEBAPP_URL)],
      [Markup.button.webApp("📅 События", process.env.WEBAPP_URL)],
      [Markup.button.webApp("✍️ Подать заявку", process.env.WEBAPP_URL)],
    ])
  );
});

// Запуск сервера
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
