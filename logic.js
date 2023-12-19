const { initAssistant, retrieveAssistant, sendToAssistant, ttsOpenAI, dalleAPI } = require("./services/openai");
const { listClients, listTickets, listStaff, searchByPhoneNumber, searchByIDNumber, createTicket } = require("./services/wisphub");


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

const logicBot = async (celFromWite, message) => {
  const userIdentifier = celFromWite;
  const session = getSession(userIdentifier);

  if (processCreateTicket) {
    subject = message;
    createTicket(session.client.id_servicio, subject);
    processCreateTicket = false;
  }
  else if (createNewTicket) {
    client = searchByIDNumber(clients, message);
    if (client != null) {
      session.client = client;
      tickets = await listTickets();
      if (tickets != null) {
        // Suponiendo que 'response' contiene la respuesta que recibiste
        idServicio = client.id_servicio; // Aquí debes reemplazar con el id_servicio que tienes

        // Verificar si hay algún ticket asociado al id_servicio en la lista de resultados
        const ticketEncontrado = tickets.results.find(ticket => ticket.servicio.id_servicio === idServicio);

        if (ticketEncontrado) {
          // Si se encontró un ticket para el id_servicio específico
          message += " Nota del sistema : se encontró un ticket para el servicio, dile al cliente que ya se tiene registro de su falla y que ya se comunican con el.";
        } else {
          // Si no se encontró ningún ticket para el id_servicio específico
          processCreateTicket = true;
          message += " Nota del sistema : se procede a crear el ticket al usuario, pidele la descripcion de la falla.";
        }
      }
      else {
        console.log("No se encontraron tickets");
      }
    }
    else {
      message += " Nota del sistema : No se encontró el cliente, la cédula no está registrada en el sistema o la escribieron mal, pidele que vuelvan a escribirla.";
    }
    createNewTicket = false;
  }
  if (!session.isLoggedIn) {
    assistant = await retrieveAssistant();
    thread = await initAssistant();
    clients = await listClients();
    client = searchByPhoneNumber(clients, celFromWite.substring(2));
    if (client != null) {
      data = await sendToAssistant(thread, assistant, message, client.nombre);
    }
    else {
      data = await sendToAssistant(thread, assistant, message, null);
    }
    session.isLoggedIn = true; // Update the isLoggedIn flag in the session
    session.thread = thread;
    session.assistant = assistant;
    session.client = client;
  }
  else {
    data = await sendToAssistant(session.thread, session.assistant, message, null);
  }
  if ((data.includes("ticket") || data.includes("Ticket") || data.includes("soporte") || data.includes("Soporte")) && (data.includes("cédula") || data.includes("Cédula")) && (data.includes("puntos") || data.includes("comas") || data.includes("Puntos") || data.includes("Comas"))) {
    createNewTicket = true;
  }
  return data;
}

module.exports = { logicBot };