const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 8080; // Use the PORT environment variable if set, otherwise default to 8080

// Azure SQL connection configuration
const dbConfig = {
  user: "admin1", // Azure SQL username
  password: "Gayle123", // Azure SQL password
  server: "castillo.database.windows.net", // Azure SQL server name
  database: "Castillo", // Your database name
  options: {
    encrypt: true, // Use encryption
    trustServerCertificate: true, // Bypass SSL certificate validation
  },
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("App is running.");
});

// Route to get all chat AI records
app.get("/chatAIs", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig); // Connect to Azure SQL
    const result = await pool
      .request()
      .query("SELECT * FROM ChatAIs ORDER BY id DESC");
    res.json(result.recordset); // Return the query results
  } catch (err) {
    console.error("Error querying the database:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Route to create a new chat AI record
app.post("/chatAIs", async (req, res) => {
  const { user, ai } = req.body;

  // Validate input
  if (!user || !ai) {
    return res.status(400).json({ message: "User  and AI are required." });
  }

  try {
    const pool = await sql.connect(dbConfig); // Connect to Azure SQL
    await pool
      .request()
      .input("user", sql.NVarChar, user)
      .input("ai", sql.NVarChar, ai)
      .query("INSERT INTO ChatAIs ([user], ai) VALUES (@user, @ai)");

    res.status(201).json({
      message: "Chat AI successfully recorded",
      data: { user, ai },
    });
  } catch (err) {
    console.error("Error inserting into the database:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
