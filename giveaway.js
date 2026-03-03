const {
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require("discord.js");

const GIVEAWAY_CHANNEL_ID = "1472956274613157919";

const activeGiveaways = new Map();

const MIN_DURATION = 60 * 1000;
const MAX_DURATION = 10 * 24 * 60 * 60 * 1000;
const MAX_WINNERS = 50;

const timeUnits = {
  s: 1000,
  m: 60000,
  h: 3600000,
  d: 86400000
};

function parseArgs(args) {
  let duration = 0;
  let winners = null;
  let prize = [];

  for (const arg of args) {
    const timeMatch = arg.match(/^(\d+)(s|m|h|d)$/);
    if (timeMatch) {
      duration += parseInt(timeMatch[1]) * timeUnits[timeMatch[2]];
      continue;
    }

    if (!isNaN(arg) && winners === null) {
      winners = parseInt(arg);
      continue;
    }

    prize.push(arg);
  }

  return { duration, winners, prize: prize.join(" ") };
}

function pickRandom(arr, count) {
  const copy = [...arr];
  const winners = [];

  for (let i = 0; i < count && copy.length > 0; i++) {
    const index = Math.floor(Math.random() * copy.length);
    winners.push(copy[index]);
    copy.splice(index, 1);
  }

  return winners;
}

module.exports = (client) => {

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (cmd !== "giveaway") return;

    // 🔒 Tylko jeden kanał
    if (message.channel.id !== GIVEAWAY_CHANNEL_ID) {
      return message.reply("❌ Giveaway można tworzyć tylko w wyznaczonym kanale.");
    }

    // 🔒 Admin only
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ Tylko administrator może tworzyć giveaway.");
    }

    const { duration, winners, prize } = parseArgs(args);

    if (!duration || duration < MIN_DURATION || duration > MAX_DURATION)
      return message.reply("❌ Czas: 1 minuta – 10 dni.");

    if (!winners || winners < 1 || winners > MAX_WINNERS)
      return message.reply(`❌ Zwycięzcy: 1–${MAX_WINNERS}.`);

    if (!prize)
      return message.reply("❌ Podaj nagrodę.");

    const endTimestamp = Math.floor((Date.now() + duration) / 1000);

    const participants = new Set();

    const button = new ButtonBuilder()
      .setCustomId("join_giveaway")
      .setLabel("🎉 Dołącz (0)")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY 🎉")
      .setColor("#FFD700")
      .setDescription(
        `🎁 **Nagroda:** ${prize}\n` +
        `👑 **Zwycięzców:** ${winners}\n` +
        `⏳ **Koniec:** <t:${endTimestamp}:R>\n\n` +
        `Kliknij przycisk aby wziąć udział!`
      )
      .setFooter({ text: `Organizator: ${message.author.tag}` })
      .setTimestamp();

    const giveawayMessage = await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    activeGiveaways.set(giveawayMessage.id, {
      prize,
      winners,
      participants
    });

    const collector = giveawayMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: duration
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId !== "join_giveaway") return;

      if (participants.has(interaction.user.id)) {
        participants.delete(interaction.user.id);
        await interaction.reply({ content: "❌ Opuściłeś giveaway.", ephemeral: true });
      } else {
        participants.add(interaction.user.id);
        await interaction.reply({ content: "✅ Dołączyłeś!", ephemeral: true });
      }

      button.setLabel(`🎉 Dołącz (${participants.size})`);
      await giveawayMessage.edit({ components: [new ActionRowBuilder().addComponents(button)] });
    });

    collector.on("end", async () => {

      const users = Array.from(participants);

      if (users.length === 0) {
        await giveawayMessage.edit({ components: [] });
        return message.channel.send("❌ Giveaway zakończony — brak uczestników.");
      }

      const winnersList = pickRandom(users, winners)
        .map(id => `<@${id}>`);

      const endedEmbed = new EmbedBuilder()
        .setTitle("🎉 GIVEAWAY ZAKOŃCZONY 🎉")
        .setColor("Green")
        .setDescription(
          `🎁 **Nagroda:** ${prize}\n` +
          `👑 **Zwycięzcy:** ${winnersList.join(", ")}\n` +
          `👥 **Uczestników:** ${users.length}`
        )
        .setTimestamp();

      await giveawayMessage.edit({
        embeds: [endedEmbed],
        components: []
      });

      message.channel.send(
        `🎉 Gratulacje ${winnersList.join(", ")}!\nWygraliście **${prize}**!`
      );

      activeGiveaways.delete(giveawayMessage.id);
    });
  });

};