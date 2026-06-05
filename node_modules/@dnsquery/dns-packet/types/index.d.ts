import { RecordType } from '../types.js';
import { RecordClass } from '../rcodes.js';
import { OptionCodes } from '../optioncodes.js';
import { OPCode } from '../opcodes.js';

export { RecordType } from '../types.js';
export { RecordClass } from '../rcodes.js';
export { OptionCodes } from '../optioncodes.js';
export { OPCode } from '../opcodes.js';

export interface Codec <Type> {
  encode(package: Type, buf?: Uint8Array, offset?: number): Uint8Array;
  decode(buf: Uint8Array, offset?: number): Type;
  encodingLength(packet: Type): number;
}

export interface Question {
 type: RecordType;
 name: string;
 class?: RecordClass | undefined;
}

export interface SrvData {
 target: string;
 port?: number;
 priority?: number | undefined;
 weight?: number | undefined;
}

export interface HInfoData {
 cpu: string;
 os: string;
}

export interface SoaData {
 mname: string;
 rname: string;
 serial?: number | undefined;
 refresh?: number | undefined;
 retry?: number | undefined;
 expire?: number | undefined;
 minimum?: number | undefined;
}

export type TxtData = string | Uint8Array | Array<string | Uint8Array>;

export interface CaaData {
 issuerCritical?: boolean | undefined;
 flags?: number | undefined;
 tag: string;
 value: string;
}

export interface MxData {
 preference?: number | undefined;
 exchange: string;
}

export interface BaseAnswer<T, D> {
 type: T;
 name: string;
 ttl?: number | undefined;
 class?: RecordClass | undefined;
 data: D;
}

/**
 * Record types for which the library will provide a string in the data field.
 */
export type StringRecordType = "A" | "AAAA" | "CNAME" | "DNAME" | "NS" | "PTR";

/**
 * Record types for which the library does not attempt to process the data
 * field.
 */
export type OtherRecordType =
 | "AFSDB"
 | "APL"
 | "AXFR"
 | "CDNSKEY"
 | "CDS"
 | "CERT"
 | "DHCID"
 | "DLV"
 | "HIP"
 | "IXFR"
 | "IPSECKEY"
 | "KEY"
 | "KX"
 | "LOC"
 | "NAPTR"
 | "NSEC3PARAM"
 | "SIG"
 | "SSHFP"
 | "TA"
 | "TKEY"
 | "TLSA"
 | "TSIG"
 | "URI";

export type StringAnswer = BaseAnswer<StringRecordType, string>;
export type SrvAnswer = BaseAnswer<"SRV", SrvData>;
export type HInfoAnswer = BaseAnswer<"HINFO", HInfoData>;
export type SoaAnswer = BaseAnswer<"SOA", SoaData>;
export type TxtAnswer = BaseAnswer<"TXT", TxtData>;
export type CaaAnswer = BaseAnswer<"CAA", CaaData>;
export type MxAnswer = BaseAnswer<"MX", MxData>;
export type NullAnswer = BaseAnswer<"NULL", Uint8Array>;
export type OptAnswer = BaseAnswer<"OPT", OptionData[]>;
export type DNSKeyAnswer = BaseAnswer<"DNSKEY", DNSKeyData>;
export type RRSigAnswer = BaseAnswer<"RRSIG", RRSigData>;
export type RPAnswer = BaseAnswer<"RP", RPData>;
export type NSecAnswer = BaseAnswer<"NSEC", NSecData>;
export type NSec3Answer = BaseAnswer<"NSEC3", NSec3Data>;
export type DSAnswer = BaseAnswer<"DS", DigestData>;
export type BufferAnswer = BaseAnswer<OtherRecordType, Uint8Array>;

export type Answer =
 | StringAnswer
 | SrvAnswer
 | HInfoAnswer
 | SoaAnswer
 | TxtAnswer
 | CaaAnswer
 | MxAnswer
 | NullAnswer
 | OptAnswer
 | DNSKeyAnswer
 | RRSigAnswer
 | RPAnswer
 | NSecAnswer
 | NSec3Answer
 | DSAnswer
 | BufferAnswer;

export interface Packet {
  /**
   * Whether the packet is a query or a response. This field may be
   * omitted if it is clear from the context of usage what type of packet
   * it is.
   */
  type?: "query" | "response" | undefined;

