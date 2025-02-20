const { Telegraf, Scenes, session, Markup } = require("telegraf"); const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN); const app = express();

// Webhook app.use(express.json()); app.post("/webhook", async (req, res) => { try { console.log("Webhook получил данные:", req.body); await bot.handleUpdate(req.body); res.sendStatus(200); } catch (error) { console.error("Ошибка обработки запроса:", error); res.sendStatus(500); } });

// 🎭 Сцена для подачи заявки const peopleScene = new Scenes.WizardScene( "people", async (ctx) => { await ctx.reply("📌 Введите ваше имя:"); return ctx.wizard.next(); }, async (ctx) => { ctx.wizard.state.name = ctx.message.text; await ctx.reply("📍 Укажите ваш город:"); return ctx.wizard.next(); }, async (ctx) => { ctx.wizard.state.city = ctx.message.text; await ctx.reply("✍️ Напишите о себе (до 400 символов):"); return ctx.wizard.next(); }, async (ctx) => { ctx.wizard.state.bio = ctx.message.text.substring(0, 400); await ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):"); return ctx.wizard.next(); }, async (ctx) => { ctx.wizard.state.contact = ctx.message.text; await sendApplication(ctx, "Люди"); } );

// Отправка заявки в админ-чат async function sendApplication(ctx, type) { const adminChatId = process.env.ADMIN_CHAT_ID; let application = 🚀 Новая заявка в раздел *${type}*\n; application += 👤 Имя: ${ctx.wizard.state.name}\n; application += 📍 Город: ${ctx.wizard.state.city}\n; application += 📝 О себе: ${ctx.wizard.state.bio}\n; application += 📞 Контакты: ${ctx.wizard.state.contact};

if (adminChatId) { await bot.telegram.sendMessage(adminChatId, application, { parse_mode: "Markdown" }); }

await ctx.reply("✅ Ваша заявка отправлена на модерацию!"); return ctx.scene.leave(); }

// Добавляем сцену в бота const stage = new Scenes.Stage([peopleScene]); bot.use(session()); bot.use(stage.middleware());

// Кнопки bot.start((ctx) => { ctx.reply("✅ Бот работает! Выберите действие:", { reply_markup: Markup.inlineKeyboard([ [Markup.button.webApp("👥 Люди", process.env.WEB_APP_URL)], [Markup.button.webApp("🏛 Пространства", process.env.WEB_APP_URL)], [Markup.button.webApp("📅 События", process.env.WEB_APP_URL)], [Markup.button.callback("✍️ Заполнить анкету", "apply_people")] ]), }); });

// Обработчик кнопки заявки bot.action("apply_people", (ctx) => ctx.scene.enter("people"));

// Запуск сервера app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
