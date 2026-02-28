const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    client.on("messageCreate", async (message) => {
        if (message.author.bot) return;
        if (!message.guild) return;

        if (message.content.toLowerCase() === "!ticket") {

            const embed = new EmbedBuilder()
                .setColor("#FF6A00")
                .setTitle("🎫 Panel Ticketów • TemuShop")
                .setDescription("Wybierz kategorię, aby otworzyć ticket.")
                .setFooter({ text: "TemuShop • System Ticketów" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("zakup")
                    .setLabel("🛒 Zakup")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("skup")
                    .setLabel("💰 skup")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("pomoc")
                    .setLabel("🆘 Pomoc")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("mm")
                    .setLabel("🤝 MM")
                    .setStyle(ButtonStyle.Danger)
            );

            message.reply({ embeds: [embed], components: [row] });
        }
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const { guild, user, customId } = interaction;

        const category = customId;

        let descriptionText = "";

        if (category === "zakup")
            descriptionText = "🛒 Napisz co chcesz kupić.";

        if (category === "skup")
            descriptionText = "💰 Napisz co chcesz sprzedać.";

        if (category === "pomoc")
            descriptionText = "🆘 Opisz swój problem.";

        if (category === "mm")
            descriptionText = "🤝 Napisz z kim chcesz zrobić MM.";

        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("📩 Nowy Ticket")
            .setDescription(
                `Witaj ${user}\n\n` +
                `Typ: **${category}**\n\n` +
                `${descriptionText}`
            )
            .setFooter({ text: "TemuShop • Obsługa wkrótce się odezwie" })
            .setTimestamp();

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("🔒 Zamknij ticket")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({ content: `${user}`, embeds: [embed], components: [closeRow] });

        await interaction.reply({ content: `✅ Ticket utworzony: ${channel}`, ephemeral: true });
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "close_ticket") return;

        await interaction.reply({ content: "🔒 Ticket zamknięty.", ephemeral: true });

        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 3000);
    });
};