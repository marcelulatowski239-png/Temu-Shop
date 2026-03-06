const {
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ButtonBuilder,
ButtonStyle,
ChannelType,
PermissionsBitField
} = require("discord.js");

const config = require("./config");

module.exports = (client) => {

const prefix = "!";

////////////////////////////////////////////////////
//////////////// PANEL TICKET //////////////////////
////////////////////////////////////////////////////

client.on("messageCreate", async message => {

if(message.author.bot) return;

if(!message.content.startsWith(prefix)) return;

const args = message.content.slice(prefix.length).split(" ");
const command = args.shift().toLowerCase();

if(command !== "ticket") return;

const embed = new EmbedBuilder()

.setColor("#2B2D31")
.setTitle("🎫 System Ticketów")
.setDescription("Wybierz kategorię aby otworzyć ticket")
.setFooter({text:"Ticket System"})
.setTimestamp();

const options = Object.entries(config.tickets).map(([key,data]) => ({

label: data.label,
description: data.description,
emoji: data.emoji,
value: key

}));

const menu = new StringSelectMenuBuilder()

.setCustomId("ticket_select")
.setPlaceholder("📩 Wybierz kategorię")
.addOptions(options);

const row = new ActionRowBuilder().addComponents(menu);

message.channel.send({

embeds:[embed],
components:[row]

});

});

////////////////////////////////////////////////////
////////////// TWORZENIE TICKETÓW //////////////////
////////////////////////////////////////////////////

client.on("interactionCreate", async interaction => {

if(!interaction.isStringSelectMenu()) return;

if(interaction.customId !== "ticket_select") return;

const ticketType = interaction.values[0];
const data = config.tickets[ticketType];

const guild = interaction.guild;
const user = interaction.user;

const existing = guild.channels.cache.find(c =>
c.name.includes(user.id)
);

if(existing){

return interaction.reply({

content:"Masz już otwarty ticket",
ephemeral:true

});

}

const channel = await guild.channels.create({

name:`ticket-${ticketType}-${user.username}`,

type:ChannelType.GuildText,

parent:data.categoryId,

permissionOverwrites:[

{
id:guild.roles.everyone,
deny:[PermissionsBitField.Flags.ViewChannel]
},

{
id:user.id,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id:data.staffId,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
},

{
id:config.ownerId,
allow:[
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}

]

});

const embed = new EmbedBuilder()

.setColor("#2B2D31")
.setTitle("🎫 Ticket utworzony")
.setDescription(`Witaj ${user}

Obsługa: <@${data.staffId}>

Opisz swój problem.`)
.setTimestamp();

const claimButton = new ButtonBuilder()

.setCustomId("claim_ticket")
.setLabel("Claim")
.setStyle(ButtonStyle.Success);

const closeButton = new ButtonBuilder()

.setCustomId("close_ticket")
.setLabel("Close")
.setStyle(ButtonStyle.Danger);

const deleteButton = new ButtonBuilder()

.setCustomId("delete_ticket")
.setLabel("Delete")
.setStyle(ButtonStyle.Secondary);

const row = new ActionRowBuilder()

.addComponents(claimButton,closeButton,deleteButton);

await channel.send({

content:`${user} <@${data.staffId}>`,
embeds:[embed],
components:[row]

});

interaction.reply({

content:`Ticket utworzony: ${channel}`,
ephemeral:true

});

});

////////////////////////////////////////////////////
//////////////////// CLAIM /////////////////////////
////////////////////////////////////////////////////

client.on("interactionCreate", async interaction => {

if(!interaction.isButton()) return;

if(interaction.customId !== "claim_ticket") return;

const embed = new EmbedBuilder()

.setColor("Green")
.setDescription(`Ticket przejęty przez ${interaction.user}`);

interaction.channel.send({

embeds:[embed]

});

interaction.reply({

content:"Claimowałeś ticket",
ephemeral:true

});

});

////////////////////////////////////////////////////
//////////////////// CLOSE /////////////////////////
////////////////////////////////////////////////////

client.on("interactionCreate", async interaction => {

if(!interaction.isButton()) return;

if(interaction.customId !== "close_ticket") return;

const embed = new EmbedBuilder()

.setColor("Red")
.setTitle("Ticket zamknięty")
.setDescription(`Ticket zamknięty przez ${interaction.user}

Usunięcie za 5 sekund`);

await interaction.channel.send({

embeds:[embed]

});

setTimeout(() => {

interaction.channel.delete();

},5000);

});

////////////////////////////////////////////////////
//////////////////// DELETE ////////////////////////
////////////////////////////////////////////////////

client.on("interactionCreate", async interaction => {

if(!interaction.isButton()) return;

if(interaction.customId !== "delete_ticket") return;

interaction.channel.delete();

});

////////////////////////////////////////////////////
//////////////////// LOGI //////////////////////////
////////////////////////////////////////////////////

client.on("channelDelete", async channel => {

if(!channel.name.startsWith("ticket")) return;

const logChannel = channel.guild.channels.cache.get(config.logChannelId);

if(!logChannel) return;

const embed = new EmbedBuilder()

.setColor("Orange")
.setTitle("Ticket usunięty")
.setDescription(`Kanał: ${channel.name}`)
.setTimestamp();

logChannel.send({

embeds:[embed]

});

});

};