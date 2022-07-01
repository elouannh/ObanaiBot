const Command = require("../../base/Command");

async function alertQuest(client, type, datas, quest) {

    const questFile = require(`../../quests/${type}/${quest.id.split(":")[0]}.js`)(quest.step + 1);
    if (quest.type === "slayer") {
        client.questDb.db.set(datas.id, quest.chapter, "storyProgress.chapter");
        client.questDb.db.set(datas.id, quest.quest, "storyProgress.quest");
        client.questDb.db.set(datas.id, quest.step, "storyProgress.step");
    }
    if (questFile?.title === undefined) {
        const playerId = Number((datas.created / 1000).toFixed(0)).toString(20);
        const model = `**${client.users.cache.get(datas.id)?.username ?? `Joueur #${playerId}`}** a terminé une quête`;
        const string = {
            "daily": `${model} quotidienne.`,
            "slayer": `${model} de pourfendeur.`,
            "world": `${model} de monde.`,
        }[type];

        try {
            const cmd = new Command();
            cmd.init(client,
                {
                    author: client.users.cache.get(datas.id),
                    channel: client.lastChannel.get(datas.id),
                },
            []);
            await client.playerDb.earnExp(datas.id, Math.floor(Math.random() * 150) + 100, cmd);
            await cmd.ctx.reply("Félicitations !", string + ` Quête terminée:\n\n\`-   ${quest.title}   -\`\n*${quest.description}*`, "❗", "2f3136", null);
        }
        catch (err) {
            await client.playerDb.earnExp(datas.id, Math.floor(Math.random() * 150) + 100);
        }
    }
    else {
        const playerId = Number((datas.created / 1000).toFixed(0)).toString(20);
        const model = `**${client.users.cache.get(datas.id)?.username ?? `Joueur #${playerId}`}** a franchi une étape de quête`;
        const string = {
            "daily": `${model} quotidienne.`,
            "slayer": `${model} de pourfendeur.`,
            "world": `${model} de monde.`,
        }[type];

        try {
            const cmd = new Command();
            cmd.init(client,
                {
                    author: client.users.cache.get(datas.id),
                    channel: client.lastChannel.get(datas.id),
                },
            []);
            await cmd.ctx.reply(
                "Étape de quête terminée !",
                string
                +
                ` Quête terminée:\n\n\`-   ${quest.title}   -\`\n*${quest.description}*\n\n**Passage à la quête:**\n\n\`-   ${questFile.title}   -\`\n*${questFile.description}*`,
                "❗",
                null,
                "outline",
            );
            client.questDb.db.push(datas.id, questFile, `${type}`);
        }
        catch (err) {
            return;
        }
    }
}

module.exports = alertQuest;