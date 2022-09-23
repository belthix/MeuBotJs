
const { EmbedBuilder } = require(`discord.js`);


const errorColor = `#70252b`;


class errorEmbed {
    constructor(errorDescription, UID, iconURL) {
        const errorEmbed = new EmbedBuilder()
            .setColor(errorColor)
            .setTitle(`Error`)
            .setDescription(`Error Type: ${errorDescription}`)
            .setFooter({ text: `Error ID: ${UID}`, iconURL, });
        return errorEmbed;
    }
};

module.exports = errorEmbed;