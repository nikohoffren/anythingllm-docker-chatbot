const axios = require("axios");
const dynamoService = require("../database/dynamoService");

class ChatService {
  async processQuery(message) {
    try {
      console.log(`[${new Date().toISOString()}] Processing query: ${message}`);

      // Get all products from DynamoDB
      const products = await dynamoService.searchProducts({});
      console.log(
        `[${new Date().toISOString()}] Retrieved ${
          products.length
        } products from DynamoDB:`,
        products.map((p) => ({ name: p.name, category: p.category }))
      );

      // Create a context with all product information
      const productContext = this.createProductContext(products);

      // Debug log the product context
      console.log(
        `[${new Date().toISOString()}] Product context:`,
        productContext
      );

      // Create a prompt that includes the product information and the user's query
      const prompt = this.createPrompt(message, productContext);

      // Call Ollama with the prompt
      const response = await this.callOllama(prompt);
      return response;
    } catch (error) {
      console.error("Error processing query:", error);
      return "I apologize, but I'm having trouble processing your request at the moment. Please try again later.";
    }
  }

  createProductContext(products) {
    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    let context = "=== INVENTORY DATA ===\n\n";

    // For each category, list products in a clear, structured format
    for (const [category, categoryProducts] of Object.entries(
      productsByCategory
    )) {
      context += `CATEGORY: ${category}\n`;
      context += "----------------------------------------\n";

      // Group by product name within category
      const productsByName = categoryProducts.reduce((acc, product) => {
        if (!acc[product.name]) {
          acc[product.name] = [];
        }
        acc[product.name].push(product);
        return acc;
      }, {});

      for (const [name, variants] of Object.entries(productsByName)) {
        context += `\nPRODUCT: ${name}\n`;
        context += `DESCRIPTION: ${variants[0].description}\n`;
        context += `MATERIAL: ${variants[0].material}\n`;
        context += "VARIANTS:\n";

        variants.forEach((variant) => {
          context += `- SIZE: ${variant.size}\n`;
          context += `  COLOR: ${variant.color}\n`;
          context += `  PRICE: $${variant.price}\n`;
          context += `  STOCK: ${variant.stock_quantity} units\n`;
        });
        context += "\n";
      }
      context += "----------------------------------------\n\n";
    }

    return context;
  }

  createPrompt(message, productContext) {
    return `You are a helpful bicycle store inventory assistant. You have access to the following product information:

${productContext}

Customer query: "${message}"

Instructions:
- READ THE EXACT DATA PROVIDED ABOVE - do not make assumptions or invent information
- For product questions, look at the EXACT product name and category
- For color options, list ONLY the colors shown in the VARIANTS section
- For prices, use the EXACT price shown in the VARIANTS section
- For stock numbers, use the EXACT numbers shown in the VARIANTS section

Example for Compact Fold:
- Colors: Black, Silver, Red (exactly as listed)
- Price: $299.99 (same for all variants)
- Stock: 3 (Black) + 3 (Silver) + 2 (Red) = 8 total units

- Only provide information that exists in the inventory data above
- Be concise and direct in your response
- If the requested information is not in the inventory, simply say "I don't have that information in our inventory."
- Double check your answer against the provided data before responding
`;
  }

  async callOllama(prompt) {
    try {
      const apiUrl = "http://localhost:11434/api/generate";
      const modelName = process.env.MODEL_NAME || "llama2";

      // Debug environment variables
      console.log(`[${new Date().toISOString()}] Environment variables:`, {
        MODEL_NAME: process.env.MODEL_NAME,
        allEnv: process.env,
      });

      console.log(
        `[${new Date().toISOString()}] Sending request to Ollama ${modelName} at:`,
        apiUrl
      );

      const response = await axios.post(
        apiUrl,
        {
          model: modelName,
          prompt: prompt,
          stream: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Enhanced debug logging
      console.log(`[${new Date().toISOString()}] Ollama response:`, {
        model: response.data.model,
        fullResponse: response.data,
        responseKeys: Object.keys(response.data),
      });

      // Clean up the response
      let cleanedResponse = response.data.response;
      cleanedResponse = cleanedResponse.replace(/^(Employee:|You:)\s*/i, "");
      cleanedResponse = cleanedResponse.trim();

      return cleanedResponse;
    } catch (error) {
      console.error("Error calling Ollama:", error);
      return "I apologize, but I'm having trouble processing your request at the moment. Please try again later.";
    }
  }
}

module.exports = new ChatService();
