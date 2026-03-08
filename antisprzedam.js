const { EmbedBuilder, PermissionsBitField } = require("discord.js");

// Lista słów do blokady
const blockedWords = ["sprzedam", "kupie", "wymienie", "do sprzedania", "na sprzedaż"];

// Czas muta w ms (10 minut)
const MUTE_TIME = 10 * 60 * 1000;

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    // Ignoruj adminów
    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    // Sprawdź, czy wiadomość zawiera zablokowane słowo
    const found = blockedWords.find((word) => content.includes(word));
    if (!found) return;

    // Sprawdź czy kanał to ticket
    if (message.channel.name.startsWith("ticket")) return;

    try {
      // Usuń wiadomość
      await message.delete();

      // Daj mute użytkownikowi
      await message.member.timeout(MUTE_TIME, "Pisanie ofert sprzedaży zabronione");

      // Powiadomienie w kanale
      const warnMsg = await message.channel.send({
        content: `❌ ${message.author}, nie możesz pisać ofert sprzedaży! Otrzymałeś mute na 10 minut.`,
      });

      setTimeout(() => {
        warnMsg.delete().catch(() => {});
      }, 5000);

      // Logi do kanału logs jeśli istnieje
      const logChannel = message.guild.channels.cache.find(
        (ch) => ch.name === "logs"
      );
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setTitle("🚫 Zablokowana wiadomość / mute")
          .setColor("Red")
          .addFields(
            { name: "Użytkownik", value: `${message.author.tag} (${message.author.id})` },
            { name: "Kanał", value: `<#${message.channel.id}>` },
            { name: "Treść", value: message.content }
          )
          .setTimestamp();
        logChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      console.log("Błąd w antisprzedam:", err);
    }
  });
};