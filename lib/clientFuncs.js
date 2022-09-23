/**
 * Author: Jire Lou 
 * Creation Date: 09/14/2022
 * Last Modification Date: 09/14/2022
 * Purpose: Store Functions used by client app
**/

const { Terminal } = require(`./terminal`);

const log = require(`./logSystem`);

const { Collection, Routes } = require(`discord.js`);
const { REST } = require(`@discordjs/rest`);

const Keyv = require(`keyv`);

const fs = require(`fs`);

//
// Init
//

function initializeClient(client, configPath) {
    if (!client) return -1;
    
    client.config = require(configPath);

    if (client.config.BOT_TOKEN === `none` || client.config.OWNER_ID === 'none') {
        log(`Required config settings are undefined`);
        return 0;
    }

    client.db = {
        prefixes: new Keyv(`sqlite://data/prefixes.sqlite`),
    }

    client.cmds = {
        base: new Collection(),
        guildAdmin: new Collection(),
        botAdmin: new Collection(),
    }

    new Terminal().writel(`Attempting to Login`);
    client.login(client.config.BOT_TOKEN);

    return 1;
}


//
// Loading Cmds
//

function attachFiles(fileList, collection) {
    fileList.forEach((file, j) => {
        const cmd = require(`../${file.path}`);
        collection.set(cmd.name, cmd);
        log.deep(`Proccessing '${file.name}' from ${file.path}`, `${(Math.round((j + 1) * 100 / fileList.length))}%`);
    });
}

function getDirsFromPath(root) {
    const dirList = fs.readdirSync(root, { withFileTypes: true }).filter(item => item.isDirectory());
    
    return [root].concat(dirList.map(dir => `${root}/${dir.name}/`));
}

function getJsFiles(paths, id = `Base`) {
    let files = [];

    paths.forEach((path, i) => {
        const pathFiles = fs.readdirSync(path).filter(file => file.match(/js$/));
        
        files = files.concat(pathFiles.map((file) => { return { name: file.split(`.`)[0], path: `${path}${file}`, }; })); //Create info obj and add to list
        
        log.deep(`Directory "${path}": ${pathFiles.length} commands found`, `${id}: ${i + 1}/${paths.length}`);
    });

    return files;
}

function loadCmdsInDirs(client, dirList) {
    const lid = `Loader`;
    log(`Loading Commands`);

    let start = new Date();
    if (typeof(dirList) === `string`) dirList = [dirList];

    //Get Dirs
    //
    const dirs = {
        base: dirList.filter(dir => dir.match(new RegExp(`^\.\/.+?\/[^${client.config.BOT_ADMIN_CMD_DIR_PREFIX}${client.config.GUILD_ADMIN_CMD_DIR_PREFIX}]+?\/`, `g`))) || [],
        guildAdmin: dirList.filter(dir => dir.match(new RegExp(`^\.\/.+?\/${client.config.GUILD_ADMIN_CMD_DIR_PREFIX}.+?\/`, `g`))) || [],
        botAdmin: dirList.filter(dir => dir.match(new RegExp(`^\.\/.+?\/${client.config.BOT_ADMIN_CMD_DIR_PREFIX}.+?\/`, `g`))) || [],
    }

    //Get files
    //
    log.line();
    log.sub(`Searching director${dirList.length ? `ies` : `y`} for commands:`, lid);
    log.deep(`[${dirList.join(`, `)}]`, dirList.length);

    const files = {
        base: getJsFiles(dirs.base),
        guildAdmin: getJsFiles(dirs.guildAdmin, `gAdmin`),
        botAdmin: getJsFiles(dirs.botAdmin, `bAdmin`),
    }

    log.sub(`Search finished: ${files.base.length + files.guildAdmin.length + files.botAdmin.length} commands found in ${Date.now() - start} milliseconds`, lid);
    log.line();

    //Add commands
    //
    start = new Date();

    log.sub(`Proccessing base commands and attaching to client`, lid);
    attachFiles(files.base, client.cmds.base);

    log.sub(`Proccessing guild admin commands and attaching to client`, lid);
    attachFiles(files.guildAdmin, client.cmds.guildAdmin);

    log.sub(`Proccessing bot admin commands and attaching to client`, lid);
    attachFiles(files.botAdmin, client.cmds.botAdmin);

    log.sub(`Proccessing Complete: Commands proccessed in ${Date.now() - start} milliseconds`, lid)
    log.line();

    log(`Finished Loading Commands`)
    log.line();

    //Set interactions
    //
    const rest = new REST({ version: '10' }).setToken(client.config.BOT_TOKEN);

    (async () => {
        try {
            log(`Adding ${files.base.length} [/] commands`);
    
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: files.base.concat(files.guildAdmin).map(file => require(`../${file.path}`).slashCmd?.toJSON()) },
            );
    
            log.sub(`Successfully added ${data.length} [/] commands`, `/loader`);
            log.line(2);
        } catch (err) {
            client.emit(`error`, err, `/cmds`);
        }
    })();
}


//
// Parsing
//

async function parseMsg(client, { content, guild, author, }) {
    const guildPrefix = guild ? (await client.db.prefixes.get(guild.id)) : false;
    
    let msgArr = content.split(/\s+/);
    let cmdName = ``;

    let returnObj = {
        cmd: {},
        args: msgArr.slice(1),
        collection: undefined,
    };

    if (msgArr[0].startsWith(client.config.BASE_PREFIX)) {
        returnObj.collection = client.cmds.base;
        cmdName = msgArr[0].slice(client.config.BASE_PREFIX.length);
    } else if (msgArr[0].startsWith(guildPrefix)) {
        returnObj.collection = client.cmds.base;
        cmdName = msgArr[0].slice(guildPrefix.length);
    } else if (msgArr[0].startsWith(client.config.GUILD_ADMIN_PREFIX)) {
        returnObj.collection = client.cmds.guildAdmin;
        cmdName = msgArr[0].slice(client.config.GUILD_ADMIN_PREFIX.length);
    } else if (msgArr[0].startsWith(client.config.BOT_ADMIN_PREFIX)) {
        returnObj.collection = client.cmds.botAdmin;
        cmdName = msgArr[0].slice(client.config.BOT_ADMIN_PREFIX.length);
    }

    returnObj.cmd = returnObj.collection ? (returnObj.collection.get(cmdName) || returnObj.collection.find(cmd => cmd.aliases?.includes(cmdName))) : false;

    return returnObj;
}

async function parseInteraction(client, interaction) {
    for (collection in client.cmds) {
        const cmd = await client.cmds[collection].get(interaction.commandName);
        if (cmd) return { 
            cmd: cmd,
            collection: client.cmds[collection],
        };
    }
}


module.exports = {
    initializeClient,
    loadCmdsInDirs,
    getDirsFromPath,
    parseMsg,
    parseInteraction,
}