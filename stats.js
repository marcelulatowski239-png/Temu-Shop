const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        if (message.content.toLowerCase() === "!stats") {

            await message.guild.members.fetch();
            const members = message.guild.members.cache;

            const users = members.filter(m => !m.user.bot).size;
            const bots = members.filter(m => m.user.bot).size;
            const total = message.guild.memberCount;
            const boosts = message.guild.premiumSubscriptionCount;
            const boostLevel = message.guild.premiumTier;

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setAuthor({
                    name: message.guild.name,
                    iconURL: message.guild.iconURL({ dynamic: true })
                })
                .setTitle("📊 Statystyki Serwera")
                .setDescription("Aktualne dane członków serwera")
                .addFields(
                    { name: "👥 Użytkownicy", value: `\`${users}\``, inline: true },
                    { name: "🤖 Boty", value: `\`${bots}\``, inline: true },
                    { name: "📈 Razem", value: `\`${total}\``, inline: true },
                    { name: "🚀 Wzmocnienia", value: `\`${boosts}\``, inline: true },
                    { name: "⭐ Poziom boosta", value: `\`Poziom ${boostLevel}\``, inline: true }
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