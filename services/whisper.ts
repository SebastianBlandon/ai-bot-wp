import fs from "fs";
import openai from "../config/open-ai.js";

/**
 *
 * @param {string} path - Ruta del archivo MP3
 * @returns {Promise<string>} - Texto transcrito
 */
const voiceToText = async (path: string): Promise<string> => {
  if (!fs.existsSync(path)) {
    throw new Error("No se encuentra el archivo");
  }

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(path),
      model: "whisper-1",
    });

    return transcription.text;
  } catch (err: any) {
    console.log("Error Whisper : ", err.response?.data || err);
    return "ERROR";
  }
};

export { voiceToText };