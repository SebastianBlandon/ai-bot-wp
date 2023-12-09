const { downloadMediaMessage } = require('@adiwajshing/baileys');
const fs = require('node:fs/promises');
const { convertOggMp3 } = require('./services/convert');
const { voiceToText } = require('./services/whisper');

const handlerAI = async (ctx) => {
  /**
   * OMITIR
   */
  const buffer = await downloadMediaMessage(ctx, "buffer");
  const pathTmpOgg = `./tmp/voice-note.ogg`;
  const pathTmpMp3 = `./tmp/voice-note.mp3`;
  await fs.writeFile(pathTmpOgg, buffer);
  await convertOggMp3(pathTmpOgg, pathTmpMp3);
  const text = await voiceToText(pathTmpMp3);
  return text; //el habla1!!
  /**
   * OMITIR
   */
};

module.exports = { handlerAI };