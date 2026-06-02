export type RecordClass = "IN" | "CS" | "CH" | "HS" | "ANY" | string;
export function toString (type: number): RecordClass;
export function toRcode (name: RecordClass): number;
