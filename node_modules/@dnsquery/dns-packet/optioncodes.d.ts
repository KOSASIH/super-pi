export type OptionCodes = "LLQ"
  | "UL"
  | "NSID"
  | "DAU"
  | "DHU"
  | "N3U"
  | "CLIENT_SUBNET"
  | "EXPIRE"
  | "COOKIE"
  | "TCP_KEEPALIVE"
  | "PADDING"
  | "CHAIN"
  | "KEY_TAG"
  | "DEVICEID"
  | string;

export function toString (type: number): OptionCodes;
export function toCode (name: OptionCodes): number;
