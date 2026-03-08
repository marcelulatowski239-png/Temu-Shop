const {
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

// Pamięć aktywnych giveawayów w runtime
const activeGiveaways = new Map();

// Funkcja losująca
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

  // Zapisujemy każdy zakończony giveaway
  const endedGiveaways = new Map();

  // ====== Komenda reroll ======
  client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (!message.content.startsWith("!")) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (cmd === "reroll") {
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("❌ Tylko administrator może użyć rerolla.");
      }

      const giveawayId = args[0];
      if (!giveawayId) return message.reply("❌ Podaj ID wiadomości giveaway.");

      const giveaway = endedGiveaways.get(giveawayId);
      if (!giveaway) return message.reply("❌ Nie znaleziono giveaway o tym ID.");

      const { participants, winnersCount, prize } = giveaway;

      if (participants.size === 0) return message.reply("❌ Brak uczestników do rerolla.");

      const users = Array.from(participants);
      const newWinners = pickRandom(users, winnersCount);

      const winnerMentions = [];
      for (const winnerId of newWinners) {
        try {
          const user = await client.users.fetch(winnerId);
          winnerMentions.push(`<@${winnerId}>`);
          await user.send(`🎉 Wygrałeś giveaway reroll: **${prize}**!`);
        } catch {
          winnerMentions.push(`<@${winnerId}>`);
        }
      }

      message.channel.send(
        `🔁 Reroll zakończony! Nowi zwycięzcy: ${winnerMentions.join(", ")}\nNagroda: **${prize}**`
      );
    }
  });

  // ====== Rejestracja zakończonych giveawayów ======
  client.on("giveawayEnd", (data) => {
    // data = { messageId, participants: Set, winnersCount, prize }
    endedGiveaways.set(data.messageId, data);
  });

  // ====== Funkcja zakończenia giveaway (przykład) ======
  client.endGiveaway = async (message, participantsSet, winnersCount, prize) => {
    const users = Array.from(participantsSet);
    if (users.length === 0) {
      return message.channel.send("❌ Giveaway zakończony — brak uczestników.");
    }

    const winners = pickRandom(users, winnersCount);
    const winnerMentions = [];

    for (const winnerId of winners) {
      try {
        const user = await client.users.fetch(winnerId);
        winnerMentions.push(`<@${winnerId}>`);
        await user.send(`🎉 Wygrałeś giveaway: **${prize}**!`);
      } catch {
        winnerMentions.push(`<@${winnerId}>`);
      }
    }

    const endedEmbed = new EmbedBuilder()
      .setTitle("🎉 GIVEAWAY ZAKOŃCZONY 🎉")
      .setColor("Green")
      .setDescription(
        `🎁 Nagroda: ${prize}\n` +
        `👑 Zwycięzcy: ${winnerMentions.join(", ")}\n` +
        `👥 Uczestników: ${users.length}`
      )
      .setTimestamp();

    await message.edit({ embeds: [endedEmbed], components: [] });
    message.channel.send(`🎉 Gratulacje ${winnerMentions.join(", ")}!\nWygraliście **${prize}**!`);

    // zapis do rerolla
    endedGiveaways.set(message.id, {
      participants: participantsSet,
      winnersCount,
      prize,
    });
  };
};