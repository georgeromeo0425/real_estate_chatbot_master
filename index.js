const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatbtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");

let chatHistory = "";
let userMessage = null; // Variable to store user's message
const inputInitHeight = chatInput.scrollHeight;

const API_KEY = "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"; // Paste API key her
const ASSISTANT_ID = "asst_yoLVpKKIOlDUgPmJDOHN88eh";

// const EMAIL_ACCOUNT_ID = "UI8rrsfLgfkH9AglL";
// const EMAIL_SERVICE_ID = "service_0co0bf4";
// const EMAIL_TEMPLATE_ID = "template_9tejjjk";
// const EMAIL_SENDER = "Real Estate";
// //const EMAIL_RECEIVER = "devstar1028@gmail.com";
// const EMAIL_RECEIVER = "expert@homejab.com";

let THREAD_ID = "thread_ArAb2FPaXwPkHcwlUI2fiPfJ";

const convertString = (string) => {
  // Find all URLs in the string.
  //  const urlRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  const urlRegex = /(?:\(|\[)?(https?:\/\/[^\s\)\]]+)(?:\)|\])?/gi;
  const findStrs = string.match(urlRegex);

  if (findStrs) {
    for (let str of findStrs) {
      string = string.replace(
        str,
        "<a target='_blank' href='" + str + "'>" + str + "</a>"
      );
    }
  }
  return string;
};

const CREATE_THREAD_URL = "https://api.openai.com/v1/threads";
// Creates a thread
const createThread = async () => {
  console.log("Creating thread...");
  const response = await fetch(CREATE_THREAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "OpenAI-Beta": "assistants=v1"
    }
  });
  if (!response.ok) {
    console.error("Failed to create thread");
    throw new Error("Failed to create thread");
  }
  console.log("Thread created successfully");
  return await response.json();
};

//Create Chat Thread

const createChatThread = async () => {
  console.log("Creating chat thread...");
  const threadData = await createThread();
  console.log("Chat thread created successfully. Thread ID:", threadData.id);
  return threadData.id;
};

function getURLParams() {
  // Get the full URL
  var url = window.location.href;

  // Use URLSearchParams to extract parameters
  var params = new URLSearchParams(url);

  // Access individual parameters
  var message = params.get("message");

  // Do something with the parameters

  if (message != "" && message != null) {
    userMessage = message;
    // Append the user's message to the chatbox
    const outgoingChatli = createChatLi(message, "outgoing");
    chatbox.appendChild(outgoingChatli);

    chatInput.disabled = true;

    setTimeout(() => {
      // Display "Typing..." message while waiting for the response
      const incomingChatli = createChatLi("Typing...", "incoming");
      chatbox.appendChild(incomingChatli);
      generateResponse(incomingChatli);
    }, 600);
  }
}

const init = async () => {
  // emailjs.init(EMAIL_ACCOUNT_ID);
  THREAD_ID = await createChatThread();
  getURLParams();
};

init();

const createChatLi = (message, className) => {
  //Create a chat <li> element with passed message and class name
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  let chatContent =
    className === "outgoing"
      ? `<img src="./assets/avatar_me.png" width="64" height="55"><div class='message-content'></div>`
      : `<img src="./assets/avatar_bot.png" width="64" height="55"><div class='message-content'></div>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector(".message-content").textContent = message;
  return chatLi; // return chat <li> element
};

const submitUserMessage = async (input, threadId) => {
  console.log("Submitting user message...");
  const message = { input, threadId };
  await addMessage(message);
  console.log("User message submitted successfully.");
};

// Runs an assistant
const runAssistant = async (assistantId, threadId) => {
  console.log("Running assistant...");
  const CREATE_RUN = `https://api.openai.com/v1/threads/${threadId}/runs`;
  const reqData = {
    assistant_id: assistantId
  };
  const response = await fetch(CREATE_RUN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "OpenAI-Beta": "assistants=v1"
    },
    body: JSON.stringify(reqData)
  });
  if (!response.ok) {
    console.error("Failed to run assistant");
    throw new Error("Failed to run assistant");
  }
  const data = await response.json();
  console.log("Assistant run successfully. Run ID:", data.id);
  return data;
};

const runChatAssistant = async (assistantId, threadId) => {
  console.log("Running chat assistant...");

  const response = await runAssistant(assistantId, threadId);
  const runId = response.id;

  console.log("Chat assistant run successfully. Run ID:", runId);
  return runId;
};

