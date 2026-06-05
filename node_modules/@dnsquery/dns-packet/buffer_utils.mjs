import * as utf8 from 'utf8-codec'

export const isU8Arr = input => input instanceof Uint8Array

export function bytelength (input) {
  return typeof input === 'string' ? utf8.encodingLength(input) : input.byteLength
}

export function from (input) {
  if (input instanceof Uint8Array) {
    return input
  }
  if (Array.isArray(input)) {
    return new Uint8Array(input)
  }
  return utf8.encode(input)
}

export function write (arr, str, start) {
  if (typeof str !== 'string') {
    throw new Error('unknown input type')
  }
  utf8.encode(str, arr, start)
  return utf8.encode.bytes
}

const hexNum = {}
const numHex = new Array(0xff)
for (let b0 = 0; b0 <= 0xf; b0 += 1) {
  const b0L = b0.toString(16)
  const b0U = b0L.toUpperCase()
  for (let b1 = 0; b1 <= 0xf; b1 += 1) {
    const b1L = b1.toString(16)
    const b1U = b1L.toUpperCase()
    const num = b0 << 4 | b1
    const hex = `${b0L}${b1L}`
    numHex[num] = hex
    hexNum[hex] = num
    hexNum[`${b0U}${b1L}`] = num
    hexNum[`${b0L}${b1U}`] = num
    hexNum[`${b0U}${b1U}`] = num
  }
}

export function toHex (buf, start, end) {
  let result = ''
  for (let offset = start; offset < end;) {
    const num = buf[offset++]
    result += numHex[num]
  }
  return result
}

export function hexLength (string) {
  return string.length >>> 1
}

export function writeHex (buf, string, offset, end) {
  let i = 0
  while (offset < end) {
    const hex = string.substr(i, 2)
    const num = hexNum[hex]
    if (num === undefined) return
    buf[offset++] = num
    i += 2
  }
  return buf
}

const P_24 = Math.pow(2, 24)
const P_16 = Math.pow(2, 16)
const P_8 = Math.pow(2, 8)
export const readUInt32BE = (buf, offset) => buf[offset] * P_24 +
  buf[offset + 1] * P_16 +
  buf[offset + 2] * P_8 +
  buf[offset + 3]

export const readUInt16BE = (buf, offset) => (buf[offset] << 8) | buf[offset + 1]
export const writeUInt32BE = (buf, value, offset) => {
  value = +value
  buf[offset + 3] = value
  value = value >>> 8
  buf[offset + 2] = value
  value = value >>> 8
  buf[offset + 1] = value
  value = value >>> 8
  buf[offset] = value
  return offset + 4
}
export const writeUInt16BE = (buf, value, offset) => {
  buf[offset] = value >> 8
  buf[offset + 1] = value & 0xFF
  return offset + 2
}

export function copy (source, target, targetStart, sourceStart, sourceEnd) {
  if (targetStart < 0) {
    sourceStart -= targetStart
    targetStart = 0
  }

  if (sourceStart < 0) {
    sourceStart = 0
  }

  if (sourceEnd < 0) {
    return new Uint8Array(0)
  }

  if (targetStart >= target.length || sourceStart >= sourceEnd) {
    return 0
  }

  return _copyActual(source, target, targetStart, sourceStart, sourceEnd)
}

function _copyActual (source, target, targetStart, sourceStart, sourceEnd) {
  if (sourceEnd - sourceStart > target.length - targetStart) {
    sourceEnd = sourceStart + target.length - targetStart
  }

  let nb = sourceEnd - sourceStart
  const sourceLen = source.length - sourceStart
  if (nb > sourceLen) {
    nb = sourceLen
  }

  if (sourceStart !== 0 || sourceEnd < source.length) {
    source = new Uint8Array(source.buffer, source.byteOffset + sourceStart, nb)
  }

  target.set(source, targetStart)

  return nb
}
