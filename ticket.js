const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionsBitField,
    EmbedBuilder
} = require("discord.js");

const TICKET_CATEGORY_ID = "1475471754221850857";
const STAFF_ROLE_ID = "1472956273854255331";

module.exports = (client) => {

    client.on("messageCreate", async (message) => {
        if (!message.content.startsWith("!tickety")) return;
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle("🎫 System Ticketów")
            .setDescription(
                "Wybierz rodzaj ticketa:\n\n" +
                "🛒 Zakup\n" +
                "💰 Skup\n" +
                "🆘 Pomoc\n" +
                "🔒 MM"
            )
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

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        const types = {
            ticket_zakup: "zakup",
            ticket_skup: "skup",
            ticket_pomoc: "pomoc",
            ticket_mm: "mm"
        };

        if (!types[interaction.customId]) return;

        const ticketType = types[interaction.customId];
        const channelName = `ticket-${ticketType}-${interaction.user.username}`;

        const existing = interaction.guild.channels.cache.find(
            c => c.name === channelName
        );

        if (existing) {
            return interaction.reply({
                content: "❌ Masz już otwarty ticket!",
                ephemeral: true
            });
        }

        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: TICKET_CATEGORY_ID,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
                {
                    id: STAFF_ROLE_ID,
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.ReadMessageHistory,
                    ],
                },
            ],
        });

        const embed = new EmbedBuilder()
            .setTitle(`🎫 Ticket: ${ticketType}`)
            .setDescription(
                `Witaj ${interaction.user}!\n\n` +
                "Opisz swój problem, a administracja zaraz pomoże."
            )
            .setColor("Green");

        const closeRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("close_ticket")
                .setLabel("🔒 Zamknij ticket")
                .setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `<@${interaction.user.id}> <@&${STAFF_ROLE_ID}>`,
            embeds: [embed],
            components: [closeRow]
        });

        interaction.reply({
            content: `✅ Ticket utworzony: ${channel}`,
            ephemeral: true
        });
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "close_ticket") return;

        if (!interaction.member.roles.cache.has(STAFF_ROLE_ID) &&
            !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "❌ Nie masz uprawnień do zamknięcia ticketa!",
                ephemeral: true
            });
        }

        await interaction.reply("🔒 Ticket zostanie zamknięty za 5 sekund...");
        setTimeout(() => {
            interaction.channel.delete().catch(() => {});
        }, 5000);
    });

};