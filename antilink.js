const { PermissionsBitField } = require("discord.js");

module.exports = (client) => {

    const linkWarnings = new Map(); // przechowuje ostrzeżenia

    client.on("messageCreate", async (message) => {
        if (!message.guild) return;
        if (message.author.bot) return;

        // Pomija administratorów
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const linkRegex = /(https?:\/\/|www\.|discord\.gg\/)/i;

        if (linkRegex.test(message.content)) {

            await message.delete().catch(() => {});

            const userId = message.author.id;
            const warnings = linkWarnings.get(userId) || 0;

            linkWarnings.set(userId, warnings + 1);

            // Jeśli 2 ostrzeżenia → mute 1 dzień
            if (warnings + 1 >= 2) {

                linkWarnings.delete(userId);

                try {
                    await message.member.timeout(24 * 60 * 60 * 1000, "2x wysłanie linku (AntyLink)");

                    message.channel.send(
                        `🔇 ${message.author} otrzymał mute na 1 dzień za 2x wysłanie linku.`
                    );

                } catch (err) {
                    console.log("Brak uprawnień do nadania mute.");
                }

            } else {

                message.channel.send(
                    `⚠️ ${message.author}, wysyłanie linków jest zabronione! (1/2)`
                );

            }
        }
    });

};