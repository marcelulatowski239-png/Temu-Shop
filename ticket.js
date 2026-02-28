const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const { prefix, ticketCategoryId, staffRoleId, logChannelId } = require("./config");

module.exports = (client) => {

    // ================= PANEL TICKET =================
    client.on("messageCreate", async (message) => {
        if (!message.guild || message.author.bot) return;

        if (message.content.toLowerCase() === `${prefix}ticket`) {

            const embed = new EmbedBuilder()
                .setColor("#FF6A00")
                .setTitle("🎫 TemuShop • System Ticketów")
                .setDescription(
                    "Wybierz kategorię:\n\n" +
                    "🛒 Zakup\n" +
                    "💰 Skup\n" +
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
                    .setLabel("💰 Skup")
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

    // ================= OBSŁUGA INTERAKCJI =================
    client.on("interactionCreate", async (interaction) => {

        // ====== KLIKNIĘCIE ZAMKNIJ ======
        if (interaction.isButton() && interaction.customId === "close_ticket") {

            const modal = new ModalBuilder()
                .setCustomId("close_reason_modal")
                .setTitle("Powód zamknięcia ticketu");

            const reasonInput = new TextInputBuilder()
                .setCustomId("close_reason_input")
                .setLabel("Podaj powód zamknięcia")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(500)
                .setPlaceholder("Np. Sprawa rozwiązana / Brak odpowiedzi");

            const row = new ActionRowBuilder().addComponents(reasonInput);
            modal.addComponents(row);

            return interaction.showModal(modal);
        }

        // ====== PO WYSŁANIU MODALA ======
        if (interaction.isModalSubmit() && interaction.customId === "close_reason_modal") {

            const reason = interaction.fields.getTextInputValue("close_reason_input");
            const channel = interaction.channel;
            const guild = interaction.guild;

            const ticketOwnerId = channel.name.replace("ticket-", "");

            let ticketOwner;
            try {
                ticketOwner = await client.users.fetch(ticketOwnerId);
            } catch {
                ticketOwner = null;
            }

            // 📩 DM DO AUTORA TICKETU
            if (ticketOwner) {
                ticketOwner.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#E74C3C")
                            .setTitle("🔒 Twój ticket został zamknięty")
                            .setDescription(
                                `📌 Serwer: **${guild.name}**\n` +
                                `👮 Zamknięty przez: ${interaction.user}\n\n` +
                                `📝 Powód zamknięcia:\n${reason}`
                            )
                            .setTimestamp()
                    ]
                }).catch(() => {});
            }

            // 📜 LOG
            const logChannel = guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#E74C3C")
                            .setTitle("🔒 Ticket Zamknięty")
                            .setDescription(
                                `🎫 Ticket: ${channel.name}\n` +
                                `👮 Zamknięty przez: ${interaction.user}\n\n` +
                                `📝 Powód:\n${reason}`
                            )
                            .setTimestamp()
                    ]
                });
            }

            await interaction.reply({
                content: "🔒 Ticket zostanie usunięty za 3 sekundy...",
                ephemeral: true
            });

            setTimeout(() => {
                channel.delete().catch(() => {});
            }, 3000);

            return;
        }

        // ====== TWORZENIE TICKETU ======
        if (!interaction.isButton()) return;

        const { guild, user, customId } = interaction;

        const existing = guild.channels.cache.find(c => c.name === `ticket-${user.id}`);
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
                `Typ: **${customId.charAt(0).toUpperCase() + customId.slice(1)}**\n\n` +
                `${descriptionText}`
            )
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