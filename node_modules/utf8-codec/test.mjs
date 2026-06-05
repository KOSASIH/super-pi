import test from 'fresh-tape'
import { encodingLength, encode, decode } from './index.mjs'
import * as utf8Codec from './index.mjs'
import { Buffer } from 'buffer'

function toHex (uint8) {
  return Buffer.from(uint8).toString('hex')
}

const TEST_STRINGS = [
  '', // empty
  'basic: hi',
  'japanese: 日本語',
  'mixed: 日本語 hi',
  'min 1 byte: \x00',
  'odd 1 byte: \x4c',
  'max 1 byte: \x7f',
  'min 2 byte: \x80',
  'odd 2 byte: \xd941',
  'max 2 byte: \x7fff',
  'min 3 byte: \x8000',
  'odd 3 byte: \xa158',
  'max 3 byte: \xffff',
  `4 byte: ${String.fromCodePoint(100000)}`
]
TEST_STRINGS.forEach((fixture, index) => {
  test(`fixture #${index}`, t => {
    const check = Buffer.from(fixture)
    const len = check.length
    t.equals(encodingLength(fixture), len, `fixture ${fixture} length`)
    const buf = new Uint8Array(len)
    t.equals(toHex(encode(fixture, buf, 0), 0, len), check.toString('hex'), `write: ${fixture}`)
    t.equals(encode.bytes, len, 'write.num')
    t.equals(decode(check), check.toString(), `toUtf8: ${fixture}`)
    t.equals(decode.bytes, check.length, 'write.num')
    t.end()
  })
})

test('surrogate pairs', function (t) {
  [
    [0xd821, 0xdea0],
    [0xd800, 0xdc00],
    [0xd801, 0xdc01],
    [0xddff, 0xdfff],
    [0xd821, 0x0000],
    [0xd821, 0xd821, 0xdea0]
  ].forEach(function (bytes, index) {
    const str = String.fromCharCode(...bytes)
    const check = Buffer.from(str)
    const buf = encode(str)
    t.equal(buf.length, check.length)
    t.equal(toHex(buf, 0, buf.length), check.toString('hex'), `#${index} [${bytes}].toHex() ... ${check.toString('hex')}`)
    t.equal(decode(buf, 0, buf.length), check.toString(), `#${index} [${bytes}].toUtf8`)
  })
  t.end()
})

test('all code points', function (t) {
  const blockSize = 2048
  const blocks = 65536 / blockSize
  let code = 0
  for (let block = 0; block < blocks; block += 1) {
    const expected = {}
    const actual = {}
    for (let i = 0; i < blockSize; i += 1, code += 1) {
      const str = String.fromCharCode(code)
      const buf = new Uint8Array(encodingLength(str))
      encode(str, buf, 0)
      const exp = Buffer.from(str)
      expected[code] = exp.toString('hex')
      actual[code] = toHex(buf, 0, buf.length)
    }
    t.same(actual, expected)
  }
  t.end()
})

test('performance', { skip: typeof TextDecoder === 'undefined' }, function (t) {
  function run (impl) {
    const start = Date.now()
    for (let i = 0; i < 10000; i++) {
      TEST_STRINGS.forEach(function (str) {
        impl.encodingLength(str)
        impl.decode(impl.encode(str))
      })
    }
    return Date.now() - start
  }
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const native = {
    encode (str, buf, offset) {
      return encoder.encode(str)
    },
    decode (str) {
      return decoder.decode(str)
    },
    encodingLength (str) {
      return encoder.encode(str).length
    }
  }
  TEST_STRINGS.forEach(function (str) {
    const bytes = native.encode(str)
    t.same(bytes, utf8Codec.encode(str))
    t.same(native.decode(bytes), utf8Codec.decode(bytes))
    t.same(native.encodingLength(str), utf8Codec.encodingLength(str))
  })
  const perf = {
    native: run(native),
    utf8: run(utf8Codec)
  }
  t.ok(perf.native > perf.utf8, `native(${perf.native}ms) > utf8-codec(${perf.utf8}ms)`)
  t.end()
})
