const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// 1. Configure CORS to allow Vercel & Localhost
app.use(
  cors({
    origin: ["https://zero-vault-red.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// 2. Increase limit for large encrypted strings
app.use(bodyParser.json({ limit: "50mb" }));

// 3. In-Memory Database (Resets when server restarts)
// This is perfect for Render Free Tier demos
let filesDB = [];

// ROUTE: Check if server is alive
app.get("/", (req, res) => {
  res.send("Zero-Vault API is Running! 🚀");
});

// ROUTE: Upload File
app.post("/upload", (req, res) => {
  try {
    const { fileName, encryptedData } = req.body;

    console.log(`[SERVER] Received: ${fileName}`);

    const newFile = {
      id: Date.now(),
      fileName,
      encryptedData,
      uploadDate: new Date(),
    };

    // Save to our array
    filesDB.push(newFile);

    console.log(`[SERVER] Saved. Total files: ${filesDB.length}`);

    // IMPORTANT: Send success response
    res.status(200).json({ success: true, message: "File saved!" });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Server crashed" });
  }
});

// ROUTE: List Files
app.get("/files", (req, res) => {
  res.json(filesDB);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
