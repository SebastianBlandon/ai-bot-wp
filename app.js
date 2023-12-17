const { createBot, createProvider, createFlow, addKeyword, addAnswer, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const { handlerAI } = require("./utils");
const { ttsElevenLabs } = require("./services/eventlab");
const { createThread, sendToAssistant, ttsOpenAI, dalleAPI } = require("./services/openai");
const { listClients, searchByPhoneNumber, searchByIDNumber } = require("./services/wisphub");

let thread = null;
let list = null;
const path = require('path');
let countIteration = 0;
let data = null;

const firstInteraction = async (ctx) => {
  const searchClient = searchByPhoneNumber(list, ctx.from.substring(2));
  if (searchClient != null) {
    return await sendToAssistant(thread, ctx.body, searchClient.nombre);
  }
  else {
    return await sendToAssistant(thread, ctx.body, null);
  }  
}

const sessions = {};

function getSession(userIdentifier) {
    if (!sessions[userIdentifier]) {
        // Create a new session if it doesn't exist
        sessions[userIdentifier] = {
            chatHistory: [],
            isLoggedIn: false,
            // ... any other session-specific data
        };
    }
    return sessions[userIdentifier];
}

const flowWelcome = addKeyword(EVENTS.WELCOME).addAction(
    async (ctx, ctxFn) => {
        console.log('Mensaje entrante : ', ctx.body)
        if (countIteration == 0) {
          data = await firstInteraction(ctx);
          countIteration++;
        }
        else {
          data = await sendToAssistant(thread, ctx.body, null);
        }
        console.log('Mensaje saliente : ', data)
        /*console.log("🙉 texto a voz....");
        const path = await ttsElevenLabs(data);
        console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
        //console.log("🙉 texto a imagen....");
        //const urlPicture = await dalleAPI(data);
        //console.log(`🙉 Fin texto a imagen....[PATH]:${urlPicture}`);
        //await ctxFn.flowDynamic(urlPicture);
        //await ctxFn.flowDynamic([{ body: " " , media : urlPicture}]);
        await ctxFn.flowDynamic([{ body: "escucha", media: path }]);*/
        await ctxFn.flowDynamic(data);
        console.log("🙉 Envio de mensajes completado....");
    }
);

const flowVoiceNote = addKeyword(EVENTS.VOICE_NOTE).addAction(
    async (ctx, ctxFn) => {
        //await ctxFn.flowDynamic("Dame un momento para escucharte...🙉");
        console.log("🤖 voz a texto....");
        const text = await handlerAI(ctx);
        console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);
        const currentState = ctxFn.state.getMyState();
        const fullSentence = `${currentState?.answer ?? ""}. ${text}`;
        if (countIteration == 0) {
          data = await firstInteraction(ctx);
          countIteration++;
        }
        else {
          data = await sendToAssistant(thread, ctx.body, null);
        }
        console.log('Mensaje saliente : ', data)
        /*console.log("🙉 texto a voz....");
        const path = await ttsElevenLabs(data);
        console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
        await ctxFn.flowDynamic([{ body: "escucha", media: path }]);*/
        await ctxFn.flowDynamic(data);
        console.log("🙉 Envio de mensajes completado....");
    }
);

const main = async () => {
  try {
    thread = await createThread();
    list = await listClients();
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
  /*try {
    const list = await listClients();
    console.log(searchByPhoneNumber(list, "3106559911"));
  }
  catch (error) {
    console.error(error);
  }*/
}
main()