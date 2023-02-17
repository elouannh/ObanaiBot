module.exports = {
    id: "d001",
    name: "d001",
    // eslint-disable-next-line no-unused-vars
    read: async (client, id) => {
        return [
            "r001", "r002", "r003",
        ];
    },
};