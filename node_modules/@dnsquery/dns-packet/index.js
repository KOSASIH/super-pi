"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decode = exports.cname = exports.caa = exports.answer = exports.aaaa = exports.a = exports.TRUNCATED_RESPONSE = exports.RECURSION_DESIRED = exports.RECURSION_AVAILABLE = exports.DNSSEC_OK = exports.CHECKING_DISABLED = exports.AUTHORITATIVE_ANSWER = exports.AUTHENTIC_DATA = void 0;
exports.decodeList = decodeList;
exports.ds = exports.dnskey = exports.dname = void 0;
exports.enc = renc;
exports.encode = void 0;
exports.encodeList = encodeList;
exports.encodingLength = void 0;
exports.encodingLengthList = encodingLengthList;
exports.sshfp = exports.srv = exports.soa = exports.rrsig = exports.rp = exports.response = exports.question = exports.query = exports.ptr = exports.packet = exports.option = exports.opt = exports.null = exports.nsec3 = exports.nsec = exports.ns = exports.name = exports.mx = exports.hinfo = void 0;
exports.streamDecode = streamDecode;
exports.streamEncode = streamEncode;
exports.unknown = exports.txt = void 0;
var ip = _interopRequireWildcard(require("@leichtgewicht/ip-codec"), true);
var types = _interopRequireWildcard(require("./types.js"), true);
var rcodes = _interopRequireWildcard(require("./rcodes.js"), true);
var opcodes = _interopRequireWildcard(require("./opcodes.js"), true);
var classes = _interopRequireWildcard(require("./classes.js"), true);
var optioncodes = _interopRequireWildcard(require("./optioncodes.js"), true);
var b = _interopRequireWildcard(require("./buffer_utils.js"), true);
var _utf8Codec = require("utf8-codec");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const QUERY_FLAG = 0;
const RESPONSE_FLAG = 1 << 15;
const FLUSH_MASK = 1 << 15;
const NOT_FLUSH_MASK = ~FLUSH_MASK;
const QU_MASK = 1 << 15;
const NOT_QU_MASK = ~QU_MASK;
function codec({
  bytes = 0,
  encode,
  decode,
  encodingLength
}) {
  encode.bytes = bytes;
  decode.bytes = bytes;
  return {
    encode,
    decode,
    encodingLength: encodingLength || (() => bytes)
  };
}
const name = codec({
  encode(str, buf, offset) {
    if (!buf) buf = new Uint8Array(name.encodingLength(str));
    if (!offset) offset = 0;
    const oldOffset = offset;

    // strip leading and trailing .
    const n = str.replace(/^\.|\.$/gm, '');
    if (n.length) {
      const list = n.split('.');
      for (let i = 0; i < list.length; i++) {
        const len = b.write(buf, list[i], offset + 1);
        buf[offset] = len;
        offset += len + 1;
      }
    }
    buf[offset++] = 0;
    name.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const list = [];
    let oldOffset = offset;
    let totalLength = 0;
    let consumedBytes = 0;
    let jumped = false;
    while (true) {
      if (offset >= buf.length) {
        throw new Error('Cannot decode name (buffer overflow)');
      }
      const len = buf[offset++];
      consumedBytes += jumped ? 0 : 1;
      if (len === 0) {
        break;
      } else if ((len & 0xc0) === 0) {
        if (offset + len > buf.length) {
          throw new Error('Cannot decode name (buffer overflow)');
        }
        totalLength += len + 1;
        if (totalLength > 254) {
          throw new Error('Cannot decode name (name too long)');
        }
        list.push((0, _utf8Codec.decode)(buf, offset, offset + len));
        offset += len;
        consumedBytes += jumped ? 0 : len;
      } else if ((len & 0xc0) === 0xc0) {
        if (offset + 1 > buf.length) {
          throw new Error('Cannot decode name (buffer overflow)');
        }
        const jumpOffset = b.readUInt16BE(buf, offset - 1) - 0xc000;
        if (jumpOffset >= oldOffset) {
          // Allow only pointers to prior data. RFC 1035, section 4.1.4 states:
          // "[...] an entire domain name or a list of labels at the end of a domain name
          // is replaced with a pointer to a prior occurance (sic) of the same name."
          throw new Error('Cannot decode name (bad pointer)');
        }
        offset = jumpOffset;
        oldOffset = jumpOffset;
        consumedBytes += jumped ? 0 : 1;
        jumped = true;
      } else {
        throw new Error('Cannot decode name (bad label)');
      }
    }
    name.decode.bytes = consumedBytes;
    return list.length === 0 ? '.' : list.join('.');
  },
  encodingLength(n) {
    if (n === '.' || n === '..') return 1;
    return b.bytelength(n.replace(/^\.|\.$/gm, '')) + 2;
  }
});
exports.name = name;
const string = codec({
  encode(s, buf, offset) {
    if (!buf) buf = new Uint8Array(string.encodingLength(s));
    if (!offset) offset = 0;
    const len = b.write(buf, s, offset + 1);
    buf[offset] = len;
    string.encode.bytes = len + 1;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const len = buf[offset];
    const s = (0, _utf8Codec.decode)(buf, offset + 1, offset + 1 + len);
    string.decode.bytes = len + 1;
    return s;
  },
  encodingLength(s) {
    return b.bytelength(s) + 1;
  }
});
const header = codec({
  bytes: 12,
  encode(h, buf, offset) {
    if (!buf) buf = new Uint8Array(header.encodingLength(h));
    if (!offset) offset = 0;
    const flags = (h.flags || 0) & 32767;
    const type = h.type === 'response' ? RESPONSE_FLAG : QUERY_FLAG;
    b.writeUInt16BE(buf, h.id || 0, offset);
    b.writeUInt16BE(buf, flags | type, offset + 2);
    b.writeUInt16BE(buf, h.questions.length, offset + 4);
    b.writeUInt16BE(buf, h.answers.length, offset + 6);
    b.writeUInt16BE(buf, h.authorities.length, offset + 8);
    b.writeUInt16BE(buf, h.additionals.length, offset + 10);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    if (buf.length < 12) throw new Error('Header must be 12 bytes');
    const flags = b.readUInt16BE(buf, offset + 2);
    return {
      id: b.readUInt16BE(buf, offset),
      type: flags & RESPONSE_FLAG ? 'response' : 'query',
      flags: flags & 32767,
      flag_qr: (flags >> 15 & 0x1) === 1,
      opcode: opcodes.toString(flags >> 11 & 0xf),
      flag_aa: (flags >> 10 & 0x1) === 1,
      flag_tc: (flags >> 9 & 0x1) === 1,
      flag_rd: (flags >> 8 & 0x1) === 1,
      flag_ra: (flags >> 7 & 0x1) === 1,
      flag_z: (flags >> 6 & 0x1) === 1,
      flag_ad: (flags >> 5 & 0x1) === 1,
      flag_cd: (flags >> 4 & 0x1) === 1,
      rcode: rcodes.toString(flags & 0xf),
      questions: new Array(b.readUInt16BE(buf, offset + 4)),
      answers: new Array(b.readUInt16BE(buf, offset + 6)),
      authorities: new Array(b.readUInt16BE(buf, offset + 8)),
      additionals: new Array(b.readUInt16BE(buf, offset + 10))
    };
  },
  encodingLength() {
    return 12;
  }
});
const runknown = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(runknown.encodingLength(data));
    if (!offset) offset = 0;
    const dLen = data.length;
    b.writeUInt16BE(buf, dLen, offset);
    b.copy(data, buf, offset + 2, 0, dLen);
    runknown.encode.bytes = dLen + 2;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const len = b.readUInt16BE(buf, offset);
    const data = buf.slice(offset + 2, offset + 2 + len);
    runknown.decode.bytes = len + 2;
    return data;
  },
  encodingLength(data) {
    return data.length + 2;
  }
});
exports.unknown = runknown;
const rns = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rns.encodingLength(data));
    if (!offset) offset = 0;
    name.encode(data, buf, offset + 2);
    b.writeUInt16BE(buf, name.encode.bytes, offset);
    rns.encode.bytes = name.encode.bytes + 2;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const len = b.readUInt16BE(buf, offset);
    const dd = name.decode(buf, offset + 2);
    rns.decode.bytes = len + 2;
    return dd;
  },
  encodingLength(data) {
    return name.encodingLength(data) + 2;
  }
});
exports.ns = rns;
const rsoa = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rsoa.encodingLength(data));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2;
    name.encode(data.mname, buf, offset);
    offset += name.encode.bytes;
    name.encode(data.rname, buf, offset);
    offset += name.encode.bytes;
    b.writeUInt32BE(buf, data.serial || 0, offset);
    offset += 4;
    b.writeUInt32BE(buf, data.refresh || 0, offset);
    offset += 4;
    b.writeUInt32BE(buf, data.retry || 0, offset);
    offset += 4;
    b.writeUInt32BE(buf, data.expire || 0, offset);
    offset += 4;
    b.writeUInt32BE(buf, data.minimum || 0, offset);
    offset += 4;
    b.writeUInt16BE(buf, offset - oldOffset - 2, oldOffset);
    rsoa.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.mname = name.decode(buf, offset);
    offset += name.decode.bytes;
    data.rname = name.decode(buf, offset);
    offset += name.decode.bytes;
    data.serial = b.readUInt32BE(buf, offset);
    offset += 4;
    data.refresh = b.readUInt32BE(buf, offset);
    offset += 4;
    data.retry = b.readUInt32BE(buf, offset);
    offset += 4;
    data.expire = b.readUInt32BE(buf, offset);
    offset += 4;
    data.minimum = b.readUInt32BE(buf, offset);
    offset += 4;
    rsoa.decode.bytes = offset - oldOffset;
    return data;
  },
  encodingLength(data) {
    return 22 + name.encodingLength(data.mname) + name.encodingLength(data.rname);
  }
});
exports.soa = rsoa;
const rtxt = codec({
  encode(data, buf, offset) {
    if (!Array.isArray(data)) data = [data];
    for (let i = 0; i < data.length; i++) {
      if (typeof data[i] === 'string') {
        data[i] = b.from(data[i]);
      }
      if (!b.isU8Arr(data[i])) {
        throw new Error('Must be a Buffer');
      }
    }
    if (!buf) buf = new Uint8Array(rtxt.encodingLength(data));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2;
    data.forEach(function (d) {
      buf[offset++] = d.length;
      b.copy(d, buf, offset, 0, d.length);
      offset += d.length;
    });
    b.writeUInt16BE(buf, offset - oldOffset - 2, oldOffset);
    rtxt.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    let remaining = b.readUInt16BE(buf, offset);
    offset += 2;
    const data = [];
    while (remaining > 0) {
      const len = buf[offset++];
      --remaining;
      if (remaining < len) {
        throw new Error('Buffer overflow');
      }
      data.push(buf.slice(offset, offset + len));
      offset += len;
      remaining -= len;
    }
    rtxt.decode.bytes = offset - oldOffset;
    return data;
  },
  encodingLength(data) {
    if (!Array.isArray(data)) data = [data];
    let length = 2;
    data.forEach(function (buf) {
      if (typeof buf === 'string') {
        length += b.bytelength(buf) + 1;
      } else {
        length += buf.length + 1;
      }
    });
    return length;
  }
});
exports.txt = rtxt;
const rnull = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rnull.encodingLength(data));
    if (!offset) offset = 0;
    if (typeof data === 'string') data = b.from(data);
    if (!data) data = new Uint8Array(0);
    const oldOffset = offset;
    offset += 2;
    const len = data.length;
    b.copy(data, buf, offset, 0, len);
    offset += len;
    b.writeUInt16BE(buf, offset - oldOffset - 2, oldOffset);
    rnull.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const len = b.readUInt16BE(buf, offset);
    offset += 2;
    const data = buf.slice(offset, offset + len);
    offset += len;
    rnull.decode.bytes = offset - oldOffset;
    return data;
  },
  encodingLength(data) {
    if (!data) return 2;
    return (b.isU8Arr(data) ? data.length : b.bytelength(data)) + 2;
  }
});
exports.null = rnull;
const rhinfo = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rhinfo.encodingLength(data));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2;
    string.encode(data.cpu, buf, offset);
    offset += string.encode.bytes;
    string.encode(data.os, buf, offset);
    offset += string.encode.bytes;
    b.writeUInt16BE(buf, offset - oldOffset - 2, oldOffset);
    rhinfo.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.cpu = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.os = string.decode(buf, offset);
    offset += string.decode.bytes;
    rhinfo.decode.bytes = offset - oldOffset;
    return data;
  },
  encodingLength(data) {
    return string.encodingLength(data.cpu) + string.encodingLength(data.os) + 2;
  }
});
exports.hinfo = rhinfo;
const rptr = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rptr.encodingLength(data));
    if (!offset) offset = 0;
    name.encode(data, buf, offset + 2);
    b.writeUInt16BE(buf, name.encode.bytes, offset);
    rptr.encode.bytes = name.encode.bytes + 2;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const data = name.decode(buf, offset + 2);
    rptr.decode.bytes = name.decode.bytes + 2;
    return data;
  },
  encodingLength(data) {
    return name.encodingLength(data) + 2;
  }
});
exports.dname = exports.cname = exports.ptr = rptr;
const rsrv = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rsrv.encodingLength(data));
    if (!offset) offset = 0;
    b.writeUInt16BE(buf, data.priority || 0, offset + 2);
    b.writeUInt16BE(buf, data.weight || 0, offset + 4);
    b.writeUInt16BE(buf, data.port || 0, offset + 6);
    name.encode(data.target, buf, offset + 8);
    const len = name.encode.bytes + 6;
    b.writeUInt16BE(buf, len, offset);
    rsrv.encode.bytes = len + 2;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const len = b.readUInt16BE(buf, offset);
    const data = {};
    data.priority = b.readUInt16BE(buf, offset + 2);
    data.weight = b.readUInt16BE(buf, offset + 4);
    data.port = b.readUInt16BE(buf, offset + 6);
    data.target = name.decode(buf, offset + 8);
    rsrv.decode.bytes = len + 2;
    return data;
  },
  encodingLength(data) {
    return 8 + name.encodingLength(data.target);
  }
});
exports.srv = rsrv;
const rcaa = codec({
  encode(data, buf, offset) {
    const len = rcaa.encodingLength(data);
    if (!buf) buf = new Uint8Array(rcaa.encodingLength(data));
    if (!offset) offset = 0;
    if (data.issuerCritical) {
      data.flags = rcaa.ISSUER_CRITICAL;
    }
    b.writeUInt16BE(buf, len - 2, offset);
    offset += 2;
    buf[offset] = data.flags || 0;
    offset += 1;
    string.encode(data.tag, buf, offset);
    offset += string.encode.bytes;
    b.write(buf, data.value, offset);
    offset += b.bytelength(data.value);
    rcaa.encode.bytes = len;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const len = b.readUInt16BE(buf, offset);
    offset += 2;
    const oldOffset = offset;
    const data = {};
    data.flags = buf[offset];
    offset += 1;
    data.tag = string.decode(buf, offset);
    offset += string.decode.bytes;
    data.value = (0, _utf8Codec.decode)(buf, offset, oldOffset + len);
    data.issuerCritical = !!(data.flags & rcaa.ISSUER_CRITICAL);
    rcaa.decode.bytes = len + 2;
    return data;
  },
  encodingLength(data) {
    return string.encodingLength(data.tag) + string.encodingLength(data.value) + 2;
  }
});
exports.caa = rcaa;
rcaa.ISSUER_CRITICAL = 1 << 7;
const rmx = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rmx.encodingLength(data));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2;
    b.writeUInt16BE(buf, data.preference || 0, offset);
    offset += 2;
    name.encode(data.exchange, buf, offset);
    offset += name.encode.bytes;
    b.writeUInt16BE(buf, offset - oldOffset - 2, oldOffset);
    rmx.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.preference = b.readUInt16BE(buf, offset);
    offset += 2;
    data.exchange = name.decode(buf, offset);
    offset += name.decode.bytes;
    rmx.decode.bytes = offset - oldOffset;
    return data;
  },
  encodingLength(data) {
    return 4 + name.encodingLength(data.exchange);
  }
});
exports.mx = rmx;
const ra = codec({
  encode(host, buf, offset) {
    if (!buf) buf = new Uint8Array(ra.encodingLength(host));
    if (!offset) offset = 0;
    b.writeUInt16BE(buf, 4, offset);
    offset += 2;
    ip.v4.encode(host, buf, offset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    offset += 2;
    const host = ip.v4.decode(buf, offset);
    return host;
  },
  bytes: 6
});
exports.a = ra;
const raaaa = codec({
  encode(host, buf, offset) {
    if (!buf) buf = new Uint8Array(raaaa.encodingLength(host));
    if (!offset) offset = 0;
    b.writeUInt16BE(buf, 16, offset);
    offset += 2;
    ip.v6.encode(host, buf, offset);
    raaaa.encode.bytes = 18;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    offset += 2;
    const host = ip.v6.decode(buf, offset);
    raaaa.decode.bytes = 18;
    return host;
  },
  bytes: 18
});
exports.aaaa = raaaa;
const alloc = size => new Uint8Array(size);
const roption = codec({
  encode(option, buf, offset) {
    if (!buf) buf = new Uint8Array(roption.encodingLength(option));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const code = optioncodes.toCode(option.code);
    b.writeUInt16BE(buf, code, offset);
    offset += 2;
    if (option.data) {
      b.writeUInt16BE(buf, option.data.length, offset);
      offset += 2;
      b.copy(option.data, buf, offset);
      offset += option.data.length;
    } else {
      switch (code) {
        // case 3: NSID.  No encode makes sense.
        // case 5,6,7: Not implementable
        case 8:
          // ECS
          {
            // note: do IP math before calling
            const spl = option.sourcePrefixLength || 0;
            const fam = option.family || ip.familyOf(option.ip, alloc);
            const ipBuf = ip.encode(option.ip, alloc);
            const ipLen = Math.ceil(spl / 8);
            b.writeUInt16BE(buf, ipLen + 4, offset);
            offset += 2;
            b.writeUInt16BE(buf, fam, offset);
            offset += 2;
            buf[offset++] = spl;
            buf[offset++] = option.scopePrefixLength || 0;
            b.copy(ipBuf, buf, offset, 0, ipLen);
            offset += ipLen;
          }
          break;
        // case 9: EXPIRE (experimental)
        // case 10: COOKIE.  No encode makes sense.
        case 11:
          // KEEP-ALIVE
          if (option.timeout) {
            b.writeUInt16BE(buf, 2, offset);
            offset += 2;
            b.writeUInt16BE(buf, option.timeout, offset);
            offset += 2;
          } else {
            b.writeUInt16BE(buf, 0, offset);
            offset += 2;
          }
          break;
        case 12:
          // PADDING
          {
            const len = option.length || 0;
            b.writeUInt16BE(buf, len, offset);
            offset += 2;
            buf.fill(0, offset, offset + len);
            offset += len;
          }
          break;
        // case 13:  CHAIN.  Experimental.
        case 14:
          // KEY-TAG
          {
            const tagsLen = option.tags.length * 2;
            b.writeUInt16BE(buf, tagsLen, offset);
            offset += 2;
            for (const tag of option.tags) {
              b.writeUInt16BE(buf, tag, offset);
              offset += 2;
            }
          }
          break;
        default:
          throw new Error(`Unknown roption code: ${option.code}`);
      }
    }
    roption.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const option = {};
    option.code = b.readUInt16BE(buf, offset);
    option.type = optioncodes.toString(option.code);
    offset += 2;
    const len = b.readUInt16BE(buf, offset);
    offset += 2;
    option.data = buf.slice(offset, offset + len);
    switch (option.code) {
      // case 3: NSID.  No decode makes sense.
      case 8:
        // ECS
        option.family = b.readUInt16BE(buf, offset);
        offset += 2;
        option.sourcePrefixLength = buf[offset++];
        option.scopePrefixLength = buf[offset++];
        {
          const padded = new Uint8Array(option.family === 1 ? 4 : 16);
          b.copy(buf, padded, 0, offset, offset + len - 4);
          option.ip = ip.decode(padded);
        }
        break;
      // case 12: Padding.  No decode makes sense.
      case 11:
        // KEEP-ALIVE
        if (len > 0) {
          option.timeout = b.readUInt16BE(buf, offset);
          offset += 2;
        }
        break;
      case 14:
        option.tags = [];
        for (let i = 0; i < len; i += 2) {
          option.tags.push(b.readUInt16BE(buf, offset));
          offset += 2;
        }
      // don't worry about default.  caller will use data if desired
    }

    roption.decode.bytes = len + 4;
    return option;
  },
  encodingLength(option) {
    if (option.data) {
      return option.data.length + 4;
    }
    const code = optioncodes.toCode(option.code);
    switch (code) {
      case 8:
        // ECS
        {
          const spl = option.sourcePrefixLength || 0;
          return Math.ceil(spl / 8) + 8;
        }
      case 11:
        // KEEP-ALIVE
        return typeof option.timeout === 'number' ? 6 : 4;
      case 12:
        // PADDING
        return option.length + 4;
      case 14:
        // KEY-TAG
        return 4 + option.tags.length * 2;
    }
    throw new Error(`Unknown roption code: ${option.code}`);
  }
});
exports.option = roption;
const ropt = codec({
  encode(options, buf, offset) {
    if (!buf) buf = new Uint8Array(ropt.encodingLength(options));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const rdlen = encodingLengthList(options, roption);
    b.writeUInt16BE(buf, rdlen, offset);
    offset = encodeList(options, roption, buf, offset + 2);
    ropt.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const options = [];
    let rdlen = b.readUInt16BE(buf, offset);
    offset += 2;
    let o = 0;
    while (rdlen > 0) {
      options[o++] = roption.decode(buf, offset);
      offset += roption.decode.bytes;
      rdlen -= roption.decode.bytes;
    }
    ropt.decode.bytes = offset - oldOffset;
    return options;
  },
  encodingLength(options) {
    return 2 + encodingLengthList(options || [], roption);
  }
});
exports.opt = ropt;
const rdnskey = codec({
  encode(key, buf, offset) {
    if (!buf) buf = new Uint8Array(rdnskey.encodingLength(key));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const keydata = key.key;
    if (!b.isU8Arr(keydata)) {
      throw new Error('Key must be a Buffer');
    }
    offset += 2; // Leave space for length
    b.writeUInt16BE(buf, key.flags, offset);
    offset += 2;
    buf[offset] = rdnskey.PROTOCOL_DNSSEC;
    offset += 1;
    buf[offset] = key.algorithm;
    offset += 1;
    b.copy(keydata, buf, offset, 0, keydata.length);
    offset += keydata.length;
    rdnskey.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rdnskey.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const key = {};
    const length = b.readUInt16BE(buf, offset);
    offset += 2;
    key.flags = b.readUInt16BE(buf, offset);
    offset += 2;
    if (buf[offset] !== rdnskey.PROTOCOL_DNSSEC) {
      throw new Error('Protocol must be 3');
    }
    offset += 1;
    key.algorithm = buf[offset];
    offset += 1;
    key.key = buf.slice(offset, oldOffset + length + 2);
    offset += key.key.length;
    rdnskey.decode.bytes = offset - oldOffset;
    return key;
  },
  encodingLength(key) {
    return 6 + b.bytelength(key.key);
  }
});
exports.dnskey = rdnskey;
rdnskey.PROTOCOL_DNSSEC = 3;
rdnskey.ZONE_KEY = 0x80;
rdnskey.SECURE_ENTRYPOINT = 0x8000;
const rrrsig = codec({
  encode(sig, buf, offset) {
    if (!buf) buf = new Uint8Array(rrrsig.encodingLength(sig));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const signature = sig.signature;
    if (!b.isU8Arr(signature)) {
      throw new Error('Signature must be a Buffer');
    }
    offset += 2; // Leave space for length
    b.writeUInt16BE(buf, types.toType(sig.typeCovered), offset);
    offset += 2;
    buf[offset] = sig.algorithm;
    offset += 1;
    buf[offset] = sig.labels;
    offset += 1;
    b.writeUInt32BE(buf, sig.originalTTL, offset);
    offset += 4;
    b.writeUInt32BE(buf, sig.expiration, offset);
    offset += 4;
    b.writeUInt32BE(buf, sig.inception, offset);
    offset += 4;
    b.writeUInt16BE(buf, sig.keyTag, offset);
    offset += 2;
    name.encode(sig.signersName, buf, offset);
    offset += name.encode.bytes;
    b.copy(signature, buf, offset, 0, signature.length);
    offset += signature.length;
    rrrsig.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rrrsig.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const sig = {};
    const length = b.readUInt16BE(buf, offset);
    offset += 2;
    sig.typeCovered = types.toString(b.readUInt16BE(buf, offset));
    offset += 2;
    sig.algorithm = buf[offset];
    offset += 1;
    sig.labels = buf[offset];
    offset += 1;
    sig.originalTTL = b.readUInt32BE(buf, offset);
    offset += 4;
    sig.expiration = b.readUInt32BE(buf, offset);
    offset += 4;
    sig.inception = b.readUInt32BE(buf, offset);
    offset += 4;
    sig.keyTag = b.readUInt16BE(buf, offset);
    offset += 2;
    sig.signersName = name.decode(buf, offset);
    offset += name.decode.bytes;
    sig.signature = buf.slice(offset, oldOffset + length + 2);
    offset += sig.signature.length;
    rrrsig.decode.bytes = offset - oldOffset;
    return sig;
  },
  encodingLength(sig) {
    return 20 + name.encodingLength(sig.signersName) + b.bytelength(sig.signature);
  }
});
exports.rrsig = rrrsig;
const rrp = codec({
  encode(data, buf, offset) {
    if (!buf) buf = new Uint8Array(rrp.encodingLength(data));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2; // Leave space for length
    name.encode(data.mbox || '.', buf, offset);
    offset += name.encode.bytes;
    name.encode(data.txt || '.', buf, offset);
    offset += name.encode.bytes;
    rrp.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rrp.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const data = {};
    offset += 2;
    data.mbox = name.decode(buf, offset) || '.';
    offset += name.decode.bytes;
    data.txt = name.decode(buf, offset) || '.';
    offset += name.decode.bytes;
    rrp.decode.bytes = offset - oldOffset;
    return data;
  },
  encodingLength(data) {
    return 2 + name.encodingLength(data.mbox || '.') + name.encodingLength(data.txt || '.');
  }
});
exports.rp = rrp;
const typebitmap = codec({
  encode(typelist, buf, offset) {
    if (!buf) buf = new Uint8Array(typebitmap.encodingLength(typelist));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const typesByWindow = [];
    for (let i = 0; i < typelist.length; i++) {
      const typeid = types.toType(typelist[i]);
      if (typesByWindow[typeid >> 8] === undefined) {
        typesByWindow[typeid >> 8] = [];
      }
      typesByWindow[typeid >> 8][typeid >> 3 & 0x1F] |= 1 << 7 - (typeid & 0x7);
    }
    for (let i = 0; i < typesByWindow.length; i++) {
      if (typesByWindow[i] !== undefined) {
        const windowBuf = b.from(typesByWindow[i]);
        buf[offset] = i;
        offset += 1;
        buf[offset] = windowBuf.length;
        offset += 1;
        b.copy(windowBuf, buf, offset, 0, windowBuf.length);
        offset += windowBuf.length;
      }
    }
    typebitmap.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset, length) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const typelist = [];
    while (offset - oldOffset < length) {
      const window = buf[offset];
      offset += 1;
      const windowLength = buf[offset];
      offset += 1;
      for (let i = 0; i < windowLength; i++) {
        const b = buf[offset + i];
        for (let j = 0; j < 8; j++) {
          if (b & 1 << 7 - j) {
            const typeid = types.toString(window << 8 | i << 3 | j);
            typelist.push(typeid);
          }
        }
      }
      offset += windowLength;
    }
    typebitmap.decode.bytes = offset - oldOffset;
    return typelist;
  },
  encodingLength(typelist) {
    const extents = [];
    for (let i = 0; i < typelist.length; i++) {
      const typeid = types.toType(typelist[i]);
      extents[typeid >> 8] = Math.max(extents[typeid >> 8] || 0, typeid & 0xFF);
    }
    let len = 0;
    for (let i = 0; i < extents.length; i++) {
      if (extents[i] !== undefined) {
        len += 2 + Math.ceil((extents[i] + 1) / 8);
      }
    }
    return len;
  }
});
const rnsec = codec({
  encode(record, buf, offset) {
    if (!buf) buf = new Uint8Array(rnsec.encodingLength(record));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2; // Leave space for length
    name.encode(record.nextDomain, buf, offset);
    offset += name.encode.bytes;
    typebitmap.encode(record.rrtypes, buf, offset);
    offset += typebitmap.encode.bytes;
    rnsec.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rnsec.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const record = {};
    const length = b.readUInt16BE(buf, offset);
    offset += 2;
    record.nextDomain = name.decode(buf, offset);
    offset += name.decode.bytes;
    record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset));
    offset += typebitmap.decode.bytes;
    rnsec.decode.bytes = offset - oldOffset;
    return record;
  },
  encodingLength(record) {
    return 2 + name.encodingLength(record.nextDomain) + typebitmap.encodingLength(record.rrtypes);
  }
});
exports.nsec = rnsec;
const rnsec3 = codec({
  encode(record, buf, offset) {
    if (!buf) buf = new Uint8Array(rnsec3.encodingLength(record));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const salt = record.salt;
    if (!b.isU8Arr(salt)) {
      throw new Error('salt must be a Buffer');
    }
    const nextDomain = record.nextDomain;
    if (!b.isU8Arr(nextDomain)) {
      throw new Error('nextDomain must be a Buffer');
    }
    offset += 2; // Leave space for length
    buf[offset] = record.algorithm;
    offset += 1;
    buf[offset] = record.flags;
    offset += 1;
    b.writeUInt16BE(buf, record.iterations, offset);
    offset += 2;
    buf[offset] = salt.length;
    offset += 1;
    b.copy(salt, buf, offset, 0, salt.length);
    offset += salt.length;
    buf[offset] = nextDomain.length;
    offset += 1;
    b.copy(nextDomain, buf, offset, 0, nextDomain.length);
    offset += nextDomain.length;
    typebitmap.encode(record.rrtypes, buf, offset);
    offset += typebitmap.encode.bytes;
    rnsec3.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rnsec3.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const record = {};
    const length = b.readUInt16BE(buf, offset);
    offset += 2;
    record.algorithm = buf[offset];
    offset += 1;
    record.flags = buf[offset];
    offset += 1;
    record.iterations = b.readUInt16BE(buf, offset);
    offset += 2;
    const saltLength = buf[offset];
    offset += 1;
    record.salt = buf.slice(offset, offset + saltLength);
    offset += saltLength;
    const hashLength = buf[offset];
    offset += 1;
    record.nextDomain = buf.slice(offset, offset + hashLength);
    offset += hashLength;
    record.rrtypes = typebitmap.decode(buf, offset, length - (offset - oldOffset));
    offset += typebitmap.decode.bytes;
    rnsec3.decode.bytes = offset - oldOffset;
    return record;
  },
  encodingLength(record) {
    return 8 + record.salt.length + record.nextDomain.length + typebitmap.encodingLength(record.rrtypes);
  }
});
exports.nsec3 = rnsec3;
const rds = codec({
  encode(digest, buf, offset) {
    if (!buf) buf = new Uint8Array(rds.encodingLength(digest));
    if (!offset) offset = 0;
    const oldOffset = offset;
    const digestdata = digest.digest;
    if (!b.isU8Arr(digestdata)) {
      throw new Error('Digest must be a Buffer');
    }
    offset += 2; // Leave space for length
    b.writeUInt16BE(buf, digest.keyTag, offset);
    offset += 2;
    buf[offset] = digest.algorithm;
    offset += 1;
    buf[offset] = digest.digestType;
    offset += 1;
    b.copy(digestdata, buf, offset, 0, digestdata.length);
    offset += digestdata.length;
    rds.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rds.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const digest = {};
    const length = b.readUInt16BE(buf, offset);
    offset += 2;
    digest.keyTag = b.readUInt16BE(buf, offset);
    offset += 2;
    digest.algorithm = buf[offset];
    offset += 1;
    digest.digestType = buf[offset];
    offset += 1;
    digest.digest = buf.slice(offset, oldOffset + length + 2);
    offset += digest.digest.length;
    rds.decode.bytes = offset - oldOffset;
    return digest;
  },
  encodingLength(digest) {
    return 6 + b.bytelength(digest.digest);
  }
});
exports.ds = rds;
const rsshfp = codec({
  encode(record, buf, offset) {
    if (!buf) buf = new Uint8Array(rsshfp.encodingLength(record));
    if (!offset) offset = 0;
    const oldOffset = offset;
    offset += 2; // The function call starts with the offset pointer at the RDLENGTH field, not the RDATA one
    buf[offset] = record.algorithm;
    offset += 1;
    buf[offset] = record.hash;
    offset += 1;
    const fingerprintLength = b.hexLength(record.fingerprint);
    const expectedLength = getFingerprintLengthForHashType(record.hash);
    if (fingerprintLength !== expectedLength) {
      throw new Error(`Invalid length of fingerprint "${record.fingerprint}" for hashType=${record.hash}: ${fingerprintLength} != ${expectedLength}`);
    }
    b.writeHex(buf, record.fingerprint, offset, offset += fingerprintLength);
    rsshfp.encode.bytes = offset - oldOffset;
    b.writeUInt16BE(buf, rsshfp.encode.bytes - 2, oldOffset);
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const record = {};
    offset += 2; // Account for the RDLENGTH field
    record.algorithm = buf[offset];
    offset += 1;
    record.hash = buf[offset];
    offset += 1;
    const fingerprintLength = getFingerprintLengthForHashType(record.hash);
    record.fingerprint = b.toHex(buf, offset, offset + fingerprintLength);
    offset += fingerprintLength;
    rsshfp.decode.bytes = offset - oldOffset;
    return record;
  },
  encodingLength(record) {
    return 4 + b.hexLength(record.fingerprint);
  }
});
exports.sshfp = rsshfp;
function getFingerprintLengthForHashType(hashType) {
  if (hashType === 1) return 20;
  if (hashType === 2) return 32;
  throw new Error(`Invalid hashType=${hashType}, supported=1,2`);
}
rsshfp.getFingerprintLengthForHashType = getFingerprintLengthForHashType;
function renc(type) {
  switch (type.toUpperCase()) {
    case 'A':
      return ra;
    case 'PTR':
      return rptr;
    case 'CNAME':
      return rptr;
    case 'DNAME':
      return rptr;
    case 'TXT':
      return rtxt;
    case 'NULL':
      return rnull;
    case 'AAAA':
      return raaaa;
    case 'SRV':
      return rsrv;
    case 'HINFO':
      return rhinfo;
    case 'CAA':
      return rcaa;
    case 'NS':
      return rns;
    case 'SOA':
      return rsoa;
    case 'MX':
      return rmx;
    case 'OPT':
      return ropt;
    case 'DNSKEY':
      return rdnskey;
    case 'RRSIG':
      return rrrsig;
    case 'RP':
      return rrp;
    case 'NSEC':
      return rnsec;
    case 'NSEC3':
      return rnsec3;
    case 'SSHFP':
      return rsshfp;
    case 'DS':
      return rds;
  }
  return runknown;
}
const answer = codec({
  encode(a, buf, offset) {
    if (!buf) buf = new Uint8Array(answer.encodingLength(a));
    if (!offset) offset = 0;
    const oldOffset = offset;
    name.encode(a.name, buf, offset);
    offset += name.encode.bytes;
    b.writeUInt16BE(buf, types.toType(a.type), offset);
    if (a.type.toUpperCase() === 'OPT') {
      if (a.name !== '.') {
        throw new Error('OPT name must be root.');
      }
      b.writeUInt16BE(buf, a.udpPayloadSize || 4096, offset + 2);
      buf[offset + 4] = a.extendedRcode || 0;
      buf[offset + 5] = a.ednsVersion || 0;
      b.writeUInt16BE(buf, a.flags || 0, offset + 6);
      offset += 8;
      ropt.encode(a.options || [], buf, offset);
      offset += ropt.encode.bytes;
    } else {
      let klass = classes.toClass(a.class === undefined ? 'IN' : a.class);
      if (a.flush) klass |= FLUSH_MASK; // the 1st bit of the class is the flush bit
      b.writeUInt16BE(buf, klass, offset + 2);
      b.writeUInt32BE(buf, a.ttl || 0, offset + 4);
      offset += 8;
      const enc = renc(a.type);
      enc.encode(a.data, buf, offset);
      offset += enc.encode.bytes;
    }
    answer.encode.bytes = offset - oldOffset;
    return buf;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const a = {};
    const oldOffset = offset;
    a.name = name.decode(buf, offset);
    offset += name.decode.bytes;
    a.type = types.toString(b.readUInt16BE(buf, offset));
    if (a.type === 'OPT') {
      a.udpPayloadSize = b.readUInt16BE(buf, offset + 2);
      a.extendedRcode = buf[offset + 4];
      a.ednsVersion = buf[offset + 5];
      a.flags = b.readUInt16BE(buf, offset + 6);
      a.flag_do = (a.flags >> 15 & 0x1) === 1;
      a.options = ropt.decode(buf, offset + 8);
      offset += 8 + ropt.decode.bytes;
    } else {
      const klass = b.readUInt16BE(buf, offset + 2);
      a.ttl = b.readUInt32BE(buf, offset + 4);
      a.class = classes.toString(klass & NOT_FLUSH_MASK);
      a.flush = !!(klass & FLUSH_MASK);
      const enc = renc(a.type);
      a.data = enc.decode(buf, offset + 8);
      offset += 8 + enc.decode.bytes;
    }
    answer.decode.bytes = offset - oldOffset;
    return a;
  },
  encodingLength(a) {
    const data = a.data !== null && a.data !== undefined ? a.data : a.options;
    return name.encodingLength(a.name) + 8 + renc(a.type).encodingLength(data);
  }
});
exports.answer = answer;
const question = codec({
  encode(q, buf, offset) {
    if (!buf) buf = new Uint8Array(question.encodingLength(q));
    if (!offset) offset = 0;
    const oldOffset = offset;
    name.encode(q.name, buf, offset);
    offset += name.encode.bytes;
    b.writeUInt16BE(buf, types.toType(q.type), offset);
    offset += 2;
    b.writeUInt16BE(buf, classes.toClass(q.class === undefined ? 'IN' : q.class), offset);
    offset += 2;
    question.encode.bytes = offset - oldOffset;
    return q;
  },
  decode(buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const q = {};
    q.name = name.decode(buf, offset);
    offset += name.decode.bytes;
    q.type = types.toString(b.readUInt16BE(buf, offset));
    offset += 2;
    q.class = classes.toString(b.readUInt16BE(buf, offset));
    offset += 2;
    const qu = !!(q.class & QU_MASK);
    if (qu) q.class &= NOT_QU_MASK;
    question.decode.bytes = offset - oldOffset;
    return q;
  },
  encodingLength(q) {
    return name.encodingLength(q.name) + 4;
  }
});
exports.question = question;
const AUTHORITATIVE_ANSWER = 1 << 10;
exports.AUTHORITATIVE_ANSWER = AUTHORITATIVE_ANSWER;
const TRUNCATED_RESPONSE = 1 << 9;
exports.TRUNCATED_RESPONSE = TRUNCATED_RESPONSE;
const RECURSION_DESIRED = 1 << 8;
exports.RECURSION_DESIRED = RECURSION_DESIRED;
const RECURSION_AVAILABLE = 1 << 7;
exports.RECURSION_AVAILABLE = RECURSION_AVAILABLE;
const AUTHENTIC_DATA = 1 << 5;
exports.AUTHENTIC_DATA = AUTHENTIC_DATA;
const CHECKING_DISABLED = 1 << 4;
exports.CHECKING_DISABLED = CHECKING_DISABLED;
const DNSSEC_OK = 1 << 15;
exports.DNSSEC_OK = DNSSEC_OK;
const packet = {
  encode: function (result, buf, offset) {
    const allocing = !buf;
    if (allocing) buf = new Uint8Array(encodingLength(result));
    if (!offset) offset = 0;
    const oldOffset = offset;
    if (!result.questions) result.questions = [];
    if (!result.answers) result.answers = [];
    if (!result.authorities) result.authorities = [];
    if (!result.additionals) result.additionals = [];
    header.encode(result, buf, offset);
    offset += header.encode.bytes;
    offset = encodeList(result.questions, question, buf, offset);
    offset = encodeList(result.answers, answer, buf, offset);
    offset = encodeList(result.authorities, answer, buf, offset);
    offset = encodeList(result.additionals, answer, buf, offset);
    packet.encode.bytes = offset - oldOffset;

    // just a quick sanity check
    if (allocing && encode.bytes !== buf.length) {
      return buf.slice(0, encode.bytes);
    }
    return buf;
  },
  decode: function (buf, offset) {
    if (!offset) offset = 0;
    const oldOffset = offset;
    const result = header.decode(buf, offset);
    offset += header.decode.bytes;
    offset = decodeList(result.questions, question, buf, offset);
    offset = decodeList(result.answers, answer, buf, offset);
    offset = decodeList(result.authorities, answer, buf, offset);
    offset = decodeList(result.additionals, answer, buf, offset);
    packet.decode.bytes = offset - oldOffset;
    return result;
  },
  encodingLength: function (result) {
    return header.encodingLength(result) + encodingLengthList(result.questions || [], question) + encodingLengthList(result.answers || [], answer) + encodingLengthList(result.authorities || [], answer) + encodingLengthList(result.additionals || [], answer);
  }
};
exports.packet = packet;
packet.encode.bytes = 0;
packet.decode.bytes = 0;
function sanitizeSingle(input, type) {
  if (input.questions) {
    throw new Error('Only one .question object expected instead of a .questions array!');
  }
  const sanitized = Object.assign({
    type
  }, input);
  if (sanitized.question) {
    sanitized.questions = [sanitized.question];
    delete sanitized.question;
  }
  return sanitized;
}
const query = {
  encode: function (result, buf, offset) {
    buf = packet.encode(sanitizeSingle(result, 'query'), buf, offset);
    query.encode.bytes = packet.encode.bytes;
    return buf;
  },
  decode: function (buf, offset) {
    const res = packet.decode(buf, offset);
    query.decode.bytes = packet.decode.bytes;
    if (res.questions) {
      res.question = res.questions[0];
      delete res.questions;
    }
    return res;
  },
  encodingLength: function (result) {
    return packet.encodingLength(sanitizeSingle(result, 'query'));
  }
};
exports.query = query;
query.encode.bytes = 0;
query.decode.bytes = 0;
const response = {
  encode: function (result, buf, offset) {
    buf = packet.encode(sanitizeSingle(result, 'response'), buf, offset);
    response.encode.bytes = packet.encode.bytes;
    return buf;
  },
  decode: function (buf, offset) {
    const res = packet.decode(buf, offset);
    response.decode.bytes = packet.decode.bytes;
    if (res.questions) {
      res.question = res.questions[0];
      delete res.questions;
    }
    return res;
  },
  encodingLength: function (result) {
    return packet.encodingLength(sanitizeSingle(result, 'response'));
  }
};
exports.response = response;
response.encode.bytes = 0;
response.decode.bytes = 0;
const encode = packet.encode;
exports.encode = encode;
const decode = packet.decode;
exports.decode = decode;
const encodingLength = packet.encodingLength;
exports.encodingLength = encodingLength;
function streamEncode(result) {
  const buf = encode(result);
  const combine = new Uint8Array(2 + buf.byteLength);
  b.writeUInt16BE(combine, buf.byteLength);
  b.copy(buf, combine, 2, 0, buf.length);
  streamEncode.bytes = combine.byteLength;
  return combine;
}
streamEncode.bytes = 0;
function streamDecode(sbuf) {
  const len = b.readUInt16BE(sbuf, 0);
  if (sbuf.byteLength < len + 2) {
    // not enough data
    return null;
  }
  const result = decode(sbuf.slice(2));
  streamDecode.bytes = decode.bytes;
  return result;
}
streamDecode.bytes = 0;
function encodingLengthList(list, enc) {
  let len = 0;
  for (let i = 0; i < list.length; i++) len += enc.encodingLength(list[i]);
  return len;
}
function encodeList(list, enc, buf, offset) {
  for (let i = 0; i < list.length; i++) {
    enc.encode(list[i], buf, offset);
    offset += enc.encode.bytes;
  }
  return offset;
}
function decodeList(list, enc, buf, offset) {
  for (let i = 0; i < list.length; i++) {
    list[i] = enc.decode(buf, offset);
    offset += enc.decode.bytes;
  }
  return offset;
}