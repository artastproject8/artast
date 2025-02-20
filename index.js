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

// Команда /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Люди", callback_data: "people" }],
        [{ text: "🏛 Пространства", callback_data: "spaces" }],
        [{ text: "📅 События", callback_data: "events" }],
        [{ text: "✍️ Подать заявку", callback_data: "apply" }],
      ],
    },
  });
});

// Привязываем кнопку "Люди" к мини-приложению
bot.action("people", (ctx) => {
  ctx.answerCbQuery();
  ctx.reply("🔗 Открываю мини-приложение...", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Открыть", url: "https://artast-artasts-projects-d1b148c6.vercel.app/people" }]
      ],
    },
  });
});

// Остальные кнопки остаются как есть
bot.action("spaces", (ctx) => ctx.reply("Раздел с пространствами: фотостудии, арт-галереи и т.д."));
bot.action("events", (ctx) => ctx.reply("Раздел с событиями: афиши, анонсы и т.д."));
bot.action("apply", (ctx) => ctx.reply("Форма для подачи заявки: [Ссылка на Google Form]"));

module.exports = app;
