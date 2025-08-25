// parse-songs.js
const fs = require("fs");
const cheerio = require("cheerio");

const html = fs.readFileSync("./song-list.html", "utf8");
const $ = cheerio.load(html);

const songs = [];

$("#songs-list li a").each((_, el) => {
  const href = $(el).attr("href");
  const title = $(el).text().trim();
  songs.push({ href, title });
});

console.log(JSON.stringify(songs, null, 2));
