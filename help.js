const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: "Panel pomocy bota",

  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setAuthor({
        name: "TemuShop • Panel Pomocy",
        iconURL: client.user.displayAvatarURL()
      })
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(
        `📖 **Wszystkie Komendy Bota**\n\n` +
        `Witaj ${message.author} 👋\n` +
        `Oto lista wszystkich dostępnych komend na serwerze.\n\n` +
        `**Prefix:** \`!\``
      )
      .addFields(
        {
          name: "👤 Komendy użytkownika",
          value:
            "`!profil` — Pokazuje profil użytkownika\n" +
            "`!rep @user` — System reputacji\n" +
            "`!level` — Pokazuje poziom XP",
          inline: false,
        },
        {
          name: "🛠️ System serwera",
          value:
            "`!verify` — Weryfikacja użytkownika\n" +
            "`!ticket` — Tworzenie ticketa\n" +
            "`!rank` — Twój poziom\n" +
            "`!top` — Ranking leveli",
          inline: false,
        },
        {
          name: "🎉 Eventy i społeczność",
          value:
            "`!giveaway` — Tworzy giveaway\n" +
            "`!glosowanie` — Tworzy głosowanie\n" +
            "`!rep @user produkt cena metoda` — Opinie",
          inline: false,
        },
        {
          name: "🛡️ Moderacja",
          value:
            "`!kick @user` — Wyrzuca użytkownika\n" +
            "`!ban @user` — Banuje użytkownika\n" +
            "`!unban ID` — Odbanowuje\n" +
            "`!mute @user 10m` — Wycisza\n" +
            "`!unmute @user` — Odcisza\n" +
            "`!warn @user powód` — Ostrzeżenie\n" +
            "`!clear 10` — Czyści wiadomości",
          inline: false,
        },
        {
          name: "⚙️ Administracja",
          value:
            "`!ustawwelcome #kanał`\n" +
            "`!ustawleave #kanał`\n" +
            "`!ustawboost #kanał`\n" +
            "`!reset` — Restart bota",
          inline: false,
        },
        {
          name: "🤖 Informacje o bocie",
          value:
            `Nazwa: **${client.user.username}**\n` +
            `ID: \`${client.user.id}\`\n` +
            `Serwery: **${client.guilds.cache.size}**`,
          inline: false,
        }
      )
      .setFooter({
        text: `Wywołane przez ${message.author.tag}`,
        iconURL: message.author.displayAvatarURL()
      })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};