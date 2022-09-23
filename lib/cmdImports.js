const log = require(`../lib/logSystem`);
const errorEmbed = require(`../lib/errorEmbed`);

const { PermissionsBitField: { Flags }, SlashCommandBuilder, } = require(`discord.js`);

module.exports = { log, errorEmbed, permFlags: Flags, cmdBuilder: SlashCommandBuilder, };