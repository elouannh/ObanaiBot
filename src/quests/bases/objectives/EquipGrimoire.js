class EquipGrimoire {
    constructor(grimoire, grimName) {
        this.type = "equip_grimoire";
        this.grimoire = grimoire;
        this.grimName = grimName;
        this.display = function() {
            return `Équipez le grimoire **${this.grimName}**`;
        };
    }
}

module.exports = EquipGrimoire;