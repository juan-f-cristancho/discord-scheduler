const { Client, Intents } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Cargar variables de entorno desde Render
const token = process.env.DISCORD_TOKEN;
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Cargar comandos
client.commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Evento cuando el bot está listo
client.once("ready", () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

// Manejar comandos
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (command) {
    try {
      await command.execute(interaction, apiUrl, apiKey);
    } catch (error) {
      console.error("❌ Error ejecutando comando:", error);
      await interaction.reply({ content: "Hubo un error al ejecutar este comando.", ephemeral: true });
    }
  }
});

// Iniciar el bot
client.login(token);
