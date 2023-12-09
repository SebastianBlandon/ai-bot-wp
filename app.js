const openai = require("./config/open-ai");

const { createBot, createProvider, createFlow, addKeyword, addAnswer, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')


const { handlerAI } = require("./utils");
const { ttsElevenLabs } = require("./services/eventlab");

const fs = require('fs');
const path = require('path');
const { finished } = require("stream");
const { constrainedMemory } = require("process");
const speechFile = path.resolve("./tmp/speech.mp3");

const prompt = `Eres un asistente de soporte al cliente de la empresa Movistar, un servicio automatizado para dar soporte a los usuarios sobre el uso de telefonos inteligentes. \
    Primero saludas al cliente, y le preguntas su nombre. Luego recoges la solicitud del cliente.
    Intenta resolver todas sus dudas y no sugieras que contacte a soporte Movistar, sino que continua con el cliente hasta resolver todas sus inquietudes.
    Si el cliente desea comprar un telefono celular, primero recopila dos o tres caracteristicas generales que desea obtener el cliente en su telefono antes de recomendar alguna opcion disponible.
    Asegurate de no enumerar las opciones en tus respuestas.
    Asegurate de aclarar todas las dudas del cliente.
    Asegurate de no salirte de este contexto de soporte al cliente en telefonia celular, y reenfoca nuevamente al cliente.
    Comportate de forma interactiva dando respuestas cortas y esperando retroalimentacion del cliente. No suministres respuestas largas con multiples pasos a seguir.
    Responde en un estilo corto, amigable y muy conversacional.
    Esta es la informacion general para brindar soporte al cliente del teléfono:
    Solucion a problemas de red Solución -  Comprueba si hay interrupciones en la red en tu área, reinicia tu teléfono o realiza una búsqueda manual de redes. Si persiste, contacta al servicio de atención al cliente.
    Solucion a problemas de Configuración de datos y APN - Solución: Accede a la configuración de red móvil y asegúrate de que el APN esté correctamente configurado. Si no sabes la configuración correcta, solicítala a tu proveedor de servicios.
    Solucion a problemas de llamadas - Reinicia tu teléfono, verifica que tengas suficiente saldo o minutos en tu plan y comprueba que no haya problemas de red. Si el problema persiste, comunícate con el soporte.
    Solucion a problemas con la mensajería - Borra el caché de la aplicación de mensajería, asegúrate de utilizar la aplicación predeterminada y libera espacio de almacenamiento si es necesario.
    Solucion a problemas de batería - Reduce el brillo de la pantalla, cierra aplicaciones en segundo plano y considera reemplazar la batería si está dañada.
    Solucion a problemas de software - Actualiza el sistema operativo y las aplicaciones, borra el caché de aplicaciones problemáticas o considera una restauración de fábrica si es necesario.
    Solucion a problemas de Olvido de contraseñas o bloqueos - Restablece la contraseña a través de la opción de recuperación de contraseña o PIN. Sigue las instrucciones de desbloqueo si es un bloqueo de patrón o PIN.
    Solucion a problemas de pérdida o robo de dispositivos - Bloquea el dispositivo a través de la función de rastreo o comunica la pérdida/robo a tu proveedor de servicios.
    Solucion a problemas de seguridad - Activa funciones de seguridad como el bloqueo por huella dactilar o PIN, y utiliza aplicaciones de seguridad y antivirus confiables.
    Solucion a problemas de transferencia de datos - Utiliza aplicaciones de respaldo y restauración de datos o servicios en la nube, y sigue los pasos de migración de datos al configurar un nuevo dispositivo.
    Solucion a problemas de configuración de correos electrónicos y cuentas - Accede a la configuración de cuentas en tu dispositivo y sigue las instrucciones para agregar una cuenta de correo electrónico.

    Esta es la informacion general para comprar un plan de telefonía:
    Hay disponibles cuatro planes.
    Plan Básico:
    - Precio: $25 al mes.
    - Datos: 2 GB de datos de alta velocidad.
    - Llamadas y mensajes ilimitados dentro de la red.
    - 500 minutos de llamadas a otras redes.
    - SMS ilimitados.
    - Sin contrato a largo plazo.

    Plan Familiar:
    - Precio: $60 al mes.
    - Datos: 10 GB de datos compartidos de alta velocidad.
    - Llamadas y mensajes ilimitados en todas las redes para un máximo de 4 líneas.
    - Comparte tus datos con otros miembros de la familia.
    - Opción de agregar líneas adicionales a $15 por línea.
    - Sin contrato a largo plazo.

    Plan Ilimitado:
    - Precio: $50 al mes.
    - Datos: Datos ilimitados de alta velocidad.
    - Llamadas y mensajes ilimitados en todas las redes.
    - Límite de velocidad reducida después de 25 GB de datos.
    - Incluye acceso gratuito a servicios de transmisión de música.
    - Opción de agregar una línea adicional por $30 al mes.

    Plan Internacional:
    - Precio: $70 al mes.
    - Datos: 6 GB de datos de alta velocidad.
    - Llamadas y mensajes ilimitados en todas las redes nacionales.
    - Llamadas internacionales ilimitadas a más de 50 países.
    - Roaming internacional incluido en ciertos destinos.
    - Sin contrato a largo plazo.

    Nota. La disponibilidad de estos planes y sus características variará según su ubicación geográfica. Los precios estan en dólares americanos.

    Esta es la informacion general para ventas de teléfonos inteligentes:

    iPhone 15 Pro. Es el mejor teléfono inteligente disponible en el mercado en términos de rendimiento, cámara y pantalla.
    Cuenta con el nuevo procesador A16 Bionic, que ofrece un rendimiento líder en el mercado,
    una cámara triple con un nuevo sensor principal de 48 megapíxeles y una pantalla OLED de 6,7 pulgadas
    con una frecuencia de actualización de 120 Hz. Precio 1292 dólares.

    Samsung Galaxy S23 Ultra. Es un teléfono inteligente de gama alta que ofrece un rendimiento, una cámara y una pantalla excepcionales.
    Cuenta con el nuevo procesador Snapdragon 8 Gen 2, una cámara cuádruple con un nuevo sensor principal de 200 megapíxeles y una pantalla
    AMOLED de 6,8 pulgadas con una frecuencia de actualización de 120 Hz. Precio 1309 dólares.

    Google Pixel 7 Pro. Ofrece una excelente experiencia de cámara y un diseño elegante. Cuenta con el nuevo procesador Tensor 2, una
    cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla OLED de 6,7 pulgadas con una frecuencia de actualización de 120 Hz. Precio 988 dólares.

    OPPO Find X5 Pro. Ofrece una excelente cámara y un diseño premium. Cuenta con el nuevo procesador Snapdragon 8 Gen 2, una
    cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla AMOLED de 6,7 pulgadas con una frecuencia de actualización de 120 Hz. Precio 1278 dólares.

    Xiaomi 13 Pro. Ofrece un excelente rendimiento y una cámara de alta calidad. Cuenta con el nuevo procesador Snapdragon 8 Gen 2, una
    cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla AMOLED de 6,7 pulgadas con una frecuencia de actualización de 120 Hz. Precio 1599 dólares.

    OnePlus 11. Ofrece un excelente rendimiento y una relación calidad-precio. Cuenta con el procesador Snapdragon 8 Gen 2, una
    cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla AMOLED de 6,7 pulgadas con una frecuencia de actualización de 120 Hz. Precio 928 dólares.

    Vivo X90 Pro. Ofrece un excelente rendimiento y una cámara de alta calidad. Cuenta con el nuevo procesador Snapdragon 8 Gen 2, una
    cámara cuádruple con un nuevo sensor principal de 50 megapíxeles y una pantalla AMOLED de 6,7 pulgadas con una frecuencia de actualización de 120 Hz. Precio 1278 dólares.

    Motorola Edge 40 Pro. Ofrece un excelente rendimiento y una pantalla de alta calidad. Cuenta con el procesador Snapdragon 8 Gen 2, una
    cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla OLED de 6,7 pulgadas con una frecuencia de actualización de 120 Hz. Precio 988 dólares.

    Samsung Galaxy Z Fold 5. Ofrece una excelente experiencia de visualización y productividad. Cuenta con el nuevo procesador
    Snapdragon 8 Gen 2, una cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla AMOLED de 7,6 pulgadas con una frecuencia de actualización de 120 Hz. Precio 1699 dólares.

    ASUS ROG Phone 7. Ofrece un rendimiento y una experiencia de juego excepcionales. Cuenta con el nuevo procesador Snapdragon 8 Gen 2, una
    cámara triple con un nuevo sensor principal de 50 megapíxeles y una pantalla AMOLED de 6,78 pulgadas con una frecuencia de actualización de 165 Hz. Precio 1118 dólares.

    Venta sujeta a disponibilidad en inventario. Precios en dólares americanos.
    La tasa de cambio de dolares a pesos colombianos es de 4115 pesos colombianos por cada dolar americano.
    Si el cliente desea comprar, menciona esta pagina de internet:  https://stripe.com/pay-online/09097203-23235-2352
    Si accede a comprar solicita la direccion para entregar el telefono en su casa.
    `;


const chatHistory = []; // Store conversation history

// Construct messages by iterating over the history
const messages = chatHistory.map(([role, content]) => ({
    role,
    content,
}));

// Add latest user input
messages.push({ role: 'system', content: prompt });
let thread = null;

const retrieveAssistant = async () => {
    const assis = await openai.beta.assistants.retrieve("asst_dXj77l7eQZcdiHsqGbh0EPL6");
    return assis;
}

// Create a thread
const createThread = async () => {
    const thr = await openai.beta.threads.create();
    return thr;
}

const sendToAssistant = async (message) => {
  try {
    const assistant = await retrieveAssistant();
    // Pass in the user question into the existing thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
    // Use runs to wait for the assistant response and then retrieve it
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
    });
    let runStatus = await openai.beta.threads.runs.retrieve(
      thread.id,
      run.id
    );
    // Polling mechanism to see if runStatus is completed
    // This should be made more robust.
    
    while (runStatus.status !== "completed") {
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

    // Get the last assistant message from the messages array
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    // If an assistant message is found, console.log() it
    if (lastMessageForRun) {
      console.log(`${lastMessageForRun.content[0].text.value} \n`);
    }
    return lastMessageForRun.content[0].text.value;
  }
  catch (error) {
    console.error(error);
  }
}

