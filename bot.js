/**
 * @fileoverview Spinny Bot 2.0
 * A discord bot created by Spencer Boggs that is designed to troll my friends.
 */

const token = '';

const fs = require("fs");
const {
  Client,
  Intents,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, clientId, guildId } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

const eventFiles = fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, async (...args) => await event.execute(...args));
    }
}

client.commands = new Collection();
client.slashCommands = new Collection();

const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const comamnd = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

const slashCommands = fs.readdirSync("./interactions/slash");

for (const module of slashCommands) {
    const commandFiles = fs
        .readdirSync(`./interactions/slash/${module}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./interactions/slash/${module}/${file}`);
        client.slashCommands.set(command.data.name, command);
    }
}

const rest = new REST({ version: "9" }).setToken(token);
const commandJsonData = [
    ...Array.from(client.slashCommands.values()).map((command) => command.data.toJSON()),
];

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commandJsonData },
        );

        console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
        console.error(error);
    }
})();
    
client.once("ready", () => {
    console.log("Ready!");
});

client.login(token);
