/*
 * Traditional DNS header OPCODEs (4-bits) defined by IANA in
 * https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-5
 */
export type OPCode = "QUERY"
  | "IQUERY"
  | "STATUS"
  | "OPCODE_3"
  | "NOTIFY"
  | "UPDATE"
  | "OPCODE_6"
  | "OPCODE_7"
  | "OPCODE_8"
  | "OPCODE_9"
  | "OPCODE_10"
  | "OPCODE_11"
  | "OPCODE_12"
  | "OPCODE_13"
  | "OPCODE_14"
  | "OPCODE_15"
  | string;

export function toString (opcode: number): OPCode;
export function toOpcode (code: OPCode): number;
