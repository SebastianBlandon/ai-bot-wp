import { join } from 'path'
import { createBot, createProvider, createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import { MemoryDB as Database } from '@builderbot/bot'
import { BaileysProvider as Provider } from '@builderbot/provider-baileys'

import { handlerAI } from './utils';
import { ttsElevenLabs } from '../services/eventlab';
import { logicBot } from './logic';

const PORT = process.env.PORT ?? 3008

let data: any = {};

const flowWelcome = addKeyword(EVENTS.WELCOME).addAction(
    async (ctx, ctxFn) => {
        try {
            console.log("Mensaje entrante : ", ctx.body);
            data = await logicBot(ctx.from, ctx.body);
            console.log('Mensaje saliente : ', data)
            await ctxFn.flowDynamic(data);
            console.log("🙉 Envio de mensajes completado....");
        } catch (error) {
            console.error('Error in flowWelcome:', error);
        }
    }
);
  
const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
    async (ctx, ctxFn) => {
        try {
            console.log("🤖 voz a texto....");
            const text = await handlerAI(ctx);
            console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);
            const currentState = ctxFn.state.getMyState();
            const fullSentence = `${currentState?.answer ?? ""}. ${text}`;
            
            console.log("Mensaje entrante : ", fullSentence);
            data = await logicBot(ctx.from, fullSentence);
            console.log('Mensaje saliente : ', data)
            await ctxFn.flowDynamic(data);
            console.log("🙉 Envio de mensajes completado....");
        } catch (error) {
            console.error('Error in flowVoiceNote:', error);
        }
    }
);

const main = async () => {
    const adapterFlow = createFlow([flowWelcome, flowVoiceNote])
    
    const adapterProvider = createProvider(Provider)
    const adapterDB = new Database()

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )

    httpServer(+PORT)
}

main()
