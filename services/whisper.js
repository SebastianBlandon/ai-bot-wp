const fs = require("fs");
const openai = require("../config/open-ai");

/**
 *
 * @param {*} path url mp3
 */
const voiceToText = async (path) => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path),
      model: "whisper-1",
    });

    return transcription.text;
  } catch (err) {
    console.log("Error Whisper : ", err.response.data)
    return "ERROR";
  }
};

module.exports = { voiceToText };
