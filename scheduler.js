const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { sendDiscordMessage } = require("./discordSender");
const settingsPath = path.join(__dirname, "settings.json");
let timezone = "UTC";

// Cargar zona horaria al iniciar
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    timezone = settings.timezone || "UTC";
    console.log(`🕒 Zona horaria actual cargada: ${timezone}`);
  } catch (e) {
    console.warn("⚠️ No se pudo leer settings.json, usando UTC por defecto");
  }
}

const messagesPath = path.join(__dirname, "messages.json");
const dayMap = {
  Sunday: 0, Monday: 1, Tuesday: 2,
  Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6
};

function loadSchedule() {
  if (!fs.existsSync(messagesPath)) return [];
  const raw = fs.readFileSync(messagesPath, "utf-8");
  return JSON.parse(raw);
}

function saveSchedule(schedule) {
  fs.writeFileSync(messagesPath, JSON.stringify(schedule, null, 2), "utf-8");
}

function scheduleOneMessage(entry) {
  const { day, time, message, channelId } = entry;
  const [hour, minute] = time.split(":");
  const cronExpr = `${minute} ${hour} * * ${dayMap[day]}`;

  cron.schedule(cronExpr, () => {
    sendDiscordMessage(message, channelId);
  }, {
    timezone: "America/Argentina/Buenos_Aires"
  });

  console.log(`🕒 Programado: "${message}" → ${day} ${time} en canal ${channelId}`);
}

function addScheduledMessage(entry) {
  const schedule = loadSchedule();
  schedule.push(entry);
  saveSchedule(schedule);
  scheduleOneMessage(entry);
}

function scheduleMessages() {
  const schedule = loadSchedule();
  schedule.forEach(scheduleOneMessage);
}

// Convertir hora local a UTC usando el offset
function getUtcTime(hour, minute) {
  let utcHour = parseInt(hour) - timezoneOffset;

  if (utcHour < 0) utcHour += 24; // manejar horas negativas
  if (utcHour >= 24) utcHour -= 24; // manejar horas mayores a 24

  return { hour: utcHour, minute };
}

// Programar mensajes con la zona horaria configurada
function scheduleOneMessage(entry) {
  const { day, time, message, channelId } = entry;
  const [hour, minute] = time.split(":");
  const cronExpr = `${minute} ${hour} * * ${dayMap[day]}`;

  cron.schedule(cronExpr, () => {
    sendDiscordMessage(message, channelId);
  }, {
    timezone
  });

  console.log(`🕒 Programado: "${message}" → ${day} ${time} (${timezone}) en canal ${channelId}`);
}

module.exports = { scheduleMessages, addScheduledMessage };

