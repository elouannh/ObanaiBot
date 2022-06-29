module.exports = player => {
    return [
        [
            {
                customId: "quick",
                label: "Défense rapide",
                style: "primary",
                disabled: false,
            },
            {
                customId: "powerful",
                label: "Défense chargée",
                style: "primary",
                disabled: player.stamina < 2,
            },
            {
                customId: "counter_preparation",
                label: "Préparation contre",
                style: "primary",
                disabled: player.stamina < 1,
            },
        ],
        [
            {
                customId: "forfeit",
                label: "Abandonner",
                style: "primary",
                disabled: false,
            },
        ],
    ];
};