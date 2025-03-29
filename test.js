const fs = require("fs");
const path = require("path");

// Verificar si bot/index.js existe
const botPath = path.join(__dirname, "bot", "index.js");

if (fs.existsSync(botPath)) {
  console.log(`✅ El archivo bot/index.js EXISTE en: ${botPath}`);
} else {
  console.error(`❌ No se encontró bot/index.js en: ${botPath}`);
}
