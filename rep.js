const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {

    const PREFIX = "+";
    const REP_CHANNEL_ID = "1475576614216536085";
    const DATA_FILE = path.join(__dirname, "repData.json");


    function getData() {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify({ total: 0 }, null, 2));
        }
        return JSON.parse(fs.readFileSync(DATA_FILE));
    }

    function saveData(data) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    }

    client.on("messageCreate", async (message) => {
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();


        if (cmd === "rep") {
            const user = message.mentions.users.first();
            const produkt = args[1];
            const cena = args[2];
            const metoda = args.slice(3).join(" ");

            if (!user || !produkt || !cena || !metoda) {
                return message.reply(
                    "❌ Użycie: +rep @nick [produkt] [cena] [metoda]\nPrzykład: +rep @user Netflix 20zł BLIK"
                );
            }

            const data = getData();
            data.total += 1;
            saveData(data);

            const embed = new EmbedBuilder()
                .setTitle("✅ Nowa Legitka!")
                .setColor("#00ff88")
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: "👤 Klient", value: `${user}`, inline: true },
                    { name: "🛒 Produkt", value: `${produkt}`, inline: true },
                    { name: "💰 Cena", value: `${cena}`, inline: true },
                    { name: "💳 Metoda Płatności", value: `${metoda}`, inline: true },
                    { name: "📊 Liczba Legitek", value: `\`${data.total}\``, inline: false }
                )
                .setFooter({ text: `System legitek • ${message.guild.name}` })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

            const channel = message.guild.channels.cache.get(REP_CHANNEL_ID);
            if (channel) {
                try {
                    await channel.setName(`legitki-zakup・${data.total}`);
                } catch (err) {
                    console.log("Brak permisji do zmiany nazwy kanału");
                }
            }
        }

        if (cmd === "reset") {
            if (!message.member.permissions.has("Administrator")) {
                return message.reply("❌ Tylko administrator może resetować legitki!");
            }

            const data = getData();
            data.total = 0;
            saveData(data);

            const channel = message.guild.channels.cache.get(REP_CHANNEL_ID);
            if (channel) {
                try {
                    await channel.setName(`legitki-zakup・0`);
                } catch (err) {
                    console.log("Brak permisji do zmiany nazwy kanału");
                }
            }

            return message.reply("🧹 Licznik legitek został zresetowany do 0!");
        }

        if (cmd === "setlegitki") {
            if (!message.member.permissions.has("Administrator")) {
                return message.reply("❌ Tylko administrator może ustawić licznik!");
            }

            const number = parseInt(args[0]);
            if (isNaN(number) || number < 0) {
                return message.reply("❌ Podaj poprawną liczbę!\nPrzykład: +setlegitki 25");
            }

            const data = getData();
            data.total = number;
            saveData(data);

            const channel = message.guild.channels.cache.get(REP_CHANNEL_ID);
            if (channel) {
                try {
                    await channel.setName(`legitki-zakup・${data.total}`);
                } catch (err) {
                    console.log("Brak permisji do zmiany nazwy kanału");
                }
            }

            return message.reply(`⚙️ Ustawiono licznik legitek na: ${number}`);
        }
    });
};