  id?: number | undefined;

  /**
   * A bit-mask combination of zero or more of:
   * {@link AUTHORITATIVE_ANSWER},
   * {@link TRUNCATED_RESPONSE},
   * {@link RECURSION_DESIRED},
   * {@link RECURSION_AVAILABLE},
   * {@link AUTHENTIC_DATA},
   * {@link CHECKING_DISABLED}.
   */
  flags?: number | undefined;
  questions?: Question[] | undefined;
  answers?: Answer[] | undefined;
  additionals?: Answer[] | undefined;
  authorities?: Answer[] | undefined;
  flag_qr?: boolean;
  opcode?: OPCode;
  flag_aa?: boolean;
  flag_tc?: boolean;
  flag_rd?: boolean;
  flag_ra?: boolean;
  flag_z?: boolean;
  flag_ad?: boolean;
  flag_cd?: boolean;
  rcode?: RecordClass;
}

export const DNSSEC_OK: 32768;
export const AUTHORITATIVE_ANSWER: 1024;
export const TRUNCATED_RESPONSE: 512;
export const RECURSION_DESIRED: 256;
export const RECURSION_AVAILABLE: 128;
export const AUTHENTIC_DATA: 32;
export const CHECKING_DISABLED: 16;

export interface DNSKeyData {
  key: string;
  flags: number;
  algorithm: number;
}
export interface DigestData {
  digest: Uint8Array;
  keyTag: number;
  algorithm: number;
  digestType: number;
}
export type SSHFPFingerPrintLength = 20 | 32;
export type SSHFPHash = 1 | 2;
export type SSHFPFingerPrintLengthFor <T extends SSHFPHash> = T extends 1 ? 20 : 32;
export interface SSHFP {
  algorithm: number;
  hash: SSHFPHash;
  fingerprint: string;
}

export interface NSecData {
  nextDomain: Uint8Array;
  rrtypes: RecordType[];
}
export interface NSec3Data {
  salt: Uint8Array;
  nextDomain: Uint8Array;
  algorithm: number;
  flags: number;
  iterations: number;
  rrtypes: RecordType[];
}

export type ACodec = Codec<string>;
export type PtrCodec = Codec<Uint8Array>;
export type TxtCodec = Codec<Uint8Array[]>;
export type NullCodec = Codec<Uint8Array>;
export type CaaCodec = Codec<string> & {
  ISSUER_CRITICAL: 128
};
export type DNSKeyCodec = Codec<DNSKeyData> & {
  PROTOCOL_DNSSEC: 3
  ZONE_KEY: 0x80
  SECURE_ENTRYPOINT: 0x8000
};
export type DSCodec = Codec<DigestData>;
export type SSHFPCodec = Codec<SSHFP> & {
  getFingerprintLengthForHashType(hashType: SSHFPHash): SSHFPFingerPrintLength;
};
export type HInfoCodec = Codec<HInfoData>;
export type AAAACodec = Codec<string>;
export type UnknownCodec = Codec<Uint8Array>;
export type SrvCodec = Codec<SrvData>;
export type NSCodec = Codec<string>;
export type SoaCodec = Codec<SoaData>;
export type MxCodec = Codec<MxData>;
export type OptCodec = Codec<OptionData[]>;
export type QuestionCodec = Codec<Question>;
export type RRSigCodec = Codec<RRSigData>;
export type RPCodec = Codec<RPData>;
export type NSecCodec = Codec<NSecData>;
export type NSec3Codec = Codec<NSec3Data>;
export type PacketCodec = Codec<Packet>;

export type SingleQuestionPacket = Omit<Packet, 'questions'> & {
  question: Question
};

export type QueryCodec = Codec<SingleQuestionPacket>;
export type ResponseCodec = Codec<SingleQuestionPacket>;

