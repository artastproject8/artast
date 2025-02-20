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

// Обработка кнопок
bot.action("people", (ctx) => ctx.reply("Раздел с людьми: художники, фотографы, модели и т.д."));
bot.action("spaces", (ctx) => ctx.reply("Раздел с пространствами: фотостудии, арт-галереи и т.д."));
bot.action("events", (ctx) => ctx.reply("Раздел с событиями: афиши, анонсы и т.д."));
bot.action("apply", (ctx) => ctx.reply("Форма для подачи заявки: [Ссылка на Google Form]"));

module.exports = app;
