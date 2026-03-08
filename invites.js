const { EmbedBuilder } = require('discord.js');

// Pamięć resetu zaproszeń (tylko w pamięci, działa podczas działania bota)
const invitesResetMemory = new Map();

// Kanał, w którym zwykli użytkownicy mogą sprawdzać zaproszenia
const INVITES_CHANNEL_ID = 'TU_WSTAW_ID_KANAŁU'; // np. '123456789012345678'

module.exports = (client) => {
    client.on('messageCreate', async (message) => {
        if (!message.guild || message.author.bot) return;

        const prefix = '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();

        if (cmd !== 'invites') return;

        const targetMember = message.mentions.members?.first() || message.member;
        const isAdmin = message.member.permissions.has('Administrator');

        // Sprawdzenie kanału dla zwykłych użytkowników
        if (!isAdmin && message.channel.id !== INVITES_CHANNEL_ID) {
            return message.reply(`❌ Komenda !invites może być używana tylko w <#${INVITES_CHANNEL_ID}>`);
        }

        // ================= RESET =================
        if (args[0] && args[0].toLowerCase() === 'reset') {
            if (!isAdmin) {
                return message.reply('❌ Tylko administratorzy mogą resetować zaproszenia.');
            }
            invitesResetMemory.set(targetMember.id, 0);
            return message.reply(`♻️ Liczba zaproszeń użytkownika ${targetMember} została zresetowana.`);
        }

        // ================= POKAŻ ZAPROSZENIA =================
        try {
            const allInvites = await message.guild.invites.fetch();
            const userInvites = allInvites.filter(i => i.inviter && i.inviter.id === targetMember.id);

            let inviteCount = 0;
            userInvites.forEach(invite => inviteCount += invite.uses);

            // Uwzględniamy reset
            if (invitesResetMemory.has(targetMember.id)) {
                inviteCount = invitesResetMemory.get(targetMember.id);
            }

            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📨 Statystyki zaproszeń')
                .setThumbnail(targetMember.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Użytkownik', value: `${targetMember}`, inline: true },
                    { name: 'Zaproszenia', value: `**${inviteCount}**`, inline: true }
                )
                .setFooter({ text: `Sprawdzone przez ${message.author.username}` })
                .setTimestamp();

            message.reply({ embeds: [embed] });

        } catch (err) {
            console.error('Błąd komendy !invites:', err);
            message.reply('❌ Wystąpił błąd podczas pobierania zaproszeń.');
        }
    });
};