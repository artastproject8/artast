async function sendApplication(ctx, type) {
  let application = `🚀 Новая заявка в раздел *${type}*!\n`;
  for (let key in ctx.wizard.state) {
    application += `📌 ${key}: ${ctx.wizard.state[key]}\n`;
  }
  
  await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, application, { parse_mode: "Markdown" });
  await ctx.reply("✅ Ваша заявка отправлена на модерацию!");
  return ctx.scene.leave();
}

// Добавляем сцены в бота
const { Telegraf } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

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

// Обработчик /start
bot.start((ctx) => {
  console.log("Бот получил команду /start");
  ctx.reply("✅ Бот работает! Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🔹 Тестовая кнопка", callback_data: "test" }]
      ],
    },
  });
});

// Тестовый обработчик кнопки
bot.action("test", (ctx) => {
  ctx.reply("🎉 Кнопка работает!");
});

// Запуск сервера
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
