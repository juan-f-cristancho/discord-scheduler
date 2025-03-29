const axios = require("axios");
const config = require("../config.json");

module.exports = {
  name: "agendar",
  description: "Agendar un mensaje para enviarlo automáticamente",
  options: [
    {
      name: "dia",
      type: "STRING",
      description: "Día de la semana (ej. Monday, Tuesday)",
      required: true,
    },
    {
      name: "hora",
      type: "STRING",
      description: "Hora en formato 24h (HH:MM)",
      required: true,
    },
    {
      name: "mensaje",
      type: "STRING",
      description: "Contenido del mensaje",
      required: true,
    },
  ],

  async execute(interaction) {
    const day = interaction.options.getString("dia");
    const time = interaction.options.getString("hora");
    const message = interaction.options.getString("mensaje");

    const data = {
      day,
      time,
      message,
      channelId: interaction.channelId,
    };

    try {
      const response = await axios.post(`${config.apiUrl}/schedule`, data, {
        headers: { "x-api-key": config.apiKey },
      });

      if (response.data.success) {
        await interaction.reply(`✅ Mensaje agendado para ${day} a las ${time}`);
      } else {
        await interaction.reply(`❌ Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error("❌ Error al agendar mensaje:", error);
      await interaction.reply("❌ Hubo un error al agendar el mensaje.");
    }
  },
};
