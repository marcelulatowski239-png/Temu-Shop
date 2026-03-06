const { EmbedBuilder } = require("discord.js");

const config = {
  welcomeChannelId: "1472956273854255337",
  leaveChannelId: "1473339248739356837",
  boostChannelId: "1473344129936130180",
  boostRoleId: "1477026309543694336",
};

module.exports = (client) => {

////////////////////////////////////////////////////
//////////////////// WELCOME ///////////////////////
////////////////////////////////////////////////////

client.on("guildMemberAdd", async (member) => {

const channel = member.guild.channels.cache.get(config.welcomeChannelId);
if (!channel) return;

const user = await member.user.fetch(true);

const banner = user.bannerURL({ size: 1024 }) ||
"https://media.discordapp.net/attachments/1048655323357771826/1114980924234819664/welcome.gif";

const embed = new EmbedBuilder()

.setColor("#00d9ff")

.setAuthor({
name: `${user.tag}`,
iconURL: user.displayAvatarURL({ dynamic: true })
})

.setTitle("👋 Nowy użytkownik!")

.setDescription(
`🎉 **${member} dołączył do serwera!**

Witaj na **${member.guild.name}**  
Jesteś naszym **${member.guild.memberCount}** członkiem 🚀`
)

.addFields(

{
name: "🆔 ID użytkownika",
value: `${user.id}`,
inline: true
},

{
name: "📅 Konto utworzone",
value: `<t:${Math.floor(user.createdTimestamp/1000)}:R>`,
inline: true
},

{
name: "📥 Dołączył",
value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>`,
inline: false
}

)

.setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))

.setImage(banner)

.setFooter({
text: `Obecnie ${member.guild.memberCount} użytkowników`,
iconURL: member.guild.iconURL()
})

.setTimestamp();

channel.send({ embeds: [embed] });

});

////////////////////////////////////////////////////
//////////////////// BOOST /////////////////////////
////////////////////////////////////////////////////

client.on("guildMemberUpdate", async (oldMember, newMember) => {

if (!oldMember.premiumSince && newMember.premiumSince) {

const channel = newMember.guild.channels.cache.get(config.boostChannelId);
if (!channel) return;

const user = await newMember.user.fetch(true);

const banner = user.bannerURL({ size: 1024 }) ||
"https://media.discordapp.net/attachments/1048655323357771826/1114980924234819664/boost.gif";

if (config.boostRoleId) {
newMember.roles.add(config.boostRoleId).catch(() => {});
}

const embed = new EmbedBuilder()

.setColor("#ff4dfc")

.setAuthor({
name: `${user.tag}`,
iconURL: user.displayAvatarURL({ dynamic: true })
})

.setTitle("🚀 NOWY BOOST SERWERA!")

.setDescription(
`💜 **${newMember} właśnie zboostował serwer!**

Dziękujemy za wsparcie naszej społeczności! 🔥`
)

.addFields(

{
name: "👤 Booster",
value: `${newMember}`,
inline: true
},

{
name: "📅 Boost od",
value: `<t:${Math.floor(newMember.premiumSinceTimestamp/1000)}:F>`,
inline: true
}

)

.setThumbnail(user.displayAvatarURL({ dynamic: true }))

.setImage(banner)

.setFooter({
text: `Aktualny poziom boosta: ${newMember.guild.premiumTier}`,
iconURL: newMember.guild.iconURL()
})

.setTimestamp();

channel.send({ embeds: [embed] });

}

});

////////////////////////////////////////////////////
//////////////////// LEAVE /////////////////////////
////////////////////////////////////////////////////

client.on("guildMemberRemove", async (member) => {

const channel = member.guild.channels.cache.get(config.leaveChannelId);
if (!channel) return;

const user = await member.user.fetch(true);

const days = Math.floor(
(Date.now() - member.joinedTimestamp) / (1000 * 60 * 60 * 24)
);

const embed = new EmbedBuilder()

.setColor("#ff3b3b")

.setAuthor({
name: `${user.tag}`,
iconURL: user.displayAvatarURL({ dynamic: true })
})

.setTitle("😢 Użytkownik opuścił serwer")

.setDescription(
`🚪 **${member.user.tag}** opuścił serwer.

Spędził z nami **${days} dni**`
)

.addFields(

{
name: "🆔 ID",
value: `${user.id}`,
inline: true
},

{
name: "📥 Dołączył",
value: `<t:${Math.floor(member.joinedTimestamp/1000)}:F>`,
inline: true
}

)

.setThumbnail(user.displayAvatarURL({ dynamic: true }))

.setFooter({
text: `Pozostało ${member.guild.memberCount} członków`,
iconURL: member.guild.iconURL()
})

.setTimestamp();

channel.send({ embeds: [embed] });

});

};