//#region src/index.d.ts
type Years = "years" | "year" | "yrs" | "yr" | "y";
type Months = "months" | "month" | "mo";
type Weeks = "weeks" | "week" | "w";
type Days = "days" | "day" | "d";
type Hours = "hours" | "hour" | "hrs" | "hr" | "h";
type Minutes = "minutes" | "minute" | "mins" | "min" | "m";
type Seconds = "seconds" | "second" | "secs" | "sec" | "s";
type Milliseconds = "milliseconds" | "millisecond" | "msecs" | "msec" | "ms";
type Unit = Years | Months | Weeks | Days | Hours | Minutes | Seconds | Milliseconds;
type UnitAnyCase = Capitalize<Unit> | Uppercase<Unit> | Unit;
type StringValue = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;
interface Options {
  /**
  * Set to `true` to use verbose formatting. Defaults to `false`.
  */
  long?: boolean;
}
/**
* Parse or format the given value.
*
* @param value - The string or number to convert
* @param options - Options for the conversion
* @throws Error if `value` is not a non-empty string or a number
*/
declare function ms(value: StringValue, options?: Options): number;
declare function ms(value: number, options?: Options): string;
/**
* Parse the given string and return milliseconds.
*
* @param str - A string to parse to milliseconds
* @returns The parsed value in milliseconds, or `NaN` if the string can't be
* parsed
*/
declare function parse(str: string): number;
/**
* Parse the given StringValue and return milliseconds.
*
* @param value - A typesafe StringValue to parse to milliseconds
* @returns The parsed value in milliseconds, or `NaN` if the string can't be
* parsed
*/
declare function parseStrict(value: StringValue): number;
/**
* Format the given integer as a string.
*
* @param ms - milliseconds
* @param options - Options for the conversion
* @returns The formatted string
*/
declare function format(ms: number, options?: Options): string;
//#endregion
export { StringValue, format, ms, parse, parseStrict };