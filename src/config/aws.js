const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

// Configure AWS
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Table name
const TABLE_NAME = "BicycleShopProducts";

module.exports = {
  dynamoDB: client,
  TABLE_NAME,
};
