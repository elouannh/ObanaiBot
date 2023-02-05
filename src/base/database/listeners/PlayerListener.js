const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");
const { EmbedBuilder } = require("discord.js");

class PlayerListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async overListener(key, before, after) {
        if (before !== after) {
            await this.client.questDb.questsCleanup(key, "playerDb");

            if (before?.exp !== after?.exp) {
                const oldLevel = this.client.RPGAssetsManager.getPlayerLevel(before?.exp);
                const newLevel = this.client.RPGAssetsManager.getPlayerLevel(after?.exp);

                if (oldLevel.level !== newLevel.level) {
                    const lang = await this.client.languageManager.getLang(this.client.playerDb.getLang(key)).json;
                    const embed = new EmbedBuilder()
                        .setColor(this.client.enums.Colors.Green)
                        .setTitle(lang.rpgAssets.embeds.levelUpTitle)
                        .setDescription(
                            lang.rpgAssets.embeds.levelUp
                                .replace("%OLD", oldLevel.level)
                                .replace("%NEW", newLevel.level),
                        );
                    this.client.notify(key, { embeds: [embed] });
                }
            }
        }
    }
}

module.exports = PlayerListener;