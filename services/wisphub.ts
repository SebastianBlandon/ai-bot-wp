import axios from 'axios';
import FormData from 'form-data';

const clientsUrl = 'https://api.wisphub.net/api/clientes/';
const ticketsUrl = 'https://api.wisphub.net/api/tickets/';
const staffUrl = 'https://api.wisphub.net/api/staff/';

const WISPHUB_NET_KEY = process.env.WISPHUB_NET_KEY ?? "";

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
        let allClients: Client[] = [];
        let currentOffset = 0;
        const pageSize = 300; // Tamaño de página que acepta la API
        let hasMoreData = true;
        
        console.log(`🔄 Iniciando obtención de todos los clientes...`);
        
        while (hasMoreData) {
            console.log(`📄 Obteniendo clientes desde offset ${currentOffset} (${pageSize} registros)`);
            
            const response = await axios.get(clientsUrl, {
                headers: {
                  'Authorization': `Api-Key ${WISPHUB_NET_KEY}`
                },
                params: {
                    limit: pageSize,
                    offset: currentOffset
                }
            });
            
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                allClients = allClients.concat(data.results);
                console.log(`✅ Obtenidos ${data.results.length} clientes. Total acumulado: ${allClients.length}`);
                
                // Si obtenemos menos registros que el tamaño de página, hemos llegado al final
                if (data.results.length < pageSize) {
                    hasMoreData = false;
                    console.log(`🏁 Llegamos al final de los datos. Total final: ${allClients.length} clientes`);
                } else {
                    currentOffset += pageSize;
                }
            } else {
                hasMoreData = false;
                console.log(`🏁 No hay más datos disponibles. Total final: ${allClients.length} clientes`);
            }
        }
        
        console.log(`🎉 Obtención completada. Total de clientes: ${allClients.length}`);
        
        return {
            results: allClients
        };
    }
    catch (error) {
        console.error('❌ Error obteniendo clientes:', error);
        throw error;
    }
}

const listTickets = async (): Promise<TicketsResponse> => {
    try {
        let allTickets: any[] = [];
        let currentOffset = 0;
        const pageSize = 300;
        let hasMoreData = true;
        
        console.log(`🔄 Iniciando obtención de todos los tickets...`);
        
        while (hasMoreData) {
            console.log(`📄 Obteniendo tickets desde offset ${currentOffset} (${pageSize} registros)`);
            
            const response = await axios.get(ticketsUrl, {
                headers: {
                  'Authorization': `Api-Key ${WISPHUB_NET_KEY}`
                },
                params: {
                    limit: pageSize,
                    offset: currentOffset
                }
            });
            
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                allTickets = allTickets.concat(data.results);
                console.log(`✅ Obtenidos ${data.results.length} tickets. Total acumulado: ${allTickets.length}`);
                
                if (data.results.length < pageSize) {
                    hasMoreData = false;
                    console.log(`🏁 Llegamos al final de los tickets. Total final: ${allTickets.length} tickets`);
                } else {
                    currentOffset += pageSize;
                }
            } else {
                hasMoreData = false;
                console.log(`🏁 No hay más tickets disponibles. Total final: ${allTickets.length} tickets`);
            }
        }
        
        console.log(`🎉 Obtención de tickets completada. Total: ${allTickets.length}`);
        
        return {
            results: allTickets
        };
    }
    catch (error) {
        console.error('❌ Error obteniendo tickets:', error);
        throw error;
    }
}

const listStaff = async () => {
    try {
        let allStaff: any[] = [];
        let currentOffset = 0;
        const pageSize = 300;
        let hasMoreData = true;
        
        console.log(`🔄 Iniciando obtención de todo el staff...`);
        
        while (hasMoreData) {
            console.log(`📄 Obteniendo staff desde offset ${currentOffset} (${pageSize} registros)`);
            
            const response = await axios.get(staffUrl, {
                headers: {
                  'Authorization': `Api-Key ${WISPHUB_NET_KEY}`
                },
                params: {
                    limit: pageSize,
                    offset: currentOffset
                }
            });
            
            const data = response.data;
            
            if (data.results && data.results.length > 0) {
                allStaff = allStaff.concat(data.results);
                console.log(`✅ Obtenidos ${data.results.length} staff. Total acumulado: ${allStaff.length}`);
                
                if (data.results.length < pageSize) {
                    hasMoreData = false;
                    console.log(`🏁 Llegamos al final del staff. Total final: ${allStaff.length} staff`);
                } else {
                    currentOffset += pageSize;
                }
            } else {
                hasMoreData = false;
                console.log(`🏁 No hay más staff disponible. Total final: ${allStaff.length} staff`);
            }
        }
        
        console.log(`🎉 Obtención de staff completada. Total: ${allStaff.length}`);
        
        return {
            results: allStaff
        };
    }
    catch (error) {
        console.error('❌ Error obteniendo staff:', error);
        throw error;
    }
}

