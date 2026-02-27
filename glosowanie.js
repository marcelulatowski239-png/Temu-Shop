const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require("discord.js");

module.exports = (client) => {

    const PREFIX = "+";

    client.on("messageCreate", async (message) => {
        if (!message.guild || message.author.bot) return;
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (cmd !== "glosowanie") return;

        const text = args.join(" ");
        if (!text) {
            return message.reply("❌ Użycie: +glosowanie [tekst]");
        }

        let votes = { w: 0, l: 0 };
        let voters = new Map();

        const embed = new EmbedBuilder()
            .setTitle("📢 Głosowanie W / L")
            .setDescription(text)
            .setColor("#2b2d31")
            .setFooter({ text: `Autor: ${message.author.tag}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("vote_w")
                .setLabel("🟢 W (0)")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("vote_l")
                .setLabel("🔴 L (0)")
                .setStyle(ButtonStyle.Danger)
        );

        const msg = await message.channel.send({
            embeds: [embed],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector();

        collector.on("collect", async (interaction) => {
            if (voters.has(interaction.user.id)) {
                return interaction.reply({
                    content: "❌ Już głosowałeś!",
                    ephemeral: true
                });
            }

            if (interaction.customId === "vote_w") {
                votes.w++;
            } else if (interaction.customId === "vote_l") {
                votes.l++;
            }

            voters.set(interaction.user.id, true);

            const updatedRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("vote_w")
                    .setLabel(`🟢 W (${votes.w})`)
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("vote_l")
                    .setLabel(`🔴 L (${votes.l})`)
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.update({
                components: [updatedRow]
            });
        });
    });
};