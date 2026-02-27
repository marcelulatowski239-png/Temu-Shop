const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = (client) => {

    client.on("ready", async () => {
        const guild = client.guilds.cache.first(); // jeśli bot jest na 1 serwerze

        if (!guild) return;

        await guild.members.fetch();
        const members = guild.members.cache;

        const users = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;

        // Sprawdza czy kanał już istnieje
        let userChannel = guild.channels.cache.find(c => c.name.startsWith("👥 Osoby:"));
        let botChannel = guild.channels.cache.find(c => c.name.startsWith("🤖 Boty:"));

        if (!userChannel) {
            userChannel = await guild.channels.create({
                name: `👥 Osoby: ${users}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.Connect]
                    }
                ]
            });
        }

        if (!botChannel) {
            botChannel = await guild.channels.create({
                name: `🤖 Boty: ${bots}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.Connect]
                    }
                ]
            });
        }
    });

    // Aktualizacja gdy ktoś wchodzi / wychodzi
    client.on("guildMemberAdd", updateStats);
    client.on("guildMemberRemove", updateStats);

    async function updateStats(member) {
        const guild = member.guild;

        await guild.members.fetch();
        const members = guild.members.cache;

        const users = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;

        const userChannel = guild.channels.cache.find(c => c.name.startsWith("👥 Osoby:"));
        const botChannel = guild.channels.cache.find(c => c.name.startsWith("🤖 Boty:"));

        if (userChannel) userChannel.setName(`👥 Osoby: ${users}`);
        if (botChannel) botChannel.setName(`🤖 Boty: ${bots}`);
    }

};