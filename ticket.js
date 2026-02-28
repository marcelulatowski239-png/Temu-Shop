const {
    Client,
    GatewayIntentBits,
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

const config = require("./config");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const {
    prefix,
    ticketCategoryId,
    staffRoleId,
    logChannelId,
    sellers
} = config;

client.once("ready", () => {
    console.log(`Zalogowano jako ${client.user.tag}`);
});


// ================= PANEL =================
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
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("zakup").setLabel("🛒 Zakup").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("skup").setLabel("💰 Skup").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("pomoc").setLabel("🆘 Pomoc").setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId("mm").setLabel("🤝 MM").setStyle(ButtonStyle.Danger)
        );

        message.channel.send({ embeds: [embed], components: [row] });
    }
});


// ================= INTERAKCJE =================
client.on("interactionCreate", async (interaction) => {

    if (!interaction.guild) return;

    // ===== WYBÓR SPRZEDAWCY =====
    if (interaction.isButton() && interaction.customId === "zakup") {

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("zakup_marcel").setLabel("marcelpro1").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("zakup_pingwin").setLabel("Pingwin5774").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("zakup_keksiak").setLabel("keksiak2115_").setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({
            content: "🛒 Wybierz sprzedawcę:",
            components: [row],
            ephemeral: true
        });
    }

    // ===== BLOKADA 1 TICKET =====
    const existing = interaction.guild.channels.cache.find(c =>
        c.name.endsWith(interaction.user.id)
    );

    if (existing &&
        interaction.isButton() &&
        !interaction.customId.startsWith("close")
    ) {
        return interaction.reply({
            content: "❌ Masz już otwarty ticket!",
            ephemeral: true
        });
    }

    // ===== TWORZENIE ZAKUP =====
    if (interaction.isButton() && interaction.customId.startsWith("zakup_")) {

        await interaction.deferReply({ ephemeral: true });

        let sellerName = "";
        let sellerId = "";

        if (interaction.customId === "zakup_marcel") {
            sellerName = "marcelpro1";
            sellerId = sellers.marcel;
        }
        if (interaction.customId === "zakup_pingwin") {
            sellerName = "Pingwin5774";
            sellerId = sellers.pingwin;
        }
        if (interaction.customId === "zakup_keksiak") {
            sellerName = "keksiak2115_";
            sellerId = sellers.keksiak;
        }

        const channel = await interaction.guild.channels.create({
            name: `zakup-${sellerName}-${interaction.user.id}`,
            type: ChannelType.GuildText,
            parent: ticketCategoryId,
            permissionOverwrites: [
                { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: sellerId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: sellers.marcel, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle("🛒 Ticket Zakup")
            .setDescription(
                `👤 Klient: ${interaction.user}\n` +
                `🛍 Sprzedawca: **${sellerName}**\n\n` +
                `Opisz co chcesz kupić.`
            )
            .setTimestamp();

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("🔒 Zamknij Ticket")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `${interaction.user} <@${sellerId}>`,
            embeds: [embed],
            components: [closeRow]
        });

        return interaction.editReply({
            content: `✅ Ticket utworzony: ${channel}`
        });
    }

    // ===== SKUP / POMOC / MM =====
    if (interaction.isButton() && ["skup", "pomoc", "mm"].includes(interaction.customId)) {

        await interaction.deferReply({ ephemeral: true });

        const channel = await interaction.guild.channels.create({
            name: `${interaction.customId}-${interaction.user.id}`,
            type: ChannelType.GuildText,
            parent: ticketCategoryId,
            permissionOverwrites: [
                { id: interaction.guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: staffRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                { id: sellers.marcel, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
            ]
        });

        const embed = new EmbedBuilder()
            .setColor("#2B2D31")
            .setTitle(`📩 Ticket ${interaction.customId}`)
            .setDescription(`Witaj ${interaction.user}\n\nOpisz swoją sprawę.`)
            .setTimestamp();

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("🔒 Zamknij Ticket")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `${interaction.user} <@&${staffRoleId}>`,
            embeds: [embed],
            components: [closeRow]
        });

        return interaction.editReply({
            content: `✅ Ticket utworzony: ${channel}`
        });
    }

    // ===== ZAMYKANIE =====
    if (interaction.isButton() && interaction.customId === "close_ticket") {

        const modal = new ModalBuilder()
            .setCustomId("close_reason_modal")
            .setTitle("Powód zamknięcia");

        const input = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Podaj powód zamknięcia")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        return interaction.showModal(modal);
    }

    // ===== PO MODALU =====
    if (interaction.isModalSubmit() && interaction.customId === "close_reason_modal") {

        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.fields.getTextInputValue("reason");
        const channel = interaction.channel;

        const userId = channel.name.split("-").pop();
        const ticketOwner = await client.users.fetch(userId).catch(() => null);

        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        if (logChannel) {
            await logChannel.send(
                `🔒 Ticket ${channel.name} zamknięty przez ${interaction.user}\n📝 Powód: ${reason}`
            );
        }

        if (ticketOwner) {
            await ticketOwner.send(
                `🔒 Twój ticket został zamknięty.\n📝 Powód: ${reason}`
            ).catch(() => {});
        }

        await interaction.editReply("🔒 Ticket zamyka się za 3 sekundy...");

        setTimeout(() => {
            channel.delete().catch(() => {});
        }, 3000);
    }

});

client.login(config.token);