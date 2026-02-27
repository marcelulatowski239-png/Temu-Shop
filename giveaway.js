const { 
    EmbedBuilder, 
    PermissionsBitField, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder 
} = require("discord.js");

const ms = require("ms");

module.exports = (client) => {
    const PREFIX = "!"; // zmień jeśli masz inny prefix

    // Przechowywanie aktywnych giveawayów
    const giveaways = new Map();

    client.on("messageCreate", async (message) => {
        if (!message.guild) return;
        if (message.author.bot) return;

        if (!message.content.startsWith(PREFIX + "giveaway")) return;

        // Tylko administrator
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Nie masz permisji do tej komendy!");
        }

        // Format: !giveaway 1m | Nitro
        const args = message.content
            .slice((PREFIX + "giveaway").length)
            .trim()
            .split("|");

        const timeArg = args[0]?.trim();
        const prize = args[1]?.trim();

        if (!timeArg || !prize) {
            return message.reply(
                "❌ Poprawne użycie:\n`!giveaway 1m | Nagroda`\nPrzykład: `!giveaway 5m | Discord Nitro`"
            );
        }

        const duration = ms(timeArg);

        if (!duration) {
            return message.reply("❌ Podaj poprawny czas np: 10s, 1m, 5m, 1h");
        }

        const endTime = Date.now() + duration;

        const joinButton = new ButtonBuilder()
            .setCustomId("join_giveaway")
            .setLabel("🎉 Weź udział")
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(joinButton);

        const embed = new EmbedBuilder()
            .setTitle("🎉 NOWY GIVEAWAY!")
            .setDescription(
                `🎁 **Nagroda:** ${prize}\n` +
                `👑 **Host:** ${message.author}\n\n` +
                `Kliknij przycisk aby wziąć udział!\n` +
                `⏳ Koniec: <t:${Math.floor(endTime / 1000)}:R>`
            )
            .setColor("Gold")
            .setFooter({ text: "Powodzenia wszystkim!" })
            .setTimestamp();

        const giveawayMessage = await message.channel.send({
            embeds: [embed],
            components: [row],
        });

        giveaways.set(giveawayMessage.id, {
            prize,
            endTime,
            participants: new Set(),
            channelId: message.channel.id,
        });

        message.reply("✅ Giveaway został utworzony!");

        // Zakończenie giveaway
        setTimeout(async () => {
            const data = giveaways.get(giveawayMessage.id);
            if (!data) return;

            const participants = Array.from(data.participants);

            if (participants.length === 0) {
                return message.channel.send(
                    "❌ Giveaway zakończony! Nikt nie wziął udziału."
                );
            }

            const winner =
                participants[Math.floor(Math.random() * participants.length)];

            const endEmbed = new EmbedBuilder()
                .setTitle("🎉 GIVEAWAY ZAKOŃCZONY!")
                .setDescription(
                    `🎁 Nagroda: **${data.prize}**\n` +
                    `🏆 Zwycięzca: <@${winner}>`
                )
                .setColor("Green")
                .setTimestamp();

            await message.channel.send({ embeds: [endEmbed] });
            giveaways.delete(giveawayMessage.id);
        }, duration);
    });

    // Obsługa kliknięcia przycisku
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "join_giveaway") return;

        const giveaway = giveaways.get(interaction.message.id);

        if (!giveaway) {
            return interaction.reply({
                content: "❌ Ten giveaway już się zakończył!",
                ephemeral: true,
            });
        }

        giveaway.participants.add(interaction.user.id);

        await interaction.reply({
            content: "🎉 Zostałeś zapisany do giveaway!",
            ephemeral: true,
        });
    });
};