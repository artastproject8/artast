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

// 🎭 Форма заявки
const applicationScene = new Scenes.WizardScene(
  "application",
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
    await ctx.reply("✍️ Расскажите о себе (до 400 символов):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message.text.length > 400) {
      await ctx.reply("⚠️ Текст слишком длинный! Попробуйте ещё раз (до 400 символов).");
      return;
    }
    ctx.wizard.state.bio = ctx.message.text;
    await ctx.reply("📞 Укажите контакт (телеграм, инстаграм, телефон):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.contact = ctx.message.text;
    await ctx.reply(
      "✅ Ваша заявка получена! Мы свяжемся с вами после модерации."
    );

    // Отправляем данные тебе
    const adminMessage = `
🚀 *Новая заявка:*
👤 Имя: ${ctx.wizard.state.name}
📍 Город: ${ctx.wizard.state.city}
📝 О себе: ${ctx.wizard.state.bio}
📞 Контакты: ${ctx.wizard.state.contact}
    `;
    
    await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, adminMessage, { parse_mode: "Markdown" });

    return ctx.scene.leave();
  }
);

// Создаём сцену
const stage = new Scenes.Stage([applicationScene]);
bot.use(session());
bot.use(stage.middleware());

// ✅ Кнопки на стартовом экране
bot.start(async (ctx) => {
  await ctx.reply("✅ Бот работает! Выберите действие:", 
    Markup.inlineKeyboard([
      [Markup.button.webApp("👥 Люди", process.env.WEB_APP_URL)],
      [Markup.button.webApp("🏛 Пространства", process.env.WEB_APP_URL)],
      [Markup.button.webApp("📅 События", process.env.WEB_APP_URL)],
      [Markup.button.webApp("✍️ Подать заявку", process.env.WEB_APP_URL)],
      [Markup.button.callback("✏️ Подать заявку в боте", "apply_bot")]
    ])
  );
});

// Обработчик кнопки "Подать заявку в боте"
bot.action("apply_bot", (ctx) => ctx.scene.enter("application"));

// Запуск сервера
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
