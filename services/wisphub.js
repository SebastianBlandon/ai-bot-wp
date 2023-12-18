const axios = require('axios');
const FormData = require('form-data');

const clientsUrl = 'https://api.wisphub.net/api/clientes/';
const ticketsUrl = 'https://api.wisphub.net/api/tickets/';

const WISPHUB_NET_KEY = process.env.WISPHUB_NET_KEY ?? "";

const limit = 2000; // Cantidad máxima de elementos a devolver (tamaño de la página)
const offset = 0; // Posición inicial de la consulta

const listClients = async () => {
    try {
        const response = await axios.get(clientsUrl, {
            headers: {
              'Authorization': `Api-Key ${WISPHUB_NET_KEY}`
            },
            params: {
                limit: limit,
                offset: offset
                // Otros parámetros de consulta (si es necesario)
              }
          });
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}

const listTickets = async () => {
    try {
        const response = await axios.get(ticketsUrl, {
            headers: {
              'Authorization': `Api-Key ${WISPHUB_NET_KEY}`
            },
            params: {
                limit: limit,
                offset: offset
                // Otros parámetros de consulta (si es necesario)
              }
          });
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}

const createTicket = async (idService, subject) => {
    try {
      const currentDate = new Date(); // Fecha y hora actual
      const futureDate = new Date();
      futureDate.setDate(currentDate.getDate() + 10); // Sumar 10 días

      // Formatear las fechas según el formato 'DD/MM/YYYY HH:mm'
        const formattedCurrentDate = `${
            currentDate.getDate().toString().padStart(2, '0')
        }/${
            (currentDate.getMonth() + 1).toString().padStart(2, '0')
        }/${
            currentDate.getFullYear()
        } ${
            currentDate.getHours().toString().padStart(2, '0')
        }:${
            currentDate.getMinutes().toString().padStart(2, '0')
        }`;
        
        const formattedFutureDate = `${
            futureDate.getDate().toString().padStart(2, '0')
        }/${
            (futureDate.getMonth() + 1).toString().padStart(2, '0')
        }/${
            futureDate.getFullYear()
        } ${
            futureDate.getHours().toString().padStart(2, '0')
        }:${
            futureDate.getMinutes().toString().padStart(2, '0')
        }`;
  
      
      const data = new FormData();
      data.append('asuntos_default', 'Internet Lento');
      data.append('asunto', subject);
      data.append('tecnico', '0');
      data.append('descripcion', '<p>El ticket fue creado por el bot de whatsapp, preguntar exactamente la razón del reporte.</p>');
      data.append('estado', '1');
      data.append('prioridad', '1');
      data.append('servicio', idService);
      data.append('fecha_inicio', formattedCurrentDate);
      data.append('fecha_final', formattedFutureDate);
      data.append('origen_reporte', 'redes_sociales');
      data.append('departamento', 'Soporte Técnico');
      data.append('departamentos_default', 'Soporte Técnico');
      data.append('email_tecnico', 'ai_bot_wp@sunnova.com');
  
      const config = {
        method: 'post',
        url: ticketsUrl,
        headers: {
          'Authorization': `Api-Key ${WISPHUB_NET_KEY}`,
          ...data.getHeaders(),
        },
        data: data,
      };
  
      const response = await axios(config);
      console.log('Ticket creado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      throw error;
    }
  };

// Function to search by phone number
const searchByPhoneNumber = (clientsObj, phoneNumber) => {
    const foundClient = Object.values(clientsObj.results).find(
        client => client.telefono === phoneNumber.toString()
    );
    return foundClient || null; // Return the found client or null if not found
};

// Function to search by ID number
const searchByIDNumber = (clientsObj, IDNumber) => {
    const foundClient = clientsObj.results.find(
        client => client.cedula === IDNumber.toString()
    );
    return foundClient || null; // Return the found client or null if not found
};

module.exports = { listClients, listTickets, searchByPhoneNumber, searchByIDNumber, createTicket };