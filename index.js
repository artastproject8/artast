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

// Привязываем кнопки к мини-приложению
const sections = {
  people: "https://artast-artasts-projects-d1b148c6.vercel.app/people",
  spaces: "https://artast-artasts-projects-d1b148c6.vercel.app/spaces",
  events: "https://artast-artasts-projects-d1b148c6.vercel.app/events",
  apply: "https://artast-artasts-projects-d1b148c6.vercel.app/apply",
};

Object.keys(sections).forEach((key) => {
  bot.action(key, (ctx) => {
    ctx.answerCbQuery();
    ctx.reply("🔗 Открываю мини-приложение...", {
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть", url: sections[key] }]],
      },
    });
  });
});

module.exports = app;
