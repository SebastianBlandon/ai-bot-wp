const { createBot, createProvider, createFlow, addKeyword, addAnswer, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const { handlerAI } = require("./utils");
const { ttsElevenLabs } = require("./services/eventlab");
const { initAssistant, retrieveAssistant, sendToAssistant, ttsOpenAI, dalleAPI } = require("./services/openai");
const { listClients, listTickets, searchByPhoneNumber, searchByIDNumber, createTicket } = require("./services/wisphub");


let assistant = null;
let thread = null;
let clients = null;
let client = null;
let idServicio = null;
let tickets = null;
let createNewTicket = false;
let processCreateTicket = false;
const path = require('path');
let data = null;

const sessions = {};

function getSession(userIdentifier) {
    if (!sessions[userIdentifier]) {
        // Create a new session if it doesn't exist
        sessions[userIdentifier] = {
            thread: null,
            assistant: null,
            client: null,
            isLoggedIn: false,
            // ... any other session-specific data
        };
    }
    return sessions[userIdentifier];
}

const flowWelcome = addKeyword(EVENTS.WELCOME).addAction(
  async (ctx, ctxFn) => {
      try {
          console.log("Mensaje entrante : ", ctx.body);
          const userIdentifier = ctx.from;
          const session = getSession(userIdentifier);

          if (processCreateTicket) {
            subject = ctx.body;
            console.log("Proceso de creacion de ticket....", subject);
            createTicket(session.client.id_servicio, subject);
            processCreateTicket = false;
          }
          else if (createNewTicket) {
            if (session.client != null) {
              tickets = await listTickets();
              console.log("tickets : ", tickets, " \ncliente : ", session.client);
              if (tickets != null) {
                // Suponiendo que 'response' contiene la respuesta que recibiste
                idServicio = session.client.id_servicio; // Aquí debes reemplazar con el id_servicio que tienes

                // Verificar si hay algún ticket asociado al id_servicio en la lista de resultados
                const ticketEncontrado = tickets.results.find(ticket => ticket.servicio.id_servicio === idServicio);

                if (ticketEncontrado) {
                  // Si se encontró un ticket para el id_servicio específico
                  console.log('Se encontró un ticket para el servicio:', ticketEncontrado);
                } else {
                  // Si no se encontró ningún ticket para el id_servicio específico
                  processCreateTicket = true;
                  ctx.body += " Nota del sistema : se procede a crear el ticket al usuario, pidele la descripcion de la falla.";
                  console.log('No se encontró ningún ticket para este servicio.');
                }
              }
              else {
                console.log("No se encontraron tickets");
              }
            }
            else {
              client = searchByIDNumber(clients, ctx.body);
              if (client != null) {
                session.client = client;
                tickets = await listTickets();
                if (tickets != null) {
                  // Suponiendo que 'response' contiene la respuesta que recibiste
                  idServicio = session.client.id_servicio; // Aquí debes reemplazar con el id_servicio que tienes

                  // Verificar si hay algún ticket asociado al id_servicio en la lista de resultados
                  const ticketEncontrado = tickets.results.find(ticket => ticket.servicio.id_servicio === idServicio);

                  if (ticketEncontrado) {
                    // Si se encontró un ticket para el id_servicio específico
                    console.log('Se encontró un ticket para el servicio:', ticketEncontrado);
                  } else {
                    // Si no se encontró ningún ticket para el id_servicio específico
                    processCreateTicket = true;
                    ctx.body += " Nota del sistema : se procede a crear el ticket al usuario, pidele la descripcion de la falla.";
                    console.log('No se encontró ningún ticket para este servicio.');
                  }
                }
                else {
                  console.log("No se encontraron tickets");
                }
              }
              else {
                ctx.body += " Nota del sistema : No se encontró el cliente, la cédula no está registrada en el sistema o la escribieron mal, pidele que vuelvan a escribirla.";
              }
            }
            createNewTicket = false;
          }
          if (!session.isLoggedIn) {
            assistant = await retrieveAssistant();
            thread = await initAssistant();
            clients = await listClients();
            client = searchByPhoneNumber(clients, ctx.from.substring(2));
            if (client != null) {
              data = await sendToAssistant(thread, assistant, ctx.body, client.nombre);
            }
            else {
              data = await sendToAssistant(thread, assistant, ctx.body, null);
            }
            session.isLoggedIn = true; // Update the isLoggedIn flag in the session
            session.thread = thread;
            session.assistant = assistant;
            session.client = client;
          }
          else {
            data = await sendToAssistant(session.thread, session.assistant, ctx.body, null);
          }
          if ((data.includes("ticket") || data.includes("Ticket") || data.includes("soporte") || data.includes("Soporte")) && (data.includes("cédula") || data.includes("Cédula"))) {
            createNewTicket = true;
            if (session.client != null) {
              ctx.body += " Nota del sistema : Ya se tiene la cedula del cliente se procede a crear el ticket al usuario, saludas al clienta y pidele la descripcion de la falla.";
              data = await sendToAssistant(session.thread, session.assistant, ctx.body, null);
              processCreateTicket = true;
            }
          }
          console.log('Mensaje saliente : ', data)
          await ctxFn.flowDynamic(data);
          console.log("🙉 Envio de mensajes completado....");
      } catch (error) {
          console.error('Error in flowGPTStream:', error);
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
          const userIdentifier = ctx.from;
          const session = getSession(userIdentifier);

          console.log('Incoming message: ', fullSentence, ' desde num:', userIdentifier);

          if (!session.isLoggedIn) {
            assistant = await retrieveAssistant();
            thread = await initAssistant();
            clients = await listClients();
            const searchClient = searchByPhoneNumber(clients, ctx.from.substring(2));
            if (searchClient != null) {
              data = await sendToAssistant(thread, assistant, fullSentence, searchClient.nombre);
            }
            else {
              data = await sendToAssistant(thread, assistant, fullSentence, null);
            }
            session.isLoggedIn = true; // Update the isLoggedIn flag in the session
            session.thread = thread;
            session.assistant = assistant;
          }
          else {
            const { thread, assistant } = session;
            data = await sendToAssistant(thread, assistant, fullSentence, null);
          }
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
  /*try {
    const list = await listClients();
    console.log(searchByPhoneNumber(list, "3106559911"));
  }
  catch (error) {
    console.error(error);
  }*/
}
main()