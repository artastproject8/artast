const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Webhook
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

// Стартовое сообщение с кнопками
bot.start((ctx) => {
  ctx.reply("✅ Бот работает! Выберите действие:", {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("👤 Подать заявку", "apply")],
    ]),
  });
});

// Объект для хранения временных данных
const userState = {};

// Логика сбора данных
bot.action("apply", async (ctx) => {
  const userId = ctx.from.id;
  userState[userId] = { step: "name" };
  await ctx.reply("📌 Введите ваше имя:");
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;

  if (!userState[userId] || !userState[userId].step) return;

  switch (userState[userId].step) {
    case "name":
      userState[userId].name = ctx.message.text;
      userState[userId].step = "city";
      await ctx.reply("📍 Укажите ваш город:");
      break;
    case "city":
      userState[userId].city = ctx.message.text;
      userState[userId].step = "contact";
      await ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):");
      break;
    case "contact":
      userState[userId].contact = ctx.message.text;

      const message = `🚀 Новая заявка!\n\n👤 Имя: ${userState[userId].name}\n📍 Город: ${userState[userId].city}\n📞 Контакт: ${userState[userId].contact}`;
      await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
      await ctx.reply("✅ Ваша заявка отправлена!");

      delete userState[userId]; // Удаляем данные пользователя после отправки
      break;
  }
});

// Запуск сервера
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
