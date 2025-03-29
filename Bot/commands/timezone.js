const axios = require("axios");
const config = require("../config.json");

module.exports = {
  name: "zona",
  description: "Ver o cambiar la zona horaria",
  options: [
    {
      name: "zona",
      type: "STRING",
      description: "Nueva zona horaria (ej. UTC-5)",
      required: false,
    },
  ],

  async execute(interaction) {
    const newTimezone = interaction.options.getString("zona");

    if (newTimezone) {
      // Cambiar zona horaria
      try {
        const response = await axios.post(
          `${config.apiUrl}/timezone`,
          { timezone: newTimezone },
          { headers: { "x-api-key": config.apiKey } }
        );

        if (response.data.success) {
          await interaction.reply(`✅ Zona horaria actualizada a **${newTimezone}**.`);
        } else {
          await interaction.reply(`❌ Error: ${response.data.error}`);
        }
      } catch (error) {
        console.error("❌ Error al cambiar zona horaria:", error);
        await interaction.reply("❌ Hubo un error al cambiar la zona horaria.");
      }
    } else {
      // Consultar zona horaria actual
      try {
        const response = await axios.get(`${config.apiUrl}/timezone`, {
          headers: { "x-api-key": config.apiKey },
        });

        await interaction.reply(`🌍 Zona horaria actual: **${response.data.timezone}**`);
      } catch (error) {
        console.error("❌ Error al obtener zona horaria:", error);
        await interaction.reply("❌ Hubo un error al obtener la zona horaria.");
      }
    }
  },
};
