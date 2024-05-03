{
  /* <script src="/socket.io/socket.io.js"></script>
<script type="module" src="socket.js"></script> */
}

import { io } from "socket.io-client";

const socket = io();

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.textContent = msg;

  document.getElementById("messages").appendChild(li);
});

socket.on("model", (msg) => {
  const h3 = document.createElement("h3");
  h3.textContent = msg.name;
  const li = document.createElement("li");
  li.textContent = msg.response;
  document.getElementById("messages").appendChild(h3);
  document.getElementById("messages").appendChild(li);
});

socket.on("user", (msg) => {
  const h1 = document.createElement("h1");
  h1.textContent = "user";
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("messages").appendChild(h1);
  document.getElementById("messages").appendChild(li);
});
