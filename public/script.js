import { toMarked } from "./marked.js";

// Handle UI
export function appendMessage(sender, message) {
  var chatContainer = document.getElementById("chat-interface");
  if (sender === "user") {
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add("receiver-message");
    messageDiv.textContent = message;
  } else {
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("sender-container");

    var messageInfo = document.createElement("p");
    messageInfo.classList.add("message-info");
    messageInfo.classList.add("sender-name");
    messageInfo.textContent = message.name;

    var messageSenderDiv = document.createElement("div");
    messageSenderDiv.classList.add("message");
    messageSenderDiv.classList.add("sender-message");
    messageSenderDiv.textContent = message.response;

    messageDiv.appendChild(messageInfo);
    messageDiv.appendChild(messageSenderDiv);
  }
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

export function appendSystemMessage(message) {
  var result = "";

  var chatContainer = document.getElementById("chat-interface");
  var messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add("system-message");

  for (var score of message.r_score) {
    result += score.name + ": " + score.comment + " (" + score.score + ")<br>";
  }
  result += toMarked(message.r_comment) + "<br>";
  result += toMarked(message.r_recommendation);

  messageDiv.innerHTML = result;

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
