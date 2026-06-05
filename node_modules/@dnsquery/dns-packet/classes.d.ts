export type Classes = "IN"
  | "CS"
  | "CH"
  | "HS"
  | "ANY"
  | string;

export function toString (klass: number): Classes;
export function toClass (name: Classes): number;
