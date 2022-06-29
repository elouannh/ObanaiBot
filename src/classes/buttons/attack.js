module.exports = (player, canChangeTarger) => {
    return [
        [
            {
                customId: "quick",
                label: "Attaque rapide",
                style: "primary",
                disabled: false,
            },
            {
                customId: "powerful",
                label: "Attaque chargée",
                style: "primary",
                disabled: player.stamina < 2,
            },
            {
                customId: "dodge_preparation",
                label: "Préparation esquive",
                style: "primary",
                disabled: player.stamina < 1,
            },
            {
                customId: "special_attack",
                label: "Attaque spéciale",
                style: "primary",
                disabled: player.stamina < 5,
            },
        ],
        [
            {
                customId: "target_change",
                label: "Changer de cible",
                style: "primary",
                disabled: canChangeTarger,
            },
            {
                customId: "forfeit",
                label: "Abandonner",
                style: "primary",
                disabled: false,
            },
        ],
    ];
};