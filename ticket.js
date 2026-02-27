const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    const OWNER_ID = "1472956273854255331";
    const CATEGORY_ID = "1475471754221850857";

    // PANEL
    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (message.content !== "!tickety") return;

        const embed = new EmbedBuilder()
            .setTitle("🎫 System Ticketów")
            .setDescription("Wybierz kategorię aby otworzyć ticket.")
            .setColor("#5865F2");

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

    // INTERACTION
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const types = {
            ticket_zakup: "zakup",
            ticket_skup: "skup",
            ticket_pomoc: "pomoc",
            ticket_mm: "mm"
        };

        // ZAMYKANIE
        if (interaction.customId === "close_ticket") {

            await interaction.deferReply({ ephemeral: true });

            await interaction.editReply({
                content: "🔒 Ticket zamyka się za 5 sekund..."
            });

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 5000);

            return;
        }

        if (!types[interaction.customId]) return;

        await interaction.deferReply({ ephemeral: true });

        const ticketType = types[interaction.customId];

        const channel = await interaction.guild.channels.create({
            name: `ticket-${ticketType}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: CATEGORY_ID, // 👈 PRZYPISANIE DO KATEGORII
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
                {
                    id: OWNER_ID,
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

        const ticketEmbed = new EmbedBuilder()
            .setTitle("📩 Nowy Ticket")
            .setDescription(`Witaj ${interaction.user}\n\nTyp: **${ticketType}**\nOpisz swój problem.`)
            .setColor("#2f3136");

        await channel.send({
            content: `<@${interaction.user.id}> <@${OWNER_ID}>`,
            embeds: [ticketEmbed],
            components: [closeRow]
        });

        await interaction.editReply({
            content: `✅ Ticket utworzony w kategorii! ${channel}`
        });
    });

};