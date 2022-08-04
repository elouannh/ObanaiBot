const Command = require("../../base/Command");

class Eval extends Command {
    constructor() {
        super({
            category: "Owner",
            cooldown: 1,
            description: "Commande permettant au fondateur d'exécuter du JavaScript directement depuis le salon textuel.",
            finishRequest: ["eval"],
            name: "eval",
            private: "owners",
            permissions: 0n,
        });
    }

    async run() {
        const clean = text => {
            if (typeof text === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203))
                           .replace(/@/g, "@" + String.fromCharCode(8203));
            }
            else {
                return text;
            }
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

module.exports = Eval;