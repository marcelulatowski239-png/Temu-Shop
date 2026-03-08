const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const PREFIX = "!";
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    // ================= KOMENDA !INVITES =================
    if (cmd === "invites") {
      try {
        const targetMember = message.mentions.members.first() || message.member;

        // Pobranie wszystkich zaproszeń na serwer
        const allInvites = await message.guild.invites.fetch();

        // Filtrujemy zaproszenia utworzone przez targetMember
        const userInvites = allInvites.filter(i => i.inviter && i.inviter.id === targetMember.id);

        let inviteCount = 0;
        userInvites.forEach(invite => {
          inviteCount += invite.uses;
        });

        const embed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle("📨 Statystyki zaproszeń")
          .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: "Użytkownik", value: `${targetMember}`, inline: true },
            { name: "Zaproszenia", value: `**${inviteCount}**`, inline: true }
          )
          .setFooter({ text: `Sprawdzone przez ${message.author.username}` })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      } catch (err) {
        console.error("Błąd komendy !invites:", err);
        return message.reply("❌ Wystąpił błąd podczas pobierania zaproszeń.");
      }
    }
  });
};