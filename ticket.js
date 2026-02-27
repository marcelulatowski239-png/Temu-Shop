const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // PANEL TICKETÓW
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith("!tickety")) return;

        const embed = new EmbedBuilder()
            .setTitle("📁 System Ticketów")
            .setDescription("Wybierz rodzaj ticketa:")
            .addFields(
                { name: "🛒 Zakup", value: "Pomoc w zakupie", inline: true },
                { name: "💰 Skup", value: "Sprzedaż przedmiotów", inline: true },
                { name: "🆘 Pomoc", value: "Ogólna pomoc", inline: true },
                { name: "🔒 MM", value: "Middleman", inline: true }
            )
            .setColor("Blue");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_zakup")
                .setLabel("Zakup")
                .setEmoji("🛒")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_skup")
                .setLabel("Skup")
                .setEmoji("💰")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_pomoc")
                .setLabel("Pomoc")
                .setEmoji("🆘")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_mm")
                .setLabel("MM")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Danger)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    });

    // OBSŁUGA PRZYCISKÓW
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const types = {
            ticket_zakup: "zakup",
            ticket_skup: "skup",
            ticket_pomoc: "pomoc",
            ticket_mm: "mm"
        };

        if (!types[interaction.customId]) return;

        // 🔥 TO NAPRAWIA BŁĄD 3 SEKUND
        await interaction.deferReply({ ephemeral: true });

        const ticketType = types[interaction.customId];

        const channel = await interaction.guild.channels.create({
            name: `ticket-${ticketType}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory
                    ],
                },
            ],
        });

 const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Zamknij ticket")
        .setStyle(ButtonStyle.Danger)
);

await channel.send({
    content: `🎫 Ticket utworzony przez ${interaction.user}\nRodzaj: **${ticketType}**`,
    components: [closeRow]
});

        await interaction.editReply({
            content: `✅ Ticket został utworzony: ${channel}`
        });
    });

};