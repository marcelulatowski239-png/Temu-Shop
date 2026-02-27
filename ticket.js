const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionsBitField 
} = require("discord.js");

module.exports = (client) => {

    // KOMENDA DO WYSŁANIA PANELU
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (message.content !== "!tickety") return;

        const embed = new EmbedBuilder()
            .setTitle("🎫 System Ticketów")
            .setDescription("Wybierz rodzaj ticketa poniżej:")
            .setColor("Blue");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("ticket_zakup")
                .setLabel("🛒 Zakup")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("ticket_skup")
                .setLabel("💰 Skup")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("ticket_pomoc")
                .setLabel("🆘 Pomoc")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("ticket_mm")
                .setLabel("🔒 MM")
                .setStyle(ButtonStyle.Danger)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    });

    // OBSŁUGA PRZYCISKÓW
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        await interaction.deferReply({ ephemeral: true });

        const types = {
            ticket_zakup: "zakup",
            ticket_skup: "skup",
            ticket_pomoc: "pomoc",
            ticket_mm: "mm"
        };

        if (!types[interaction.customId]) return;

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

        await channel.send({
            content: `🎫 Ticket utworzony przez ${interaction.user}\nRodzaj: **${ticketType}**`
        });

        await interaction.editReply({
            content: `✅ Twój ticket został utworzony: ${channel}`
        });
    });

};