const gptAPI = async (message) => {

    const userInput = message;

    try {
        // Add latest user input
        //messages.push({ role: 'system', content: prompt });
        messages.push({ role: 'user', content: userInput });

        // Call the API with user input & history
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
        });

        // Get completion text/content
        const completionText = completion.choices[0].message.content;

        if (userInput.toLowerCase() === 'exit') {
            console.log('Bot: ' + completionText);
            return;
        }

        //console.log('Bot: ' + completionText);

        // Update history with user input and assistant response
        //chatHistory.push(['user', userInput]);
        //chatHistory.push(['assistant', completionText]);
        messages.push({ role: 'assistant', content: completionText });
        //console.log(JSON.stringify(messages, null, 2));
        return completionText;
    } catch (error) {
        console.error((error));
    }
}

const gptAPIStream = async (message, ctxFn) => {
    const userInput = message;

    try {

        // Add latest user input
        messages.push({ role: 'user', content: userInput });

        // Inicializa el stream con la API
        const completionStream = await openai.chat.completions.create({
            model: 'gpt-4-1106-preview',
            messages: messages,
            stream: true, // Establece 'stream' en true para recibir mensajes en streaming
        });

        let fullCompletionText = ''; // Variable para acumular el contenido completo
        let chunkSize = 150; // Tamaño máximo de cada fragmento
        let currentChunk = ''; // Variable para almacenar el fragmento actual

        // Escucha los mensajes entrantes
        for await (const message of completionStream) {
            // Asumimos que el mensaje tiene la estructura correcta y contiene contenido
            if (message.choices && message.choices[0] && message.choices[0].delta.content) {
                fullCompletionText += message.choices[0].delta.content;

                // Mientras el texto completo exceda el tamaño del fragmento, sigue procesando
                while (fullCompletionText.length > chunkSize) {
                    // Encuentra el último punto dentro del límite del tamaño del fragmento
                    let lastPeriodPos = fullCompletionText.lastIndexOf('.', chunkSize);
                    // Si no hay un punto, establece el corte al final del fragmento
                    if (lastPeriodPos === -1 || lastPeriodPos === 0) {
                        lastPeriodPos = chunkSize;
                    } else {
                        // Incluye el punto en el fragmento
                        lastPeriodPos += 1;
                    }

                    // Extrae el fragmento
                    currentChunk = fullCompletionText.substring(0, lastPeriodPos);
                    // Procesa el fragmento actual (puedes imprimirlo o asignarlo a otra variable)
                    //console.log('Fragmento:', currentChunk);
                    console.log('Mensaje saliente : ', currentChunk)
                    console.log("🙉 texto a voz....");
                    const path = await ttsElevenLabs(currentChunk);
                    console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
                    //console.log("🙉 texto a imagen....");
                    //const urlPicture = await dalleAPI(currentChunk);
                    //console.log(`🙉 Fin texto a imagen....[PATH]:${urlPicture}`);
                    //await ctxFn.flowDynamic(urlPicture);
                    //await ctxFn.flowDynamic([{ body: " " , media : urlPicture}]);
                    await ctxFn.flowDynamic(currentChunk);
                    await ctxFn.flowDynamic([{ body: "escucha", media: path }]);
                    // Recorta 'fullCompletionText' para quitar el fragmento procesado
                    fullCompletionText = fullCompletionText.substring(lastPeriodPos);
                }
            }
        }

        // No olvides procesar el último fragmento si es menor de 150 caracteres
        if (fullCompletionText.length > 0) {
            //console.log('Último fragmento:', fullCompletionText);
            console.log('Mensaje saliente : ', fullCompletionText)
            console.log("🙉 texto a voz....");
            const path = await ttsElevenLabs(fullCompletionText);
            console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
            //console.log("🙉 texto a imagen....");
            //const urlPicture = await dalleAPI(fullCompletionText);
            //console.log(`🙉 Fin texto a imagen....[PATH]:${urlPicture}`);
            //await ctxFn.flowDynamic(urlPicture);
            //await ctxFn.flowDynamic([{ body: " " , media : urlPicture}]);
            await ctxFn.flowDynamic(fullCompletionText);
            await ctxFn.flowDynamic([{ body: "escucha", media: path }]);
        }

        // Actualiza el historial con la respuesta del asistente
        messages.push({ role: 'assistant', content: fullCompletionText });
        //console.log(JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error(error);
    }
}

