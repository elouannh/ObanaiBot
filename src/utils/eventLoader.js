const fs = require("fs");

module.exports.loadEvents = client => {
	const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));

	for (const file of eventFiles) {
		const event = require(`../events/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.run(...args, client));
		}
		else {
			client.on(event.name, (...args) => event.run(...args, client));
		}
	}
};