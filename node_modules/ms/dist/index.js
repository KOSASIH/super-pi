//#region src/index.ts
const s = 1e3;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
const mo = y / 12;
function ms(value, options) {
	if (typeof value === "string") return parse(value);
	else if (typeof value === "number") return format(value, options);
	throw new Error(`Value provided to ms() must be a string or number. value=${JSON.stringify(value)}`);
}
/**
* Parse the given string and return milliseconds.
*
* @param str - A string to parse to milliseconds
* @returns The parsed value in milliseconds, or `NaN` if the string can't be
* parsed
*/
function parse(str) {
	if (typeof str !== "string" || str.length === 0 || str.length > 100) throw new Error(`Value provided to ms.parse() must be a string with length between 1 and 99. value=${JSON.stringify(str)}`);
	const match = /^(?<value>-?\d*\.?\d+) *(?<unit>milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mo|years?|yrs?|y)?$/i.exec(str);
	if (!match?.groups) return NaN;
	const { value, unit = "ms" } = match.groups;
	const n = parseFloat(value);
	const matchUnit = unit.toLowerCase();
	/* istanbul ignore next - istanbul doesn't understand, but thankfully the TypeScript the exhaustiveness check in the default case keeps us type safe here */
	switch (matchUnit) {
		case "years":
		case "year":
		case "yrs":
		case "yr":
		case "y": return n * y;
		case "months":
		case "month":
		case "mo": return n * mo;
		case "weeks":
		case "week":
		case "w": return n * w;
		case "days":
		case "day":
		case "d": return n * d;
		case "hours":
		case "hour":
		case "hrs":
		case "hr":
		case "h": return n * h;
		case "minutes":
		case "minute":
		case "mins":
		case "min":
		case "m": return n * m;
		case "seconds":
		case "second":
		case "secs":
		case "sec":
		case "s": return n * s;
		case "milliseconds":
		case "millisecond":
		case "msecs":
		case "msec":
		case "ms": return n;
		default: throw new Error(`Unknown unit "${matchUnit}" provided to ms.parse(). value=${JSON.stringify(str)}`);
	}
}
/**
* Parse the given StringValue and return milliseconds.
*
* @param value - A typesafe StringValue to parse to milliseconds
* @returns The parsed value in milliseconds, or `NaN` if the string can't be
* parsed
*/
function parseStrict(value) {
	return parse(value);
}
/**
* Short format for `ms`.
*/
function fmtShort(ms$1) {
	const msAbs = Math.abs(ms$1);
	if (msAbs >= y) return `${Math.round(ms$1 / y)}y`;
	if (msAbs >= mo) return `${Math.round(ms$1 / mo)}mo`;
	if (msAbs >= w) return `${Math.round(ms$1 / w)}w`;
	if (msAbs >= d) return `${Math.round(ms$1 / d)}d`;
	if (msAbs >= h) return `${Math.round(ms$1 / h)}h`;
	if (msAbs >= m) return `${Math.round(ms$1 / m)}m`;
	if (msAbs >= s) return `${Math.round(ms$1 / s)}s`;
	return `${ms$1}ms`;
}
/**
* Long format for `ms`.
*/
function fmtLong(ms$1) {
	const msAbs = Math.abs(ms$1);
	if (msAbs >= y) return plural(ms$1, msAbs, y, "year");
	if (msAbs >= mo) return plural(ms$1, msAbs, mo, "month");
	if (msAbs >= w) return plural(ms$1, msAbs, w, "week");
	if (msAbs >= d) return plural(ms$1, msAbs, d, "day");
	if (msAbs >= h) return plural(ms$1, msAbs, h, "hour");
	if (msAbs >= m) return plural(ms$1, msAbs, m, "minute");
	if (msAbs >= s) return plural(ms$1, msAbs, s, "second");
	return `${ms$1} ms`;
}
/**
* Format the given integer as a string.
*
* @param ms - milliseconds
* @param options - Options for the conversion
* @returns The formatted string
*/
function format(ms$1, options) {
	if (typeof ms$1 !== "number" || !Number.isFinite(ms$1)) throw new Error("Value provided to ms.format() must be of type number.");
	return options?.long ? fmtLong(ms$1) : fmtShort(ms$1);
}
/**
* Pluralization helper.
*/
function plural(ms$1, msAbs, n, name) {
	const isPlural = msAbs >= n * 1.5;
	return `${Math.round(ms$1 / n)} ${name}${isPlural ? "s" : ""}`;
}

//#endregion
export { format, ms, parse, parseStrict };