const dalleAPI = async (promptIn)=> {
    try {
        const prompt = promptIn;

        // Generate image from prompt
        const response = await openai.createImage({
            prompt: prompt,
            n: 1,
            size: "1024x1024",
        });
        return response.data.data[0].url;
    }
    catch (error) {
        console.error(error);
    }
}

const ttsOpenAI = async (text) => {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
    });
    //console.log(speechFile);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    return speechFile;
}

const flowGPT = addKeyword(EVENTS.WELCOME).addAction(
    async (ctx, ctxFn) => {
        console.log('Mensaje entrante : ', ctx.body)
        //const data = await gptAPI(ctx.body);
        const data = await sendToAssistant(ctx.body);
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
        //const data = await gptAPI(fullSentence);
        const data = await sendToAssistant(fullSentence);
        console.log('Mensaje saliente : ', data)
        /*console.log("🙉 texto a voz....");
        const path = await ttsElevenLabs(data);
        console.log(`🙉 Fin texto a voz....[PATH]:${path}`);
        await ctxFn.flowDynamic([{ body: "escucha", media: path }]);*/
        await ctxFn.flowDynamic(data);
        console.log("🙉 Envio de mensajes completado....");
    }
);

const flowGPTStream = addKeyword(EVENTS.WELCOME).addAction(
    async (ctx, ctxFn) => {
        console.log('Mensaje entrante : ', ctx.body)
        await gptAPIStream(ctx.body, ctxFn);
        console.log("🙉 Envio de mensajes en streaming completado....");
    }
);

