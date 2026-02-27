const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} = require("discord.js");

module.exports = (client) => {

    // ====== USTAWIENIA ======
    const VERIFIED_ROLE = "Sigiemka";
    const UNVERIFIED_ROLE = "Niezweryfikowany";
    const VERIFY_CHANNEL_NAME = "╭・《✅》ᴡᴇʀʏꜰɪᴋᴀᴄᴊᴀ";

    // ====== AUTO ROLA PO WEJŚCIU ======
    client.on("guildMemberAdd", async (member) => {
        const role = member.guild.roles.cache.find(r => r.name === UNVERIFIED_ROLE);
        if (!role) return;

        try {
            await member.roles.add(role);
        } catch (err) {
            console.log("Błąd nadawania roli:", err);
        }
    });

    // ====== KOMENDA PANELU ======
    client.on("messageCreate", async (message) => {
        if (!message.guild || message.author.bot) return;

        if (message.content === "!panel-weryfikacja") {

            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.reply("❌ Tylko administrator może użyć tej komendy.");
            }

            const embed = new EmbedBuilder()
                .setTitle("🛡️ Weryfikacja Serwera")
                .setDescription(
                    "### Witaj na serwerze!\n\n" +
                    "Aby uzyskać dostęp do wszystkich kanałów:\n" +
                    "1️⃣ Przeczytaj regulamin\n" +
                    "2️⃣ Kliknij przycisk poniżej\n\n" +
                    "Po weryfikacji odblokują się wszystkie kanały 🔓"
                )
                .setColor("#5865F2")
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setFooter({ text: "System Weryfikacji • Bezpieczny" })
                .setTimestamp();

            const button = new ButtonBuilder()
                .setCustomId("verify_button")
                .setLabel("Zweryfikuj się")
                .setStyle(ButtonStyle.Success)
                .setEmoji("✅");

            const row = new ActionRowBuilder().addComponents(button);

            await message.channel.send({
                embeds: [embed],
                components: [row]
            });
        }
    });

    // ====== OBSŁUGA PRZYCISKU ======
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "verify_button") return;

        const member = interaction.member;
        const guild = interaction.guild;

        const verifiedRole = guild.roles.cache.find(r => r.name === VERIFIED_ROLE);
        const unverifiedRole = guild.roles.cache.find(r => r.name === UNVERIFIED_ROLE);

        if (!verifiedRole) {
            return interaction.reply({
                content: "❌ Brak roli 'Zweryfikowany' na serwerze.",
                ephemeral: true
            });
        }

        if (member.roles.cache.has(verifiedRole.id)) {
            return interaction.reply({
                content: "⚠️ Jesteś już zweryfikowany!",
                ephemeral: true
            });
        }

        try {
            // usuń rolę niezweryfikowany
            if (unverifiedRole && member.roles.cache.has(unverifiedRole.id)) {
                await member.roles.remove(unverifiedRole);
            }

            // dodaj rolę zweryfikowany
            await member.roles.add(verifiedRole);

            const successEmbed = new EmbedBuilder()
                .setTitle("🎉 Weryfikacja zakończona!")
                .setDescription(
                    "Zostałeś pomyślnie zweryfikowany.\n" +
                    "Masz teraz dostęp do wszystkich kanałów 🚀"
                )
                .setColor("#57F287")
                .setTimestamp();

            await interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });

        } catch (err) {
            console.log(err);
            interaction.reply({
                content: "❌ Błąd podczas weryfikacji.",
                ephemeral: true
            });
        }
    });

};