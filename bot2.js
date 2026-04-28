require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { exec } = require('child_process');

const bot = new Telegraf(process.env.BOT_TOKEN);

const COOLDOWN_MS = 20_000;
let lastPhotoTime = 0;
let photoSent = false;

const mainKeyboard = Markup.keyboard([['📷 Парковка']]).resize().persistent();

bot.start((ctx) => ctx.reply('Привет!', mainKeyboard));

bot.hears('📷 Парковка', async (ctx) => {
  const elapsed = Date.now() - lastPhotoTime;

  if (elapsed < COOLDOWN_MS) {
    if (!photoSent) {
      photoSent = true;
      await ctx.replyWithPhoto({ source: 'temp.jpg' });
    } else {
      const wait = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      await ctx.reply(`Подожди ещё ${wait} сек.`);
    }
    return;
  }

  lastPhotoTime = Date.now();
  photoSent = false;
  await ctx.reply('Делаю снимок...');
  try {
    await getParkingPhoto();
    photoSent = true;
    await ctx.replyWithPhoto({ source: 'temp.jpg' });
  } catch (err) {
    await ctx.reply(`Ошибка камеры: ${err.message}`);
  }
});

async function getParkingPhoto() {
  return new Promise((resolve, reject) => {
    // 0 = задняя камера, 1 = передняя
    exec('termux-camera-photo -c 0 temp.jpg', (err) => {
      if (err) {
        reject(new Error('камера недоступна'));
        return;
      }
      resolve('temp.jpg');
    });
  });
}

bot.launch();
