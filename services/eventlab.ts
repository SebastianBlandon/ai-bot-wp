import fs from 'node:fs';

/**
 *
 * @param {string} text - Texto a convertir a voz
 * @param {string} voiceId - ID de la voz a utilizar (clone voice vwfl76D5KBjKuSGfTbLB)
 * @returns {Promise<Buffer>} - Buffer con el audio generado
 */
const ttsElevenLabs = async (text: string, voiceId: string = 'WNgYJW08E8uDkDdKPlye'): Promise<Buffer> => {
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
      redirect: "follow" as RequestRedirect,
    };

    const response = await fetch(URL, requestOptions);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.log("Error:", error);
    throw new Error("Error en la conversión de texto a voz");
  }
};

export { ttsElevenLabs };