const { EmbedBuilder, AuditLogEvent } = require("discord.js");

module.exports = (client) => {

    const LOG_CHANNEL_ID = "1472956274973999213";

    function getLogChannel(guild) {
        return guild.channels.cache.get(LOG_CHANNEL_ID);
    }

    // 🗑 DELETE MESSAGE
    client.on("messageDelete", async (message) => {
        if (!message.guild || message.author?.bot) return;

        const log = getLogChannel(message.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🗑 Usunięta wiadomość")
            .addFields(
                { name: "Użytkownik", value: message.author.tag, inline: true },
                { name: "Kanał", value: `${message.channel}`, inline: true },
                { name: "Treść", value: message.content || "Brak treści" }
            )
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

    // ✏️ EDIT MESSAGE
    client.on("messageUpdate", async (oldMsg, newMsg) => {
        if (!newMsg.guild || newMsg.author?.bot) return;
        if (oldMsg.content === newMsg.content) return;

        const log = getLogChannel(newMsg.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("Yellow")
            .setTitle("✏️ Edytowana wiadomość")
            .addFields(
                { name: "Użytkownik", value: newMsg.author.tag, inline: true },
                { name: "Kanał", value: `${newMsg.channel}`, inline: true },
                { name: "Przed", value: oldMsg.content || "Brak treści" },
                { name: "Po", value: newMsg.content || "Brak treści" }
            )
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

    // ➕ JOIN
    client.on("guildMemberAdd", member => {
        const log = getLogChannel(member.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("➕ Nowy użytkownik")
            .setDescription(`${member.user.tag} dołączył na serwer`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

    // ➖ LEAVE
    client.on("guildMemberRemove", member => {
        const log = getLogChannel(member.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("➖ Użytkownik wyszedł")
            .setDescription(`${member.user.tag} opuścił serwer`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

    // 🔨 BAN
    client.on("guildBanAdd", async (ban) => {
        const log = getLogChannel(ban.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("DarkRed")
            .setTitle("🔨 Ban")
            .setDescription(`${ban.user.tag} został zbanowany`)
            .setThumbnail(ban.user.displayAvatarURL())
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

    // 🔓 UNBAN
    client.on("guildBanRemove", async (ban) => {
        const log = getLogChannel(ban.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("🔓 Unban")
            .setDescription(`${ban.user.tag} został odbanowany`)
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

    // 👮 ROLE UPDATE
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        const log = getLogChannel(newMember.guild);
        if (!log) return;

        // Nick change
        if (oldMember.nickname !== newMember.nickname) {
            const embed = new EmbedBuilder()
                .setColor("Blue")
                .setTitle("✏️ Zmiana nicku")
                .addFields(
                    { name: "Użytkownik", value: newMember.user.tag },
                    { name: "Stary nick", value: oldMember.nickname || "Brak" },
                    { name: "Nowy nick", value: newMember.nickname || "Brak" }
                )
                .setTimestamp();

            log.send({ embeds: [embed] });
        }

        // Role change
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        addedRoles.forEach(role => {
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle("➕ Nadano rolę")
                .setDescription(`${newMember.user.tag} otrzymał rolę ${role}`)
                .setTimestamp();
            log.send({ embeds: [embed] });
        });

        removedRoles.forEach(role => {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("➖ Usunięto rolę")
                .setDescription(`${newMember.user.tag} stracił rolę ${role}`)
                .setTimestamp();
            log.send({ embeds: [embed] });
        });
    });

    // 🗑 DELETE CHANNEL
    client.on("channelDelete", channel => {
        if (!channel.guild) return;

        const log = getLogChannel(channel.guild);
        if (!log) return;

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("🗑 Usunięto kanał")
            .setDescription(`Kanał **${channel.name}** został usunięty`)
            .setTimestamp();

        log.send({ embeds: [embed] });
    });

};