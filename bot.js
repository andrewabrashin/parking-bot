require('dotenv').config();
const { Telegraf, Input } = require('telegraf');
const axios = require('axios');
const NodeWebcam = require( "node-webcam" );

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('send me ur geolocation'));

bot.on('message', async (ctx) => {
  // console.log(ctx.message);
  if (ctx.message.text === '1') {
	  const doSendPhoto = async () => {
		  await ctx.reply(`parking look`);
		  // await ctx.telegram.sendPhoto(ctx.message.chat.id, Input.fromLocalFile('', 'temp.jpg'));
		  await ctx.replyWithPhoto({ source: 'temp.jpg' });
	  };
	  await getParkingPhoto(doSendPhoto);
  }

});

async function getParkingPhoto (doSend) {
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
	const Webcam = NodeWebcam.create( opts );

	Webcam.capture( 'temp', function( err, data ) {
		doSend();
	} );

}

bot.launch();
