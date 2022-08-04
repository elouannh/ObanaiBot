const Event = require("../base/Event");

class InteractionCreate extends Event {
    constructor() {
        super({
            name: "interactionCreate",
            once: false,
        });
        this.client = null;
        this.interaction = null;
    }

    async exe(client, interaction) {
        if (interaction.user.bot) return;

        this.client = client;
        this.interaction = interaction;

        await this.executeCommand();
    }

    async executeCommand() {
        let cmd = this.client.commandManager.getCommand(this.interaction.commandName);

        if (cmd === 0) return;

        cmd = new cmd();
        cmd.init(this.client, this.interaction);

        const cooldownReady = await cmd.cooldownReady(true);
        if (!cooldownReady) return;

        const requestReady = await cmd.requestReady();
        if (!requestReady) return;

        const permissionsReady = await cmd.permissionsReady();
        if (!permissionsReady) return;

        const clientPermissionsReady = await cmd.clientPermissionsReady();
        if (!clientPermissionsReady) return;

        const commandPrivateReady = await cmd.commandPrivateReady();
        if (!commandPrivateReady) return;

        const clientStatusReady = await cmd.clientStatusReady();
        if (!clientStatusReady) return;

        if (await this.client.commandManager.isOverloaded()) {
            return this.interaction.channel.send("Le bot est actuellement surchargé, veuillez réessayer plus tard.");
        }

        this.client.lastChannel.set(this.interaction.user.id, this.interaction.channel);
        this.client.requestsManager.add(this.interaction.user.id, { key: cmd.infos.name, value : Date.now() });
        await cmd.run();
        this.client.requestsManager.remove(this.interaction.user.id, cmd.infos.name);
    }
}

module.exports = InteractionCreate;