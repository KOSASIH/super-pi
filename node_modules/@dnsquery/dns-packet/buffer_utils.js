"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bytelength = bytelength;
exports.copy = copy;
exports.from = from;
exports.hexLength = hexLength;
exports.readUInt32BE = exports.readUInt16BE = exports.isU8Arr = void 0;
exports.toHex = toHex;
exports.write = write;
exports.writeHex = writeHex;
exports.writeUInt32BE = exports.writeUInt16BE = void 0;
var utf8 = _interopRequireWildcard(require("utf8-codec"), true);
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const isU8Arr = input => input instanceof Uint8Array;
exports.isU8Arr = isU8Arr;
function bytelength(input) {
  return typeof input === 'string' ? utf8.encodingLength(input) : input.byteLength;
}
function from(input) {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (Array.isArray(input)) {
    return new Uint8Array(input);
  }
  return utf8.encode(input);
}
function write(arr, str, start) {
  if (typeof str !== 'string') {
    throw new Error('unknown input type');
  }
  utf8.encode(str, arr, start);
  return utf8.encode.bytes;
}
const hexNum = {};
const numHex = new Array(0xff);
for (let b0 = 0; b0 <= 0xf; b0 += 1) {
  const b0L = b0.toString(16);
  const b0U = b0L.toUpperCase();
  for (let b1 = 0; b1 <= 0xf; b1 += 1) {
    const b1L = b1.toString(16);
    const b1U = b1L.toUpperCase();
    const num = b0 << 4 | b1;
    const hex = `${b0L}${b1L}`;
    numHex[num] = hex;
    hexNum[hex] = num;
    hexNum[`${b0U}${b1L}`] = num;
    hexNum[`${b0L}${b1U}`] = num;
    hexNum[`${b0U}${b1U}`] = num;
  }
}
function toHex(buf, start, end) {
  let result = '';
  for (let offset = start; offset < end;) {
    const num = buf[offset++];
    result += numHex[num];
  }
  return result;
}
function hexLength(string) {
  return string.length >>> 1;
}
function writeHex(buf, string, offset, end) {
  let i = 0;
  while (offset < end) {
    const hex = string.substr(i, 2);
    const num = hexNum[hex];
    if (num === undefined) return;
    buf[offset++] = num;
    i += 2;
  }
  return buf;
}
const P_24 = Math.pow(2, 24);
const P_16 = Math.pow(2, 16);
const P_8 = Math.pow(2, 8);
const readUInt32BE = (buf, offset) => buf[offset] * P_24 + buf[offset + 1] * P_16 + buf[offset + 2] * P_8 + buf[offset + 3];
exports.readUInt32BE = readUInt32BE;
const readUInt16BE = (buf, offset) => buf[offset] << 8 | buf[offset + 1];
exports.readUInt16BE = readUInt16BE;
const writeUInt32BE = (buf, value, offset) => {
  value = +value;
  buf[offset + 3] = value;
  value = value >>> 8;
  buf[offset + 2] = value;
  value = value >>> 8;
  buf[offset + 1] = value;
  value = value >>> 8;
  buf[offset] = value;
  return offset + 4;
};
exports.writeUInt32BE = writeUInt32BE;
const writeUInt16BE = (buf, value, offset) => {
  buf[offset] = value >> 8;
  buf[offset + 1] = value & 0xFF;
  return offset + 2;
};
exports.writeUInt16BE = writeUInt16BE;
function copy(source, target, targetStart, sourceStart, sourceEnd) {
  if (targetStart < 0) {
    sourceStart -= targetStart;
    targetStart = 0;
  }
  if (sourceStart < 0) {
    sourceStart = 0;
  }
  if (sourceEnd < 0) {
    return new Uint8Array(0);
  }
  if (targetStart >= target.length || sourceStart >= sourceEnd) {
    return 0;
  }
  return _copyActual(source, target, targetStart, sourceStart, sourceEnd);
}
function _copyActual(source, target, targetStart, sourceStart, sourceEnd) {
  if (sourceEnd - sourceStart > target.length - targetStart) {
    sourceEnd = sourceStart + target.length - targetStart;
  }
  let nb = sourceEnd - sourceStart;
  const sourceLen = source.length - sourceStart;
  if (nb > sourceLen) {
    nb = sourceLen;
  }
  if (sourceStart !== 0 || sourceEnd < source.length) {
    source = new Uint8Array(source.buffer, source.byteOffset + sourceStart, nb);
  }
  target.set(source, targetStart);
  return nb;
}