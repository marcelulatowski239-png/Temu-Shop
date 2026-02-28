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

const discordTranscripts = require("discord-html-transcripts");
const config = require("./config");

module.exports = (client) => {

    const { prefix, ticketCategoryId, staffRoleId, logChannelId, sellers } = config;

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

    // ================= INTERAKCJE =================
    client.on("interactionCreate", async (interaction) => {

        // ===== WYBÓR SPRZEDAWCY =====
        if (interaction.isButton() && interaction.customId === "zakup") {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("zakup_marcel")
                    .setLabel("marcelpro1")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("zakup_pingwin")
                    .setLabel("Pingwin5774")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("zakup_keksiak")
                    .setLabel("keksiak2115_")
                    .setStyle(ButtonStyle.Secondary)
            );

            return interaction.reply({
                content: "🛒 Wybierz sprzedawcę:",
                components: [row],
                ephemeral: true
            });
        }

        // ===== TWORZENIE ZAKUP =====
        if (interaction.isButton() && interaction.customId.startsWith("zakup_")) {

            const { guild, user } = interaction;

            const existing = guild.channels.cache.find(c => c.name.includes(user.id));
            if (existing) {
                return interaction.reply({
                    content: "❌ Masz już otwarty ticket!",
                    ephemeral: true
                });
            }

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

            const channel = await guild.channels.create({
                name: `zakup-${sellerName}-${user.id}`,
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
                        id: sellerId,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    },
                    {
                        id: sellers.marcel,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages
                        ]
                    }
                ]
            });

            const embed = new EmbedBuilder()
                .setColor("#2B2D31")
                .setTitle("🛒 Ticket Zakup")
                .setDescription(
                    `👤 Klient: ${user}\n` +
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
                content: `${user} <@${sellerId}>`,
                embeds: [embed],
                components: [closeRow]
            });

            return interaction.reply({
                content: `✅ Ticket utworzony: ${channel}`,
                ephemeral: true
            });
        }

        // ===== SKUP / POMOC / MM =====
        if (interaction.isButton() && ["skup","pomoc","mm"].includes(interaction.customId)) {

            const { guild, user, customId } = interaction;

            const existing = guild.channels.cache.find(c => c.name.includes(user.id));
            if (existing) {
                return interaction.reply({
                    content: "❌ Masz już otwarty ticket!",
                    ephemeral: true
                });
            }

            const channel = await guild.channels.create({
                name: `${customId}-${user.id}`,
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
                .setTitle(`📩 Ticket ${customId}`)
                .setDescription(`Witaj ${user}\n\nOpisz swoją sprawę.`)
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

            return interaction.reply({
                content: `✅ Ticket utworzony: ${channel}`,
                ephemeral: true
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

            const reason = interaction.fields.getTextInputValue("reason");
            const channel = interaction.channel;
            const guild = interaction.guild;

            const userId = channel.name.split("-").pop();
            const ticketOwner = await client.users.fetch(userId).catch(() => null);

            await interaction.reply({
                content: "📁 Tworzenie transcriptu...",
                ephemeral: true
            });

            const attachment = await discordTranscripts.createTranscript(channel, {
                limit: -1,
                returnType: 'attachment',
                filename: `${channel.name}.html`,
                poweredBy: false
            });

            const logChannel = guild.channels.cache.get(logChannelId);

            if (logChannel) {
                await logChannel.send({
                    content: `📁 Transcript z ${channel.name}\n🔒 Zamknięty przez: ${interaction.user}\n📝 Powód: ${reason}`,
                    files: [attachment]
                });
            }

            if (ticketOwner) {
                await ticketOwner.send({
                    content: `🔒 Twój ticket został zamknięty.\n📝 Powód: ${reason}`,
                    files: [attachment]
                }).catch(() => {});
            }

            setTimeout(() => {
                channel.delete().catch(() => {});
            }, 3000);
        }
    });
};