import openai from "../config/open-ai.js";
import fs from 'fs';
import path from 'path';

const speechFile = path.resolve("./tmp/speech.mp3");

const retrieveAssistant = async () => {
    const assis = await openai.beta.assistants.retrieve(process.env.ASSISTANT_ID);
    return assis;
}

// Create a thread
const initAssistant = async () => {
    const thr = await openai.beta.threads.create();
    return thr;
}

const sendToAssistant = async (thread: any, assistant: any, message: string, nameClient: string | null) => {
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

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(
      run.id,
      { thread_id: thread.id }
    );

    // Poll for the run to complete
    while (runStatus.status !== "completed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(
        run.id,
        { thread_id: thread.id }
      );
    }

    // Get the messages for the thread
    const messages = await openai.beta.threads.messages.list(thread.id);

    // Find the last message for the current run
    const lastMessageForRun = messages.data
      .filter(
        (message) => message.run_id === run.id && message.role === "assistant"
      )
      .pop();

    // If an assistant message is found, return its content
    if (lastMessageForRun && lastMessageForRun.content && lastMessageForRun.content.length > 0) {
      // Check if the content has a text property with value
      const content = lastMessageForRun.content[0];
      if ('text' in content && content.text && typeof content.text === 'object' && 'value' in content.text) {
        return content.text.value;
      }
      // Fallback for other content types
      return JSON.stringify(content);
    }

    return "No response found.";
  } catch (error) {
    console.error("Error in sendToAssistant:", error);
    return "Error processing your request.";
  }
};

const ttsOpenAI = async (text: string) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    return buffer;
  } catch (error) {
    console.error("Error in ttsOpenAI:", error);
    throw error;
  }
};

const dalleAPI = async (prompt: string) => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    return response.data[0].url;
  } catch (error) {
    console.error("Error in dalleAPI:", error);
    throw error;
  }
};

export { initAssistant, retrieveAssistant, sendToAssistant, ttsOpenAI, dalleAPI };