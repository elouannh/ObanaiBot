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

		try {
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

			try {
				await client.internalServerManager.questGenerator();
			}
			catch (err) {
				await this.interaction.reply({ content: ":x: **An error occurred.**" }).catch(this.client.util.catchError);
				await this.client.throwError(err, "Origin: @Read.InternalServerManager");
			}
		}
		catch (err) {
			await this.interaction.reply({ content: ":x: **An error occurred.**" }).catch(this.client.util.catchError);
			await this.client.throwError(err, "Origin: @Event.Ready");
		}
	}
}

module.exports = Ready;