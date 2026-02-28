const { PermissionsBitField } = require("discord.js");

module.exports = (client) => {

    const userMessages = new Map();

    const MESSAGE_LIMIT = 5;
    const TIME_LIMIT = 10000; // 10 sekund
    const MUTE_TIME = 10 * 60 * 1000;

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

        // filtrujemy stare wiadomości
        const recentMessages = timestamps.filter(time => now - time <= TIME_LIMIT);
        userMessages.set(userId, recentMessages);

        if (recentMessages.length >= MESSAGE_LIMIT) {

            userMessages.delete(userId);

            try {
                await message.member.timeout(MUTE_TIME, "Spam (5 wiadomości w 5 sekund)");

                await message.channel.bulkDelete(5, true);

                message.channel.send(
                    `🔇 ${message.author} został wyciszony za spam (10 minut).`
                );

            } catch (err) {
                console.log("Błąd AntiSpam:", err);
            }
        }
    });

};