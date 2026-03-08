const { EmbedBuilder } = require('discord.js');

// Pamięć zaproszeń do resetowania (tylko dla tego procesu bota)
const invitesResetMemory = new Map();

module.exports = {
    name: 'invites',
    description: 'Sprawdza lub resetuje zaproszenia użytkownika',

    async execute(message, args) {
        try {
            const targetMember = message.mentions.members?.first() || message.member;

            // Sprawdzenie czy chcemy resetować
            if (args[0] && args[0].toLowerCase() === 'reset') {
                // Tylko właściciel lub admin
                if (!message.member.permissions.has('Administrator')) {
                    return message.reply('❌ Nie masz permisji do resetowania zaproszeń.');
                }

                invitesResetMemory.set(targetMember.id, 0);
                return message.reply(`♻️ Liczba zaproszeń użytkownika ${targetMember} została zresetowana.`);
            }

            // Pobranie wszystkich zaproszeń serwera
            const allInvites = await message.guild.invites.fetch();

            // Filtrujemy zaproszenia utworzone przez targetMember
            const userInvites = allInvites.filter(i => i.inviter && i.inviter.id === targetMember.id);

            let inviteCount = 0;
            userInvites.forEach(invite => {
                inviteCount += invite.uses;
            });

            // Uwzględniamy resetowaną wartość, jeśli jest w pamięci
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
    }
};