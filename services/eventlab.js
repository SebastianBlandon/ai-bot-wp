const fs = require('node:fs')
/**
 *
 * @param {*} voiceId clone voice vwfl76D5KBjKuSGfTbLB
 * @returns
 */
const ttsElevenLabs = async (text,voiceId = 'WNgYJW08E8uDkDdKPlye') => {
  try {
    const EVENT_TOKEN = process.env.EVENT_TOKEN ?? "";
    const URL = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const header = new Headers();
    header.append("accept", "audio/mpeg");
    header.append("xi-api-key", EVENT_TOKEN);
    header.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 1,
        similarity_boost: 0.8,
      },
    });

    const requestOptions = {
      method: "POST",
      headers: header,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(URL, requestOptions);
    const buffer = await response.arrayBuffer();
    const pathFile = `./tmp/speech.mp3`;

    fs.writeFileSync(pathFile, Buffer.from(buffer));
    return pathFile;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { ttsElevenLabs };
