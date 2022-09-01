const Command = require("../../Command");

async function alertQuest(client, type, datas, quest) {

    const questFile = require(`../../quests/${type}/${quest.id.split(":")[0]}.js`)(quest.step + 1);
    if (quest.type === "slayer") {
        client.questDb.db.set(datas.id, quest.chapter, "storyProgress.chapter");
        client.questDb.db.set(datas.id, quest.quest, "storyProgress.quest");
        client.questDb.db.set(datas.id, quest.step, "storyProgress.step");
    }
    if (questFile?.title === undefined) {
        const playerId = Number((datas.created / 1000).toFixed(0)).toString(20);
        const model = `**${client.users.fetch(datas.id)?.username ?? `Joueur #${playerId}`}** a terminé une quête`;
        const string = {
            "daily": `${model} quotidienne.`,
            "slayer": `${model} de pourfendeur.`,
            "world": `${model} de monde.`,
        }[type];

        try {
            const cmd = new Command();
            cmd.init(client,
                {
                    author: client.users.fetch(datas.id),
                    channel: client.lastChannels.get(datas.id),
                },
            []);
            await client.playerDb.earnExp(datas.id, Math.floor(Math.random() * 150) + 100, cmd);
            await cmd.ctx.reply(
                "Félicitations !",
                string + ` Quête terminée:\n\n**${this.title}**\n> *« ${this.description} »*`,
                "❗",
                "2f3136",
                null,
            );
        }
        catch (err) {
            await client.playerDb.earnExp(datas.id, Math.floor(Math.random() * 150) + 100);
        }
    }
    else {
        const playerId = Number((datas.created / 1000).toFixed(0)).toString(20);
        const model = `**${
            client.users.fetch(datas.id)?.username ?? `Joueur #${playerId}`
        }** a franchi une étape de quête`;
        const string = {
            "daily": `${model} quotidienne.`,
            "slayer": `${model} de pourfendeur.`,
            "world": `${model} de monde.`,
        }[type];

        try {
            const cmd = new Command();
            cmd.init(client,
                {
                    author: client.users.fetch(datas.id),
                    channel: client.lastChannels.get(datas.id),
                },
            []);
            await cmd.ctx.reply(
                "Étape de quête terminée !",
                string
                +
                ` Quête terminée:\n\n**${this.title}**\n> *« ${this.description} »*\n\n`
                +
                "**Cependant, un corbeau de liaison vous apportera la suite de cette quête prochainement. "
                +
                "Restez à l'affût !**",
                "❗",
                null,
                "outline",
            );
        }
        catch (err) {
            return;
        }
    }
}

module.exports = alertQuest;