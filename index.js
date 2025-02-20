const { Telegraf, Markup } = require("telegraf"); const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN); const app = express(); const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Webhook app.use(express.json()); app.post("/webhook", async (req, res) => { try { console.log("Webhook получил данные:", req.body); await bot.handleUpdate(req.body); res.sendStatus(200); } catch (error) { console.error("Ошибка обработки запроса:", error); res.sendStatus(500); } });

// Стартовое сообщение с кнопками bot.start((ctx) => { ctx.reply("✅ Бот работает! Выберите действие:", { reply_markup: Markup.inlineKeyboard([ [Markup.button.callback("👤 Подать заявку", "apply")], ]), }); });

// Логика сбора данных bot.action("apply", async (ctx) => { ctx.reply("📌 Введите ваше имя:"); bot.on("text", async (ctx) => { const name = ctx.message.text; await ctx.reply("📍 Укажите ваш город:"); bot.on("text", async (ctx) => { const city = ctx.message.text; await ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):"); bot.on("text", async (ctx) => { const contact = ctx.message.text;

const message = `🚀 Новая заявка!

👤 Имя: ${name} 📍 Город: ${city} 📞 Контакт: ${contact}`;

await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
    await ctx.reply("✅ Ваша заявка отправлена!");
  });
});

}); });

// Запуск сервера app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
