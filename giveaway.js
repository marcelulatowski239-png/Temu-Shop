const { 
  EmbedBuilder, 
  PermissionsBitField 
} = require("discord.js");

const MIN_DURATION = 60 * 1000; // 1 minuta
const MAX_DURATION = 10 * 24 * 60 * 60 * 1000; // 10 dni
const MAX_WINNERS = 50;

function parseDuration(args) {
  let total = 0;
  const units = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };

  for (const arg of args) {
    const match = arg.match(/^(\d+)(s|m|h|d)$/);
    if (!match) break;

    const value = parseInt(match[1]);
    const unit = match[2];

    total += value * units[unit];
  }

  return total;
}

function removeTimeArgs(args) {
  while (args.length && /^\d+(s|m|h|d)$/.test(args[0])) {
    args.shift();
  }
}

function pickWinners(collection, count) {
  const winners = [];
  const users = Array.from(collection.values());

  for (let i = 0; i < count && users.length > 0; i++) {
    const index = Math.floor(Math.random() * users.length);
    winners.push(users[index]);
    users.splice(index, 1);
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

    // 🔒 ADMIN ONLY
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ Tylko administrator może tworzyć giveaway.");
    }

    const duration = parseDuration(args);

    if (!duration || duration < MIN_DURATION || duration > MAX_DURATION) {
      return message.reply("❌ Czas musi być od 1 minuty do 10 dni.");
    }

    removeTimeArgs(args);

    const winnerCount = parseInt(args[0]);

    if (!winnerCount || winnerCount < 1 || winnerCount > MAX_WINNERS) {
      return message.reply(`❌ Liczba zwycięzców: 1–${MAX_WINNERS}.`);
    }

    args.shift();

    const prize = args.join(" ");
    if (!prize) {
      return message.reply("❌ Musisz podać nagrodę.");
    }

    const endTimestamp = Math.floor((Date.now() + duration) / 1000);

    const embed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY 🎉")
      .setColor("#FFD700")
      .setDescription(
        `🎁 **Nagroda:** ${prize}\n` +
        `👑 **Zwycięzców:** ${winnerCount}\n` +
        `⏳ **Koniec:** <t:${endTimestamp}:R>\n\n` +
        `Kliknij 🎉 aby wziąć udział!`
      )
      .setFooter({ text: `Organizator: ${message.author.tag}` })
      .setTimestamp();

    const giveawayMessage = await message.channel.send({ embeds: [embed] });
    await giveawayMessage.react("🎉");

    const timeout = setTimeout(async () => {

      try {
        const fetched = await message.channel.messages.fetch(giveawayMessage.id).catch(() => null);
        if (!fetched) return;

        const reaction = fetched.reactions.cache.get("🎉");
        if (!reaction) {
          return message.channel.send("❌ Giveaway zakończony — brak uczestników.");
        }

        const users = await reaction.users.fetch();
        const validUsers = users.filter(u => !u.bot);

        const participantCount = validUsers.size;

        if (participantCount === 0) {
          return message.channel.send("❌ Giveaway zakończony — nikt nie wziął udziału.");
        }

        const winners = pickWinners(validUsers, winnerCount);

        const endedEmbed = new EmbedBuilder()
          .setTitle("🎉 GIVEAWAY ZAKOŃCZONY 🎉")
          .setColor("#00FF7F")
          .setDescription(
            `🎁 **Nagroda:** ${prize}\n` +
            `👑 **Zwycięzcy:** ${winners.join(", ")}\n` +
            `👥 **Uczestników:** ${participantCount}`
          )
          .setFooter({ text: "Giveaway zakończony" })
          .setTimestamp();

        await fetched.edit({ embeds: [endedEmbed] });

        await message.channel.send(
          `🎉 Gratulacje ${winners.join(", ")}!\nWygraliście **${prize}**!`
        );

      } catch (err) {
        console.error("Giveaway error:", err);
      }

      clearTimeout(timeout);

    }, duration);
  });

};