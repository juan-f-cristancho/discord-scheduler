const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { sendDiscordMessage } = require("./discordSender");
const settingsPath = path.join(__dirname, "settings.json");
let timezone = "UTC";
const validTimezones = [
  "Etc/GMT+12", "Etc/GMT+11", "Etc/GMT+10", "Etc/GMT+9", "Etc/GMT+8", "Etc/GMT+7",
  "Etc/GMT+6", "Etc/GMT+5", "Etc/GMT+4", "Etc/GMT+3", "Etc/GMT+2", "Etc/GMT+1",
  "Etc/GMT", "Etc/GMT-1", "Etc/GMT-2", "Etc/GMT-3", "Etc/GMT-4", "Etc/GMT-5",
  "Etc/GMT-6", "Etc/GMT-7", "Etc/GMT-8", "Etc/GMT-9", "Etc/GMT-10", "Etc/GMT-11",
  "Etc/GMT-12", "UTC", "America/Argentina/Buenos_Aires", "America/New_York"
];

// Cargar zona horaria al iniciar
if (fs.existsSync(settingsPath)) {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
    if (isValidTimezone(settings.timezone)) {
      timezone = settings.timezone;
    } else {
      console.warn(`⚠️ Zona horaria no válida: ${settings.timezone}. Usando UTC.`);
      timezone = "UTC"; // Fallback si no es válida
    }
  } catch (e) {
    console.warn("⚠️ No se pudo leer settings.json, usando UTC.");
    timezone = "UTC";
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

  // LOG para verificar la zona horaria antes de programar
  console.log(`⏰ Programando: ${message} → ${day} ${time} con zona: ${timezone}`);

  try {
    const job = cron.schedule(
      cronExpr,
      () => {
        sendDiscordMessage(message, channelId);
      },
      {
        timezone,
      }
    );

    scheduledJobs.push(job);
    console.log(`✅ Programado: "${message}" → ${day} ${time} (${timezone}) en canal ${channelId}`);
  } catch (err) {
    console.error(`❌ Error al programar: ${err.message}`);
  }
}

function isValidTimezone(tz) {
  return validTimezones.includes(tz);
}

// Cargar zona horaria desde settings.json
function loadTimezone() {
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      if (isValidTimezone(settings.timezone)) {
        timezone = settings.timezone;
      } else {
        console.warn(`⚠️ Zona horaria no válida: ${settings.timezone}. Usando UTC.`);
        timezone = "UTC"; // Fallback si no es válida
      }
    } catch (e) {
      console.warn("⚠️ No se pudo leer settings.json, usando UTC.");
      timezone = "UTC";
    }
  }
}

module.exports = { scheduleMessages, addScheduledMessage, reloadSchedule};

