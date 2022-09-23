/**
 * Author: Jire Lou 
 * Creation Date: 09/14/2022
 * Last Modification Date: 09/14/2022
 * Purpose: Defines log functions and exports styled log funcs
**/

const { Terminal, clearType } = require("./terminal");

const fs = require(`fs`);
const os = require(`os`);
const { interactionExecute } = require("../resources/prefix-cmd-template");

// Globals
//
const t = new Terminal();
let c = {};

let curDate = new Date();
let filePath = `./data/logs/noInit.txt`;
let sessionId = `012345`;

let errCount = 0;


//
// Export Function
//

//Takes str log
//Writes to terminal and file w/ format `$date ~> $log`
function log(str) {
    let logValues = {
        '$date': getFormattedTime(curDate),
        '$log': str,
    };

    finalLog(`$date ~> $log`, logValues);
}

//Takes str log and cmd id
//Writes to terminal and file w/ format `        [$id] ~> $log`
log.sub = (str, id) => {
    id = `${id}`;
    let template = `        [$id] ~> $log`;

    for (let i = 0; i < (13 - id.length); i++)
        template = ` ${template}`;

    let logValues = {
        '$id': `${id}`,
        '$log': str,
    }

    finalLog(template, logValues);
}

//Takes str log and cmd id
//Writes to terminal and file w/ format `            [$id] ~> $log`
log.deep = (str, id) => {
    id = `${id}`;
    let template = `            [$id] ~> $log`;

    for (let i = 0; i < (13 - id.length); i++)
        template = ` ${template}`;

    let logValues = {
        '$id': `${id}`,
        '$log': str,
    }

    finalLog(template, logValues);
}

//Takes cmc name str and message
//Writes to terminal and file w/ format `$date ~> $user triggered '$name' [$cmdId] in $location (Id: $id)`
log.cmd = (cmdName, options) => {
    let logValues = {
        '$date': getFormattedTime(curDate),
        '$name': cmdName,
    };

    if (options.message) {
        logValues['$user'] = options.message.author.username;
        logValues['$cmdId'] = getUID(cmdName, options.message.author.id);

        if (options.message.guild) {
            logValues['$location'] = `the guild '${options.message.guild.name}'`;
            logValues['$locationId'] = `${options.message.guild.id}`;
        } else {
            logValues['$location'] = `private messages`;
            logValues['$locationId'] = `${options.message.author.id}`;
        }
        
    } else {
        logValues['$user'] = options.interaction.user.username;
        logValues['$cmdId'] = getUID(cmdName, options.interaction.user.id);

        if (options.interaction.guild) {
            logValues['$location'] = `the guild '${options.interaction.guild.name}'`;
            logValues['$locationId'] = `${options.interaction.guild.id}`;
        } else {
            logValues['$location'] = `private messages`;
            logValues['$locationId'] = `${options.interaction.user.id}`;
        }
    }

    finalLog(`$date ~> $user triggered '$name' [$cmdId] in $location (Id: $cmdId)`, logValues);

    return logValues[`$cmdId`];
}

//Takes err and cmd id
//Writes to terminal and file w/ format `$date ERROR: [$id] ~>\n$err`
log.err = (err, id) => {
    let logValues = {
        '$date': getFormattedTime(curDate),
        '$id': `${id}`,
        '$err': `${err}`,
    }

    errCount++;

    finalLog(`$date ERROR: [$id] ~>\n$err`, logValues);
}

//Takes user
//Sets terminal session id and filepath
log.init = (client) => {
    c = client;

    sessionId = getUID(`logs`, c.user.id);
    filePath = filePath.replace(/(?<=\/)noInit.txt/g, getLogFileName(curDate));

    if (c.config.DISABLE_TERMINAL_HEADER == `true`) drawHeader = () => {};

    drawHeader();
    log(`Log System Initialized`);
}

//Takes int
//Prints num empty lines
log.line = (num = 1) => {
    for (let i = 0; i < num; i++) {
        t.writel(' ');
        drawHeader();
    }
}


//
// Private Funcs
//

//Takes str template and values for inserting
//Writes proccessed str to terminal and session file
function finalLog(templateStr, vals) {
    try {
        let finalStr = templateStr;
    
        for (const element in vals) {
            finalStr = finalStr.replace(new RegExp(`\\${element}`, `g`), vals[element]);
        }

        t.writel(finalStr);
        drawHeader();

        fs.appendFile(filePath, finalStr + os.EOL, (err) => { 
            if (err) 
                t.writel(`Error writing to file:\n${err}`); 
        });
    } catch (err) {
        t.writel(`LOG ERROR: \n${err}`);
    }
}

function drawHeader() {
    const tWidth = process.stdout.columns;

    const startPos = t.changePos(1, 1).last;
    t.clear.line();
    t.move.back();
    t.write(Array(tWidth).fill(`=`).join(``));

    t.changePos(0, 2);
    t.clear.line();
    t.move.back();
    t.write(`${getFormattedTime(curDate)} | \'\"${c?.config?.BOT_NAME || `name`}\"\' | Uptime: ${c?.uptime || process.uptime()} | Errors: ${errCount} | Debug Info: ${`None`}`);

    t.changePos(0, 3);
    t.clear.line();
    t.move.back();
    t.write(Array(tWidth).fill(`=`).join(``));

    t.changePos(0, (startPos.y + 1 >= 4) ? startPos.y + 1 : 4);
}

//Takes date obj
//Returns date string with format <MM/DD, HH:MM> [ss]
function getFormattedTime(date) {
    return `<${setDigitCount(date.getMonth())}/${setDigitCount(date.getDate())}, ${setDigitCount(date.getHours())}:${setDigitCount(date.getMinutes())}> [${setDigitCount(date.getSeconds())}]`
}

//Takes date obj
//Returns str filename for session logs
function getLogFileName(date) {
    return `Session-Logs_${date.getYear()}-${setDigitCount(date.getMonth())}-${setDigitCount(date.getDate())}_${sessionId}.txt`;
}

//Takes number and desired str length
//Returns str number with leading zeroes neccesary to reach length
function setDigitCount(value, length = 2) {
    return value.toLocaleString(`en-US`, { minimumIntegerDigits: length, maximumSignificantDigits: length, });
}

//Takes str name and message
//Return UID of length 13
function getUID(commandName, userId) {
    const validChars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`;

    let randCode = ``; 
    for (let i = 0; i < 5; i++)
        randCode += validChars.charAt(Math.floor(Math.random() * validChars.length));

    return `${commandName.substring(0, 2)}${userId.substring(0, 3)}${randCode}${setDigitCount(new Date().getMilliseconds())}`;
}

module.exports = log;