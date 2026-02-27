const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {

  const prefix = "!";

  client.on("messageCreate", async (message) => {
    if (!message.guild || message.author.bot) return;
    if (!message.content.startsWith(prefix + "profil")) return;

    const args = message.content.split(" ").slice(1);
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    if (!member) {
      return message.reply("❌ Nie znaleziono użytkownika na serwerze.");
    }

    // Role (bez @everyone)
    const roles = member.roles.cache
      .filter(role => role.id !== message.guild.id)
      .map(role => role.toString())
      .slice(0, 15);

    const rolesText = roles.length > 0 ? roles.join(", ") : "Brak ról";

    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setAuthor({
        name: `Profil użytkownika`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .setTitle(`👤 ${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        {
          name: "📛 Nazwa",
          value: `\`${user.tag}\``,
          inline: true
        },
        {
          name: "🆔 ID",
          value: `\`${user.id}\``,
          inline: true
        },
        {
          name: "🤖 Bot",
          value: user.bot ? "Tak" : "Nie",
          inline: true
        },
        {
          name: "📅 Dołączył na serwer",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: "📆 Data utworzenia konta",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false
        },
        {
          name: `🎭 Role (${member.roles.cache.size - 1})`,
          value: rolesText.length > 1024 ? "Za dużo ról do wyświetlenia" : rolesText,
          inline: false
        }
      )
      .setFooter({
        text: `Wywołane przez ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    message.reply({ embeds: [embed] });
  });
};