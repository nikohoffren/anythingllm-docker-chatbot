require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const chatService = require("./services/chatService");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve index.html for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log(`[${new Date().toISOString()}] Received message:`, message);

    // Process the message using our chat service
    const response = await chatService.processMessage(message);

    // Log the response in the terminal
    console.log(
      `[${new Date().toISOString()}] Response:`,
      JSON.stringify({ response }, null, 2)
    );

    res.json({ response });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error in chat endpoint:`,
      error.message
    );
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${port}`);
});
