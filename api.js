const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { addScheduledMessage } = require("./scheduler");
const { apiKey: PUBLIC_API_KEY } = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

const webhooksFile = path.join(__dirname, "webhooks.json");

const settingsPath = path.join(__dirname, "settings.json");

const utcToTimezone = {
  "UTC-12": "Etc/GMT+12",
  "UTC-11": "Etc/GMT+11",
  "UTC-10": "Etc/GMT+10",
  "UTC-9": "Etc/GMT+9",
  "UTC-8": "Etc/GMT+8",
  "UTC-7": "Etc/GMT+7",
  "UTC-6": "Etc/GMT+6",
  "UTC-5": "Etc/GMT+5",
  "UTC-4": "Etc/GMT+4",
  "UTC-3": "Etc/GMT+3",
  "UTC-2": "Etc/GMT+2",
  "UTC-1": "Etc/GMT+1",
  "UTC+0": "Etc/GMT",
  "UTC+1": "Etc/GMT-1",
  "UTC+2": "Etc/GMT-2",
  "UTC+3": "Etc/GMT-3",
  "UTC+4": "Etc/GMT-4",
  "UTC+5": "Etc/GMT-5",
  "UTC+6": "Etc/GMT-6",
  "UTC+7": "Etc/GMT-7",
  "UTC+8": "Etc/GMT-8",
  "UTC+9": "Etc/GMT-9",
  "UTC+10": "Etc/GMT-10",
  "UTC+11": "Etc/GMT-11",
  "UTC+12": "Etc/GMT-12"
};

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

// Endpoint para configurar zona horaria
app.post("/timezone", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  const { timezone } = req.body;

  if (apiKey !== PUBLIC_API_KEY) {
    return res.status(401).json({ error: "API Key inválida" });
  }

  if (!timezone || !utcToTimezone[timezone]) {
    return res.status(400).json({ error: "Zona horaria inválida. Use formato UTC±X." });
  }

  const resolvedTimezone = utcToTimezone[timezone];
  
  const settings = { timezone: resolvedTimezone };
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf-8");

  res.json({ success: true, message: `Zona horaria actualizada a ${resolvedTimezone} (${timezone})` });
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

app.get("/timezone", (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== PUBLIC_API_KEY) {
    return res.status(401).json({ error: "API Key inválida" });
  }

  res.json({ timezone: `UTC${timezoneOffset >= 0 ? "+" : ""}${timezoneOffset}` });
});

app.listen(PORT, () => {
  console.log(`📡 Servidor en http://localhost:${PORT}`);
});
