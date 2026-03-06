const {
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField,
SlashCommandBuilder
} = require("discord.js");

const config = require("./config");

module.exports = (client) => {

client.once("ready", async () => {

const command = new SlashCommandBuilder()
.setName("ticket")
.setDescription("System ticketów")
.addSubcommand(sub =>
sub
.setName("create")
.setDescription("stwórz panel ticketów")
);

await client.application.commands.create(command);

});

client.on("interactionCreate", async (interaction) => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "ticket") {

if (interaction.options.getSubcommand() === "create") {

const embed = new EmbedBuilder()
.setColor("#2B2D31")
.setTitle("🎫 System Ticketów")
.setDescription("Wybierz kategorię aby otworzyć ticket");

const menu = new StringSelectMenuBuilder()
.setCustomId("ticket_select")
.setPlaceholder("📩 Wybierz kategorię")
.addOptions([
{
label: "Złóż zamówienie",
description: "Kup coś w naszym sklepie",
emoji: "❤️",
value: "zakup"
},
{
label: "Pomoc",
description: "Potrzebujesz pomocy",
emoji: "🆘",
value: "pomoc"
}
]);

const row = new ActionRowBuilder().addComponents(menu);

interaction.reply({
embeds: [embed],
components: [row]
});

}

}

}

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "ticket_select") {

const choice = interaction.values[0];

if (choice === "zakup") {

const menu = new StringSelectMenuBuilder()
.setCustomId("seller_select")
.setPlaceholder("🛒 Wybierz sprzedawcę")
.addOptions([
{
label: config.sellers.marcel.name,
value: "marcel"
},
{
label: config.sellers.pingwin.name,
value: "pingwin"
},
{
label: config.sellers.keksiak.name,
value: "keksiak"
}
]);

const row = new ActionRowBuilder().addComponents(menu);

interaction.reply({
content: "Wybierz sprzedawcę",
components: [row],
ephemeral: true
});

}

}

}

if (interaction.isStringSelectMenu()) {

if (interaction.customId === "seller_select") {

const sellerKey = interaction.values[0];
const seller = config.sellers[sellerKey];

const guild = interaction.guild;
const user = interaction.user;

const existing = guild.channels.cache.find(c => c.name.includes(user.id));

if (existing) {

return interaction.reply({
content: "Masz już otwarty ticket",
ephemeral: true
});

}

const channel = await guild.channels.create({

name: `ticket-${sellerKey}-${user.username}`,

type: ChannelType.GuildText,

parent: config.ticketCategoryId,

permissionOverwrites: [

{
id: guild.roles.everyone,
deny: [PermissionsBitField.Flags.ViewChannel]
},

{
id: user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id: seller.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id: config.ownerId,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}

]

});

const embed = new EmbedBuilder()
.setColor("#2B2D31")
.setTitle("🎫 Ticket")
.setDescription(`Witaj ${user}\nSprzedawca: <@${seller.id}>`)
.setTimestamp();

const closeButton = new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("Zamknij Ticket")
.setStyle(ButtonStyle.Danger);

const row = new ActionRowBuilder().addComponents(closeButton);

await channel.send({
content: `${user} <@${seller.id}>`,
embeds: [embed],
components: [row]
});

interaction.reply({
content: `Ticket utworzony: ${channel}`,
ephemeral: true
});

}

}

if (interaction.isButton()) {

if (interaction.customId === "close_ticket") {

interaction.channel.delete();

}

}

});

};