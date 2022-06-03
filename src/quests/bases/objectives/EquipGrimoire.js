class EquipGrimoire {
    constructor(grimoire, grimName) {
        this.type = "equip_grimoire";
        this.grimoire = grimoire;
        this.grimName = grimName;
        this.display = function() {
            return `Équiper le grimoire **${this.grimName}**`;
        };
    }
}

module.exports = EquipGrimoire;