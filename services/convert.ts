import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 *
 * @param {string} inputStream - Ruta del archivo de entrada
 * @param {string} outStream - Ruta del archivo de salida
 * @returns {Promise<boolean>} - Promesa que se resuelve cuando la conversión se completa
 */
const convertOggMp3 = async (inputStream: string, outStream: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputStream)
      .audioQuality(96)
      .toFormat("mp3")
      .save(outStream)
      .on("progress", (p) => null)
      .on("end", () => {
        resolve(true);
      });
  });
};

export { convertOggMp3 };