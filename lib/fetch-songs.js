// fetch-songs.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const baseUrl = "http://www.tomwaits.com";
const songs = JSON.parse(fs.readFileSync("./all_songs.json", "utf8"));

const outputDir = path.join(__dirname, "songs_json");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAndSave(song, index, total) {
  const url = baseUrl + song.href;
  const safeTitle = song.title.replace(/[^a-z0-9_\-]+/gi, "_");
  const filePath = path.join(outputDir, safeTitle + ".json");

  // ✅ Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(
      `⏭️  [${index + 1}/${total}] Skipping (already exists): ${song.title}`
    );
    return;
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      const albumName = $(".songs-chosen-hd h4 a").text().trim();
      const lyrics = $(".songs-lyrics").html()?.trim() || "";

      const songData = {
        title: song.title,
        href: song.href,
        album: albumName,
        lyrics: lyrics,
      };

      fs.writeFileSync(filePath, JSON.stringify(songData, null, 2), "utf8");
      console.log(`✅ [${index + 1}/${total}] Saved: ${song.title}`);
      return;
    } catch (err) {
      console.warn(
        `⚠️ [${index + 1}/${total}] Attempt ${attempt} failed for ${
          song.title
        }: ${err.message}`
      );
      if (attempt < 3) {
        const backoff = attempt * 2000;
        console.log(`⏳ Retrying in ${backoff}ms...`);
        await delay(backoff);
      } else {
        console.error(
          `❌ [${index + 1}/${total}] Skipping after 3 failures: ${song.title}`
        );
      }
    }
  }
}

async function run() {
  const total = songs.length;
  for (let i = 0; i < total; i++) {
    const song = songs[i];
    await fetchAndSave(song, i, total);

    // random delay between 1–4 seconds
    const pause = 1000 + Math.floor(Math.random() * 3000);
    await delay(pause);
  }
}

run();
