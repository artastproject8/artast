const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Устанавливаем webhook
bot.telegram.setWebhook(process.env.WEBHOOK_URL);
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Команда /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", 
    Markup.inlineKeyboard([
      [Markup.button.url("👥 Люди", "https://artast-artasts-projects-d1b148c6.vercel.app/")],
      [Markup.button.url("🏛 Пространства", "https://artast-artasts-projects-d1b148c6.vercel.app/")],
      [Markup.button.url("📅 События", "https://artast-artasts-projects-d1b148c6.vercel.app/")],
      [Markup.button.url("✍️ Подать заявку", "https://artast-artasts-projects-d1b148c6.vercel.app/")]
    ])
  );
});

// Запускаем сервер
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});

module.exports = app;