export const a: ACodec;
export const caa: CaaCodec;
export const ptr: PtrCodec;
export const cname: PtrCodec;
export const dname: PtrCodec;
export const dnskey: DNSKeyCodec;
export const ds: DSCodec;
export const sshfp: SSHFPCodec;
export const hinfo: HInfoCodec;
export const aaaa: AAAACodec;
export const answer: Codec<Answer>;
export const txt: TxtCodec;
export const unknown: UnknownCodec;
export const mx: MxCodec;
export const name: Codec<string>;
export const ns: NSCodec;
export const soa: SoaCodec;
export const srv: SrvCodec;
export const option: Codec<OptionData>;
export const opt: OptCodec;
export const question: QuestionCodec;
export const rrsig: RRSigCodec;
export const rp: RPCodec;
export const nsec: NSecCodec;
export const nsec3: NSec3Codec;
export const packet: PacketCodec;
export const query: QueryCodec;
export const response: ResponseCodec;

declare const rnull: NullCodec;
export { rnull as null };

export interface GenericOptionData {
  code: OptionCodes;
  data: Uint8Array;
}
export interface ClientSubnetOptionData {
  code: 'CLIENT_SUBNET';
  ip: string;
  family?: 1 | 2;
  sourcePrefixLength?: number;
  scopePrefixLength?: number;
}
export interface TCPKeepaliveOptionData {
  code: 'TCP_KEEPALIVE';
  timeout?: number;
}
export interface PaddingOptionData {
  code: 'PADDING';
  length?: number;
}
export interface KeyTagOptionData {
  code: 'KEY_TAG';
  tags: number[];
}

export type OptionData =
    GenericOptionData
  | ClientSubnetOptionData
  | TCPKeepaliveOptionData
  | PaddingOptionData
  | KeyTagOptionData;

export interface RRSigData {
  signature: Uint8Array;
  typeCovered: RecordType;
  algorithm: number;
  labels: number;
  originalTTL: number;
  expiration: number;
  inception: number;
  keyTag: number;
  signersName: string;
}

export interface RPData {
  mbox?: string;
  txt?: string;
}

export type AnyTypeCodec =
  ACodec | PtrCodec | TxtCodec | NullCodec | AAAACodec |
  SrvCodec | HInfoCodec | CaaCodec | NSCodec | SoaCodec |
  MxCodec | OptCodec | RRSigCodec | RPCodec | NSecCodec |
  NSec3Codec | DSCodec | UnknownCodec;

export type TypeCodec <Type> =
  Type extends string ?
    Uppercase<Type> extends 'A' ? ACodec :
    Uppercase<Type> extends 'PTR' ? PtrCodec :
    Uppercase<Type> extends 'CNAME' ? PtrCodec :
    Uppercase<Type> extends 'DNAME' ? PtrCodec :
    Uppercase<Type> extends 'TXT' ? TxtCodec :
    Uppercase<Type> extends 'NULL' ? NullCodec :
    Uppercase<Type> extends 'AAAA' ? AAAACodec :
    Uppercase<Type> extends 'SRV' ? SrvCodec :
    Uppercase<Type> extends 'HINFO' ? HInfoCodec :
    Uppercase<Type> extends 'CAA' ? CaaCodec :
    Uppercase<Type> extends 'NS' ? NSCodec :
    Uppercase<Type> extends 'SOA' ? SoaCodec :
    Uppercase<Type> extends 'MX' ? MxCodec :
    Uppercase<Type> extends 'OPT' ? OptCodec :
    Uppercase<Type> extends 'DNSKEY' ? DNSKeyCodec :
    Uppercase<Type> extends 'RRSIG' ? RRSigCodec :
    Uppercase<Type> extends 'RP' ? RPCodec :
    Uppercase<Type> extends 'NSEC' ? NSecCodec :
    Uppercase<Type> extends 'NSEC3' ? NSec3Codec :
    Uppercase<Type> extends 'DS' ? DSCodec :
    UnknownCodec
  : AnyTypeCodec;

export function enc <Type>(type: Type): TypeCodec<Type>;

export function encode(packet: Packet, buf?: Uint8Array, offset?: number): Uint8Array;
export function decode(buf: Uint8Array, offset?: number): Packet;
export function encodingLength(packet: Packet): number;
export function decodeList <T= any>(list: T[], codec: Codec<T>, buf: Uint8Array, offset?: number): Packet[];
export function encodeList <T= any>(list: T[], codec: Codec<T>, buf?: Uint8Array, offset?: number): number;
export function encodingLengthList <T= any>(list: T[], codec: Codec<T>): number;
export function streamDecode(buffer: Uint8Array): Packet | null;
export function streamEncode(packet: Packet): Uint8Array;
