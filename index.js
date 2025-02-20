const { Telegraf, Markup, session, Scenes } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Настраиваем Webhook
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// *** Минимальная сцена для теста (только имя) ***
const testScene = new Scenes.WizardScene(
  "testScene",
  async (ctx) => {
    await ctx.reply("📌 Введите ваше имя:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    await ctx.reply(`✅ Ваше имя сохранено: ${ctx.wizard.state.name}`);
    return ctx.scene.leave();
  }
);

const stage = new Scenes.Stage([testScene]);
bot.use(session());
bot.use(stage.middleware());

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", {
    reply_markup: Markup.inlineKeyboard([
      [Markup.button.webApp("👥 Люди", process.env.WEB_APP_URL)],
      [Markup.button.webApp("🏛 Пространства", process.env.WEB_APP_URL)],
      [Markup.button.webApp("📅 События", process.env.WEB_APP_URL)],
      [Markup.button.callback("✍️ Подать заявку", "start_test_scene")]
    ]),
  });
});

// Запуск тестовой сцены
bot.action("start_test_scene", (ctx) => ctx.scene.enter("testScene"));

// Запускаем сервер
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
