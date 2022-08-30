const RPGAssetBase = require("./RPGAssetBase");

class RPGText extends RPGAssetBase {
    constructor(lang, textDatas) {
        super(lang, `${textDatas.type}:${textDatas.chapterId}_${textDatas.questId}:${textDatas.id}`);

        this.content = this.lang.json[textDatas.chapterId][textDatas.questId][textDatas.type][textDatas.id];
        this.iterable = this.content instanceof Array;
    }
}

module.exports = RPGText;