const axios = require("axios");
const database = require("../database/database");

class ChatService {
  async processMessage(message) {
    // Get all products from the database
    const allProducts = database.searchProducts({});
    console.log(
      `[${new Date().toISOString()}] Retrieved ${
        allProducts.length
      } products from database`
    );
    console.log(
      `[${new Date().toISOString()}] Sample products:`,
      JSON.stringify(allProducts.slice(0, 5), null, 2)
    );

    // Create a context with all product information
    const productContext = this.createProductContext(allProducts);

    // Create a prompt that includes the product information and the user's query
    const prompt = this.createPrompt(message, productContext);

    // Log the prompt being sent to Ollama
    console.log(
      `[${new Date().toISOString()}] Sending request to Ollama with prompt:`,
      prompt
    );

    // Call Ollama with the prompt
    const response = await this.callOllama(prompt);

    return response;
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

    let context = "Available products in our store:\n\n";

    // List all product names first
    const uniqueProductNames = [...new Set(products.map((p) => p.name))];
    context += "Product Names: " + uniqueProductNames.join(", ") + "\n\n";

    // Then list products by category
    for (const [category, categoryProducts] of Object.entries(
      productsByCategory
    )) {
      context += `${category}:\n`;
      const uniqueModels = [...new Set(categoryProducts.map((p) => p.name))];

      for (const model of uniqueModels) {
        const modelProducts = categoryProducts.filter((p) => p.name === model);
        const colors = [...new Set(modelProducts.map((p) => p.color))];
        const sizes = [...new Set(modelProducts.map((p) => p.size))];

        context += `- ${model}\n`;
        context += `  Colors: ${colors.join(", ")}\n`;
        context += `  Sizes: ${sizes.join(", ")}\n`;
        context += `  Price Range: $${Math.min(
          ...modelProducts.map((p) => p.price)
        )} - $${Math.max(...modelProducts.map((p) => p.price))}\n`;
        context += `  Material: ${modelProducts[0].material}\n`;
        context += `  Description: ${modelProducts[0].description}\n`;
        context += `  Total Stock: ${modelProducts.reduce(
          (sum, p) => sum + p.stock_quantity,
          0
        )}\n\n`;
      }
    }

    return context;
  }

  createPrompt(message, productContext) {
    return `You are a bicycle store inventory assistant for employees. You have access to the following product information:

${productContext}

Employee query: "${message}"

IMPORTANT:
1. Check the exact product names listed above before responding
2. If a product name is mentioned in the query, verify it exists in the list above
3. Provide a direct and concise response based on the available products
4. Focus on factual information and inventory details
5. If the query is about specific products, list only the relevant products with their key details
6. If no products match the criteria, state this clearly and suggest the closest alternatives if applicable
7. Keep responses brief and to the point`;
  }

  async callOllama(prompt) {
    try {
      const apiUrl = "http://localhost:11434/api/generate";
      console.log(
        `[${new Date().toISOString()}] Sending request to Ollama at:`,
        apiUrl
      );

      const response = await axios.post(
        apiUrl,
        {
          model: "llama2",
          prompt: prompt,
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
        JSON.stringify(response.data, null, 2)
      );

      return response.data.response;
    } catch (error) {
      console.error("Error calling Ollama:", error);
      return "I apologize, but I'm having trouble processing your request at the moment. Please try again later.";
    }
  }
}

module.exports = new ChatService();
