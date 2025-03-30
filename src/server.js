require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log(`[${new Date().toISOString()}] Received message:`, message);

    const apiUrl = "http://localhost:11434/api/generate";
    console.log(
      `[${new Date().toISOString()}] Sending request to Ollama at:`,
      apiUrl
    );

    // Call Ollama API with user message
    const ollamaResponse = await axios.post(
      apiUrl,
      {
        model: "llama2",
        prompt: message,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `[${new Date().toISOString()}] Received response from Ollama:`,
      JSON.stringify(ollamaResponse.data, null, 2)
    );

    res.json({
      response: ollamaResponse.data.response,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in chat endpoint:`,
      error.message
    );
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      console.error("Error response headers:", error.response.headers);
    }
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${port}`);
});
