const axios = require('axios');

const clientsUrl = 'https://api.wisphub.net/api/clientes/';

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

module.exports = { listClients, searchByPhoneNumber, searchByIDNumber };