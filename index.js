const { Telegraf, Markup } = require("telegraf");
const express = require("express");

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

app.use(express.json());

// Webhook
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

// Клавиатура главного меню
bot.start((ctx) => {
    ctx.reply("✅ Бот работает! Выберите действие:", {
        reply_markup: Markup.inlineKeyboard([
            [Markup.button.callback("👤 Подать заявку", "apply")],
            [Markup.button.url("🌐 Открыть мини-приложение", "https://artast.vercel.app")]
        ]),
    });
});

// Логика сбора данных
const userData = {};

bot.action("apply", async (ctx) => {
    const chatId = ctx.chat.id;
    userData[chatId] = {}; // Создаем объект для хранения данных пользователя
    await ctx.reply("📌 Введите ваше имя:");
});

// Обработчик текстовых сообщений
bot.on("text", async (ctx) => {
    const chatId = ctx.chat.id;

    if (!userData[chatId].name) {
        userData[chatId].name = ctx.message.text;
        await ctx.reply("📍 Укажите ваш город:");
    } else if (!userData[chatId].city) {
        userData[chatId].city = ctx.message.text;
        await ctx.reply("📞 Укажите ваш контакт (телеграм, инстаграм, телефон):");
    } else if (!userData[chatId].contact) {
        userData[chatId].contact = ctx.message.text;

        // Формируем сообщение для админа
        const message = `🚀 Новая заявка!\n\n👤 Имя: ${userData[chatId].name}\n📍 Город: ${userData[chatId].city}\n📞 Контакт: ${userData[chatId].contact}`;

        await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
        await ctx.reply("✅ Ваша заявка отправлена!");

        delete userData[chatId]; // Очищаем данные пользователя
    }
});

// Запуск сервера
app.listen(3000, () => console.log("Сервер запущен на порту 3000"));

bot.launch();

module.exports = app;
