/**
 * Author: Jire Lou 
 * Creation Date: 09/14/2022
 * Last Modification Date: 09/14/2022
 * Purpose: Initialize client and handle client events with listners
**/

// Imports
//
const log = require(`./lib/logSystem`);

const { initializeClient, loadCmdsInDirs, getDirsFromPath, parseMsg, parseInteraction } = require(`./lib/clientFuncs`);

const { Client, GatewayIntentBits, Collection, PermissionsBitField: { Flags } } = require(`discord.js`);

//
// Init Client
//

const client = new Client({
    intents : [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
    ],
});

if (!initializeClient(client, `../resources/bot-config.json`))
    process.exit(-1);

client.on(`ready`, () => {
    log.init(client);

    log(`Client Login Succesful`)
    
    loadCmdsInDirs(client, getDirsFromPath(client.config.CMDS_PATH));
});


//
// Listners
//

client.on(`messageCreate`, async (message) => {
    if (message.author.bot) return;

    const { cmd, args, requiresBotAdmin, } = await parseMsg(client, message);

    if (!cmd) return;

    const isBotAdmin = (message.author.id == client.config.OWNER_ID || client.config.ADMIN_IDS.includes(message.author.id));
    
    if (requiresBotAdmin & !isBotAdmin) return;
    
    if (message.member.permissions.has(cmd.perms)) {
        cmd.execute(client, message, args, log.cmd(cmd.name, {message}));
    }
});

client.on(`interactionCreate`, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const cmd = await parseInteraction(client, interaction);

    cmd.execute(client, interaction, log.cmd(interaction.commandName, {interaction}));
});

client.on(`error`, (err, UID) => {
    log.err(`${err}\n${err.stack}`, UID);
});
