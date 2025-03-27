const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { sendDiscordMessage } = require("./discordSender");

const messagesPath = path.join(__dirname, "messages.json");
const settingsPath = path.join(__dirname, "settings.json");

let scheduledJobs = []; // Array para tareas programadas
let timezone = "UTC"; // Por defecto

// Mapa de días para cron (0=Domingo, 1=Lunes, ..., 6=Sábado)
const dayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

// ✅ Cargar zona horaria desde settings.json
function loadTimezone() {
  if (fs.existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
      timezone = settings.timezone || "UTC";
      console.log(`🕒 Zona horaria actual cargada: ${timezone}`);
    } catch (e) {
      console.warn("⚠️ No se pudo leer settings.json, usando UTC.");
      timezone = "UTC";
    }
  }
}

// ✅ Cancelar todas las tareas programadas
function cancelAllJobs() {
  scheduledJobs.forEach((job) => job.stop());
  scheduledJobs = [];
  console.log("🔄 Todas las tareas anteriores fueron canceladas.");
}

// ✅ Recargar y reprogramar tareas después de cambiar la zona horaria
function reloadSchedule() {
  console.log(`🔄 Recargando tareas con zona horaria: ${timezone}`);
  cancelAllJobs();
  scheduleMessages(); // Volver a programar tareas
}

// ✅ Programar un mensaje individual
function scheduleOneMessage(entry) {
  const { day, time, message, channelId } = entry;
  const [hour, minute] = time.split(":");
  const cronExpr = `${minute} ${hour} * * ${dayMap[day]}`;

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

// ✅ Agregar un nuevo mensaje programado al archivo messages.json
function addScheduledMessage(entry) {
  const schedule = loadSchedule();
  schedule.push(entry);
  fs.writeFileSync(messagesPath, JSON.stringify(schedule, null, 2), "utf-8");
  console.log(`📅 Nuevo mensaje agendado: "${entry.message}" para ${entry.day} a las ${entry.time}`);
  scheduleOneMessage(entry); // Programar la tarea inmediatamente
}

// ✅ Cargar tareas desde messages.json
function loadSchedule() {
  if (!fs.existsSync(messagesPath)) return [];
  const raw = fs.readFileSync(messagesPath, "utf-8");
  return JSON.parse(raw || "[]");
}

// ✅ Programar todos los mensajes al iniciar
function scheduleMessages() {
  loadTimezone(); // Cargar zona horaria actualizada
  const schedule = loadSchedule();
  schedule.forEach(scheduleOneMessage);
}

// ✅ Inicializar programación al iniciar el servidor
scheduleMessages();

// ✅ Exportar funciones para usarlas en otros archivos
module.exports = { scheduleMessages, addScheduledMessage, reloadSchedule };
