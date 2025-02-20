const { Telegraf, Scenes, session, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Настраиваем Webhook
app.use(express.json());
app.post("/webhook", async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error("Ошибка обработки обновления:", error);
    res.sendStatus(500);
  }
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
    if (!ctx.message?.text) return ctx.reply("Пожалуйста, введите текст.");
    ctx.wizard.state.name = ctx.message.text;
    await ctx.reply("📍 Укажите ваш город:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("Пожалуйста, введите текст.");
    ctx.wizard.state.city = ctx.message.text;
    await ctx.reply("✍️ Напишите о себе:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("Пожалуйста, введите текст.");
    ctx.wizard.state.bio = ctx.message.text;
    await ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.text) return ctx.reply("Пожалуйста, введите текст.");
    ctx.wizard.state.contact = ctx.message.text;
    await ctx.reply("🖼 Отправьте фото профиля:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.photo) return ctx.reply("Пожалуйста, отправьте фото.");
    ctx.wizard.state.photo = ctx.message.photo[0].file_id;
    await ctx.reply("📸 Отправьте примеры ваших работ (до 5 фото):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message?.photo) return ctx.reply("Пожалуйста, отправьте хотя бы одно фото.");
    ctx.wizard.state.works = ctx.message.photo.map(p => p.file_id);
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

// Функция отправки заявки
async function sendApplication(ctx, type) {
  try {
    let application = `🚀 Новая заявка в раздел *${type}*!\n`;
    for (let key in ctx.wizard.state) {
      if (key !== "photos" && key !== "works") {
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
    
    await ctx.reply("✅ Ваша заявка отправлена на модерацию!");
    return ctx.scene.leave();
  } catch (error) {
    console.error("Ошибка отправки заявки:", error);
    await ctx.reply("❌ Произошла ошибка при отправке заявки. Попробуйте позже.");
  }
}

// Добавляем сцены в бота
const stage = new Scenes.Stage([peopleScene]);
bot.use(session());
bot.use(stage.middleware());

// Кнопки выбора типа заявки
bot.action("apply", (ctx) => {
  ctx.reply("📌 Выберите, что хотите добавить:", Markup.inlineKeyboard([
    [Markup.button.callback("👤 Человек", "apply_people")],
  ]));
});

bot.action("apply_people", (ctx) => ctx.scene.enter("people"));

// Запускаем сервер
app.listen(3000, () => console.log("Сервер запущен на 3000"));

module.exports = app;
