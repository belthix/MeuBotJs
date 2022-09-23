/**
 * Author: Jire Lou
 * Creation Date: 09/16/2022
 * Last Modification Date: 09/16/2022
 * Purpose: Computes bot and api ping speed and displays results to user in an embed
**/

//
// Imports
//

//Logging functions log () { sub(), deep(), err() }
//                  Main    Indent  Ind x2  Error
const log = require(`../lib/logSystem`);

const cmdBuilder = require(`discord.js`).SlashCommandBuilder;

const { EmbedBuilder, PermissionsBitField: { Flags }, PermissionFlagsBits } = require(`discord.js`);

//
// Export Init
//

//Create export object | Exported at end of file
const toExport = {
    name: `ping`,
    aliases: [`pong`],
    description: `Sends embed with ping information`,
    syntax: `ping`,
    perms: [Flags.SendMessages],
    slashCmd: new cmdBuilder(),
    isInteractionOnly: false,
    execute: async (c, o) => {
        //Create options for main func
        let options = {
            id: o.id,
            sendObj: o.message || o.interaction,
        };

        //Invoke Main with client and parsed vars
        await main(c, options);
    },
}

//
// Main Proccesing
//

const initEmbedColor = `#e8cf68`;
const finalEmbedColor = `#88cc66`;

async function main(c, { id, sendObj, }) {
    try {
        //Send init embed and store msg
        const initReply = await sendObj.channel.send({ embeds : [ 
            new EmbedBuilder().setTitle(`Working...`).setColor(initEmbedColor),
        ]});

        //Get time dif between cmd msg and init msg then delete init
        const timeDif = initReply.createdTimestamp - sendObj.createdTimestamp;
        initReply.delete();

        //Send embed with collected info
        sendObj.reply({ embeds: [ 
            new EmbedBuilder()
                .setTitle(`🏓 Ping Result 🏓`)
                .setColor(finalEmbedColor)
                .addFields(
                    {name: `Bot Roundtrip`, value: `${timeDif}ms`},
                    {name: `Discord Api`, value: `${c.ws.ping}ms`}
                )
        ], });

        log.sub(`${timeDif} ms, ${c.ws.ping} ms`, id);

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
    .setDefaultMemberPermissions(...toExport.perms);


//
// Export
//

module.exports = toExport;