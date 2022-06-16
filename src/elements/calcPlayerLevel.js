module.exports = exp => {
    const datas = {
        level: 1,
        nextLevel: 2,
        exp: exp,
        tempExp: exp,
        required: 500,
        reached: 500,
    };

    while (datas.tempExp > ((datas.nextLevel + 1) * 350)) {
        datas.level++;
        datas.tempExp -= ((datas.nextLevel + 1) * 350);
        datas.nextLevel++;
    }

    datas.required = ((datas.nextLevel + 1) * 350);
    datas.reached = ((datas.nextLevel + 1) * 350) - datas.tempExp;

    return datas;
};