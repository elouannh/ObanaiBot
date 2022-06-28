module.exports = (int, sep) => {
    let args = [];

    const length = String(int).length - 1;
    for (const k in String(int)) {
        args = [String(int)[length - k]].concat(args);
        if (args.filter(e => e !== sep).length % 3 === 0) args = [sep].concat(args);
    }

    if (args[0] === sep) args = args.slice(1);

    return args.join("");
};