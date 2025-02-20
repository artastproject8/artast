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
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Люди", url: process.env.APP_URL }],
        [{ text: "🏛 Пространства", url: process.env.APP_URL }],
        [{ text: "📅 События", url: process.env.APP_URL }],
        [{ text: "✍️ Подать заявку", callback_data: "apply" }]
      ]
    }
  });
});

// Обработка нажатия "Подать заявку"
bot.action("apply", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("Выберите тип заявки:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🧑‍🎨 Личную анкету", callback_data: "apply_person" }],
        [{ text: "🏛 Пространство", callback_data: "apply_space" }],
        [{ text: "🎭 Событие", callback_data: "apply_event" }]
      ]
    }
  });
});

// Запуск сервера
app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
