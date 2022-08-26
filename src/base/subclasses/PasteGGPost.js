const PasteGGFile = require("./PasteGGFile");

class PasteGGPost {
    constructor() {
        this.req = {
            "name": "files",
            "description": "some files",
            "visibility": "unlisted",
            "expires": "2024-11-30T23:59:00Z",
            "files": [
                new PasteGGFile().file,
            ],
        };
    }

    get post() {
        return this.req;
    }

    setName(name) {
        this.req.name = name;

        return this;
    }

    setDescription(description) {
        this.req.description = description;

        return this;
    }

    setVisibility(visibility) {
        this.req.visibility = visibility;

        return this;
    }

    setExpires(expires) {
        this.req.expires = expires;

        return this;
    }

    setFiles(files) {
        this.req.files = files;

        return this;
    }
}

module.exports = PasteGGPost;