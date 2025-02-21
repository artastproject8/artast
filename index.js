const { Telegraf, Markup } = require("telegraf"); const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN); const app = express(); const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Webhook app.use(express.json()); app.post("/webhook", async (req, res) => { try { console.log("Webhook получил данные:", req.body); await bot.handleUpdate(req.body); res.sendStatus(200); } catch (error) { console.error("Ошибка обработки запроса:", error); res.sendStatus(500); } });

// Стартовое сообщение с кнопками bot.start((ctx) => { ctx.reply("✅ Бот работает! Выберите действие:", { reply_markup: Markup.inlineKeyboard([ [Markup.button.callback("👤 Подать заявку", "apply")], ]), }); });

// Логика сбора данных bot.action("apply", async (ctx) => { await ctx.reply("📌 Введите ваше имя:"); ctx.wizard = { step: 1 }; });

bot.on("text", async (ctx) => { if (!ctx.wizard) return;

if (ctx.wizard.step === 1) { ctx.wizard.name = ctx.message.text; ctx.wizard.step = 2; return ctx.reply("📍 Укажите ваш город:"); }

if (ctx.wizard.step === 2) { ctx.wizard.city = ctx.message.text; ctx.wizard.step = 3; return ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):"); }

if (ctx.wizard.step === 3) { ctx.wizard.contact = ctx.message.text; const message = `🚀 Новая заявка!

👤 Имя: ${ctx.wizard.name} 📍 Город: ${ctx.wizard.city} 📞 Контакт: ${ctx.wizard.contact}`;

await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
await ctx.reply("✅ Ваша заявка отправлена!");
delete ctx.wizard;

} });

// Запуск сервера app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;

