/**
 * Author: 
 * Creation Date: 
 * Last Modification Date: 
 * Purpose: 
**/


// Imports
//

//Logging functions log () { sub(), deep(), err() }
//                  Main    Indent  Ind x2  Error
const { log, errorEmbed, permFlags, } = require(`../lib/cmdImports`);

// Export
//

module.exports = {
    name: `hello`, //Name of command | Will be used to find and call
    aliases: [`hw`], //Alternate names for command
    description: `Prints hello world with command id and provided string`, //Brief Description of commands purpose
    syntax: `hello ?[msg]`, //How to use the command 
    perms: [permFlags.SendMessages], //Permissions required to use
    /**
     * Function called to run command
     * @param {Client} c : Bot Client
     * @param {Message} msg : Message that triggered command
     * @param {Array} args : Any arguments parsed from message
     * @param {String} UID : Unique identifier for referencing command instance
     */
    execute: (c, msg, args, UID) => {
        try {
            const response = `[${id}] Hello World\n${arg || ''}`;

            msg.reply(response);
            log(response);
        } catch (err) {
            c.emit(`error`, err, UID);
            return msg.reply({ embeds: [ new errorEmbed(`Sorry, an unknown error occured`, id, c.config.BOT_ICON_URL) ] });
        }
    },
}