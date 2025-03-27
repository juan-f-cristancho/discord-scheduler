const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { addScheduledMessage } = require("./scheduler");
const { apiKey: PUBLIC_API_KEY } = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

const webhooksFile = path.join(__dirname, "webhooks.json");

app.use(bodyParser.json());

app.post("/schedule", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const { day, time, message, channelId } = req.body;

  if (apiKey !== PUBLIC_API_KEY) {
    return res.status(401).json({ error: "API Key inválida" });
  }

  if (!day || !time || !message || !channelId) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  try {
    addScheduledMessage({ day, time, message, channelId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/webhooks", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const { channelId, webhookUrl } = req.body;

  if (apiKey !== PUBLIC_API_KEY) {
    return res.status(401).json({ error: "API Key inválida" });
  }

  if (!channelId || !webhookUrl) {
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  let current = {};
  if (fs.existsSync(webhooksFile)) {
    current = JSON.parse(fs.readFileSync(webhooksFile, "utf-8"));
  }

  current[channelId] = webhookUrl;

  fs.writeFileSync(webhooksFile, JSON.stringify(current, null, 2), "utf-8");

  res.json({ success: true, message: "Webhook registrado" });
});

app.get("/webhooks", (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== PUBLIC_API_KEY) {
    return res.status(401).json({ error: "API Key inválida" });
  }

  if (!fs.existsSync(webhooksFile)) {
    return res.json({});
  }

  const data = JSON.parse(fs.readFileSync(webhooksFile, "utf-8"));
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`📡 Servidor en http://localhost:${PORT}`);
});
