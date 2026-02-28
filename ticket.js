client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton() && !interaction.isModalSubmit()) return;

    const { guild, user } = interaction;

    // 🔒 KLIKNIĘCIE ZAMKNIJ
    if (interaction.isButton() && interaction.customId === "close_ticket") {

        const modal = {
            title: "Powód zamknięcia ticketu",
            custom_id: "close_reason_modal",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "close_reason_input",
                            label: "Podaj powód zamknięcia",
                            style: 2,
                            min_length: 3,
                            max_length: 500,
                            placeholder: "Np. Sprawa rozwiązana / Brak odpowiedzi / Zrealizowano zamówienie",
                            required: true
                        }
                    ]
                }
            ]
        };

        return interaction.showModal(modal);
    }

    // 📩 WYSŁANIE POWODU
    if (interaction.isModalSubmit() && interaction.customId === "close_reason_modal") {

        const reason = interaction.fields.getTextInputValue("close_reason_input");

        const ticketChannel = interaction.channel;

        const ticketOwnerId = ticketChannel.name.split("ticket-")[1];
        const ticketOwner = await guild.members.fetch(ticketOwnerId).catch(() => null);

        // 📬 DM DO UŻYTKOWNIKA
        if (ticketOwner) {
            ticketOwner.send({
                embeds: [{
                    color: 0xE74C3C,
                    title: "🔒 Twój ticket został zamknięty",
                    description:
                        `Serwer: **${guild.name}**\n` +
                        `Zamknięty przez: ${user}\n\n` +
                        `📌 Powód:\n${reason}`,
                    timestamp: new Date()
                }]
            }).catch(() => {});
        }

        // 📜 LOG
        const logChannel = guild.channels.cache.get(logChannelId);

        if (logChannel) {
            logChannel.send({
                embeds: [{
                    color: 0xE74C3C,
                    title: "🔒 Ticket Zamknięty",
                    description:
                        `Ticket: ${ticketChannel.name}\n` +
                        `Zamknięty przez: ${user}\n\n` +
                        `Powód:\n${reason}`,
                    timestamp: new Date()
                }]
            });
        }

        await interaction.reply({
            content: "🔒 Ticket zostanie usunięty za 3 sekundy...",
            ephemeral: true
        });

        setTimeout(() => {
            ticketChannel.delete().catch(() => {});
        }, 3000);
    }

    // 🛑 RESZTA SYSTEMU (TWORZENIE TICKETÓW)

    if (!interaction.isButton()) return;

    const customId = interaction.customId;

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

    const channel = await guild.channels.create({
        name: `ticket-${user.id}`,
        type: 0,
        parent: ticketCategoryId,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: ["ViewChannel"]
            },
            {
                id: user.id,
                allow: ["ViewChannel", "SendMessages"]
            },
            {
                id: staffRoleId,
                allow: ["ViewChannel", "SendMessages"]
            }
        ]
    });

    await channel.send({
        content: `${user} <@&${staffRoleId}>`,
        embeds: [{
            color: 0x2B2D31,
            title: "📩 Nowy Ticket • TemuShop",
            description:
                `Witaj ${user}\n\n` +
                `Typ: **${customId}**\n\n` +
                `${descriptionText}`,
            timestamp: new Date()
        }],
        components: [{
            type: 1,
            components: [{
                type: 2,
                label: "🔒 Zamknij Ticket",
                style: 4,
                custom_id: "close_ticket"
            }]
        }]
    });

    await interaction.reply({
        content: `✅ Ticket utworzony: ${channel}`,
        ephemeral: true
    });
});