module.exports = exp => {
    const datas = {
        level: 1,
        nextLevel: 2,
        exp: exp,
        tempExp: exp,
        required: 500,
        toReach: 500,
    };

    while (datas.tempExp >= ((datas.nextLevel + 1) * 250)) {
        datas.level++;
        datas.tempExp -= ((datas.nextLevel + 1) * 250);
        datas.nextLevel++;
    }

    datas.required = ((datas.nextLevel + 1) * 250);
    datas.toReach = datas.required - datas.tempExp;

    return datas;
};