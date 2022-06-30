module.exports = (player, canChangeTarger) => {
    return [
        [
            {
                customId: "quick",
                emoji: "👊",
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
                customId: "dodge_preparation",
                emoji: "❄️",
                style: "secondary",
                disabled: player.stamina < 1,
            },
            {
                customId: "special_attack",
                emoji: "💀",
                style: "secondary",
                disabled: player.stamina < 5,
            },
        ],
        [
            {
                customId: "target_change",
                emoji: "🎯",
                style: "danger",
                disabled: canChangeTarger,
            },
            {
                customId: "forfeit",
                emoji: "🧽",
                style: "danger",
                disabled: false,
            },
        ],
    ];
};