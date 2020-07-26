const { Telegraf } = require("telegraf");
const request = require("request");
const fetch = require("node-fetch");

const bot = new Telegraf(process.env.BOT);

function getID(query, cb) {
  fetch(process.env.API_FIRST + query, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((response) => {
      response = response.slice(response.indexOf("{"));
      response = JSON.parse(response);
      cb(false, response.albums.data);
    })
    .catch((err) => {
      cb(true, null);
      console.error(err);
    });
}

function getUrl(id, cb) {
  fetch(process.env.API_SECOND + id, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((response) => {
      response = response.slice(response.indexOf("{"));
      response = JSON.parse(response);
      cb(false, response.songs[0].media_preview_url);
    })
    .catch((err) => {
      cb(true, null);
    });
}

function getLink(query, cb) {
  getID(query, (err, data) => {
    getUrl(data[0].id, (err, data) => {
      if (err) {
        cb(true, null);
      } else {
        data = data.replace("preview", "aac");
        data = data.replace("96_p.mp4", "320.mp4");
        cb(false, data);
      }
    });
  });
}

bot.on("message", (ctx) => {
  var song = ctx.message.text;
  getLink(song, (err, link) => {
    ctx.reply(`Fetching and Downloding ${song} ...`);
    ctx.reply("if its taking longer then expected, it maybe because your internet is slow.")
    ctx.replyWithDocument({url: link, filename: `${song}.mp3`});
  });
});

bot.launch();