// Lists messages
const listMessages = async (threadId, runId) => {
  console.log("Listing messages...");
  const LIST_MESSAGES = `https://api.openai.com/v1/threads/${threadId}/messages`;
  const response = await fetch(LIST_MESSAGES, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "OpenAI-Beta": "assistants=v1"
    }
  });
  if (!response.ok) {
    console.error(
      `Error fetching messages: ${response.status} ${response.statusText}`
    );
    throw new Error(
      `Failed to list messages: ${response.status} ${response.statusText}`
    );
  }
  const jsonResponse = await response.json();
  console.log("Messages listed successfully");
  return jsonResponse;
};

// Adds a message
const addMessage = async (data) => {
  console.log("Adding message...");
  const { input, threadId } = data;
  const CREATE_MESSAGE = `https://api.openai.com/v1/threads/${threadId}/messages`;
  const reqData = {
    role: "user",
    content: input
  };

  const response = await fetch(CREATE_MESSAGE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "OpenAI-Beta": "assistants=v1"
    },
    body: JSON.stringify(reqData)
  });
  if (!response.ok) {
    console.error("Failed to add message");
    throw new Error("Failed to add message");
  }
  console.log("Message added successfully");
  return await response.json();
};

// Checks the status of a run
const checkRunStatus = async (threadId, runId) => {
  console.log("Checking run status...");
  const RETRIEVE_RUN = `
  https://api.openai.com/v1/threads/${threadId}/runs/${runId}`;
  const response = await fetch(RETRIEVE_RUN, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "OpenAI-Beta": "assistants=v1"
    }
  });
  if (!response.ok) {
    console.error("Failed to check run status");
    throw new Error("Failed to check run status");
  }
  console.log("Run status checked successfully");
  return await response.json();
};

const fetchAssistantResponse = async (runId, threadId) => {
  console.log(
    "fetchAssistantResponse called with runId:",
    runId,
    "and threadId:",
    threadId
  );
  let status;
  do {
    const statusData = await checkRunStatus(threadId, runId);
    status = statusData.status;
    console.log("Waiting...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Polling delay
  } while (status !== "completed");
  console.log("Assistant response fetched successfully.");
  const response = await listMessages(threadId, runId);
  return response.data[0].content[0].text.value;
};

const generateResponse = async (incomingChatli) => {
  // Generate a random response from the bot

  await submitUserMessage(userMessage, THREAD_ID);
  console.log("User message submitted. Running assistant...");

  const runId = await runChatAssistant(ASSISTANT_ID, THREAD_ID);
  console.log("Assistant run successfully. Fetching assistant response...");

  const response = await fetchAssistantResponse(runId, THREAD_ID);
  console.log("Assistant response fetched. Adding to chat state");
  console.log(response);

  const messageElement = incomingChatli.querySelector(".message-content");
  const string = convertString(response);
  messageElement.innerHTML = string;

  chatHistory += "Answer: ";
  chatHistory += response;
  chatHistory += "\n";

  chatInput.disabled = false;
  chatInput.focus();
  chatbox.scrollTo(0, chatbox.scrollHeight);
};

const handleChat = async () => {
  userMessage = chatInput.value.trim(); // Get user entered message and remove extra whitespace
  if (!userMessage) return;

  // Clear the input textarea and set its height to default
  chatInput.value = "";
  chatInput.style.height = `${inputInitHeight}px`;

  // Append the user's message to the chatbox
  const outgoingChatli = createChatLi(userMessage, "outgoing");
  chatbox.appendChild(outgoingChatli);
  chatbox.scrollTo(0, chatbox.scrollHeight);

  chatHistory += "You: ";
  chatHistory += userMessage;
  chatHistory += "\n";
  chatInput.disabled = true;

  setTimeout(() => {
    // Display "Typing..." message while waiting for the response
    const incomingChatli = createChatLi("Typing...", "incoming");
    chatbox.appendChild(incomingChatli);
    generateResponse(incomingChatli);
  }, 600);
};

chatInput.addEventListener("input", () => {
  // Adjust the height of the input textarea based on its content
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If Enter key is pressed without the Shift key and the window
  // width is greater than 800px, handle the chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatbtn.addEventListener("click", handleChat);

// window.addEventListener("beforeunload", (event) => {
//   event.preventDefault();

//   const templateParams = {
//     to_name: EMAIL_RECEIVER,
//     from_name: EMAIL_SENDER,
//     message: chatHistory
//   };

//   emailjs.send(EMAIL_SERVICE_ID, EMAIL_TEMPLATE_ID, templateParams).then(
//     function (response) {
//       console.log("We sent you logs to your email address");
//     },
//     function (error) {
//       console.log("Sorry, we couldn't send logs to your address");
//     }
//   );

//   event.returnValue = `Are you sure you want to leave?`;
// });
