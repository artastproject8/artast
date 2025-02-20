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

// Команда /start с кнопкой Web App
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Откройте меню:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Открыть каталог", web_app: { url: "https://artast-app.vercel.app" } }],
      ],
    },
  });
});

module.exports = app;
