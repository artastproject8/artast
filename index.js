const { Telegraf, Scenes, session, Markup } = require("telegraf");
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

// 🎭 Одна тестовая сцена (заявка для людей)
const peopleScene = new Scenes.WizardScene(
  "people",
  async (ctx) => {
    await ctx.reply("📌 Введите ваше имя:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    await ctx.reply("📍 Укажите ваш город:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.city = ctx.message.text;
    await ctx.reply("✅ Ваша заявка получена!");
    console.log("Новая заявка:", ctx.wizard.state);
    return ctx.scene.leave();
  }
);

// Создаём сцену и включаем в бота
const stage = new Scenes.Stage([peopleScene]);
bot.use(session());
bot.use(stage.middleware());

// Кнопки
bot.start((ctx) => {
  ctx.reply("✅ Бот работает! Выберите действие:", {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.callback("👤 Добавить человека", "apply_people")]
    ]),
  });
});

// Обработчик кнопки
bot.action("apply_people", (ctx) => ctx.scene.enter("people"));

// Запуск сервера
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
