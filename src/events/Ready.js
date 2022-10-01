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

		let statusIndex = 0;
		setInterval(() => {
			const activities = [
				{ name: "🌐 Multilingue/Multilingual", type: ActivityType.Competing },
				{ name: `Version ${client.version}`, type: ActivityType.Watching },
			];
			client.user.setPresence({
				activities: [activities[statusIndex]],
				status: "online",
			});
			statusIndex += (statusIndex === (activities.length - 1) ? -statusIndex : 1);
		}, 15_000);
	}
}

module.exports = Ready;