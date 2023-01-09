module.exports ={
    id: "d001",
    name: "d001",
    read: (client, id) => {
        return [
            {
                "key": "d001",
                "replicas": [
                    "r001", "r002", "r003",
                ],
            },
        ];
    }
};