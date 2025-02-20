async function sendApplication(ctx, type) {
  let application = `Новая заявка в раздел *${type}*\n\n`;
  for (let key in ctx.wizard.state) {
    if (key !== "photos" && key !== "works" && key !== "poster") {
      application += `- ${key}: ${ctx.wizard.state[key]}\n`;
    }
  }

  try {
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
  } catch (error) {
    console.error("Ошибка отправки заявки:", error);
    await ctx.reply("❌ Ошибка при отправке заявки. Попробуйте позже.");
  }
}
