// require necessary classes
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

// dotenv initialization
require("dotenv").config();

// create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);

	if ("data" in command && "execute" in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(
			`[AVISO] O comando no "${filePath}" está faltando as propriedades "data" ou "execute" requeridas.`,
		);
	}
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(
			`Nenhum comando correspondente com "${interaction.commandName}" foi encontrado.`,
		);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (err) {
		console.error(err);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: "Houve um erro quando este comando estava sendo executado",
				ephemeral: true,
			});
		} else {
			await interaction.reply({
				content: "Houve um erro quando este comando estava sendo executado",
				ephemeral: true,
			});
		}
	}
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);
