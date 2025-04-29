require("dotenv").config(); //* Loads .env first
require("dotenv").config({ path: ".env.anythingllm" }); //* Then loads .env.anythingllm, overriding any duplicates
const express = require("express");
const path = require("path");
const dynamoService = require("./database/dynamoService");
const chatService = require("./services/chatService");

const app = express();
app.use(express.json());
app.use(express.static("public"));

//* Debug environment variables
console.log(`[${new Date().toISOString()}] Environment variables:`, {
  MODEL_NAME: process.env.MODEL_NAME,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  LOCAL_AI_BASE_URL: process.env.LOCAL_AI_BASE_URL,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "***" : undefined,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "***" : undefined,
});

//* Log model information
console.log(
  `[${new Date().toISOString()}] Using model: ${
    process.env.MODEL_NAME || "neural-chat"
  }`
);

//* Initialize DynamoDB
dynamoService
  .initializeDatabase()
  .then(() => {
    console.log("DynamoDB initialized successfully");
  })
  .catch((error) => {
    console.error("Error initializing DynamoDB:", error);
    process.exit(1);
  });

//* API Routes
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log(`[${new Date().toISOString()}] Received message: ${message}`);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await chatService.processQuery(message);
    res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//* Product search endpoint
app.get("/api/products", async (req, res) => {
  try {
    const filters = req.query;
    const products = await dynamoService.searchProducts(filters);
    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//* Get product by ID endpoint
app.get("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await dynamoService.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//* Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Server running on port ${PORT}`);
});
