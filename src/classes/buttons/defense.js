module.exports = player => {
    return [
        [
            {
                customId: "quick",
                emoji: "🛡️",
                style: "secondary",
                disabled: false,
            },
            {
                customId: "powerful",
                emoji: "💥",
                style: "secondary",
                disabled: player.stamina < 2,
            },
            {
                customId: "counter_preparation",
                emoji: "☄️",
                style: "secondary",
                disabled: player.stamina < 1,
            },
        ],
        [
            {
                customId: "forfeit",
                emoji: "🧽",
                style: "danger",
                disabled: false,
            },
        ],
    ];
};