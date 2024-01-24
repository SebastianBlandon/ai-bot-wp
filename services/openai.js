const openai = require("../config/open-ai");

const fs = require('fs');
const path = require('path');
const speechFile = path.resolve("./tmp/speech.mp3");

const retrieveAssistant = async () => {
    const assis = await openai.beta.assistants.retrieve("asst_cH8T6viA9htMmPslA1UV0Oq6");
    return assis;
}

// Create a thread
const initAssistant = async () => {
    const thr = await openai.beta.threads.create();
    return thr;
}

const sendToAssistant = async (thread, assistant, message, nameClient) => {
  try {
    // Pass in the user question into the existing thread
    if (nameClient != null) {
        message += `Hola Soy ${nameClient}`;
    }
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
    /*
    if (lastMessageForRun) {
      console.log(`${lastMessageForRun.content[0].text.value} \n`);
    }*/
    return lastMessageForRun.content[0].text.value;
  }
  catch (error) {
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

module.exports = { initAssistant, retrieveAssistant, sendToAssistant, ttsOpenAI, dalleAPI };
