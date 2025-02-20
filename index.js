const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Логируем запуск
console.log("Бот запускается...");

// Обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка в обработке обновления для ${ctx.updateType}:`, err);
});

// Настраиваем Webhook
app.use(express.json());
app.post("/webhook", async (req, res) => {
  try {
    console.log("Webhook получил данные:", req.body);
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка обработки запроса:", error);
    res.sendStatus(500);
  }
});

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "👥 Люди", web_app: { url: process.env.WEB_APP_URL } }],
        [{ text: "🏛 Пространства", web_app: { url: process.env.WEB_APP_URL } }],
        [{ text: "📅 События", web_app: { url: process.env.WEB_APP_URL } }],
        [{ text: "✍️ Подать заявку", web_app: { url: process.env.WEB_APP_URL } }]
      ],
    },
  });
});

// Запускаем сервер
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

module.exports = app;
