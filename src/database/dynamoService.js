const { dynamoDB, TABLE_NAME } = require("../config/aws");
const {
  DescribeTableCommand,
  CreateTableCommand,
  BatchWriteItemCommand,
  ScanCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

class DynamoService {
  constructor() {
    console.log(
      `[${new Date().toISOString()}] Initializing DynamoDB service...`
    );
    console.log(`[${new Date().toISOString()}] Using table: ${TABLE_NAME}`);
    //* Log AWS region to verify configuration
    console.log(
      `[${new Date().toISOString()}] AWS Region: ${process.env.AWS_REGION}`
    );
  }

  async initializeDatabase() {
    try {
      console.log(`[${new Date().toISOString()}] Checking DynamoDB table...`);

      //? Check if the table exists
      const describeParams = {
        TableName: TABLE_NAME,
      };

      try {
        await dynamoDB.send(new DescribeTableCommand(describeParams));
        console.log(`[${new Date().toISOString()}] Table ${TABLE_NAME} exists`);
      } catch (error) {
        if (error.name === "ResourceNotFoundException") {
          console.log(
            `[${new Date().toISOString()}] Table ${TABLE_NAME} does not exist. Creating...`
          );

          const createParams = {
            TableName: TABLE_NAME,
            KeySchema: [
              { AttributeName: "id", KeyType: "HASH" }, //? Partition key
            ],
            AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          };

          await dynamoDB.send(new CreateTableCommand(createParams));
          console.log(
            `[${new Date().toISOString()}] Table ${TABLE_NAME} created successfully`
          );

          //* Wait for table to be active
          await this.waitForTableActive();
        } else {
          throw error;
        }
      }

      //* Insert sample data
      await this.insertSampleData();
      console.log(
        `[${new Date().toISOString()}] Database initialization completed`
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Error initializing database:`,
        {
          message: error.message,
          code: error.code,
          name: error.name,
          stack: error.stack,
        }
      );
      throw error;
    }
  }

  async waitForTableActive() {
    const params = {
      TableName: TABLE_NAME,
    };

    while (true) {
      try {
        const result = await dynamoDB.send(new DescribeTableCommand(params));
        if (result.Table.TableStatus === "ACTIVE") {
          console.log(
            `[${new Date().toISOString()}] Table ${TABLE_NAME} is now active`
          );
          return;
        }
        console.log(
          `[${new Date().toISOString()}] Waiting for table to become active...`
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error checking table status:`,
          error
        );
        throw error;
      }
    }
  }

  async insertSampleData() {
    console.log(`[${new Date().toISOString()}] Inserting sample data...`);
    const sampleProducts = this.getSampleProducts();

    //* Batch write items to DynamoDB (max 25 items per batch)
    const batches = [];
    for (let i = 0; i < sampleProducts.length; i += 25) {
      batches.push(sampleProducts.slice(i, i + 25));
    }

    for (const batch of batches) {
      const params = {
        RequestItems: {
          [TABLE_NAME]: batch.map((item) => ({
            PutRequest: {
              Item: marshall({
                id: item.id,
                name: item.name,
                category: item.category,
                color: item.color,
                price: item.price,
                size: item.size,
                material: item.material,
                description: item.description,
                stock_quantity: item.stock_quantity,
                created_at: new Date().toISOString(),
              }),
            },
          })),
        },
      };

      try {
        await dynamoDB.send(new BatchWriteItemCommand(params));
        console.log(
          `[${new Date().toISOString()}] Successfully inserted batch of ${
            batch.length
          } items`
        );
      } catch (error) {
        console.error("Error inserting batch:", error);
        throw error;
      }
    }
  }

  getSampleProducts() {
    //* Generate sample products with unique IDs
    const products = [
      //* Mountain Bikes
      ...this.generateVariants("Mountain Pro X1", "Mountain Bike", {
        colors: ["Red", "Blue", "Black", "Green", "White"],
        sizes: {
          S: 479.99,
          M: 499.99,
          L: 519.99,
          XL: 539.99,
        },
        material: "Aluminum",
        description: "Professional mountain bike with advanced suspension",
        stockRange: [2, 5],
      }),

      // Electric Bikes
      ...this.generateVariants("EcoRide Pro", "Electric Bike", {
        colors: ["Silver", "Black", "Blue", "Red"],
        sizes: {
          S: 1299.99,
          M: 1299.99,
          L: 1299.99,
          XL: 1299.99,
        },
        material: "Carbon Fiber",
        description:
          "Premium electric bike with 50-mile range and smart features",
        stockRange: [1, 3],
      }),

      // Kids Bikes
      ...this.generateVariants("Junior Explorer", "Kids Bike", {
        colors: ["Pink", "Blue", "Green", "Red"],
        sizes: {
          "12-inch": 89.99,
          "16-inch": 99.99,
          "20-inch": 119.99,
        },
        material: "Steel",
        description: "Safe and fun bike for young riders with training wheels",
        stockRange: [3, 8],
      }),

      // Road Bikes
      ...this.generateVariants("Speedster Elite", "Road Bike", {
        colors: ["White", "Black", "Red", "Yellow"],
        sizes: {
          S: 799.99,
          M: 799.99,
          L: 799.99,
          XL: 799.99,
        },
        material: "Carbon Fiber",
        description: "Lightweight road bike for speed and performance",
        stockRange: [2, 4],
      }),

      // Hybrid Bikes
      ...this.generateVariants("Urban Commuter", "Hybrid Bike", {
        colors: ["Gray", "Black", "Blue", "Green"],
        sizes: {
          S: 349.99,
          M: 349.99,
          L: 349.99,
          XL: 349.99,
        },
        material: "Aluminum",
        description:
          "Versatile bike perfect for city commuting and light trails",
        stockRange: [3, 6],
      }),

      // Folding Bikes
      ...this.generateVariants("Compact Fold", "Folding Bike", {
        colors: ["Black", "Silver", "Red"],
        sizes: {
          "One Size": 299.99,
        },
        material: "Aluminum",
        description: "Space-saving folding bike for urban commuters",
        stockRange: [2, 4],
      }),

      // BMX Bikes
      ...this.generateVariants("Street Pro", "BMX Bike", {
        colors: ["Black", "Red", "Blue", "Green"],
        sizes: {
          "20-inch": 249.99,
          "24-inch": 279.99,
        },
        material: "Steel",
        description: "Durable BMX bike for tricks and street riding",
        stockRange: [2, 5],
      }),

      // Cargo Bikes
      ...this.generateVariants("Cargo Master", "Cargo Bike", {
        colors: ["Black", "Blue", "Green"],
        sizes: {
          "One Size": 899.99,
        },
        material: "Steel",
        description: "Heavy-duty cargo bike with large storage capacity",
        stockRange: [1, 3],
      }),
    ];

    //* Add unique IDs to each product
    return products.map((product, index) => ({
      ...product,
      id: `PROD-${index + 1}`,
    }));
  }

  generateVariants(name, category, options) {
    const variants = [];
    const { colors, sizes, material, description, stockRange } = options;

    for (const color of colors) {
      for (const [size, price] of Object.entries(sizes)) {
        variants.push({
          name,
          category,
          color,
          price,
          size,
          material,
          description,
          stock_quantity:
            Math.floor(Math.random() * (stockRange[1] - stockRange[0] + 1)) +
            stockRange[0],
        });
      }
    }

    return variants;
  }

  async searchProducts(filters = {}) {
    try {
      console.log(
        `[${new Date().toISOString()}] Searching products with filters:`,
        filters
      );

      const params = {
        TableName: TABLE_NAME,
      };

      //* Only add filter expressions if there are filters
      if (Object.keys(filters).length > 0) {
        params.ExpressionAttributeValues = {};
        params.ExpressionAttributeNames = {};

        let filterExpressions = [];

        if (filters.color) {
          filterExpressions.push("#color = :color");
          params.ExpressionAttributeValues[":color"] = { S: filters.color };
          params.ExpressionAttributeNames["#color"] = "color";
        }

        if (filters.minPrice) {
          filterExpressions.push("#price >= :minPrice");
          params.ExpressionAttributeValues[":minPrice"] = {
            N: String(filters.minPrice),
          };
          params.ExpressionAttributeNames["#price"] = "price";
        }

        if (filters.maxPrice) {
          filterExpressions.push("#price <= :maxPrice");
          params.ExpressionAttributeValues[":maxPrice"] = {
            N: String(filters.maxPrice),
          };
          params.ExpressionAttributeNames["#price"] = "price";
        }

        if (filters.category) {
          filterExpressions.push("#category = :category");
          params.ExpressionAttributeValues[":category"] = {
            S: filters.category,
          };
          params.ExpressionAttributeNames["#category"] = "category";
        }

        if (filters.size) {
          filterExpressions.push("#size = :size");
          params.ExpressionAttributeValues[":size"] = { S: filters.size };
          params.ExpressionAttributeNames["#size"] = "size";
        }

        if (filterExpressions.length > 0) {
          params.FilterExpression = filterExpressions.join(" AND ");
        }
      }

      console.log(
        `[${new Date().toISOString()}] DynamoDB scan params:`,
        JSON.stringify(params, null, 2)
      );

      const result = await dynamoDB.send(new ScanCommand(params));
      console.log(
        `[${new Date().toISOString()}] Raw DynamoDB response:`,
        JSON.stringify(result, null, 2)
      );

      const items = result.Items
        ? result.Items.map((item) => unmarshall(item))
        : [];
      console.log(`[${new Date().toISOString()}] Found ${items.length} items`);

      return items;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error searching products:`, {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        params: error.$metadata,
      });
      throw error;
    }
  }

  async getProductById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: marshall({
        id,
      }),
    };

    try {
      const result = await dynamoDB.send(new GetItemCommand(params));
      return result.Item ? unmarshall(result.Item) : null;
    } catch (error) {
      console.error("Error getting product:", error);
      throw error;
    }
  }
}

module.exports = new DynamoService();
