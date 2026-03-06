const { PermissionsBitField } = require("discord.js");

module.exports = (client) => {

const muteTime = 60 * 60 * 1000; // 1 godzina
const muteRoleName = "Mute";

client.on("messageCreate", async (message) => {

if (!message.guild) return;
if (message.author.bot) return;

// admin bypass
if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

const content = message.content.toLowerCase();

// słowa kluczowe NSFW
const nsfwWords = [
"porn",
"sex",
"hentai",
"rule34",
"nsfw",
"xvideos",
"pornhub",
"xnxx",
"hentaigif",
"sexgif"
];

const gifRegex = /(https?:\/\/.*\.(?:gif))/i;

const isGif = gifRegex.test(content);

const containsNSFW = nsfwWords.some(word => content.includes(word));

if (isGif && containsNSFW) {

await message.delete().catch(() => {});

const muteRole = message.guild.roles.cache.find(r => r.name === muteRoleName);

if (!muteRole) return;

await message.member.roles.add(muteRole);

message.channel.send(
`🚫 ${message.author} wysłał niedozwolony GIF NSFW i został wyciszony na 1 godzinę.`
);

setTimeout(async () => {

if (message.member.roles.cache.has(muteRole.id)) {

await message.member.roles.remove(muteRole);

message.channel.send(
`🔊 ${message.author} został odciszony.`
);

}

}, muteTime);

}

});

};