const { ActivityType } = require("discord.js");
const Event = require("../base/Event");

class Ready extends Event {
	constructor() {
		super({
			name: "ready",
			once: true,
		});
	}

	async exe(client) {
		await client.commandManager.loadFiles();
		client.log(`Bot connecté en tant que ${client.user.tag} !`);
		client.user.setPresence({
			activities: [
				{ name: `version ${client.version}`, type: ActivityType.Watching },
			],
			status: "online",
		});
	}
}

module.exports = Ready;