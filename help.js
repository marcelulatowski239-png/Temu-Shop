const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ComponentType
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Interaktywny panel pomocy TemuShop',

    async execute(message) {

        const mainEmbed = new EmbedBuilder()
            .setColor('#ff7a00')
            .setTitle('🛍️ TemuShop • Panel Pomocy')
            .setDescription(
                `Witaj ${message.author} 👋\n\n` +
                `Wybierz kategorię z menu poniżej, aby zobaczyć komendy.\n\n` +
                `⚡ Prefix: \`!\``
            )
            .setFooter({ text: 'TemuShop © 2026' })
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId('temushop-help')
            .setPlaceholder('🛒 Wybierz kategorię...')
            .addOptions([
                {
                    label: 'Komendy Klienta',
                    description: 'Profil, level, reputacja, invites',
                    value: 'user',
                    emoji: '👤'
                },
                {
                    label: 'System Sklepu',
                    description: 'Verify, ticket, opinie',
                    value: 'shop',
                    emoji: '🛒'
                },
                {
                    label: 'Eventy',
                    description: 'Giveaway, głosowania i reroll',
                    value: 'event',
                    emoji: '🎉'
                },
                {
                    label: 'Moderacja',
                    description: 'Komendy moderatorskie',
                    value: 'mod',
                    emoji: '🛡'
                },
                {
                    label: 'Administracja',
                    description: 'Ustawienia bota',
                    value: 'admin',
                    emoji: '⚙'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const msg = await message.reply({
            embeds: [mainEmbed],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000
        });

        collector.on('collect', async interaction => {

            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: '❌ To menu nie jest dla Ciebie.',
                    ephemeral: true
                });
            }

            let embed;

            switch (interaction.values[0]) {

                case 'user':
                    embed = new EmbedBuilder()
                        .setColor('#ff7a00')
                        .setTitle('👤 Komendy Klienta')
                        .setDescription(
                            '```' +
                            '!profil\n' +
                            '+rep @user\n' +
                            '!level\n' +
                            '!rank\n' +
                            '!top\n' +
                            '!invites' +
                            '```'
                        );
                    break;

                case 'shop':
                    embed = new EmbedBuilder()
                        .setColor('#ff7a00')
                        .setTitle('🛒 System Sklepu')
                        .setDescription(
                            '```' +
                            '!verify\n' +
                            '!ticket\n' +
                            '+rep @user produkt cena metoda' +
                            '```'
                        );
                    break;

                case 'event':
                    embed = new EmbedBuilder()
                        .setColor('#ff7a00')
                        .setTitle('🎉 Eventy')
                        .setDescription(
                            '```' +
                            '!giveaway\n' +
                            '!reroll\n' +
                            '+glosowanie' +
                            '```'
                        );
                    break;

                case 'mod':
                    embed = new EmbedBuilder()
                        .setColor('#ff7a00')
                        .setTitle('🛡 Moderacja')
                        .setDescription(
                            '```' +
                            '!kick @user\n' +
                            '!ban @user\n' +
                            '!unban ID\n' +
                            '!mute @user 10m\n' +
                            '!unmute @user\n' +
                            '!warn @user powod\n' +
                            '!clear 10' +
                            '```'
                        );
                    break;

                case 'admin':
                    embed = new EmbedBuilder()
                        .setColor('#ff7a00')
                        .setTitle('⚙ Administracja')
                        .setDescription(
                            '```' +
                            '!ustawwelcome #kanal\n' +
                            '!ustawleave #kanal\n' +
                            '!ustawboost #kanal\n' +
                            '!reset' +
                            '```'
                        );
                    break;
            }

            await interaction.update({ embeds: [embed] });
        });

        collector.on('end', () => {
            msg.edit({ components: [] });
        });
    }
};