const { EmbedBuilder } = require("discord.js");

const xp = new Map();
const cooldown = new Map();

module.exports = (client) => {

    client.on("messageCreate", async (message) => {
        if (!message.guild || message.author.bot) return;

        const userId = message.author.id;

        // =============================
        // 🎯 KOMENDA !rank
        // =============================
        if (message.content === "!rank") {

            const userData = xp.get(userId) || { xp: 0, level: 1 };

            const neededXP = userData.level * 100;
            const progress = Math.floor((userData.xp / neededXP) * 10);

            const bar =
                "▰".repeat(progress) +
                "▱".repeat(10 - progress);

            // sortowanie rankingu
            const sorted = [...xp.entries()]
                .sort((a, b) =>
                    b[1].level - a[1].level ||
                    b[1].xp - a[1].xp
                );

            const rankPosition =
                sorted.findIndex(([id]) => id === userId) + 1 || 1;

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `${message.author.username}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTitle("🏆 Statystyki poziomu")
                .setThumbnail(message.author.displayAvatarURL())
                .setColor("#5865F2")
                .addFields(
                    { name: "📊 Poziom", value: `**${userData.level}**`, inline: true },
                    { name: "⭐ XP", value: `**${userData.xp} / ${neededXP}**`, inline: true },
                    { name: "🏅 Miejsce", value: `**#${rankPosition}**`, inline: true },
                    { name: "📈 Postęp", value: `\`${bar}\`` }
                )
                .setFooter({ text: "System Leveli • Twój Bot" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        // =============================
        // 🏆 KOMENDA !top
        // =============================
        if (message.content === "!top") {

            if (xp.size === 0) {
                return message.channel.send("Brak danych rankingu 😢");
            }

            const sorted = [...xp.entries()]
                .sort((a, b) =>
                    b[1].level - a[1].level ||
                    b[1].xp - a[1].xp
                )
                .slice(0, 10);

            let description = "";

            for (let i = 0; i < sorted.length; i++) {
                const [id, data] = sorted[i];
                const user = await client.users.fetch(id).catch(() => null);
                if (!user) continue;

                const medal =
                    i === 0 ? "🥇" :
                    i === 1 ? "🥈" :
                    i === 2 ? "🥉" :
                    `**${i + 1}.**`;

                description += `${medal} ${user.username} — **Lvl ${data.level}** (${data.xp} XP)\n`;
            }

            const embed = new EmbedBuilder()
                .setTitle("🏆 TOP 10 Najlepszych Graczy")
                .setDescription(description)
                .setColor("Gold")
                .setFooter({ text: `Serwer: ${message.guild.name}` })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        // =============================
        // ❌ ignoruj inne komendy
        // =============================
        if (message.content.startsWith("!")) return;

        // =============================
        // 🎯 SYSTEM XP
        // =============================

        const now = Date.now();

        if (cooldown.has(userId)) {
            const expire = cooldown.get(userId) + 5000;
            if (now < expire) return;
        }

        cooldown.set(userId, now);

        const randomXP = Math.floor(Math.random() * 10) + 5;

        if (!xp.has(userId)) {
            xp.set(userId, { xp: 0, level: 1 });
        }

        const userData = xp.get(userId);
        userData.xp += randomXP;

        const neededXP = userData.level * 100;

        if (userData.xp >= neededXP) {
            userData.level++;
            userData.xp = 0;

            const embed = new EmbedBuilder()
                .setTitle("🎉 NOWY POZIOM!")
                .setDescription(`🔥 ${message.author} awansował na **Level ${userData.level}**!`)
                .setColor("Green")
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        }
    });

};