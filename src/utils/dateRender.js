module.exports = (date, full) => {
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` + (full ? ` ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` : "");
};