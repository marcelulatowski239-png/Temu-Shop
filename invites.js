const { EmbedBuilder } = require('discord.js');

// Pamięć do resetu zaproszeń (tylko w pamięci)
const invitesResetMemory = new Map();

// ID kanału, na którym normalni użytkownicy mogą sprawdzać zaproszenia
const INVITES_CHANNEL_ID = 'TU_WSTAW_ID_KANAŁU'; // np. '123456789012345678'

module.exports = {
    name: 'invites',
    description: 'Sprawdza lub resetuje zaproszenia użytkownika',

    async execute(message, args) {
        try {
            const targetMember = message.mentions.members?.first() || message.member;

            // Sprawdzenie uprawnień / kanału
            const isAdmin = message.member.permissions.has('Administrator');
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
            const allInvites = await message.guild.invites.fetch();
            const userInvites = allInvites.filter(i => i.inviter && i.inviter.id === targetMember.id);

            let inviteCount = 0;
            userInvites.forEach(invite => inviteCount += invite.uses);

            // Uwzględniamy resetowaną wartość
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