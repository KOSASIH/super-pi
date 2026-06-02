/* tslint:disable:no-duplicate-imports */
import * as dnsPacket from '@leichtgewicht/dns-packet';
import { Codec, UnknownCodec } from '@leichtgewicht/dns-packet';

dnsPacket.decode(dnsPacket.encode({
  id: 1,
  type: 'query',
  questions: [
    {
      name: 'test',
      type: 'A'
    },
    {
      name: 'foo',
      type: 'boo'
    }
  ]
}));

const num: number[] = [
  dnsPacket.AUTHENTIC_DATA,
  dnsPacket.AUTHORITATIVE_ANSWER,
  dnsPacket.CHECKING_DISABLED,
  dnsPacket.DNSSEC_OK,
  dnsPacket.RECURSION_AVAILABLE,
  dnsPacket.RECURSION_DESIRED,
  dnsPacket.TRUNCATED_RESPONSE,
  dnsPacket.dnskey.PROTOCOL_DNSSEC,
  dnsPacket.dnskey.ZONE_KEY,
  dnsPacket.dnskey.SECURE_ENTRYPOINT,
  dnsPacket.encodingLength({}),
  dnsPacket.encodingLengthList([], dnsPacket.a)
];

const codec: Array<Codec<any>> = [
  dnsPacket.a,
  dnsPacket.aaaa,
  dnsPacket.answer,
  dnsPacket.caa,
  dnsPacket.cname,
  dnsPacket.dname,
  dnsPacket.dnskey,
  dnsPacket.ds,
  dnsPacket.hinfo,
  dnsPacket.mx,
  dnsPacket.name,
  dnsPacket.ns,
  dnsPacket.sshfp,
  dnsPacket.nsec,
  dnsPacket.nsec3,
  dnsPacket.null,
  dnsPacket.opt,
  dnsPacket.option,
  dnsPacket.ptr,
  dnsPacket.question,
  dnsPacket.rp,
  dnsPacket.rrsig,
  dnsPacket.soa,
  dnsPacket.srv,
  dnsPacket.txt,
  dnsPacket.unknown
];

const unknownCodecs: UnknownCodec[] = [
  dnsPacket.unknown,
  dnsPacket.enc('hello')
];

dnsPacket.decode(new Uint8Array([])); // $ExpectType Packet
dnsPacket.decodeList([], dnsPacket.a, new Uint8Array(0)); // $ExpectType Packet[]
dnsPacket.streamDecode(new Uint8Array(0)); // $ExpectType Packet | null
dnsPacket.streamEncode({}); // $ExpectType Uint8Array
