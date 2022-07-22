class QuestBase {
    constructor(title, description, objective, type, id, step) {
        this.title = title;
        this.description = description;
        this.objective = objective;
        this.type = type;
        this.id = id;
        this.step = step;
        this.display = function() {
            return `**${this.title}**\n> *« ${this.description} »*\n→ __${this.objective?.display() ?? "Objectif"}__`;
        };
    }
}

module.exports = QuestBase;