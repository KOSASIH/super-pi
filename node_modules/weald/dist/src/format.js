/**
 * Ported from `format-util`, takes a format string and variable number of
 * values to substitute into the format string.
 *
 * @see https://github.com/tmpfs-archive/format-util
 */
export function format(...params) {
    const re = /(%?)(%([ojds]))/g;
    let fmt = params[0];
    const args = params.slice(1);
    if (args.length > 0) {
        fmt = fmt.replace(re, function (match, escaped, ptn, flag) {
            let arg = args.shift();
            switch (flag) {
                case 'o':
                    if (arg instanceof Error) {
                        arg = arg.toString();
                    }
                    else {
                        arg = JSON.stringify(arg);
                    }
                    break;
                case 's':
                    arg = `${arg}`;
                    break;
                case 'd':
                    arg = Number(arg);
                    break;
                case 'j':
                    arg = JSON.stringify(arg);
                    break;
                default:
                    break;
            }
            if (!escaped) {
                return arg;
            }
            args.unshift(arg);
            return match;
        });
    }
    // arguments remain after formatting
    if (args.length > 0) {
        fmt += ' ' + args.join(' ');
    }
    // update escaped %% values
    fmt = fmt.replace(/%{2,2}/g, '%');
    return `${fmt}`;
}
//# sourceMappingURL=format.js.map