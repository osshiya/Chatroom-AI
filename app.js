const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(
  "/socket.io",
  express.static(__dirname + "/node_modules/socket.io/client-dist")
);
const server = http.createServer(app);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
