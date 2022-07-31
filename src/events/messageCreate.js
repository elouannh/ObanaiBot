const repliesJson = require("../utils/json/replies.json");

async function executeCommand(client, message, prefix) {
    const args = message.content.replace(prefix, "").split(/ +/);
    const commandName = args.shift();
    let cmd = client.commandManager.getCommand(commandName);

    if (cmd === 0) return;

    cmd = new cmd();
    cmd.init(client, message, args, prefix);

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

    if (await client.commandManager.isOverloaded()) {
        return message.channel.send("Le bot est actuellement surchargé, veuillez réessayer plus tard.");
    }

    client.lastChannel.set(message.author.id, message.channel);
    client.requestsManager.add(message.author.id, cmd);
    await cmd.run();
    client.requestsManager.remove(message.author.id, cmd);
}

function removeDuplicate(string = "", model = "") {
    const datas = [];
    for (const str of [string, model]) {
        const cache = [];
        let tempoStr = { id: str[0], count: 0 };
        for (const car of str) {
            if (car === tempoStr.id) {
                tempoStr.count++;
            }
            else {
                cache.push(tempoStr);
                tempoStr = { id: car, count: 1 };
            }
        }
        cache.push(tempoStr);
        datas.push(cache);
    }
    let finalStr = "";
    for (let i = 0, j = 0; i < datas[0].length; i++) {
        if (datas[0][i].id === datas[1][j].id) {
            if (datas[0][i].count >= datas[1][j].count) {
                finalStr += `${datas[0][i].id.repeat(datas[1][j].count)}`;
                if ((j + 1) < datas[1].length) j++;
            }
        }
        else {
            finalStr += `${`${datas[0][i]?.id ?? ""}`.repeat(datas[0][i].count ?? 0)}`;
        }
    }
    return finalStr;
}

async function autoReply(client, message, ...replies) {
    const zalgos = {
        "a": ["a"],
        "b": ["b"],
        "c": ["c"],
        "d": ["d"],
        "e": ["e"],
        "f": ["f"],
        "g": ["g"],
        "h": ["h"],
        "i": ["i"],
        "j": ["j"],
        "k": ["k"],
        "l": ["l"],
        "m": ["m"],
        "n": ["n"],
        "o": ["o"],
        "p": ["p"],
        "q": ["q"],
        "r": ["r"],
        "s": ["s"],
        "t": ["t"],
        "u": ["u"],
        "v": ["v"],
        "w": ["w"],
        "x": ["x"],
        "y": ["y"],
        "z": ["z"],
    };

    for (const reply of replies) {
        let cleanStr = "";
        reply.string = reply.string.toLowerCase();
        for (const car of reply.string) {
            const cleanCar = Object.entries(zalgos).filter(entry => entry[1].includes(car))?.at(0)?.at(0) ?? null;

            if (cleanCar !== null) cleanStr += `${cleanCar}`;
        }

        if (reply.mode === "end") {
            let needToReply = false;
            let tempoCleanStr = cleanStr;
            for (const trigger of reply.triggers) {
                tempoCleanStr = removeDuplicate(cleanStr, trigger);
                if (tempoCleanStr.endsWith(trigger)) needToReply = true;
            }

            if (needToReply) {
                const repl = reply.replies[Math.floor(Math.random() * reply.replies.length)];
                message.reply({ content: `**-${repl}**` });

            }
        }
    }
}

module.exports = {
    name: "messageCreate",
    once: false,
    run: async (message, client) => {
        if (message.author.bot) return;

        const guildPrefix = await client.guildDb.get(message.guild.id);

        if (message.content.startsWith(`<@${client.user.id}>`)) {
            message.content = "help";
            await executeCommand(client, message, guildPrefix.prefix);
        }
        else {
            const prefixes = [
                `${guildPrefix.prefix}`,
                "obanai",
                "oba",
                "obanai ",
                "oba ",
            ];

            let executed = false;
            for (const prf of prefixes) {
                if (message.content.toLowerCase().startsWith(prf)) {
                    executed = true;
                    await executeCommand(
                        client,
                        Object.assign(message, { content: message.content.replace(prf, guildPrefix.prefix) }),
                        guildPrefix.prefix,
                    );
                }
            }

            if (!executed) {
                await autoReply(
                    client,
                    message,
                    {
                        string: message.content.toLowerCase(),
                        triggers: repliesJson["quoi-feur"].triggers,
                        replies: repliesJson["quoi-feur"].replies,
                        mode: "end",
                    },
                );
            }

        }

    },
};