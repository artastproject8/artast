const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Настраиваем Webhook
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.webApp("👥 Люди", process.env.WEB_APP_URL)],
      [Markup.button.webApp("🏛 Пространства", process.env.WEB_APP_URL)],
      [Markup.button.webApp("📅 События", process.env.WEB_APP_URL)],
      [Markup.button.webApp("✍️ Подать заявку", process.env.WEB_APP_URL)],
    ]),
  });
});

// Запускаем сервер
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
