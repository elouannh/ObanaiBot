module.exports ={
    id: "d001",
    read: (client, data) => {
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