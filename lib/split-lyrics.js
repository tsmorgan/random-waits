// split-lyrics.js
const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "songs_json"); // your folder of JSON files

// Helper to cleanly split lyrics into lines
function splitLyrics(lyrics) {
  return lyrics
    .replace(/<br\s*\/?>/gi, "\n") // replace <br> and <br/> with newline
    .split(/\n+/)                  // split on one or more newlines
    .map(line => line.trim())      // trim whitespace
    .filter(line => line.length);  // remove empty lines
}

fs.readdirSync(inputDir).forEach(file => {
  if (!file.endsWith(".json")) return;

  const filePath = path.join(inputDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (data.lyrics) {
    data.lyrics = splitLyrics(data.lyrics);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`✅ Updated lyrics in ${file}`);
  }
});
