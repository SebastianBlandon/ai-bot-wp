import axios from 'axios';
import FormData from 'form-data';

const clientsUrl = 'https://api.wisphub.net/api/clientes/';
const ticketsUrl = 'https://api.wisphub.net/api/tickets/';
const staffUrl = 'https://api.wisphub.net/api/staff/';

const WISPHUB_NET_KEY = process.env.WISPHUB_NET_KEY ?? "";

const limit = 2000; // Cantidad máxima de elementos a devolver (tamaño de la página)
const offset = 0; // Posición inicial de la consulta

interface Client {
    id_servicio: number,
    usuario: string,
    nombre: string,
    email: string,
    cedula: string,
    direccion: string,
    localidad: string,
    ciudad: string,
    telefono: string,
    descuento: string,
    saldo: string,
    rfc: string,
    informacion_adicional: string,
    notificacion_sms: boolean,
    aviso_pantalla: boolean,
    notificaciones_push: boolean,
    auto_activar_servicio: boolean,
    firewall: boolean,
    servicio: string,
    password_servicio: string,
    server_hotspot: string,
    ip: string,
    ip_local: string | null,
    estado: string,
    modelo_antena: string | null,
    password_cpe: string,
    mac_cpe: string,
    interfaz_lan: string,
    modelo_router_wifi: string,
    ip_router_wifi: string | null,
    mac_router_wifi: string,
    usuario_router_wifi: string,
    password_router_wifi: string,
    ssid_router_wifi: string,
    password_ssid_router_wifi: string,
    comentarios: string,
    coordenadas: string,
    costo_instalacion: string,
    precio_plan: string,
    forma_contratacion: string,
    sn_onu: string,
    estado_facturas: string,
    fecha_instalacion: string,
    fecha_cancelacion: string | null,
    fecha_corte: string,
    ultimo_cambio: string,
    plan_internet: any,
    zona: any,
    router: any,
    sectorial: string | null,
    tecnico: any
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
    console.log("PhoneNumber: ", phoneNumber);
    console.log("Clients: ", clients);
    if (!clients || !clients.results) {
        return null;
    }
    
    for (const client of clients.results) {
        if (client.telefono === phoneNumber) {
            return client;
        }
    }
    
    return null;
}

const searchByIDNumber = (clients: ClientsResponse, idNumber: string): Client | null => {
    if (!clients || !clients.results) {
        return null;
    }
    
    for (const client of clients.results) {
        if (client.cedula === idNumber) {
            return client;
        }
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