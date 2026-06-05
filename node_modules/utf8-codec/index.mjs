const SURROGATE_A = 0b1101100000000000
const SURROGATE_B = 0b1101110000000000

export const name = 'utf8'

export function encodingLength (str) {
  let len = 0
  const strLen = str.length
  for (let i = 0; i < strLen; i += 1) {
    const code = str.charCodeAt(i)
    if (code <= 0x7F) {
      len += 1
    } else if (code <= 0x07FF) {
      len += 2
    } else if ((code & 0xF800) !== SURROGATE_A) {
      len += 3
    } else {
      const next = i + 1
      if (next === strLen || code >= SURROGATE_B) {
        len += 3
      } else {
        const nextCode = str.charCodeAt(next)
        if ((nextCode & 0xFC00) !== SURROGATE_B) {
          len += 3
        } else {
          i = next
          len += 4
        }
      }
    }
  }
  return len
}

export function encode (str, buf, offset) {
  const strLen = str.length
  if (offset === undefined || offset === null) {
    offset = 0
  }
  if (buf === undefined) {
    buf = new Uint8Array(encodingLength(str) + offset)
  }
  let off = offset
  for (let i = 0; i < strLen; i += 1) {
    let code = str.charCodeAt(i)
    if (code <= 0x7F) {
      buf[off++] = code
    } else if (code <= 0x07FF) {
      buf[off++] = 0b11000000 | ((code & 0b11111000000) >> 6)
      buf[off++] = 0b10000000 | (code & 0b00000111111)
    } else if ((code & 0xF800) !== SURROGATE_A) {
      buf[off++] = 0b11100000 | ((code & 0b1111000000000000) >> 12)
      buf[off++] = 0b10000000 | ((code & 0b0000111111000000) >> 6)
      buf[off++] = 0b10000000 | (code & 0b0000000000111111)
    } else {
      const next = i + 1
      if (next === strLen || code >= SURROGATE_B) {
        // Incorrectly started surrogate pair
        buf[off++] = 0xef
        buf[off++] = 0xbf
        buf[off++] = 0xbd
      } else {
        const nextCode = str.charCodeAt(next)
        if ((nextCode & 0xFC00) !== SURROGATE_B) {
          // Incorrect surrogate pair
          buf[off++] = 0xef
          buf[off++] = 0xbf
          buf[off++] = 0xbd
        } else {
          i = next
          code = 0b000010000000000000000 |
            ((code & 0b1111111111) << 10) |
            (nextCode & 0b1111111111)
          buf[off++] = 0b11110000 | ((code & 0b111000000000000000000) >> 18)
          buf[off++] = 0b10000000 | ((code & 0b000111111000000000000) >> 12)
          buf[off++] = 0b10000000 | ((code & 0b000000000111111000000) >> 6)
          buf[off++] = 0b10000000 | (code & 0b000000000000000111111)
        }
      }
    }
  }
  encode.bytes = off - offset
  return buf
}
encode.bytes = 0

export function decode (buf, start, end) {
  let result = ''
  if (start === undefined || start === null) {
    start = 0
  }
  if (end === undefined || end === null) {
    end = buf.length
  }
  for (let offset = start; offset < end;) {
    const code = buf[offset++]
    let num
    if (code <= 128) {
      num = code
    } else if (code > 191 && code < 224) {
      num = ((code & 0b11111) << 6) | (buf[offset++] & 0b111111)
    } else if (code > 239 && code < 365) {
      num = (
        ((code & 0b111) << 18) |
        ((buf[offset++] & 0b111111) << 12) |
        ((buf[offset++] & 0b111111) << 6) |
        (buf[offset++] & 0b111111)
      ) - 0x10000
      const numA = SURROGATE_A | ((num >> 10) & 0b1111111111)
      result += String.fromCharCode(numA)
      num = SURROGATE_B | (num & 0b1111111111)
    } else {
      num = ((code & 0b1111) << 12) |
        ((buf[offset++] & 0b111111) << 6) |
        (buf[offset++] & 0b111111)
    }
    result += String.fromCharCode(num)
  }
  decode.bytes = end - start
  return result
}
decode.bytes = 0
