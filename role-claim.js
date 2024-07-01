const { GuildMemberRoleManager } = require('discord.js');
const firstMessage = require('./first-message');

module.exports = client => {
    const channelID = process.env.ANNOUNCEMENT_CHANNEL;
    const ModChannel = process.env.MOD_LOG_CHANNEL;

    const emojis = {
        '✅': 'Squishy Club Member'
    }

    const reactions = []

    let emojiText = 'React with '
    for (const key in emojis) {
        reactions.push(key)

        const role = emojis[key];
        emojiText += `${key} `
    }

    emojiText += 'to pass the Captcha and reveal the whole server!'

    firstMessage(client, channelID, emojiText, reactions)

    const handleReaction = (reaction, user, add) => {
        if(user.id !== client.user.id){
            const emoji = reaction._emoji.name

            const { guild } = reaction.message

            const roleName = emojis[emoji];

            if(!roleName) {
                return
            }

            const role = guild.roles.cache.find(role => role.name === roleName);

            const member = guild.members.cache.find(member => member.id === user.id);

            const ModLog = client.channels.cache.get(ModChannel);

            const eventLog = "--- Event Log ---" + '\n';

            var msg = `${eventLog} Role Claim error regarding member: ${member.displayName}`

            if(add){
                msg = `${eventLog} Added role: "${role.name}" to user: ${member.displayName}`;
                member.roles.add(role);
            }
            else {
                msg = `${eventLog} Removed role: "${role.name}" from user: ${member.displayName}`;
                member.roles.remove(role);
            }

                console.log(msg);
                ModLog.send(msg);
        }
    }

    client.on('messageReactionAdd', (reaction, user) => {
        if(reaction.message.channel.id === channelID){
            handleReaction(reaction, user, true);
        }
    })

    client.on('messageReactionRemove', (reaction, user) => {
        if(reaction.message.channel.id === channelID){
            handleReaction(reaction, user, false);
        }
    })
}
