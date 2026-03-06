module.exports = (client) => {
    client.on("guildMemberAdd", async (member) => {

        const roleId = "1473027948553568266";

        try {
            const role = member.guild.roles.cache.get(roleId);
            if (!role) return;

            await member.roles.add(role);
            console.log(`Nadano rolę ${role.name} użytkownikowi ${member.user.tag}`);

        } catch (err) {
            console.error("Błąd przy nadawaniu roli:", err);
        }

    });
};