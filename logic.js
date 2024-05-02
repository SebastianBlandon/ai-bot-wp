const { initAssistant, retrieveAssistant, sendToAssistant, ttsOpenAI, dalleAPI } = require("./services/openai");

let assistant = null;
let thread = null;
const path = require('path');
let data = null;

const sessions = {};

function getSession(userIdentifier) {
  if (!sessions[userIdentifier]) {
      // Create a new session if it doesn't exist
      sessions[userIdentifier] = {
          thread: null,
          assistant: null,
          isLoggedIn: false,
          // ... any other session-specific data
      };
  }
  return sessions[userIdentifier];
}

const logicBot = async (celFromWite, message) => {
  const userIdentifier = celFromWite;
  const session = getSession(userIdentifier);

  if (!session.isLoggedIn) {
    assistant = await retrieveAssistant();
    thread = await initAssistant();
    data = await sendToAssistant(thread, assistant, message, null);
    session.isLoggedIn = true; // Update the isLoggedIn flag in the session
    session.thread = thread;
    session.assistant = assistant;
  }
  else {
    data = await sendToAssistant(session.thread, session.assistant, message, null);
  }
  return data;
}

module.exports = { logicBot };
