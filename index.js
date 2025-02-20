const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

bot.telegram.setWebhook(process.env.WEBHOOK_URL);
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Люди", web_app: { url: process.env.WEBAPP_URL } }],
        [{ text: "🏛 Пространства", web_app: { url: process.env.WEBAPP_URL } }],
        [{ text: "📅 События", web_app: { url: process.env.WEBAPP_URL } }],
        [{ text: "✍️ Подать заявку", web_app: { url: process.env.WEBAPP_URL } }],
      ],
    },
  });
});

module.exports = app;
