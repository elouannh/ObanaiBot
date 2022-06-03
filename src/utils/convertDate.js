module.exports = (milisecs, short = false) => {
    const datas = {
        secs: 0,
        mins: 0,
        hours: 0,
        days: 0,
        string: "",
    };

    while (milisecs > 999) {
        if (milisecs <= 60000) {
            datas.secs += Math.ceil(milisecs / 1000);
            milisecs = 0;
        }
        else if (milisecs >= 60000 && milisecs < 3600000) {
            datas.mins++;
            milisecs -= 60000;
        }
        else if (milisecs >= 3600000 && milisecs < 86400000) {
            datas.hours++;
            milisecs -= 3600000;
        }
        else if (milisecs >= 86400000) {
            datas.days++;
            milisecs -= 86400000;
        }
    }

    if (datas.secs === 60) {
        datas.mins++;
        datas.secs = 0;
    }
    if (datas.mins === 60) {
        datas.hours++;
        datas.mins = 0;
    }
    if (datas.hours === 24) {
        datas.days++;
        datas.hours = 0;
    }
    if (!short) {
        if (datas.days > 0) datas.string += `${datas.days} jours `;
        if (datas.hours > 0) datas.string += `${datas.hours} heures `;
        if (datas.mins > 0) datas.string += `${datas.mins} minutes `;
        if (datas.secs > 0) datas.string += `${datas.secs} secondes`;
    }
    else {
        if (datas.days > 0) datas.string += `${datas.days}j `;
        if (datas.hours > 0) datas.string += `${datas.hours}h `;
        if (datas.mins > 0) datas.string += `${datas.mins}min `;
        if (datas.secs > 0) datas.string += `${datas.secs}sec`;
    }

    if (datas.string.length === 0) datas.string = "1 sec";

    return datas;
};