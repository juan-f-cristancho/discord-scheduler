const axios = require("axios");
const config = require("../config.json");

module.exports = {
  name: "listar",
  description: "Listar los mensajes agendados",
  async execute(interaction) {
    try {
      const response = await axios.get(`${config.apiUrl}/schedule`, {
        headers: { "x-api-key": config.apiKey },
      });

      const schedule = response.data.schedule || [];
      if (schedule.length === 0) {
        await interaction.reply("📭 No hay mensajes agendados.");
        return;
      }

      let msgList = "📅 **Mensajes agendados:**\n";
      schedule.forEach((msg, index) => {
        msgList += `\`${index + 1}\` - **${msg.day} ${msg.time}**: ${msg.message}\n`;
      });

      await interaction.reply(msgList);
    } catch (error) {
      console.error("❌ Error al listar mensajes:", error);
      await interaction.reply("❌ Hubo un error al listar los mensajes.");
    }
  },
};
