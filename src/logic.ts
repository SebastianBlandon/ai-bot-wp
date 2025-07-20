import { initAssistant, retrieveAssistant, sendToAssistant, ttsOpenAI, dalleAPI } from "../services/openai.js";
import { listClients, listTickets, listStaff, searchByPhoneNumber, searchByIDNumber, createTicket } from "../services/wisphub.js";
import path from 'path';

let assistant: any = null;
let thread: any = null;
let clients: any = null;
let client: any = null;
let createNewTicket: boolean = false;
let processCreateTicket: boolean = false;
let data: any = null;
let subject: string;

interface Session {
    thread: any;
    assistant: any;
    client: any;
    tickets: any;
    isLoggedIn: boolean;
}

const sessions: Record<string, Session> = {};

function getSession(userIdentifier: string): Session {
    if (!sessions[userIdentifier]) {
        // Create a new session if it doesn't exist
        sessions[userIdentifier] = {
            thread: null,
            assistant: null,
            client: null,
            tickets: null,
            isLoggedIn: false,
            // ... any other session-specific data
        };
    }
    return sessions[userIdentifier];
}

const logicBot = async (celFromWrite: string, message: string) => {
    const userIdentifier = celFromWrite;
    const session = getSession(userIdentifier);

    if (processCreateTicket) {
        subject = message;
        if ((subject.includes("NO") || subject.includes("No") || subject.includes("no") || subject.includes("nO")) && (subject.includes("Tiene") || subject.includes("Tiene") || subject.includes("Tengo") || subject.includes("tengo")) && (subject.includes("Internet") || subject.includes("internet"))) {
            if (session.tickets != null) {
                console.log("Se procede a crear el ticket");
                const idZona = session.client.zona.id;
                let countTicketsZona = 0;

                for (const ticket of session.tickets.results) {
                    if (ticket.servicio.zona.id === idZona) {
                        countTicketsZona++;
                    }
                }

                if (countTicketsZona > 0) {
                    message += " Nota del sistema : Ya existe un ticket abierto en la zona, no se puede crear otro ticket.";
                } else {
                    const idServicio = session.client.servicios[0].id;
                    const idStaff = 1;
                    const prioridad = "MEDIA";
                    const estado = "ABIERTO";
                    const asunto = "NO TIENE INTERNET";
                    const descripcion = "NO TIENE INTERNET";
                    const result = await createTicket(idServicio, idStaff, prioridad, estado, asunto, descripcion);
                    message += " Nota del sistema : Se ha creado un ticket de soporte con éxito.";
                }
            } else {
                message += " Nota del sistema : No se pudo crear el ticket, no se encontraron tickets previos.";
            }
        } else if ((subject.includes("SI") || subject.includes("Si") || subject.includes("si") || subject.includes("sI")) && (subject.includes("Tiene") || subject.includes("Tiene") || subject.includes("Tengo") || subject.includes("tengo")) && (subject.includes("Internet") || subject.includes("internet"))) {
            message += " Nota del sistema : No se creará un ticket de soporte.";
        } else {
            message += " Nota del sistema : No se entendió la respuesta, no se creará un ticket de soporte.";
        }
        processCreateTicket = false;
    }

    if (createNewTicket) {
        if (session.client != null) {
            session.tickets = await listTickets();
            message += " Nota del sistema : ¿No tiene internet? Responda Si o No. Si responde No, se creará un ticket de soporte.";
            processCreateTicket = true;
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
        console.log("Clients.count: ", clients.count);
        console.log("CelFromWrite: ", celFromWrite);
        client = searchByPhoneNumber(clients, celFromWrite);
        console.log("Client: ", client);
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

export { logicBot };