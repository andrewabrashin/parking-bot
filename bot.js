require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const NodeWebcam = require("node-webcam");

const bot = new Telegraf(process.env.BOT_TOKEN);

const COOLDOWN_MS = 20_000;
let lastPhotoTime = 0;

const mainKeyboard = Markup.keyboard([['📷 Парковка']]).resize().persistent();

bot.start((ctx) => ctx.reply('Привет!', mainKeyboard));

bot.hears('📷 Парковка', async (ctx) => {
  const elapsed = Date.now() - lastPhotoTime;
  if (elapsed < COOLDOWN_MS) {
    const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    await ctx.reply(`Подожди ещё ${wait} сек.`);
    return;
  }
  lastPhotoTime = Date.now();
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
