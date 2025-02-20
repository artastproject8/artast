const { Telegraf, Scenes, session, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Настраиваем Webhook
app.use(express.json());
app.post("/webhook", (req, res) => {
  bot.handleUpdate(req.body);
  res.sendStatus(200);
});

// *** Сцены для сбора заявок ***

// 1️⃣ Сцена для людей
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
    await ctx.reply("✍️ Напишите о себе:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.bio = ctx.message.text;
    await ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.contact = ctx.message.text;
    await ctx.reply("🖼 Отправьте фото профиля:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.photo = ctx.message.photo ? ctx.message.photo[0].file_id : null;
    await ctx.reply("📸 Отправьте примеры ваших работ (до 5 фото):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.works = ctx.message.photo ? ctx.message.photo.map(p => p.file_id) : [];
    await ctx.reply(
      "💼 Вы готовы к сотрудничеству?",
      Markup.inlineKeyboard([
        [Markup.button.callback("✅ Да", "collab_yes"), Markup.button.callback("💰 Только коммерция", "collab_no")],
      ])
    );
  }
);

peopleScene.action("collab_yes", async (ctx) => {
  ctx.wizard.state.collab = "Да";
  await ctx.answerCbQuery();
  await sendApplication(ctx, "Люди");
});

peopleScene.action("collab_no", async (ctx) => {
  ctx.wizard.state.collab = "Только коммерция";
  await ctx.answerCbQuery();
  await sendApplication(ctx, "Люди");
});

// 2️⃣ Сцена для пространств
const spaceScene = new Scenes.WizardScene(
  "space",
  async (ctx) => {
    await ctx.reply("🏛 Введите название пространства:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    await ctx.reply("📍 Укажите город:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.city = ctx.message.text;
    await ctx.reply("✍️ Опишите пространство:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.description = ctx.message.text;
    await ctx.reply("📸 Отправьте фото (до 5 шт):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.photos = ctx.message.photo ? ctx.message.photo.map(p => p.file_id) : [];
    await ctx.reply("💰 Укажите прайс (если есть):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.price = ctx.message.text;
    await ctx.reply("📞 Укажите контакты (телеграм, инстаграм, телефон):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.contact = ctx.message.text;
    await sendApplication(ctx, "Пространства");
  }
);

// 3️⃣ Сцена для событий
const eventScene = new Scenes.WizardScene(
  "event",
  async (ctx) => {
    await ctx.reply("🎭 Введите название события:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.name = ctx.message.text;
    await ctx.reply("📅 Укажите дату и время:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.date = ctx.message.text;
    await ctx.reply("✍️ Опишите событие:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.description = ctx.message.text;
    await ctx.reply("📸 Отправьте афишу:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.poster = ctx.message.photo ? ctx.message.photo[0].file_id : null;
    await ctx.reply("🎟 Укажите ссылку на билеты или контакт организатора:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.link = ctx.message.text;
    await sendApplication(ctx, "События");
  }
);

// Функция отправки заявки
async function sendApplication(ctx, type) {
  let application = `🚀 Новая заявка в раздел *${type}*!\n`;
  for (let key in ctx.wizard.state) {
    if (key !== "photos" && key !== "works" && key !== "poster") {
      application += `📌 ${key}: ${ctx.wizard.state[key]}\n`;
    }
  }
  
  await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, application, { parse_mode: "Markdown" });
  if (ctx.wizard.state.photos) {
    for (let photo of ctx.wizard.state.photos) {
      await bot.telegram.sendPhoto(process.env.ADMIN_CHAT_ID, photo);
    }
  }
  if (ctx.wizard.state.works) {
    for (let work of ctx.wizard.state.works) {
      await bot.telegram.sendPhoto(process.env.ADMIN_CHAT_ID, work);
    }
  }
  if (ctx.wizard.state.poster) {
    await bot.telegram.sendPhoto(process.env.ADMIN_CHAT_ID, ctx.wizard.state.poster);
  }
  
  await ctx.reply("✅ Ваша заявка отправлена на модерацию!");
  return ctx.scene.leave();
}

// Добавляем сцены в бота
const stage = new Scenes.Stage([peopleScene, spaceScene, eventScene]);
bot.use(session());
bot.use(stage.middleware());

// Кнопки выбора типа заявки
bot.action("apply", (ctx) => {
  ctx.reply("📌 Выберите, что хотите добавить:", Markup.inlineKeyboard([
    [Markup.button.callback("👤 Человек", "apply_people")],
    [Markup.button.callback("🏛 Пространство", "apply_space")],
    [Markup.button.callback("🎭 Событие", "apply_event")]
  ]));
});

bot.action("apply_people", (ctx) => ctx.scene.enter("people"));
bot.action("apply_space", (ctx) => ctx.scene.enter("space"));
bot.action("apply_event", (ctx) => ctx.scene.enter("event"));

// Запускаем сервер
app.listen(3000, () => console.log("Сервер запущен на 3000"));

module.exports = app;
