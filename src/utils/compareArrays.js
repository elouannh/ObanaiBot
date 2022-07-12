module.exports = (firstArray = [], secondArray = []) => {
    const datas = {
        added: [],
        removed: [],
        unchanged: [],
    };

    datas.added = secondArray.filter(element => !firstArray.includes(element));
    datas.removed = firstArray.filter(element => !secondArray.includes(element));
    datas.unchanged = secondArray.filter(element => firstArray.includes(element));

    return datas;
};