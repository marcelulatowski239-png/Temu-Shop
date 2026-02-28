const { EmbedBuilder } = require("discord.js");

const config = {
  welcomeChannelId: "1472956273854255337",
  leaveChannelId: "1473339248739356837",
  boostChannelId: "1473344129936130180",
  boostRoleId: "1477026309543694336",
};

module.exports = (client) => {

  /* =========================
     👋 WELCOME SYSTEM
  ========================== */
  client.on("guildMemberAdd", async (member) => {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) return;

    const user = await member.user.fetch(true);

    const embed = new EmbedBuilder()
      .setColor("#00ffcc")
      .setTitle("🎉 Witaj na serwerze!")
      .setDescription(
`👋 Cześć ${member}!

Witaj na **${member.guild.name}**
Jesteś naszym **${member.guild.memberCount}** członkiem 🔥`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setImage(user.bannerURL({ size: 1024 }) || null)
      .addFields({
        name: "📌 Informacje",
        value:
`ID: ${user.id}
Konto utworzone: <t:${Math.floor(user.createdTimestamp/1000)}:F>
Dołączył: <t:${Math.floor(member.joinedTimestamp/1000)}:F>`
      })
      .setFooter({ text: member.guild.name })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  });


  /* =========================
     🚀 BOOST SYSTEM
  ========================== */
  client.on("guildMemberUpdate", async (oldMember, newMember) => {

    if (!oldMember.premiumSince && newMember.premiumSince) {

      const channel = newMember.guild.channels.cache.get(config.boostChannelId);
      if (!channel) return;

      const user = await newMember.user.fetch(true);

      if (config.boostRoleId) {
        newMember.roles.add(config.boostRoleId).catch(() => {});
      }

      const embed = new EmbedBuilder()
        .setColor("#ff73fa")
        .setTitle("🚀 NOWY BOOSTER!")
        .setDescription(
`🔥 ${newMember} właśnie zboostował serwer!

Dziękujemy za wsparcie 💎`
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setImage(user.bannerURL({ size: 1024 }) || null)
        .addFields({
          name: "💜 Informacje",
          value:
`ID: ${user.id}
Boost od: <t:${Math.floor(newMember.premiumSinceTimestamp/1000)}:F>`
        })
        .setFooter({ text: "Dziękujemy za wsparcie!" })
        .setTimestamp();

      channel.send({ embeds: [embed] });
    }
  });


  /* =========================
     🚪 LEAVE SYSTEM
  ========================== */
  client.on("guildMemberRemove", async (member) => {

    const channel = member.guild.channels.cache.get(config.leaveChannelId);
    if (!channel) return;

    const user = await member.user.fetch(true);

    const days = Math.floor(
      (Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)
    );

    const embed = new EmbedBuilder()
      .setColor("#ff4d4d")
      .setTitle("😢 Użytkownik opuścił serwer")
      .setDescription(`${member.user.tag} opuścił serwer.`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields({
        name: "📊 Informacje",
        value:
`ID: ${user.id}
Był z nami: ${days} dni
Dołączył: <t:${Math.floor(member.joinedTimestamp/1000)}:F>`
      })
      .setFooter({ text: `Aktualnie ${member.guild.memberCount} członków` })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  });

};