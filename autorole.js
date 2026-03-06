module.exports = (client) => {

client.on("guildMemberAdd", async (member) => {

try {

const giveRole = "1473027948553568266";
const removeRole = "1475491258289094759";

await member.roles.add(giveRole);
await member.roles.remove(removeRole);

console.log(`${member.user.tag} otrzymał rolę i usunięto starą`);

} catch (err) {
console.error("Autorole error:", err);
}

});

};