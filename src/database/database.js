const Database = require("better-sqlite3");
const path = require("path");

class DatabaseService {
  constructor() {
    const dbPath = path.join(__dirname, "../../storage/bicycle_shop.db");
    console.log(
      `[${new Date().toISOString()}] Initializing database at: ${dbPath}`
    );
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  initializeDatabase() {
    console.log(`[${new Date().toISOString()}] Creating products table...`);
    // Drop and recreate the table to ensure clean data
    this.db.exec(`
      DROP TABLE IF EXISTS products;
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        price REAL NOT NULL,
        size TEXT,
        material TEXT,
        description TEXT,
        stock_quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log(`[${new Date().toISOString()}] Inserting sample data...`);
    this.insertSampleData();

    // Verify the data was inserted
    const rowCount = this.db
      .prepare("SELECT COUNT(*) as count FROM products")
      .get().count;
    console.log(
      `[${new Date().toISOString()}] Total products inserted: ${rowCount}`
    );

    // Log some sample products to verify
    const sampleProducts = this.db
      .prepare("SELECT * FROM products LIMIT 5")
      .all();
    console.log(
      `[${new Date().toISOString()}] Sample products:`,
      JSON.stringify(sampleProducts, null, 2)
    );
  }

  insertSampleData() {
    const insert = this.db.prepare(`
      INSERT INTO products (name, category, color, price, size, material, description, stock_quantity)
      VALUES (@name, @category, @color, @price, @size, @material, @description, @stock_quantity)
    `);

    const sampleProducts = [
      // Mountain Bikes
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
      ...this.generateVariants("Trail Master", "Mountain Bike", {
        colors: ["Black", "Orange", "Blue"],
        sizes: {
          M: 699.99,
          L: 719.99,
          XL: 739.99,
        },
        material: "Carbon Fiber",
        description: "High-performance trail bike with full suspension",
        stockRange: [1, 3],
      }),
      ...this.generateVariants("Rock Climber", "Mountain Bike", {
        colors: ["Red", "Black", "Yellow"],
        sizes: {
          S: 379.99,
          M: 399.99,
          L: 419.99,
        },
        material: "Aluminum",
        description: "Entry-level mountain bike for beginners",
        stockRange: [3, 6],
      }),

      // Road Bikes
      ...this.generateVariants("Road Racer Elite", "Road Bike", {
        colors: ["Red", "White", "Black", "Blue"],
        sizes: {
          S: 879.99,
          M: 899.99,
          L: 919.99,
          XL: 939.99,
        },
        material: "Carbon Fiber",
        description: "High-performance road bike for racing",
        stockRange: [1, 3],
      }),
      ...this.generateVariants("Speedster Pro", "Road Bike", {
        colors: ["Black", "Red", "White"],
        sizes: {
          M: 1299.99,
          L: 1319.99,
          XL: 1339.99,
        },
        material: "Carbon Fiber",
        description: "Professional racing bike with aerodynamic design",
        stockRange: [1, 2],
      }),
      ...this.generateVariants("Urban Racer", "Road Bike", {
        colors: ["Blue", "Black", "Silver"],
        sizes: {
          S: 579.99,
          M: 599.99,
          L: 619.99,
        },
        material: "Aluminum",
        description: "Versatile road bike for city commuting",
        stockRange: [2, 4],
      }),

      // City Bikes
      ...this.generateVariants("City Cruiser", "City Bike", {
        colors: ["Black", "Red", "Blue", "Green", "White"],
        sizes: {
          S: 329.99,
          M: 349.99,
          L: 369.99,
        },
        material: "Steel",
        description: "Comfortable city bike for daily commuting",
        stockRange: [3, 7],
      }),
      ...this.generateVariants("Urban Explorer", "City Bike", {
        colors: ["Black", "Blue", "Gray"],
        sizes: {
          M: 429.99,
          L: 449.99,
        },
        material: "Aluminum",
        description: "Modern city bike with integrated lights",
        stockRange: [2, 5],
      }),
      ...this.generateVariants("Metro Classic", "City Bike", {
        colors: ["Black", "Red", "Blue"],
        sizes: {
          S: 279.99,
          M: 299.99,
          L: 319.99,
        },
        material: "Steel",
        description: "Classic city bike with comfortable ride",
        stockRange: [4, 8],
      }),

      // Hybrid Bikes
      ...this.generateVariants("Hybrid Pro", "Hybrid Bike", {
        colors: ["Black", "Blue", "Green"],
        sizes: {
          S: 529.99,
          M: 549.99,
          L: 569.99,
          XL: 589.99,
        },
        material: "Aluminum",
        description: "Versatile hybrid bike for various terrains",
        stockRange: [2, 4],
      }),
      ...this.generateVariants("Adventure Hybrid", "Hybrid Bike", {
        colors: ["Red", "Black", "Blue"],
        sizes: {
          M: 429.99,
          L: 449.99,
        },
        material: "Aluminum",
        description: "Adventure-ready hybrid bike",
        stockRange: [3, 5],
      }),

      // Electric Bikes
      ...this.generateVariants("E-City Pro", "Electric Bike", {
        colors: ["Black", "White", "Blue"],
        sizes: {
          M: 1479.99,
          L: 1499.99,
        },
        material: "Aluminum",
        description: "Premium electric city bike with 50km range",
        stockRange: [1, 3],
      }),
      ...this.generateVariants("E-Mountain", "Electric Bike", {
        colors: ["Black", "Red", "Blue"],
        sizes: {
          M: 1979.99,
          L: 1999.99,
          XL: 2019.99,
        },
        material: "Aluminum",
        description: "Electric mountain bike with 60km range",
        stockRange: [1, 2],
      }),
      ...this.generateVariants("E-Urban", "Electric Bike", {
        colors: ["Black", "White", "Gray"],
        sizes: {
          S: 1279.99,
          M: 1299.99,
          L: 1319.99,
        },
        material: "Aluminum",
        description: "Urban electric bike with 45km range",
        stockRange: [2, 4],
      }),

      // Kids Bikes
      ...this.generateVariants("Kids Explorer", "Kids Bike", {
        colors: ["Red", "Blue", "Green", "Pink"],
        sizes: {
          '12"': 189.99,
          '16"': 199.99,
          '20"': 209.99,
        },
        material: "Steel",
        description: "Safe and fun bike for kids",
        stockRange: [4, 8],
      }),
      ...this.generateVariants("Junior Pro", "Kids Bike", {
        colors: ["Black", "Red", "Blue"],
        sizes: {
          '16"': 239.99,
          '20"': 249.99,
          '24"': 259.99,
        },
        material: "Aluminum",
        description: "Lightweight bike for young riders",
        stockRange: [3, 6],
      }),
    ];

    console.log(
      `[${new Date().toISOString()}] Total products to insert: ${
        sampleProducts.length
      }`
    );

    const insertMany = this.db.transaction((products) => {
      for (const product of products) {
        insert.run(product);
      }
    });

    insertMany(sampleProducts);
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

  searchProducts(filters) {
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (filters.color) {
      query += " AND color = ?";
      params.push(filters.color);
    }

    if (filters.minPrice) {
      query += " AND price >= ?";
      params.push(filters.minPrice);
    }

    if (filters.maxPrice) {
      query += " AND price <= ?";
      params.push(filters.maxPrice);
    }

    if (filters.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }

    if (filters.size) {
      query += " AND size = ?";
      params.push(filters.size);
    }

    return this.db.prepare(query).all(...params);
  }

  close() {
    this.db.close();
  }
}

module.exports = new DatabaseService();