const searchByPhoneNumber = (clients: ClientsResponse, phoneNumber: string): Client | null => {
    if (!clients || !clients.results) {
        console.log("❌ No hay clientes disponibles para buscar");
        return null;
    }
    
    // Normalizar el número de teléfono de búsqueda
    let normalizedSearchNumber = phoneNumber.replace(/\D/g, ''); // Remover caracteres no numéricos
    
    // Remover código de país 57 si está presente al inicio
    if (normalizedSearchNumber.startsWith('57') && normalizedSearchNumber.length > 10) {
        const withoutCountryCode = normalizedSearchNumber.substring(2);
        console.log(`🔍 Buscando número: "${phoneNumber}" -> Normalizado: "${normalizedSearchNumber}" -> Sin código país: "${withoutCountryCode}"`);
        normalizedSearchNumber = withoutCountryCode;
    } else {
        console.log(`🔍 Buscando número: "${phoneNumber}" -> Normalizado: "${normalizedSearchNumber}"`);
    }
    
    console.log(`📊 Total de clientes a revisar: ${clients.results.length}`);
    
    let checkedClients = 0;
    let clientsWithPhone = 0;
    
    for (const client of clients.results) {
        checkedClients++;
        
        if (!client.telefono) {
            console.log(`⚠️  Cliente ${checkedClients}: Sin número de teléfono (ID: ${client.id_servicio})`);
            continue;
        }
        
        clientsWithPhone++;
        
        // Separar múltiples números de teléfono por comas
        const phoneNumbers = client.telefono.split(',').map(phone => phone.trim());
        console.log(`📞 Cliente ${checkedClients}: "${client.telefono}" -> ${phoneNumbers.length} número(s) (ID: ${client.id_servicio})`);
        
        // Revisar cada número de teléfono del cliente
        for (let i = 0; i < phoneNumbers.length; i++) {
            const phoneNumber = phoneNumbers[i];
            
            // Normalizar el número del cliente
            const normalizedClientNumber = phoneNumber.replace(/\D/g, '');
            
            console.log(`   📱 Número ${i + 1}: "${phoneNumber}" -> Normalizado: "${normalizedClientNumber}"`);
            
            // Estrategias de búsqueda:
            
            // 1. Búsqueda exacta
            if (normalizedSearchNumber === normalizedClientNumber) {
                console.log(`✅ COINCIDENCIA EXACTA encontrada! Cliente ID: ${client.id_servicio} (número ${i + 1})`);
                return client;
            }
            
            // 2. Búsqueda por sufijo (últimos dígitos)
            if (normalizedClientNumber.length >= 7 && 
                normalizedSearchNumber.endsWith(normalizedClientNumber)) {
                console.log(`✅ COINCIDENCIA POR SUFIJO encontrada! Cliente ID: ${client.id_servicio} (número ${i + 1})`);
                console.log(`   Búsqueda: "${normalizedSearchNumber}" termina con "${normalizedClientNumber}"`);
                return client;
            }
            
            // 3. Búsqueda por prefijo (si el número de búsqueda es más largo)
            if (normalizedSearchNumber.length > normalizedClientNumber.length &&
                normalizedSearchNumber.endsWith(normalizedClientNumber)) {
                console.log(`✅ COINCIDENCIA POR PREFIJO encontrada! Cliente ID: ${client.id_servicio} (número ${i + 1})`);
                console.log(`   Búsqueda: "${normalizedSearchNumber}" termina con "${normalizedClientNumber}"`);
                return client;
            }
            
            // 4. Búsqueda por coincidencia parcial (últimos 7-10 dígitos)
            const minLength = Math.min(normalizedSearchNumber.length, normalizedClientNumber.length);
            const searchSuffix = normalizedSearchNumber.slice(-minLength);
            const clientSuffix = normalizedClientNumber.slice(-minLength);
            
            if (searchSuffix === clientSuffix && minLength >= 7) {
                console.log(`✅ COINCIDENCIA PARCIAL encontrada! Cliente ID: ${client.id_servicio} (número ${i + 1})`);
                console.log(`   Coincidencia: últimos ${minLength} dígitos "${searchSuffix}"`);
                return client;
            }
            
            // Log de comparación fallida para este número
            //console.log(`   ❌ No coincide: "${normalizedSearchNumber}" vs "${normalizedClientNumber}"`);
        }
    }
    
    console.log(`\n📋 RESUMEN DE BÚSQUEDA:`);
    console.log(`   - Total de clientes revisados: ${checkedClients}`);
    console.log(`   - Clientes con teléfono: ${clientsWithPhone}`);
    console.log(`   - Número buscado: "${normalizedSearchNumber}"`);
    console.log(`   - No se encontraron coincidencias`);
    
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

const searchByPhoneNumberMultiple = (clients: ClientsResponse, phoneNumber: string): Array<{client: Client, confidence: number, matchType: string}> => {
    if (!clients || !clients.results) {
        console.log("❌ No hay clientes disponibles para búsqueda múltiple");
        return [];
    }
    
    const results: Array<{client: Client, confidence: number, matchType: string}> = [];
    let normalizedSearchNumber = phoneNumber.replace(/\D/g, '');
    
    // Remover código de país 57 si está presente al inicio
    if (normalizedSearchNumber.startsWith('57') && normalizedSearchNumber.length > 10) {
        const withoutCountryCode = normalizedSearchNumber.substring(2);
        console.log(`🔍 BÚSQUEDA MÚLTIPLE - Número: "${phoneNumber}" -> Normalizado: "${normalizedSearchNumber}" -> Sin código país: "${withoutCountryCode}"`);
        normalizedSearchNumber = withoutCountryCode;
    } else {
        console.log(`🔍 BÚSQUEDA MÚLTIPLE - Número: "${phoneNumber}" -> Normalizado: "${normalizedSearchNumber}"`);
    }
    
    console.log(`📊 Total de clientes a revisar: ${clients.results.length}`);
    
    let checkedClients = 0;
    let clientsWithPhone = 0;
    let matchesFound = 0;
    
    for (const client of clients.results) {
        checkedClients++;
        
        if (!client.telefono) {
            console.log(`⚠️  Cliente ${checkedClients}: Sin número de teléfono (ID: ${client.id_servicio})`);
            continue;
        }
        
        clientsWithPhone++;
        
        // Separar múltiples números de teléfono por comas
        const phoneNumbers = client.telefono.split(',').map(phone => phone.trim());
        console.log(`📞 Cliente ${checkedClients}: "${client.telefono}" -> ${phoneNumbers.length} número(s) (ID: ${client.id_servicio})`);
        
        let bestConfidence = 0;
        let bestMatchType = '';
        let matchedPhoneIndex = -1;
        
        // Revisar cada número de teléfono del cliente
        for (let i = 0; i < phoneNumbers.length; i++) {
            const phoneNumber = phoneNumbers[i];
            const normalizedClientNumber = phoneNumber.replace(/\D/g, '');
            
            console.log(`   📱 Número ${i + 1}: "${phoneNumber}" -> Normalizado: "${normalizedClientNumber}"`);
            
            let confidence = 0;
            let matchType = '';
            
            // 1. Búsqueda exacta (100% confianza)
            if (normalizedSearchNumber === normalizedClientNumber) {
                confidence = 100;
                matchType = 'exact';
                console.log(`   ✅ COINCIDENCIA EXACTA (100%) - Número ${i + 1}`);
            }
            // 2. Búsqueda por sufijo completo (90% confianza)
            else if (normalizedClientNumber.length >= 7 && 
                     normalizedSearchNumber.endsWith(normalizedClientNumber)) {
                confidence = 90;
                matchType = 'suffix';
                console.log(`   ✅ COINCIDENCIA POR SUFIJO (90%) - Número ${i + 1}`);
            }
            // 3. Búsqueda por prefijo (85% confianza)
            else if (normalizedSearchNumber.length > normalizedClientNumber.length &&
                     normalizedSearchNumber.endsWith(normalizedClientNumber)) {
                confidence = 85;
                matchType = 'prefix';
                console.log(`   ✅ COINCIDENCIA POR PREFIJO (85%) - Número ${i + 1}`);
            }
            // 4. Coincidencia parcial de últimos dígitos (70-80% confianza)
            else {
                const minLength = Math.min(normalizedSearchNumber.length, normalizedClientNumber.length);
                if (minLength >= 7) {
                    const searchSuffix = normalizedSearchNumber.slice(-minLength);
                    const clientSuffix = normalizedClientNumber.slice(-minLength);
                    
                    if (searchSuffix === clientSuffix) {
                        confidence = 70 + (minLength - 7) * 2; // Más dígitos = más confianza
                        matchType = 'partial';
                        console.log(`   ✅ COINCIDENCIA PARCIAL (${confidence}%) - Número ${i + 1} (${minLength} dígitos)`);
                    }
                }
            }
            
            // Guardar la mejor coincidencia para este cliente
            if (confidence > bestConfidence) {
                bestConfidence = confidence;
                bestMatchType = matchType;
                matchedPhoneIndex = i;
            }
        }
        
        if (bestConfidence > 0) {
            matchesFound++;
            console.log(`✅ Cliente ID: ${client.id_servicio} - Mejor coincidencia: ${bestConfidence}% (${bestMatchType}) - Número ${matchedPhoneIndex + 1}`);
            results.push({ client, confidence: bestConfidence, matchType: bestMatchType });
        }
    }
    
    console.log(`\n📋 RESUMEN DE BÚSQUEDA MÚLTIPLE:`);
    console.log(`   - Total de clientes revisados: ${checkedClients}`);
    console.log(`   - Clientes con teléfono: ${clientsWithPhone}`);
    console.log(`   - Coincidencias encontradas: ${matchesFound}`);
    console.log(`   - Número buscado: "${normalizedSearchNumber}"`);
    
    if (matchesFound === 0) {
        console.log(`   - No se encontraron coincidencias`);
    } else {
        console.log(`   - Resultados ordenados por confianza:`);
        results.forEach((result, index) => {
            console.log(`     ${index + 1}. Cliente ID: ${result.client.id_servicio} - ${result.confidence}% (${result.matchType})`);
        });
    }
    
    // Ordenar por confianza descendente
    return results.sort((a, b) => b.confidence - a.confidence);
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
    searchByPhoneNumberMultiple,
    searchByIDNumber, 
    createTicket 
};