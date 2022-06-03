const Command = require("../../base/Command");

class Eval extends Command {
    constructor() {
        super({
            adminOnly: true,
            aliases: ["eval", "e"],
            args: [["command", "commande à executer", false]],
            category: "Administrateur",
            cooldown: 0,
            description: "C'est privé ! Interdit d'utiliser.",
            examples: ["eval", "eval console.log(\"hello world !\");"],
            finishRequest: ["eval"],
            name: "eval",
            ownerOnly: true,
            permissions: 0,
            syntax: "eval <command>",
        });
    }

    async run() {
        if (this.message.author.id !== "539842701592494111") return;

        const clean = text => {
            if (typeof text === "string") return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else return text;
        };
        let response = "";
        try {
            const code = this.args.join(" ");
            let evaled = eval(code);

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);


            const cleanEvaled = clean(evaled);
            if (cleanEvaled === "undefined") {
                response += "`✅ Terminal`\n```cs\n# Nothing happens here...```";
            }
            else {
                response += `\`✅ Terminal\`\n\`\`\`xl\n${cleanEvaled.substring(0, 1950)}\`\`\``;
            }
        }
        catch (err) {
            const cleanErr = clean(err.message);
            response += `\`❌ Terminal (error)\`\n\`\`\`xl\n${cleanErr.substring(0, 1950)}\`\`\``;
        }

        this.message.channel.send({ content: response });
    }
}

module.exports = new Eval();