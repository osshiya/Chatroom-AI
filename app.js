const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
const server = http.createServer(app);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
