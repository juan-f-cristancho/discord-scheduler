const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { sendDiscordMessage } = require("./discordSender");

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

module.exports = { scheduleMessages, addScheduledMessage };

