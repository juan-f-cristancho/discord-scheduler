const axios = require("axios");
const fs = require("fs");
const path = require("path");

const webhooksFile = path.join(__dirname, "webhooks.json");

function getWebhook(channelId) {
  if (!fs.existsSync(webhooksFile)) return null;
  const map = JSON.parse(fs.readFileSync(webhooksFile, "utf-8"));
  return map[channelId] || null;
}

async function sendDiscordMessage(content, channelId) {
  const webhookUrl = getWebhook(channelId);

  if (!webhookUrl) {
    throw new Error(`No hay webhook para el canal ${channelId}`);
  }

  await axios.post(webhookUrl, {
    content,
    allowed_mentions: { parse: ["users", "roles", "everyone"] }
  });
}

module.exports = { sendDiscordMessage };
