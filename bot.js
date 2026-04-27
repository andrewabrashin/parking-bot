require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const NodeWebcam = require("node-webcam");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) =>
  ctx.reply('Нажми кнопку чтобы посмотреть парковку', Markup.inlineKeyboard([
    Markup.button.callback('📷 Парковка', 'parking_photo')
  ]))
);

bot.action('parking_photo', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('Делаю снимок...');
  try {
    await getParkingPhoto();
    await ctx.replyWithPhoto({ source: 'temp.jpg' });
  } catch (err) {
    await ctx.reply(`Ошибка камеры: ${err.message}`);
  }
});

async function getParkingPhoto() {
  return new Promise((resolve, reject) => {
    const opts = {
      width: 1920,
      height: 1200,
      quality: 100,
      frames: 60,
      delay: 0,
      saveShots: true,
      output: "jpeg",
      device: false,
      callbackReturn: "location",
      verbose: false
    };
    const Webcam = NodeWebcam.create(opts);

    Webcam.capture('temp', (err, data) => {
      if (err) {
        reject(new Error('камера недоступна'));
        return;
      }
      resolve(data);
    });
  });
}

bot.launch();
