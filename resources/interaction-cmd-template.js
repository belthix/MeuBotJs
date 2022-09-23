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
const { log, errorEmbed, permFlags, cmdBuilder, } = require(`../lib/cmdImports`);


// Export Init
//

const toExport = {
    name: `hello`, //Name of command | Will be used to find and call
    aliases: [`hw`], //Alternate names for command
    description: `Prints hello world with command id and provided string`, //Brief Description of commands purpose
    syntax: `hello ?[msg]`, //How to use the command 
    perms: [permFlags.SendMessages], //Permissions required to use
    slashCmd: new cmdBuilder(), //Initialize [/] command !!! Make sure to define the rest of the command near the end of the file
    /**
     * Function called to run command
     * @param {Client} c : Bot Client
     * @param {Interaction} int : Interaction that triggered command
     * @param {string} UID : Unique identifier for referencing command instance
     */
    execute: (c, int, UID) => {
        try {
            const response = `[${id}] Hello World\n${int.options.getString('msg') || ''}`;

            int.reply(response);
            log(response);
        } catch (err) {
            c.emit(`error`, err, UID);
            return int.reply({ embeds: [ new errorEmbed(`Sorry, an unknown error occured`, id, c.config.BOT_ICON_URL) ] });
        }
    },
}


// Setup Slash Command
//

// Info: https://discordjs.guide/interactions/slash-commands.html#options
toExport.slashCmd
    .setName(toExport.name)
    .setDescription(toExport.description)
    .addStringOption(option =>
        option.setName(`msg`)
            .setDescription(`A message to display`)
            .setRequired(false))
    .setDefaultMemberPermissions(...toExport.perms);

    
// Export
//

module.exports = toExport;