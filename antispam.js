const { PermissionsBitField } = require("discord.js");

module.exports = (client) => {

    const userMessages = new Map();

    const MESSAGE_LIMIT = 5; // ile wiadomości
    const TIME_LIMIT = 5000; // czas w ms (5 sekund)
    const MUTE_TIME = 10 * 60 * 1000; // 10 minut

    client.on("messageCreate", async (message) => {
        if (!message.guild) return;
        if (message.author.bot) return;

        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const userId = message.author.id;
        const now = Date.now();

        if (!userMessages.has(userId)) {
            userMessages.set(userId, []);
        }

        const timestamps = userMessages.get(userId);

        timestamps.push(now);

        // usuwamy stare wiadomości spoza limitu czasu
        const filtered = timestamps.filter(time => now - time < TIME_LIMIT);
        userMessages.set(userId, filtered);

        if (filtered.length >= MESSAGE_LIMIT) {

            userMessages.delete(userId);

            try {
                // usuń ostatnie wiadomości użytkownika
                const messages = await message.channel.messages.fetch({ limit: 20 });
                const userSpam = messages.filter(m => m.author.id === userId);

                await message.channel.bulkDelete(userSpam, true);

                await message.member.timeout(MUTE_TIME, "Spamowanie (AntiSpam)");

                message.channel.send(
                    `🔇 ${message.author} został wyciszony na 10 minut za spam.`
                );

            } catch (err) {
                console.log("Błąd AntiSpam:", err);
            }
        }
    });

};