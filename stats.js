const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        if (message.content.toLowerCase() === "!stats") {

            await message.guild.members.fetch();
            const members = message.guild.members.cache;

            const bots = members.filter(m => m.user.bot).size;

            const online = members.filter(m =>
                !m.user.bot &&
                (m.presence?.status === "online" ||
                 m.presence?.status === "idle" ||
                 m.presence?.status === "dnd")
            ).size;

            const offline = members.filter(m =>
                !m.user.bot &&
                (!m.presence || m.presence.status === "offline")
            ).size;

            const total = members.filter(m => !m.user.bot).size;

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setAuthor({
                    name: message.guild.name,
                    iconURL: message.guild.iconURL({ dynamic: true })
                })
                .setTitle("📊 Statystyki Serwera")
                .addFields(
                    { name: "👥 Użytkownicy", value: `\`${total}\``, inline: true },
                    { name: "🟢 Online", value: `\`${online}\``, inline: true },
                    { name: "⚫ Offline", value: `\`${offline}\``, inline: true },
                    { name: "🤖 Boty", value: `\`${bots}\``, inline: true }
                )
                .setFooter({
                    text: `Wywołane przez ${message.author.tag}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp();

            message.reply({ embeds: [embed] });
        }
    });

};