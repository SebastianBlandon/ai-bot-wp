import axios from 'axios';
import FormData from 'form-data';

const clientsUrl = 'https://api.wisphub.net/api/clientes/';
const ticketsUrl = 'https://api.wisphub.net/api/tickets/';
const staffUrl = 'https://api.wisphub.net/api/staff/';

const WISPHUB_NET_KEY = process.env.WISPHUB_NET_KEY ?? "";

const limit = 2000; // Cantidad máxima de elementos a devolver (tamaño de la página)
const offset = 0; // Posición inicial de la consulta

interface Client {
  nombre: string;
  zona: {
    id: number;
  };
  servicios: Array<{
    id: number;
  }>;
}

interface ClientsResponse {
  results: Client[];
}

interface TicketsResponse {
  results: Array<{
    servicio: {
      zona: {
        id: number;
      };
    };
  }>;
}

const listClients = async (): Promise<ClientsResponse> => {
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
        throw error;
    }
}

const listTickets = async (): Promise<TicketsResponse> => {
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
        throw error;
    }
}

const listStaff = async () => {
    try {
        const response = await axios.get(staffUrl, {
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
        throw error;
    }
}

const searchByPhoneNumber = (clients: ClientsResponse, phoneNumber: string): Client | null => {
    if (!clients || !clients.results) {
        return null;
    }
    
    for (const client of clients.results) {
        // Lógica para buscar por número de teléfono
        // Implementar según la estructura de datos de los clientes
        // Por ejemplo, si el cliente tiene un campo 'telefono':
        // if (client.telefono === phoneNumber) {
        //     return client;
        // }
    }
    
    return null;
}

const searchByIDNumber = (clients: ClientsResponse, idNumber: string): Client | null => {
    if (!clients || !clients.results) {
        return null;
    }
    
    for (const client of clients.results) {
        // Lógica para buscar por número de identificación
        // Implementar según la estructura de datos de los clientes
        // Por ejemplo, si el cliente tiene un campo 'identificacion':
        // if (client.identificacion === idNumber) {
        //     return client;
        // }
    }
    
    return null;
}

const createTicket = async (
    idServicio: number, 
    idStaff: number, 
    prioridad: string, 
    estado: string, 
    asunto: string, 
    descripcion: string
) => {
    try {
        const formData = new FormData();
        formData.append('servicio', idServicio);
        formData.append('staff', idStaff);
        formData.append('prioridad', prioridad);
        formData.append('estado', estado);
        formData.append('asunto', asunto);
        formData.append('descripcion', descripcion);

        const response = await axios.post(ticketsUrl, formData, {
            headers: {
                'Authorization': `Api-Key ${WISPHUB_NET_KEY}`,
                ...formData.getHeaders()
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating ticket:', error);
        throw error;
    }
};

export { 
    listClients, 
    listTickets, 
    listStaff, 
    searchByPhoneNumber, 
    searchByIDNumber, 
    createTicket 
};