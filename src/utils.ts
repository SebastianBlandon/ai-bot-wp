import { downloadMediaMessage } from '@adiwajshing/baileys';
import * as fs from 'node:fs/promises';
import { convertOggMp3 } from '../services/convert.js';
import { voiceToText } from '../services/whisper.js';

const handlerAI = async (ctx: any) => {
    /**
     * OMITIR
     */
    const buffer = await downloadMediaMessage(ctx, "buffer", {});
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

export { handlerAI };