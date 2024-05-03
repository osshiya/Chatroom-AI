const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// Endpoint to get environment variables
app.post("/api/processInput", (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (
      !apiKey ||
      req.headers.authorization !== "f4v3KdlBQCfvMWPYCOOsBPl6rOLgzsaU"
    ) {
      res.status(403).json({ error: "Unauthorized" });
    } else {
      res.json({ apiKey });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while retrieving data." });
  }
});

module.exports = app;
