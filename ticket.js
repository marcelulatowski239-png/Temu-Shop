const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField
} = require("discord.js");

const { prefix, ticketCategoryId, staffRoleId, logChannelId } = require("./config");

module.exports = (client) => {

    // 🔹 PANEL TICKET
    client.on("messageCreate", async (message) => {
        if (!message.guild) return;
        if (message.author.bot) return;

        if (message.content.toLowerCase() === `${prefix}ticket`) {

            const embed = new EmbedBuilder()
                .setColor("#FF6A00")
                .setTitle("🎫 TemuShop • System Ticketów")
                .setDescription(
                    "Wybierz kategorię poniżej, aby otworzyć ticket.\n\n" +
                    "🛒 Zakup\n" +
                    "💰 Kupno\n" +
                    "🆘 Pomoc\n" +
                    "🤝 MM"
                )
                .setFooter({ text: "TemuShop • Premium Support" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("zakup")
                    .setLabel("🛒 Zakup")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("skup")
                    .setLabel("💰 Kskup")
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

            message.channel.send({ embeds: [embed], components: [row] });
        }
    });

    // 🔹 OBSŁUGA PRZYCISKÓW
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const { guild, user, customId } = interaction;

        // 🔒 ZAMKNIĘCIE
        if (customId === "close_ticket") {

            const logChannel = guild.channels.cache.get(logChannelId);

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor("#E74C3C")
                    .setTitle("🔒 Ticket Zamknięty")
                    .setDescription(
                        `Ticket: ${interaction.channel.name}\n` +
                        `Zamknięty przez: ${user}`
                    )
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }

            await interaction.reply({ content: "🔒 Ticket zamykany...", ephemeral: true });

            setTimeout(() => {
                interaction.channel.delete().catch(() => {});
            }, 2000);

            return;
        }

        // ❌ BLOKADA 1 TICKETU
        const existing = guild.channels.cache.find(c =>
            c.name === `ticket-${user.id}`
        );

        if (existing) {
            return interaction.reply({
                content: "❌ Masz już otwarty ticket!",
                ephemeral: true
            });
        }

        let descriptionText = "";

        if (customId === "zakup")
            descriptionText = "🛒 Napisz co chcesz kupić.";

        if (customId === "skup")
            descriptionText = "💰 Napisz co chcesz sprzedać.";

        if (customId === "pomoc")
            descriptionText = "🆘 Opisz swój problem.";

        if (customId === "mm")
            descriptionText = "🤝 Napisz z kim chcesz zrobić MM.";

        if (!descriptionText) return;

        // 🔹 TWORZENIE KANAŁU
        const channel = await guild.channels.create({
            name: `ticket-${user.id}`,
            type: ChannelType.GuildText,
            parent: ticketCategoryId,
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
                },
                {
                    id: staffRoleId,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages
                    ]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("📩 Nowy Ticket • TemuShop")
            .setDescription(
                `Witaj ${user}\n\n` +
                `Typ: **${customId}**\n\n` +
                `${descriptionText}`
            )
            .setFooter({ text: "TemuShop • Support odpowie wkrótce" })
            .setTimestamp();

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("🔒 Zamknij Ticket")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `${user} <@&${staffRoleId}>`,
            embeds: [embed],
            components: [closeRow]
        });

        await interaction.reply({
            content: `✅ Ticket utworzony: ${channel}`,
            ephemeral: true
        });
    });

};