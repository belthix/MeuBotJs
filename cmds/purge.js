/**
 * Author: Jire Lou
 * Creation Date: 09/16/2022
 * Last Modification Date: 09/16/2022
 * Purpose: Fetches and deletes up to 99 msgs
**/

//
// Imports
//

//Logging functions log () { sub(), deep(), err() }
//                  Main    Indent  Ind x2  Error
const log = require(`../lib/logSystem`);

const errorEmbed = require(`../lib/errorEmbed`);

const cmdBuilder = require(`discord.js`).SlashCommandBuilder;

const { Message, EmbedBuilder, PermissionsBitField: { Flags } } = require(`discord.js`);


//
// Export Init
//

//Create export object | Exported at end of file
const toExport = {
    name: `purge`,
    aliases: [`pr`, `mdelete`, `md`],
    description: `Deletes multiple messages from channel (Defaults to 10)`,
    syntax: `purge ?[#]`,
    perms: [Flags.ManageMessages],
    slashCmd: new cmdBuilder(),
    isInteractionOnly: false,
    execute: async (c, o) => {
        //Create options for main func
        let options = {
            id: o.id,
            sendObj: o.message || o.interaction,
            num: (o.args ? parseInt(o.args[0]) : o.interaction.options.getInteger(`num`)) || 10,
        };

        //Invoke Main with client and parsed vars
        await main(c, options);
    },
}

//
// Main Proccesing
//

async function main(c, { id, sendObj, num, }) {
    try {
        const channel = sendObj.channel;

        //Abort with err msg if out of range
        if (num > 99 || num < 1) return sendObj.reply({ embeds: [ new errorEmbed(`Argument must be number between 1 and 99`, id, c.config.BOT_ICON_URL) ] });

        //Delete msg if msg cmd
        if (sendObj instanceof Message)
            sendObj.delete();

        //Delete msgs
        channel.bulkDelete(num);
        log.sub(`${num} messages deleted`, id);

        //Send confirmation to usr
        const confirmationMsg = await sendObj.reply({
            embeds: [ new EmbedBuilder().setTitle(`Messages Deleted`) ],
            fetchReply: true,
        });

        //Delete confirmation after 3 seconds
        setTimeout(() => {
            confirmationMsg.delete();
        }, 3000);

        return;
    } catch (err) {
        c.emit(`error`, err, id);
    }
}


//
// Setup Slash Command
//

// Info: https://discordjs.guide/interactions/slash-commands.html#options
toExport.slashCmd
    .setName(toExport.name)
    .setDescription(toExport.description)
    .addIntegerOption(option =>
        option.setName(`num`)
            .setDescription(`Number of messages to delete (default 10)`)
            .setRequired(false))
    .setDefaultMemberPermissions(...toExport.perms);

//
// Export
//

module.exports = toExport;