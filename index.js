const { Telegraf, Scenes, session, Markup } = require("telegraf"); const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN); const app = express();

// Webhook app.use(express.json()); app.post("/webhook", async (req, res) => { try { console.log("Webhook получил данные:", req.body); await bot.handleUpdate(req.body); res.sendStatus(200); } catch (error) { console.error("Ошибка обработки запроса:", error); res.sendStatus(500); } });

// 🎭 Сцена для подачи заявки const peopleScene = new Scenes.WizardScene( "people", async (ctx) => { await ctx.reply("📌 Введите ваше имя:"); return ctx.wizard.next(); }, async (ctx) => { ctx.wizard.state.name = ctx.message.text; await ctx.reply("📍 Укажите ваш город:"); return ctx.wizard.next(); }, async (ctx) => { ctx.wizard.state.city = ctx.message.text; await ctx.reply("✅ Ваша заявка получена! Отправляем на модерацию..."); await sendApplication(ctx, "Люди"); return ctx.scene.leave(); } );

// Функция отправки заявки в админ-чат async function sendApplication(ctx, type) { const adminChatId = process.env.ADMIN_CHAT_ID; if (!adminChatId) { console.error("❌ ADMIN_CHAT_ID не задан в переменных окружения!"); return; }

let application = 🚀 Новая заявка в раздел *${type}*! ; for (let key in ctx.wizard.state) { application += 📌 ${key}: ${ctx.wizard.state[key]} ; }

console.log("Отправка заявки в чат:", adminChatId, application); await bot.telegram.sendMessage(adminChatId, application, { parse_mode: "Markdown" }); }

// Создаём сцену и включаем в бота const stage = new Scenes.Stage([peopleScene]); bot.use(session()); bot.use(stage.middleware());

// Кнопки bot.start((ctx) => { ctx.reply("ARTAST COMPANY Выберите действие:", { reply_markup: Markup.inlineKeyboard([ [Markup.button.callback("👤 Добавить человека", "apply_people")] ]), }); });

// Обработчик кнопки bot.action("apply_people", (ctx) => ctx.scene.enter("people"));

// Запуск сервера app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

module.exports = app;
