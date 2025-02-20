const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Твой Telegram ID (чтобы получать заявки)
const ADMIN_ID = "ТВОЙ_TG_ID";

// Устанавливаем webhook
bot.telegram.setWebhook(process.env.WEBHOOK_URL);
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body, res);
});

// Команда /start
bot.start((ctx) => {
  ctx.reply("Добро пожаловать в ArtAst! Выберите действие:", Markup.inlineKeyboard([
    [Markup.button.url("👥 Люди", process.env.APP_URL)],
    [Markup.button.url("🏛 Пространства", process.env.APP_URL)],
    [Markup.button.url("📅 События", process.env.APP_URL)],
    [Markup.button.callback("✍️ Подать заявку", "apply")]
  ]));
});

// Обработка подачи заявки
bot.action("apply", async (ctx) => {
  await ctx.answerCbQuery(); // Убирает "зависание" кнопки
  ctx.reply("Что вы хотите разместить?", Markup.inlineKeyboard([
    [Markup.button.callback("🧑‍🎨 Личную анкету", "apply_person")],
    [Markup.button.callback("🏛 Пространство", "apply_space")],
    [Markup.button.callback("🎭 Событие", "apply_event")]
  ]));
});

// Временное хранилище заявок
const userApplications = {};

// Обработчик заявки (шаг 1)
const askForData = async (ctx, type) => {
  const chatId = ctx.chat.id;
  userApplications[chatId] = { type, step: 1, data: {} };
  ctx.reply("Как вас зовут?");
};

// Личные анкеты
bot.action("apply_person", async (ctx) => {
  await ctx.answerCbQuery();
  askForData(ctx, "person");
});

// Пространства
bot.action("apply_space", async (ctx) => {
  await ctx.answerCbQuery();
  askForData(ctx, "space");
});

// События
bot.action("apply_event", async (ctx) => {
  await ctx.answerCbQuery();
  askForData(ctx, "event");
});

// Обработчик ответов пользователей
bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const application = userApplications[chatId];

  if (!application) return;

  switch (application.step) {
    case 1:
      application.data.name = ctx.message.text;
      application.step++;
      ctx.reply("В каком городе вы находитесь?");
      break;
    case 2:
      application.data.city = ctx.message.text;
      application.step++;
      ctx.reply("Напишите описание (о себе, пространстве или событии)");
      break;
    case 3:
      application.data.description = ctx.message.text;
      application.step++;
      ctx.reply("Пришлите контактные данные (телеграм, инстаграм, телефон)");
      break;
    case 4:
      application.data.contacts = ctx.message.text;
      application.step++;
      ctx.reply("Пришлите до 5 фото (по одному за раз). Когда закончите, напишите 'Готово'.");
      application.data.photos = [];
      break;
    case 5:
      if (ctx.message.text.toLowerCase() === "готово") {
        application.step++;
        sendApplicationToAdmin(ctx, application);
      } else if (ctx.message.photo) {
        application.data.photos.push(ctx.message.photo.pop().file_id);
        if (application.data.photos.length === 5) {
          application.step++;
          sendApplicationToAdmin(ctx, application);
        }
      } else {
        ctx.reply("Пришлите фото или напишите 'Готово', если закончили.");
      }
      break;
  }
});

// Отправка заявки администратору
const sendApplicationToAdmin = (ctx, application) => {
  let message = `📩 **Новая заявка**\n\n`;
  message += `**Тип**: ${application.type === "person" ? "Личная анкета" : application.type === "space" ? "Пространство" : "Событие"}\n`;
  message += `**Имя**: ${application.data.name}\n`;
  message += `**Город**: ${application.data.city}\n`;
  message += `**Описание**: ${application.data.description}\n`;
  message += `**Контакты**: ${application.data.contacts}\n`;

  bot.telegram.sendMessage(ADMIN_ID, message, { parse_mode: "Markdown" });

  if (application.data.photos.length > 0) {
    application.data.photos.forEach(photo => {
      bot.telegram.sendPhoto(ADMIN_ID, photo);
    });
  }

  ctx.reply("✅ Ваша заявка отправлена на модерацию. Мы свяжемся с вами в ближайшее время!");
  delete userApplications[ctx.chat.id];
};

app.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
