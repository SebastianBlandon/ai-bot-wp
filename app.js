const { createBot, createProvider, createFlow, addKeyword, addAnswer, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const { handlerAI } = require("./utils");
const { ttsElevenLabs } = require("./services/eventlab");
const { logicBot } = require("./logic");

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
  try {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowVoiceNote, flowWelcome])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
  }
  catch (error) {
    console.error(error);
  }
}
main()