const flowVoiceNoteStream = addKeyword(EVENTS.VOICE_NOTE).addAction(
    async (ctx, ctxFn) => {
        //await ctxFn.flowDynamic("Dame un momento para escucharte...🙉");
        console.log("🤖 voz a texto....");
        const text = await handlerAI(ctx);
        console.log(`🤖 Fin voz a texto....[TEXT]: ${text}`);
        const currentState = ctxFn.state.getMyState();
        const fullSentence = `${currentState?.answer ?? ""}. ${text}`;
        await gptAPIStream(fullSentence, ctxFn);
        console.log("🙉 Envio de mensajes en streaming completado....");
    }
);

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

async function askQuestion(question) {
    return new Promise((resolve, reject) => {
        resolve(question);
    });
  }

const main = async () => {
    thread = await createThread();
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowVoiceNote, flowGPT])
    const adapterFlowStream = createFlow([flowVoiceNoteStream, flowGPTStream])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
    /*try {
        const assistant = await openai.beta.assistants.retrieve("asst_dXj77l7eQZcdiHsqGbh0EPL6");
    
        // Log the first greeting
        console.log(
          "\nHello there, I'm your personal math tutor. Ask some complicated questions.\n"
        );
    
        // Create a thread
        const thread = await openai.beta.threads.create();
    
        // Use keepAsking as state for keep asking questions
        let keepAsking = true;
        while (keepAsking) {
          const userQuestion = await askQuestion("\nWhat is your question? ");
    
          // Pass in the user question into the existing thread
          await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: userQuestion,
          });
    
          // Use runs to wait for the assistant response and then retrieve it
          const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
          });
    
          let runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
          );
    
          // Polling mechanism to see if runStatus is completed
          // This should be made more robust.
          while (runStatus.status !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
          }
    
          // Get the last assistant message from the messages array
          const messages = await openai.beta.threads.messages.list(thread.id);
    
          // Find the last message for the current run
          const lastMessageForRun = messages.data
            .filter(
              (message) => message.run_id === run.id && message.role === "assistant"
            )
            .pop();
    
          // If an assistant message is found, console.log() it
          if (lastMessageForRun) {
            console.log(`${lastMessageForRun.content[0].text.value} \n`);
          }
    
          // Then ask if the user wants to ask another question and update keepAsking state
          const continueAsking = await askQuestion(
            "Do you want to ask another question? (yes/no) "
          );
          keepAsking = continueAsking.toLowerCase() === "yes";
    
          // If the keepAsking state is falsy show an ending message
          if (!keepAsking) {
            console.log("Alrighty then, I hope you learned something!\n");
          }
        }
    
        // close the readline
        readline.close();
      } catch (error) {
        console.error(error);
      }*/
}
main()