const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = (client) => {

    client.on("ready", async () => {
        const guild = client.guilds.cache.first();
        if (!guild) return;

        await guild.members.fetch();
        const members = guild.members.cache;

        const users = members.filter(m => !m.user.bot).size;
        const bots = members.filter(m => m.user.bot).size;
        const boosts = guild.premiumSubscriptionCount;

        let userChannel = guild.channels.cache.find(c => c.name.startsWith("👥 Osoby:"));
        let botChannel = guild.channels.cache.find(c => c.name.startsWith("🤖 Boty:"));
        let boostChannel = guild.channels.cache.find(c => c.name.startsWith("🚀 Boosty:"));

        if (!userChannel) {
            userChannel = await guild.channels.create({
                name: `👥 Osoby: ${users}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.Connect]
                }]
            });
        }

        if (!botChannel) {
            botChannel = await guild.channels.create({
                name: `🤖 Boty: ${bots}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.Connect]
                }]
            });
        }

        if (!boostChannel) {
            boostChannel = await guild.channels.create({
                name: `🚀 Boosty: ${boosts}`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [{
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.Connect]
                }]
            });
        }
    });

    client.on("guildMemberAdd", updateStats);
    client.on("guildMemberRemove", updateStats);
    client.on("guildUpdate", updateBoosts);

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

    async function updateBoosts(oldGuild, newGuild) {
        if (oldGuild.premiumSubscriptionCount === newGuild.premiumSubscriptionCount) return;

        const boostChannel = newGuild.channels.cache.find(c => c.name.startsWith("🚀 Boosty:"));
        if (boostChannel) {
            boostChannel.setName(`🚀 Boosty: ${newGuild.premiumSubscriptionCount}`);
        }
    }

};