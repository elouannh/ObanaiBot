module.exports = player => {
    return [
        [
            {
                customId: "fast",
                label: "Défense rapide",
                style: "primary",
                disabled: false,
            },
            {
                customId: "charged",
                label: "Défense chargée",
                style: "primary",
                disabled: player.stamina < 2,
            },
            {
                customId: "dodge_preparation",
                label: "Préparation esquive",
                style: "primary",
                disabled: player.stamina < 1,
            },
        ],
        [
            {
                customId: "target_change",
                label: "Changer de cible",
                style: "primary",
                disabled: false,
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