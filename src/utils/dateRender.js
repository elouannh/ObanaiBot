module.exports = (date, full) => {
    const datas = {
        day: String(date.getDate()),
        month: String(date.getMonth() + 1),
        year: String(date.getFullYear()),
        hour: String(date.getHours()),
        min: String(date.getMinutes()),
        sec: String(date.getSeconds()),
    };

    if (datas.day.length < 2) datas.day = "0" + datas.day;
    if (datas.month.length < 2) datas.month = "0" + datas.month;
    if (datas.hour.length < 2) datas.hour = "0" + datas.hour;
    if (datas.min.length < 2) datas.min = "0" + datas.min;
    if (datas.sec.length < 2) datas.sec = "0" + datas.sec;
    return `${datas.day}/${datas.month}/${datas.year}` + (full ? ` ${datas.hour}:${datas.min}:${datas.sec}` : "");
};