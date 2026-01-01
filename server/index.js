const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" })); // Allow large files

// "Database" (Just a JSON file for simplicity)
const DB_FILE = "./database.json";

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// 1. UPLOAD ROUTE (Server only sees encrypted string)
app.post("/upload", (req, res) => {
  const { fileName, encryptedData } = req.body;

  // Read current DB
  const db = JSON.parse(fs.readFileSync(DB_FILE));

  // Save the "Gibberish"
  const newFile = {
    id: Date.now(),
    fileName,
    encryptedData,
    uploadDate: new Date().toISOString(),
  };

  db.push(newFile);
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  console.log(`[SERVER] Received encrypted file: ${fileName}`);
  console.log(
    `[SERVER] Saved Data snippet: ${encryptedData.substring(0, 50)}...`
  );

  res.json({ success: true, message: "File stored securely!" });
});

// 2. LIST FILES ROUTE
app.get("/files", (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_FILE));
  res.json(db);
});

app.listen(5000, () => console.log("Server running on port 5000"));
