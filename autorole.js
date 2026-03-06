module.exports = (client) => {
    client.on("guildMemberAdd", async (member) => {

        const giveRole = "1473027948553568266";
        const removeRole = "1475491258289094759";

        try {

            const roleToGive = member.guild.roles.cache.get(giveRole);
            const roleToRemove = member.guild.roles.cache.get(removeRole);

            if (roleToGive) {
                await member.roles.add(roleToGive);
                console.log(`Dodano rolę ${roleToGive.name} dla ${member.user.tag}`);
            }

            if (roleToRemove && member.roles.cache.has(removeRole)) {
                await member.roles.remove(roleToRemove);
                console.log(`Usunięto rolę ${roleToRemove.name} dla ${member.user.tag}`);
            }

        } catch (err) {
            console.error("Błąd autorole:", err);
        }

    });
};